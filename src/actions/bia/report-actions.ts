"use server";

import { getAllProcesses } from "@/actions/bia/process-actions";

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

type Process = {
  id: string;
  name: string;
  description: string | null;
  department: string;
  location: string;
  impact: string;
  criticality: "low" | "medium" | "high" | "critical";
  rto: number;
  mtpd: number;
  rpo: number;
  mbco: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};

function calculateProcessStats(processes: Process[]): ProcessStats {
  const stats: ProcessStats = {
    total: processes.length,
    byCriticality: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    },
    byDepartment: {},
    averageRTO: 0,
    averageRPO: 0,
    averageMTPD: 0,
    processesNeedingAttention: 0,
    globalContinuityLevel: {
      score: 0,
      level: "Critique",
      color: "red",
    },
    recommendations: [],
    majorRisks: [],
  };

  if (processes.length === 0) return stats;

  let totalRTO = 0;
  let totalRPO = 0;
  let totalMTPD = 0;

  processes.forEach((process) => {
    stats.byCriticality[process.criticality]++;

    if (!stats.byDepartment[process.department]) {
      stats.byDepartment[process.department] = 0;
    }
    stats.byDepartment[process.department]++;

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

  // Calcul du niveau de continuité global
  stats.globalContinuityLevel = calculateContinuityScore(stats, processes);
  stats.recommendations = generateRecommendations(stats, processes);
  stats.majorRisks = identifyMajorRisks(stats, processes);

  return stats;
}

function calculateContinuityScore(
  stats: Omit<
    ProcessStats,
    "globalContinuityLevel" | "recommendations" | "majorRisks"
  >,
  processes: Process[]
) {
  let score = 100;

  score -= stats.byCriticality.critical * 15;
  score -= stats.byCriticality.high * 8;
  score -= stats.byCriticality.medium * 3;

  if (stats.averageRTO > 72) score -= 20;
  else if (stats.averageRTO > 48) score -= 15;
  else if (stats.averageRTO > 24) score -= 10;
  else if (stats.averageRTO > 12) score -= 5;

  score -= Math.min(stats.processesNeedingAttention * 5, 30);

  const deptCount = Object.keys(stats.byDepartment).length;
  if (deptCount >= 5) score += 10;
  else if (deptCount >= 3) score += 5;

  const processesWithoutMbco = processes.filter(
    (p) => !p.mbco || p.mbco.trim() === ""
  ).length;
  if (processesWithoutMbco > 0) score -= processesWithoutMbco * 2;

  score = Math.max(0, Math.min(100, score));

  let level: "Excellent" | "Bon" | "Moyen" | "Faible" | "Critique";
  let color: string;

  if (score >= 85) {
    level = "Excellent";
    color = "green";
  } else if (score >= 70) {
    level = "Bon";
    color = "blue";
  } else if (score >= 55) {
    level = "Moyen";
    color = "orange";
  } else if (score >= 40) {
    level = "Faible";
    color = "red";
  } else {
    level = "Critique";
    color = "red";
  }

  return { score: Math.round(score), level, color };
}

function generateRecommendations(
  stats: Omit<
    ProcessStats,
    "globalContinuityLevel" | "recommendations" | "majorRisks"
  >,
  processes: Process[]
): string[] {
  const recommendations: string[] = [];

  if (stats.byCriticality.critical > 0) {
    recommendations.push(
      `Révision urgente des ${stats.byCriticality.critical} processus critiques - Mettre à jour les plans de continuité et les procédures de récupération`
    );
  }

  if (
    stats.byCriticality.critical + stats.byCriticality.high >
    stats.total * 0.3
  ) {
    recommendations.push(
      "Plus de 30% des processus sont de criticité élevée - Envisager une redistribution des ressources et une priorisation"
    );
  }

  if (stats.averageRTO > 48) {
    recommendations.push(
      "RTO moyen trop élevé (>48h) - Investir dans des solutions de récupération plus rapides et des procédures automatisées"
    );
  } else if (stats.averageRTO > 24) {
    recommendations.push(
      "RTO moyen élevé (>24h) - Optimiser les procédures de récupération et former les équipes"
    );
  }

  if (stats.averageRPO > 8) {
    recommendations.push(
      "RPO moyen élevé - Améliorer la fréquence des sauvegardes et la synchronisation des données"
    );
  }

  const deptCount = Object.keys(stats.byDepartment).length;
  if (deptCount < 3) {
    recommendations.push(
      "Couverture départementale insuffisante - Étendre l'analyse BIA à tous les départements critiques"
    );
  }

  const processesWithoutMbco = processes.filter(
    (p) => !p.mbco || p.mbco.trim() === ""
  ).length;
  if (processesWithoutMbco > 0) {
    recommendations.push(
      `${processesWithoutMbco} processus sans responsable MBCO défini - Assigner des responsables pour chaque processus`
    );
  }

  recommendations.push(
    "Effectuer des tests de récupération trimestriels pour valider l'efficacité des plans"
  );
  recommendations.push(
    "Mettre à jour la documentation BIA au moins semestriellement"
  );
  recommendations.push(
    "Former régulièrement les équipes sur les procédures de continuité"
  );

  if (stats.processesNeedingAttention > 0) {
    recommendations.push(
      `${stats.processesNeedingAttention} processus nécessitent une attention immédiate - Prioriser leur révision dans les 30 jours`
    );
  }

  return recommendations;
}

function identifyMajorRisks(
  stats: Omit<
    ProcessStats,
    "globalContinuityLevel" | "recommendations" | "majorRisks"
  >,
  processes: Process[]
) {
  const risks: {
    type: string;
    description: string;
    severity: "Critique" | "Élevé" | "Moyen";
    processes: string[];
  }[] = [];

  const criticalProcesses = processes.filter(
    (p) => p.criticality === "critical"
  );
  if (criticalProcesses.length > 0) {
    risks.push({
      type: "Processus Critiques Non Protégés",
      description: `${criticalProcesses.length} processus critiques identifiés avec des RTO potentiellement inadéquats. Une panne pourrait avoir un impact majeur sur l'organisation.`,
      severity: "Critique",
      processes: criticalProcesses.map((p) => p.name),
    });
  }

  const highRtoProcesses = processes.filter(
    (p) =>
      p.rto > 72 && (p.criticality === "critical" || p.criticality === "high")
  );
  if (highRtoProcesses.length > 0) {
    risks.push({
      type: "Temps de Récupération Excessifs",
      description: `${highRtoProcesses.length} processus critiques/importants avec RTO > 72h. Risque d'impact prolongé en cas d'incident.`,
      severity: "Élevé",
      processes: highRtoProcesses.map((p) => p.name),
    });
  }

  const maxDeptProcesses = Math.max(...Object.values(stats.byDepartment));
  const totalProcesses = stats.total;
  if (maxDeptProcesses / totalProcesses > 0.5) {
    const concentratedDept = Object.keys(stats.byDepartment).find(
      (dept) => stats.byDepartment[dept] === maxDeptProcesses
    );
    risks.push({
      type: "Concentration de Risque Départementale",
      description: `Plus de 50% des processus analysés proviennent du département ${concentratedDept}. Risque de sur-dépendance.`,
      severity: "Moyen",
      processes: processes
        .filter((p) => p.department === concentratedDept)
        .map((p) => p.name),
    });
  }

  const highRpoProcesses = processes.filter(
    (p) =>
      p.rpo > 24 && (p.criticality === "critical" || p.criticality === "high")
  );
  if (highRpoProcesses.length > 0) {
    risks.push({
      type: "Risque de Perte de Données",
      description: `${highRpoProcesses.length} processus critiques/importants avec RPO > 24h. Risque de perte significative de données.`,
      severity: "Élevé",
      processes: highRpoProcesses.map((p) => p.name),
    });
  }

  if (totalProcesses < 5) {
    risks.push({
      type: "Couverture BIA Insuffisante",
      description:
        "Moins de 5 processus documentés. La couverture BIA est insuffisante pour une protection efficace de l'organisation.",
      severity: "Élevé",
      processes: processes.map((p) => p.name),
    });
  }

  return risks;
}

// Action pour générer le rapport JSON
export async function generateBiaReport() {
  try {
    const result = await getAllProcesses();

    if (!result.success) {
      return {
        success: false,
        error: "Impossible de récupérer les processus",
      };
    }

    const processes: Process[] = Array.isArray(result.data) ? result.data : [];
    const stats = calculateProcessStats(processes);

    const report = {
      metadata: {
        generatedAt: new Date().toISOString(),
        version: "1.0",
        type: "BIA_REPORT",
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
      processes: processes.map((p) => ({
        id: p.id,
        name: p.name,
        department: p.department,
        location: p.location,
        criticality: p.criticality,
        rto: p.rto,
        rpo: p.rpo,
        mtpd: p.mtpd,
        mbco: p.mbco,
      })),
    };

    return {
      success: true,
      data: report,
    };
  } catch (error) {
    console.error("Erreur lors de la génération du rapport:", error);
    return {
      success: false,
      error: "Erreur lors de la génération du rapport",
    };
  }
}

// Action pour sauvegarder un rapport
export async function saveBiaReport(reportData: string, filename: string) {
  try {
    // Dans un vrai projet, vous pourriez sauvegarder le rapport dans une base de données
    // ou un système de fichiers. Ici, nous retournons simplement les données pour téléchargement.

    return {
      success: true,
      data: {
        content: reportData,
        filename: filename,
        mimeType: "application/json",
      },
    };
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du rapport:", error);
    return {
      success: false,
      error: "Erreur lors de la sauvegarde du rapport",
    };
  }
}
