"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  Share2,
  Trash2,
  Eye,
  Calendar,
  User,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// Define custom types based on the actual BiaReport model
type BiaReport = {
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

type UserType = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
};

type BiaReportWithAuthor = BiaReport & {
  author: UserType;
};

interface BiaReportCardProps {
  report: BiaReportWithAuthor;
  onView: (report: BiaReportWithAuthor) => void;
  onDownload: (report: BiaReportWithAuthor) => void;
  onShare: (report: BiaReportWithAuthor) => void;
  onDelete: (report: BiaReportWithAuthor) => void;
}

export function BiaReportCard({
  report,
  onView,
  onDownload,
  onShare,
  onDelete,
}: BiaReportCardProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "GENERATED":
        return "bg-green-100 text-green-800";
      case "SHARED":
        return "bg-blue-100 text-blue-800";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getFormatIcon = () => {
    return <FileText className="h-4 w-4" />;
  };

  const getContinuityColor = (level: number) => {
    if (level >= 85) return "text-green-600";
    if (level >= 70) return "text-blue-600";
    if (level >= 55) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{report.name}</CardTitle>
            {report.description && (
              <CardDescription className="mt-1">
                {report.description.length > 100
                  ? `${report.description.substring(0, 100)}...`
                  : report.description}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Badge className={getStatusColor(report.status)}>
              {report.status}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              {getFormatIcon()}
              {report.format}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Métriques principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold">{report.totalProcesses}</div>
              <div className="text-xs text-muted-foreground">Processus</div>
            </div>
            <div className="text-center">
              <div
                className={`text-lg font-bold ${getContinuityColor(
                  report.continuityLevel
                )}`}
              >
                {report.continuityLevel}/100
              </div>
              <div className="text-xs text-muted-foreground">Continuité</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">
                {report.riskCount}
              </div>
              <div className="text-xs text-muted-foreground">Risques</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {report.recommendationCount}
              </div>
              <div className="text-xs text-muted-foreground">
                Recommandations
              </div>
            </div>
          </div>

          {/* Tags */}
          {report.tags && report.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {report.tags.slice(0, 3).map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {report.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{report.tags.length - 3} autres
                </Badge>
              )}
            </div>
          )}

          {/* Informations supplémentaires */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {report.author.firstName && report.author.lastName
                ? `${report.author.firstName} ${report.author.lastName}`
                : report.author.email}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
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

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(report)}
              className="flex items-center gap-1"
            >
              <Eye className="h-3 w-3" />
              Voir
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload(report)}
              className="flex items-center gap-1"
            >
              <Download className="h-3 w-3" />
              Télécharger
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onShare(report)}
              className="flex items-center gap-1"
            >
              <Share2 className="h-3 w-3" />
              {report.isPublic ? "Partagé" : "Partager"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(report)}
              className="flex items-center gap-1 text-red-600 hover:text-red-700 ml-auto"
            >
              <Trash2 className="h-3 w-3" />
              Supprimer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
