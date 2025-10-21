"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Factory,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
  Lightbulb,
} from "lucide-react";

interface Impact {
  type?: string;
  description?: string;
  severity?: string;
  sourceReport?: string;
}

interface Spof {
  name?: string;
  description?: string;
  risk?: string;
  mitigation?: string;
  sourceReport?: string;
}

interface Dependency {
  name?: string;
  type?: string;
  description?: string;
  sourceReport?: string;
}

interface ContinuityItem {
  name?: string;
  title?: string;
  description?: string;
  sourceReport?: string;
}

interface ContinuityNeeds {
  equipment: ContinuityItem[];
  skills: ContinuityItem[];
  technology: ContinuityItem[];
  suppliers: ContinuityItem[];
  data: ContinuityItem[];
  facilities: ContinuityItem[];
  regulations: ContinuityItem[];
}

interface ReportDetail {
  id: string;
  name: string;
  criticality: string;
  continuityLevel: string;
}

interface ConsolidatedAnalysis {
  usineName: string;
  totalReports: number;
  totalProcesses: number;
  analysisDate: string;
  reportDetails: ReportDetail[];
  metrics: {
    rto: number;
    mtpd: number;
    mbco: number;
    description: string;
  };
  criticality: {
    level: string;
    score: number;
    factors: string[];
  };
  continuityLevel: {
    level: string;
    score: number;
    description: string;
  };
  impacts: Impact[];
  spof: Spof[];
  dependencies: Dependency[];
  continuityNeeds: ContinuityNeeds;
  recommendations: string[];
}

export default function FactoryAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const category = decodeURIComponent(params.category as string);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<ConsolidatedAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/bia/factories/${encodeURIComponent(category)}/analyze`,
        { method: "POST" }
      );

      if (!response.ok) {
        throw new Error("Erreur lors du chargement de l'analyse");
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de charger l'analyse de l'usine");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-lg text-muted-foreground">
              Analyse de l&apos;usine en cours...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Erreur</h3>
            <p className="text-muted-foreground mb-4">
              {error || "Aucune analyse disponible"}
            </p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getCriticalityColor = (level: string) => {
    switch (level) {
      case "critique":
        return "bg-red-500";
      case "élevé":
        return "bg-orange-500";
      case "moyen":
        return "bg-yellow-500";
      default:
        return "bg-green-500";
    }
  };

  const getContinuityColor = (level: string) => {
    switch (level) {
      case "vert":
        return "bg-green-500";
      case "jaune":
        return "bg-yellow-500";
      default:
        return "bg-red-500";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Factory className="h-8 w-8 text-primary" />
              Analyse Consolidée : {category}
            </h1>
            <p className="text-muted-foreground mt-1">
              {analysis.totalReports} rapport
              {analysis.totalReports > 1 ? "s" : ""} analysé
              {analysis.totalReports > 1 ? "s" : ""} • {analysis.totalProcesses}{" "}
              processus
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          {new Date(analysis.analysisDate).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Badge>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              RTO Moyen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">
                {analysis.metrics.rto}h
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Criticité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${getCriticalityColor(
                  analysis.criticality.level
                )}`}
              />
              <span className="text-2xl font-bold capitalize">
                {analysis.criticality.level}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Score: {analysis.criticality.score}/10
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Niveau de Continuité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${getContinuityColor(
                  analysis.continuityLevel.level
                )}`}
              />
              <span className="text-2xl font-bold capitalize">
                {analysis.continuityLevel.level}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Score: {analysis.continuityLevel.score}/10
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Points Critiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span className="text-2xl font-bold">{analysis.spof.length}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              SPOF identifiés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rapports inclus */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Rapports Inclus ({analysis.reportDetails.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {analysis.reportDetails.map((report: ReportDetail) => (
              <Card key={report.id} className="border">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">{report.name}</h4>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {report.criticality}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {report.continuityLevel}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommandations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Recommandations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analysis.recommendations.map((rec: string, idx: number) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
              >
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{rec}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Onglets de détails */}
      <Tabs defaultValue="impacts" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="impacts">
            Impacts ({analysis.impacts.length})
          </TabsTrigger>
          <TabsTrigger value="spof">SPOF ({analysis.spof.length})</TabsTrigger>
          <TabsTrigger value="dependencies">
            Dépendances ({analysis.dependencies.length})
          </TabsTrigger>
          <TabsTrigger value="continuity">Besoins de Continuité</TabsTrigger>
        </TabsList>

        <TabsContent value="impacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Impacts Identifiés</CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.impacts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Aucun impact identifié
                </p>
              ) : (
                <div className="space-y-3">
                  {analysis.impacts.map((impact: Impact, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">
                          {impact.type || "Impact"}
                        </h4>
                        <Badge
                          variant={
                            impact.severity === "high"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {impact.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {impact.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Source: {impact.sourceReport}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spof" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Points de Défaillance Uniques (SPOF)</CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.spof.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Aucun SPOF identifié
                </p>
              ) : (
                <div className="space-y-3">
                  {analysis.spof.map((spof: Spof, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{spof.name || "SPOF"}</h4>
                        <Badge variant="destructive">
                          {spof.risk || "Élevé"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {spof.description}
                      </p>
                      {spof.mitigation && (
                        <p className="text-sm text-green-600 mb-2">
                          <strong>Mitigation:</strong> {spof.mitigation}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Source: {spof.sourceReport}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dependencies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dépendances</CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.dependencies.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Aucune dépendance identifiée
                </p>
              ) : (
                <div className="space-y-3">
                  {analysis.dependencies.map((dep: Dependency, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">
                          {dep.name || "Dépendance"}
                        </h4>
                        <Badge variant="outline">{dep.type || "Interne"}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {dep.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Source: {dep.sourceReport}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="continuity" className="space-y-4">
          {Object.entries(analysis.continuityNeeds).map(
            ([category, items]: [string, ContinuityItem[]]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="capitalize">
                    {category} ({items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {items.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Aucun élément dans cette catégorie
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {items.map((item: ContinuityItem, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <h5 className="font-medium mb-1">
                            {item.name || item.title}
                          </h5>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mb-1">
                              {item.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Source: {item.sourceReport}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
