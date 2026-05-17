"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import {
  pushToParticipant, pushToSession, pushToInstructor, SIM_EVENTS,
} from "@/lib/simulation/pusher";
import { sendSimSms, initiateSimCall } from "@/lib/simulation/twilio";

// ─── Session management ───────────────────────────────────────────────────────

export async function createSimSession(input: {
  simulationId: string;
  title: string;
  scenarioContext?: string;
  briefingText?: string;
  scheduledAt: string;
  durationMinutes?: number;
  allowParticipantInit?: boolean;
  createdById?: string;
}) {
  try {
    const wsRoomId = `sim-${randomBytes(8).toString("hex")}`;
    const session = await prisma.simSession.create({
      data: {
        simulationId: input.simulationId,
        title: input.title,
        scenarioContext: input.scenarioContext,
        briefingText: input.briefingText,
        scheduledAt: new Date(input.scheduledAt),
        durationMinutes: input.durationMinutes,
        allowParticipantInit: input.allowParticipantInit ?? false,
        createdById: input.createdById,
        wsRoomId,
        status: "SETUP",
      },
    });
    revalidatePath("/simulation");
    return { success: true, data: session };
  } catch (error) {
    console.error("createSimSession:", error);
    return { success: false, error: "Erreur création session" };
  }
}

export async function getSimSession(sessionId: string) {
  try {
    const session = await prisma.simSession.findUnique({
      where: { id: sessionId },
      include: {
        participants: { orderBy: { joinedAt: "asc" } },
        messages: {
          include: { replies: { orderBy: { sentAt: "asc" } } },
          orderBy: { triggeredAt: "desc" },
          take: 200,
        },
        calls: { orderBy: { createdAt: "desc" }, take: 50 },
        events: { orderBy: { occurredAt: "desc" }, take: 100 },
        crisisLog: { orderBy: { occurredAt: "asc" } },
      },
    });
    return { success: true, data: session };
  } catch (error) {
    return { success: false, error: "Erreur récupération session" };
  }
}

export async function updateSessionStatus(
  sessionId: string,
  status: string,
  extra?: { startedAt?: boolean; endedAt?: boolean; pausedAt?: boolean }
) {
  try {
    const data: Record<string, unknown> = { status };
    if (extra?.startedAt) data.startedAt = new Date();
    if (extra?.endedAt) data.endedAt = new Date();
    if (extra?.pausedAt) data.pausedAt = new Date();

    const session = await prisma.simSession.update({ where: { id: sessionId }, data });

    // Push status change to all participants
    await pushToSession(sessionId, SIM_EVENTS.SESSION_STATUS, {
      status,
      startedAt: session.startedAt,
    });

    await logSimEvent(sessionId, {
      type: `session_${status.toLowerCase()}`,
      description: `Session passée à l'état : ${status}`,
    });

    revalidatePath("/simulation");
    return { success: true, data: session };
  } catch (error) {
    return { success: false, error: "Erreur mise à jour statut" };
  }
}

// ─── Participant management ───────────────────────────────────────────────────

export async function addParticipant(sessionId: string, input: {
  userId?: string;
  displayName: string;
  role: string;
  team?: string;
  email?: string;
  phone?: string;
  isInstructor?: boolean;
  isObserver?: boolean;
}) {
  try {
    const slug = input.displayName.toLowerCase().replace(/\s+/g, ".").replace(/[^a-z.]/g, "");
    const simEmail = `${slug}@sim.survive.io`;
    const simPhone = `+SIM-${Math.floor(1000 + Math.random() * 9000)}`;

    const participant = await prisma.simParticipant.create({
      data: {
        sessionId,
        userId: input.userId,
        displayName: input.displayName,
        role: input.role,
        team: input.team,
        email: input.email,
        phone: input.phone,
        isInstructor: input.isInstructor ?? false,
        isObserver: input.isObserver ?? false,
        simEmail,
        simPhone,
      },
    });
    revalidatePath("/simulation");
    return { success: true, data: participant };
  } catch (error) {
    return { success: false, error: "Erreur ajout participant" };
  }
}

