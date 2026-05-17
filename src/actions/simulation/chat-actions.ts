"use server";

import { prisma } from "@/lib/prisma";
import { pushToParticipant, pushToSession, pushToInstructor } from "@/lib/simulation/pusher";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ChannelType = "GENERAL" | "TEAM" | "DIRECT" | "BROADCAST";

// ─── Bootstrap default channels for a session ─────────────────────────────────

export async function bootstrapChannels(sessionId: string) {
  try {
    const existing = await prisma.chatChannel.count({ where: { sessionId } });
    if (existing > 0) return { success: true, message: "Already bootstrapped" };

    const participants = await prisma.simParticipant.findMany({
      where: { sessionId, isObserver: false },
      select: { id: true, displayName: true, role: true, team: true, isInstructor: true },
    });

    // 1. General channel — everyone
    const general = await prisma.chatChannel.create({
      data: {
        sessionId,
        type: "GENERAL",
        name: "Cellule de crise",
        description: "Canal général de la cellule de crise",
        emoji: "🏛️",
        color: "#185FA5",
        memberIds: [],
      },
    });

    // 2. Team channels — group by team
    const teams = [...new Set(
      participants.filter(p => p.team).map(p => p.team!)
    )];

    const teamChannels = await Promise.all(
      teams.map(team =>
        prisma.chatChannel.create({
          data: {
            sessionId,
            type: "TEAM",
            name: team,
            description: `Canal de l'équipe ${team}`,
            emoji: "👥",
            color: "#0F6E56",
            memberIds: participants.filter(p => p.team === team).map(p => p.id),
          },
        })
      )
    );

    // 3. Broadcast (instructor → all, read-only)
    const broadcast = await prisma.chatChannel.create({
      data: {
        sessionId,
        type: "BROADCAST",
        name: "Annonces",
        description: "Annonces de l'instructeur",
        emoji: "📣",
        color: "#f97316",
        memberIds: [],
      },
    });

    return {
      success: true,
      data: { general, teamChannels, broadcast, total: 2 + teamChannels.length },
    };
  } catch (error) {
    console.error("bootstrapChannels:", error);
    return { success: false, error: "Erreur création canaux" };
  }
}

// ─── Get channels for a participant ───────────────────────────────────────────

export async function getChannels(sessionId: string, participantId: string) {
  try {
    const checkCount = await prisma.chatChannel.count({ where: { sessionId } });
    if (checkCount === 0) {
      await bootstrapChannels(sessionId);
    }

    const channels = await prisma.chatChannel.findMany({
      where: {
        sessionId,
        isArchived: false,
        OR: [
          { type: "GENERAL" },
          { type: "BROADCAST" },
          { memberIds: { has: participantId } },
        ],
      },
      include: {
        messages: {
          orderBy: { sentAt: "desc" },
          take: 1,
          select: { content: true, senderName: true, sentAt: true, readByIds: true },
        },
        _count: { select: { messages: true } },
      },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });

    // Add unread count per channel
    const channelsWithUnread = channels.map(ch => {
      const unread = ch.messages.filter(m => !m.readByIds.includes(participantId)).length;
      return { ...ch, unreadCount: unread };
    });

    return { success: true, data: channelsWithUnread };
  } catch (error) {
    return { success: false, error: "Erreur récupération canaux" };
  }
}

// ─── Get all channels for instructor ─────────────────────────────────────────

export async function getAllChannels(sessionId: string) {
  try {
    const checkCount = await prisma.chatChannel.count({ where: { sessionId } });
    if (checkCount === 0) {
      await bootstrapChannels(sessionId);
    }

    const channels = await prisma.chatChannel.findMany({
      where: { sessionId, isArchived: false },
      include: {
        messages: {
          orderBy: { sentAt: "desc" },
          take: 3,
          select: {
            id: true, content: true, senderName: true, senderRole: true,
            sentAt: true, isInstructor: true, messageType: true,
          },
        },
        _count: { select: { messages: true } },
      },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });
    return { success: true, data: channels };
  } catch {
    return { success: false, error: "Erreur" };
  }
}

// ─── Create direct message channel ────────────────────────────────────────────

export async function createDirectChannel(
  sessionId: string,
  participantA: { id: string; displayName: string },
  participantB: { id: string; displayName: string }
) {
  try {
    // Check if already exists
    const existing = await prisma.chatChannel.findFirst({
      where: {
        sessionId,
        type: "DIRECT",
        memberIds: { hasEvery: [participantA.id, participantB.id] },
      },
    });
    if (existing) return { success: true, data: existing };

    const channel = await prisma.chatChannel.create({
      data: {
        sessionId,
        type: "DIRECT",
        name: `${participantA.displayName} ↔ ${participantB.displayName}`,
        emoji: "💬",
        color: "#534AB7",
        memberIds: [participantA.id, participantB.id],
      },
    });

    return { success: true, data: channel };
  } catch {
    return { success: false, error: "Erreur création canal direct" };
  }
}

