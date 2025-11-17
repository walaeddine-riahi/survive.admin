"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  FileText,
  Search,
  Loader2,
  Factory as FactoryIcon,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createBiaReportFromProcess } from "@/actions/bia/bia-report-actions";

type Process = {
  id: string;
  name: string;
  description: string | null;
  department: string;
  criticality: string;
  rto: number;
  mtpd: number;
  factory?: {
    id: string;
    name: string;
  } | null;
  createdAt: Date;
};

type Factory = {
  id: string;
  name: string;
  code: string;
};

interface ProcessReportGeneratorProps {
  factories: Factory[];
}

export function ProcessReportGenerator({
  factories,
}: ProcessReportGeneratorProps) {
  const router = useRouter();
  const [processes, setProcesses] = useState<Process[]>([]);
  const [filteredProcesses, setFilteredProcesses] = useState<Process[]>([]);
  const [selectedProcessId, setSelectedProcessId] = useState<string>("");
  const [selectedFactoryId, setSelectedFactoryId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportName, setReportName] = useState("");
  const [reportDescription, setReportDescription] = useState("");

  // Charger les processus
  useEffect(() => {
    async function fetchProcesses() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/bia/processes");
        if (!response.ok)
          throw new Error("Erreur lors du chargement des processus");

        const data = await response.json();
        setProcesses(data.processes || []);
        setFilteredProcesses(data.processes || []);
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Impossible de charger les processus");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProcesses();
  }, []);

  // Filtrer les processus
  useEffect(() => {
    let filtered = processes;

    // Filtrer par usine
    if (selectedFactoryId && selectedFactoryId !== "all") {
      filtered = filtered.filter((p) => p.factory?.id === selectedFactoryId);
    }

    // Filtrer par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.department.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    setFilteredProcesses(filtered);
  }, [processes, selectedFactoryId, searchQuery]);

  // Mettre à jour le nom du rapport automatiquement
  useEffect(() => {
    if (selectedProcessId) {
      const selectedProcess = processes.find((p) => p.id === selectedProcessId);
      if (selectedProcess) {
        setReportName(`Rapport BIA - ${selectedProcess.name}`);
        setReportDescription(
          `Rapport d'analyse d'impact métier pour le processus ${selectedProcess.name} (${selectedProcess.department})`
        );
      }
    }
  }, [selectedProcessId, processes]);

  const getCriticalityColor = (criticality: string) => {
    switch (criticality.toLowerCase()) {
      case "critical":
        return "destructive";
      case "high":
        return "default";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  const getCriticalityLabel = (criticality: string) => {
    switch (criticality.toLowerCase()) {
      case "critical":
        return "Critique";
      case "high":
        return "Élevée";
      case "medium":
        return "Moyenne";
      case "low":
        return "Faible";
      default:
        return criticality;
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedProcessId) {
      toast.error("Veuillez sélectionner un processus");
      return;
    }

    if (!reportName.trim()) {
      toast.error("Veuillez saisir un nom pour le rapport");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await createBiaReportFromProcess(
        selectedProcessId,
        reportName,
        reportDescription
      );

      if (result.success && result.data) {
        toast.success("Rapport généré avec succès !");
        router.push(`/bia/reports/${result.data.id}`);
      } else {
        toast.error(result.error || "Erreur lors de la génération du rapport");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue lors de la génération du rapport");
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedProcess = processes.find((p) => p.id === selectedProcessId);

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Rechercher un processus
          </CardTitle>
          <CardDescription>
            Sélectionnez un processus pour générer son rapport BIA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="factory-filter">Usine</Label>
              <Select
                value={selectedFactoryId}
                onValueChange={setSelectedFactoryId}
              >
                <SelectTrigger id="factory-filter">
                  <SelectValue placeholder="Toutes les usines" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les usines</SelectItem>
                  {factories.map((factory) => (
                    <SelectItem key={factory.id} value={factory.id}>
                      {factory.name} ({factory.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search">Recherche</Label>
              <Input
                id="search"
                placeholder="Nom, département..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            {filteredProcesses.length} processus trouvé
            {filteredProcesses.length > 1 ? "s" : ""}
          </div>
        </CardContent>
      </Card>

      {/* Liste des processus */}
      <Card>
        <CardHeader>
          <CardTitle>Processus disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredProcesses.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <AlertCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Aucun processus trouvé</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredProcesses.map((process) => (
                <div
                  key={process.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedProcessId === process.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-accent"
                  }`}
                  onClick={() => setSelectedProcessId(process.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{process.name}</h3>
                        {selectedProcessId === process.id && (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      {process.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {process.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{process.department}</span>
                        {process.factory && (
                          <>
                            <span>•</span>
                            <FactoryIcon className="h-3 w-3" />
                            <span>{process.factory.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={getCriticalityColor(process.criticality)}>
                        {getCriticalityLabel(process.criticality)}
                      </Badge>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        RTO: {process.rto}h
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration du rapport */}
      {selectedProcess && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Générer le rapport
            </CardTitle>
            <CardDescription>
              Configuration du rapport pour : {selectedProcess.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="report-name">Nom du rapport</Label>
              <Input
                id="report-name"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="Ex: Rapport BIA - Production Ligne A"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-description">
                Description (optionnelle)
              </Label>
              <Input
                id="report-description"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Décrivez brièvement le contenu du rapport"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <p>Le rapport inclura :</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Analyse d&apos;impact métier</li>
                  <li>Criticité et métriques (RTO, MTPD, RPO)</li>
                  <li>Dépendances et ressources</li>
                  <li>Recommandations de continuité</li>
                </ul>
              </div>

              <Button
                onClick={handleGenerateReport}
                disabled={isGenerating || !reportName.trim()}
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Générer le rapport
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