export async function addExternalActor(sessionId: string, input: {
  displayName: string;
  role: string;
  email?: string;
  phone?: string;
}) {
  try {
    const slug = input.displayName.toLowerCase().replace(/\s+/g, ".").replace(/[^a-z.]/g, "");
    const simEmail = input.email || `${slug}@sim.survive.io`;
    const simPhone = input.phone || `+SIM-${Math.floor(1000 + Math.random() * 9000)}`;

    // Generate a unique 24-character hex string for userId to bypass MongoDB unique constraint
    const randomHex = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

    const participant = await prisma.simParticipant.create({
      data: {
        sessionId,
        userId: randomHex,
        displayName: input.displayName,
        role: input.role,
        isInstructor: false,
        isObserver: false,
        isExternal: true,
        simEmail,
        simPhone,
      },
    });

    // Notify everyone (participants + instructors) in real-time about the new actor
    await pushToSession(sessionId, SIM_EVENTS.PARTICIPANT_JOINED, {
      participantId: participant.id,
      displayName: participant.displayName,
      role: participant.role,
      isExternal: true,
      simEmail,
      simPhone,
      isConnected: true,
    });

    revalidatePath("/simulation");
    return { success: true, data: participant };
  } catch (error) {
    console.error("Error in addExternalActor:", error);
    return { success: false, error: "Erreur ajout acteur externe" };
  }
}

export async function markParticipantConnected(
  participantId: string,
  connected: boolean,
  sessionId?: string
) {
  try {
    const participant = await prisma.simParticipant.update({
      where: { id: participantId },
      data: {
        isConnected: connected,
        lastSeenAt: new Date(),
        ...(connected && { joinedAt: new Date() }),
      },
    });

    // Notify instructor
    if (sessionId) {
      const event = connected ? SIM_EVENTS.PARTICIPANT_JOINED : SIM_EVENTS.PARTICIPANT_LEFT;
      await pushToInstructor(sessionId, event, {
        participantId,
        displayName: participant.displayName,
        role: participant.role,
      });
    }

    return { success: true };
  } catch {
    return { success: false };
  }
}

// ─── Message/Inject — core function with Pusher + Twilio ─────────────────────

export async function sendSimMessage(input: {
  sessionId: string;
  channel: string;
  priority: string;
  senderName: string;
  senderEmail?: string;
  senderPhone?: string;
  recipientIds: string[];
  isGroupMessage?: boolean;
  groupName?: string;
  subject?: string;
  body: string;
  attachments?: unknown[];
  callScript?: string;
  expiresInMinutes?: number;
  expectedActions?: string[];
  isFromParticipant?: boolean;
  fromParticipantId?: string;
}) {
  try {
    const now = new Date();
    const expiresAt = input.expiresInMinutes
      ? new Date(now.getTime() + input.expiresInMinutes * 60 * 1000)
      : undefined;

    const message = await prisma.simMessage.create({
      data: {
        sessionId: input.sessionId,
        channel: input.channel as "EMAIL" | "SMS" | "CALL" | "WHATSAPP" | "ALERT" | "FLASH_INFO" | "JOURNAL" | "SOCIAL_MEDIA" | "INTERNAL_RADIO",
        priority: input.priority as "LOW" | "NORMAL" | "HIGH" | "CRITICAL",
        senderName: input.senderName,
        senderEmail: input.senderEmail,
        senderPhone: input.senderPhone,
        recipientIds: input.recipientIds,
        isGroupMessage: input.isGroupMessage ?? false,
        groupName: input.groupName,
        subject: input.subject,
        body: input.body,
        attachments: input.attachments as object[] ?? undefined,
        callScript: input.callScript,
        triggeredAt: now,
        deliveredAt: now,
        expiresAt,
        status: "DELIVERED",
        expectedActions: input.expectedActions ?? [],
        isFromParticipant: input.isFromParticipant ?? false,
        fromParticipantId: input.fromParticipantId,
      },
    });

    // ── Push via Pusher to each recipient ──────────────────────────────────
    const messagePayload = {
      id: message.id,
      channel: message.channel,
      priority: message.priority,
      senderName: message.senderName,
      subject: message.subject,
      body: message.body,
      triggeredAt: message.triggeredAt,
      expiresAt: message.expiresAt,
      isGroupMessage: message.isGroupMessage,
      groupName: message.groupName,
    };

    // Push to individual participants
    for (const recipientId of input.recipientIds) {
      await pushToParticipant(
        input.sessionId,
        recipientId,
        input.priority === "CRITICAL"
          ? SIM_EVENTS.FLASH_ALERT
          : SIM_EVENTS.NEW_MESSAGE,
        messagePayload
      );
    }

    // If message is sent by a participant, also push to the sender's channel so they see it instantly
    if (input.isFromParticipant && input.fromParticipantId) {
      await pushToParticipant(
        input.sessionId,
        input.fromParticipantId,
        SIM_EVENTS.NEW_MESSAGE,
        messagePayload
      );
    }

    // Also push to instructor channel for real-time feed
    await pushToInstructor(input.sessionId, "inject_sent", {
      ...messagePayload,
      recipientIds: input.recipientIds,
    });

    // ── Twilio integrations ────────────────────────────────────────────────

    if (input.channel === "SMS") {
      // Send real SMS via Twilio to each recipient who has a phone number
      const recipients = await prisma.simParticipant.findMany({
        where: { id: { in: input.recipientIds }, phone: { not: null } },
        select: { id: true, phone: true, displayName: true },
      });

      const twilioResults = [];
      for (const r of recipients) {
        if (r.phone) {
          const result = await sendSimSms(r.phone, input.body, input.senderName);
          twilioResults.push({ participantId: r.id, ...result });
        }
      }

      // Log Twilio delivery results
      if (twilioResults.some(r => r.success)) {
        await logSimEvent(input.sessionId, {
          type: "sms_sent",
          description: `SMS Twilio envoyé à ${twilioResults.filter(r => r.success).length}/${twilioResults.length} participant(s)`,
          metadata: { twilioResults: twilioResults as unknown as Record<string, unknown>[] },
        });
      }
    }

    if (input.channel === "WHATSAPP") {
      // WhatsApp via Twilio (requires Twilio WhatsApp sandbox or approved sender)
      const recipients = await prisma.simParticipant.findMany({
        where: { id: { in: input.recipientIds }, phone: { not: null } },
        select: { id: true, phone: true },
      });
      // Note: WhatsApp Twilio uses "whatsapp:+1234567890" format
      // Sending regular SMS as fallback if WhatsApp not configured
      for (const r of recipients) {
        if (r.phone) {
          await sendSimSms(
            r.phone,
            `[WhatsApp Simulation] ${input.senderName}: ${input.body}`,
            input.senderName
          );
        }
      }
    }

    // Log inject event
    await logSimEvent(input.sessionId, {
      type: "inject_sent",
      description: `${input.channel} de "${input.senderName}" envoyé${input.groupName ? ` à ${input.groupName}` : ` à ${input.recipientIds.length} participant(s)`}`,
      targetId: message.id,
      metadata: { channel: input.channel, priority: input.priority } as unknown as Record<string, unknown>,
    });

    return { success: true, data: message };
  } catch (error) {
    console.error("sendSimMessage:", error);
    return { success: false, error: "Erreur envoi message" };
  }
}

