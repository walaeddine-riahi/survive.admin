"use client";

import { InjectionForm } from "@/components/injection-form";
import { InjectionTypeEnum, InjectionTriggerTypeEnum } from "@/components/injection-form";

// Définition des types locaux
type InjectionFormValues = {
  id?: string;
  title: string;
  content: string;
  triggerType: InjectionTriggerTypeEnum;
  timeOffset?: number | null;
  isRepeating?: boolean;
  repeatInterval?: number | null;
  scenarioId: string;
  simulationId: string;
  isActive: boolean;
  type: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  targetUserId?: string | null;
  targetUserIds?: string[];
  attachments?: string;
  payload?: string;
};

type SimulationOption = {
  id: string;
  name: string;
};
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Plus, MoreHorizontal, Edit, Trash2, Loader2, AlertCircle, RefreshCw, Inbox, Check, CheckSquare, Square, MessageSquare, Bell, Folder, Play, Pause, Radio, PhoneCall, Newspaper } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect, useCallback } from "react";

interface Injection {
  id: string;
  title: string;
  content: string | null;
  triggerType: InjectionTriggerTypeEnum;
  timeOffset: number | null;
  isRepeating: boolean;
  repeatInterval: number | null;
  scenarioId: string;
  simulationId: string;
  acknowledged: boolean;
  isActive: boolean;
  type: InjectionTypeEnum;
  imageUrl: string | null;
  videoUrl: string | null;
  targetUserId?: string | null;
  payload: Record<string, any> | null;
  attachments: Array<Record<string, any>> | null;
  createdAt: string;
  updatedAt: string;
  scenario?: {
    id: string;
    name: string;
    simulationId: string;
  };
  simulation?: {
    id: string;
    title: string;
  };
}

