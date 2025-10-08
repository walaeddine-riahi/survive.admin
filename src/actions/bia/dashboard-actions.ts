"use server";

import { getAllProcesses } from "./process-actions";

export interface DashboardStats {
  totalProcesses: number;
  criticalProcesses: number;
  highRiskProcesses: number;
  averageRTO: number;
  averageRPO: number;
  averageMTPD: number;
  processesNeedingAttention: number;
  departmentDistribution: Record<string, number>;
  criticalityDistribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  rtoDistribution: {
    excellent: number; // 0-4h
    good: number; // 4-12h
    average: number; // 12-24h
    poor: number; // 24h+
  };
  healthScore: number; // Score global sur 100
}

export async function getBiaDashboardStats(): Promise<{
  success: boolean;
  data?: DashboardStats;
  error?: string;
}> {
  try {
    const processesResult = await getAllProcesses();

    if (!processesResult.success) {
      return {
        success: false,
        error: processesResult.error,
      };
    }

    const processes = Array.isArray(processesResult.data)
      ? processesResult.data
      : [];

    if (processes.length === 0) {
      return {
        success: true,
        data: {
          totalProcesses: 0,
          criticalProcesses: 0,
          highRiskProcesses: 0,
          averageRTO: 0,
          averageRPO: 0,
          averageMTPD: 0,
          processesNeedingAttention: 0,
          departmentDistribution: {},
          criticalityDistribution: { critical: 0, high: 0, medium: 0, low: 0 },
          rtoDistribution: { excellent: 0, good: 0, average: 0, poor: 0 },
          healthScore: 0,
        },
      };
    }

    // Calculs des statistiques
    const stats: DashboardStats = {
      totalProcesses: processes.length,
      criticalProcesses: 0,
      highRiskProcesses: 0,
      averageRTO: 0,
      averageRPO: 0,
      averageMTPD: 0,
      processesNeedingAttention: 0,
      departmentDistribution: {},
      criticalityDistribution: { critical: 0, high: 0, medium: 0, low: 0 },
      rtoDistribution: { excellent: 0, good: 0, average: 0, poor: 0 },
      healthScore: 0,
    };

    let totalRTO = 0;
    let totalRPO = 0;
    let totalMTPD = 0;

    processes.forEach(
      (process: {
        criticality: string;
        department: string;
        rto: number;
        rpo: number;
        mtpd: number;
      }) => {
        // Criticité
        if (process.criticality in stats.criticalityDistribution) {
          stats.criticalityDistribution[
            process.criticality as keyof typeof stats.criticalityDistribution
          ]++;
        }

        if (process.criticality === "critical") {
          stats.criticalProcesses++;
        }

        if (
          process.criticality === "critical" ||
          process.criticality === "high"
        ) {
          stats.highRiskProcesses++;
        }

        // Départements
        if (!stats.departmentDistribution[process.department]) {
          stats.departmentDistribution[process.department] = 0;
        }
        stats.departmentDistribution[process.department]++;

        // Moyennes RTO/RPO/MTPD
        totalRTO += process.rto;
        totalRPO += process.rpo;
        totalMTPD += process.mtpd;

        // Distribution RTO
        if (process.rto <= 4) {
          stats.rtoDistribution.excellent++;
        } else if (process.rto <= 12) {
          stats.rtoDistribution.good++;
        } else if (process.rto <= 24) {
          stats.rtoDistribution.average++;
        } else {
          stats.rtoDistribution.poor++;
        }

        // Processus nécessitant de l'attention
        if (
          process.rto > 24 ||
          process.criticality === "critical" ||
          process.mtpd <= 4
        ) {
          stats.processesNeedingAttention++;
        }
      }
    );

    // Calcul des moyennes
    stats.averageRTO = Math.round(totalRTO / processes.length);
    stats.averageRPO = Math.round(totalRPO / processes.length);
    stats.averageMTPD = Math.round(totalMTPD / processes.length);

    // Calcul du score de santé global (0-100)
    const criticalWeight = 25;
    const highWeight = 50;
    const mediumWeight = 75;
    const lowWeight = 100;

    const weightedScore =
      (stats.criticalityDistribution.critical * criticalWeight +
        stats.criticalityDistribution.high * highWeight +
        stats.criticalityDistribution.medium * mediumWeight +
        stats.criticalityDistribution.low * lowWeight) /
      stats.totalProcesses;

    // Ajuster le score en fonction des RTO
    const rtoBonus =
      stats.rtoDistribution.excellent * 10 + stats.rtoDistribution.good * 5;
    const rtoPenalty = stats.rtoDistribution.poor * 10;

    stats.healthScore = Math.max(
      0,
      Math.min(100, Math.round(weightedScore + rtoBonus - rtoPenalty))
    );

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("Erreur lors du calcul des statistiques BIA:", error);
    return {
      success: false,
      error: "Erreur lors du calcul des statistiques dashboard",
    };
  }
}