export async function createGroupChannel(
  sessionId: string,
  sender: { id: string; displayName: string },
  targets: { id: string; displayName: string }[]
) {
  try {
    if (targets.length === 0) return { success: false, error: "Aucun destinataire" };
    
    const allMembers = [sender, ...targets];
    const memberIds = [...new Set(allMembers.map(m => m.id))].sort();
    
    // Check if a direct channel with EXACTLY these member ids exists
    const existingChannels = await prisma.chatChannel.findMany({
      where: {
        sessionId,
        type: "DIRECT",
      }
    });
    
    const existing = existingChannels.find(ch => {
      if (ch.memberIds.length !== memberIds.length) return false;
      const chSorted = [...ch.memberIds].sort();
      return memberIds.every((id, idx) => id === chSorted[idx]);
    });
    
    if (existing) return { success: true, data: existing };
    
    const channel = await prisma.chatChannel.create({
      data: {
        sessionId,
        type: "DIRECT",
        name: allMembers.length > 2 
          ? `Groupe : ${allMembers.slice(0, 3).map(m => m.displayName).join(", ")}${allMembers.length > 3 ? "..." : ""}`
          : `${sender.displayName} ↔ ${targets[0].displayName}`,
        emoji: allMembers.length > 2 ? "👥" : "💬",
        color: "#534AB7",
        memberIds: memberIds,
      },
    });
    
    return { success: true, data: channel };
  } catch (error) {
    console.error("createGroupChannel error:", error);
    return { success: false, error: "Erreur création canal de groupe" };
  }
}

// ─── Get messages for a channel ───────────────────────────────────────────────

export async function getMessages(channelId: string, limit = 50, before?: string) {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: {
        channelId,
        ...(before ? { sentAt: { lt: new Date(before) } } : {}),
      },
      orderBy: { sentAt: "asc" },
      take: limit,
    });
    return { success: true, data: messages };
  } catch {
    return { success: false, error: "Erreur récupération messages" };
  }
}

// ─── Send message ─────────────────────────────────────────────────────────────

export async function sendChatMessage(input: {
  channelId: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  messageType?: string;
  replyToId?: string;
  isInstructor?: boolean;
}) {
  try {
    if (!input.content.trim()) return { success: false, error: "Message vide" };

    const message = await prisma.chatMessage.create({
      data: {
        channelId: input.channelId,
        sessionId: input.sessionId,
        senderId: input.senderId,
        senderName: input.senderName,
        senderRole: input.senderRole,
        content: input.content.trim(),
        messageType: input.messageType || "text",
        replyToId: input.replyToId,
        isInstructor: input.isInstructor ?? false,
        readByIds: [input.senderId], // Sender has read their own message
      },
    });

    // Push real-time to session channel
    const payload = {
      id: message.id,
      channelId: input.channelId,
      senderId: input.senderId,
      senderName: input.senderName,
      senderRole: input.senderRole,
      content: message.content,
      messageType: message.messageType,
      isInstructor: message.isInstructor,
      sentAt: message.sentAt,
      replyToId: message.replyToId,
    };

    // Push to session WebSocket room
    await pushToSession(input.sessionId, "chat_message", payload);

    // Also notify instructor
    if (!input.isInstructor) {
      await pushToInstructor(input.sessionId, "chat_message", payload);
    }

    return { success: true, data: message };
  } catch (error) {
    console.error("sendChatMessage:", error);
    return { success: false, error: "Erreur envoi message" };
  }
}

// ─── Mark messages as read ────────────────────────────────────────────────────

export async function markChannelRead(channelId: string, participantId: string) {
  try {
    const unread = await prisma.chatMessage.findMany({
      where: {
        channelId,
        NOT: { readByIds: { has: participantId } },
      },
      select: { id: true },
    });

    if (unread.length === 0) return { success: true };

    await Promise.all(
      unread.map(m =>
        prisma.chatMessage.update({
          where: { id: m.id },
          data: { readByIds: { push: participantId } },
        })
      )
    );

    return { success: true, count: unread.length };
  } catch {
    return { success: false, error: "Erreur" };
  }
}

// ─── Delta poll ───────────────────────────────────────────────────────────────

export async function getChatDelta(sessionId: string, since: string, participantId: string) {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: {
        sessionId,
        sentAt: { gt: new Date(since) },
        NOT: { senderId: participantId }, // Don't return own messages (already in state)
      },
      include: { channel: { select: { name: true, type: true, memberIds: true } } },
      orderBy: { sentAt: "asc" },
    });

    // Filter to channels the participant can access
    const accessible = messages.filter(m => {
      const ch = m.channel;
      return (
        ch.type === "GENERAL" ||
        ch.type === "BROADCAST" ||
        ch.memberIds.includes(participantId)
      );
    });

    return { success: true, data: accessible };
  } catch {
    return { success: false, error: "Erreur" };
  }
}

// ─── Chat stats for scoring ───────────────────────────────────────────────────

export async function getChatStats(sessionId: string) {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      select: {
        senderId: true, senderName: true, senderRole: true,
        isInstructor: true, sentAt: true, channelId: true,
      },
    });

    const participantMessages = messages.filter(m => !m.isInstructor);

    const byParticipant = participantMessages.reduce((acc: Record<string, {
      name: string; role: string; count: number;
    }>, m) => {
      if (!acc[m.senderId]) acc[m.senderId] = { name: m.senderName, role: m.senderRole, count: 0 };
      acc[m.senderId].count++;
      return acc;
    }, {});

    return {
      success: true,
      data: {
        totalMessages: participantMessages.length,
        byParticipant,
        mostActive: Object.values(byParticipant).sort((a: any, b: any) => b.count - a.count)[0] || null,
      },
    };
  } catch {
    return { success: false, error: "Erreur stats chat" };
  }
}
