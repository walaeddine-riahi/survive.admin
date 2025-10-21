import { getSharedBiaReport } from "@/actions/bia/bia-report-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileText,
  Calendar,
  User,
  BarChart3,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { notFound } from "next/navigation";

// Interfaces pour typer les données du rapport
interface RiskItem {
  type: string;
  severity: string;
  description: string;
  processes?: string[];
}

interface GlobalContinuityLevel {
  level: string;
  score: number;
}

interface AverageMetrics {
  rto: number;
  rpo: number;
}

interface Criticality {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface ReportSummary {
  totalProcesses: number;
  globalContinuityLevel?: GlobalContinuityLevel;
  averageMetrics?: AverageMetrics;
  departments?: Record<string, number>;
  criticality?: Criticality;
  processesNeedingAttention?: number;
}

interface ReportData {
  summary?: ReportSummary;
  risks?: RiskItem[];
  recommendations?: string[];
}

interface SharedReportPageProps {
  params: {
    token: string;
  };
}

export default async function SharedReportPage({
  params,
}: SharedReportPageProps) {
  const result = await getSharedBiaReport(params.token);

  if (!result.success || !result.data) {
    notFound();
  }

  const report = result.data;
  const reportData = report.reportData as ReportData; // Type assertion avec notre interface

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getContinuityColor = (level: number) => {
    if (level >= 85) return "text-green-600";
    if (level >= 70) return "text-blue-600";
    if (level >= 55) return "text-orange-600";
    return "text-red-600";
  };

  const handleDownload = () => {
    if (report.format === "JSON") {
      const jsonData = JSON.stringify(report.reportData, null, 2);
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report.name}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-6 w-6 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">
              Rapport BIA Partagé
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{report.name}</h1>
              {report.description && (
                <p className="text-muted-foreground">{report.description}</p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {report.format}
              </Badge>
              <Button
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Télécharger
              </Button>
            </div>
          </div>

          {/* Métadonnées */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {report.author.firstName && report.author.lastName
                ? `${report.author.firstName} ${report.author.lastName}`
                : "Auteur inconnu"}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Généré{" "}
              {formatDistanceToNow(new Date(report.createdAt), {
                addSuffix: true,
                locale: fr,
              })}
            </div>
            <div className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              {report.downloadCount} téléchargements
            </div>
            <div>{formatFileSize(report.fileSize)}</div>
          </div>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Processus
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.totalProcesses}</div>
              <p className="text-xs text-muted-foreground">
                Processus analysés
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Niveau de Continuité
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${getContinuityColor(
                  report.continuityLevel
                )}`}
              >
                {report.continuityLevel}/100
              </div>
              <p
                className={`text-xs font-medium ${getContinuityColor(
                  report.continuityLevel
                )}`}
              >
                {report.continuityLevelText}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Risques Majeurs
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {report.riskCount}
              </div>
              <p className="text-xs text-muted-foreground">Identifiés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Recommandations
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {report.recommendationCount}
              </div>
              <p className="text-xs text-muted-foreground">Générées</p>
            </CardContent>
          </Card>
        </div>

        {/* Contenu du rapport */}
        {reportData && (
          <div className="space-y-6">
            {/* Résumé exécutif */}
            {reportData.summary && (
              <Card>
                <CardHeader>
                  <CardTitle>Résumé Exécutif</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">
                        Situation Actuelle :
                      </h4>
                      <ul className="space-y-1 text-sm">
                        <li>
                          • {reportData.summary.totalProcesses} processus
                          analysés
                        </li>
                        <li>
                          • Niveau de continuité :{" "}
                          {reportData.summary.globalContinuityLevel?.level} (
                          {reportData.summary.globalContinuityLevel?.score}/100)
                        </li>
                        <li>
                          • RTO moyen : {reportData.summary.averageMetrics?.rto}
                          h
                        </li>
                        <li>
                          • RPO moyen : {reportData.summary.averageMetrics?.rpo}
                          h
                        </li>
                        <li>
                          •{" "}
                          {
                            Object.keys(reportData.summary.departments || {})
                              .length
                          }{" "}
                          départements couverts
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Criticité :</h4>
                      <ul className="space-y-1 text-sm">
                        <li>
                          • Critique :{" "}
                          {reportData.summary.criticality?.critical || 0}
                        </li>
                        <li>
                          • Élevée : {reportData.summary.criticality?.high || 0}
                        </li>
                        <li>
                          • Moyenne :{" "}
                          {reportData.summary.criticality?.medium || 0}
                        </li>
                        <li>
                          • Faible : {reportData.summary.criticality?.low || 0}
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">
                        Actions prioritaires :
                      </h4>
                      <ul className="space-y-1 text-sm">
                        <li>
                          • {reportData.summary.processesNeedingAttention || 0}{" "}
                          processus nécessitent attention
                        </li>
                        <li>• {report.riskCount} risques majeurs à traiter</li>
                        <li>
                          • {report.recommendationCount} recommandations à
                          appliquer
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Risques majeurs */}
            {reportData.risks && reportData.risks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Risques Majeurs Identifiés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.risks.map((risk: RiskItem, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-sm">{risk.type}</h4>
                          <Badge
                            className={
                              risk.severity === "Critique"
                                ? "bg-red-100 text-red-800"
                                : risk.severity === "Élevé"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {risk.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {risk.description}
                        </p>
                        {risk.processes && risk.processes.length > 0 && (
                          <div>
                            <p className="text-xs font-medium mb-1">
                              Processus concernés :
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {risk.processes
                                .slice(0, 5)
                                .map((processName: string, idx: number) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {processName}
                                  </Badge>
                                ))}
                              {risk.processes.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{risk.processes.length - 5} autres
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommandations */}
            {reportData.recommendations &&
              reportData.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      Recommandations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {reportData.recommendations.map(
                        (recommendation: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"
                          >
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                              {index + 1}
                            </div>
                            <p className="text-sm text-blue-800">
                              {recommendation}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>
        )}

        {/* Pied de page */}
        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground">
            Ce rapport a été généré par la plateforme S.U.R.V.I.V.E. Resilience
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Données exportées le{" "}
            {new Date(report.createdAt).toLocaleDateString("fr-FR")}
          </p>
        </div>
      </div>
    </div>
  );
}