// ─── Mark message read ────────────────────────────────────────────────────────

export async function markMessageRead(messageId: string, participantId: string) {
  try {
    const message = await prisma.simMessage.findUnique({
      where: { id: messageId },
      select: { readByIds: true, triggeredAt: true, sessionId: true },
    });
    if (!message) return { success: false, error: "Message introuvable" };
    if (message.readByIds.includes(participantId)) return { success: true };

    const readByIds = [...message.readByIds, participantId];
    const now = new Date();

    await prisma.simMessage.update({
      where: { id: messageId },
      data: { readByIds, readAt: now, status: "READ" },
    });

    const responseTime = Math.round(
      (now.getTime() - new Date(message.triggeredAt).getTime()) / 1000
    );

    const participant = await prisma.simParticipant.update({
      where: { id: participantId },
      data: {
        messagesReceived: { increment: 1 },
        avgResponseTime: responseTime,
        lastSeenAt: now,
      },
      select: { displayName: true },
    });

    // Notify instructor
    await pushToInstructor(message.sessionId, SIM_EVENTS.MESSAGE_READ, {
      messageId,
      participantId,
      participantName: participant.displayName,
      responseTimeSeconds: responseTime,
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: "Erreur" };
  }
}

// ─── Reply to message ─────────────────────────────────────────────────────────

export async function replyToMessage(input: {
  messageId: string;
  sessionId: string;
  participantId: string;
  participantName: string;
  channel: string;
  body: string;
  attachments?: unknown[];
}) {
  try {
    const message = await prisma.simMessage.findUnique({
      where: { id: input.messageId },
      select: { triggeredAt: true, senderName: true },
    });

    const now = new Date();
    const responseTime = message
      ? Math.round((now.getTime() - new Date(message.triggeredAt).getTime()) / 1000)
      : 0;

    const reply = await prisma.simReply.create({
      data: {
        messageId: input.messageId,
        sessionId: input.sessionId,
        participantId: input.participantId,
        participantName: input.participantName,
        channel: input.channel as "EMAIL" | "SMS" | "CALL" | "WHATSAPP" | "ALERT" | "FLASH_INFO" | "JOURNAL" | "SOCIAL_MEDIA" | "INTERNAL_RADIO",
        body: input.body,
        attachments: input.attachments as object[] ?? undefined,
        responseTimeSeconds: responseTime,
        sentAt: now,
      },
    });

    await prisma.simMessage.update({
      where: { id: input.messageId },
      data: { status: "REPLIED" },
    });

    await prisma.simParticipant.update({
      where: { id: input.participantId },
      data: { messagesReplied: { increment: 1 } },
    });

    // Push reply to instructor in real-time
    await pushToInstructor(input.sessionId, SIM_EVENTS.REPLY_SENT, {
      replyId: reply.id,
      messageId: input.messageId,
      participantId: input.participantId,
      participantName: input.participantName,
      channel: input.channel,
      body: input.body,
      responseTimeSeconds: responseTime,
    });

    await logSimEvent(input.sessionId, {
      type: "reply_sent",
      actorId: input.participantId,
      actorName: input.participantName,
      targetId: input.messageId,
      description: `${input.participantName} a répondu via ${input.channel} en ${responseTime}s`,
    });

    return { success: true, data: reply };
  } catch (error) {
    console.error("replyToMessage:", error);
    return { success: false, error: "Erreur envoi réponse" };
  }
}

// ─── Calls (Twilio + in-app) ──────────────────────────────────────────────────

export async function initiateCall(input: {
  sessionId: string;
  callerId: string;
  callerName: string;
  callerRole?: string;
  recipientId: string;
  recipientName: string;
  script?: string;
  scriptNotes?: string;
}) {
  try {
    const call = await prisma.simCall.create({
      data: {
        sessionId: input.sessionId,
        callerId: input.callerId,
        callerName: input.callerName,
        callerRole: input.callerRole,
        recipientId: input.recipientId,
        recipientName: input.recipientName,
        script: input.script,
        scriptNotes: input.scriptNotes,
        status: "RINGING",
        startedAt: new Date(),
      },
    });

    // Push incoming call notification via Pusher (instant)
    await pushToParticipant(
      input.sessionId,
      input.recipientId,
      SIM_EVENTS.INCOMING_CALL,
      {
        callId: call.id,
        callerName: input.callerName,
        callerRole: input.callerRole,
        script: input.script,
      }
    );

    // Also try real Twilio call if participant has a phone number
    const participant = await prisma.simParticipant.findUnique({
      where: { id: input.recipientId },
      select: { phone: true, displayName: true },
    });

    if (participant?.phone) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com";
      const twilioResult = await initiateSimCall(
        participant.phone,
        input.callerName,
        input.script || input.scriptNotes || "Veuillez rappeler la cellule de crise.",
        baseUrl,
        {
          callId: call.id,
          sessionId: input.sessionId,
          participantId: input.recipientId,
        }
      );

      if (twilioResult.success) {
        await prisma.simCall.update({
          where: { id: call.id },
          data: { transcript: `Twilio SID: ${twilioResult.sid}` },
        });
      }
    }

    await logSimEvent(input.sessionId, {
      type: "call_initiated",
      actorId: input.callerId,
      actorName: input.callerName,
      targetId: input.recipientId,
      description: `📞 Appel de ${input.callerName} → ${input.recipientName}`,
    });

    return { success: true, data: call };
  } catch (error) {
    console.error("initiateCall:", error);
    return { success: false, error: "Erreur initiation appel" };
  }
}

