"use server";

import { prisma } from "@/lib/prisma";
import { getThresholdForScore } from "@/lib/bcm/risk-matrix-types";
import { getEffectiveMatrixConfig } from "./continuity-settings-actions";

export async function getBcmDashboardData(factoryId?: string) {
  try {
    const where: Record<string, unknown> = {};
    if (factoryId) where.factoryId = factoryId;

    const processWhere: Record<string, unknown> = {};
    if (factoryId) processWhere.factoryId = factoryId;

    const [processes, gaps, strategies, risks, factory] = await Promise.all([
      prisma.process.findMany({
        where: processWhere,
        select: {
          id: true, name: true, department: true, criticality: true,
          rto: true, rpo: true, mtpd: true, mbco: true,
          continuityGaps:       { select: { severity: true, status: true, gapType: true } },
          continuityStrategies: { select: { status: true, gapClosurePercent: true, resourceCategory: true } },
          riskAssessments:      { select: { riskScore: true, status: true, riskLevelLabel: true, riskLevelColor: true } },
        },
      }),
      prisma.continuityGap.findMany({
        where,
        select: { severity: true, status: true, gapType: true, processId: true },
      }),
      prisma.continuityStrategy.findMany({
        where,
        select: { status: true, resourceCategory: true, gapClosurePercent: true },
      }),
      prisma.riskAssessment.findMany({
        where,
        select: { riskScore: true, residualScore: true, status: true, riskLevelLabel: true, riskLevelColor: true },
      }),
      factoryId ? prisma.factory.findUnique({
        where: { id: factoryId },
        include: { continuitySettings: true },
      }) : null,
    ]);

    // ── GAP METRICS ──────────────────────────────────────────────────────────
    const totalGaps    = gaps.length;
    const openGaps     = gaps.filter((g: {status: string}) => g.status !== "RESOLVED" && g.status !== "ACCEPTED").length;
    const resolvedGaps = gaps.filter((g: {status: string}) => g.status === "RESOLVED").length;

    const gapsBySeverity = gaps.reduce((acc: Record<string, number>, g: {severity: string}) => {
      acc[g.severity] = (acc[g.severity] || 0) + 1; return acc;
    }, {});

    const gapsByType = gaps.reduce((acc: Record<string, number>, g: {gapType: string}) => {
      acc[g.gapType] = (acc[g.gapType] || 0) + 1; return acc;
    }, {});

    // ── STRATEGY METRICS ─────────────────────────────────────────────────────
    const avgGapClosure = strategies.length > 0
      ? Math.round(strategies.reduce((s: number, st: {gapClosurePercent: number}) => s + st.gapClosurePercent, 0) / strategies.length)
      : 0;
    const implementedStrategies = strategies.filter((s: {status: string}) =>
      ["IMPLEMENTED","TESTED","VALIDATED"].includes(s.status)
    ).length;

    const strategiesByCategory = strategies.reduce((acc: Record<string, number>, s: {resourceCategory: string}) => {
      acc[s.resourceCategory] = (acc[s.resourceCategory] || 0) + 1; return acc;
    }, {});

    // Gap closure par catégorie de ressource
    const closureByCategory = (["RH_COMPETENCES","EQUIPEMENTS","INFRASTRUCTURE","APPLICATIONS_IT","DOCUMENTATION","SUPPLY_CHAIN"]).reduce((acc: Record<string, {total:number;sum:number}>, cat) => {
      const catStrats = strategies.filter((s: {resourceCategory: string; gapClosurePercent: number}) => s.resourceCategory === cat);
      acc[cat] = {
        total: catStrats.length,
        sum: catStrats.reduce((s: number, st: {gapClosurePercent: number}) => s + st.gapClosurePercent, 0),
      };
      return acc;
    }, {});

    // ── RISK METRICS ─────────────────────────────────────────────────────────
    const settings = factory?.continuitySettings;
    const matrixConfig = settings?.riskMatrixConfig
      ? (settings.riskMatrixConfig as unknown as Parameters<typeof getThresholdForScore>[0])
      : await getEffectiveMatrixConfig(factoryId);

    const criticalRisks = risks.filter(r => {
      const t = getThresholdForScore(matrixConfig as Parameters<typeof getThresholdForScore>[0], r.riskScore);
      return r.riskScore >= 17 || t?.label?.toLowerCase().includes("critiqu");
    }).length;
    const highRisks = risks.filter(r => r.riskScore >= 10 && r.riskScore < 17).length;
    const avgRiskScore = risks.length > 0
      ? Math.round(risks.reduce((s, r) => s + r.riskScore, 0) / risks.length)
      : 0;

    // ── PROCESS HEATMAP ──────────────────────────────────────────────────────
    const maxRto  = settings?.maxRtoHours  ?? 4;
    const maxRpo  = settings?.maxRpoHours  ?? 2;

    const processesInCompliance = processes.filter(p => p.rto <= maxRto && p.rpo <= maxRpo).length;
    const complianceScore = processes.length > 0
      ? Math.round((processesInCompliance / processes.length) * 100)
      : 0;

    const maturityScore = Math.round(
      (complianceScore * 0.30) +
      (avgGapClosure  * 0.30) +
      (processes.length > 0 ? (1 - openGaps / Math.max(totalGaps, 1)) * 100 * 0.20 : 100 * 0.20) +
      (risks.length   > 0 ? (1 - criticalRisks / Math.max(risks.length, 1)) * 100 * 0.20 : 100 * 0.20)
    );

    const processHeatmap = processes.map(p => {
      const maxRiskScore = p.riskAssessments.length > 0
        ? Math.max(...p.riskAssessments.map(r => r.riskScore)) : 0;
      const openGapsCount = p.continuityGaps.filter(g => g.status !== "RESOLVED").length;
      const threshold = getThresholdForScore(matrixConfig as Parameters<typeof getThresholdForScore>[0], maxRiskScore);

      return {
        id: p.id, name: p.name, department: p.department, criticality: p.criticality,
        rto: p.rto, rpo: p.rpo,
        openGaps: openGapsCount,
        maxRiskScore,
        riskLevel: threshold?.label ?? "—",
        riskColor: threshold?.color ?? "#6b7280",
        gapClosure: p.continuityStrategies.length > 0
          ? Math.round(p.continuityStrategies.reduce((s, st) => s + st.gapClosurePercent, 0) / p.continuityStrategies.length)
          : 0,
        isCompliant: p.rto <= maxRto && p.rpo <= maxRpo,
      };
    }).sort((a, b) => b.maxRiskScore - a.maxRiskScore);

    return {
      success: true,
      data: {
        factory: factory ? {
          id: factory.id, name: factory.name,
          settings: factory.continuitySettings,
        } : null,
        summary: {
          maturityScore,
          complianceScore,
          avgGapClosure,
          criticalRisks,
          highRisks,
          openGaps,
          resolvedGaps,
          totalGaps,
          totalProcesses: processes.length,
          criticalProcesses: processes.filter(p => p.criticality === "critical").length,
          processesWithGaps: new Set(gaps.map(g => g.processId)).size,
          totalStrategies: strategies.length,
          implementedStrategies,
          totalRisks: risks.length,
          avgRiskScore,
          processesInCompliance,
        },
        gapsBySeverity,
        gapsByType,
        strategiesByCategory,
        closureByCategory,
        processHeatmap,
        topRisks: risks
          .filter(r => r.status !== "CLOSED")
          .sort((a, b) => b.riskScore - a.riskScore)
          .slice(0, 5),
      },
    };
  } catch (error) {
    console.error("getBcmDashboardData error:", error);
    return { success: false, error: "Erreur lors du chargement du dashboard BCM" };
  }
}
