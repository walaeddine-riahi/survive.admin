"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

// Types pour les rapports BIA
export interface BiaReportData {
  id?: string;
  name: string;
  description?: string;
  format: "PDF" | "DOCX" | "JSON" | "HTML";
  status?: "DRAFT" | "GENERATED" | "ARCHIVED" | "SHARED";
  totalProcesses: number;
  continuityLevel: number;
  continuityLevelText: string;
  riskCount: number;
  recommendationCount: number;
  reportData: Record<string, unknown>;
  content?: string;
  fileName?: string;
  filePath?: string;
  fileSize: number;
  mimeType?: string;
  generationParams?: Record<string, unknown> | null;
  includedProcessIds: string[];
  isPublic?: boolean;
  tags?: string[];
  category?: string;
}

// Créer un nouveau rapport BIA
export async function createBiaReport(data: BiaReportData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Utilisateur non authentifié",
      };
    }

    const report = await prisma.biaReport.create({
      data: {
        name: data.name,
        description: data.description,
        format: data.format,
        status: data.status || "GENERATED",
        totalProcesses: data.totalProcesses,
        continuityLevel: data.continuityLevel,
        continuityLevelText: data.continuityLevelText,
        riskCount: data.riskCount,
        recommendationCount: data.recommendationCount,
        reportData: data.reportData,
        content: data.content || "",
        fileName: data.fileName,
        filePath: data.filePath,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        generationParams: data.generationParams,
        includedProcessIds: data.includedProcessIds,
        isPublic: data.isPublic || false,
        tags: data.tags || [],
        category: data.category,
        authorId: session.user.id,
        // Générer un shareToken unique pour éviter les conflits
        shareToken: crypto.randomBytes(32).toString("hex"),
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    revalidatePath("/bia/reports");
    revalidatePath("/bia/dashboard");

    return {
      success: true,
      data: report,
    };
  } catch (error) {
    console.error("Erreur lors de la création du rapport:", error);
    return {
      success: false,
      error: "Erreur lors de la création du rapport",
    };
  }
}

// Récupérer tous les rapports BIA
export async function getAllBiaReports(params?: {
  format?: "PDF" | "DOCX" | "JSON" | "HTML";
  status?: "DRAFT" | "GENERATED" | "ARCHIVED" | "SHARED";
  search?: string;
  authorId?: string;
  tags?: string[];
  category?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Utilisateur non authentifié",
      };
    }

    const where: Record<string, unknown> = {};

    // Filtres
    if (params?.format) where.format = params.format;
    if (params?.status) where.status = params.status;
    if (params?.authorId) where.authorId = params.authorId;
    if (params?.category) where.category = params.category;

    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
      ];
    }

    if (params?.tags && params.tags.length > 0) {
      where.tags = { hasSome: params.tags };
    }

    const reports = await prisma.biaReport.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: params?.offset,
      take: params?.limit || 50,
    });

    // Compter le total
    const total = await prisma.biaReport.count({ where });

    return {
      success: true,
      data: reports,
      total,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des rapports:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des rapports",
    };
  }
}

// Récupérer un rapport BIA par ID
export async function getBiaReportById(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Utilisateur non authentifié",
      };
    }

    const report = await prisma.biaReport.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!report) {
      return {
        success: false,
        error: "Rapport non trouvé",
      };
    }

    return {
      success: true,
      data: report,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération du rapport:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération du rapport",
    };
  }
}

