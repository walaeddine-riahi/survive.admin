"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  analyzeInjectWithAI,
  computeParticipantScore,
  generateDebrief,
} from "./analysis-actions";
import type { ParsedCrisisPlan } from "./crisis-plan-actions";

// ─── Azure OpenAI ─────────────────────────────────────────────────────────────
async function callAI(system: string, user: string): Promise<string> {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deploy = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";
  const version = process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview";
  if (!endpoint || !apiKey) throw new Error("Azure OpenAI not configured");
  const res = await fetch(
    `${endpoint}openai/deployments/${deploy}/chat/completions?api-version=${version}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": apiKey },
      body: JSON.stringify({
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
        max_tokens: 2500, temperature: 0.2,
      }),
    }
  );
  if (!res.ok) throw new Error(`AI error ${res.status}`);
  const d = await res.json();
  return d.choices?.[0]?.message?.content || "";
}

// ─── Main bridge function ─────────────────────────────────────────────────────
/**
 * Bridges SimSession (v2) data into the Simulation scoring models (v1).
 * Called after a simulation session ends, before generating the debrief.
 *
 * Flow:
 * 1. Load SimSession with all messages, replies, calls, participants
 * 2. For each SimMessage (inject), find the SimReply and map to InjectResponse
 * 3. For each SimParticipant, map to SimulationAssignment (create if needed)
 * 4. Synthesize actual actions per participant per inject using AI
 * 5. Create/update InjectResponse records
 * 6. Trigger full scoring pipeline (analyzeInjectWithAI → computeParticipantScore → generateDebrief)
 */
export async function bridgeSessionToScoring(
  sessionId: string,
  simulationId: string
): Promise<{ success: boolean; data?: BridgeResult; error?: string }> {
  try {
    console.log(`[Bridge] Starting sync: session ${sessionId} → simulation ${simulationId}`);

    // ── 1. Load all session data ──────────────────────────────────────────────
    const [session, simulation, crisisPlan, existingCriteria] = await Promise.all([
      prisma.simSession.findUnique({
        where: { id: sessionId },
        include: {
          participants: true,
          messages: {
            include: { replies: { orderBy: { sentAt: "asc" } } },
            orderBy: { triggeredAt: "asc" },
          },
          calls: { orderBy: { createdAt: "asc" } },
          events: { orderBy: { occurredAt: "asc" } },
        },
      }),
      prisma.simulation.findUnique({
        where: { id: simulationId },
        include: {
          assignments: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
          crisisPlan: true,
          criteria: true,
          injections: { include: { responses: true } },
        },
      }),
      prisma.simulationCrisisPlan.findUnique({ where: { simulationId } }),
      prisma.evaluationCriteria.findMany({ where: { simulationId } }),
    ]);

    if (!session) return { success: false, error: "Session introuvable" };
    if (!simulation) return { success: false, error: "Simulation introuvable" };

    // ── 2. Init evaluation criteria if not set ────────────────────────────────
    if (existingCriteria.length === 0) {
      const { initEvaluationCriteria } = await import("./crisis-plan-actions");
      await initEvaluationCriteria(simulationId);
    }

    const sessionDuration = session.startedAt && session.endedAt
      ? Math.round((new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 60000)
      : session.durationMinutes || 60;

    // ── 3. Map participants → SimulationAssignments ───────────────────────────
    const participantMap: Record<string, string> = {}; // simParticipantId → assignmentId

    for (const participant of session.participants.filter(p => !p.isInstructor && !p.isObserver)) {
      let assignment = simulation.assignments.find(a =>
        participant.userId ? a.userId === participant.userId : false
      );

      if (!assignment && participant.userId) {
        // Create assignment if not exists
        try {
          assignment = await prisma.simulationAssignment.create({
            data: {
              simulationId,
              userId: participant.userId,
              role: participant.role,
              status: "completed",
            },
            include: { user: { select: { id: true, firstName: true, lastName: true } } },
          });
          console.log(`[Bridge] Created assignment for ${participant.displayName}`);
        } catch (e) {
          // May already exist
          assignment = await prisma.simulationAssignment.findUnique({
            where: { userId_simulationId: { userId: participant.userId, simulationId } },
            include: { user: { select: { id: true, firstName: true, lastName: true } } },
          });
        }
      }

      if (assignment) {
        participantMap[participant.id] = assignment.id;
      }
    }

    // ── 4. Map SimMessages → Injections + InjectResponses ────────────────────
    const injectMap: Record<string, string> = {}; // simMessageId → injectionId
    let syncedInjects = 0;

    // Only sync non-trivial messages (instructor-sent injects, not participant messages)
    const instructorMessages = session.messages.filter(m => !m.isFromParticipant);

    for (const msg of instructorMessages) {
      // Find or create corresponding Injection record
      let injection = simulation.injections.find(inj =>
        inj.description?.includes(msg.id) || inj.title === `[v2] ${msg.senderName}: ${msg.body.slice(0, 50)}`
      );

      if (!injection) {
        let scenarioId: string;
        const existingScenario = await prisma.scenario.findFirst({ where: { simulationId } });
        if (existingScenario) {
          scenarioId = existingScenario.id;
        } else {
          const newScenario = await prisma.scenario.create({
            data: { simulationId, title: "Scénario Live V2", description: "Scénario généré pour la session V2" }
          });
          scenarioId = newScenario.id;
        }

        injection = await prisma.injection.create({
          data: {
            simulationId,
            scenarioId,
            title: `[${msg.channel}] ${msg.senderName}: ${msg.body.slice(0, 60)}`,
            description: `Inject ID: ${msg.id}\nCanal: ${msg.channel}\nExpéditeur: ${msg.senderName}\nCorps: ${msg.body}`,
            type: mapChannelToInjectType(msg.channel) as any,
            triggerType: "MANUAL",
            triggerTime: new Date(msg.triggeredAt),
            priority: msg.priority,
            targetRoles: msg.isGroupMessage ? [] : [],
            status: "delivered",
            deliveredAt: new Date(msg.triggeredAt),
            expectedResponse: msg.expectedActions?.join("; ") || undefined,
          },
          include: { responses: true },
        });
      }
      injectMap[msg.id] = injection.id;

      // Build InjectResponse for each participant who received this message
      const recipientParticipantIds = msg.isGroupMessage
        ? session.participants.filter(p => !p.isInstructor && !p.isObserver).map(p => p.id)
        : msg.recipientIds;

      for (const recipientId of recipientParticipantIds) {
        const assignmentId = participantMap[recipientId];
        const participant = session.participants.find(p => p.id === recipientId);
        if (!participant) continue;

        const replies = msg.replies.filter(r => r.participantId === recipientId);
        const firstReply = replies[0];
        const readAt = msg.readByIds.includes(recipientId)
          ? new Date(msg.triggeredAt).getTime() + (firstReply?.responseTimeSeconds || 300) * 1000
          : null;

        // Determine conformity status
        const reactionDelay = firstReply?.responseTimeSeconds
          ? Math.round(firstReply.responseTimeSeconds / 60)
          : null;

        const actualAction = firstReply
          ? firstReply.body
          : msg.readByIds.includes(recipientId)
          ? "[Message lu sans réponse]"
          : "[Message non lu]";

        // Check for call
        const relatedCall = session.calls.find(c =>
          c.recipientId === recipientId && msg.channel === "CALL"
        );

        const conformityStatus =
          !firstReply && !msg.readByIds.includes(recipientId) ? "NON_CONFORMANT" :
          firstReply && reactionDelay !== null && msg.expectedActions?.length
            ? "PARTIAL" : "NOT_APPLICABLE";

        try {
          const existing = await prisma.injectResponse.findFirst({
            where: { injectionId: injection.id, assignmentId: assignmentId || undefined },
          });

          if (!existing) {
            await prisma.injectResponse.create({
              data: {
                simulationId,
                injectionId: injection.id,
                assignmentId: assignmentId || undefined,
                injectedAt: new Date(msg.triggeredAt),
                firstResponseAt: firstReply ? new Date(firstReply.sentAt) : undefined,
                reactionDelayMin: reactionDelay,
                expectedAction: msg.expectedActions?.join("; ") || undefined,
                expectedActor: participant.role,
                actualAction,
                actualActor: participant.displayName,
                conformity: conformityStatus as "CONFORMANT" | "PARTIAL" | "NON_CONFORMANT" | "NOT_APPLICABLE",
                conformityScore: conformityStatus === "NON_CONFORMANT" ? 0 :
                  conformityStatus === "PARTIAL" ? 50 : 70,
                linkedCommunicationIds: [msg.id, ...replies.map(r => r.id)],
              },
            });
            syncedInjects++;
          }
        } catch (e) {
          console.warn(`[Bridge] InjectResponse creation failed:`, e);
        }
      }
    }

    // ── 5. Compute per-participant v2 metrics ─────────────────────────────────
    const participantMetrics: ParticipantV2Metrics[] = [];

    for (const participant of session.participants.filter(p => !p.isInstructor && !p.isObserver)) {
      const myMessages = session.messages.filter(m =>
        !m.isFromParticipant && (m.isGroupMessage || m.recipientIds.includes(participant.id))
      );
      const myReplies = session.messages.flatMap(m => m.replies).filter(r => r.participantId === participant.id);
      const myCalls = session.calls.filter(c => c.recipientId === participant.id);
      const missedCalls = myCalls.filter(c => c.status === "MISSED");
      const answeredCalls = myCalls.filter(c => c.wasAnswered);
      const readMessages = myMessages.filter(m => m.readByIds.includes(participant.id));
      const repliedMessages = myMessages.filter(m => myReplies.some(r => r.messageId === m.id));

      const avgReplyTime = myReplies.length > 0
        ? Math.round(myReplies.reduce((s, r) => s + (r.responseTimeSeconds || 0), 0) / myReplies.length)
        : null;

      const criticalMissed = myMessages.filter(m =>
        m.priority === "CRITICAL" && !m.readByIds.includes(participant.id)
      ).length;

      participantMetrics.push({
        participantId: participant.id,
        assignmentId: participantMap[participant.id],
        displayName: participant.displayName,
        role: participant.role,
        totalMessages: myMessages.length,
        readMessages: readMessages.length,
        repliedMessages: repliedMessages.length,
        readRate: myMessages.length > 0 ? Math.round((readMessages.length / myMessages.length) * 100) : 0,
        replyRate: myMessages.length > 0 ? Math.round((repliedMessages.length / myMessages.length) * 100) : 0,
        avgReplyTimeSeconds: avgReplyTime,
        totalCalls: myCalls.length,
        answeredCalls: answeredCalls.length,
        missedCalls: missedCalls.length,
        callAnswerRate: myCalls.length > 0 ? Math.round((answeredCalls.length / myCalls.length) * 100) : 100,
        criticalMessagesMissed: criticalMissed,
        allReplies: myReplies.map(r => ({ body: r.body, channel: r.channel, responseTime: r.responseTimeSeconds })),
      });
    }

    // ── 6. AI-enhanced analysis per participant ───────────────────────────────
    const crisisPlanText = crisisPlan?.parsedContent
      ? JSON.stringify(crisisPlan.parsedContent).slice(0, 2000)
      : "Aucun plan de crise chargé";

    for (const metrics of participantMetrics) {
      if (!metrics.assignmentId) continue;

      try {
        // Get inject responses for this participant
        const injectResponses = await prisma.injectResponse.findMany({
          where: { simulationId, assignmentId: metrics.assignmentId },
          select: { conformityScore: true, reactionDelayMin: true },
        });

        // Get communications for this participant (replies)
        const communications = metrics.allReplies.map((r, i) => ({
          id: `reply-${i}`,
          content: r.body,
          channel: r.channel,
          responseTime: r.responseTime,
        }));

        // Compute score using existing v1 function
        await computeParticipantScore({
          simulationId,
          assignmentId: metrics.assignmentId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          communications: communications as any[],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          injectResponses: injectResponses as any[],
        });

        console.log(`[Bridge] Score computed for ${metrics.displayName}`);
      } catch (e) {
        console.error(`[Bridge] Score computation failed for ${metrics.displayName}:`, e);
      }
    }

    // ── 7. Enrich scores with v2 behavioral metrics ───────────────────────────
    for (const metrics of participantMetrics) {
      if (!metrics.assignmentId) continue;
      try {
        const existingScore = await prisma.participantScore.findFirst({
          where: { simulationId, assignmentId: metrics.assignmentId },
        });
        if (!existingScore) continue;

        // Compute timeliness score from real Twilio/platform data
        let timelinessBonus = 0;
        if (metrics.avgReplyTimeSeconds !== null) {
          if (metrics.avgReplyTimeSeconds <= 60) timelinessBonus = 10;
          else if (metrics.avgReplyTimeSeconds <= 180) timelinessBonus = 5;
          else if (metrics.avgReplyTimeSeconds <= 300) timelinessBonus = 0;
          else timelinessBonus = -10;
        }
        if (metrics.criticalMessagesMissed > 0) timelinessBonus -= metrics.criticalMessagesMissed * 15;
        if (metrics.missedCalls > 0) timelinessBonus -= metrics.missedCalls * 10;

        const newTimeliness = Math.max(0, Math.min(100,
          existingScore.scoreTimeliness + timelinessBonus
        ));

        // Store v2 metrics in the score record
        await prisma.participantScore.update({
          where: { id: existingScore.id },
          data: {
            scoreTimeliness: newTimeliness,
            // Store v2 metrics in aiNarrative addendum
            aiNarrative: existingScore.aiNarrative + buildV2MetricsNarrative(metrics),
          },
        });
      } catch (e) {
        console.warn("[Bridge] Score enrichment failed:", e);
      }
    }

    // ── 8. Generate final debrief ─────────────────────────────────────────────
    console.log("[Bridge] Generating debrief...");
    await generateDebrief(simulationId);

    // ── 9. Store session→simulation link ──────────────────────────────────────
    const currentSession = await prisma.simSession.findUnique({
      where: { id: sessionId },
      select: { status: true },
    });

    await prisma.simSession.update({
      where: { id: sessionId },
      data: {
        status: currentSession?.status === "DEBRIEF" ? "DEBRIEF" : "ENDED",
        endedAt: new Date(),
      },
    });

    const result: BridgeResult = {
      sessionId,
      simulationId,
      syncedInjects,
      syncedParticipants: Object.keys(participantMap).length,
      participantMetrics,
    };

    revalidatePath(`/simulation/${simulationId}/analysis`);
    revalidatePath(`/simulation/${simulationId}/report`);

    console.log(`[Bridge] Complete: ${syncedInjects} injects, ${Object.keys(participantMap).length} participants`);
    return { success: true, data: result };
  } catch (error) {
    console.error("[Bridge] Fatal error:", error);
    return { success: false, error: `Erreur synchronisation: ${error instanceof Error ? error.message : String(error)}` };
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ParticipantV2Metrics {
  participantId: string;
  assignmentId?: string;
  displayName: string;
  role: string;
  totalMessages: number;
  readMessages: number;
  repliedMessages: number;
  readRate: number;      // % messages lus
  replyRate: number;     // % messages avec réponse
  avgReplyTimeSeconds: number | null;
  totalCalls: number;
  answeredCalls: number;
  missedCalls: number;
  callAnswerRate: number;
  criticalMessagesMissed: number;
  allReplies: Array<{ body: string; channel: string; responseTime: number | null }>;
}

export interface BridgeResult {
  sessionId: string;
  simulationId: string;
  syncedInjects: number;
  syncedParticipants: number;
  participantMetrics: ParticipantV2Metrics[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapChannelToInjectType(channel: string): string {
  const map: Record<string, string> = {
    EMAIL: "EMAIL",
    SMS: "SMS",
    CALL: "CALL",
    WHATSAPP: "SMS",
    ALERT: "ALERT",
    FLASH_INFO: "NEWS_BROADCAST",
    JOURNAL: "NEWSPAPER",
    SOCIAL_MEDIA: "SOCIAL",
    INTERNAL_RADIO: "NEWS_BROADCAST",
  };
  return map[channel] || "OTHER";
}

function buildV2MetricsNarrative(metrics: ParticipantV2Metrics): string {
  const parts = [
    `\n\n[Métriques temps réel v2]`,
    `• Taux de lecture : ${metrics.readRate}% (${metrics.readMessages}/${metrics.totalMessages} messages)`,
    `• Taux de réponse : ${metrics.replyRate}% (${metrics.repliedMessages}/${metrics.totalMessages} messages)`,
    metrics.avgReplyTimeSeconds !== null
      ? `• Délai de réponse moyen : ${metrics.avgReplyTimeSeconds}s`
      : null,
    metrics.totalCalls > 0
      ? `• Appels : ${metrics.answeredCalls} décroché(s) / ${metrics.totalCalls} (${metrics.callAnswerRate}%)`
      : null,
    metrics.criticalMessagesMissed > 0
      ? `⚠️ ${metrics.criticalMessagesMissed} message(s) CRITIQUE(S) non lu(s)`
      : null,
    metrics.missedCalls > 0
      ? `⚠️ ${metrics.missedCalls} appel(s) manqué(s)`
      : null,
  ].filter(Boolean);
  return parts.join("\n");
}

// ─── Get v2 metrics for an existing simulation ────────────────────────────────
export async function getSessionMetricsForSimulation(simulationId: string): Promise<{
  success: boolean;
  data?: {
    session: { id: string; title: string; startedAt: Date | null; endedAt: Date | null } | null;
    participantMetrics: ParticipantV2Metrics[];
    teamMetrics: {
      avgReadRate: number;
      avgReplyRate: number;
      avgReplyTimeSeconds: number | null;
      totalCalls: number;
      answeredCalls: number;
      missedCriticals: number;
    };
  };
}> {
  try {
    const session = await prisma.simSession.findFirst({
      where: { simulationId },
      include: {
        participants: true,
        messages: {
          include: { replies: { orderBy: { sentAt: "asc" } } },
          orderBy: { triggeredAt: "asc" },
        },
        calls: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!session) return { success: true, data: { session: null, participantMetrics: [], teamMetrics: { avgReadRate: 0, avgReplyRate: 0, avgReplyTimeSeconds: null, totalCalls: 0, answeredCalls: 0, missedCriticals: 0 } } };

    const participantMetrics: ParticipantV2Metrics[] = [];

    for (const participant of session.participants.filter(p => !p.isInstructor && !p.isObserver)) {
      const myMessages = session.messages.filter(m =>
        !m.isFromParticipant && (m.isGroupMessage || m.recipientIds.includes(participant.id))
      );
      const myReplies = session.messages.flatMap(m => m.replies).filter(r => r.participantId === participant.id);
      const myCalls = session.calls.filter(c => c.recipientId === participant.id);

      const avgReplyTime = myReplies.length > 0
        ? Math.round(myReplies.reduce((s, r) => s + (r.responseTimeSeconds || 0), 0) / myReplies.length)
        : null;

      participantMetrics.push({
        participantId: participant.id,
        displayName: participant.displayName,
        role: participant.role,
        totalMessages: myMessages.length,
        readMessages: myMessages.filter(m => m.readByIds.includes(participant.id)).length,
        repliedMessages: myMessages.filter(m => myReplies.some(r => r.messageId === m.id)).length,
        readRate: myMessages.length > 0 ? Math.round((myMessages.filter(m => m.readByIds.includes(participant.id)).length / myMessages.length) * 100) : 0,
        replyRate: myMessages.length > 0 ? Math.round((myMessages.filter(m => myReplies.some(r => r.messageId === m.id)).length / myMessages.length) * 100) : 0,
        avgReplyTimeSeconds: avgReplyTime,
        totalCalls: myCalls.length,
        answeredCalls: myCalls.filter(c => c.wasAnswered).length,
        missedCalls: myCalls.filter(c => c.status === "MISSED").length,
        callAnswerRate: myCalls.length > 0 ? Math.round((myCalls.filter(c => c.wasAnswered).length / myCalls.length) * 100) : 100,
        criticalMessagesMissed: myMessages.filter(m => m.priority === "CRITICAL" && !m.readByIds.includes(participant.id)).length,
        allReplies: myReplies.map(r => ({ body: r.body, channel: r.channel, responseTime: r.responseTimeSeconds })),
      });
    }

    const teamMetrics = {
      avgReadRate: participantMetrics.length > 0
        ? Math.round(participantMetrics.reduce((s, m) => s + m.readRate, 0) / participantMetrics.length) : 0,
      avgReplyRate: participantMetrics.length > 0
        ? Math.round(participantMetrics.reduce((s, m) => s + m.replyRate, 0) / participantMetrics.length) : 0,
      avgReplyTimeSeconds: participantMetrics.some(m => m.avgReplyTimeSeconds !== null)
        ? Math.round(participantMetrics.filter(m => m.avgReplyTimeSeconds !== null).reduce((s, m) => s + m.avgReplyTimeSeconds!, 0) / participantMetrics.filter(m => m.avgReplyTimeSeconds !== null).length) : null,
      totalCalls: participantMetrics.reduce((s, m) => s + m.totalCalls, 0),
      answeredCalls: participantMetrics.reduce((s, m) => s + m.answeredCalls, 0),
      missedCriticals: participantMetrics.reduce((s, m) => s + m.criticalMessagesMissed, 0),
    };

    return {
      success: true,
      data: {
        session: { id: session.id, title: session.title, startedAt: session.startedAt, endedAt: session.endedAt },
        participantMetrics,
        teamMetrics,
      },
    };
  } catch (error) {
    console.error("getSessionMetricsForSimulation error:", error);
    return { success: false };
  }
}
