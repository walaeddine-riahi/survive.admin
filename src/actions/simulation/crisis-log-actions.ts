"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  pushToInstructor, pushToSession, SIM_EVENTS,
} from "@/lib/simulation/pusher";

// ─── Types ────────────────────────────────────────────────────────────────────

export type EntryType = "DECISION" | "ACTION" | "ESCALATION" | "INFORMATION" | "OBSERVATION" | "MILESTONE";
export type DecisionStatus = "DRAFT" | "CONFIRMED" | "VALIDATED" | "OVERRULED" | "PENDING_REVIEW";
export type ActionStatus = "TODO" | "IN_PROGRESS" | "DONE" | "FAILED" | "CANCELLED";
export type InstructorFlag = "GOOD" | "MISSED" | "CRITICAL_ERROR" | "IMPROVABLE";

export interface CreateLogEntryInput {
  sessionId: string;
  type: EntryType;
  participantId?: string;
  participantName: string;
  participantRole: string;
  title: string;
  content: string;
  justification?: string;
  impactScope?: string[];
  // Decision
  decisionStatus?: DecisionStatus;
  alternativesConsidered?: string;
  // Action
  actionStatus?: ActionStatus;
  dueAt?: string;
  assignedToName?: string;
  // Escalation
  escalatedToName?: string;
  escalatedToRole?: string;
  // Links
  linkedMessageId?: string;
  linkedInjectId?: string;
  // Instructor only
  isInstructorOnly?: boolean;
}

// ─── Create entry ─────────────────────────────────────────────────────────────

export async function createLogEntry(input: CreateLogEntryInput) {
  try {
    // Get next sequence number
    const count = await prisma.crisisLogEntry.count({ where: { sessionId: input.sessionId } });
    const sequenceNumber = count + 1;

    const entry = await prisma.crisisLogEntry.create({
      data: {
        sessionId: input.sessionId,
        type: input.type,
        sequenceNumber,
        participantId: input.participantId,
        participantName: input.participantName,
        participantRole: input.participantRole,
        title: input.title,
        content: input.content,
        justification: input.justification,
        impactScope: input.impactScope ?? [],
        decisionStatus: input.decisionStatus,
        alternativesConsidered: input.alternativesConsidered,
        actionStatus: input.actionStatus,
        dueAt: input.dueAt ? new Date(input.dueAt) : undefined,
        assignedToName: input.assignedToName,
        escalatedToName: input.escalatedToName,
        escalatedToRole: input.escalatedToRole,
        linkedMessageId: input.linkedMessageId,
        linkedInjectId: input.linkedInjectId,
        isInstructorOnly: input.isInstructorOnly ?? false,
        occurredAt: new Date(),
      },
    });

    // Push real-time to instructor
    await pushToInstructor(input.sessionId, "crisis_log_entry", {
      entryId: entry.id,
      type: entry.type,
      sequenceNumber: entry.sequenceNumber,
      participantName: entry.participantName,
      participantRole: entry.participantRole,
      title: entry.title,
      content: entry.content,
      occurredAt: entry.occurredAt,
      isInstructorOnly: entry.isInstructorOnly,
    });

    // Push to session (all participants) if not instructor-only
    if (!input.isInstructorOnly) {
      await pushToSession(input.sessionId, "crisis_log_new_entry", {
        entryId: entry.id,
        type: entry.type,
        sequenceNumber: entry.sequenceNumber,
        participantName: entry.participantName,
        title: entry.title,
        occurredAt: entry.occurredAt,
      });
    }

    return { success: true, data: entry };
  } catch (error) {
    console.error("createLogEntry:", error);
    return { success: false, error: "Erreur création entrée main courante" };
  }
}

// ─── Update entry (participant confirms, instructor scores) ───────────────────

export async function updateLogEntry(id: string, data: {
  content?: string;
  justification?: string;
  decisionStatus?: DecisionStatus;
  actionStatus?: ActionStatus;
  completedAt?: boolean;
  escalationResponse?: string;
  validatedByName?: string;
  // Instructor fields
  instructorScore?: number;
  instructorFlag?: InstructorFlag;
  instructorNote?: string;
}) {
  try {
    const entry = await prisma.crisisLogEntry.update({
      where: { id },
      data: {
        ...(data.content !== undefined && { content: data.content }),
        ...(data.justification !== undefined && { justification: data.justification }),
        ...(data.decisionStatus && { decisionStatus: data.decisionStatus }),
        ...(data.actionStatus && { actionStatus: data.actionStatus }),
        ...(data.completedAt && { completedAt: new Date() }),
        ...(data.escalationResponse && { escalationResponse: data.escalationResponse }),
        ...(data.validatedByName && {
          validatedByName: data.validatedByName,
          decisionStatus: "VALIDATED",
          validatedAt: new Date(),
        }),
        ...(data.instructorScore !== undefined && { instructorScore: data.instructorScore }),
        ...(data.instructorFlag && { instructorFlag: data.instructorFlag }),
        ...(data.instructorNote !== undefined && { instructorNote: data.instructorNote }),
      },
    });

    // Push update to instructor
    if (data.instructorScore !== undefined || data.instructorFlag) {
      await pushToInstructor(entry.sessionId, "crisis_log_scored", {
        entryId: id,
        instructorScore: data.instructorScore,
        instructorFlag: data.instructorFlag,
      });
    }

    return { success: true, data: entry };
  } catch (error) {
    return { success: false, error: "Erreur mise à jour entrée" };
  }
}

// ─── Get full crisis log for session ─────────────────────────────────────────

