"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  getPreExerciseQuestions, getPostExerciseQuestions,
  generateAIPostQuestions, computeAggregates,
  type QuestionDef, type FormAnswers,
} from "@/lib/simulation/form-templates";
import { pushToSession } from "@/lib/simulation/pusher";

// ─── Generate and save pre-exercise form ──────────────────────────────────────

export async function createPreForm(sessionId: string, simulationId: string) {
  try {
    const existing = await prisma.exerciseForm.findFirst({
      where: { sessionId, type: "PRE_EXERCISE" },
    });
    if (existing) return { success: true, data: existing };

    const simulation = await prisma.simulation.findUnique({
      where: { id: simulationId },
      select: { title: true },
    });

    const questions = getPreExerciseQuestions(simulation?.title || "");

    const form = await prisma.exerciseForm.create({
      data: {
        sessionId,
        simulationId,
        type: "PRE_EXERCISE",
        title: `Questionnaire pré-exercice — ${simulation?.title || "Simulation"}`,
        description: "Remplissez ce questionnaire avant le démarrage de l'exercice. Vos réponses sont confidentielles.",
        questions: questions as object[],
        isActive: true,
      },
    });

    // Push notification to all participants
    await pushToSession(sessionId, "form_available", {
      formId: form.id,
      type: "PRE_EXERCISE",
      title: form.title,
    });

    return { success: true, data: form };
  } catch (error) {
    console.error("createPreForm:", error);
    return { success: false, error: "Erreur création formulaire pré-exercice" };
  }
}

// ─── Generate and save post-exercise form (auto-triggered on DEBRIEF) ─────────

