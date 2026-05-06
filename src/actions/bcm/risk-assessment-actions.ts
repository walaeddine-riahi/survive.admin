"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  calculateScore,
  getThresholdForScore,
  type RiskMatrixConfig,
} from "@/lib/bcm/risk-matrix-types";
import { getEffectiveMatrixConfig } from "./continuity-settings-actions";

import {
  type RiskStatus,
  THREAT_SOURCES,
  type CreateRiskInput,
  type UpdateRiskInput,
} from "@/lib/bcm/risk-assessment-types";

async function computeRiskScores(
  axeX: number, axeY: number, axeZ: number | undefined, factoryId: string | undefined
) {
  const matrixConfig = await getEffectiveMatrixConfig(factoryId);
  const score = calculateScore(matrixConfig, axeX, axeY, axeZ);
  const threshold = getThresholdForScore(matrixConfig, score);
  return {
    riskScore: score,
    riskLevelLabel: threshold?.label ?? "Non défini",
    riskLevelColor: threshold?.color ?? "#6b7280",
  };
}

export async function getRisks(factoryId?: string, processId?: string) {
  try {
    const where: Record<string, unknown> = {};
    if (factoryId) where.factoryId = factoryId;
    if (processId) where.processId = processId;

    const risks = await prisma.riskAssessment.findMany({
      where,
      include: {
        process: { select: { id: true, name: true, department: true, criticality: true } },
        factory: { select: { id: true, name: true, continuitySettings: { select: { riskMatrixConfig: true, riskMethodologyLabel: true, riskMethodology: true } } } },
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: [{ riskScore: "desc" }, { createdAt: "desc" }],
    });
    return { success: true, data: risks };
  } catch (error) {
    console.error("getRisks error:", error);
    return { success: false, error: "Erreur lors de la récupération des risques" };
  }
}

export async function createRisk(input: CreateRiskInput) {
  try {
    const { riskScore, riskLevelLabel, riskLevelColor } = await computeRiskScores(
      input.axeXValue, input.axeYValue, input.axeZValue, input.factoryId
    );

    const risk = await prisma.riskAssessment.create({
      data: {
        title: input.title,
        description: input.description,
        scenario: input.scenario,
        threatSource: input.threatSource,
        processId: input.processId,
        factoryId: input.factoryId,
        axeXValue: input.axeXValue,
        axeYValue: input.axeYValue,
        axeZValue: input.axeZValue,
        riskScore,
        riskLevelLabel,
        riskLevelColor,
        rtoImpactHours: input.rtoImpactHours,
        rpoImpactHours: input.rpoImpactHours,
        mbcoImpactPercent: input.mbcoImpactPercent,
        treatmentOption: input.treatmentOption,
        treatmentPlan: input.treatmentPlan,
        ownerId: input.ownerId,
        nextReviewDate: input.nextReviewDate ? new Date(input.nextReviewDate) : undefined,
      },
    });
    revalidatePath("/risk/assessment");
    revalidatePath("/bcm");
    return { success: true, data: risk };
  } catch (error) {
    console.error("createRisk error:", error);
    return { success: false, error: "Erreur lors de la création du risque" };
  }
}

export async function updateRisk(input: UpdateRiskInput) {
  try {
    const { id, nextReviewDate, residualAxeX, residualAxeY, residualAxeZ, ...rest } = input;

    let scoreUpdate: Record<string, unknown> = {};
    if (rest.axeXValue !== undefined && rest.axeYValue !== undefined) {
      const scores = await computeRiskScores(rest.axeXValue, rest.axeYValue, rest.axeZValue, rest.factoryId);
      scoreUpdate = scores;
    }

    let residualUpdate: Record<string, unknown> = {};
    if (residualAxeX !== undefined && residualAxeY !== undefined) {
      const scores = await computeRiskScores(residualAxeX, residualAxeY, residualAxeZ, rest.factoryId);
      residualUpdate = {
        residualAxeX, residualAxeY, residualAxeZ,
        residualScore: scores.riskScore,
        residualLevelLabel: scores.riskLevelLabel,
        residualLevelColor: scores.riskLevelColor,
      };
    }

    const risk = await prisma.riskAssessment.update({
      where: { id },
      data: { ...rest, ...scoreUpdate, ...residualUpdate, nextReviewDate: nextReviewDate ? new Date(nextReviewDate) : undefined },
    });
    revalidatePath("/risk/assessment");
    revalidatePath("/bcm");
    return { success: true, data: risk };
  } catch (error) {
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

export async function deleteRisk(id: string) {
  try {
    await prisma.riskAssessment.delete({ where: { id } });
    revalidatePath("/risk/assessment");
    revalidatePath("/bcm");
    return { success: true };
  } catch {
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

export async function getRiskStats(factoryId?: string) {
  try {
    const where: Record<string, unknown> = {};
    if (factoryId) where.factoryId = factoryId;

    const risks = await prisma.riskAssessment.findMany({
      where,
      select: { riskScore: true, residualScore: true, riskLevelLabel: true, status: true },
    });

    const byLevel = risks.reduce((acc: Record<string, number>, r) => {
      const label = r.riskLevelLabel || "Non défini";
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});

    const byStatus = risks.reduce((acc: Record<string, number>, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});

    const avgScore = risks.length > 0
      ? Math.round(risks.reduce((s, r) => s + r.riskScore, 0) / risks.length) : 0;

    return {
      success: true,
      data: {
        total: risks.length,
        byLevel,
        byStatus,
        avgScore,
        criticalRisks: risks.filter((r) => r.riskScore >= 17).length,
        highRisks: risks.filter((r) => r.riskScore >= 10).length,
        openCount: byStatus["OPEN"] || 0,
      },
    };
  } catch (error) {
    return { success: false, error: "Erreur statistiques risques" };
  }
}
