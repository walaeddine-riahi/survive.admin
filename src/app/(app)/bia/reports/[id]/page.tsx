"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Download,
  FileText,
  Calendar,
  User,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  ArrowLeft,
  Share2,
  Brain,
  Clock,
  Shield,
  Network,
  Zap,
  Package,
  Loader2,
  Eye,
  ExternalLink,
  Edit,
  Check,
  X,
  Tag,
} from "lucide-react";
import BiaAiAnalyzer, { type BiaAnalysisResult } from "@/lib/bia-ai-analyzer";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BiaAnalysisForm } from "@/components/bia-analysis-form";
import { ReportAddProcessDialog } from "@/components/bia/report-add-process-dialog";

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

interface RecommendationItem {
  priority: "high" | "medium" | "low";
  category: string;
  title: string;
  description: string;
}

interface ReportData {
  summary?: ReportSummary;
  risks?: RiskItem[];
  recommendations?: (string | RecommendationItem)[];
}

interface ReportPageProps {
  params: {
    id: string;
  };
}

// Typage minimal pour `report` basé sur l'utilisation dans la page
interface Report {
  id: string;
  name: string;
  description?: string;
  format: string;
  status: string;
  tags?: string[];
  category?: string;
  author: { firstName?: string; lastName?: string };
  createdAt: string;
  updatedAt?: string;
  downloadCount?: number;
  fileSize?: number;
  totalProcesses?: number;
  continuityLevel?: number;
  continuityLevelText?: string;
  riskCount?: number;
  recommendationCount?: number;
  shareToken?: string;
  reportData?: ReportData | string;
}

