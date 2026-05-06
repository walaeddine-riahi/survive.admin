"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

// ─── Types ────────────────────────────────────────────────────────────────────

import {
  type ParsedCrisisPlan,
  DEFAULT_CRITERIA,
} from "@/lib/simulation/crisis-plan-types";

// ─── Upload & Parse Crisis Plan ───────────────────────────────────────────────

export async function uploadCrisisPlan(simulationId: string, data: {
  fileName: string;
  fileUrl?: string;
  fileSize?: number;
  rawText: string;  // Texte extrait côté client (pdfjs ou mammoth)
}) {
  try {
    // Upsert — une simulation = un plan
    const plan = await prisma.simulationCrisisPlan.upsert({
      where: { simulationId },
      create: {
        simulationId,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        rawText: data.rawText,
        status: "PARSING",
      },
      update: {
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        rawText: data.rawText,
        status: "PARSING",
        parsedStructure: null,
        aiSummary: null,
        keywords: [],
        parsedAt: null,
      },
    });

    return { success: true, data: plan };
  } catch (error) {
    console.error("uploadCrisisPlan error:", error);
    return { success: false, error: "Erreur lors de l'upload du plan" };
  }
}

export async function saveParsedCrisisPlan(simulationId: string, parsed: ParsedCrisisPlan, aiSummary: string) {
  try {
    const keywords = Array.from(new Set([
      ...parsed.procedures.flatMap(p => [p.type_incident, ...p.declencheurs]),
      ...parsed.roles.map(r => r.role),
    ])).filter(Boolean).slice(0, 50);

    const plan = await prisma.simulationCrisisPlan.update({
      where: { simulationId },
      data: {
        parsedStructure: parsed as unknown as Record<string, unknown>,
        aiSummary,
        keywords,
        status: "READY",
        parsedAt: new Date(),
      },
    });

    revalidatePath(`/simulation/${simulationId}/analysis`);
    return { success: true, data: plan };
  } catch (error) {
    console.error("saveParsedCrisisPlan error:", error);
    return { success: false, error: "Erreur lors de la sauvegarde du plan parsé" };
  }
}

export async function getCrisisPlan(simulationId: string) {
  try {
    const plan = await prisma.simulationCrisisPlan.findUnique({
      where: { simulationId },
    });
    return { success: true, data: plan };
  } catch (error) {
    return { success: false, error: "Erreur récupération plan" };
  }
}

// ─── Evaluation Criteria ──────────────────────────────────────────────────────

// Evaluation Criteria

export async function initEvaluationCriteria(simulationId: string, criteria = DEFAULT_CRITERIA) {
  try {
    // Clear existing and recreate
    await prisma.evaluationCriteria.deleteMany({ where: { simulationId } });
    await prisma.evaluationCriteria.createMany({
      data: criteria.map(c => ({ simulationId, ...c })),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erreur initialisation critères" };
  }
}

export async function getCriteria(simulationId: string) {
  try {
    const criteria = await prisma.evaluationCriteria.findMany({
      where: { simulationId, isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return { success: true, data: criteria };
  } catch (error) {
    return { success: false, error: "Erreur récupération critères" };
  }
}

export async function updateCriteria(id: string, data: Partial<typeof DEFAULT_CRITERIA[0]>) {
  try {
    const c = await prisma.evaluationCriteria.update({ where: { id }, data });
    return { success: true, data: c };
  } catch (error) {
    return { success: false, error: "Erreur mise à jour critère" };
  }
}
