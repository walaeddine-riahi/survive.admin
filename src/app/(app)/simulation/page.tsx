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
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
  LayoutDashboard,
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
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 shadow-[0_0_10px_rgba(124,58,237,0.1)] font-bold uppercase text-[10px]">
          Planifié
        </Badge>
      );
    case "ongoing":
      return (
        <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20 shadow-[0_0_10px_rgba(34,211,238,0.1)] font-bold uppercase text-[10px] animate-pulse">
          En cours
        </Badge>
      );
    case "completed":
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 font-bold uppercase text-[10px]">
          Terminé
        </Badge>
      );
    case "cancelled":
      return <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 font-bold uppercase text-[10px]">Annulé</Badge>;
    default:
      return <Badge variant="outline" className="text-muted-foreground border-white/5 font-bold uppercase text-[10px]">Non défini</Badge>;
  }
};

export default function SimulationPage() {
  const router = useRouter();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSimulationFormOpen, setIsSimulationFormOpen] = useState(false);
  const [selectedSimulation, setSelectedSimulation] = useState<Simulation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScenarioFormOpen, setIsScenarioFormOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const { toast } = useToast();

  const [filteredSimulations, setFilteredSimulations] = useState<Simulation[]>([]);
  const [ongoingSimulations, setOngoingSimulations] = useState<Simulation[]>([]);
  const [plannedSimulations, setPlannedSimulations] = useState<Simulation[]>([]);
  const [completedSimulations, setCompletedSimulations] = useState<Simulation[]>([]);

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

  const handleCreateSimulation = async (data: any) => {
    try {
      const response = await fetch("/api/simulations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to create simulation");

      await fetchSimulations();
      setIsSimulationFormOpen(false);
      toast({ title: "Simulation créée", description: "La simulation a été créée avec succès." });
    } catch (error) {
      console.error("Error creating simulation:", error);
      toast({ title: "Erreur", description: "Une erreur est survenue lors de la création de la simulation.", variant: "destructive" });
    }
  };

  const handleUpdateSimulation = async (data: any) => {
    if (!selectedSimulation) return;
    try {
      const response = await fetch(`/api/simulations/${selectedSimulation.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update simulation");

      await fetchSimulations();
      setIsSimulationFormOpen(false);
      setSelectedSimulation(null);
      toast({ title: "Simulation modifiée", description: "La simulation a été modifiée avec succès." });
    } catch (error) {
      console.error("Error updating simulation:", error);
      toast({ title: "Erreur", description: "Une erreur est survenue lors de la modification de la simulation.", variant: "destructive" });
    }
  };

  const handleDeleteSimulation = async (simulationId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette simulation ?")) return;
    try {
      const response = await fetch(`/api/simulations/${simulationId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete simulation");
      await fetchSimulations();
      toast({ title: "Simulation supprimée", description: "La simulation a été supprimée avec succès." });
    } catch (error) {
      console.error("Error deleting simulation:", error);
      toast({ title: "Erreur", description: "Une erreur est survenue lors de la suppression de la simulation.", variant: "destructive" });
    }
  };

  const handleDeleteScenario = async (scenarioId: string) => {
    console.log("Delete scenario", scenarioId);
  };

  if (loading) return <div className="flex items-center justify-center h-[60vh] text-primary animate-pulse font-black tracking-widest uppercase">Initialisation...</div>;
  if (error) return <div className="text-red-400 glass-card p-6 border-red-500/20 text-center">Erreur Système: {error}</div>;

  if (selectedSimulation) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Button variant="ghost" onClick={() => setSelectedSimulation(null)} className="hover:bg-white/5 rounded-xl group px-0">
              <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
              <span className="text-muted-foreground">Retour au centre de commandement</span>
            </Button>
            <h2 className="text-3xl font-black bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
              Scénarios: {selectedSimulation.title}
            </h2>
          </div>
          <Button onClick={() => { setSelectedScenario(null); setIsScenarioFormOpen(true); }} className="button-premium">
            <Plus className="mr-2 h-4 w-4" /> Nouveau Scénario
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {(selectedSimulation.scenarios?.length ?? 0) === 0 ? (
            <div className="glass-card p-12 text-center border-dashed">
              <p className="text-muted-foreground font-medium">Aucun scénario opérationnel détecté pour cette simulation.</p>
            </div>
          ) : (
            (selectedSimulation.scenarios || []).map((scenario) => (
              <Card key={scenario.id} className="glass-card hover:border-primary/30 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <CardTitle className="text-xl font-bold">{scenario.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{scenario.description || "Pas de description opérationnelle."}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5" onClick={() => { setSelectedScenario(scenario); setIsScenarioFormOpen(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-red-500/20 text-red-400" onClick={() => handleDeleteScenario(scenario.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                    <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" /> Injections de Données ({scenario.injections?.length ?? 0})
                    </h4>
                    {(!scenario.injections || scenario.injections.length === 0) ? (
                      <p className="text-[10px] text-muted-foreground italic uppercase tracking-tighter">Séquence d'injection vide.</p>
                    ) : (
                      <div className="space-y-3">
                        {(scenario.injections || []).map((inj, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
                            <span className="font-mono text-primary font-bold">#{idx+1}</span>
                            <span className="flex-1 font-medium">{inj.name}</span>
                            <Badge variant="outline" className="text-[9px] uppercase border-white/10">{inj.triggerType}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
            Centre de Simulations
          </h1>
          <p className="text-xs text-muted-foreground mt-2 font-bold uppercase tracking-widest flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-primary animate-pulse" /> État du Système: Opérationnel
          </p>
        </div>
        <Button onClick={() => { setSelectedSimulation(null); setIsSimulationFormOpen(true); }} className="button-premium">
          <Plus className="mr-2 h-4 w-4" /> Initialiser Simulation
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Tabs defaultValue="all" className="flex-1 w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <TabsList className="bg-white/5 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
              <TabsTrigger value="all" className="px-8 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all font-black uppercase text-xs tracking-widest">Global</TabsTrigger>
              <TabsTrigger value="ongoing" className="px-8 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all font-black uppercase text-xs tracking-widest">En Cours</TabsTrigger>
              <TabsTrigger value="planned" className="px-8 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all font-black uppercase text-xs tracking-widest">Planifiées</TabsTrigger>
            </TabsList>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
              <Input
                placeholder="Scanner les simulations..."
                className="input-premium pl-12 h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <TabsContent value="all" className="mt-0">
            <Card className="glass-card overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Simulation</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">Statut</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">Chronologie</TableHead>
                      <TableHead className="text-right text-[10px] font-black uppercase tracking-widest pr-8">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSimulations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-64 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground opacity-30">
                            <Calendar className="h-12 w-12 mb-4" />
                            <p className="font-black uppercase tracking-widest text-xs">Aucune simulation détectée</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSimulations.map((simulation) => (
                        <TableRow key={simulation.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                          <TableCell className="py-6">
                            <div className="flex flex-col">
                              <span className="font-black text-foreground group-hover:text-primary transition-colors">{simulation.title}</span>
                              <span className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{simulation.description || "Aucun détail opérationnel."}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(simulation.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5 text-primary" />
                              <span>{formatDate(simulation.startDate)}</span>
                              <span className="opacity-30">—</span>
                              <span>{formatDate(simulation.endDate)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right pr-8">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-9 w-9 rounded-xl hover:bg-white/5 text-primary" 
                                onClick={() => router.push(`/simulation/${simulation.id}/dashboard`)}
                                title="Tableau de bord"
                              >
                                <LayoutDashboard className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/5" onClick={() => setSelectedSimulation(simulation)} title="Voir les scénarios">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/5">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="glass-card min-w-[180px]">
                                  <DropdownMenuItem onClick={() => router.push(`/simulation/${simulation.id}/dashboard`)} className="gap-2 cursor-pointer">
                                    <LayoutDashboard className="h-4 w-4" /> Tableau de Bord
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => { setSelectedSimulation(simulation); setIsSimulationFormOpen(true); }} className="gap-2 cursor-pointer">
                                    <Edit className="h-4 w-4" /> Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => router.push(`/simulation/${simulation.id}/instructor-view`)} className="gap-2 cursor-pointer">
                                    <Eye className="h-4 w-4" /> Vue Instructeur
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeleteSimulation(simulation.id)} className="gap-2 cursor-pointer text-red-400 hover:text-red-300">
                                    <Trash2 className="h-4 w-4" /> Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="ongoing" className="mt-0">
             <Card className="glass-card overflow-hidden">
                <CardContent className="p-0">
                   <Table>
                      <TableHeader className="bg-white/5">
                        <TableRow className="border-white/5 hover:bg-transparent">
                          <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Simulation</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest">Statut</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest">Chronologie</TableHead>
                          <TableHead className="text-right text-[10px] font-black uppercase tracking-widest pr-8">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ongoingSimulations.length === 0 ? (
                           <TableRow><TableCell colSpan={4} className="h-64 text-center opacity-30 text-xs font-black uppercase tracking-widest">Aucune simulation en cours</TableCell></TableRow>
                        ) : (
                          ongoingSimulations.map((sim) => (
                            <TableRow key={sim.id} className="border-white/5 hover:bg-white/[0.02]">
                               <TableCell className="py-6 font-black">{sim.title}</TableCell>
                               <TableCell>{getStatusBadge(sim.status)}</TableCell>
                               <TableCell className="text-xs font-bold text-muted-foreground">{formatDate(sim.startDate)} — {formatDate(sim.endDate)}</TableCell>
                               <TableCell className="text-right pr-8">
                                  <div className="flex items-center justify-end gap-2">
                                     <Button 
                                       variant="ghost" 
                                       size="icon" 
                                       className="h-9 w-9 rounded-xl hover:bg-white/5 text-primary" 
                                       onClick={() => router.push(`/simulation/${sim.id}/dashboard`)}
                                       title="Tableau de bord"
                                     >
                                       <LayoutDashboard className="h-4 w-4" />
                                     </Button>
                                     <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/5" onClick={() => setSelectedSimulation(sim)} title="Voir les scénarios">
                                       <Eye className="h-4 w-4" />
                                     </Button>
                                  </div>
                               </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                   </Table>
                </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="planned" className="mt-0">
             <Card className="glass-card overflow-hidden">
                <CardContent className="p-0">
                   <Table>
                      <TableHeader className="bg-white/5">
                        <TableRow className="border-white/5 hover:bg-transparent">
                          <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Simulation</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest">Statut</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest">Chronologie</TableHead>
                          <TableHead className="text-right text-[10px] font-black uppercase tracking-widest pr-8">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {plannedSimulations.length === 0 ? (
                           <TableRow><TableCell colSpan={4} className="h-64 text-center opacity-30 text-xs font-black uppercase tracking-widest">Aucune simulation planifiée</TableCell></TableRow>
                        ) : (
                          plannedSimulations.map((sim) => (
                            <TableRow key={sim.id} className="border-white/5 hover:bg-white/[0.02]">
                               <TableCell className="py-6 font-black">{sim.title}</TableCell>
                               <TableCell>{getStatusBadge(sim.status)}</TableCell>
                               <TableCell className="text-xs font-bold text-muted-foreground">{formatDate(sim.startDate)} — {formatDate(sim.endDate)}</TableCell>
                               <TableCell className="text-right pr-8">
                                  <div className="flex items-center justify-end gap-2">
                                     <Button 
                                       variant="ghost" 
                                       size="icon" 
                                       className="h-9 w-9 rounded-xl hover:bg-white/5 text-primary" 
                                       onClick={() => router.push(`/simulation/${sim.id}/dashboard`)}
                                       title="Tableau de bord"
                                     >
                                       <LayoutDashboard className="h-4 w-4" />
                                     </Button>
                                     <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/5" onClick={() => setSelectedSimulation(sim)} title="Voir les scénarios">
                                       <Eye className="h-4 w-4" />
                                     </Button>
                                  </div>
                               </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                   </Table>
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isSimulationFormOpen} onOpenChange={setIsSimulationFormOpen}>
        <DialogContent className="max-w-2xl bg-[var(--bg-surface)] border-[var(--border)] p-0 overflow-hidden shadow-2xl">
          <SimulationForm
            initialData={selectedSimulation || undefined}
            onSave={selectedSimulation ? handleUpdateSimulation : handleCreateSimulation}
            onCancel={() => setIsSimulationFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
