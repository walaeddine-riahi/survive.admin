"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Download,
  Eye,
  Calendar,
  User,
  HardDrive,
} from "lucide-react";
import { BiaReportViewer } from "./bia-report-viewer";

interface BiaReportInfo {
  id: string;
  name: string;
  description?: string;
  format: string;
  fileName?: string;
  filePath?: string;
  fileSize: number;
  mimeType?: string;
  author: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  tags: string[];
  category?: string;
}

export function BiaReportManager() {
  const [reports, setReports] = useState<BiaReportInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingReport, setViewingReport] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch("/api/bia/uploaded-reports");
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setReports(result.data || []);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des rapports:", error);
    } finally {
      setLoading(false);
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

  const downloadFile = async (reportId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/bia/download/${reportId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName || "rapport.pdf";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            Chargement des rapports...
          </p>
        </div>
      </div>
    );
  }

  // Si on visualise un rapport spécifique
  if (viewingReport) {
    return (
      <BiaReportViewer
        id={viewingReport}
        onBack={() => setViewingReport(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestionnaire de Rapports BIA</h2>
          <p className="text-muted-foreground">
            {reports.length} rapport(s) uploadé(s)
          </p>
        </div>
        <Button onClick={fetchReports} variant="outline">
          Actualiser
        </Button>
      </div>

      <div className="grid gap-4">
        {reports.map((report) => (
          <Card key={report.id} className="w-full">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {report.name}
                  </CardTitle>
                  {report.description && (
                    <CardDescription>{report.description}</CardDescription>
                  )}
                </div>
                <Badge variant="secondary">{report.format}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Informations du fichier */}
              {report.fileName && (
                <div className="bg-muted p-3 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Fichier:</span>
                    </div>
                    <div className="md:col-span-3 truncate">
                      {report.fileName}
                    </div>

                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Taille:</span>
                    </div>
                    <div>{formatFileSize(report.fileSize)}</div>

                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Auteur:</span>
                    </div>
                    <div>
                      {report.author.firstName} {report.author.lastName}
                    </div>
                  </div>
                </div>
              )}

              {/* Tags et catégorie */}
              {(report.tags.length > 0 || report.category) && (
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
              )}

              {/* Date de création */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Créé le {formatDate(report.createdAt)}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadFile(report.id, report.fileName || "rapport")
                  }
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Télécharger
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingReport(report.id)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Voir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {reports.length === 0 && (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <div className="text-center">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Aucun rapport uploadé pour le moment
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