export default function InjectionsPage() {
  const [injections, setInjections] = useState<Injection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [scenarios, setScenarios] = useState<Array<{ id: string; name: string; simulationId: string }>>([]);
  const [simulations, setSimulations] = useState<SimulationOption[]>([]);
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInjection, setSelectedInjection] = useState<Injection | null>(null);
  const [selectedInjectionIds, setSelectedInjectionIds] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Charger les utilisateurs
  useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Erreur lors du chargement des utilisateurs');
      const data = await res.json();
      setUsers(data.map((user: any) => ({
        id: user.id,
        name: user.name || 'Utilisateur sans nom',
        email: user.email
      })));
      return data;
    },
  });

  // Charger les simulations et scénarios
  useQuery({
    queryKey: ['simulations'],
    queryFn: async () => {
      const res = await fetch('/api/simulations');
      if (!res.ok) throw new Error('Erreur lors du chargement des simulations');
      const data = await res.json();
      // Formater les données pour correspondre au type SimulationOption
      const formattedSimulations = data.map((sim: any) => ({
        id: sim.id,
        name: sim.title || sim.name || `Simulation ${sim.id}` // Utiliser title ou name, avec une valeur par défaut
      }));
      setSimulations(formattedSimulations);
      return data;
    },
  });

  useQuery({
    queryKey: ['scenarios'],
    queryFn: async () => {
      const res = await fetch('/api/scenarios');
      if (!res.ok) throw new Error('Erreur lors du chargement des scénarios');
      const data = await res.json();
      setScenarios(data.map((scenario: any) => ({
        id: scenario.id,
        name: scenario.name,
        simulationId: scenario.simulationId
      })));
      return data;
    },
  });

  const fetchInjections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Inclure les relations scenario et simulation
      const response = await fetch("/api/injections?include=scenario,simulation");
      
      console.log('Réponse de l\'API - Statut:', response.status);
      const responseData = await response.clone().json().catch(e => {
        console.error('Erreur lors du parsing de la réponse:', e);
        return null;
      });
      console.log('Réponse de l\'API - Données brutes:', responseData);
      
      if (!response.ok) {
        throw new Error(`Échec du chargement des injections: ${response.status} ${response.statusText}`);
      }
      
      if (!responseData) {
        throw new Error('Aucune donnée reçue de l\'API');
      }
      
      const data = Array.isArray(responseData) ? responseData : [responseData];
      console.log('Données formatées pour l\'affichage:', data);
      
      // S'assurer que les données sont correctement typées
      const formattedData: Injection[] = data.map((injection: any) => ({
        ...injection,
        // Convertir les champs JSON en chaînes pour le formulaire
        payload: injection.payload ? injection.payload : null,
        attachments: injection.attachments ? injection.attachments : null,
        // S'assurer que les champs optionnels ont des valeurs par défaut
        content: injection.content || null,
        timeOffset: injection.timeOffset || null,
        isRepeating: injection.isRepeating || false,
        repeatInterval: injection.repeatInterval || null,
        isActive: injection.isActive !== undefined ? injection.isActive : true,
        imageUrl: injection.imageUrl || null,
        videoUrl: injection.videoUrl || null,
        acknowledged: injection.acknowledged || false,
        // S'assurer que les relations sont correctement typées
        scenario: injection.scenario ? {
          id: injection.scenario.id,
          name: injection.scenario.name,
          simulationId: injection.scenario.simulationId
        } : undefined,
        simulation: injection.simulation ? {
          id: injection.simulation.id,
          title: injection.simulation.title || ''
        } : undefined
      }));
      
      setInjections(formattedData);
    } catch (err) {
      console.error("Erreur lors du chargement des injections:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      toast({
        title: "Erreur",
        description: "Impossible de charger les injections",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInjections();
    
    // Mise à jour automatique toutes les 30 secondes
    const interval = setInterval(() => {
      fetchInjections();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Log des données pour débogage
  useEffect(() => {
    console.log('Injections chargées:', injections);
    console.log('Scénarios chargés:', scenarios);
  }, [injections, scenarios]);

  // Gestion de la création d'une injection
  const handleCreateInjection = async (formData: InjectionFormValues) => {
    try {
      console.log('Données du formulaire reçues:', formData);
      
      // Préparer les données pour l'API
      const apiData = {
        title: formData.title,
        content: formData.content || null,
        triggerType: formData.triggerType,
        timeOffset: formData.timeOffset ? Number(formData.timeOffset) : null,
        isRepeating: Boolean(formData.isRepeating),
        repeatInterval: formData.repeatInterval ? Number(formData.repeatInterval) : null,
        scenarioId: formData.scenarioId,
        simulationId: formData.simulationId,
        isActive: formData.isActive !== undefined ? Boolean(formData.isActive) : true,
        type: formData.type || 'OTHER',
        imageUrl: formData.imageUrl || null,
        videoUrl: formData.videoUrl || null,
        targetUserId: formData.targetUserId || null,
        targetUserIds: formData.targetUserIds || [],
        // Gestion des champs JSON
        payload: formData.payload 
          ? typeof formData.payload === 'string' 
            ? formData.payload.trim() ? JSON.parse(formData.payload) : {}
            : formData.payload
          : {},
        attachments: formData.attachments 
          ? typeof formData.attachments === 'string'
            ? formData.attachments.trim() ? JSON.parse(formData.attachments) : []
            : formData.attachments
          : []
      };

      console.log('Données à envoyer à l\'API:', JSON.stringify(apiData, null, 2));

      const response = await fetch('/api/injections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });


      console.log('Réponse de l\'API:', response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la création de l\'injection';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          console.error('Erreur lors de la lecture de la réponse d\'erreur:', e);
        }
        console.error('Détails de l\'erreur:', {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage
        });
        throw new Error(errorMessage);
      }

      toast({
        title: 'Succès',
        description: 'L\'injection a été créée avec succès',
      });

      setIsFormOpen(false);
      fetchInjections(); // Rafraîchir la liste
    } catch (error) {
      console.error('Erreur lors de la création de l\'injection:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateInjection = async (formData: InjectionFormValues) => {
    if (!selectedInjection) return;
    
    try {
      console.log('Données du formulaire avant envoi:', formData);
      
      // Préparer les données pour l'API
      const apiData = {
        ...formData,
        // Convertir les chaînes JSON en objets si nécessaire
        payload: formData.payload 
          ? typeof formData.payload === 'string' 
            ? formData.payload.trim() ? JSON.parse(formData.payload) : null
            : formData.payload 
          : null,
        attachments: formData.attachments 
          ? typeof formData.attachments === 'string'
            ? formData.attachments.trim() ? JSON.parse(formData.attachments) : null
            : formData.attachments
          : null,
        // S'assurer que les champs numériques sont correctement typés
        timeOffset: formData.timeOffset ? Number(formData.timeOffset) : null,
        repeatInterval: formData.repeatInterval ? Number(formData.repeatInterval) : null,
        // S'assurer que les booléens sont correctement typés
        isRepeating: Boolean(formData.isRepeating),
        isActive: formData.isActive !== undefined ? Boolean(formData.isActive) : true,
        // Inclure explicitement le targetUserId
        targetUserId: formData.targetUserId || null,
        // Supprimer les champs inutiles pour l'API
        simulationId: undefined
      };
      
      console.log('Données préparées pour la mise à jour:', apiData);
      
      const response = await fetch(`/api/injections/${selectedInjection.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const detailedError = errorData.error || errorData.message || errorData.details || 'Erreur lors de la mise à jour de l\'injection';
        throw new Error(detailedError);
      }

      toast({
        title: 'Succès',
        description: 'L\'injection a été mise à jour avec succès',
      });

      setIsFormOpen(false);
      setSelectedInjection(null);
      fetchInjections(); // Rafraîchir la liste
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'injection:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };

  const handleToggleStatus = async (injection: Injection) => {
    try {
      setUpdatingStatus(prev => new Set(prev).add(injection.id));
      const newStatus = !injection.isActive;
      
      // Mise à jour optimiste de l'interface utilisateur
      setInjections(prev => 
        prev.map(i => 
          i.id === injection.id ? { ...i, isActive: newStatus } : i
        )
      );

      const response = await fetch(`/api/injections/${injection.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (!response.ok) {
        // En cas d'erreur, on annule la mise à jour optimiste
        setInjections(prev => 
          prev.map(i => 
            i.id === injection.id ? { ...i, isActive: !newStatus } : i
          )
        );
        throw new Error('Échec de la mise à jour du statut');
      }

      toast({
        title: 'Statut mis à jour',
        description: `L'injection est maintenant ${newStatus ? 'active' : 'inactive'}`,
      });
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setUpdatingStatus(prev => {
        const newSet = new Set(prev);
        newSet.delete(injection.id);
        return newSet;
      });
    }
  };

  // Gestion de la sélection/désélection d'une injection
  const toggleInjectionSelection = (id: string) => {
    setSelectedInjectionIds(prev => 
      prev.includes(id) 
        ? prev.filter(injectionId => injectionId !== id)
        : [...prev, id]
    );
  };

  // Sélectionner/désélectionner toutes les injections
  const toggleSelectAllInjections = () => {
    if (selectedInjectionIds.length === injections.length) {
      setSelectedInjectionIds([]);
    } else {
      setSelectedInjectionIds(injections.map(injection => injection.id));
    }
  };

  // Suppression d'une seule injection
  const handleDeleteInjection = async (id: string) => {
    try {
      const response = await fetch(`/api/injections/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Échec de la suppression de l'injection");
      }

      toast({
        title: "Succès",
        description: "L'injection a été supprimée avec succès.",
      });

      fetchInjections();
      setSelectedInjectionIds(prev => prev.filter(injectionId => injectionId !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression de l'injection:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de l'injection.",
        variant: "destructive",
      });
    }
  };

  // Suppression multiple des injections sélectionnées
  const handleDeleteMultipleInjections = async () => {
    try {
      const deletePromises = selectedInjectionIds.map(id => 
        fetch(`/api/injections/${id}`, { method: 'DELETE' })
      );

      const results = await Promise.allSettled(deletePromises);
      
      const hasError = results.some(result => 
        result.status === 'rejected' || !result.value.ok
      );

      if (hasError) {
        throw new Error("Certaines suppressions ont échoué");
      }

      toast({
        title: "Succès",
        description: `Les ${selectedInjectionIds.length} injections ont été supprimées avec succès.`,
      });

      fetchInjections();
      setSelectedInjectionIds([]);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors de la suppression des injections:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression des injections.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Injections</h1>
        <div className="flex gap-2">
          {selectedInjectionIds.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={selectedInjectionIds.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer ({selectedInjectionIds.length})
            </Button>
          )}
          <Button 
            onClick={() => {
              setSelectedInjection(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Injection
          </Button>
        </div>
      </div>

      <div className="mt-6 border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Chargement des injections...</span>
            </div>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-destructive">
            <div className="flex items-center justify-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>Erreur lors du chargement des injections: {error}</span>
            </div>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => fetchInjections()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
        ) : (
          <div className="relative w-full overflow-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectedInjectionIds.length > 0 && selectedInjectionIds.length === injections.length}
                      onCheckedChange={toggleSelectAllInjections}
                      aria-label="Sélectionner toutes les injections"
                    />
                  </TableHead>
                  <TableHead className="min-w-[200px]">Titre</TableHead>
                  <TableHead className="w-[120px]">Type</TableHead>
                  <TableHead className="w-[180px]">Déclenchement</TableHead>
                  <TableHead className="w-[150px]">Scénario</TableHead>
                  <TableHead className="w-[120px]">Statut</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {injections.length > 0 ? (
                  injections.map((injection) => (
                    <TableRow key={injection.id} className="group hover:bg-muted/50">
                      <TableCell>
                        <Checkbox 
                          checked={selectedInjectionIds.includes(injection.id)}
                          onCheckedChange={() => toggleInjectionSelection(injection.id)}
                          aria-label={`Sélectionner l'injection ${injection.title}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {injection.type === 'EMAIL' && <Inbox className="h-4 w-4 text-muted-foreground" />}
                          {injection.type === 'SMS' && <MessageSquare className="h-4 w-4 text-blue-500" />}
                          {injection.type === 'ALERT' && <Bell className="h-4 w-4 text-amber-500" />}
                          {injection.type === 'NEWS_BROADCAST' && <Newspaper className="h-4 w-4 text-purple-500" />}
                          {injection.type === InjectionTypeEnum.CALL && <PhoneCall className="h-4 w-4 text-green-500" />}
                          <span>{injection.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 capitalize">
                          {injection.type.toLowerCase()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {injection.timeOffset ? `+${injection.timeOffset} min` : 'Immédiat'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {injection.isRepeating && injection.repeatInterval 
                              ? `Tous les ${injection.repeatInterval} min`
                              : 'Non répétitif'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {injection.scenario?.name ? (
                          <div className="flex items-center gap-2">
                            <Folder className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate max-w-[120px]" title={injection.scenario.name}>
                              {injection.scenario.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">Aucun scénario</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className={`h-2.5 w-2.5 rounded-full mr-2 ${injection.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span className="text-sm">
                            {injection.isActive ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleToggleStatus(injection)}
                            disabled={updatingStatus.has(injection.id)}
                            title={injection.isActive ? 'Désactiver' : 'Activer'}
                          >
                            {updatingStatus.has(injection.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : injection.isActive ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Ouvrir le menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedInjection(injection);
                                  setIsFormOpen(true);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  if (confirm('Êtes-vous sûr de vouloir supprimer cette injection ?')) {
                                    handleDeleteInjection(injection.id);
                                  }
                                }}
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
                            setSelectedInjection(null);
                            setIsFormOpen(true);
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
        )}
      </div>

      <InjectionForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setSelectedInjection(null);
        }}
        onSubmit={
          selectedInjection ? handleUpdateInjection : handleCreateInjection
        }
        scenarios={scenarios}
        simulations={simulations}
        users={users}
        onSimulationChange={(simulationId) => {
          // Mettre à jour le formulaire avec la nouvelle simulation sélectionnée
          if (selectedInjection) {
            const updatedInjection = {
              ...selectedInjection,
              scenarioId: "", // Réinitialiser le scénario lors du changement de simulation
              scenario: {
                id: selectedInjection.scenario?.id || "",
                name: selectedInjection.scenario?.name || "",
                simulationId
              }
            };
            setSelectedInjection(updatedInjection as Injection);
          }
        }}
        loading={loading}
        initialData={selectedInjection ? {
          id: selectedInjection.id,
          title: selectedInjection.title,
          content: selectedInjection.content || "",
          triggerType: selectedInjection.triggerType,
          timeOffset: selectedInjection.timeOffset || null,
          isRepeating: selectedInjection.isRepeating || false,
          repeatInterval: selectedInjection.repeatInterval || null,
          scenarioId: selectedInjection.scenarioId,
          simulationId: selectedInjection.simulationId,
          isActive: selectedInjection.isActive,
          type: selectedInjection.type,
          imageUrl: selectedInjection.imageUrl || null,
          videoUrl: selectedInjection.videoUrl || null,
          targetUserId: selectedInjection.targetUserId || null,
          attachments: selectedInjection.attachments ? JSON.stringify(selectedInjection.attachments) : "[]",
          payload: selectedInjection.payload 
            ? (typeof selectedInjection.payload === 'string' 
                ? selectedInjection.payload 
                : JSON.stringify(selectedInjection.payload, null, 2))
            : "{}"
        } : undefined}
      />

      {/* Dialogue de confirmation de suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer {selectedInjectionIds.length} injection(s) sélectionnée(s) ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteMultipleInjections}
              disabled={selectedInjectionIds.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer ({selectedInjectionIds.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}