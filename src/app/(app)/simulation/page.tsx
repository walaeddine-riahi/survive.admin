"use client";

import { SimulationForm } from "@/components/simulation-form";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  Calendar,
  ChevronLeft,
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Eye,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Assuming Scenario and Injection types based on prisma schema
interface Scenario {
  id: string;
  name: string;
  description: string | null;
  simulationId: string;
  injections: Injection[];
  createdAt: string;
  updatedAt: string;
}

interface Injection {
  id: string;
  name: string;
  description: string | null;
  triggerType: "MANUAL" | "TIMED";
  timeOffset: number | null;
  payload?: Record<string, unknown> | null; // Use a more specific type for JSON payload
  scenarioId: string;
  notificationId: string | null; // Assuming link to Notification by ID
  createdAt: string;
  updatedAt: string;
}

interface Simulation {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  status: "planned" | "ongoing" | "completed" | "cancelled";
  scenarios: Scenario[]; // Include scenarios in Simulation type
}

interface SimulationFormData {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status: "planned" | "ongoing" | "completed" | "cancelled";
}

const formatDate = (dateString: string) => {
  if (!dateString) return "Date invalide";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Date invalide";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Date invalide";
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "planned":
      return (
        <Badge
          variant="outline"
          className="bg-blue-500/10 text-blue-500 border-blue-500/20"
        >
          Planifié
        </Badge>
      );
    case "ongoing":
      return (
        <Badge variant="default" className="bg-orange-500">
          En cours
        </Badge>
      );
    case "completed":
      return (
        <Badge variant="default" className="bg-green-500">
          Terminé
        </Badge>
      );
    case "cancelled":
      return <Badge variant="secondary">Annulé</Badge>;
    default:
      return <Badge variant="outline">Non défini</Badge>;
  }
};

