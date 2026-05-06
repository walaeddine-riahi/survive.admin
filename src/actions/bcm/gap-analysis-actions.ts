"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

import {
  type GapType,
  type GapSeverity,
  type GapStatus,
  GAP_TYPE_LABELS,
  GAP_TYPE_CATEGORY,
  type CreateGapInput,
  type UpdateGapInput,
} from "@/lib/bcm/gap-analysis-types";

// ─── GET ALL GAPS ────────────────────────────────────────────────────────────
export async function getGaps(factoryId?: string, processId?: string) {
  try {
    const where: Record<string, unknown> = {};
    if (factoryId) where.factoryId = factoryId;
    if (processId) where.processId = processId;

    const gaps = await prisma.continuityGap.findMany({
      where,
      include: {
        process: {
          select: {
            id: true, name: true, department: true, criticality: true,
            rto: true, rpo: true, mtpd: true, mbco: true,
          },
        },
        factory: { select: { id: true, name: true } },
        strategies: {
          select: { id: true, title: true, status: true, gapClosurePercent: true, resourceCategory: true },
        },
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
    });
    return { success: true, data: gaps };
  } catch (error) {
    console.error("getGaps error:", error);
    return { success: false, error: "Erreur lors de la récupération des écarts" };
  }
}

// ─── CREATE GAP ──────────────────────────────────────────────────────────────
export async function createGap(input: CreateGapInput) {
  try {
    const gap = await prisma.continuityGap.create({
      data: {
        title: input.title,
        description: input.description,
        gapType: input.gapType,
        severity: input.severity,
        status: input.status || "IDENTIFIED",
        currentValue: input.currentValue,
        targetValue: input.targetValue,
        gap: input.gap,
        processId: input.processId,
        factoryId: input.factoryId,
        recommendation: input.recommendation,
        targetClosureDate: input.targetClosureDate ? new Date(input.targetClosureDate) : undefined,
      },
    });
    revalidatePath("/bia/gap-analysis");
    revalidatePath("/bcm");
    return { success: true, data: gap };
  } catch (error) {
    console.error("createGap error:", error);
    return { success: false, error: "Erreur lors de la création de l'écart" };
  }
}

// ─── UPDATE GAP ──────────────────────────────────────────────────────────────
export async function updateGap(input: UpdateGapInput) {
  try {
    const { id, targetClosureDate, ...rest } = input;
    const gap = await prisma.continuityGap.update({
      where: { id },
      data: {
        ...rest,
        targetClosureDate: targetClosureDate ? new Date(targetClosureDate) : undefined,
        closedAt: rest.status === "RESOLVED" ? new Date() : undefined,
      },
    });
    revalidatePath("/bia/gap-analysis");
    revalidatePath("/bcm");
    return { success: true, data: gap };
  } catch (error) {
    console.error("updateGap error:", error);
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

// ─── DELETE GAP ──────────────────────────────────────────────────────────────
export async function deleteGap(id: string) {
  try {
    await prisma.continuityGap.delete({ where: { id } });
    revalidatePath("/bia/gap-analysis");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

// ─── AUTO-ANALYZE PROCESS FOR GAPS ─────────────────────────────────────────
// Analyse automatique d'un processus vs seuils et vs données BIA collectées
export async function analyzeProcessGaps(processId: string) {
  try {
    const process = await prisma.process.findUnique({
      where: { id: processId },
      include: {
        factory: { include: { continuitySettings: true } },
        continuityGaps: true,
      },
    });

    if (!process) return { success: false, error: "Processus introuvable" };

    const settings = process.factory?.continuitySettings;
    const maxRto  = settings?.maxRtoHours  ?? 4;
    const maxRpo  = settings?.maxRpoHours  ?? 2;
    const maxMtpd = settings?.maxMtpdHours ?? 72;
    const minMbco = settings?.minMbcoPercent ?? 60;

    const detectedGaps: CreateGapInput[] = [];
    const existing = (gapType: GapType) =>
      process.continuityGaps.find(g => g.gapType === gapType && g.status !== "RESOLVED");

    // ── 1. MÉTRIQUES BIA ──────────────────────────────────────────────────────

    if (process.rto > maxRto && !existing("RTO_BREACH")) {
      detectedGaps.push({
        title: `RTO non conforme — ${process.name}`,
        description: `RTO actuel de ${process.rto}h dépasse le seuil de ${maxRto}h.`,
        gapType: "RTO_BREACH",
        severity: process.rto > maxRto * 4 ? "CRITICAL" : process.rto > maxRto * 2 ? "HIGH" : "MEDIUM",
        currentValue: `RTO actuel: ${process.rto}h`,
        targetValue: `RTO cible: ≤${maxRto}h`,
        gap: `Écart: +${process.rto - maxRto}h`,
        processId, factoryId: process.factoryId ?? undefined,
        recommendation: `Mettre en place des solutions de reprise (site de repli, DRP, procédures dégradées) permettant d'atteindre un RTO ≤ ${maxRto}h.`,
      });
    }

    if (process.rpo > maxRpo && !existing("RPO_BREACH")) {
      detectedGaps.push({
        title: `RPO non conforme — ${process.name}`,
        description: `RPO actuel de ${process.rpo}h dépasse le seuil de ${maxRpo}h.`,
        gapType: "RPO_BREACH",
        severity: process.rpo > maxRpo * 4 ? "CRITICAL" : process.rpo > maxRpo * 2 ? "HIGH" : "MEDIUM",
        currentValue: `RPO actuel: ${process.rpo}h`,
        targetValue: `RPO cible: ≤${maxRpo}h`,
        gap: `Écart: +${process.rpo - maxRpo}h`,
        processId, factoryId: process.factoryId ?? undefined,
        recommendation: `Implémenter des sauvegardes plus fréquentes ou de la réplication de données pour atteindre RPO ≤ ${maxRpo}h.`,
      });
    }

    if (process.mtpd > maxMtpd && !existing("MTPD_BREACH")) {
      detectedGaps.push({
        title: `MTPD non conforme — ${process.name}`,
        description: `MTPD actuel de ${process.mtpd}h dépasse le maximum tolérable de ${maxMtpd}h.`,
        gapType: "MTPD_BREACH",
        severity: process.mtpd > maxMtpd * 2 ? "CRITICAL" : "HIGH",
        currentValue: `MTPD actuel: ${process.mtpd}h`,
        targetValue: `MTPD cible: ≤${maxMtpd}h`,
        gap: `Écart: +${process.mtpd - maxMtpd}h`,
        processId, factoryId: process.factoryId ?? undefined,
        recommendation: `Réduire la durée maximale d'interruption tolérable via des stratégies de continuité renforcées.`,
      });
    }

    // ── 2. RH & COMPÉTENCES ───────────────────────────────────────────────────
    const rolesJson = process.rolesPersonnel as unknown[];
    const hasUniqueSkills = process.uniqueSkills || (rolesJson?.some((r: Record<string,unknown>) => r.competencesRequises));
    const cannotReplace = !process.canBeReplaced || (rolesJson?.some((r: Record<string,unknown>) => r.possibiliteRemplacement === false));

    if (hasUniqueSkills && cannotReplace && !existing("RH_COMPETENCES")) {
      detectedGaps.push({
        title: `Compétences critiques sans suppléance — ${process.name}`,
        description: `Des compétences uniques identifiées dans la BIA n'ont pas de suppléant documenté.`,
        gapType: "RH_COMPETENCES",
        severity: process.criticality === "critical" ? "HIGH" : "MEDIUM",
        currentValue: `Pas de suppléant identifié pour : ${process.uniqueSkills || "compétences critiques"}`,
        targetValue: "Suppléance documentée et cross-training en place",
        gap: "Risque de perte de compétences critiques sans solution de repli",
        processId, factoryId: process.factoryId ?? undefined,
        recommendation: `Mettre en place un plan de cross-training, identifier un suppléant interne ou un pool externe pour couvrir les compétences critiques.`,
      });
    }

    // ── 3. ÉQUIPEMENTS ────────────────────────────────────────────────────────
    const equipInd = process.industrialEquipment;
    const equipBur = process.officeEquipment;
    const hasEquip = equipInd || equipBur;
    const canReassign = process.canReassignEquipment || process.canReassignOfficeEquipment;
    const equipWorkaround = process.equipmentWorkarounds || process.officeWorkarounds;

    if (hasEquip && !canReassign && !equipWorkaround && !existing("EQUIPEMENTS")) {
      detectedGaps.push({
        title: `Équipements critiques sans solution de secours — ${process.name}`,
        description: `Les équipements utilisés par ce processus n'ont pas de solution de remplacement ou de réaffectation documentée.`,
        gapType: "EQUIPEMENTS",
        severity: process.criticality === "critical" ? "HIGH" : "MEDIUM",
        currentValue: `Équipements sans secours : ${equipInd || equipBur}`,
        targetValue: "Équipement de secours identifié ou procédure de réaffectation documentée",
        gap: "Vulnérabilité équipement non couverte",
        processId, factoryId: process.factoryId ?? undefined,
        recommendation: `Identifier des équipements de remplacement, mettre en place des contrats de maintenance préventive et des accords de prêt d'équipement.`,
      });
    }

    // ── 4. INFRASTRUCTURE ─────────────────────────────────────────────────────
    const dependsOnInfra = process.dependsOnPhysicalInfra;
    const canRemote = process.canWorkRemotely;
    const canOtherInfra = process.canUseOtherInfra;

    if (dependsOnInfra && !canRemote && !canOtherInfra && !existing("INFRASTRUCTURE")) {
      detectedGaps.push({
        title: `Infrastructure physique sans alternative — ${process.name}`,
        description: `Ce processus dépend d'une infrastructure physique sans site de repli ni possibilité de travail à distance identifiés.`,
        gapType: "INFRASTRUCTURE",
        severity: process.criticality === "critical" ? "CRITICAL" : "HIGH",
        currentValue: "Dépendance infrastructure unique, pas d'alternative documentée",
        targetValue: "Site de repli ou capacité de travail à distance opérationnelle",
        gap: "Single point of failure infrastructure",
        processId, factoryId: process.factoryId ?? undefined,
        recommendation: `Identifier un site de repli, évaluer la faisabilité du travail à distance, et documenter les procédures d'activation.`,
      });
    }

    // ── 5. APPLICATIONS IT ────────────────────────────────────────────────────
    const hasIT = process.itSystems || (process.systemesInformatiques as unknown[])?.length > 0;
    const hasITBackup = process.hasBackupSystems;
    const itWorkaround = process.workarounds;

    if (hasIT && !hasITBackup && !existing("APPLICATIONS_IT")) {
      detectedGaps.push({
        title: `Systèmes IT sans solution de reprise — ${process.name}`,
        description: `Les systèmes informatiques de ce processus n'ont pas de solution de reprise documentée.`,
        gapType: "APPLICATIONS_IT",
        severity: process.criticality === "critical" ? "CRITICAL" : process.criticality === "high" ? "HIGH" : "MEDIUM",
        currentValue: `Systèmes sans DRP : ${process.itSystems || "systèmes critiques"}`,
        targetValue: "DRP documenté, testé, et RTO IT ≤ RTO processus",
        gap: "Absence de plan de reprise informatique",
        processId, factoryId: process.factoryId ?? undefined,
        recommendation: `Mettre en place un DRP avec bascule automatique, sauvegardes testées et procédures de reprise validées.`,
      });
    }

    // ── 6. DOCUMENTATION ──────────────────────────────────────────────────────
    const hasDoc = process.requiredDocumentation;
    const hasDocAlt = process.hasAlternativeAccess;
    const hasDocReplacement = process.hasReplacement;

    if (hasDoc && !hasDocAlt && !hasDocReplacement && !existing("DOCUMENTATION")) {
      detectedGaps.push({
        title: `Documentation critique sans accès alternatif — ${process.name}`,
        description: `Documentation critique identifiée dans la BIA sans accès de secours ni copie de sauvegarde documentés.`,
        gapType: "DOCUMENTATION",
        severity: "MEDIUM",
        currentValue: `Documentation sans accès alternatif : ${process.requiredDocumentation}`,
        targetValue: "Copie de secours accessible, procédure de récupération documentée",
        gap: "Risque de perte d'accès à la documentation critique",
        processId, factoryId: process.factoryId ?? undefined,
        recommendation: `Mettre en place des copies de sauvegarde de la documentation critique sur des emplacements redondants avec accès documenté.`,
      });
    }

    // ── 7. SUPPLY CHAIN ───────────────────────────────────────────────────────
    const hasSupplier = process.externalSuppliers || process.keySuppliers;
    const hasAltSupplier = process.hasAlternativeSupplier;
    const supplierHasPCA = process.supplierContinuityPlan || process.supplierHasContinuityPlan;

    if (hasSupplier && (!hasAltSupplier || !supplierHasPCA) && !existing("SUPPLY_CHAIN")) {
      detectedGaps.push({
        title: `Supply chain sans fournisseur alternatif — ${process.name}`,
        description: `Fournisseurs critiques identifiés sans fournisseur de secours ou sans plan de continuité fournisseur vérifié.`,
        gapType: "SUPPLY_CHAIN",
        severity: process.criticality === "critical" ? "HIGH" : "MEDIUM",
        currentValue: `${!hasAltSupplier ? "Pas de fournisseur alternatif." : ""} ${!supplierHasPCA ? "PCA fournisseur non vérifié." : ""}`.trim(),
        targetValue: "Fournisseur alternatif identifié + PCA fournisseur vérifié",
        gap: "Dépendance fournisseur non maîtrisée",
        processId, factoryId: process.factoryId ?? undefined,
        recommendation: `Identifier et qualifier des fournisseurs alternatifs, exiger et vérifier les PCA fournisseurs, inclure des clauses de continuité dans les contrats.`,
      });
    }

    // Créer tous les écarts détectés
    const created = await Promise.all(detectedGaps.map(g => createGap(g)));

    return {
      success: true,
      data: {
        processName: process.name,
        gapsDetected: detectedGaps.length,
        gaps: created.filter(r => r.success).map(r => r.data),
      },
    };
  } catch (error) {
    console.error("analyzeProcessGaps error:", error);
    return { success: false, error: "Erreur lors de l'analyse automatique" };
  }
}

// ─── ANALYZE ALL PROCESSES IN A FACTORY ─────────────────────────────────────
export async function analyzeFactoryGaps(factoryId: string) {
  try {
    const processes = await prisma.process.findMany({
      where: { factoryId },
      select: { id: true },
    });

    const results = await Promise.all(processes.map(p => analyzeProcessGaps(p.id)));
    const totalGaps = results.reduce((sum, r) => sum + (r.data?.gapsDetected ?? 0), 0);

    revalidatePath("/bia/gap-analysis");
    revalidatePath("/bcm");
    return {
      success: true,
      data: { processesAnalyzed: processes.length, totalGapsDetected: totalGaps },
    };
  } catch (error) {
    console.error("analyzeFactoryGaps error:", error);
    return { success: false, error: "Erreur lors de l'analyse du site" };
  }
}

// ─── GET GAP STATISTICS ──────────────────────────────────────────────────────
export async function getGapStats(factoryId?: string) {
  try {
    const where: Record<string, unknown> = {};
    if (factoryId) where.factoryId = factoryId;

    const [total, bySeverity, byStatus, byType, strategies] = await Promise.all([
      prisma.continuityGap.count({ where }),
      prisma.continuityGap.groupBy({ by: ["severity"], where, _count: true }),
      prisma.continuityGap.groupBy({ by: ["status"], where, _count: true }),
      prisma.continuityGap.groupBy({ by: ["gapType"], where, _count: true }),
      prisma.continuityStrategy.findMany({
        where: factoryId ? { factoryId } : {},
        select: { gapClosurePercent: true, status: true },
      }),
    ]);

    const avgGapClosure =
      strategies.length > 0
        ? Math.round(strategies.reduce((s, st) => s + st.gapClosurePercent, 0) / strategies.length)
        : 0;

    return {
      success: true,
      data: {
        total,
        bySeverity: Object.fromEntries(bySeverity.map(r => [r.severity, r._count])),
        byStatus: Object.fromEntries(byStatus.map(r => [r.status, r._count])),
        byType: Object.fromEntries(byType.map(r => [r.gapType, r._count])),
        avgGapClosure,
        strategiesCount: strategies.length,
        implementedStrategies: strategies.filter(s =>
          s.status === "IMPLEMENTED" || s.status === "VALIDATED"
        ).length,
      },
    };
  } catch (error) {
    console.error("getGapStats error:", error);
    return { success: false, error: "Erreur statistiques écarts" };
  }
}
