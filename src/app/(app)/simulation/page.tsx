"use client";

import { SimulationForm } from "@/components/simulation-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
  Play,
  Activity,
  Award,
  Clock,
  Sparkles,
  Server,
  Mail,
  Phone,
  MessageSquare,
  Shield,
  Workflow,
  BookOpen,
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
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_12px_rgba(99,102,241,0.15)]">
          Planifié
        </span>
      );
    case "ongoing":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_12px_rgba(34,211,238,0.2)] animate-pulse">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping mr-1.5" />
          En cours
        </span>
      );
    case "completed":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
          Terminé
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-400 border border-rose-500/20">
          Annulé
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-500/10 text-slate-400 border border-slate-500/20">
          Non défini
        </span>
      );
  }
};

export default function SimulationPage() {
  const router = useRouter();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSimulation, setSelectedSimulation] = useState<Simulation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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

  const renderSimulationGrid = (sims: Simulation[], emptyMessage: string) => {
    if (sims.length === 0) {
      return (
        <div className="glass-card p-16 text-center border border-dashed border-slate-800/80 bg-slate-950/20 rounded-3xl flex flex-col items-center justify-center min-h-[320px] animate-in fade-in duration-500">
          <div className="p-4 rounded-full bg-slate-900/60 text-slate-500 mb-4 border border-slate-800/80">
            <Server className="h-8 w-8" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2">Aucune simulation détectée</h3>
          <p className="text-xs text-slate-500 max-w-md">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {sims.map((sim) => (
          <Card key={sim.id} className="relative overflow-hidden group bg-slate-950/40 border border-slate-800/80 hover:border-orange-500/40 hover:shadow-[0_0_30px_rgba(249,115,22,0.06)] rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between">
            {/* Top Glow Accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="space-y-4">
              {/* Header Status & Icon */}
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 group-hover:border-orange-500/20 group-hover:text-orange-400 text-slate-400 transition-colors">
                  <Shield className="h-4.5 w-4.5" />
                </div>
                {getStatusBadge(sim.status)}
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5">
                <h3 className="font-black text-lg text-white group-hover:text-orange-400 transition-colors leading-snug line-clamp-1">{sim.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px] leading-relaxed">{sim.description || "Aucune directive opérationnelle n'a été spécifiée."}</p>
              </div>

              {/* Timing info */}
              <div className="flex items-center gap-2.5 text-[11px] font-bold text-slate-400 bg-slate-900/40 border border-slate-900/60 p-3 rounded-2xl">
                <Calendar className="h-4 w-4 text-orange-400" />
                <span className="text-slate-300">{formatDate(sim.startDate)}</span>
                <span className="opacity-30">—</span>
                <span className="text-slate-300">{formatDate(sim.endDate)}</span>
              </div>

              {/* Extra micro-metrics */}
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest pt-2 border-t border-slate-900/85">
                <div className="flex items-center gap-1.5">
                  <Workflow className="h-3.5 w-3.5 text-slate-600" />
                  <span>{sim.scenarios?.length || 0} Scénarios</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-slate-600" />
                  <span>
                    {sim.scenarios?.reduce((acc, sc) => acc + (sc.injections?.length || 0), 0) || 0} Injects
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 mt-6 border-t border-slate-800/80 pt-4">
              <Button 
                className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-widest h-10 rounded-xl shadow-lg shadow-orange-950/20 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                onClick={() => router.push(`/simulation/${sim.id}/dashboard`)}
              >
                <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
              </Button>
              <Button 
                variant="outline"
                className="px-3 bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 text-slate-300 hover:text-white rounded-xl h-10 transition-all flex items-center justify-center gap-1.5"
                onClick={() => setSelectedSimulation(sim)}
                title="Voir les Scénarios"
              >
                <Eye className="h-4 w-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="px-3 bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 text-slate-300 hover:text-white rounded-xl h-10 transition-all flex items-center justify-center">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-card min-w-[190px] bg-slate-950/95 border-slate-850 shadow-2xl rounded-2xl p-1.5">
                  <DropdownMenuItem onClick={() => router.push(`/simulation/${sim.id}/instructor-view`)} className="gap-2.5 cursor-pointer rounded-xl hover:bg-orange-600/10 hover:text-orange-300 font-medium text-xs py-2">
                    <Play className="h-3.5 w-3.5 text-orange-400" /> Vue Instructeur
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/simulation/builder/${sim.id}`)} className="gap-2.5 cursor-pointer rounded-xl hover:bg-orange-600/10 hover:text-orange-300 font-medium text-xs py-2">
                    <Edit className="h-3.5 w-3.5 text-orange-400" /> Modifier (Wizard)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDeleteSimulation(sim.id)} className="gap-2.5 cursor-pointer rounded-xl hover:bg-rose-600/10 hover:text-rose-400 text-rose-400 font-medium text-xs py-2">
                    <Trash2 className="h-3.5 w-3.5" /> Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  if (loading) return <div className="flex items-center justify-center h-[60vh] text-orange-500 animate-pulse font-black tracking-widest uppercase text-xs">Initialisation du Centre de Commandement...</div>;
  if (error) return <div className="text-red-400 glass-card p-6 border border-red-500/20 rounded-3xl text-center max-w-lg mx-auto mt-20">Erreur Système: {error}</div>;

  if (selectedSimulation) {
    const totalInjects = selectedSimulation.scenarios?.reduce((acc, sc) => acc + (sc.injections?.length || 0), 0) || 0;

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Navigation & Title */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-900 pb-6">
          <div className="space-y-2.5">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedSimulation(null)} 
              className="hover:bg-slate-900/60 text-slate-400 hover:text-white rounded-xl px-3 -ml-3 h-9 text-xs font-bold uppercase tracking-widest gap-2"
            >
              <ChevronLeft className="h-4 w-4" /> 
              <span>Retour au centre de commandement</span>
            </Button>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-black bg-gradient-to-r from-white via-white to-slate-500 bg-clip-text text-transparent leading-none">
                {selectedSimulation.title}
              </h2>
              {getStatusBadge(selectedSimulation.status)}
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {selectedSimulation.description || "Aucune consigne opérationnelle fournie pour cette simulation."}
            </p>
          </div>
          <Button onClick={() => router.push(`/simulation/builder/${selectedSimulation.id}`)} className="button-premium shadow-lg shadow-orange-950/20 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-widest h-11 px-5 rounded-xl">
            <Plus className="mr-2 h-4 w-4" /> Nouveau Scénario
          </Button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 bg-slate-900/20 border border-slate-900 p-5 rounded-3xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-900/60 text-slate-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-black text-white">{selectedSimulation.scenarios?.length || 0}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scénarios Actifs</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-900/60 text-slate-400">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-black text-white">{totalInjects}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Injections programmées</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-900/60 text-slate-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-black text-white">{formatDate(selectedSimulation.startDate)}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date de Lancement</div>
            </div>
          </div>
        </div>

        {/* Scenarios List */}
        <div className="grid grid-cols-1 gap-6">
          {(selectedSimulation.scenarios?.length ?? 0) === 0 ? (
            <div className="glass-card p-16 text-center border border-dashed border-slate-800 bg-slate-950/20 rounded-3xl flex flex-col items-center justify-center">
              <div className="p-4 rounded-full bg-slate-900/60 text-slate-500 mb-4 border border-slate-800">
                <Workflow className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2">Aucun scénario opérationnel</h3>
              <p className="text-xs text-slate-500 max-w-sm">Créez un scénario pour ajouter des séquences d'injections et structurer l'exercice de crise.</p>
            </div>
          ) : (
            (selectedSimulation.scenarios || []).map((scenario) => (
              <Card key={scenario.id} className="relative overflow-hidden bg-slate-950/40 border border-slate-850 hover:border-slate-800 transition-all rounded-3xl p-6">
                <div className="flex items-start justify-between border-b border-slate-900 pb-4 mb-6">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-black text-white flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                      {scenario.name}
                    </CardTitle>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xl">{scenario.description || "Aucune description opérationnelle spécifiée."}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-900/60 text-slate-400 hover:text-white h-9 w-9" onClick={() => router.push(`/simulation/builder/${selectedSimulation.id}`)}>
                      <Edit className="h-4.5 w-4.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-rose-500/10 text-rose-400 h-9 w-9" onClick={() => handleDeleteScenario(scenario.id)}>
                      <Trash2 className="h-4.5 w-4.5" />
                    </Button>
                  </div>
                </div>
                
                <CardContent className="p-0">
                  <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-5">
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-orange-400 mb-4 flex items-center gap-2">
                      <Workflow className="h-4 w-4" />
                      Séquence d'injections de données ({scenario.injections?.length ?? 0})
                    </h4>
                    {(!scenario.injections || scenario.injections.length === 0) ? (
                      <p className="text-xs text-slate-500 italic p-3">Aucune injection planifiée dans cette séquence.</p>
                    ) : (
                      <div className="relative pl-6 space-y-4 border-l border-slate-800 ml-3">
                        {(scenario.injections || []).map((inj, idx) => {
                          const nameLower = inj.name.toLowerCase();
                          let icon = <Server className="h-4 w-4" />;
                          if (nameLower.includes("mail") || nameLower.includes("courriel")) icon = <Mail className="h-4 w-4" />;
                          else if (nameLower.includes("sms") || nameLower.includes("whatsapp")) icon = <MessageSquare className="h-4 w-4" />;
                          else if (nameLower.includes("call") || nameLower.includes("appel") || nameLower.includes("tel")) icon = <Phone className="h-4 w-4" />;

                          return (
                            <div key={idx} className="relative flex items-center gap-4 p-3.5 rounded-xl bg-slate-900/40 border border-slate-900 hover:border-slate-800 hover:bg-slate-900/60 transition-all text-xs group">
                              {/* Flow dot accent */}
                              <div className="absolute -left-[31px] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-slate-950 bg-slate-900 flex items-center justify-center text-slate-500 group-hover:bg-orange-600 group-hover:border-orange-400 group-hover:text-white transition-all text-[8px] font-bold">
                                {idx + 1}
                              </div>
                              
                              <div className="p-2 rounded-lg bg-slate-950/60 text-slate-400 group-hover:text-orange-400 transition-colors">
                                {icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-white group-hover:text-orange-400 transition-colors truncate">{inj.name}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{inj.description || "Aucune description technique."}</p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-wider border-slate-800 bg-slate-950/40 text-slate-400">
                                  {inj.triggerType}
                                </Badge>
                                {inj.timeOffset !== null && inj.timeOffset !== undefined && (
                                  <Badge variant="outline" className="text-[9px] font-bold border-orange-500/10 bg-orange-500/5 text-orange-400">
                                    +{inj.timeOffset} min
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Title & Top Action */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-white via-white to-slate-500 bg-clip-text text-transparent leading-none">
            Centre de Simulations
          </h1>
          <p className="text-xs text-slate-400 mt-2.5 font-bold uppercase tracking-widest flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" /> État du Système: Opérationnel
          </p>
        </div>
        <Button onClick={() => router.push("/simulation/builder")} className="button-premium shadow-lg shadow-orange-950/20 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-widest h-11 px-5 rounded-xl">
          <Plus className="mr-2 h-4 w-4" /> Initialiser Simulation
        </Button>
      </div>

      {/* Analytics Dashboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="glass-card p-5 relative overflow-hidden bg-slate-900/40 border border-slate-800/80 rounded-2xl flex items-center gap-4 group hover:border-slate-700 transition-all duration-300">
          <div className="p-3.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{simulations.length}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Simulations Totales</div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-orange-500/5 rounded-full blur-xl group-hover:bg-orange-500/10 transition-all" />
        </div>
        
        <div className="glass-card p-5 relative overflow-hidden bg-slate-900/40 border border-slate-800/80 rounded-2xl flex items-center gap-4 group hover:border-slate-700 transition-all duration-300">
          <div className="p-3.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center relative">
            <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping" />
            <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-cyan-500 rounded-full" />
            <Play className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{simulations.filter(s => s.status === "ongoing").length}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sessions Actives</div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10 transition-all" />
        </div>

        <div className="glass-card p-5 relative overflow-hidden bg-slate-900/40 border border-slate-800/80 rounded-2xl flex items-center gap-4 group hover:border-slate-700 transition-all duration-300">
          <div className="p-3.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{simulations.filter(s => s.status === "planned").length}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Planifiées</div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-all" />
        </div>

        <div className="glass-card p-5 relative overflow-hidden bg-slate-900/40 border border-slate-800/80 rounded-2xl flex items-center gap-4 group hover:border-slate-700 transition-all duration-300">
          <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{simulations.filter(s => s.status === "completed").length}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Terminées</div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Tabs defaultValue="all" className="flex-1 w-full">
          {/* Filters & Search Scanner */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <TabsList className="bg-slate-950/60 p-1 rounded-2xl border border-slate-900 backdrop-blur-md">
              <TabsTrigger value="all" className="px-6 py-2 rounded-xl data-[state=active]:bg-orange-600 data-[state=active]:text-white transition-all font-black uppercase text-[10px] tracking-widest text-slate-400">Global</TabsTrigger>
              <TabsTrigger value="ongoing" className="px-6 py-2 rounded-xl data-[state=active]:bg-orange-600 data-[state=active]:text-white transition-all font-black uppercase text-[10px] tracking-widest text-slate-400">En Cours</TabsTrigger>
              <TabsTrigger value="planned" className="px-6 py-2 rounded-xl data-[state=active]:bg-orange-600 data-[state=active]:text-white transition-all font-black uppercase text-[10px] tracking-widest text-slate-400">Planifiées</TabsTrigger>
            </TabsList>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400" />
              <Input
                placeholder="Scanner les simulations..."
                className="pl-12 h-11 bg-slate-950/40 border-slate-900 focus-visible:ring-orange-500 focus-visible:border-orange-500 rounded-xl text-xs font-medium placeholder-slate-500 text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <TabsContent value="all" className="mt-0">
            {renderSimulationGrid(filteredSimulations, "Initialisez votre première simulation pour commencer vos entraînements de crise.")}
          </TabsContent>
          
          <TabsContent value="ongoing" className="mt-0">
            {renderSimulationGrid(ongoingSimulations, "Aucune simulation de crise n'est active en ce moment.")}
          </TabsContent>

          <TabsContent value="planned" className="mt-0">
            {renderSimulationGrid(plannedSimulations, "Aucune simulation n'est programmée dans le calendrier opérationnel.")}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
