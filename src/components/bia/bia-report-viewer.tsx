"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Download,
  FileIcon,
  ArrowLeft,
  AlertCircle,
  BarChart3,
  TrendingUp,
} from "lucide-react";

interface BiaReportViewProps {
  id: string;
  onBack?: () => void;
}

interface ReportData {
  id: string;
  name: string;
  description?: string;
  format: string;
  fileName?: string;
  fileSize: number;
  mimeType?: string;
  content?: string;
  reportData?: {
    source: string;
    originalFileName: string;
    uploadDate: string;
    extractedText: string;
    analysis: {
      estimatedProcesses: number;
      estimatedRisks: number;
      estimatedRecommendations: number;
      continuityLevel: number;
    };
    contentLength: number;
    processingMethod: string;
    note?: string;
  };
  author: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  tags: string[];
  category?: string;
  totalProcesses: number;
  continuityLevel: number;
  continuityLevelText?: string;
  riskCount: number;
  recommendationCount: number;
}

export function BiaReportViewer({ id, onBack }: BiaReportViewProps) {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bia/report/${id}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setReport(result.data);
        } else {
          setError(result.error || "Erreur lors du chargement du rapport");
        }
      } else {
        setError("Rapport non trouvé");
      }
    } catch {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchReport();
  }, [fetchReport]);

  const downloadFile = async () => {
    if (!report) return;

    try {
      const response = await fetch(`/api/bia/download/${id}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = report.fileName || "rapport.pdf";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getContinuityColor = (level: number) => {
    if (level >= 80) return "text-green-600";
    if (level >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getContinuityBgColor = (level: number) => {
    if (level >= 80) return "bg-green-100 border-green-200";
    if (level >= 60) return "bg-yellow-100 border-yellow-200";
    return "bg-red-100 border-red-200";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            Chargement du rapport...
          </p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Erreur</h3>
              <p className="text-muted-foreground">
                {error || "Rapport non trouvé"}
              </p>
            </div>
            {onBack && (
              <Button onClick={onBack} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button onClick={onBack} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">{report.name}</h1>
            <p className="text-muted-foreground">
              Rapport {report.format} • {formatFileSize(report.fileSize)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadFile} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Télécharger
          </Button>
        </div>
      </div>

      {/* Informations principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Niveau de continuité */}
        <Card
          className={`border-2 ${getContinuityBgColor(report.continuityLevel)}`}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Niveau de Continuité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">
              <span className={getContinuityColor(report.continuityLevel)}>
                {report.continuityLevel}%
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {report.continuityLevelText || "Non évalué"}
            </p>
          </CardContent>
        </Card>

        {/* Processus identifiés */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Processus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">
              {report.totalProcesses}
            </div>
            <p className="text-sm text-muted-foreground">
              Processus identifiés
            </p>
          </CardContent>
        </Card>

        {/* Risques détectés */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Risques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{report.riskCount}</div>
            <p className="text-sm text-muted-foreground">Risques détectés</p>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="content">Contenu</TabsTrigger>
          <TabsTrigger value="analysis">Analyse</TabsTrigger>
          <TabsTrigger value="metadata">Métadonnées</TabsTrigger>
        </TabsList>

        {/* Onglet Aperçu */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {report.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{report.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Auteur</h4>
                  <p className="text-muted-foreground">
                    {report.author.firstName} {report.author.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {report.author.email}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Date de création</h4>
                  <p className="text-muted-foreground">
                    {formatDate(report.createdAt)}
                  </p>
                </div>
              </div>

              {(report.tags.length > 0 || report.category) && (
                <div>
                  <h4 className="font-medium mb-2">Tags et Catégorie</h4>
                  <div className="flex flex-wrap gap-2">
                    {report.category && (
                      <Badge variant="outline">{report.category}</Badge>
                    )}
                    {report.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Résumé de l'analyse */}
          <Card>
            <CardHeader>
              <CardTitle>Résumé de l&apos;analyse BIA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {report.totalProcesses}
                  </div>
                  <div className="text-sm text-muted-foreground">Processus</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {report.riskCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Risques</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {report.recommendationCount}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Recommandations
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div
                    className={`text-2xl font-bold ${getContinuityColor(
                      report.continuityLevel
                    )}`}
                  >
                    {report.continuityLevel}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Continuité
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Contenu */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Contenu du document</CardTitle>
              <CardDescription>
                {report.format === "PDF"
                  ? "Prévisualisation PDF et texte extrait"
                  : "Contenu extrait du document"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Prévisualisation PDF intégrée */}
              {report.format === "PDF" && report.fileName && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Prévisualisation PDF</h4>
                    <Button onClick={downloadFile} size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger l&apos;original
                    </Button>
                  </div>
                  <div className="border rounded-lg overflow-hidden bg-gray-50">
                    <iframe
                      src={`/api/bia/download/${id}#toolbar=1&navpanes=1&scrollbar=1`}
                      className="w-full h-[600px]"
                      title="Prévisualisation PDF"
                      onError={() => {
                        console.log("Erreur chargement PDF iframe");
                      }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Si la prévisualisation ne s&apos;affiche pas correctement,
                    téléchargez le fichier pour l&apos;ouvrir dans votre lecteur
                    PDF.
                  </p>
                </div>
              )}

              {/* Contenu Word/texte */}
              {report.format !== "PDF" && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">
                      Document {report.format} - {report.fileName}
                    </h4>
                    <Button onClick={downloadFile} size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger l&apos;original
                    </Button>
                  </div>

                  {/* Informations sur le fichier */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileIcon className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900">
                        Informations du document
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-blue-700 font-medium">
                          Format:
                        </span>
                        <span className="ml-1">{report.format}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">
                          Taille:
                        </span>
                        <span className="ml-1">
                          {formatFileSize(report.fileSize)}
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">
                          Upload:
                        </span>
                        <span className="ml-1">
                          {formatDate(report.createdAt)}
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">
                          Auteur:
                        </span>
                        <span className="ml-1">{report.author.firstName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Aperçu du contenu */}
                  {report.content || report.reportData?.extractedText ? (
                    <div className="space-y-3">
                      <h5 className="font-medium text-sm">
                        Aperçu du contenu textuel
                      </h5>
                      <div className="bg-white border rounded-lg p-4 max-h-96 overflow-y-auto">
                        <div className="prose prose-sm max-w-none">
                          <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono">
                            {report.content ||
                              report.reportData?.extractedText ||
                              "Contenu non disponible"}
                          </pre>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ℹ️ Cet aperçu montre le texte extrait du document
                        original. La mise en forme, les images et les tableaux
                        ne sont pas conservés.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                      <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <h5 className="font-medium mb-2">
                        Extraction de contenu non disponible
                      </h5>
                      <p className="text-sm mb-4">
                        Le contenu textuel n&apos;a pas pu être extrait
                        automatiquement pour ce document {report.format}.
                      </p>
                      <div className="space-y-2">
                        <p className="text-xs">
                          Pour consulter le contenu complet :
                        </p>
                        <Button
                          onClick={downloadFile}
                          variant="outline"
                          className="mx-auto"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger et ouvrir avec{" "}
                          {report.format === "DOCX"
                            ? "Microsoft Word"
                            : "votre lecteur"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Texte extrait pour PDF aussi */}
              {report.format === "PDF" &&
                (report.content || report.reportData?.extractedText) && (
                  <div>
                    <h4 className="font-medium mb-3">
                      Texte extrait pour analyse
                    </h4>
                    <div className="bg-muted p-4 rounded-lg max-h-60 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm">
                        {report.content || report.reportData?.extractedText}
                      </pre>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Ce texte a été extrait automatiquement pour l&apos;analyse
                      BIA. Il peut ne pas refléter parfaitement la mise en forme
                      du document original.
                    </p>
                  </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Analyse */}
        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>Analyse détaillée</CardTitle>
              <CardDescription>
                Résultats de l&apos;analyse automatique du document
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {report.reportData?.analysis && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Processus métier</h4>
                      <div className="text-2xl font-bold text-blue-600">
                        {report.reportData.analysis.estimatedProcesses}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Processus identifiés par analyse textuelle
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Risques identifiés</h4>
                      <div className="text-2xl font-bold text-orange-600">
                        {report.reportData.analysis.estimatedRisks}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Mentions de risques dans le document
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Recommandations</h4>
                      <div className="text-2xl font-bold text-green-600">
                        {report.reportData.analysis.estimatedRecommendations}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Recommandations suggérées
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Score de continuité</h4>
                      <div
                        className={`text-2xl font-bold ${getContinuityColor(
                          report.reportData.analysis.continuityLevel
                        )}`}
                      >
                        {report.reportData.analysis.continuityLevel}%
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Évaluation automatique
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {report.reportData?.note && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">
                        Note d&apos;analyse
                      </h4>
                      <p className="text-blue-800 mt-1">
                        {report.reportData.note}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Métadonnées */}
        <TabsContent value="metadata">
          <Card>
            <CardHeader>
              <CardTitle>Métadonnées du fichier</CardTitle>
              <CardDescription>
                Informations techniques sur le document
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Fichier</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Nom original:
                        </span>
                        <span>{report.fileName || "Non disponible"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Format:</span>
                        <Badge variant="outline">{report.format}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Taille:</span>
                        <span>{formatFileSize(report.fileSize)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Type MIME:
                        </span>
                        <span className="text-sm">
                          {report.mimeType || "Non spécifié"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Traitement</h4>
                    <div className="space-y-2">
                      {report.reportData && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Source:
                            </span>
                            <span>{report.reportData.source}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Méthode:
                            </span>
                            <span>{report.reportData.processingMethod}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Longueur contenu:
                            </span>
                            <span>
                              {report.reportData.contentLength} caractères
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Date d&apos;upload:
                            </span>
                            <span>
                              {formatDate(report.reportData.uploadDate)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
