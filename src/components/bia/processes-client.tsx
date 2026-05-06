"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  Search,
  Filter,
  LayoutGrid,
  List,
  Download,
  RefreshCw,
  Clock,
  MapPin,
  Building2,
  LayoutDashboard,
  FileText,
  BarChart3,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { ImpactAnalysisButton } from "@/components/bia/impact-analysis-button";
import { Skeleton } from "@/components/ui/skeleton";
import { FactorySelect } from "@/components/bia/factory-select";
import { BiaDashboardHeader } from "@/components/bia/bia-dashboard-header";
import { BiaOverview } from "@/components/bia/bia-overview";
import { BiaReportsList } from "@/components/bia/bia-reports-list";
import { deleteProcess } from "@/actions/bia/process-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Process = {
  id: string;
  name: string;
  description: string | null;
  department: string;
  location: string;
  impact: string;
  criticality: "low" | "medium" | "high" | "critical";
  rto: number;
  mtpd: number;
  rpo: number;
  mbco: string;
  factoryId: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type Factory = {
  id: string;
  name: string;
  code: string;
};

type ProcessesClientProps = {
  initialProcesses: Process[];
  factories: Factory[];
};

const criticalityConfig = {
  critical: {
    label: "Critique",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: "🔴",
  },
  high: {
    label: "Élevé",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: "🟠",
  },
  medium: {
    label: "Moyen",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: "🟡",
  },
  low: {
    label: "Faible",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: "🟢",
  },
};

