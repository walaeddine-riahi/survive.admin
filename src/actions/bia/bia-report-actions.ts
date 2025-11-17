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
  factoryId?: string;
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
        reportData:
          data.reportData as import("@prisma/client").Prisma.InputJsonValue,
        content: data.content || "",
        fileName: data.fileName,
        filePath: data.filePath,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        generationParams:
          data.generationParams as import("@prisma/client").Prisma.InputJsonValue,
        includedProcessIds: data.includedProcessIds,
        isPublic: data.isPublic || false,
        tags: data.tags || [],
        category: data.category,
        factoryId: data.factoryId,
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
        reportData:
          updates.reportData as import("@prisma/client").Prisma.InputJsonValue,
        content: updates.content,
        fileName: updates.fileName,
        filePath: updates.filePath,
        fileSize: updates.fileSize,
        mimeType: updates.mimeType,
        generationParams:
          updates.generationParams as import("@prisma/client").Prisma.InputJsonValue,
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

// Créer un rapport BIA à partir d'un processus
export async function createBiaReportFromProcess(
  processId: string,
  reportName: string,
  reportDescription?: string
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Utilisateur non authentifié",
      };
    }

    // Récupérer le processus avec toutes ses données
    const process = await prisma.process.findUnique({
      where: { id: processId },
      include: {
        factory: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!process) {
      return {
        success: false,
        error: "Processus introuvable",
      };
    }

    // Parser les données JSON - accès aux champs JSON Prisma
    type ProcessWithJsonFields = typeof process & {
      activitesCritiques?: string;
      fournisseursExternes?: string;
      obligationsLegales?: string;
      systemesInformatiques?: string;
      infrastructuresPhysiques?: string;
      rolesPersonnel?: string;
      equipementsIndustriels?: string;
      equipementsBureautiques?: string;
      documentationsCritiques?: string;
    };

    const processData = process as ProcessWithJsonFields;
    const activitesCritiques = processData.activitesCritiques
      ? JSON.parse(processData.activitesCritiques)
      : [];
    const fournisseursExternes = processData.fournisseursExternes
      ? JSON.parse(processData.fournisseursExternes)
      : [];
    const obligationsLegales = processData.obligationsLegales
      ? JSON.parse(processData.obligationsLegales)
      : [];
    const systemesInformatiques = processData.systemesInformatiques
      ? JSON.parse(processData.systemesInformatiques)
      : [];
    const infrastructuresPhysiques = processData.infrastructuresPhysiques
      ? JSON.parse(processData.infrastructuresPhysiques)
      : [];
    const rolesPersonnel = processData.rolesPersonnel
      ? JSON.parse(processData.rolesPersonnel)
      : [];
    const equipementsIndustriels = processData.equipementsIndustriels
      ? JSON.parse(processData.equipementsIndustriels)
      : [];
    const equipementsBureautiques = processData.equipementsBureautiques
      ? JSON.parse(processData.equipementsBureautiques)
      : [];
    const documentationsCritiques = processData.documentationsCritiques
      ? JSON.parse(processData.documentationsCritiques)
      : [];

    // Calculer les métriques du rapport
    const riskCount = activitesCritiques.filter(
      (a: { criticite: string }) =>
        a.criticite === "critical" || a.criticite === "high"
    ).length;

    // Calculer le niveau de continuité basé sur RTO et criticité
    let continuityLevel = 50;
    if (process.criticality === "critical" && process.rto <= 4) {
      continuityLevel = 90;
    } else if (process.criticality === "high" && process.rto <= 8) {
      continuityLevel = 75;
    } else if (process.criticality === "medium") {
      continuityLevel = 60;
    }

    const continuityLevelText =
      continuityLevel >= 80
        ? "Excellent"
        : continuityLevel >= 60
        ? "Bon"
        : continuityLevel >= 40
        ? "Moyen"
        : "Faible";

    // Compter les recommandations
    const recommendationCount =
      (process.hasBackupSystems ? 0 : 1) +
      (process.canWorkRemotely ? 0 : 1) +
      (process.canUseOtherInfra ? 0 : 1) +
      (fournisseursExternes.filter(
        (f: { planContinuiteActivite: string }) =>
          f.planContinuiteActivite !== "oui"
      ).length > 0
        ? 1
        : 0);

    // Construire les données du rapport
    const reportData = {
      process: {
        id: process.id,
        name: process.name,
        description: process.description,
        department: process.department,
        location: process.location,
        criticality: process.criticality,
        processOwner: process.processOwner,
        ownerRole: process.ownerRole,
        ownerEmail: process.ownerEmail,
        ownerPhone: process.ownerPhone,
        factory: process.factory,
      },
      metrics: {
        rto: process.rto,
        mtpd: process.mtpd,
        rpo: process.rpo,
        mbco: process.mbco,
        continuityLevel,
        continuityLevelText,
      },
      impacts: {
        financial: process.financialImpact,
        operational: process.operationalImpact,
        reputation: process.reputationImpact,
        operationalCapacity: process.operationalCapacityImpact,
      },
      scope: {
        mainFunctionality: process.mainFunctionality,
        productDependencies: process.productDependencies,
        interServiceDependencies: process.interServiceDependencies,
      },
      resources: {
        activitesCritiques,
        fournisseursExternes,
        obligationsLegales,
        systemesInformatiques,
        infrastructuresPhysiques,
        rolesPersonnel,
        equipementsIndustriels,
        equipementsBureautiques,
        documentationsCritiques,
      },
      analysis: {
        riskCount,
        recommendationCount,
        criticalActivities: activitesCritiques.length,
        criticalSuppliers: fournisseursExternes.length,
        criticalSystems: systemesInformatiques.length,
        criticalInfrastructure: infrastructuresPhysiques.length,
      },
      recommendations: generateRecommendations(process, {
        activitesCritiques,
        fournisseursExternes,
        systemesInformatiques,
      }),
    };

    // Créer le rapport
    const report = await prisma.biaReport.create({
      data: {
        name: reportName,
        description:
          reportDescription || `Rapport BIA généré pour ${process.name}`,
        format: "HTML",
        status: "GENERATED",
        totalProcesses: 1,
        continuityLevel,
        continuityLevelText,
        riskCount,
        recommendationCount,
        reportData:
          reportData as import("@prisma/client").Prisma.InputJsonValue,
        content: "", // Sera généré plus tard si nécessaire
        fileName: `${process.name.replace(/\s+/g, "_")}_BIA_Report.html`,
        filePath: null,
        fileSize: 0,
        mimeType: "text/html",
        generationParams: {
          processId: process.id,
          generatedAt: new Date().toISOString(),
        } as import("@prisma/client").Prisma.InputJsonValue,
        includedProcessIds: [process.id],
        isPublic: false,
        tags: [
          process.department,
          process.criticality,
          process.factory?.name || "Sans usine",
        ],
        category: "Rapport de processus",
        factoryId: process.factoryId,
        authorId: session.user.id,
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
    console.error(
      "Erreur lors de la création du rapport depuis le processus:",
      error
    );
    return {
      success: false,
      error: "Erreur lors de la création du rapport",
    };
  }
}

// Générer des recommandations basées sur l'analyse du processus
function generateRecommendations(
  process: {
    criticality: string;
    rto: number;
    mtpd: number;
    hasBackupSystems: boolean;
    canWorkRemotely: boolean;
    canUseOtherInfra: boolean;
    supplierContinuityPlan: boolean;
  },
  resources: {
    activitesCritiques: Array<{ criticite: string; nom: string }>;
    fournisseursExternes: Array<{
      nom: string;
      planContinuiteActivite: string;
    }>;
    systemesInformatiques: Array<{
      nom: string;
      sauvegardesEnPlace: string;
    }>;
  }
) {
  const recommendations: Array<{
    priority: "high" | "medium" | "low";
    category: string;
    title: string;
    description: string;
  }> = [];

  // Recommandations basées sur la criticité
  if (process.criticality === "critical" || process.criticality === "high") {
    if (!process.hasBackupSystems) {
      recommendations.push({
        priority: "high",
        category: "Systèmes de secours",
        title: "Mettre en place des systèmes de sauvegarde",
        description:
          "Pour un processus de criticité élevée, il est essentiel de disposer de systèmes de sauvegarde redondants.",
      });
    }

    if (process.rto > 4) {
      recommendations.push({
        priority: "high",
        category: "Temps de reprise",
        title: "Réduire le RTO",
        description:
          "Le RTO actuel est trop élevé pour un processus critique. Envisager des solutions pour réduire le temps de reprise.",
      });
    }
  }

  // Recommandations sur le télétravail
  if (!process.canWorkRemotely && process.criticality !== "low") {
    recommendations.push({
      priority: "medium",
      category: "Continuité d'activité",
      title: "Évaluer la possibilité de travail à distance",
      description:
        "Explorer les options de travail à distance pour assurer la continuité en cas d'indisponibilité du site.",
    });
  }

  // Recommandations sur les fournisseurs
  const suppliersWithoutBCP = resources.fournisseursExternes.filter(
    (f) => f.planContinuiteActivite !== "oui"
  );
  if (suppliersWithoutBCP.length > 0) {
    recommendations.push({
      priority: "high",
      category: "Fournisseurs",
      title: "Exiger des plans de continuité des fournisseurs",
      description: `${
        suppliersWithoutBCP.length
      } fournisseur(s) n'ont pas de plan de continuité d'activité documenté : ${suppliersWithoutBCP
        .map((f) => f.nom)
        .join(", ")}`,
    });
  }

  // Recommandations sur les systèmes IT
  const systemsWithoutBackup = resources.systemesInformatiques.filter(
    (s) => s.sauvegardesEnPlace !== "oui"
  );
  if (systemsWithoutBackup.length > 0) {
    recommendations.push({
      priority: "high",
      category: "Systèmes informatiques",
      title: "Mettre en place des sauvegardes pour tous les systèmes critiques",
      description: `${
        systemsWithoutBackup.length
      } système(s) n'ont pas de sauvegardes en place : ${systemsWithoutBackup
        .map((s) => s.nom)
        .join(", ")}`,
    });
  }

  // Recommandations sur les activités critiques
  const criticalActivities = resources.activitesCritiques.filter(
    (a) => a.criticite === "critical"
  );
  if (criticalActivities.length > 3) {
    recommendations.push({
      priority: "medium",
      category: "Activités critiques",
      title: "Revoir la classification des activités critiques",
      description:
        "Un nombre élevé d'activités critiques peut indiquer un besoin de revoir la classification ou de mettre en place des redondances.",
    });
  }

  // Recommandation sur l'infrastructure alternative
  if (!process.canUseOtherInfra && process.criticality !== "low") {
    recommendations.push({
      priority: "medium",
      category: "Infrastructure",
      title: "Identifier des infrastructures alternatives",
      description:
        "Documenter et tester des infrastructures alternatives pour assurer la continuité en cas d'indisponibilité du site principal.",
    });
  }

  return recommendations;
}
