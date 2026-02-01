import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// Générer un token unique pour le partage
function generateShareToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Types pour le calcul des statistiques
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
  };
  recommendations: string[];
  majorRisks: Array<{
    type: string;
    description: string;
    severity: "Critique" | "Élevé" | "Moyen";
    processes: string[];
  }>;
};

type ProcessType = {
  id: string;
  name: string;
  criticality: "critical" | "high" | "medium" | "low";
  department: string;
  rto: number;
  rpo: number;
  mtpd: number;
};

function calculateProcessStats(processes: ProcessType[]): ProcessStats {
  const stats: ProcessStats = {
    total: processes.length,
    byCriticality: { critical: 0, high: 0, medium: 0, low: 0 },
    byDepartment: {},
    averageRTO: 0,
    averageRPO: 0,
    averageMTPD: 0,
    processesNeedingAttention: 0,
    globalContinuityLevel: { score: 0, level: "Critique" },
    recommendations: [],
    majorRisks: [],
  };

  if (processes.length === 0) return stats;

  let totalRTO = 0,
    totalRPO = 0,
    totalMTPD = 0;

  processes.forEach((process) => {
    const criticality = process.criticality as keyof typeof stats.byCriticality;
    stats.byCriticality[criticality]++;
    stats.byDepartment[process.department] =
      (stats.byDepartment[process.department] || 0) + 1;
    totalRTO += process.rto;
    totalRPO += process.rpo;
    totalMTPD += process.mtpd;
    if (process.rto > 24 || process.criticality === "critical") {
      stats.processesNeedingAttention++;
    }
  });

  stats.averageRTO = Math.round(totalRTO / processes.length);
  stats.averageRPO = Math.round(totalRPO / processes.length);
  stats.averageMTPD = Math.round(totalMTPD / processes.length);

  // Calcul du score de continuité
  let score = 100;
  score -= stats.byCriticality.critical * 15;
  score -= stats.byCriticality.high * 8;
  score -= stats.byCriticality.medium * 3;
  if (stats.averageRTO > 72) score -= 20;
  else if (stats.averageRTO > 48) score -= 15;
  else if (stats.averageRTO > 24) score -= 10;
  score = Math.max(0, Math.min(100, score));

  let level: "Excellent" | "Bon" | "Moyen" | "Faible" | "Critique";
  if (score >= 85) level = "Excellent";
  else if (score >= 70) level = "Bon";
  else if (score >= 55) level = "Moyen";
  else if (score >= 40) level = "Faible";
  else level = "Critique";

  stats.globalContinuityLevel = { score: Math.round(score), level };

  // Recommandations
  if (stats.byCriticality.critical > 0) {
    stats.recommendations.push(
      `Révision urgente des ${stats.byCriticality.critical} processus critiques`
    );
  }
  if (stats.averageRTO > 24) {
    stats.recommendations.push(
      "Optimiser les temps de récupération (RTO moyen élevé)"
    );
  }
  if (stats.averageRPO > 8) {
    stats.recommendations.push("Améliorer la fréquence des sauvegardes");
  }

  // Risques majeurs
  if (stats.byCriticality.critical > 0) {
    stats.majorRisks.push({
      type: "Processus Critiques",
      description: `${stats.byCriticality.critical} processus critiques identifiés nécessitant une attention immédiate`,
      severity: "Critique",
      processes: processes
        .filter((p) => p.criticality === "critical")
        .map((p) => p.name),
    });
  }

  return stats;
}

/**
 * API Route: POST /api/bia/reports/generate
 * Génère un nouveau rapport BIA basé sur les données de l'usine
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const { factoryId, name, format, description, includedProcessIds } = body;

    if (!factoryId || !name) {
      return NextResponse.json(
        { error: "factoryId et name sont requis" },
        { status: 400 }
      );
    }

    // Récupérer l'usine avec les processus sélectionnés uniquement
    const factory = await prisma.factory.findUnique({
      where: { id: factoryId },
      include: {
        processes: {
          where:
            includedProcessIds && includedProcessIds.length > 0
              ? { id: { in: includedProcessIds } }
              : undefined,
          select: {
            id: true,
            name: true,
            description: true,
            department: true,
            location: true,
            impact: true,
            criticality: true,
            rto: true,
            rpo: true,
            mtpd: true,
            mbco: true,
            processOwner: true,
            ownerRole: true,
          },
        },
        manager: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!factory) {
      return NextResponse.json({ error: "Usine non trouvée" }, { status: 404 });
    }

    // Calculer les statistiques
    const stats = calculateProcessStats(factory.processes);

    // Construire les données du rapport
    const reportData = {
      metadata: {
        generatedAt: new Date().toISOString(),
        version: "1.0",
        type: "BIA_FACTORY_REPORT",
        factory: {
          id: factory.id,
          name: factory.name,
          code: factory.code,
          address: factory.address,
          city: factory.city,
          country: factory.country,
          manager: factory.manager
            ? {
                name: `${factory.manager.firstName} ${factory.manager.lastName}`,
                email: factory.manager.email,
              }
            : null,
        },
      },
      summary: {
        totalProcesses: stats.total,
        globalContinuityLevel: stats.globalContinuityLevel,
        averageMetrics: {
          rto: stats.averageRTO,
          rpo: stats.averageRPO,
          mtpd: stats.averageMTPD,
        },
        criticality: stats.byCriticality,
        departments: stats.byDepartment,
        processesNeedingAttention: stats.processesNeedingAttention,
      },
      risks: stats.majorRisks,
      recommendations: stats.recommendations,
      processes: factory.processes.map(
        (p: {
          id: string;
          name: string;
          description: string | null;
          department: string | null;
          location: string | null;
          impact: string | null;
          criticality: string;
          rto: number;
          mtpd: number;
          rpo: number;
          mbco: string | null;
          processOwner: string | null;
          ownerRole: string | null;
        }) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          department: p.department,
          location: p.location,
          impact: p.impact,
          criticality: p.criticality,
          rto: p.rto,
          rpo: p.rpo,
          mtpd: p.mtpd,
          mbco: p.mbco,
          owner: p.processOwner
            ? {
                name: p.processOwner,
                role: p.ownerRole,
              }
            : null,
        })
      ),
    };

    // Créer le rapport BIA dans la base de données
    const report = await prisma.biaReport.create({
      data: {
        name,
        description: description || `Rapport BIA pour ${factory.name}`,
        status: "GENERATED",
        format: format || "PDF",
        reportData,
        totalProcesses: stats.total,
        continuityLevel: stats.globalContinuityLevel.score,
        continuityLevelText: stats.globalContinuityLevel.level,
        riskCount: stats.majorRisks.length,
        recommendationCount: stats.recommendations.length,
        shareToken: generateShareToken(),
        includedProcessIds: factory.processes.map((p: { id: string }) => p.id),
        factoryId,
        authorId: session.user.id,
      },
      include: {
        factory: {
          select: {
            name: true,
            code: true,
          },
        },
        author: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        report,
        message: "Rapport BIA généré avec succès",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de la génération du rapport:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la génération du rapport",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