export async function updateCall(callId: string, data: {
  status: string;
  answeredAt?: boolean;
  endedAt?: boolean;
  transcript?: string;
  missedReason?: string;
}) {
  try {
    const call = await prisma.simCall.update({
      where: { id: callId },
      data: {
        status: data.status as "RINGING" | "ACTIVE" | "COMPLETED" | "MISSED" | "DECLINED",
        ...(data.answeredAt && { answeredAt: new Date(), wasAnswered: true }),
        ...(data.endedAt && { endedAt: new Date() }),
        ...(data.transcript && { transcript: data.transcript }),
        ...(data.missedReason && { missedReason: data.missedReason }),
      },
    });

    // Compute duration if ending
    if (data.endedAt && call.answeredAt) {
      const duration = Math.round(
        (new Date().getTime() - new Date(call.answeredAt).getTime()) / 1000
      );
      await prisma.simCall.update({
        where: { id: callId },
        data: { durationSeconds: duration },
      });
    }

    // Push update to instructor
    await pushToInstructor(call.sessionId, SIM_EVENTS.CALL_UPDATED, {
      callId: call.id,
      status: data.status,
      callerName: call.callerName,
      recipientId: call.recipientId,
      transcript: data.transcript,
    });

    return { success: true, data: call };
  } catch {
    return { success: false, error: "Erreur mise à jour appel" };
  }
}

