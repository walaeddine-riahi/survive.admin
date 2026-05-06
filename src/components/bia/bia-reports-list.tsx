
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
  FileText,
  Download,
  Trash2,
  FileJson,
  FileType,
  PlusCircle,
  BarChart3,
  RefreshCw,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { BiaReportStorage, SavedReport } from "@/lib/report-storage";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface BiaReportsListProps {
  processes: any[];
}

export function BiaReportsList({ processes }: BiaReportsListProps) {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const data = await BiaReportStorage.getSavedReports();
      setReports(data || []);
    } catch (error) {
      console.error("Error loading reports:", error);
      toast.error("Erreur lors du chargement des rapports");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const success = await BiaReportStorage.deleteReport(id);
      if (success) {
        setReports(reports.filter((r) => r.id !== id));
        toast.success("Rapport supprimé");
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleGenerateGlobalReport = async () => {
    setIsGenerating(true);
    try {
      // Simulation d'une génération de rapport global
      // Note: Dans une version finale, on appellerait une action serveur
      const reportName = `Synthèse Globale BIA - ${new Date().toLocaleDateString()}`;
      
      const newReport = await BiaReportStorage.saveReport({
        name: reportName,
        format: "pdf",
        size: 1024 * 450, // 450 KB
        metadata: {
          totalProcesses: processes.length,
          continuityLevel: "92%",
          riskCount: processes.filter(p => p.criticality === 'critical').length,
          recommendationCount: processes.length * 2
        }
      });

      setReports([newReport, ...reports]);
      toast.success("Rapport global généré avec succès");
    } catch (error) {
      toast.error("Erreur lors de la génération du rapport");
    } finally {
      setIsGenerating(false);
    }
  };

  const stats = {
    total: reports.length,
    latest: reports.length > 0 ? reports[0].generatedAt : null,
    totalSize: reports.reduce((acc, r) => acc + r.size, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 uppercase">Total Rapports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">{stats.total}</p>
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-600 uppercase">Dernier Rapport</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold">
                {stats.latest ? format(new Date(stats.latest), "dd MMM yyyy", { locale: fr }) : "Aucun"}
              </p>
              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 uppercase">Stockage Utilisé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{BiaReportStorage.formatSize(stats.totalSize)}</p>
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generation Tools */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Génération de Rapports</CardTitle>
              <CardDescription>Visualisez et exportez vos données BIA sous différents formats</CardDescription>
            </div>
            <div className="flex gap-2">
               <Button variant="outline" size="sm" onClick={loadReports}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Actualiser
               </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              className="h-auto py-4 flex flex-col gap-2 bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
              onClick={handleGenerateGlobalReport}
              disabled={isGenerating || processes.length === 0}
            >
              <FileText className="h-6 w-6 mb-1" />
              <div className="text-center">
                <p className="font-bold">Synthèse Globale</p>
                <p className="text-[10px] opacity-80">Tous les processus (PDF)</p>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col gap-2 border-dashed border-2 hover:bg-muted/50"
            >
              <BarChart3 className="h-6 w-6 mb-1 text-purple-600" />
              <div className="text-center text-purple-900">
                <p className="font-bold text-black">Analyse des Risques</p>
                <p className="text-[10px] text-muted-foreground">Focus sur la criticité</p>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col gap-2 border-dashed border-2 hover:bg-muted/50"
            >
              <RefreshCw className="h-6 w-6 mb-1 text-green-600" />
              <div className="text-center text-green-900">
                <p className="font-bold text-black">Gaps de Continuité</p>
                <p className="text-[10px] text-muted-foreground">Différences RTO/MTPD</p>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col gap-2 border-dashed border-2 hover:bg-muted/50"
            >
              <FileJson className="h-6 w-6 mb-1 text-amber-600" />
              <div className="text-center text-amber-900">
                <p className="font-bold text-black">Export de Données</p>
                <p className="text-[10px] text-muted-foreground">Format JSON (Brut)</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des Rapports</CardTitle>
          <CardDescription>Liste de vos derniers rapports générés sur la plateforme</CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rapport</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Taille</TableHead>
                    <TableHead>Métriques</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileType className="h-4 w-4 text-blue-500" />
                          <span>{report.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="uppercase text-[10px]">
                          {report.format}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(report.generatedAt), "dd/MM/yyyy HH:mm", { locale: fr })}
                      </TableCell>
                      <TableCell className="text-sm">
                        {BiaReportStorage.formatSize(report.size)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-[9px] bg-blue-50">
                            {report.metadata.totalProcesses} Proc.
                          </Badge>
                          <Badge variant="outline" className="text-[9px] bg-red-50 text-red-600">
                            {report.metadata.riskCount} Risques
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" title="Télécharger">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(report.id)}
                            title="Supprimer"
                          >
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
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-20" />
              <h3 className="text-lg font-medium">Aucun rapport généré</h3>
              <p className="text-muted-foreground mb-4">Commencez par générer votre premier rapport de synthèse.</p>
              <Button size="sm" onClick={handleGenerateGlobalReport}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Générer maintenant
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