export default function ReportPage({ params }: ReportPageProps) {
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<BiaAnalysisResult | null>(null);
  const [localAnalysis, setLocalAnalysis] = useState<BiaAnalysisResult | null>(
    null
  );
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisType, setAnalysisType] = useState<"ai" | "local" | null>(null);
  const [showRawContent, setShowRawContent] = useState(false);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualAnalysis, setManualAnalysis] =
    useState<BiaAnalysisResult | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [categoryValue, setCategoryValue] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const resolvedParams = await params;
        const response = await fetch(`/api/bia/report/${resolvedParams.id}`);
        const result = await response.json();

        if (result.success && result.data) {
          setReport(result.data);

          // Charger l'analyse sauvegardée si elle existe
          const analysisResponse = await fetch(
            `/api/bia/reports/${resolvedParams.id}/analysis`
          );
          console.log(
            "📡 Status récupération analyse:",
            analysisResponse.status
          );

          if (analysisResponse.ok) {
            const savedAnalysis = await analysisResponse.json();
            console.log("📥 Analyse sauvegardée chargée:", savedAnalysis);
            console.log("📊 Type d'analyse:", typeof savedAnalysis);
            console.log("📊 Clés de l'analyse:", Object.keys(savedAnalysis));

            setManualAnalysis(savedAnalysis);
            setAnalysisType("ai"); // Afficher l'analyse sauvegardée
            console.log("✅ État mis à jour - manualAnalysis défini");
          } else if (analysisResponse.status === 404) {
            console.log("ℹ️ Aucune analyse sauvegardée trouvée (404)");
          } else {
            console.error(
              "❌ Erreur récupération analyse:",
              analysisResponse.status
            );
          }
        } else {
          setError("Rapport non trouvé");
        }
      } catch (error) {
        console.error(error);
        setError("Erreur lors du chargement du rapport");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [params]);

  const analyzeWithAI = async (reportId: string) => {
    setAnalysisLoading(true);
    setAnalysisError(null);
    setAnalysisType("ai");

    try {
      const response = await fetch(`/api/bia/report/${reportId}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.success && result.data) {
        setAiAnalysis(result.data.analysis);
      } else {
        setAnalysisError(result.error || "Erreur lors de l'analyse IA");
      }
    } catch (err) {
      setAnalysisError("Erreur lors de l'analyse IA");
      console.error("Erreur analyse IA:", err);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const analyzeLocally = () => {
    if (!report?.reportData) {
      setAnalysisError("Aucune donnée de rapport disponible");
      return;
    }

    setAnalysisLoading(true);
    setAnalysisError(null);
    setAnalysisType("local");

    try {
      // Analyse heuristique locale (côté client)
      const analyzer = BiaAiAnalyzer.getInstance();
      const result = analyzer.analyzeReportLocal(report.reportData);
      setLocalAnalysis(result);
    } catch (err) {
      setAnalysisError("Erreur lors de l'analyse locale");
      console.error("Erreur analyse locale:", err);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleSaveAnalysis = async (analysisData: BiaAnalysisResult) => {
    setSaveLoading(true);
    try {
      // Convertir la date en string pour la sérialisation JSON
      const dataToSend = {
        ...analysisData,
        analysisDate:
          analysisData.analysisDate instanceof Date
            ? analysisData.analysisDate.toISOString()
            : analysisData.analysisDate,
      };

      console.log("💾 Envoi des données:", dataToSend);

      const response = await fetch(`/api/bia/reports/${report?.id}/analysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();
      console.log("📥 Réponse du serveur:", result);

      if (result.success) {
        setManualAnalysis(analysisData);
        setAiAnalysis(null); // Effacer les autres analyses
        setLocalAnalysis(null);
        setAnalysisType("ai"); // Afficher l'analyse sauvegardée
        setShowManualForm(false);
        alert("✅ Analyse enregistrée avec succès!");
      } else {
        alert("❌ Erreur lors de l'enregistrement: " + result.error);
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'enregistrement:", error);
      alert("❌ Erreur lors de l'enregistrement de l'analyse");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleEditAnalysis = () => {
    // Permettre l'édition de l'analyse actuelle
    const currentAnalysis =
      analysisType === "ai"
        ? aiAnalysis
        : analysisType === "local"
        ? localAnalysis
        : manualAnalysis;
    if (currentAnalysis) {
      setManualAnalysis(currentAnalysis);
      setShowManualForm(true);
    }
  };

  const handleUpdateCategory = async () => {
    if (!report) return;

    try {
      const response = await fetch(`/api/bia/reports/${report.id}/category`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ category: categoryValue }),
      });

      const result = await response.json();

      if (result.success) {
        setReport({ ...report, category: categoryValue });
        setIsEditingCategory(false);
        alert("✅ Usine mise à jour avec succès!");
      } else {
        alert("❌ Erreur: " + result.error);
      }
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour:", error);
      alert("❌ Erreur lors de la mise à jour de l'usine");
    }
  };

  const startEditingCategory = () => {
    setCategoryValue(report?.category || "");
    setIsEditingCategory(true);
  };

  const cancelEditingCategory = () => {
    setIsEditingCategory(false);
    setCategoryValue("");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">
              Chargement du rapport...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Erreur</h1>
          <p className="text-muted-foreground mb-4">
            {error || "Rapport non trouvé"}
          </p>
          <Button onClick={() => router.push("/bia/reports")} variant="outline">
            Retour aux rapports
          </Button>
        </div>
      </div>
    );
  }
  const reportData = report.reportData as ReportData;

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

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "published":
        return <Badge className="bg-green-100 text-green-800">Publié</Badge>;
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">Brouillon</Badge>;
      case "archived":
        return <Badge className="bg-red-100 text-red-800">Archivé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* En-tête avec navigation */}
      <div className="mb-8">
        <Link
          href="/bia/reports"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux rapports
        </Link>

        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-6 w-6 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">Rapport BIA</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{report.name}</h1>
              {getStatusBadge(report.status)}
            </div>
            {report.description && (
              <p className="text-muted-foreground mb-4">{report.description}</p>
            )}

            {/* Tags */}
            {report.tags && report.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {report.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Usine (Éditable) */}
            <div className="mb-4">
              {isEditingCategory ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <Input
                      value={categoryValue}
                      onChange={(e) => setCategoryValue(e.target.value)}
                      placeholder="Ex: Usine A, Usine B, Site principal..."
                      className="max-w-xs"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleUpdateCategory();
                        } else if (e.key === "Escape") {
                          cancelEditingCategory();
                        }
                      }}
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={handleUpdateCategory}
                      className="flex items-center gap-1"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEditingCategory}
                      className="flex items-center gap-1"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  {/* Suggestions rapides */}
                  <div className="flex flex-wrap gap-1 ml-6">
                    {[
                      "Usine A",
                      "Usine B",
                      "Site principal",
                      "Centre logistique",
                      "Siège social",
                      "Filiale",
                    ].map((suggestion) => (
                      <Badge
                        key={suggestion}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-xs"
                        onClick={() => setCategoryValue(suggestion)}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    Usine:{" "}
                    <span className="text-muted-foreground">
                      {report.category || "Non définie"}
                    </span>
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={startEditingCategory}
                    className="h-6 px-2 flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Modifier
                  </Button>
                </div>
              )}
            </div>

            {/* Métadonnées */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {report.author.firstName && report.author.lastName
                  ? `${report.author.firstName} ${report.author.lastName}`
                  : "Auteur inconnu"}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Créé{" "}
                {formatDistanceToNow(new Date(report.createdAt), {
                  addSuffix: true,
                  locale: fr,
                })}
              </div>
              {report.updatedAt && report.updatedAt !== report.createdAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Mis à jour{" "}
                  {formatDistanceToNow(new Date(report.updatedAt as string), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                {report.downloadCount} téléchargements
              </div>
              <div>{formatFileSize(report.fileSize ?? 0)}</div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {report.format}
              </Badge>
              <Button
                onClick={() => setShowDocumentViewer(!showDocumentViewer)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                {showDocumentViewer ? "Masquer" : "Visualiser"}
              </Button>
              <Button
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Télécharger
              </Button>
            </div>

            {report.shareToken && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Share2 className="h-3 w-3" />
                Lien partageable
              </Button>
            )}
          </div>
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
            <p className="text-xs text-muted-foreground">Processus analysés</p>
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
                report.continuityLevel ?? 0
              )}`}
            >
              {report.continuityLevel ?? 0}/100
            </div>
            <p
              className={`text-xs font-medium ${getContinuityColor(
                report.continuityLevel ?? 0
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

      {/* Section Gestion des Processus */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Processus inclus dans ce rapport
            </CardTitle>
            <ReportAddProcessDialog
              reportId={report.id}
              reportName={report.name}
              reportCategory={report.category}
              currentProcessIds={[]} // TODO: Charger les processus actuels du rapport
              onSuccess={() => {
                // Recharger la page pour afficher le nouveau processus
                window.location.reload();
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            <p className="mb-4">
              Ce rapport contient actuellement {report.totalProcesses}{" "}
              processus. Vous pouvez en ajouter d&apos;autres en cliquant sur le
              bouton ci-dessus.
            </p>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800">
                💡 <strong>Astuce:</strong> Les processus ajoutés hériteront
                automatiquement de l&apos;usine &quot;
                {report.category || "Non définie"}&quot; pour maintenir la
                cohérence.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visualiseur de Documents */}
      {showDocumentViewer && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-500" />
              Visualiseur de Document
              <Badge variant="outline" className="ml-auto">
                {report.format}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* PDF Viewer */}
              {report.format === "PDF" && (
                <div className="border rounded-lg overflow-hidden bg-gray-50">
                  <div className="bg-gray-100 px-4 py-2 border-b flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Aperçu PDF - {report.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        window.open(
                          `/api/bia/download/${report.id}?inline=true`,
                          "_blank"
                        )
                      }
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Ouvrir dans un nouvel onglet
                    </Button>
                  </div>
                  <div className="relative">
                    <iframe
                      src={`/api/bia/download/${report.id}?inline=true`}
                      className="w-full h-[600px] border-0"
                      title="PDF Viewer"
                    />
                  </div>
                </div>
              )}

              {/* Office Viewer pour Word/Excel/PowerPoint */}
              {(report.format === "DOCX" ||
                report.format === "DOC" ||
                report.format === "XLSX" ||
                report.format === "XLS" ||
                report.format === "PPTX" ||
                report.format === "PPT") && (
                <div className="border rounded-lg overflow-hidden bg-gray-50">
                  <div className="bg-gray-100 px-4 py-2 border-b flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Aperçu {report.format} - {report.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          window.open(
                            `https://docs.google.com/viewer?url=${encodeURIComponent(
                              window.location.origin +
                                "/api/bia/download/" +
                                report.id +
                                "?inline=true"
                            )}&embedded=true`,
                            "_blank"
                          )
                        }
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Google Viewer
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          window.open(
                            `/api/bia/download/${report.id}`,
                            "_blank"
                          )
                        }
                        className="flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        Télécharger
                      </Button>
                    </div>
                  </div>
                  <div className="relative">
                    <iframe
                      src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                        window.location.origin +
                          "/api/bia/download/" +
                          report.id +
                          "?inline=true"
                      )}&embedded=true`}
                      className="w-full h-[600px] border-0"
                      title="Document Viewer"
                      onError={(e) => {
                        console.log("Google viewer error, showing fallback");
                        const container = e.currentTarget.parentElement;
                        if (container) {
                          container.innerHTML = `
                            <div class="flex flex-col items-center justify-center h-[600px] text-gray-500">
                              <svg class="h-16 w-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <p class="text-lg font-medium mb-2">Aperçu non disponible</p>
                              <p class="text-sm mb-4 text-center max-w-md">Ce fichier ne peut pas être prévisualisé en ligne. Vous pouvez le télécharger pour l'ouvrir avec l'application appropriée.</p>
                              <button onclick="window.open('/api/bia/download/${report.id}', '_blank')" 
                                      class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2 transition-colors">
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Télécharger le fichier
                              </button>
                            </div>
                          `;
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Fallback pour autres formats */}
              {!["PDF", "DOCX", "DOC", "XLSX", "XLS", "PPTX", "PPT"].includes(
                report.format
              ) && (
                <div className="border rounded-lg overflow-hidden bg-gray-50">
                  <div className="bg-gray-100 px-4 py-2 border-b">
                    <span className="text-sm font-medium text-gray-700">
                      Fichier {report.format} - {report.name}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
                    <FileText className="h-16 w-16 mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">
                      Aperçu non disponible
                    </p>
                    <p className="text-sm mb-4">
                      Ce format de fichier ne prend pas en charge l&apos;aperçu
                      en ligne.
                    </p>
                    <Button
                      onClick={() =>
                        window.open(`/api/bia/download/${report.id}`, "_blank")
                      }
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Télécharger le fichier
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section Contenu du Rapport */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Contenu du Rapport
            </CardTitle>
            <Button
              onClick={() => setShowRawContent(!showRawContent)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              {showRawContent ? "Masquer le contenu" : "Afficher le contenu"}
            </Button>
          </div>
        </CardHeader>
        {showRawContent && (
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4 border">
              <h4 className="font-semibold text-sm mb-3 text-gray-700">
                Contenu du document:
              </h4>
              {report.reportData ? (
                <div className="bg-white p-4 rounded border">
                  {/* Affichage du contenu textuel uniquement */}
                  {typeof report.reportData === "string" ? (
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {report.reportData}
                      </div>
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      {/* Extraction et affichage du contenu textuel des objets */}
                      {Object.entries(report.reportData).map(
                        ([field, value]: [string, unknown], index: number) => {
                          // Filtrer pour afficher seulement le contenu textuel significatif
                          if (typeof value === "string" && value.length > 10) {
                            return (
                              <div key={index} className="mb-4">
                                <h5 className="font-medium text-sm text-gray-800 mb-2 border-b pb-1">
                                  {field
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (str: string) =>
                                      str.toUpperCase()
                                    )}
                                </h5>
                                <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                                  {value as string}
                                </div>
                              </div>
                            );
                          } else if (Array.isArray(value) && value.length > 0) {
                            return (
                              <div key={index} className="mb-4">
                                <h5 className="font-medium text-sm text-gray-800 mb-2 border-b pb-1">
                                  {field
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (str: string) =>
                                      str.toUpperCase()
                                    )}
                                </h5>
                                <ul className="space-y-1 text-sm text-gray-700">
                                  {value.map((item, idx) => (
                                    <li key={idx} className="pl-2">
                                      •{" "}
                                      {typeof item === "object"
                                        ? JSON.stringify(item)
                                        : String(item)}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          } else if (
                            typeof value === "object" &&
                            value !== null
                          ) {
                            // Afficher les objets qui contiennent du texte significatif
                            const textContent = JSON.stringify(value, null, 2);
                            if (textContent.length > 20) {
                              return (
                                <div key={index} className="mb-4">
                                  <h5 className="font-medium text-sm text-gray-800 mb-2 border-b pb-1">
                                    {field
                                      .replace(/([A-Z])/g, " $1")
                                      .replace(/^./, (str: string) =>
                                        str.toUpperCase()
                                      )}
                                  </h5>
                                  <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                                    {/* Essayer d'extraire le contenu textuel des objets */}
                                    {Object.entries(value).map(
                                      ([subKey, subValue], subIdx) => (
                                        <div key={subIdx} className="mb-2">
                                          <span className="font-medium text-xs text-gray-600 uppercase">
                                            {subKey}:
                                          </span>
                                          <div className="mt-1 text-sm">
                                            {typeof subValue === "string"
                                              ? subValue
                                              : JSON.stringify(subValue)}
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              );
                            }
                          }
                          return null;
                        }
                      )}

                      {/* Si aucun contenu textuel significatif n'est trouvé */}
                      {Object.entries(report.reportData).every(
                        ([, value]) =>
                          !(typeof value === "string" && value.length > 10) &&
                          !Array.isArray(value) &&
                          !(typeof value === "object" && value !== null)
                      ) && (
                        <div className="text-center py-8 text-gray-500">
                          <p className="text-sm">
                            Le contenu de ce rapport nécessite une analyse plus
                            approfondie. Consultez l&apos;analyse IA ci-dessous
                            pour plus de détails.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    Aucun contenu textuel disponible pour ce rapport
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Formulaire Manuel d'Analyse */}
      {showManualForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              {aiAnalysis || localAnalysis || manualAnalysis
                ? "Éditer l'Analyse BIA"
                : "Saisir une Analyse Manuelle"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {saveLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Enregistrement en cours...
                  </p>
                </div>
              </div>
            ) : (
              <BiaAnalysisForm
                initialData={
                  manualAnalysis || aiAnalysis || localAnalysis || undefined
                }
                onSave={handleSaveAnalysis}
                onCancel={() => setShowManualForm(false)}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Section Choix d'Analyse */}
      {!aiAnalysis && !localAnalysis && !analysisLoading && !showManualForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              Analyser le Rapport
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Choisissez le type d&apos;analyse à effectuer sur ce rapport :
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Analyse IA */}
                <div className="border rounded-lg p-4 hover:border-purple-300 transition-colors">
                  <div className="flex items-start gap-3 mb-3">
                    <Brain className="h-5 w-5 text-purple-500 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">
                        Analyse IA (Gemini)
                      </h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        Analyse approfondie avec intelligence artificielle.
                        Génère des recommandations basées sur les standards BIA
                        et l&apos;expertise industrielle.
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs mb-3">
                        <Badge variant="secondary" className="text-xs">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Précis
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          ~10-30s
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={async () => {
                      const resolvedParams = await params;
                      await analyzeWithAI(resolvedParams.id);
                    }}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Brain className="h-4 w-4" />
                    Lancer l&apos;analyse IA
                  </Button>
                </div>

                {/* Analyse Locale */}
                <div className="border rounded-lg p-4 hover:border-green-300 transition-colors">
                  <div className="flex items-start gap-3 mb-3">
                    <Zap className="h-5 w-5 text-green-500 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">
                        Analyse Locale (Heuristique)
                      </h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        Analyse rapide basée sur des règles et patterns.
                        Extraction automatique des métriques BIA sans IA.
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs mb-3">
                        <Badge variant="secondary" className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          Instantané
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Privé
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={analyzeLocally}
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 border-green-200 hover:bg-green-50"
                  >
                    <Zap className="h-4 w-4" />
                    Lancer l&apos;analyse locale
                  </Button>
                </div>

                {/* Saisie Manuelle */}
                <div className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-start gap-3 mb-3">
                    <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">
                        Saisie Manuelle
                      </h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        Créez ou éditez l&apos;analyse BIA manuellement avec un
                        formulaire complet. Contrôle total sur toutes les
                        données.
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs mb-3">
                        <Badge variant="secondary" className="text-xs">
                          <User className="h-3 w-3 mr-1" />
                          Manuel
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Précis
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      // Si aucune analyse n'existe, lancer une analyse locale pour pré-remplir
                      if (!aiAnalysis && !localAnalysis && !manualAnalysis) {
                        analyzeLocally();
                      }
                      setShowManualForm(true);
                    }}
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 border-blue-200 hover:bg-blue-50"
                  >
                    <FileText className="h-4 w-4" />
                    Saisir manuellement
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section Analyse en cours */}
      {analysisLoading && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {analysisType === "ai" ? (
                <Brain className="h-5 w-5 text-purple-500" />
              ) : (
                <Zap className="h-5 w-5 text-green-500" />
              )}
              {analysisType === "ai"
                ? "Analyse IA en cours..."
                : "Analyse locale en cours..."}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2
                  className={`h-8 w-8 animate-spin mx-auto mb-4 ${
                    analysisType === "ai" ? "text-purple-500" : "text-green-500"
                  }`}
                />
                <p className="text-sm text-muted-foreground mb-2">
                  {analysisType === "ai"
                    ? "Analyse du rapport avec Gemini AI..."
                    : "Extraction des métriques BIA..."}
                </p>
                <p className="text-xs text-muted-foreground">
                  {analysisType === "ai"
                    ? "L'IA analyse le contenu et génère des recommandations basées sur son expertise BIA."
                    : "Analyse rapide par reconnaissance de patterns et mots-clés."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {analysisError && (
        <Card className="mb-8 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Erreur d&apos;Analyse {analysisType === "ai" ? "IA" : "Locale"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600 mb-4">{analysisError}</p>
            <div className="flex gap-2">
              {analysisType === "ai" && (
                <Button
                  onClick={async () => {
                    const resolvedParams = await params;
                    await analyzeWithAI(resolvedParams.id);
                  }}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Brain className="h-4 w-4" />
                  Relancer l&apos;analyse IA
                </Button>
              )}
              {analysisType === "local" && (
                <Button
                  onClick={analyzeLocally}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Relancer l&apos;analyse locale
                </Button>
              )}
              <Button
                onClick={() => {
                  setAnalysisError(null);
                  setAnalysisType(null);
                }}
                variant="ghost"
                size="sm"
              >
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {(aiAnalysis || localAnalysis || manualAnalysis) && (
        <div className="space-y-6 mb-8">
          {/* Utiliser l'analyse appropriée selon le type */}
          {(() => {
            console.log("🔍 Debug affichage analyse:");
            console.log("  - aiAnalysis:", !!aiAnalysis);
            console.log("  - localAnalysis:", !!localAnalysis);
            console.log("  - manualAnalysis:", !!manualAnalysis);
            console.log("  - analysisType:", analysisType);

            const analysis =
              manualAnalysis ||
              (analysisType === "ai" ? aiAnalysis : localAnalysis);

            console.log("  - analysis sélectionnée:", !!analysis);

            if (!analysis) {
              console.warn("⚠️ Aucune analyse à afficher!");
              return null;
            }

            console.log("✅ Affichage de l'analyse");

            return (
              <>
                {/* Message informatif */}
                <Card
                  className={
                    manualAnalysis
                      ? "border-blue-200 bg-blue-50/50"
                      : analysisType === "ai"
                      ? "border-blue-200 bg-blue-50/50"
                      : "border-green-200 bg-green-50/50"
                  }
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      {manualAnalysis ? (
                        <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                      ) : analysisType === "ai" ? (
                        <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                      ) : (
                        <Zap className="h-5 w-5 text-green-600 mt-0.5" />
                      )}
                      <div>
                        <h4
                          className={`font-semibold text-sm mb-1 ${
                            manualAnalysis || analysisType === "ai"
                              ? "text-blue-800"
                              : "text-green-800"
                          }`}
                        >
                          {manualAnalysis
                            ? "Analyse Manuelle Sauvegardée"
                            : analysisType === "ai"
                            ? "Analyse IA Intelligente"
                            : "Analyse Locale Heuristique"}
                        </h4>
                        <p
                          className={`text-xs ${
                            manualAnalysis || analysisType === "ai"
                              ? "text-blue-700"
                              : "text-green-700"
                          }`}
                        >
                          {manualAnalysis
                            ? "Cette analyse a été saisie manuellement et sauvegardée dans la base de données. Cliquez sur 'Éditer' pour la modifier."
                            : analysisType === "ai"
                            ? "Cette analyse a été générée par Gemini AI en utilisant son expertise BIA pour interpréter et enrichir le contenu disponible. Même si le fichier source était basique, l'IA a appliqué les standards industriels pour fournir une analyse complète."
                            : "Cette analyse a été générée localement en utilisant des techniques heuristiques et la reconnaissance de patterns. Elle extrait automatiquement les métriques BIA du contenu sans recourir à l'intelligence artificielle, garantissant rapidité et confidentialité."}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* Résumé */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {manualAnalysis ? (
                        <FileText className="h-5 w-5 text-blue-500" />
                      ) : analysisType === "ai" ? (
                        <Brain className="h-5 w-5 text-purple-500" />
                      ) : (
                        <Zap className="h-5 w-5 text-green-500" />
                      )}
                      Résumé{" "}
                      {manualAnalysis
                        ? "Analyse Manuelle"
                        : analysisType === "ai"
                        ? "Analyse IA"
                        : "Analyse Locale"}
                      <Badge variant="outline" className="ml-auto">
                        Confiance: {analysis.confidence}%
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-start gap-4">
                      <p className="text-sm leading-relaxed flex-1">
                        {analysis.resume}
                      </p>
                      <Button
                        onClick={handleEditAnalysis}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 shrink-0"
                      >
                        <FileText className="h-4 w-4" />
                        Éditer
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Métriques */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">RTO</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {analysis.metrics?.rto ?? 0}h
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Recovery Time Objective
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        MTPD
                      </CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">
                        {analysis.metrics?.mtpd ?? 0}h
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Maximum Tolerable Period
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        MBCO
                      </CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {analysis.metrics?.mbco ?? 0}h
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Minimum Business Continuity
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Criticité
                      </CardTitle>
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div
                        className={`text-2xl font-bold ${
                          BiaAiAnalyzer.getCriticalityColor(
                            analysis.criticality?.level ?? "moyen"
                          ).split(" ")[0]
                        }`}
                      >
                        {(analysis.criticality?.level ?? "moyen").toUpperCase()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Score: {analysis.criticality?.score ?? 0}/100
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Responsable du Processus */}
                {(analysis.criticality?.processOwner ||
                  analysis.criticality?.ownerRole ||
                  analysis.criticality?.ownerContact) && (
                  <Card className="border-blue-100 bg-blue-50/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-800">
                        <User className="h-5 w-5" />
                        Responsable du Processus
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analysis.criticality?.processOwner && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold text-sm">
                              {analysis.criticality.processOwner}
                            </span>
                          </div>
                        )}
                        {analysis.criticality?.ownerRole && (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {analysis.criticality.ownerRole}
                            </Badge>
                          </div>
                        )}
                        {analysis.criticality?.ownerContact && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="text-xs">
                              📧 {analysis.criticality.ownerContact}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Niveau de Continuité */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-500" />
                      Niveau de Continuité
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div
                        className={`p-4 rounded-lg ${BiaAiAnalyzer.getContinuityColor(
                          analysis.continuityLevel?.level ?? "jaune"
                        )}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              (analysis.continuityLevel?.level ?? "jaune") ===
                              "vert"
                                ? "bg-green-500"
                                : (analysis.continuityLevel?.level ??
                                    "jaune") === "jaune"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                          ></div>
                          <span className="font-semibold text-sm">
                            {(
                              analysis.continuityLevel?.level ?? "jaune"
                            ).toUpperCase()}
                          </span>
                          <span className="text-sm">
                            ({analysis.continuityLevel?.score ?? 0}/10)
                          </span>
                        </div>
                        <p className="text-sm">
                          {analysis.continuityLevel?.description ??
                            "Aucune description disponible"}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2">
                          Mesures Existantes:
                        </h4>
                        <ul className="space-y-1">
                          {(analysis.continuityLevel?.measures ?? [])
                            .slice(0, 5)
                            .map((measure, index) => (
                              <li
                                key={index}
                                className="text-xs text-muted-foreground"
                              >
                                • {measure}
                              </li>
                            ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2">
                          Recommandations:
                        </h4>
                        <ul className="space-y-1">
                          {(analysis.continuityLevel?.recommendations ?? [])
                            .slice(0, 5)
                            .map((rec, index) => (
                              <li
                                key={index}
                                className="text-xs text-muted-foreground"
                              >
                                • {rec}
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Impacts */}
                {(analysis.impacts ?? []).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Tous les Impacts Identifiés
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(analysis.impacts ?? []).map((impact, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border ${BiaAiAnalyzer.getCriticalityColor(
                              impact.severity
                            )}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-sm">
                                {impact.type}
                              </h4>
                              <Badge
                                className={BiaAiAnalyzer.getCriticalityColor(
                                  impact.severity
                                )}
                              >
                                {impact.severity}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {impact.description}
                            </p>
                            {impact.financialImpact && (
                              <p className="text-xs font-medium">
                                Impact financier: {impact.financialImpact}€
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* SPOF (Single Points of Failure) */}
                {(analysis.spof ?? []).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-red-500" />
                        Points de Défaillance Unique (SPOF)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(analysis.spof ?? []).map((spof, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border-2 ${BiaAiAnalyzer.getSpofColor(
                              spof.riskLevel
                            )}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-sm">
                                {spof.name}
                              </h4>
                              <Badge
                                className={`${
                                  spof.riskLevel === "critique"
                                    ? "bg-red-100 text-red-800"
                                    : spof.riskLevel === "élevé"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {spof.riskLevel}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {spof.description}
                            </p>
                            <p className="text-sm font-medium mb-2">
                              Impact: {spof.impact}
                            </p>
                            {spof.mitigation.length > 0 && (
                              <div>
                                <p className="text-xs font-medium mb-1">
                                  Mesures d&apos;atténuation:
                                </p>
                                <ul className="space-y-1">
                                  {spof.mitigation.map((mitigation, idx) => (
                                    <li
                                      key={idx}
                                      className="text-xs text-muted-foreground"
                                    >
                                      • {mitigation}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Dépendances */}
                {(analysis.dependencies ?? []).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Network className="h-5 w-5 text-blue-500" />
                        Dépendances Critiques
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(analysis.dependencies ?? []).map((dep, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-sm">
                                {dep.name}
                              </h4>
                              <Badge
                                variant={
                                  dep.criticality === "critique"
                                    ? "destructive"
                                    : dep.criticality === "important"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {dep.criticality}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Type: {dep.type}
                            </p>
                            <p className="text-xs text-muted-foreground mb-2">
                              {dep.description}
                            </p>
                            <p className="text-xs font-medium">
                              Impact: {dep.impact}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Besoins en Continuité */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-green-500" />
                      Besoins en Continuité
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(analysis.continuityNeeds?.equipment ?? []).length >
                        0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            Équipements
                          </h4>
                          <ul className="space-y-1">
                            {(analysis.continuityNeeds?.equipment ?? []).map(
                              (item, index) => (
                                <li
                                  key={index}
                                  className="text-xs text-muted-foreground"
                                >
                                  • {item}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {(analysis.continuityNeeds?.personnel ?? []).length >
                        0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Personnel
                          </h4>
                          <ul className="space-y-1">
                            {(analysis.continuityNeeds?.personnel ?? []).map(
                              (item, index) => (
                                <li
                                  key={index}
                                  className="text-xs text-muted-foreground"
                                >
                                  • {item}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {(analysis.continuityNeeds?.infrastructure ?? []).length >
                        0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                            <Network className="h-3 w-3" />
                            Infrastructure
                          </h4>
                          <ul className="space-y-1">
                            {(
                              analysis.continuityNeeds?.infrastructure ?? []
                            ).map((item, index) => (
                              <li
                                key={index}
                                className="text-xs text-muted-foreground"
                              >
                                • {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {(analysis.continuityNeeds?.technology ?? []).length >
                        0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            Technologie
                          </h4>
                          <ul className="space-y-1">
                            {(analysis.continuityNeeds?.technology ?? []).map(
                              (item, index) => (
                                <li
                                  key={index}
                                  className="text-xs text-muted-foreground"
                                >
                                  • {item}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {(analysis.continuityNeeds?.supplyChain ?? []).length >
                        0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Supply Chain
                          </h4>
                          <ul className="space-y-1">
                            {(analysis.continuityNeeds?.supplyChain ?? []).map(
                              (item, index) => (
                                <li
                                  key={index}
                                  className="text-xs text-muted-foreground"
                                >
                                  • {item}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {(analysis.continuityNeeds?.material ?? []).length >
                        0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">
                            Matériel
                          </h4>
                          <ul className="space-y-1">
                            {(analysis.continuityNeeds?.material ?? []).map(
                              (item, index) => (
                                <li
                                  key={index}
                                  className="text-xs text-muted-foreground"
                                >
                                  • {item}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {(analysis.continuityNeeds?.other ?? []).length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Autres</h4>
                          <ul className="space-y-1">
                            {(analysis.continuityNeeds?.other ?? []).map(
                              (item, index) => (
                                <li
                                  key={index}
                                  className="text-xs text-muted-foreground"
                                >
                                  • {item}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            );
          })()}
        </div>
      )}

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
                    <h4 className="font-semibold mb-2">Situation Actuelle :</h4>
                    <ul className="space-y-1 text-sm">
                      <li>
                        • {reportData.summary.totalProcesses} processus analysés
                      </li>
                      <li>
                        • Niveau de continuité :{" "}
                        {reportData.summary.globalContinuityLevel?.level} (
                        {reportData.summary.globalContinuityLevel?.score}/100)
                      </li>
                      <li>
                        • RTO moyen : {reportData.summary.averageMetrics?.rto}h
                      </li>
                      <li>
                        • RPO moyen : {reportData.summary.averageMetrics?.rpo}h
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
                      (
                        recommendation:
                          | string
                          | {
                              priority: string;
                              category: string;
                              title: string;
                              description: string;
                            },
                        index: number
                      ) => {
                        // Handle both string and object formats
                        if (typeof recommendation === "string") {
                          return (
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
                          );
                        } else {
                          // Object format with priority, category, title, description
                          const priorityColors = {
                            high: "bg-red-50 border-red-200",
                            medium: "bg-orange-50 border-orange-200",
                            low: "bg-yellow-50 border-yellow-200",
                          };
                          const priorityBadgeColors = {
                            high: "bg-red-100 text-red-800",
                            medium: "bg-orange-100 text-orange-800",
                            low: "bg-yellow-100 text-yellow-800",
                          };

                          return (
                            <div
                              key={index}
                              className={`p-4 border-2 rounded-lg ${
                                priorityColors[
                                  recommendation.priority as keyof typeof priorityColors
                                ] || "bg-gray-50 border-gray-200"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    {index + 1}
                                  </div>
                                  <h4 className="font-semibold text-sm">
                                    {recommendation.title}
                                  </h4>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {recommendation.category}
                                  </Badge>
                                  <Badge
                                    className={`text-xs ${
                                      priorityBadgeColors[
                                        recommendation.priority as keyof typeof priorityBadgeColors
                                      ] || "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {recommendation.priority === "high"
                                      ? "Priorité haute"
                                      : recommendation.priority === "medium"
                                      ? "Priorité moyenne"
                                      : "Priorité basse"}
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground ml-8">
                                {recommendation.description}
                              </p>
                            </div>
                          );
                        }
                      }
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      )}
    </div>
  );
}