export async function createPostForm(sessionId: string, simulationId: string) {
  try {
    const existing = await prisma.exerciseForm.findFirst({
      where: { sessionId, type: "POST_EXERCISE" },
    });
    if (existing) return { success: true, data: existing };

    const [simulation, participants, session] = await Promise.all([
      prisma.simulation.findUnique({
        where: { id: simulationId },
        select: { title: true, scenarioContext: true, type: true },
      }),
      prisma.simParticipant.findMany({
        where: { sessionId, isInstructor: false, isObserver: false },
        select: { role: true },
      }),
      prisma.simSession.findUnique({
        where: { id: sessionId },
        select: { startedAt: true, endedAt: true, messages: { select: { id: true } } },
      }),
    ]);

    const sessionDuration = session?.startedAt && session?.endedAt
      ? Math.round((new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 60000)
      : 90;

    // Get base questions (same for all)
    const baseQuestions = getPostExerciseQuestions(
      simulation?.title || "",
      "Participant",
      simulation?.type || "tabletop"
    );

    // Try AI enhancement
    let aiQuestions: QuestionDef[] | null = null;
    if (simulation?.scenarioContext) {
      aiQuestions = await generateAIPostQuestions({
        scenarioTitle: simulation.title || "",
        scenarioContext: simulation.scenarioContext,
        participantRole: "Participant",
        sessionDuration,
        injectCount: session?.messages?.length || 0,
      });
    }

    const allQuestions = [
      ...baseQuestions,
      ...(aiQuestions || []),
    ];

    const form = await prisma.exerciseForm.create({
      data: {
        sessionId,
        simulationId,
        type: "POST_EXERCISE",
        title: `Questionnaire post-exercice — ${simulation?.title || "Simulation"}`,
        description: "L'exercice est terminé. Merci de remplir ce formulaire de débrief. Vos réponses sont anonymisées dans la synthèse équipe.",
        questions: allQuestions as object[],
        isActive: true,
        generatedByAI: !!aiQuestions,
      },
    });

    // Push notification to all participants
    await pushToSession(sessionId, "form_available", {
      formId: form.id,
      type: "POST_EXERCISE",
      title: form.title,
      urgent: true,
    });

    revalidatePath(`/simulation`);
    return { success: true, data: form };
  } catch (error) {
    console.error("createPostForm:", error);
    return { success: false, error: "Erreur création formulaire post-exercice" };
  }
}

// ─── Get forms for a session ──────────────────────────────────────────────────

export async function getSessionForms(sessionId: string) {
  try {
    const forms = await prisma.exerciseForm.findMany({
      where: { sessionId },
      include: {
        _count: { select: { responses: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    return { success: true, data: forms };
  } catch {
    return { success: false, error: "Erreur récupération formulaires" };
  }
}

export async function getFormWithResponses(formId: string) {
  try {
    const form = await prisma.exerciseForm.findUnique({
      where: { id: formId },
      include: {
        responses: {
          orderBy: { completedAt: "asc" },
        },
      },
    });
    return { success: true, data: form };
  } catch {
    return { success: false, error: "Erreur" };
  }
}

// ─── Submit a form response ───────────────────────────────────────────────────

export async function submitFormResponse(input: {
  formId: string;
  sessionId: string;
  participantId: string;
  participantName: string;
  participantRole: string;
  answers: FormAnswers;
  durationSeconds?: number;
}) {
  try {
    // Upsert response
    const response = await prisma.formResponse.upsert({
      where: {
        formId_participantId: {
          formId: input.formId,
          participantId: input.participantId,
        },
      },
      create: {
        formId: input.formId,
        sessionId: input.sessionId,
        participantId: input.participantId,
        participantName: input.participantName,
        participantRole: input.participantRole,
        answers: input.answers as object,
        durationSeconds: input.durationSeconds,
      },
      update: {
        answers: input.answers as object,
        durationSeconds: input.durationSeconds,
        completedAt: new Date(),
      },
    });

    // Recompute aggregates
    await recomputeAggregates(input.formId);

    return { success: true, data: response };
  } catch (error) {
    console.error("submitFormResponse:", error);
    return { success: false, error: "Erreur soumission réponse" };
  }
}

// ─── Check if participant has responded ──────────────────────────────────────

export async function getParticipantResponse(formId: string, participantId: string) {
  try {
    const response = await prisma.formResponse.findUnique({
      where: { formId_participantId: { formId, participantId } },
    });
    return { success: true, data: response };
  } catch {
    return { success: false, error: "Erreur" };
  }
}

// ─── Recompute aggregates ─────────────────────────────────────────────────────

async function recomputeAggregates(formId: string) {
  try {
    const form = await prisma.exerciseForm.findUnique({
      where: { id: formId },
      include: { responses: true },
    });
    if (!form) return;

    const questions = form.questions as unknown as QuestionDef[];
    const responses = form.responses.map(r => ({ answers: r.answers as FormAnswers }));
    const aggregates = computeAggregates(responses, questions);

    await prisma.exerciseForm.update({
      where: { id: formId },
      data: { aggregateResults: aggregates as object },
    });
  } catch (e) {
    console.warn("recomputeAggregates failed:", e);
  }
}

// ─── Close form and finalize aggregates ───────────────────────────────────────

export async function closeForm(formId: string) {
  try {
    await recomputeAggregates(formId);
    await prisma.exerciseForm.update({
      where: { id: formId },
      data: { isActive: false, closedAt: new Date() },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Erreur fermeture formulaire" };
  }
}

// ─── Export synthesis for instructor / ISO 22301 §9.1 ─────────────────────────

export async function exportFormSynthesis(sessionId: string): Promise<{
  success: boolean;
  data?: string;
  error?: string;
}> {
  try {
    const [forms, session] = await Promise.all([
      prisma.exerciseForm.findMany({
        where: { sessionId },
        include: { responses: { orderBy: { completedAt: "asc" } } },
      }),
      prisma.simSession.findUnique({
        where: { id: sessionId },
        select: { title: true, startedAt: true },
      }),
    ]);

    const lines: string[] = [
      `SYNTHÈSE DES QUESTIONNAIRES D'EXERCICE`,
      `Session : ${session?.title || "—"}`,
      `Date : ${session?.startedAt ? new Date(session.startedAt).toLocaleDateString("fr-FR") : "—"}`,
      `Référence : ISO 22301 §9.1 — Surveillance, mesure, analyse et évaluation`,
      ``,
      `═══════════════════════════════════════════════════════════`,
      ``,
    ];

    for (const form of forms) {
      const questions = form.questions as unknown as QuestionDef[];
      const agg = form.aggregateResults as Record<string, { label: string; avg?: number; distribution?: Record<string, number>; textResponses?: string[]; gridAvg?: Record<string, number> }> | null;

      lines.push(`${form.type === "PRE_EXERCISE" ? "QUESTIONNAIRE PRÉ-EXERCICE" : "QUESTIONNAIRE POST-EXERCICE"}`);
      lines.push(`Répondants : ${form.responses.length}`);
      lines.push(`Statut : ${form.isActive ? "Ouvert" : "Fermé"}`);
      lines.push(`───────────────────────────────────────────────────────────`);
      lines.push(``)

      if (agg) {
        for (const q of questions) {
          const a = agg[q.id];
          if (!a) continue;
          lines.push(`Q: ${q.label}`);

          if (a.avg !== undefined) {
            lines.push(`   Moyenne : ${a.avg}/5`);
          }
          if (a.distribution) {
            const sorted = Object.entries(a.distribution).sort((x, y) => y[1] - x[1]);
            sorted.forEach(([k, v]) => {
              const pct = form.responses.length > 0 ? Math.round((v / form.responses.length) * 100) : 0;
              lines.push(`   ${k.padEnd(50)} ${v} réponse(s) (${pct}%)`);
            });
          }
          if (a.textResponses?.length) {
            lines.push(`   Réponses textuelles :`);
            a.textResponses.forEach(t => lines.push(`   • "${t}"`));
          }
          if (a.gridAvg) {
            Object.entries(a.gridAvg).forEach(([row, avg]) => {
              lines.push(`   ${row.padEnd(50)} Moy: ${avg}/5`);
            });
          }
          lines.push(``);
        }
      }
      lines.push(`═══════════════════════════════════════════════════════════`);
      lines.push(``);
    }

    return { success: true, data: lines.join("\n") };
  } catch (error) {
    return { success: false, error: "Erreur export" };
  }
}
