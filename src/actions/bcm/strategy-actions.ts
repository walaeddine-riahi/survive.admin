"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

import {
  type ResourceCategory,
  type StrategyStatus,
  RESOURCE_CATEGORY_CONFIG,
  STRATEGY_STATUS_CONFIG,
  type CreateStrategyInput,
  type UpdateStrategyInput,
  type ResourceDetails,
} from "@/lib/bcm/strategy-types";

// ─── GET ─────────────────────────────────────────────────────────────────────
export async function getStrategies(
  factoryId?: string,
  processId?: string,
  gapId?: string,
  resourceCategory?: ResourceCategory
) {
  try {
    const where: Record<string, unknown> = {};
    if (factoryId) where.factoryId = factoryId;
    if (processId) where.processId = processId;
    if (gapId) where.gapId = gapId;
    if (resourceCategory) where.resourceCategory = resourceCategory;

    const strategies = await prisma.continuityStrategy.findMany({
      where,
      include: {
        process: { select: { id: true, name: true, department: true, criticality: true } },
        factory: { select: { id: true, name: true } },
        gap: { select: { id: true, title: true, severity: true, gapType: true } },
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: [{ resourceCategory: "asc" }, { status: "asc" }, { createdAt: "desc" }],
    });
    return { success: true, data: strategies };
  } catch (error) {
    console.error("getStrategies error:", error);
    return { success: false, error: "Erreur lors de la récupération des stratégies" };
  }
}

// ─── GET BY RESOURCE (grouped) ───────────────────────────────────────────────
export async function getStrategiesByResource(factoryId?: string) {
  const result = await getStrategies(factoryId);
  if (!result.success || !result.data) return result;

  const cats = Object.keys(RESOURCE_CATEGORY_CONFIG) as ResourceCategory[];
  const byCategory: Record<ResourceCategory, typeof result.data> = Object.fromEntries(
    cats.map((c) => [c, []])
  ) as Record<ResourceCategory, typeof result.data>;

  for (const s of result.data) {
    const cat = s.resourceCategory as ResourceCategory;
    if (byCategory[cat]) byCategory[cat].push(s);
  }

  const stats = Object.fromEntries(
    cats.map((cat) => [cat, computeCategoryStats(byCategory[cat])])
  ) as Record<ResourceCategory, ReturnType<typeof computeCategoryStats>>;

  return { success: true, data: byCategory, stats };
}

function computeCategoryStats(strategies: { status: string; gapClosurePercent: number }[]) {
  const total = strategies.length;
  const implemented = strategies.filter((s) =>
    ["IMPLEMENTED", "TESTED", "VALIDATED"].includes(s.status)
  ).length;
  const avgClosure =
    total > 0
      ? Math.round(strategies.reduce((acc, s) => acc + s.gapClosurePercent, 0) / total)
      : 0;
  return { total, implemented, avgClosure };
}

// ─── GET PROCESS RESOURCE DATA (for pre-fill) ────────────────────────────────
export async function getProcessResourceData(processId: string) {
  try {
    const process = await prisma.process.findUnique({
      where: { id: processId },
      select: {
        id: true, name: true, department: true,
        rolesPersonnel: true,
        equipementsIndustriels: true,
        equipementsBureautiques: true,
        infrastructuresPhysiques: true,
        systemesInformatiques: true,
        documentationsCritiques: true,
        fournisseursExternes: true,
        // Legacy scalar fields
        staffRoles: true, staffCount: true, uniqueSkills: true,
        itSystems: true, systemCriticality: true, hasBackupSystems: true, systemRTO: true, systemRPO: true, systemMTPD: true,
        infrastructureType: true, infraRTO: true, infraMTPD: true, canWorkRemotely: true,
        industrialEquipment: true, equipmentRTO: true, equipmentMTPD: true,
        requiredDocumentation: true, documentationLocation: true, documentationRTO: true,
        keySuppliers: true, providedService: true, hasAlternativeSupplier: true, supplierCriticality: true,
      },
    });
    return { success: true, data: process };
  } catch (error) {
    return { success: false, error: "Erreur récupération données processus" };
  }
}

// ─── CREATE ──────────────────────────────────────────────────────────────────
export async function createStrategy(input: CreateStrategyInput) {
  try {
    const strategy = await prisma.continuityStrategy.create({
      data: {
        title: input.title,
        description: input.description,
        resourceCategory: input.resourceCategory,
        status: input.status || "PLANNED",
        gapId: input.gapId,
        processId: input.processId,
        factoryId: input.factoryId,
        sourceResourceType: input.sourceResourceType,
        sourceResourceName: input.sourceResourceName,
        resourceDetails: (input.resourceDetails ?? {}) as Record<string, unknown>,
        fallbackSolution: input.fallbackSolution,
        fallbackLocation: input.fallbackLocation,
        activationDelayHours: input.activationDelayHours,
        estimatedCost: input.estimatedCost,
        currency: input.currency ?? "TND",
        gapClosurePercent: input.gapClosurePercent ?? 0,
        ownerId: input.ownerId,
        plannedDate: input.plannedDate ? new Date(input.plannedDate) : undefined,
        notes: input.notes,
      },
    });
    revalidatePath("/bia/strategies");
    revalidatePath("/bcm");
    return { success: true, data: strategy };
  } catch (error) {
    console.error("createStrategy error:", error);
    return { success: false, error: "Erreur lors de la création" };
  }
}

// ─── UPDATE ──────────────────────────────────────────────────────────────────
export async function updateStrategy(input: UpdateStrategyInput) {
  try {
    const { id, plannedDate, ...rest } = input;
    const strategy = await prisma.continuityStrategy.update({
      where: { id },
      data: {
        ...rest,
        resourceDetails: rest.resourceDetails
          ? (rest.resourceDetails as Record<string, unknown>)
          : undefined,
        plannedDate: plannedDate ? new Date(plannedDate) : undefined,
        implementedAt: rest.status === "IMPLEMENTED" ? new Date() : undefined,
        testedAt: rest.status === "TESTED" ? new Date() : undefined,
      },
    });
    revalidatePath("/bia/strategies");
    revalidatePath("/bcm");
    return { success: true, data: strategy };
  } catch (error) {
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

// ─── DELETE ──────────────────────────────────────────────────────────────────
export async function deleteStrategy(id: string) {
  try {
    await prisma.continuityStrategy.delete({ where: { id } });
    revalidatePath("/bia/strategies");
    revalidatePath("/bcm");
    return { success: true };
  } catch {
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

// ─── STATS ───────────────────────────────────────────────────────────────────
export async function getStrategyStats(factoryId?: string) {
  try {
    const where: Record<string, unknown> = {};
    if (factoryId) where.factoryId = factoryId;

    const strategies = await prisma.continuityStrategy.findMany({
      where,
      select: {
        status: true, resourceCategory: true,
        gapClosurePercent: true, estimatedCost: true,
      },
    });

    const byCategory = strategies.reduce((acc: Record<string, number>, s) => {
      acc[s.resourceCategory] = (acc[s.resourceCategory] || 0) + 1;
      return acc;
    }, {});

    const byStatus = strategies.reduce((acc: Record<string, number>, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    }, {});

    const avgClosure =
      strategies.length > 0
        ? Math.round(strategies.reduce((s, st) => s + st.gapClosurePercent, 0) / strategies.length)
        : 0;

    return {
      success: true,
      data: {
        total: strategies.length,
        byCategory,
        byStatus,
        avgGapClosure: avgClosure,
        totalEstimatedCost: strategies.reduce((s, st) => s + (st.estimatedCost || 0), 0),
        implemented:
          (byStatus["IMPLEMENTED"] || 0) +
          (byStatus["TESTED"] || 0) +
          (byStatus["VALIDATED"] || 0),
      },
    };
  } catch (error) {
    return { success: false, error: "Erreur statistiques stratégies" };
  }
}