// ─── Event log ────────────────────────────────────────────────────────────────

export async function logSimEvent(
  sessionId: string,
  event: {
    type: string;
    description: string;
    actorId?: string;
    actorName?: string;
    targetId?: string;
    metadata?: Record<string, unknown>;
  }
) {
  try {
    await prisma.simEvent.create({
      data: {
        sessionId,
        type: event.type,
        description: event.description,
        actorId: event.actorId,
        actorName: event.actorName,
        targetId: event.targetId,
        metadata: event.metadata as object ?? undefined,
        occurredAt: new Date(),
      },
    });
  } catch (e) {
    console.warn("logSimEvent failed:", e);
  }
}

// ─── Polling fallback (for environments without Pusher) ───────────────────────

export async function getParticipantMessages(sessionId: string, participantId: string) {
  try {
    const messages = await prisma.simMessage.findMany({
      where: {
        sessionId,
        OR: [
          { recipientIds: { has: participantId } },
          { isGroupMessage: true },
        ],
      },
      include: {
        replies: {
          where: { participantId },
          orderBy: { sentAt: "asc" },
        },
      },
      orderBy: { triggeredAt: "desc" },
    });
    return { success: true, data: messages };
  } catch (error) {
    return { success: false, error: "Erreur récupération messages" };
  }
}

export async function getSimSessions(simulationId: string) {
  try {
    const sessions = await prisma.simSession.findMany({
      where: { simulationId },
      include: {
        participants: { select: { id: true, displayName: true, role: true, isConnected: true } },
        _count: { select: { messages: true, events: true } },
      },
      orderBy: { scheduledAt: "desc" },
    });
    return { success: true, data: sessions };
  } catch {
    return { success: false, error: "Erreur récupération sessions" };
  }
}

// ─── Bridge V1 -> V2 ──────────────────────────────────────────────────────────

export async function getOrCreateInstructorSession(simulationId: string, title: string) {
  try {
    // Look for an existing session that is not ended
    const existing = await prisma.simSession.findFirst({
      where: { simulationId, status: { not: "ENDED" } },
      orderBy: { scheduledAt: "desc" },
    });

    if (existing) {
      return { success: true, sessionId: existing.id };
    }

    // Otherwise, create a new one
    const wsRoomId = `sim-${randomBytes(8).toString("hex")}`;
    const newSession = await prisma.simSession.create({
      data: {
        simulationId,
        title: title || "Session V2",
        scheduledAt: new Date(),
        wsRoomId,
        status: "SETUP",
      },
    });

    return { success: true, sessionId: newSession.id };
  } catch (error) {
    console.error("getOrCreateInstructorSession:", error);
    return { success: false, error: "Erreur création session V2" };
  }
}

export async function joinParticipantSession(input: {
  simulationId: string;
  userId: string;
  displayName: string;
  role: string;
  team?: string;
  email?: string;
}) {
  try {
    // Look for an active session
    const session = await prisma.simSession.findFirst({
      where: { simulationId: input.simulationId, status: { not: "ENDED" } },
      orderBy: { scheduledAt: "desc" },
    });

    if (!session) {
      return { success: false, error: "La session n'a pas encore été démarrée par l'instructeur." };
    }

    // Check if participant already exists in this session
    let participant = await prisma.simParticipant.findFirst({
      where: { sessionId: session.id, userId: input.userId },
    });

    if (!participant) {
      // Add participant
      const slug = input.displayName.toLowerCase().replace(/\s+/g, ".").replace(/[^a-z.]/g, "");
      const simEmail = `${slug}@sim.survive.io`;
      const simPhone = `+SIM-${Math.floor(1000 + Math.random() * 9000)}`;

      participant = await prisma.simParticipant.create({
        data: {
          sessionId: session.id,
          userId: input.userId,
          displayName: input.displayName,
          role: input.role || "Participant",
          team: input.team,
          email: input.email,
          simEmail,
          simPhone,
        },
      });
    }

    return { success: true, sessionId: session.id, participantId: participant.id };
  } catch (error) {
    console.error("joinParticipantSession:", error);
    return { success: false, error: "Erreur lors de la connexion à la session" };
  }
}
