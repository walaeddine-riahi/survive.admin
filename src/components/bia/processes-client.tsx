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
} from "lucide-react";
import Link from "next/link";
import { ImpactAnalysisButton } from "@/components/bia/impact-analysis-button";
import { Skeleton } from "@/components/ui/skeleton";
import { FactorySelect } from "@/components/bia/factory-select";
import { BiaDashboardHeader } from "@/components/bia/bia-dashboard-header";
import { BiaOverview } from "@/components/bia/bia-overview";

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
  const [processes] = useState<Process[]>(initialProcesses);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [search, setSearch] = useState("");
  const [criticality, setCriticality] = useState("all");
  const [department, setDepartment] = useState("all");
  const [factoryId, setFactoryId] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  // Filtrer les processus
  const filteredProcesses = processes.filter((process) => {
    const searchTerm = search.toLowerCase();
    const matchesSearch =
      !search ||
      process.name.toLowerCase().includes(searchTerm) ||
      (process.department &&
        process.department.toLowerCase().includes(searchTerm)) ||
      (process.location && process.location.toLowerCase().includes(searchTerm));

    const matchesCriticality =
      criticality === "all" || process.criticality === criticality;
    const matchesDepartment =
      department === "all" || process.department === department;
    const matchesFactory =
      factoryId === "all" || process.factoryId === factoryId;

    return (
      matchesSearch && matchesCriticality && matchesDepartment && matchesFactory
    );
  });

  // Obtenir la liste unique des départements
  const departments = Array.from(
    new Set(processes.map((p) => p.department))
  ).sort();

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simuler un refresh
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleExport = () => {
    // Logique d'export CSV
    const csv = [
      ["Nom", "Département", "Localisation", "Criticité", "RTO", "RPO", "MTPD"],
      ...filteredProcesses.map((p) => [
        p.name,
        p.department,
        p.location,
        p.criticality,
        p.rto.toString(),
        p.rpo.toString(),
        p.mtpd.toString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `processes-bia-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* En-tête du dashboard avec statistiques */}
      <BiaDashboardHeader processes={processes} />

      {/* Navigation par onglets */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex bg-muted/50 p-1">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <LayoutDashboard className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Vue d&apos;ensemble</span>
            <span className="sm:hidden">Vue</span>
          </TabsTrigger>
          <TabsTrigger
            value="processes"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <List className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Processus</span>
            <span className="sm:hidden">Liste</span>
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Analyses</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <FileText className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Rapports</span>
            <span className="sm:hidden">Docs</span>
          </TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="mt-6">
          <BiaOverview processes={processes} />
        </TabsContent>

        {/* Liste des processus */}
        <TabsContent value="processes" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle className="text-xl">Processus BIA</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filteredProcesses.length} processus trouvé(s)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isLoading}
                  >
                    <RefreshCw
                      className={`h-4 w-4 mr-2 ${
                        isLoading ? "animate-spin" : ""
                      }`}
                    />
                    Actualiser
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    disabled={filteredProcesses.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exporter
                  </Button>
                  <Link href="/bia/processes/new">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-blue-500 to-indigo-600"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Nouveau processus
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filtres */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Rechercher par nom, département, localisation..."
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <FactorySelect
                  factories={factories}
                  value={factoryId}
                  onValueChange={setFactoryId}
                  className="w-full md:w-[200px]"
                />
                <Select value={criticality} onValueChange={setCriticality}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Criticité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les criticités</SelectItem>
                    <SelectItem value="critical">Critique</SelectItem>
                    <SelectItem value="high">Élevé</SelectItem>
                    <SelectItem value="medium">Moyen</SelectItem>
                    <SelectItem value="low">Faible</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <Building2 className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Département" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les départements</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Contenu */}
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : filteredProcesses.length > 0 ? (
                <>
                  {viewMode === "list" ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Processus</TableHead>
                            <TableHead>Département</TableHead>
                            <TableHead>Localisation</TableHead>
                            <TableHead>Criticité</TableHead>
                            <TableHead>RTO</TableHead>
                            <TableHead>RPO</TableHead>
                            <TableHead>Dernière MAJ</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredProcesses.map((process) => (
                            <TableRow
                              key={process.id}
                              className="hover:bg-muted/50"
                            >
                              <TableCell className="font-medium">
                                <Link
                                  href={`/bia/processes/${process.id}`}
                                  className="hover:text-blue-600 hover:underline flex flex-col"
                                >
                                  <span>{process.name}</span>
                                  {process.description && (
                                    <span className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                      {process.description}
                                    </span>
                                  )}
                                </Link>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4 text-muted-foreground" />
                                  {process.department}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  {process.location}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    criticalityConfig[process.criticality].color
                                  }
                                >
                                  {criticalityConfig[process.criticality].icon}{" "}
                                  {criticalityConfig[process.criticality].label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span className="font-mono text-sm">
                                    {process.rto}h
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="font-mono text-sm">
                                  {process.rpo}h
                                </span>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(process.updatedAt).toLocaleDateString(
                                  "fr-FR"
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <ImpactAnalysisButton processData={process} />
                                  <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/bia/processes/${process.id}`}>
                                      Modifier
                                    </Link>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredProcesses.map((process) => (
                        <Card
                          key={process.id}
                          className="hover:shadow-lg transition-shadow duration-200 border-l-4"
                          style={{
                            borderLeftColor:
                              process.criticality === "critical"
                                ? "#dc2626"
                                : process.criticality === "high"
                                ? "#ea580c"
                                : process.criticality === "medium"
                                ? "#ca8a04"
                                : "#16a34a",
                          }}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <Link
                                href={`/bia/processes/${process.id}`}
                                className="hover:text-blue-600 flex-1"
                              >
                                <CardTitle className="text-lg line-clamp-2">
                                  {process.name}
                                </CardTitle>
                              </Link>
                              <Badge
                                variant="outline"
                                className={`${
                                  criticalityConfig[process.criticality].color
                                } ml-2`}
                              >
                                {criticalityConfig[process.criticality].icon}
                              </Badge>
                            </div>
                            {process.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                                {process.description}
                              </p>
                            )}
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span>{process.department}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{process.location}</span>
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    RTO:
                                  </span>
                                  <span className="font-mono font-medium">
                                    {process.rto}h
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-muted-foreground">
                                    RPO:
                                  </span>
                                  <span className="font-mono font-medium">
                                    {process.rpo}h
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <ImpactAnalysisButton processData={process} />
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                asChild
                              >
                                <Link href={`/bia/processes/${process.id}`}>
                                  Modifier
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium">
                    Aucun processus trouvé
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    {search || criticality !== "all" || department !== "all"
                      ? "Aucun processus ne correspond à vos critères de recherche."
                      : "Commencez par créer votre premier processus BIA."}
                  </p>
                  {!search && criticality === "all" && department === "all" && (
                    <Button className="mt-4" asChild>
                      <Link href="/bia/processes/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Créer un processus
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Analytics */}
        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Analyses et Graphiques</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-12">
                Tableaux de bord analytiques - En développement
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Rapports */}
        <TabsContent value="reports" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Rapports BIA</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-12">
                Gestion des rapports - En développement
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
