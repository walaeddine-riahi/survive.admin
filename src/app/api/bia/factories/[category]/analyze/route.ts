import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface ReportAnalysis {
  reportId: string;
  reportName: string;
  analysis: {
    metrics?: { rto?: number; mtpd?: number; mbco?: number };
    criticality?: { score?: number; level?: string };
    continuityLevel?: { score?: number; level?: string };
    impacts?: Impact[];
    spof?: Spof[];
    dependencies?: Dependency[];
    continuityNeeds?: ContinuityNeeds;
  };
}

interface Impact {
  type?: string;
  description?: string;
  severity?: string;
  sourceReport?: string;
}

interface Spof {
  name?: string;
  description?: string;
  risk?: string;
  mitigation?: string;
  sourceReport?: string;
}

interface Dependency {
  name?: string;
  type?: string;
  description?: string;
  sourceReport?: string;
}

interface ContinuityNeeds {
  equipment?: ContinuityItem[];
  skills?: ContinuityItem[];
  technology?: ContinuityItem[];
  suppliers?: ContinuityItem[];
  data?: ContinuityItem[];
  facilities?: ContinuityItem[];
  regulations?: ContinuityItem[];
}

interface ContinuityItem {
  name?: string;
  title?: string;
  description?: string;
  sourceReport?: string;
}

interface ReportDetail {
  id: string;
  name: string;
  criticality: string;
  continuityLevel: string;
}

interface ConsolidatedAnalysis {
  usineName: string;
  totalReports: number;
  totalProcesses: number;
  analysisDate: string;
  reportDetails: ReportDetail[];
  metrics: {
    rto: number;
    mtpd: number;
    mbco: number;
    description: string;
  };
  criticality: {
    level: string;
    score: number;
    factors: string[];
  };
  continuityLevel: {
    level: string;
    score: number;
    description: string;
  };
  impacts: Impact[];
  spof: Spof[];
  dependencies: Dependency[];
  continuityNeeds: ContinuityNeeds;
  recommendations: string[];
}

export async function POST(
  request: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    console.log("🏭 Analyse consolidée de l'usine demandée");

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const category = decodeURIComponent(params.category);
    console.log(`📊 Usine: ${category}`);
    console.log(`👤 Utilisateur: ${session.user.email}`);

    // Récupérer tous les rapports de cette usine
    const reports = await prisma.biaReport.findMany({
      where: {
        category: category === "Sans usine" ? null : category,
        authorId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        reportData: true,
        continuityLevel: true,
        continuityLevelText: true,
      },
    });

    console.log(`📝 ${reports.length} rapport(s) trouvé(s) pour cette usine`);

    if (reports.length === 0) {
      return NextResponse.json(
        { error: "Aucun rapport trouvé pour cette usine" },
        { status: 404 }
      );
    }

    // Extraire les analyses de chaque rapport
    const analyses: ReportAnalysis[] = [];
    for (const report of reports) {
      if (
        report.reportData &&
        typeof report.reportData === "object" &&
        "analysis" in report.reportData
      ) {
        const reportData = report.reportData as Record<string, unknown>;
        analyses.push({
          reportId: report.id,
          reportName: report.name,
          analysis: reportData.analysis as ReportAnalysis["analysis"],
        });
      }
    }

    console.log(`✅ ${analyses.length} analyse(s) trouvée(s)`);

    if (analyses.length === 0) {
      return NextResponse.json(
        { error: "Aucune analyse disponible pour cette usine" },
        { status: 404 }
      );
    }

    // Consolider les analyses
    const consolidatedAnalysis = consolidateAnalyses(analyses, category);

    console.log("🎯 Analyse consolidée créée avec succès");
    console.log(`   • ${consolidatedAnalysis.totalReports} rapports`);
    console.log(`   • ${consolidatedAnalysis.totalProcesses} processus`);
    console.log(`   • ${consolidatedAnalysis.impacts.length} impacts`);
    console.log(`   • ${consolidatedAnalysis.spof.length} SPOF`);

    return NextResponse.json({
      success: true,
      analysis: consolidatedAnalysis,
    });
  } catch (error) {
    console.error("❌ Erreur lors de l'analyse de l'usine:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'analyse de l'usine" },
      { status: 500 }
    );
  }
}

