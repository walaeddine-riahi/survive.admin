"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { RiskMatrixConfig } from "@/lib/bcm/risk-matrix-types";
import { MATRIX_ISO_31000 } from "@/lib/bcm/risk-matrix-types";

export interface ContinuitySettingsInput {
  factoryId: string;
  maxRtoHours?: number;
  maxRpoHours?: number;
  maxMtpdHours?: number;
  minMbcoPercent?: number;
  rtoWarningThreshold?: number;
  rpoWarningThreshold?: number;
  mtpdWarningThreshold?: number;
  riskMethodology?: string;
  riskMethodologyLabel?: string;
  riskMatrixConfig?: RiskMatrixConfig;
  applicableStandards?: string[];
}

// ─── GET SETTINGS FOR A FACTORY ──────────────────────────────────────────────
export async function getContinuitySettings(factoryId: string) {
  try {
    const settings = await prisma.continuitySettings.findUnique({
      where: { factoryId },
    });

    if (!settings) {
      // Retourner les valeurs par défaut ISO 22301
      return {
        success: true,
        data: {
          id: null,
          factoryId,
          maxRtoHours: 4,
          maxRpoHours: 2,
          maxMtpdHours: 72,
          minMbcoPercent: 60,
          rtoWarningThreshold: 8,
          rpoWarningThreshold: 4,
          mtpdWarningThreshold: 120,
          riskMethodology: "ISO_31000",
          riskMethodologyLabel: null,
          riskMatrixConfig: MATRIX_ISO_31000 as unknown,
          applicableStandards: ["ISO 22301"],
        },
        isDefault: true,
      };
    }

    return {
      success: true,
      data: settings,
      isDefault: false,
    };
  } catch (error) {
    console.error("getContinuitySettings error:", error);
    return { success: false, error: "Erreur lors de la récupération des paramètres" };
  }
}

// ─── SAVE SETTINGS ───────────────────────────────────────────────────────────
export async function saveContinuitySettings(input: ContinuitySettingsInput) {
  try {
    const data = {
      maxRtoHours: input.maxRtoHours ?? 4,
      maxRpoHours: input.maxRpoHours ?? 2,
      maxMtpdHours: input.maxMtpdHours ?? 72,
      minMbcoPercent: input.minMbcoPercent ?? 60,
      rtoWarningThreshold: input.rtoWarningThreshold ?? 8,
      rpoWarningThreshold: input.rpoWarningThreshold ?? 4,
      mtpdWarningThreshold: input.mtpdWarningThreshold ?? 120,
      riskMethodology: input.riskMethodology ?? "ISO_31000",
      riskMethodologyLabel: input.riskMethodologyLabel ?? null,
      riskMatrixConfig: input.riskMatrixConfig as unknown ?? MATRIX_ISO_31000,
      applicableStandards: input.applicableStandards ?? ["ISO 22301"],
    };

    const settings = await prisma.continuitySettings.upsert({
      where: { factoryId: input.factoryId },
      create: { factoryId: input.factoryId, ...data },
      update: data,
    });

    revalidatePath("/bcm");
    revalidatePath("/bia/gap-analysis");
    revalidatePath("/risk/assessment");
    revalidatePath(`/bia/factories/${input.factoryId}`);

    return { success: true, data: settings };
  } catch (error) {
    console.error("saveContinuitySettings error:", error);
    return { success: false, error: "Erreur lors de la sauvegarde des paramètres" };
  }
}

// ─── GET EFFECTIVE MATRIX CONFIG FOR A PROCESS/FACTORY ───────────────────────
export async function getEffectiveMatrixConfig(factoryId?: string): Promise<RiskMatrixConfig> {
  if (!factoryId) return MATRIX_ISO_31000;

  try {
    const settings = await prisma.continuitySettings.findUnique({
      where: { factoryId },
      select: { riskMatrixConfig: true },
    });

    if (settings?.riskMatrixConfig) {
      return settings.riskMatrixConfig as unknown as RiskMatrixConfig;
    }
  } catch {}

  return MATRIX_ISO_31000;
}
