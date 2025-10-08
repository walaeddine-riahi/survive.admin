"use client";

import * as React from 'react';
import InjectionComposeForm, {
  InjectionFormData as ImportedInjectionFormData,
  InjectionType,
} from "@/components/admin-mode/InjectionComposeForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { 
  ChevronLeft, 
  FileText, 
  Loader2, 
  CheckSquare, 
  Square, 
  Trash2, 
  Plus,
  Check,
  X,
  MoreHorizontal,
  Edit,
  Inbox,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

type InjectionFormData = {
  title: string;
  content: string;
  scenarioName: string;
  type: InjectionType;
  imageUrl?: string;
  videoUrl?: string;
  isActive?: boolean;
  attachments?: { type: string; url: string; name: string }[];
}

interface Injection {
  id: string;
  title: string;
  content: string;
  scenarioName: string;
  scenarioId: string;
  simulationId: string;
  createdAt: string;
  updatedAt: string;
  acknowledged: boolean;
  isActive: boolean;
  type: InjectionType;
  imageUrl?: string | null;
  videoUrl?: string | null;
  payload?: Record<string, any> | null;
  attachments?: Array<Record<string, any>> | null;
}

interface Simulation {
  id: string;
  title: string;
}

interface Communication {
  id: string;
  type: string; // Add type field for communication (email, sms, social, etc.)
  content: string;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  recipient?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null; // Recipient can be optional
  payload?: Record<string, unknown> | null; // Optional payload for specific communication data
}