function consolidateAnalyses(
  analyses: ReportAnalysis[],
  usineName: string
): ConsolidatedAnalysis {
  const allImpacts: Impact[] = [];
  const allSpof: Spof[] = [];
  const allDependencies: Dependency[] = [];
  const allContinuityNeeds: ContinuityNeeds = {
    equipment: [],
    skills: [],
    technology: [],
    suppliers: [],
    data: [],
    facilities: [],
    regulations: [],
  };

  let totalRto = 0;
  let totalMtpd = 0;
  let totalMbco = 0;
  let totalCriticalityScore = 0;
  let totalContinuityScore = 0;
  let rtoCount = 0;
  let mtpdCount = 0;
  let mbcoCount = 0;

  const reportDetails: ReportDetail[] = [];

  // Parcourir toutes les analyses
  analyses.forEach(({ reportId, reportName, analysis }) => {
    reportDetails.push({
      id: reportId,
      name: reportName,
      criticality: analysis.criticality?.level || "moyen",
      continuityLevel: analysis.continuityLevel?.level || "jaune",
    });

    // Métriques
    if (analysis.metrics?.rto) {
      totalRto += analysis.metrics.rto;
      rtoCount++;
    }
    if (analysis.metrics?.mtpd) {
      totalMtpd += analysis.metrics.mtpd;
      mtpdCount++;
    }
    if (analysis.metrics?.mbco) {
      totalMbco += analysis.metrics.mbco;
      mbcoCount++;
    }

    // Criticité
    if (analysis.criticality?.score) {
      totalCriticalityScore += analysis.criticality.score;
    }

    // Niveau de continuité
    if (analysis.continuityLevel?.score) {
      totalContinuityScore += analysis.continuityLevel.score;
    }

    // Impacts
    if (Array.isArray(analysis.impacts)) {
      analysis.impacts.forEach((impact) => {
        allImpacts.push({
          ...impact,
          sourceReport: reportName,
        });
      });
    }

    // SPOF
    if (Array.isArray(analysis.spof)) {
      analysis.spof.forEach((spof) => {
        allSpof.push({
          ...spof,
          sourceReport: reportName,
        });
      });
    }

    // Dépendances
    if (Array.isArray(analysis.dependencies)) {
      analysis.dependencies.forEach((dep) => {
        allDependencies.push({
          ...dep,
          sourceReport: reportName,
        });
      });
    }

    // Besoins de continuité
    if (analysis.continuityNeeds) {
      Object.keys(allContinuityNeeds).forEach((key) => {
        const needsKey = key as keyof ContinuityNeeds;
        if (Array.isArray(analysis.continuityNeeds?.[needsKey])) {
          analysis.continuityNeeds[needsKey]?.forEach((item) => {
            allContinuityNeeds[needsKey]?.push({
              ...item,
              sourceReport: reportName,
            });
          });
        }
      });
    }
  });

  // Calculer les moyennes
  const avgRto = rtoCount > 0 ? Math.round(totalRto / rtoCount) : 0;
  const avgMtpd = mtpdCount > 0 ? Math.round(totalMtpd / mtpdCount) : 0;
  const avgMbco = mbcoCount > 0 ? Math.round(totalMbco / mbcoCount) : 0;
  const avgCriticality =
    analyses.length > 0 ? totalCriticalityScore / analyses.length : 0;
  const avgContinuity =
    analyses.length > 0 ? totalContinuityScore / analyses.length : 0;

  // Déterminer le niveau de criticité global
  let criticalityLevel = "moyen";
  if (avgCriticality >= 8) criticalityLevel = "critique";
  else if (avgCriticality >= 6) criticalityLevel = "élevé";
  else if (avgCriticality >= 4) criticalityLevel = "moyen";
  else criticalityLevel = "faible";

  // Déterminer le niveau de continuité global
  let continuityLevel = "jaune";
  if (avgContinuity >= 8) continuityLevel = "vert";
  else if (avgContinuity >= 5) continuityLevel = "jaune";
  else continuityLevel = "rouge";

  return {
    usineName,
    totalReports: analyses.length,
    totalProcesses: analyses.length, // Chaque rapport représente un processus
    analysisDate: new Date().toISOString(),

    reportDetails,

    metrics: {
      rto: avgRto,
      mtpd: avgMtpd,
      mbco: avgMbco,
      description: `Moyennes calculées sur ${analyses.length} rapport(s)`,
    },

    criticality: {
      level: criticalityLevel,
      score: Math.round(avgCriticality * 10) / 10,
      factors: [
        `${analyses.length} processus analysés`,
        `RTO moyen: ${avgRto}h`,
        `MTPD moyen: ${avgMtpd}h`,
      ],
    },

    continuityLevel: {
      level: continuityLevel,
      score: Math.round(avgContinuity * 10) / 10,
      description: `Niveau de continuité global de l'usine`,
    },

    impacts: allImpacts,
    spof: allSpof,
    dependencies: allDependencies,
    continuityNeeds: allContinuityNeeds,

    recommendations: generateConsolidatedRecommendations(
      allImpacts,
      allSpof,
      allDependencies,
      avgRto,
      criticalityLevel
    ),
  };
}

function generateConsolidatedRecommendations(
  impacts: Impact[],
  spof: Spof[],
  dependencies: Dependency[],
  avgRto: number,
  criticalityLevel: string
): string[] {
  const recommendations: string[] = [];

  // Recommandations basées sur la criticité
  if (criticalityLevel === "critique" || criticalityLevel === "élevé") {
    recommendations.push(
      "⚠️ Usine à criticité élevée : Mettre en place un plan de continuité d'activité prioritaire"
    );
  }

  // Recommandations basées sur le RTO
  if (avgRto > 24) {
    recommendations.push(
      "⏱️ RTO élevé : Améliorer la résilience des processus critiques pour réduire le temps de récupération"
    );
  }

  // Recommandations basées sur les SPOF
  if (spof.length > 5) {
    recommendations.push(
      `🔴 ${spof.length} points de défaillance uniques identifiés : Prioriser la mise en place de redondances`
    );
  }

  // Recommandations basées sur les impacts
  const highImpacts = impacts.filter(
    (i) => i.severity === "high" || i.severity === "critique"
  );
  if (highImpacts.length > 3) {
    recommendations.push(
      `💥 ${highImpacts.length} impacts majeurs : Développer des stratégies de mitigation spécifiques`
    );
  }

  // Recommandations basées sur les dépendances
  const externalDeps = dependencies.filter((d) => d.type === "external");
  if (externalDeps.length > 5) {
    recommendations.push(
      `🔗 ${externalDeps.length} dépendances externes : Évaluer les risques fournisseurs et établir des plans B`
    );
  }

  // Recommandation générale
  recommendations.push(
    "📋 Réaliser des exercices de simulation de crise au niveau de l'usine"
  );

  return recommendations;
}
