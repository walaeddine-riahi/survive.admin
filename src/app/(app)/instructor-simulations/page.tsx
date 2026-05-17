"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Calendar, Eye, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getOrCreateInstructorSession } from "@/actions/simulation/sim-session-actions";
import { Loader2 } from "lucide-react";

interface Simulation {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
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

export default function InstructorSimulationsPage() {
  const router = useRouter();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
    return (
      <div className="flex-1 pl-0 pr-4 py-4 bg-background">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 pl-0 pr-4 py-4 bg-background">
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">Erreur: {error}</p>
        </div>
      </div>
    );
  }

  const SimulationTable = ({ simulations }: { simulations: Simulation[] }) => {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleJoinSession = async (simulationId: string, title: string) => {
      setLoadingId(simulationId);
      try {
        const result = await getOrCreateInstructorSession(simulationId, title);
        if (result.success && result.sessionId) {
          router.push(`/simulation/${simulationId}/live?sessionId=${result.sessionId}&instructor=1`);
        } else {
          alert("Erreur: " + result.error);
          setLoadingId(null);
        }
      } catch (err) {
        console.error("Erreur lors de la création/connexion à la session", err);
        setLoadingId(null);
      }
    };

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead className="w-[200px] text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {simulations.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-muted-foreground"
              >
                Aucune simulation trouvée
              </TableCell>
            </TableRow>
          ) : (
            simulations.map((simulation) => (
              <TableRow key={simulation.id}>
                <TableCell className="font-medium">{simulation.title}</TableCell>
                <TableCell>{getStatusBadge(simulation.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {formatDate(simulation.startDate)} -{" "}
                      {formatDate(simulation.endDate)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    size="sm"
                    onClick={() => handleJoinSession(simulation.id, simulation.title)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={loadingId === simulation.id}
                  >
                    {loadingId === simulation.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Eye className="mr-2 h-4 w-4" />
                    )}
                    Lancer / Rejoindre (V2)
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="flex-1 pl-0 pr-4 py-4 bg-background">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Vue Instructeur</h1>
            <p className="text-muted-foreground mt-1">
              Accédez à la vue de monitoring pour chaque simulation
            </p>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList className="bg-muted">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-background"
              >
                Toutes ({(filteredSimulations ?? []).length})
              </TabsTrigger>
              <TabsTrigger
                value="ongoing"
                className="data-[state=active]:bg-background"
              >
                En cours ({(ongoingSimulations ?? []).length})
              </TabsTrigger>
              <TabsTrigger
                value="planned"
                className="data-[state=active]:bg-background"
              >
                Planifiées ({(plannedSimulations ?? []).length})
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="data-[state=active]:bg-background"
              >
                Terminées ({(completedSimulations ?? []).length})
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
                <CardTitle>Toutes les simulations</CardTitle>
                <CardDescription>
                  Cliquez sur &quot;Ouvrir Vue Instructeur&quot; pour accéder au
                  monitoring en temps réel
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6">
                <SimulationTable simulations={filteredSimulations} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ongoing">
            <Card className="bg-card border shadow-sm">
              <CardHeader className="px-6 py-4">
                <CardTitle>Simulations en cours</CardTitle>
                <CardDescription>
                  Surveillez les simulations actuellement actives
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6">
                <SimulationTable simulations={ongoingSimulations} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="planned">
            <Card className="bg-card border shadow-sm">
              <CardHeader className="px-6 py-4">
                <CardTitle>Simulations planifiées</CardTitle>
                <CardDescription>
                  Préparez-vous pour les prochaines simulations
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6">
                <SimulationTable simulations={plannedSimulations} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card className="bg-card border shadow-sm">
              <CardHeader className="px-6 py-4">
                <CardTitle>Simulations terminées</CardTitle>
                <CardDescription>
                  Analysez les résultats et générez des rapports
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6">
                <SimulationTable simulations={completedSimulations} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
