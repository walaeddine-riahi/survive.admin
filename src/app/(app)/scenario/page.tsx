"use client";

import { InjectionForm } from "@/components/injection-form";
import { ScenarioForm } from "@/components/scenario-form";

// Import des types depuis le composant injection-form
import type { 
  InjectionTriggerTypeEnum, 
  InjectionTypeEnum 
} from "@/components/injection-form";

// Définition des interfaces pour cette page
interface InjectionFormData {
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
  type: InjectionTypeEnum;
  imageUrl?: string | null;
  videoUrl?: string | null;
  attachments?: string;
  payload?: string;
}
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Edit, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Scenario {
  id: string;
  name: string;
  description: string | null;
  simulationId: string;
  simulation: {
    title: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ScenarioFormData {
  name: string;
  description?: string;
  simulationId: string;
}

interface Simulation {
  id: string;
  title: string;
}

// InjectionTriggerTypeEnum est importé depuis le composant injection-form

// Suppression de l'interface en double et de la référence à InjectionFromForm

// Interface pour les injections dans cette page
interface Injection extends Omit<InjectionFormData, 'id' | 'attachments' | 'payload' | 'imageUrl' | 'videoUrl'> {
  id: string;
  imageUrl: string | null;
  videoUrl: string | null;
  attachments: string | null;
  payload: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ScenarioPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(
    null
  );
  // Définition du type pour les injections dans le formulaire de scénario
  type ScenarioInjection = {
    id: string;
    name: string;
  };

  const [scenarioInjections, setScenarioInjections] = useState<ScenarioInjection[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isInjectionFormOpen, setIsInjectionFormOpen] = useState(false);
  const [selectedInjection, setSelectedInjection] = useState<Injection | null>(
    null
  ); // State for selected injection for edit
  const [currentScenarioIdForInjection, setCurrentScenarioIdForInjection] =
    useState<string | null>(null);
  const { toast } = useToast();

  const fetchScenarios = async () => {
    try {
      const response = await fetch("/api/scenarios");
      if (!response.ok) {
        throw new Error("Failed to fetch scenarios");
      }
      const data = await response.json();
      setScenarios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchSimulations = async () => {
    try {
      const response = await fetch("/api/simulations");
      if (!response.ok) {
        throw new Error("Failed to fetch simulations");
      }
      const data = await response.json();
      setSimulations(data);
    } catch (err) {
      console.error("Error fetching simulations:", err);
    }
  };

  const fetchScenarioInjections = async (scenarioId: string) => {
    try {
      const response = await fetch(`/api/scenarios/${scenarioId}/injections`);
      if (!response.ok) throw new Error('Failed to fetch injections');
      const data = await response.json();
      // Mapper les données pour correspondre à l'interface ScenarioInjection
      const mappedData = data.map((injection: Injection) => ({
        id: injection.id,
        name: injection.title // Utiliser le titre comme nom pour l'affichage
      }));
      setScenarioInjections(mappedData);
    } catch (error) {
      console.error('Error fetching scenario injections:', error);
      setScenarioInjections([]);
    }
  };

  useEffect(() => {
    fetchScenarios();
    fetchSimulations();
  }, []);

  const handleCreateScenario = async (data: ScenarioFormData) => {
    try {
      const response = await fetch("/api/scenarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create scenario");
      }

      await fetchScenarios();
      setIsFormOpen(false);
      toast({
        title: "Scénario créé",
        description: "Le scénario a été créé avec succès.",
      });
    } catch (error) {
      console.error("Error creating scenario:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du scénario.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateScenario = async (data: ScenarioFormData) => {
    if (!selectedScenario) return;

    try {
      const response = await fetch(`/api/scenarios/${selectedScenario.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update scenario");
      }

      await fetchScenarios();
      setIsFormOpen(false);
      setSelectedScenario(null);
      setScenarioInjections([]); // Clear injections when form closes
      toast({
        title: "Scénario modifié",
        description: "Le scénario a été modifié avec succès.",
      });
    } catch (error) {
      console.error("Error updating scenario:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la modification du scénario.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteScenario = async (scenarioId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce scénario ?")) return;

    try {
      const response = await fetch(`/api/scenarios/${scenarioId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete scenario");
      }

      await fetchScenarios();
      toast({
        title: "Scénario supprimé",
        description: "Le scénario a été supprimé avec succès.",
      });
    } catch (error) {
      console.error("Error deleting scenario:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la suppression du scénario.",
        variant: "destructive",
      });
    }
  };

  const handleOpenScenarioForm = (scenario?: Scenario) => {
    setSelectedScenario(scenario || null);
    if (scenario) {
      fetchScenarioInjections(scenario.id);
    } else {
      setScenarioInjections([]);
    }
    setIsFormOpen(true);
  };

  const handleOpenInjectionForm = (
    scenarioId: string,
    injection?: Injection | ScenarioInjection
  ) => {
    if (injection) {
      // Si l'injection provient de scenarioInjections (qui est de type ScenarioInjection),
      // on doit d'abord récupérer les détails complets
      if ('name' in injection) {
        // C'est un ScenarioInjection, on doit récupérer les détails
        fetch(`/api/injections/${injection.id}`)
          .then(res => res.json())
          .then(data => {
            setSelectedInjection(data);
            setCurrentScenarioIdForInjection(scenarioId);
            setIsInjectionFormOpen(true);
          })
          .catch(error => {
            console.error('Error fetching injection details:', error);
            toast({
              title: 'Erreur',
              description: 'Impossible de charger les détails de l\'injection',
              variant: 'destructive',
            });
          });
        return;
      } else {
        // C'est déjà une Injection complète
        setSelectedInjection(injection);
      }
    } else {
      setSelectedInjection(null);
    }
    setCurrentScenarioIdForInjection(scenarioId);
    setIsInjectionFormOpen(true);
  };

  const transformInjectionToFormData = (injection: Injection): InjectionFormData => {
    return {
      id: injection.id,
      title: injection.title,
      content: injection.content,
      triggerType: injection.triggerType,
      timeOffset: injection.timeOffset,
      isRepeating: injection.isRepeating,
      repeatInterval: injection.repeatInterval,
      scenarioId: injection.scenarioId,
      simulationId: injection.simulationId,
      isActive: injection.isActive,
      type: injection.type,
      imageUrl: injection.imageUrl || undefined,
      videoUrl: injection.videoUrl || undefined,
      attachments: injection.attachments || undefined,
      payload: injection.payload || undefined,
    };
  };

  const handleCreateInjection = async (data: InjectionFormData) => {
    try {
      const response = await fetch("/api/injections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          // Assurez-vous que les champs optionnels sont correctement gérés
          imageUrl: data.imageUrl || null,
          videoUrl: data.videoUrl || null,
          attachments: data.attachments || null,
          payload: data.payload || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create injection");
      }

      toast({
        title: "Succès",
        description: "Injection créée avec succès",
      });

      // Recharger les injections du scénario
      if (selectedScenario) {
        fetchScenarioInjections(selectedScenario.id);
      }

      setIsInjectionFormOpen(false);
      setSelectedInjection(null);
    } catch (error) {
      console.error("Error creating injection:", error);
      toast({
        title: "Erreur",
        description: "Échec de la création de l'injection",
        variant: "destructive",
      });
    }
  };

  const handleUpdateInjection = async (data: InjectionFormData) => {
    if (!selectedInjection) return;

    try {
      const response = await fetch(`/api/injections/${selectedInjection.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          // Assurez-vous que les champs optionnels sont correctement gérés
          imageUrl: data.imageUrl || null,
          videoUrl: data.videoUrl || null,
          attachments: data.attachments || null,
          payload: data.payload || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update injection");
      }

      toast({
        title: "Succès",
        description: "Injection mise à jour avec succès",
      });

      // Recharger les injections du scénario
      if (selectedScenario) {
        fetchScenarioInjections(selectedScenario.id);
      }

      setIsInjectionFormOpen(false);
      setSelectedInjection(null);
    } catch (error) {
      console.error("Error updating injection:", error);
      toast({
        title: "Erreur",
        description: "Échec de la mise à jour de l'injection",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInjection = async (
    injectionId: string,
    scenarioId: string
  ) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette injection ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/injections/${injectionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete injection");
      }

      // Refresh the injections list for the current scenario
      fetchScenarioInjections(scenarioId);

      toast({
        title: "Injection supprimée",
        description: "L'injection a été supprimée avec succès.",
      });
    } catch (error) {
      console.error("Error deleting injection:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la suppression de l'injection.",
        variant: "destructive",
      });
    }
  };

  const handleSaveInjection = async (data: InjectionFormData) => {
    try {
      if (selectedInjection) {
        await handleUpdateInjection(data);
      } else {
        await handleCreateInjection(data);
      }
    } catch (error) {
      console.error("Error saving injection:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement de l'injection",
        variant: "destructive",
      });
    }
  };

  const filteredScenarios = scenarios.filter((scenario) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      scenario.name.toLowerCase().includes(searchLower) ||
      scenario.description?.toLowerCase().includes(searchLower) ||
      scenario.simulation.title.toLowerCase().includes(searchLower) ||
      scenario.id.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div>Erreur: {error}</div>;
  }

  return (
    <div className="flex-1 pl-0 pr-4 py-4 bg-background">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Scénarios</h1>
          <Button onClick={() => handleOpenScenarioForm()}>
            <Plus className="mr-2 h-4 w-4" /> Nouveau scénario
          </Button>
        </div>

        <div className="flex justify-end">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher..."
              className="pl-8 w-[200px] md:w-[250px] bg-background border-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card className="bg-card border shadow-sm">
          <CardHeader className="px-6 py-4">
            <div className="flex justify-between">
              <div>
                <CardTitle>Liste des scénarios</CardTitle>
                <CardDescription>
                  {filteredScenarios.length} scénario
                  {filteredScenarios.length !== 1 ? "s" : ""} trouvé
                  {filteredScenarios.length !== 1 ? "s" : ""}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Simulation</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredScenarios.map((scenario) => (
                  <TableRow key={scenario.id}>
                    <TableCell className="font-mono text-xs">
                      {scenario.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {scenario.name}
                    </TableCell>
                    <TableCell>{scenario.description || "-"}</TableCell>
                    <TableCell>{scenario.simulation.title}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="flex items-center gap-2"
                            onClick={() => {
                              handleOpenScenarioForm(scenario);
                            }}
                          >
                            <Edit className="h-4 w-4" /> Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center gap-2 text-red-600"
                            onClick={() => handleDeleteScenario(scenario.id)}
                          >
                            <Trash2 className="h-4 w-4" /> Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <ScenarioForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setSelectedScenario(null);
            setScenarioInjections([]);
          }
        }}
        onSubmit={
          selectedScenario ? handleUpdateScenario : handleCreateScenario
        }
        simulations={simulations}
        initialData={
          selectedScenario
            ? {
                id: selectedScenario.id,
                name: selectedScenario.name,
                description: selectedScenario.description || "",
                simulationId: selectedScenario.simulationId,
              }
            : undefined
        }
        scenarioInjections={scenarioInjections}
        onAddInjectionClick={() =>
          selectedScenario && handleOpenInjectionForm(selectedScenario.id)
        }
        onEditInjectionClick={(injectionId, scenarioId) => {
          const injectionToEdit = scenarioInjections.find(
            (inj) => inj.id === injectionId
          );
          if (injectionToEdit) {
            handleOpenInjectionForm(scenarioId, injectionToEdit);
          }
        }}
        onDeleteInjectionClick={handleDeleteInjection}
      />

      <InjectionForm
        open={isInjectionFormOpen}
        onOpenChange={(open) => {
          setIsInjectionFormOpen(open);
          if (!open) {
            setCurrentScenarioIdForInjection(null);
            setSelectedInjection(null);
          }
        }}
        onSubmit={handleSaveInjection}
        scenarioId={currentScenarioIdForInjection || selectedScenario?.id || ""}
        simulationId={selectedScenario?.simulationId || simulations[0]?.id || ""}
        scenarios={scenarios.map(s => ({
          id: s.id,
          name: s.name,
          simulationId: s.simulationId
        }))}
        simulations={simulations.map(s => ({
          id: s.id,
          name: s.title
        }))}
        initialData={selectedInjection ? {
          id: selectedInjection.id,
          title: selectedInjection.title,
          content: selectedInjection.content,
          triggerType: selectedInjection.triggerType,
          timeOffset: selectedInjection.timeOffset,
          isRepeating: selectedInjection.isRepeating,
          repeatInterval: selectedInjection.repeatInterval,
          scenarioId: selectedInjection.scenarioId,
          simulationId: selectedInjection.simulationId,
          isActive: selectedInjection.isActive,
          type: selectedInjection.type,
          imageUrl: selectedInjection.imageUrl || undefined,
          videoUrl: selectedInjection.videoUrl || undefined,
          attachments: selectedInjection.attachments || undefined,
          payload: selectedInjection.payload || undefined,
        } : undefined}
      />
    </div>
  );
}
