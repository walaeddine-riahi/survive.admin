"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BiaReportCard } from "./bia-report-card";
import {
  deleteBiaReport,
  shareBiaReport,
} from "@/actions/bia/bia-report-actions";
import { toast } from "sonner";
import {
  Search,
  Filter,
  BarChart3,
  Download,
  Share2,
  Factory,
  Brain,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

// Define custom types based on the actual BiaReport model
export type BiaReport = {
  id: string;
  name: string;
  description?: string | null;
  format: "PDF" | "DOCX" | "JSON" | "HTML";
  status: "DRAFT" | "GENERATED" | "ARCHIVED" | "SHARED";
  totalProcesses: number;
  continuityLevel: number;
  continuityLevelText?: string | null;
  riskCount: number;
  recommendationCount: number;
  reportData: unknown;
  content?: string | null;
  fileName?: string | null;
  filePath?: string | null;
  fileSize: number;
  mimeType?: string | null;
  generationParams?: unknown | null;
  includedProcessIds: string[];
  isPublic: boolean;
  shareToken?: string | null;
  expiresAt?: Date | null;
  downloadCount: number;
  tags: string[];
  category?: string | null;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UserType = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
};

export type BiaReportWithAuthor = BiaReport & {
  author: UserType;
};

interface BiaReportListProps {
  initialReports?: BiaReportWithAuthor[];
}

export function BiaReportList({ initialReports = [] }: BiaReportListProps) {
  const router = useRouter();
  const [reports, setReports] = useState<BiaReportWithAuthor[]>(initialReports);
  const [loading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] =
    useState<BiaReportWithAuthor | null>(null);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [viewMode, setViewMode] = useState<"list" | "usines">("list");
  const [analyzingUsine, setAnalyzingUsine] = useState<string | null>(null);

  // Filtrer les rapports
  const filteredReports = reports.filter((report: BiaReportWithAuthor) => {
    const matchesSearch =
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFormat =
      selectedFormat === "all" || report.format === selectedFormat;
    const matchesStatus =
      selectedStatus === "all" || report.status === selectedStatus;

    // Utiliser le champ category au lieu de tags[0]
    const reportCategory = report.category || "non-categorise";
    const matchesCategory =
      selectedCategory === "all" || reportCategory === selectedCategory;

    return matchesSearch && matchesFormat && matchesStatus && matchesCategory;
  });

  // Grouper les rapports par usine
  const groupReportsByUsine = (reports: BiaReportWithAuthor[]) => {
    const groups = new Map<string, BiaReportWithAuthor[]>();

    reports.forEach((report) => {
      const usine = report.category || "Sans usine";
      if (!groups.has(usine)) {
        groups.set(usine, []);
      }
      groups.get(usine)!.push(report);
    });

    return Array.from(groups.entries()).sort(
      (a, b) => b[1].length - a[1].length
    );
  };

  const reportsByUsine = groupReportsByUsine(filteredReports);

  // Analyser une usine complète
  const handleAnalyzeUsine = async (usineName: string) => {
    setAnalyzingUsine(usineName);
    try {
      const usineReports = filteredReports.filter(
        (r) => (r.category || "Sans usine") === usineName
      );

      // Vérifier combien de rapports ont des analyses
      const reportsWithAnalysis = usineReports.filter(
        (r) =>
          r.reportData &&
          typeof r.reportData === "object" &&
          "analysis" in r.reportData
      );

      if (reportsWithAnalysis.length === 0) {
        toast.error("Aucun rapport de cette usine ne contient d'analyse");
        setAnalyzingUsine(null);
        return;
      }

      toast.info(
        `Analyse de l'usine "${usineName}" en cours... (${reportsWithAnalysis.length}/${usineReports.length} rapports avec analyse)`
      );

      // Appeler l'API pour consolider les analyses
      const response = await fetch(
        `/api/bia/factories/${encodeURIComponent(usineName)}/analyze`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de l'analyse de l'usine");
      }

      await response.json();

      toast.success(
        `✅ Analyse consolidée de l'usine "${usineName}" terminée!`
      );

      // Rediriger vers la page d'analyse consolidée
      router.push(`/bia/factories/${encodeURIComponent(usineName)}/analysis`);
    } catch (error) {
      console.error("Erreur lors de l'analyse de l'usine:", error);
      toast.error("Erreur lors de l'analyse de l'usine");
    } finally {
      setAnalyzingUsine(null);
    }
  };

  // Statistiques des rapports
  const stats = {
    total: reports.length,
    byFormat: {
      PDF: reports.filter((r: BiaReportWithAuthor) => r.format === "PDF")
        .length,
      DOCX: reports.filter((r: BiaReportWithAuthor) => r.format === "DOCX")
        .length,
      JSON: reports.filter((r: BiaReportWithAuthor) => r.format === "JSON")
        .length,
    },
    byStatus: {
      GENERATED: reports.filter(
        (r: BiaReportWithAuthor) => r.status === "GENERATED"
      ).length,
      DRAFT: reports.filter((r: BiaReportWithAuthor) => r.status === "DRAFT")
        .length,
      ARCHIVED: reports.filter(
        (r: BiaReportWithAuthor) => r.status === "ARCHIVED"
      ).length,
      SHARED: reports.filter((r: BiaReportWithAuthor) => r.status === "SHARED")
        .length,
    },
    totalDownloads: reports.reduce(
      (sum: number, r: BiaReportWithAuthor) => sum + r.downloadCount,
      0
    ),
  };

  // Categories uniques pour le filtre (utiliser le champ category)
  const uniqueCategories = Array.from(
    new Set(
      reports.map(
        (report: BiaReportWithAuthor) => report.category || "non-categorise"
      )
    )
  );

  // Handlers
  const handleView = (report: BiaReportWithAuthor) => {
    router.push(`/bia/reports/${report.id}`);
  };

  const handleDownload = async (report: BiaReportWithAuthor) => {
    try {
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
        toast.success("Rapport téléchargé avec succès !");
      } else {
        toast.info(
          `Le téléchargement de fichiers ${report.format} n'est pas encore implémenté`
        );
      }
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast.error("Erreur lors du téléchargement du rapport");
    }
  };

  const handleShare = async (report: BiaReportWithAuthor) => {
    try {
      const result = await shareBiaReport(report.id);
      if (result.success && result.data) {
        const shareUrl = `${window.location.origin}/bia/reports/shared/${result.data.shareToken}`;
        setShareUrl(shareUrl);
        setSelectedReport(report);
        setShareDialogOpen(true);
        toast.success("Lien de partage généré !");
      } else {
        toast.error("Erreur lors de la génération du lien de partage");
      }
    } catch (error) {
      console.error("Erreur lors du partage:", error);
      toast.error("Erreur lors du partage du rapport");
    }
  };

  const handleDelete = (report: BiaReportWithAuthor) => {
    setSelectedReport(report);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedReport) return;

    try {
      const result = await deleteBiaReport(selectedReport.id);
      if (result.success) {
        setReports(
          reports.filter((r: BiaReportWithAuthor) => r.id !== selectedReport.id)
        );
        toast.success("Rapport supprimé avec succès");
      } else {
        toast.error("Erreur lors de la suppression du rapport");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression du rapport");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedReport(null);
    }
  };

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Lien copié dans le presse-papiers !");
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Rapports
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Rapports générés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Téléchargements
            </CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDownloads}</div>
            <p className="text-xs text-muted-foreground">Au total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rapports Actifs
            </CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byStatus.GENERATED}</div>
            <p className="text-xs text-muted-foreground">Disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partagés</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byStatus.SHARED}</div>
            <p className="text-xs text-muted-foreground">Liens actifs</p>
          </CardContent>
        </Card>
      </div>

      {/* Barre de recherche et filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Recherche et Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un rapport..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedFormat} onValueChange={setSelectedFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les formats</SelectItem>
                <SelectItem value="PDF">PDF ({stats.byFormat.PDF})</SelectItem>
                <SelectItem value="DOCX">
                  Word ({stats.byFormat.DOCX})
                </SelectItem>
                <SelectItem value="JSON">
                  JSON ({stats.byFormat.JSON})
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="GENERATED">
                  Générés ({stats.byStatus.GENERATED})
                </SelectItem>
                <SelectItem value="DRAFT">
                  Brouillons ({stats.byStatus.DRAFT})
                </SelectItem>
                <SelectItem value="SHARED">
                  Partagés ({stats.byStatus.SHARED})
                </SelectItem>
                <SelectItem value="ARCHIVED">
                  Archivés ({stats.byStatus.ARCHIVED})
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category || ""} value={category || ""}>
                    {category || "Non catégorisé"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="outline">
              {filteredReports.length} résultat
              {filteredReports.length > 1 ? "s" : ""}
            </Badge>
            {searchTerm && (
              <Badge variant="secondary">
                Recherche: &quot;{searchTerm}&quot;
              </Badge>
            )}
            {selectedFormat !== "all" && (
              <Badge variant="secondary">Format: {selectedFormat}</Badge>
            )}
            {selectedStatus !== "all" && (
              <Badge variant="secondary">Statut: {selectedStatus}</Badge>
            )}
            {selectedCategory !== "all" && (
              <Badge variant="secondary">Catégorie: {selectedCategory}</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste des rapports */}
      <div className="space-y-4">
        {/* Toggle entre vue liste et vue usines */}
        <div className="flex justify-end gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Vue liste
          </Button>
          <Button
            variant={viewMode === "usines" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("usines")}
          >
            <Factory className="h-4 w-4 mr-2" />
            Par usine
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-muted-foreground">
                Chargement des rapports...
              </p>
            </div>
          </div>
        ) : filteredReports.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="space-y-2">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-semibold">Aucun rapport trouvé</h3>
                <p className="text-muted-foreground">
                  {searchTerm ||
                  selectedFormat !== "all" ||
                  selectedStatus !== "all"
                    ? "Aucun rapport ne correspond aux critères de recherche."
                    : "Aucun rapport n&apos;a été généré. Créez des processus BIA et générez des rapports depuis le dashboard."}
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedFormat("all");
                    setSelectedStatus("all");
                    setSelectedCategory("all");
                  }}
                  variant="outline"
                  className="mt-4"
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : viewMode === "usines" ? (
          /* Vue par usine avec boutons d'analyse */
          <div className="space-y-6">
            {reportsByUsine.map(([usineName, usineReports]) => {
              const reportsWithAnalysis = usineReports.filter(
                (r) =>
                  r.reportData &&
                  typeof r.reportData === "object" &&
                  "analysis" in r.reportData
              );
              const isAnalyzing = analyzingUsine === usineName;

              return (
                <Card key={usineName} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Factory className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle className="text-xl">{usineName}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {usineReports.length} rapport
                            {usineReports.length > 1 ? "s" : ""} •{" "}
                            {reportsWithAnalysis.length} avec analyse
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleAnalyzeUsine(usineName)}
                        disabled={
                          reportsWithAnalysis.length === 0 || isAnalyzing
                        }
                        size="sm"
                        className="gap-2"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Analyse en cours...
                          </>
                        ) : (
                          <>
                            <Brain className="h-4 w-4" />
                            Analyser l&apos;usine
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {usineReports.map((report) => (
                        <BiaReportCard
                          key={report.id}
                          report={report}
                          onView={handleView}
                          onDownload={handleDownload}
                          onShare={handleShare}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Vue liste classique */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report: BiaReportWithAuthor) => (
              <BiaReportCard
                key={report.id}
                report={report}
                onView={handleView}
                onDownload={handleDownload}
                onShare={handleShare}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialog de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le rapport</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le rapport &quot;
              {selectedReport?.name}&quot; ? Cette action est irréversible et
              toutes les données du rapport seront perdues.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de partage */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Partager le rapport</DialogTitle>
            <DialogDescription>
              Le rapport &quot;{selectedReport?.name}&quot; peut être consulté
              via ce lien sécurisé :
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-mono break-all">{shareUrl}</p>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>• Ce lien permet un accès en lecture seule au rapport</p>
              <p>• Le rapport peut être consulté sans authentification</p>
              <p>• Vous pouvez révoquer l&apos;accès à tout moment</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Fermer
            </Button>
            <Button onClick={copyShareUrl}>Copier le lien</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