// Mettre à jour un rapport BIA
export async function updateBiaReport(
  id: string,
  updates: Partial<BiaReportData>
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Utilisateur non authentifié",
      };
    }

    // Vérifier que l'utilisateur est l'auteur ou admin
    const existingReport = await prisma.biaReport.findUnique({
      where: { id },
    });

    if (!existingReport) {
      return {
        success: false,
        error: "Rapport non trouvé",
      };
    }

    if (existingReport.authorId !== session.user.id) {
      return {
        success: false,
        error: "Vous n'avez pas l'autorisation de modifier ce rapport",
      };
    }

    const updatedReport = await prisma.biaReport.update({
      where: { id },
      data: {
        name: updates.name,
        description: updates.description,
        format: updates.format,
        status: updates.status,
        totalProcesses: updates.totalProcesses,
        continuityLevel: updates.continuityLevel,
        continuityLevelText: updates.continuityLevelText,
        riskCount: updates.riskCount,
        recommendationCount: updates.recommendationCount,
        reportData: updates.reportData,
        content: updates.content,
        fileName: updates.fileName,
        filePath: updates.filePath,
        fileSize: updates.fileSize,
        mimeType: updates.mimeType,
        generationParams: updates.generationParams,
        includedProcessIds: updates.includedProcessIds,
        isPublic: updates.isPublic,
        tags: updates.tags,
        category: updates.category,
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    revalidatePath("/bia/reports");
    revalidatePath(`/bia/reports/${id}`);

    return {
      success: true,
      data: updatedReport,
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du rapport:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour du rapport",
    };
  }
}

// Supprimer un rapport BIA
export async function deleteBiaReport(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Utilisateur non authentifié",
      };
    }

    // Vérifier que l'utilisateur est l'auteur ou admin
    const existingReport = await prisma.biaReport.findUnique({
      where: { id },
    });

    if (!existingReport) {
      return {
        success: false,
        error: "Rapport non trouvé",
      };
    }

    if (existingReport.authorId !== session.user.id) {
      return {
        success: false,
        error: "Vous n'avez pas l'autorisation de supprimer ce rapport",
      };
    }

    await prisma.biaReport.delete({
      where: { id },
    });

    revalidatePath("/bia/reports");

    return {
      success: true,
      message: "Rapport supprimé avec succès",
    };
  } catch (error) {
    console.error("Erreur lors de la suppression du rapport:", error);
    return {
      success: false,
      error: "Erreur lors de la suppression du rapport",
    };
  }
}

// Partager un rapport (générer un token de partage public)
export async function shareBiaReport(id: string, expiresInDays?: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Utilisateur non authentifié",
      };
    }

    const existingReport = await prisma.biaReport.findUnique({
      where: { id },
    });

    if (!existingReport) {
      return {
        success: false,
        error: "Rapport non trouvé",
      };
    }

    if (existingReport.authorId !== session.user.id) {
      return {
        success: false,
        error: "Vous n'avez pas l'autorisation de partager ce rapport",
      };
    }

    // Générer un token de partage unique
    const shareToken = crypto.randomBytes(32).toString("hex");

    // Calculer la date d'expiration
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : undefined;

    await prisma.biaReport.update({
      where: { id },
      data: {
        isPublic: true,
        shareToken,
        expiresAt,
        status: "SHARED",
      },
    });

    return {
      success: true,
      data: {
        shareToken,
        shareUrl: `${process.env.NEXTAUTH_URL}/bia/reports/shared/${shareToken}`,
        expiresAt,
      },
    };
  } catch (error) {
    console.error("Erreur lors du partage du rapport:", error);
    return {
      success: false,
      error: "Erreur lors du partage du rapport",
    };
  }
}

// Accéder à un rapport partagé par token
export async function getSharedBiaReport(shareToken: string) {
  try {
    const report = await prisma.biaReport.findUnique({
      where: { shareToken },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!report) {
      return {
        success: false,
        error: "Lien de partage invalide",
      };
    }

    if (!report.isPublic) {
      return {
        success: false,
        error: "Ce rapport n'est plus partagé publiquement",
      };
    }

    if (report.expiresAt && report.expiresAt < new Date()) {
      return {
        success: false,
        error: "Ce lien de partage a expiré",
      };
    }

    // Incrémenter le compteur de téléchargements
    await prisma.biaReport.update({
      where: { id: report.id },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });

    return {
      success: true,
      data: report,
    };
  } catch (error) {
    console.error("Erreur lors de l'accès au rapport partagé:", error);
    return {
      success: false,
      error: "Erreur lors de l'accès au rapport partagé",
    };
  }
}

// Obtenir les statistiques des rapports
export async function getBiaReportsStats() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Utilisateur non authentifié",
      };
    }

    const totalReports = await prisma.biaReport.count();
    const reportsByFormat = await prisma.biaReport.groupBy({
      by: ["format"],
      _count: {
        _all: true,
      },
    });

    const reportsByStatus = await prisma.biaReport.groupBy({
      by: ["status"],
      _count: {
        _all: true,
      },
    });

    const recentReports = await prisma.biaReport.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    });

    const publicReports = await prisma.biaReport.count({
      where: {
        isPublic: true,
      },
    });

    return {
      success: true,
      data: {
        totalReports,
        reportsByFormat,
        reportsByStatus,
        recentReports,
        publicReports,
      },
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des statistiques",
    };
  }
}