export default function AdminInjectionsPage({
  params: paramsPromise,
}: {
  params: Promise<{ simulationId: string }>;
}) {
  const params = React.use(paramsPromise);
  const { simulationId } = params;
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [injections, setInjections] = useState<Injection[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [editingInjection, setEditingInjection] = useState<Injection | null>(null);
  const [selectedInjectionIds, setSelectedInjectionIds] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<Set<string>>(new Set());

  const handleToggleStatus = async (injectionId: string, currentStatus: boolean) => {
    try {
      // Mise à jour optimiste de l'interface
      setUpdatingStatus(prev => new Set(prev).add(injectionId));
      
      const newStatus = !currentStatus;
      
      // Mise à jour locale immédiate pour un retour visuel instantané
      setInjections(prev => 
        prev.map(inj => 
          inj.id === injectionId ? { ...inj, isActive: newStatus } : inj
        )
      );

      // Appel API pour mettre à jour le statut
      const response = await fetch(`/api/injections/${injectionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Échec de la mise à jour du statut');
      }

      // Récupérer les données mises à jour du serveur
      const updatedInjection = await response.json();
      
      // Mise à jour de la liste avec les données fraîches du serveur
      setInjections(prev => 
        prev.map(inj => 
          inj.id === injectionId ? { ...inj, ...updatedInjection } : inj
        )
      );

      toast({
        title: "Statut mis à jour",
        description: `L'injection est maintenant ${newStatus ? 'active' : 'inactive'}`,
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      
      // Annuler la mise à jour optimiste en cas d'erreur
      setInjections(prev => 
        prev.map(inj => 
          inj.id === injectionId ? { ...inj, isActive: currentStatus } : inj
        )
      );
      
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la mise à jour du statut",
        variant: "destructive",
      });
    } finally {
      // Retirer l'ID du set de mise à jour
      setUpdatingStatus(prev => {
        const newSet = new Set(prev);
        newSet.delete(injectionId);
        return newSet;
      });
    }
  };
  const { toast } = useToast();

  const fetchSimulationAndInjections = async () => {
    setLoading(true);
    try {
      const simulationRes = await fetch(`/api/simulations/${simulationId}`);
      const simulationData = await simulationRes.json();
      setSimulation(simulationData);

      const communicationsRes = await fetch(
        `/api/simulations/${simulationId}/communications`
      );
      const communicationsData = await communicationsRes.json();
      setCommunications(communicationsData);

      const injectionsRes = await fetch(
        `/api/simulations/${simulationId}/injections`
      );
      const injectionsData = await injectionsRes.json();
      setInjections(injectionsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({
        title: "Erreur",
        description: "Échec du chargement des données.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // S'assurer que simulationId est disponible avant d'appeler fetchSimulationAndInjections
    if (simulationId) {
      fetchSimulationAndInjections();
    }
  }, [simulationId, toast]);

  // Fonctions pour la sélection multiple
  const toggleInjectionSelection = (injectionId: string) => {
    const newSelection = new Set(selectedInjectionIds);
    if (newSelection.has(injectionId)) {
      newSelection.delete(injectionId);
    } else {
      newSelection.add(injectionId);
    }
    setSelectedInjectionIds(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedInjectionIds.size === injections.length) {
      setSelectedInjectionIds(new Set());
    } else {
      setSelectedInjectionIds(new Set(injections.map(i => i.id)));
    }
  };

  // Suppression multiple
  const handleDeleteSelected = async () => {
    if (selectedInjectionIds.size === 0) return;
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer les ${selectedInjectionIds.size} injections sélectionnées ?`)) {
      return;
    }
    
    await deleteInjections(Array.from(selectedInjectionIds));
  };

  const deleteInjections = async (ids: string[]) => {
    try {
      const results = await Promise.allSettled(
        ids.map(id => 
          fetch(`/api/simulations/${simulationId}/injections/${id}`, { 
            method: 'DELETE' 
          })
        )
      );

      const errors = results.filter(
        (result): result is PromiseRejectedResult => result.status === 'rejected'
      );

      if (errors.length > 0) {
        throw new Error(`${errors.length} suppressions ont échoué`);
      }

      toast({
        title: "Suppression effectuée",
        description: `${ids.length} injection(s) ont été supprimée(s) avec succès.`,
      });

      // Réinitialiser la sélection et rafraîchir la liste
      setSelectedInjectionIds(new Set());
      setIsSelecting(false);
      fetchSimulationAndInjections();
    } catch (error) {
      console.error("Error deleting injections:", error);
      toast({
        title: "Erreur",
        description: `Une erreur est survenue lors de la suppression : ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        variant: "destructive",
      });
    }
  };

  const handleInjectionSubmit = async (formData: ImportedInjectionFormData) => {
    try {
      // Validation des champs obligatoires
      if (!formData.title?.trim()) {
        throw new Error("Le titre est obligatoire");
      }
      if (!formData.content?.trim()) {
        throw new Error("Le contenu est obligatoire");
      }
      if (!formData.type) {
        throw new Error("Le type d'injection est obligatoire");
      }

      const isUpdate = !!editingInjection;
      const url = isUpdate 
        ? `/api/simulations/${simulationId}/injections/${editingInjection.id}`
        : `/api/simulations/${simulationId}/injections`;

      // Préparer les données selon le format attendu par l'API
      const apiPayload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        type: formData.type,
        triggerType: 'MANUAL',
        isActive: formData.isActive ?? true,
        scenarioName: formData.scenarioName || 'default',
        simulationId: simulationId,
        timeOffset: 0,
        isRepeating: false,
        repeatInterval: 0,
        // Champs optionnels
        ...(formData.imageUrl && { imageUrl: formData.imageUrl }),
        ...(formData.videoUrl && { videoUrl: formData.videoUrl }),
        ...(formData.attachments?.length && { attachments: formData.attachments })
      };

      console.log('Envoi des données:', { 
        url, 
        method: isUpdate ? 'PUT' : 'POST', 
        payload: { 
          ...apiPayload, 
          // Masquer les données sensibles dans les logs
          attachments: apiPayload.attachments ? `[${apiPayload.attachments.length} pièces jointes]` : 'aucune',
          content: apiPayload.content.substring(0, 50) + (apiPayload.content.length > 50 ? '...' : '')
        } 
      });

      const response = await fetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        console.error('Erreur lors de l\'analyse de la réponse JSON:', e);
        throw new Error('Réserve du serveur invalide');
      }

      console.log('Réponse du serveur:', { 
        status: response.status, 
        data: responseData 
      });

      if (!response.ok) {
        const errorMessage = responseData?.message || 
          responseData?.error?.message || 
          response.statusText ||
          `Échec de la ${isUpdate ? 'mise à jour' : 'création'} de l'injection`;
        
        throw new Error(errorMessage);
      }

      toast({
        title: "Succès",
        description: `Injection ${isUpdate ? "mise à jour" : "ajoutée"} avec succès.`,
      });
      
      setIsComposing(false);
      setEditingInjection(null);
      // Recharger les données après une création/mise à jour réussie
      fetchSimulationAndInjections();
      setEditingInjection(null);
      fetchSimulationAndInjections();
    } catch (error) {
      console.error(
        `Failed to ${editingInjection ? "update" : "create"} injection:`,
        error
      );
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : `Échec de ${
                editingInjection ? "la mise à jour" : "l'ajout"
              } de l'injection.`,
        variant: "destructive",
      });
    }
  };

  const handleEditInjection = (injection: Injection) => {
    setEditingInjection({
      ...injection,
      imageUrl: injection.imageUrl || undefined,
      videoUrl: injection.videoUrl || undefined,
      attachments: injection.attachments?.map(att => ({
        type: att.type || 'file',
        url: att.url,
        name: att.name || 'Fichier joint'
      })) || []
    });
    setIsComposing(true);
  };

  const handleDeleteInjection = async (injectionId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette injection ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/injections/${injectionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Échec de la suppression de l\'injection');
      }

      // Mise à jour optimiste de l'interface
      setInjections(prev => prev.filter(inj => inj.id !== injectionId));
      
      // Désélectionner l'élément supprimé s'il était sélectionné
      setSelectedInjectionIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(injectionId);
        return newSet;
      });

      toast({
        title: "Succès",
        description: "L'injection a été supprimée avec succès.",
      });

      // Fermer le formulaire d'édition si c'était l'injection en cours d'édition
      if (editingInjection?.id === injectionId) {
        setIsComposing(false);
        setEditingInjection(null);
      }
      
      // Rafraîchir la liste complète pour être sûr
      await fetchSimulationAndInjections();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'injection:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la suppression.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        Erreur: {error}
        <Button onClick={fetchSimulationAndInjections}>Réessayer</Button>
      </div>
    );
  }

  if (!simulation) {
    return (
      <div className="p-6">
        Simulation introuvable.
        <Link href="/simulation">
          <Button>Retour aux simulations</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/simulation/${simulationId}`}>
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">
            Gestion des Injections - {simulation?.title || "Chargement..."}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {isSelecting ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedInjectionIds(new Set());
                  setIsSelecting(false);
                }}
              >
                Annuler
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteSelected}
                disabled={selectedInjectionIds.size === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer ({selectedInjectionIds.size})
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={() => setIsSelecting(true)}
              >
                <CheckSquare className="mr-2 h-4 w-4" />
                Sélection multiple
              </Button>
              <Button onClick={() => {
                setEditingInjection(null);
                setIsComposing(true);
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle injection
              </Button>
            </>
          )}
        </div>
      </div>

      {isComposing && (
        <Button variant="outline" onClick={() => setIsComposing(false)}>
          Annuler
        </Button>
      )}

      {isComposing ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingInjection ? "Modifier l'injection" : "Nouvelle injection"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InjectionComposeForm
              simulationId={simulationId}
              initialData={editingInjection ? {
                title: editingInjection.title,
                content: editingInjection.content,
                scenarioName: editingInjection.scenarioName,
                type: editingInjection.type,
                imageUrl: editingInjection.imageUrl || '',
                videoUrl: editingInjection.videoUrl || '',
                isActive: editingInjection.isActive,
                attachments: editingInjection.attachments?.map(att => ({
                  type: att.type || 'file',
                  url: att.url,
                  name: att.name || 'Fichier joint'
                })) || []
              } : undefined}
              onSubmit={handleInjectionSubmit}
              onCancel={() => {
                setIsComposing(false);
                setEditingInjection(null);
              }}
            />
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Chargement des injections...</span>
        </div>
      ) : error ? (
        <div className="p-4 text-center text-destructive">
          <div className="flex items-center justify-center">
            <X className="h-5 w-5 mr-2" />
            <span>Erreur lors du chargement des injections: {error}</span>
          </div>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={fetchSimulationAndInjections}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-12">
                    {isSelecting && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 p-0"
                        onClick={toggleSelectAll}
                      >
                        {selectedInjectionIds.size === injections.length ? (
                          <CheckSquare className="h-4 w-4" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                        <span className="sr-only">Tout sélectionner</span>
                      </Button>
                    )}
                  </TableHead>
                  <TableHead className="min-w-[200px]">Titre</TableHead>
                  <TableHead className="min-w-[100px]">Type</TableHead>
                  <TableHead>Contenu</TableHead>
                  <TableHead className="w-[120px]">Statut</TableHead>
                  <TableHead className="w-[150px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {injections.length > 0 ? (
                  injections.map((injection) => (
                    <TableRow key={injection.id} className="hover:bg-muted/50">
                      <TableCell>
                        {isSelecting && (
                          <div 
                            className="flex items-center justify-center h-10 cursor-pointer"
                            onClick={() => toggleInjectionSelection(injection.id)}
                          >
                            {selectedInjectionIds.has(injection.id) ? (
                              <CheckSquare className="h-5 w-5 text-primary" />
                            ) : (
                              <Square className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium py-3">
                        <div className="font-semibold">{injection.title}</div>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge variant="outline">
                          {injection.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="line-clamp-2" title={injection.content || undefined}>
                          {injection.content || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            injection.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {injection.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex justify-end items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => handleToggleStatus(injection.id, injection.isActive ?? false)}
                            disabled={updatingStatus.has(injection.id)}
                          >
                            {updatingStatus.has(injection.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <span className={`h-2 w-2 rounded-full mr-2 ${injection.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                            )}
                            {updatingStatus.has(injection.id) 
                              ? 'Mise à jour...' 
                              : injection.isActive 
                                ? 'Désactiver' 
                                : 'Activer'}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Ouvrir le menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditInjection(injection)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDeleteInjection(injection.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center p-4">
                        <Inbox className="h-8 w-8 mb-2 text-muted-foreground" />
                        <p>Aucune injection trouvée</p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => {
                            setEditingInjection(null);
                            setIsComposing(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Créer une injection
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
      
      {/* Section des communications */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Communications des participants</h2>
        <Card>
          <CardHeader>
            <CardTitle>
              Communications ({communications.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {communications.length === 0 ? (
              <div className="text-muted-foreground text-center py-4">
                Aucune communication reçue pour cette simulation.
              </div>
            ) : (
              // Group communications by sender and then display
              Object.entries(
                communications.reduce((acc, comm) => {
                  const senderName = `${comm.sender.firstName} ${comm.sender.lastName} (${comm.sender.email})`;
                  if (!acc[senderName]) {
                    acc[senderName] = [];
                  }
                  acc[senderName].push(comm);
                  return acc;
                }, {} as Record<string, Communication[]>)
              ).map(([sender, comms]) => (
                <div key={sender} className="border p-4 rounded-lg space-y-2">
                  <h3 className="font-semibold text-lg">De: {sender}</h3>
                  {comms
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    )
                    .map((comm) => (
                      <div key={comm.id} className="border-t pt-2 mt-2">
                        <p className="text-sm text-muted-foreground">
                          Type:{" "}
                          {comm.type.charAt(0).toUpperCase() + comm.type.slice(1)}
                          {comm.recipient &&
                            ` - À: ${comm.recipient.firstName} ${comm.recipient.lastName} (${comm.recipient.email})`
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Date: {new Date(comm.createdAt).toLocaleString()}
                        </p>
                        <p className="mt-2">{comm.content}</p>
                        {comm.type === "report" &&
                          comm.payload &&
                          (comm.payload as { title?: string }).title && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Titre du rapport:{" "}
                              {(comm.payload as { title: string }).title}
                            </p>
                          )}
                        {comm.type === "memo" &&
                          comm.payload &&
                          (comm.payload as { subject?: string }).subject && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Sujet du mémo:{" "}
                              {(comm.payload as { subject: string }).subject}
                            </p>
                          )}
                        {comm.type === "newsBroadcast" &&
                          comm.payload &&
                          (comm.payload as { title?: string }).title && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Titre du bulletin d&apos;informations:{" "}
                              {(comm.payload as { title: string }).title}
                            </p>
                          )}
                        {comm.type === "alert" &&
                          comm.payload &&
                          (comm.payload as { subject?: string }).subject && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Sujet de l&apos;alerte:{" "}
                              {(comm.payload as { subject: string }).subject}
                            </p>
                          )}
                        {comm.payload &&
                          Object.keys(comm.payload).length > 0 &&
                          comm.type !== "report" &&
                          comm.type !== "memo" &&
                          comm.type !== "newsBroadcast" &&
                          comm.type !== "alert" && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Payload: {JSON.stringify(comm.payload)}
                            </p>
                          )}
                      </div>
                    ))}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
