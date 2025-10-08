"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, File, Database } from "lucide-react";
import { BiaReportGenerator } from "@/lib/report-generator";
import { generateBiaReport } from "@/actions/bia/report-actions";
import { createBiaReport } from "@/actions/bia/bia-report-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Types pour les données du rapport
type ProcessStats = {
  total: number;
  byCriticality: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  byDepartment: Record<string, number>;
  averageRTO: number;
  averageRPO: number;
  averageMTPD: number;
  processesNeedingAttention: number;
  globalContinuityLevel: {
    score: number;
    level: "Excellent" | "Bon" | "Moyen" | "Faible" | "Critique";
    color: string;
  };
  recommendations: string[];
  majorRisks: {
    type: string;
    description: string;
    severity: "Critique" | "Élevé" | "Moyen";
    processes: string[];
  }[];
};

interface BiaExportButtonsProps {
  stats: ProcessStats;
}

export function BiaExportButtons({ stats }: BiaExportButtonsProps) {
  const router = useRouter();

  // Fonction utilitaire pour sauvegarder un rapport en base de données
  const saveReportToDatabase = async (
    format: "PDF" | "DOCX" | "JSON",
    reportData: Record<string, unknown>
  ) => {
    try {
      const reportName = `Rapport BIA - ${new Date().toLocaleDateString(
        "fr-FR"
      )} (${format})`;
      const reportResult = await createBiaReport({
        name: reportName,
        description: `Rapport d'analyse d'impact métier généré automatiquement. Niveau de continuité: ${stats.globalContinuityLevel.level} (${stats.globalContinuityLevel.score}/100). ${stats.majorRisks.length} risques majeurs identifiés, ${stats.recommendations.length} recommandations générées.`,
        format,
        reportData: reportData as Record<string, unknown>,
        totalProcesses: stats.total,
        continuityLevel: stats.globalContinuityLevel.score,
        continuityLevelText: stats.globalContinuityLevel.level,
        riskCount: stats.majorRisks.length,
        recommendationCount: stats.recommendations.length,
        fileSize: JSON.stringify(reportData).length, // Taille approximative
        includedProcessIds: [], // Liste vide pour l'instant
        tags: ["dashboard", "automatique", format.toLowerCase()],
        status: "GENERATED",
      });

      if (reportResult.success) {
        toast.success(`Rapport ${format} sauvegardé en base de données !`);
        return reportResult.data;
      } else {
        console.warn("Impossible de sauvegarder en base:", reportResult.error);
        toast.warning(
          `${format} généré mais non sauvegardé en base de données`
        );
      }
    } catch (error) {
      console.warn("Erreur lors de la sauvegarde en base:", error);
      toast.warning(`${format} généré mais non sauvegardé en base de données`);
    }
    return null;
  };

  const handleExportPdf = async () => {
    try {
      toast.info("Génération du rapport PDF en cours...");
      await BiaReportGenerator.generatePdfReport(stats);

      // Sauvegarder en base de données
      await saveReportToDatabase("PDF", {
        summary: {
          totalProcesses: stats.total,
          globalContinuityLevel: stats.globalContinuityLevel,
          averageMetrics: {
            rto: stats.averageRTO,
            rpo: stats.averageRPO,
            mtpd: stats.averageMTPD,
          },
          departments: stats.byDepartment,
          criticality: stats.byCriticality,
          processesNeedingAttention: stats.processesNeedingAttention,
        },
        risks: stats.majorRisks,
        recommendations: stats.recommendations,
        generatedAt: new Date().toISOString(),
      });

      toast.success("Rapport PDF généré avec succès !");
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      toast.error("Erreur lors de la génération du rapport PDF");
    }
  };

  const handleExportWord = async () => {
    try {
      toast.info("Génération du rapport Word en cours...");
      await BiaReportGenerator.generateWordReport(stats);

      // Sauvegarder en base de données
      await saveReportToDatabase("DOCX", {
        summary: {
          totalProcesses: stats.total,
          globalContinuityLevel: stats.globalContinuityLevel,
          averageMetrics: {
            rto: stats.averageRTO,
            rpo: stats.averageRPO,
            mtpd: stats.averageMTPD,
          },
          departments: stats.byDepartment,
          criticality: stats.byCriticality,
          processesNeedingAttention: stats.processesNeedingAttention,
        },
        risks: stats.majorRisks,
        recommendations: stats.recommendations,
        generatedAt: new Date().toISOString(),
      });

      toast.success("Rapport Word généré avec succès !");
    } catch (error) {
      console.error("Erreur lors de la génération du Word:", error);
      toast.error("Erreur lors de la génération du rapport Word");
    }
  };

  const handleExportJson = async () => {
    try {
      toast.info("Génération du rapport JSON en cours...");

      // Utiliser l'action serveur pour générer le rapport
      const result = await generateBiaReport();

      if (!result.success) {
        toast.error(`Erreur lors de la génération du rapport: ${result.error}`);
        return;
      }

      // Sauvegarder en base de données avant le téléchargement
      const savedReport = result.data
        ? await saveReportToDatabase("JSON", result.data)
        : null;

      // Créer le blob et télécharger
      const jsonString = JSON.stringify(result.data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Rapport_BIA_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Rapport JSON généré avec succès !");

      // Optionnel : rediriger vers le rapport sauvegardé
      if (savedReport) {
        toast.success(`Rapport sauvegardé ! Cliquez pour le visualiser.`, {
          action: {
            label: "Voir le rapport",
            onClick: () => router.push(`/bia/reports/${savedReport.id}`),
          },
        });
      }
    } catch (error) {
      console.error("Erreur lors de la génération du JSON:", error);
      toast.error("Erreur lors de la génération du rapport JSON");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-500" />
            Exportation des Rapports
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/bia/reports")}
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            Gérer les rapports
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={handleExportPdf}
            variant="outline"
            className="flex items-center gap-2 h-12"
            disabled={stats.total === 0}
          >
            <FileText className="h-4 w-4 text-red-600" />
            <div className="text-left">
              <div className="font-medium">Rapport PDF</div>
              <div className="text-xs text-muted-foreground">
                Format imprimable • {stats.total} processus
              </div>
            </div>
          </Button>

          <Button
            onClick={handleExportWord}
            variant="outline"
            className="flex items-center gap-2 h-12"
            disabled={stats.total === 0}
          >
            <File className="h-4 w-4 text-blue-600" />
            <div className="text-left">
              <div className="font-medium">Rapport Word</div>
              <div className="text-xs text-muted-foreground">
                Format éditable • {stats.recommendations.length} recommandations
              </div>
            </div>
          </Button>

          <Button
            onClick={handleExportJson}
            variant="outline"
            className="flex items-center gap-2 h-12"
            disabled={stats.total === 0}
          >
            <Download className="h-4 w-4 text-green-600" />
            <div className="text-left">
              <div className="font-medium">Données JSON</div>
              <div className="text-xs text-muted-foreground">
                Format technique • {stats.majorRisks.length} risques
              </div>
            </div>
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Contenu des rapports :</strong> Niveau de continuité
              global ({stats.globalContinuityLevel.level}),
              {stats.majorRisks.length} risques majeurs identifiés, et{" "}
              {stats.recommendations.length} recommandations détaillées pour
              améliorer la résilience de votre organisation.
            </p>
          </div>

          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Nouvelle fonctionnalité :</strong> Tous les rapports
              générés sont automatiquement sauvegardés dans la plateforme pour
              consultation ultérieure, partage sécurisé et suivi des versions.
            </p>
          </div>

          {stats.total === 0 && (
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Aucune donnée disponible :</strong> Créez des processus
                BIA pour générer des rapports.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