export default function SimulationPage() {
  const router = useRouter();
  // Initialize state with empty arrays
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSimulationFormOpen, setIsSimulationFormOpen] = useState(false);
  const [selectedSimulation, setSelectedSimulation] =
    useState<Simulation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScenarioFormOpen, setIsScenarioFormOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(
    null
  );
  const { toast } = useToast();

  // Initialize filtered arrays with empty arrays
  const [filteredSimulations, setFilteredSimulations] = useState<Simulation[]>(
    []
  );
  const [ongoingSimulations, setOngoingSimulations] = useState<Simulation[]>(
    []
  );
  const [plannedSimulations, setPlannedSimulations] = useState<Simulation[]>(
    []
  );
  const [completedSimulations, setCompletedSimulations] = useState<
    Simulation[]
  >([]);

  const fetchSimulations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/simulations");
      if (!response.ok) {
        throw new Error(`Failed to fetch simulations: ${response.statusText}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Invalid response format: expected an array");
      }
      setSimulations(data);
    } catch (err) {
      console.error("Error fetching simulations:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setSimulations([]);
    } finally {
      setLoading(false);
    }
  };

  // Update filtered simulations whenever simulations or searchQuery changes
  useEffect(() => {
    const filtered = (simulations ?? []).filter((simulation) => {
      if (!simulation) return false;
      const searchLower = (searchQuery || "").toLowerCase();
      return (
        (simulation.title || "").toLowerCase().includes(searchLower) ||
        (simulation.description || "").toLowerCase().includes(searchLower) ||
        (simulation.status || "").toLowerCase().includes(searchLower)
      );
    });

    setFilteredSimulations(filtered);
    setOngoingSimulations(filtered.filter((sim) => sim?.status === "ongoing"));
    setPlannedSimulations(filtered.filter((sim) => sim?.status === "planned"));
    setCompletedSimulations(
      filtered.filter((sim) => sim?.status === "completed")
    );
  }, [simulations, searchQuery]);

  useEffect(() => {
    fetchSimulations();
  }, []);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div>Erreur: {error}</div>;
  }

  // Handlers for Simulation actions (Create, Update, Delete)
  const handleCreateSimulation = async (data: SimulationFormData) => {
    try {
      const response = await fetch("/api/simulations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create simulation");
      }

      await fetchSimulations();
      setIsSimulationFormOpen(false);
      toast({
        title: "Simulation créée",
        description: "La simulation a été créée avec succès.",
      });
    } catch (error) {
      console.error("Error creating simulation:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la création de la simulation.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSimulation = async (data: SimulationFormData) => {
    if (!selectedSimulation) return;

    try {
      const response = await fetch(
        `/api/simulations/${selectedSimulation.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update simulation");
      }

      await fetchSimulations();
      toast({
        title: "Simulation modifiée",
        description: "La simulation a été modifiée avec succès.",
      });
    } catch (error) {
      console.error("Error updating simulation:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la modification de la simulation.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSimulation = async (simulationId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette simulation ?"))
      return;

    try {
      const response = await fetch(`/api/simulations/${simulationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete simulation");
      }

      await fetchSimulations();
      toast({
        title: "Simulation supprimée",
        description: "La simulation a été supprimée avec succès.",
      });
    } catch (error) {
      console.error("Error deleting simulation:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la suppression de la simulation.",
        variant: "destructive",
      });
    }
  };

  // Handlers for Scenario actions (Create, Update, Delete) - Placeholder implementations
  const handleDeleteScenario = async (scenarioId: string) => {
    console.log("Delete scenario", scenarioId);
    // TODO: Implement API call to delete scenario
    // Refresh simulations
    // fetchSimulations();
  };

  // Render scenarios view if a simulation is selected
  if (selectedSimulation) {
    return (
      <div className="flex-1 pl-0 pr-4 py-4 bg-background">
        <div className="flex items-center justify-between space-y-2">
          <Button variant="outline" onClick={() => setSelectedSimulation(null)}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Retour aux simulations
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">
            Scénarios pour &quot;{selectedSimulation.title}&quot;
          </h2>
          <Button
            onClick={() => {
              setSelectedScenario(null); // Clear selected scenario for creation
              setIsScenarioFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Nouveau scénario
          </Button>
        </div>

        {/* Placeholder for Scenario Form */}
        {isScenarioFormOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">
                {selectedScenario ? "Modifier Scénario" : "Créer Scénario"}
              </h3>
              {/* Replace with actual ScenarioForm component later */}
              <p>Formulaire pour créer/modifier un scénario...</p>
              <Button onClick={() => setIsScenarioFormOpen(false)}>
                Fermer
              </Button>
            </div>
          </div>
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Liste des scénarios</CardTitle>
            <CardDescription>
              {selectedSimulation.scenarios.length} scénario
              {selectedSimulation.scenarios.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedSimulation.scenarios.length === 0 ? (
              <div className="text-muted-foreground">
                Aucun scénario pour cette simulation.
              </div>
            ) : (
              selectedSimulation.scenarios.map((scenario) => (
                <Card key={scenario.id} className="border">
                  <CardHeader className="flex flex-row items-center justify-between p-4">
                    <div className="text-lg font-medium">{scenario.name}</div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedScenario(scenario);
                            setIsScenarioFormOpen(true);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" /> Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteScenario(scenario.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-muted-foreground text-sm mb-4">
                      {scenario.description || "Pas de description."}
                    </p>
                    {/* Placeholder for Injections list */}
                    <div>
                      <h4 className="text-md font-semibold mb-2">
                        Injections ({scenario.injections.length})
                      </h4>
                      {/* Replace with actual Injections list component later */}
                      <div className="text-sm text-muted-foreground">
                        {scenario.injections.length === 0
                          ? "Aucune injection."
                          : "Liste des injections..."}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render simulations table view by default
  return (
    <div className="flex-1 pl-0 pr-4 py-4 bg-background">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Simulations</h1>
          <Button onClick={() => setIsSimulationFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nouvelle simulation
          </Button>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList className="bg-muted">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-background"
              >
                Toutes
              </TabsTrigger>
              <TabsTrigger
                value="ongoing"
                className="data-[state=active]:bg-background"
              >
                En cours
              </TabsTrigger>
              <TabsTrigger
                value="planned"
                className="data-[state=active]:bg-background"
              >
                Planifiées
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="data-[state=active]:bg-background"
              >
                Terminées
              </TabsTrigger>
              <TabsTrigger
                value="plan"
                className="data-[state=active]:bg-background"
              >
                Plan
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
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
          </div>

          <TabsContent value="all" className="space-y-4">
            <Card className="bg-card border shadow-sm">
              <CardHeader className="px-6 py-4">
                <div className="flex justify-between">
                  <div>
                    <CardTitle>Toutes les simulations</CardTitle>
                    <CardDescription>
                      {(filteredSimulations ?? []).length} simulation
                      {(filteredSimulations ?? []).length !== 1 ? "s" : ""}{" "}
                      trouvée
                      {(filteredSimulations ?? []).length !== 1 ? "s" : ""}
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
                      <TableHead>Statut</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(filteredSimulations ?? []).map((simulation) => (
                      <TableRow
                        key={simulation.id}
                        onClick={() => router.push(`/simulation/${simulation.id}/instructor-view`)}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell className="font-mono text-xs">
                          {simulation.id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {simulation.title}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(simulation.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {formatDate(simulation.startDate)} -{" "}
                              {formatDate(simulation.endDate)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(
                                    `/simulation/${simulation.id}/instructor-view`
                                  );
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Vue Instructeur
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSimulation(simulation);
                                  setIsSimulationFormOpen(true);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSimulation(simulation.id);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
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
          </TabsContent>

          <TabsContent value="ongoing">
            <Card className="bg-card border shadow-sm">
              <CardHeader className="px-6 py-4">
                <div className="flex justify-between">
                  <div>
                    <CardTitle>Simulations en cours</CardTitle>
                    <CardDescription>
                      {(ongoingSimulations ?? []).length} simulation
                      {(ongoingSimulations ?? []).length !== 1 ? "s" : ""}
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
                      <TableHead>Statut</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(ongoingSimulations ?? []).map((simulation) => (
                      <TableRow
                        key={simulation.id}
                        onClick={() => router.push(`/simulation/${simulation.id}/instructor-view`)}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell className="font-mono text-xs">
                          {simulation.id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {simulation.title}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(simulation.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {formatDate(simulation.startDate)} -{" "}
                              {formatDate(simulation.endDate)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(
                                    `/simulation/${simulation.id}/instructor-view`
                                  );
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Vue Instructeur
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSimulation(simulation);
                                  setIsSimulationFormOpen(true);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSimulation(simulation.id);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
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
          </TabsContent>

          <TabsContent value="planned">
            <Card className="bg-card border shadow-sm">
              <CardHeader className="px-6 py-4">
                <div className="flex justify-between">
                  <div>
                    <CardTitle>Simulations planifiées</CardTitle>
                    <CardDescription>
                      {(plannedSimulations ?? []).length} simulation
                      {(plannedSimulations ?? []).length !== 1 ? "s" : ""}
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
                      <TableHead>Statut</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(plannedSimulations ?? []).map((simulation) => (
                      <TableRow
                        key={simulation.id}
                        onClick={() => router.push(`/simulation/${simulation.id}/instructor-view`)}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell className="font-mono text-xs">
                          {simulation.id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {simulation.title}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(simulation.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {formatDate(simulation.startDate)} -{" "}
                              {formatDate(simulation.endDate)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(
                                    `/simulation/${simulation.id}/instructor-view`
                                  );
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Vue Instructeur
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSimulation(simulation);
                                  setIsSimulationFormOpen(true);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSimulation(simulation.id);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
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
          </TabsContent>

          <TabsContent value="completed">
            <Card className="bg-card border shadow-sm">
              <CardHeader className="px-6 py-4">
                <div className="flex justify-between">
                  <div>
                    <CardTitle>Simulations terminées</CardTitle>
                    <CardDescription>
                      {(completedSimulations ?? []).length} simulation
                      {(completedSimulations ?? []).length !== 1 ? "s" : ""}
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
                      <TableHead>Statut</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(completedSimulations ?? []).map((simulation) => (
                      <TableRow
                        key={simulation.id}
                        onClick={() => router.push(`/simulation/${simulation.id}/instructor-view`)}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell className="font-mono text-xs">
                          {simulation.id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {simulation.title}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(simulation.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {formatDate(simulation.startDate)} -{" "}
                              {formatDate(simulation.endDate)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(
                                    `/simulation/${simulation.id}/instructor-view`
                                  );
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Vue Instructeur
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSimulation(simulation);
                                  setIsSimulationFormOpen(true);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSimulation(simulation.id);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
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
          </TabsContent>

          <TabsContent value="plan">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">
                  Sélectionnez une simulation pour voir son plan de tâches.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <SimulationForm
        open={isSimulationFormOpen}
        onOpenChange={(open) => {
          setIsSimulationFormOpen(open);
          if (!open) {
            setSelectedSimulation(null);
          }
        }}
        onSubmit={
          selectedSimulation ? handleUpdateSimulation : handleCreateSimulation
        }
        initialData={selectedSimulation || undefined}
      />
    </div>
  );
}