export function ProcessesClient({
  initialProcesses,
  factories,
}: ProcessesClientProps) {
  const [processes, setProcesses] = useState<Process[]>(initialProcesses);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [search, setSearch] = useState("");
  const [criticality, setCriticality] = useState("all");
  const [department, setDepartment] = useState("all");
  const [factoryId, setFactoryId] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  const departments = Array.from(new Set(initialProcesses.map(p => p.department)));

  const filteredProcesses = processes.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                         p.department.toLowerCase().includes(search.toLowerCase());
    const matchesCriticality = criticality === "all" || p.criticality === criticality;
    const matchesDepartment = department === "all" || p.department === department;
    const matchesFactory = factoryId === "all" || p.factoryId === factoryId;
    
    return matchesSearch && matchesCriticality && matchesDepartment && matchesFactory;
  });

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulation d'un rafraîchissement
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Données actualisées");
    }, 1000);
  };

  const handleExport = () => {
    toast.info("Préparation de l'export CSV...");
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce processus ?")) {
      const result = await deleteProcess(id);
      if (result.success) {
        setProcesses(processes.filter(p => p.id !== id));
        toast.success("Processus supprimé");
      } else {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* En-tête du dashboard avec statistiques */}
      <BiaDashboardHeader processes={processes} />

      {/* Navigation par onglets - Cyber Redesign */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-[var(--bg-tertiary)]/50 p-1 rounded-[12px] border border-[var(--border)] mb-8">
          {[
            { value: "overview", icon: LayoutDashboard, label: "Vue d'ensemble" },
            { value: "processes", icon: List, label: "Processus" },
            { value: "analytics", icon: BarChart3, label: "Analyses" },
            { value: "reports", icon: FileText, label: "Rapports" },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-2 px-6 py-2.5 rounded-[8px] data-[state=active]:bg-[var(--bg-surface)] data-[state=active]:text-[var(--text-primary)] data-[state=active]:shadow-sm transition-all duration-300 font-bold"
            >
              <tab.icon className="h-4 w-4" />
              <span className="tracking-tight">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <BiaOverview processes={processes} />
        </TabsContent>

        <TabsContent value="processes" className="mt-0">
          <Card className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[16px] shadow-sm">
            <CardHeader className="border-b border-[var(--border)] pb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <CardTitle className="text-2xl font-black text-[var(--text-primary)]">
                    Catalogue des Processus
                  </CardTitle>
                  <p className="text-sm text-[var(--text-muted)] font-bold mt-1">
                    Système de gestion des actifs critiques ({filteredProcesses.length} entités)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={handleRefresh} className="hover:bg-[var(--bg-hover)] rounded-[12px] text-[var(--text-secondary)]">
                    <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                    Refresh
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleExport} className="hover:bg-[var(--bg-hover)] rounded-[12px] text-[var(--text-secondary)]">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Link href="/bia/processes/new">
                    <Button size="sm" className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-[12px] font-bold">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Nouveau Processus
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              {/* Filtres - Premium Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
                <div className="lg:col-span-2 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--accent)]" />
                  <Input
                    type="search"
                    placeholder="Filtrer par nom, département..."
                    className="bg-[var(--bg-tertiary)]/50 border-[var(--border)] pl-12 h-12 rounded-[12px] text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select value={criticality} onValueChange={setCriticality}>
                  <SelectTrigger className="bg-[var(--bg-tertiary)]/50 border-[var(--border)] h-12 rounded-[12px] text-sm">
                    <SelectValue placeholder="Criticité" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--bg-surface)] border-[var(--border)] rounded-[12px]">
                    <SelectItem value="all">Tout</SelectItem>
                    <SelectItem value="critical">🔴 Critique</SelectItem>
                    <SelectItem value="high">🟠 Élevé</SelectItem>
                    <SelectItem value="medium">🟡 Moyen</SelectItem>
                    <SelectItem value="low">🟢 Faible</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className="bg-[var(--bg-tertiary)]/50 border-[var(--border)] h-12 rounded-[12px] text-sm">
                    <SelectValue placeholder="Département" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--bg-surface)] border-[var(--border)] rounded-[12px]">
                    <SelectItem value="all">Tous Départements</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button variant={viewMode === "list" ? "default" : "ghost"} size="icon" className="h-12 w-12 rounded-xl" onClick={() => setViewMode("list")}>
                    <List className="h-5 w-5" />
                  </Button>
                  <Button variant={viewMode === "grid" ? "default" : "ghost"} size="icon" className="h-12 w-12 rounded-xl" onClick={() => setViewMode("grid")}>
                    <LayoutGrid className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Data Table / Grid Redesign */}
              {isLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl bg-white/5" />)}
                </div>
              ) : filteredProcesses.length > 0 ? (
                viewMode === "list" ? (
                  <div className="rounded-[16px] border border-[var(--border)] overflow-hidden bg-[var(--bg-surface)]">
                    <Table>
                      <TableHeader className="bg-[var(--bg-tertiary)]/30">
                        <TableRow className="border-[var(--border)] hover:bg-transparent">
                          <TableHead className="font-bold py-6 px-6">Identité</TableHead>
                          <TableHead className="font-bold">Structure</TableHead>
                          <TableHead className="font-bold text-center">Criticité</TableHead>
                          <TableHead className="font-bold text-center">RTO/RPO</TableHead>
                          <TableHead className="text-right px-6">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProcesses.map((process) => (
                          <TableRow key={process.id} className="border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors group">
                            <TableCell className="py-6 px-6">
                              <Link href={`/bia/processes/${process.id}`} className="block group-hover:translate-x-1 transition-transform">
                                <p className="font-black text-foreground">{process.name}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 italic">{process.id.slice(-8)}</p>
                              </Link>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-xs font-medium">
                                  <Building2 className="h-3 w-3 text-primary" /> {process.department}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                  <MapPin className="h-3 w-3" /> {process.location}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm",
                                process.criticality === 'critical' ? "bg-red-500/20 text-red-400 border-red-500/30" :
                                process.criticality === 'high' ? "bg-orange-500/20 text-orange-400 border-orange-500/30" :
                                process.criticality === 'medium' ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                                "bg-green-500/20 text-green-400 border-green-500/30"
                              )}>
                                {process.criticality}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className="font-mono text-xs font-bold text-primary">{process.rto}h</span>
                                <span className="font-mono text-[10px] text-muted-foreground">{process.rpo}h</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right px-6">
                              <div className="flex justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                                <ImpactAnalysisButton processData={process} />
                                <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-xl hover:bg-primary/20 hover:text-primary">
                                  <Link href={`/bia/processes/${process.id}`}><FileText className="h-4 w-4" /></Link>
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(process.id)} className="h-9 w-9 rounded-xl hover:bg-red-500/20 hover:text-red-400">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProcesses.map((process) => (
                      <Card key={process.id} className="bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-all duration-300 group overflow-hidden rounded-[16px] shadow-sm">
                        <div className={cn("h-1 w-full", 
                          process.criticality === 'critical' ? "bg-red-500" :
                          process.criticality === 'high' ? "bg-orange-500" :
                          process.criticality === 'medium' ? "bg-yellow-500" : "bg-green-500"
                        )} />
                        <CardHeader className="pb-4 pt-6">
                          <div className="flex justify-between items-start gap-4">
                            <Link href={`/bia/processes/${process.id}`} className="group-hover:text-primary transition-colors">
                              <CardTitle className="text-lg font-black leading-tight">{process.name}</CardTitle>
                            </Link>
                            <Badge className="bg-white/5 text-[10px] uppercase font-bold tracking-tighter">
                              {process.criticality}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-2 italic">
                            {process.description || "Aucune description fournie."}
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[var(--bg-tertiary)]/50 p-3 rounded-[12px] border border-[var(--border)]">
                              <p className="text-[10px] text-[var(--text-muted)] uppercase font-black">Structure</p>
                              <p className="text-xs font-bold mt-1 truncate text-[var(--text-primary)]">{process.department}</p>
                            </div>
                            <div className="bg-[var(--bg-tertiary)]/50 p-3 rounded-[12px] border border-[var(--border)]">
                              <p className="text-[10px] text-[var(--text-muted)] uppercase font-black">Temporalité</p>
                              <p className="text-xs font-bold mt-1 font-mono text-[var(--accent)]">RTO: {process.rto}h</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <ImpactAnalysisButton processData={process} />
                            <Button variant="ghost" size="sm" className="flex-1 rounded-xl bg-white/5 hover:bg-white/10" asChild>
                              <Link href={`/bia/processes/${process.id}`}>Configurer</Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center py-20 glass-card rounded-3xl border-dashed">
                  <Building2 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
                  <h3 className="text-2xl font-black">Aucune entité détectée</h3>
                  <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                    Le catalogue est actuellement vide pour les critères sélectionnés.
                  </p>
                  <Button className="button-premium mt-8" asChild>
                    <Link href="/bia/processes/new">Initialiser un Processus</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-0">
          <Card className="glass-card p-20 text-center">
            <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-black">Analytique Avancée</h3>
            <p className="text-muted-foreground mt-2">Module de projection IA en cours de calibration.</p>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-0">
          <BiaReportsList processes={processes} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