export async function getCrisisLog(sessionId: string, includeInstructorOnly = false) {
  try {
    const entries = await prisma.crisisLogEntry.findMany({
      where: {
        sessionId,
        ...(includeInstructorOnly ? {} : { isInstructorOnly: false }),
      },
      orderBy: { occurredAt: "asc" },
    });
    return { success: true, data: entries };
  } catch (error) {
    return { success: false, error: "Erreur récupération main courante" };
  }
}

// ─── Get delta for polling ────────────────────────────────────────────────────

export async function getCrisisLogDelta(sessionId: string, since: string, isInstructor = false) {
  try {
    const entries = await prisma.crisisLogEntry.findMany({
      where: {
        sessionId,
        createdAt: { gt: new Date(since) },
        ...(isInstructor ? {} : { isInstructorOnly: false }),
      },
      orderBy: { occurredAt: "asc" },
    });
    return { success: true, data: entries };
  } catch {
    return { success: false, error: "Erreur" };
  }
}

// ─── Instructor scoring batch ─────────────────────────────────────────────────

export async function scoreLogEntry(
  entryId: string,
  score: number,
  flag: InstructorFlag,
  note?: string
) {
  return updateLogEntry(entryId, { instructorScore: score, instructorFlag: flag, instructorNote: note });
}

// ─── Get stats for scoring pipeline ──────────────────────────────────────────

export async function getCrisisLogStats(sessionId: string) {
  try {
    const entries = await prisma.crisisLogEntry.findMany({
      where: { sessionId, isInstructorOnly: false },
      select: {
        type: true, decisionStatus: true, actionStatus: true,
        instructorScore: true, instructorFlag: true,
        participantId: true, participantName: true, participantRole: true,
        occurredAt: true,
      },
    });

    const decisions = entries.filter(e => e.type === "DECISION");
    const actions = entries.filter(e => e.type === "ACTION");
    const escalations = entries.filter(e => e.type === "ESCALATION");

    const scoredDecisions = decisions.filter(e => e.instructorScore !== null);
    const avgDecisionScore = scoredDecisions.length > 0
      ? Math.round(scoredDecisions.reduce((s, e) => s + (e.instructorScore || 0), 0) / scoredDecisions.length * 10)
      : null;

    // Per-participant stats
    const byParticipant = entries.reduce((acc: Record<string, {
      name: string; role: string; decisions: number; actions: number;
      avgScore: number | null; scores: number[];
    }>, e) => {
      const key = e.participantId || e.participantName;
      if (!acc[key]) acc[key] = { name: e.participantName, role: e.participantRole, decisions: 0, actions: 0, avgScore: null, scores: [] };
      if (e.type === "DECISION") acc[key].decisions++;
      if (e.type === "ACTION") acc[key].actions++;
      if (e.instructorScore !== null) acc[key].scores.push(e.instructorScore);
      return acc;
    }, {});

    Object.values(byParticipant).forEach((p) => {
      if (p.scores.length > 0) {
        p.avgScore = Math.round(p.scores.reduce((a, b) => a + b, 0) / p.scores.length * 10);
      }
    });

    const flagCounts = entries.reduce((acc: Record<string, number>, e) => {
      if (e.instructorFlag) acc[e.instructorFlag] = (acc[e.instructorFlag] || 0) + 1;
      return acc;
    }, {});

    return {
      success: true,
      data: {
        total: entries.length,
        decisions: decisions.length,
        actions: actions.length,
        escalations: escalations.length,
        avgDecisionScore,
        flagCounts,
        byParticipant,
        confirmedDecisions: decisions.filter(e => e.decisionStatus === "CONFIRMED" || e.decisionStatus === "VALIDATED").length,
        completedActions: actions.filter(e => e.actionStatus === "DONE").length,
      },
    };
  } catch (error) {
    return { success: false, error: "Erreur stats main courante" };
  }
}

// ─── Generate PDF-ready export ────────────────────────────────────────────────

export async function exportCrisisLog(sessionId: string): Promise<{
  success: boolean;
  data?: {
    session: { title: string; startedAt: Date | null };
    entries: Array<{
      seq: string;
      time: string;
      type: string;
      role: string;
      author: string;
      title: string;
      content: string;
      justification?: string;
      status?: string;
      instructorScore?: number;
      instructorFlag?: string;
      instructorNote?: string;
    }>;
    stats: {
      total: number;
      decisions: number;
      actions: number;
      avgDecisionScore: number | null;
    };
  };
  error?: string;
}> {
  try {
    const [session, entries] = await Promise.all([
      prisma.simSession.findUnique({
        where: { id: sessionId },
        select: { title: true, startedAt: true },
      }),
      prisma.crisisLogEntry.findMany({
        where: { sessionId },
        orderBy: { occurredAt: "asc" },
      }),
    ]);

    if (!session) return { success: false, error: "Session introuvable" };

    const stats = await getCrisisLogStats(sessionId);

    return {
      success: true,
      data: {
        session: { title: session.title, startedAt: session.startedAt },
        entries: entries.map(e => ({
          seq: `MC-${String(e.sequenceNumber).padStart(3, "0")}`,
          time: new Date(e.occurredAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          type: e.type,
          role: e.participantRole,
          author: e.participantName,
          title: e.title,
          content: e.content,
          justification: e.justification || undefined,
          status: e.decisionStatus || e.actionStatus || undefined,
          instructorScore: e.instructorScore || undefined,
          instructorFlag: e.instructorFlag || undefined,
          instructorNote: e.instructorNote || undefined,
        })),
        stats: {
          total: entries.length,
          decisions: entries.filter(e => e.type === "DECISION").length,
          actions: entries.filter(e => e.type === "ACTION").length,
          avgDecisionScore: stats.data?.avgDecisionScore ?? null,
        },
      },
    };
  } catch (error) {
    return { success: false, error: "Erreur export" };
  }
}
