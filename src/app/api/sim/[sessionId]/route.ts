import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Real-time polling endpoint — returns delta since lastPoll
// Called every 3 seconds by both participant and instructor views
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const url = new URL(req.url);
    const participantId = url.searchParams.get("participantId");
    const since = url.searchParams.get("since"); // ISO timestamp of last poll
    const isInstructor = url.searchParams.get("instructor") === "1";

    const sinceDate = since ? new Date(since) : new Date(Date.now() - 10000);

    // Get session status
    const session = await prisma.simSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true, status: true, startedAt: true, pausedAt: true,
        durationMinutes: true, allowParticipantInit: true,
      },
    });
    if (!session) return NextResponse.json({ error: "Session introuvable" }, { status: 404 });

    // Get new messages since last poll
    const messagesQuery = participantId && !isInstructor
      ? {
          sessionId,
          triggeredAt: { gt: sinceDate },
          OR: [
            { recipientIds: { has: participantId } },
            { isGroupMessage: true },
          ],
        }
      : {
          sessionId,
          triggeredAt: { gt: sinceDate },
        };

    const [newMessages, newReplies, newCalls, newEvents, participants] = await Promise.all([
      prisma.simMessage.findMany({
        where: messagesQuery,
        include: { replies: { orderBy: { sentAt: "asc" } } },
        orderBy: { triggeredAt: "asc" },
      }),
      // Replies to existing messages
      prisma.simReply.findMany({
        where: { sessionId, sentAt: { gt: sinceDate } },
        orderBy: { sentAt: "asc" },
      }),
      // New or updated calls
      prisma.simCall.findMany({
        where: {
          sessionId,
          updatedAt: { gt: sinceDate },
          ...(participantId && !isInstructor ? { recipientId: participantId } : {}),
        },
        orderBy: { createdAt: "desc" },
      }),
      // Recent events
      prisma.simEvent.findMany({
        where: { sessionId, occurredAt: { gt: sinceDate } },
        orderBy: { occurredAt: "asc" },
        take: 20,
      }),
      // Participant list (for instructor) or single participant
      isInstructor
        ? prisma.simParticipant.findMany({
            where: { sessionId },
            select: {
              id: true, displayName: true, role: true, team: true,
              isConnected: true, lastSeenAt: true, isInstructor: true, isObserver: true,
              messagesReceived: true, messagesReplied: true, avgResponseTime: true, missedMessages: true,
            },
          })
        : participantId
        ? prisma.simParticipant.findMany({
            where: { sessionId },
            select: { id: true, displayName: true, role: true, team: true, simEmail: true, simPhone: true },
          })
        : Promise.resolve([]),
    ]);

    return NextResponse.json({
      session,
      newMessages,
      newReplies,
      newCalls,
      newEvents,
      participants,
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    console.error("sim poll error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST — quick actions (mark read, heartbeat)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = await req.json();
    const { action, participantId, messageId, callId } = body;

    if (action === "heartbeat" && participantId) {
      await prisma.simParticipant.update({
        where: { id: participantId },
        data: { lastSeenAt: new Date(), isConnected: true },
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "mark_read" && messageId && participantId) {
      const message = await prisma.simMessage.findUnique({
        where: { id: messageId },
        select: { readByIds: true, triggeredAt: true },
      });
      if (message && !message.readByIds.includes(participantId)) {
        await prisma.simMessage.update({
          where: { id: messageId },
          data: {
            readByIds: [...message.readByIds, participantId],
            status: "READ",
            readAt: new Date(),
          },
        });
        const rt = Math.round((Date.now() - new Date(message.triggeredAt).getTime()) / 1000);
        await prisma.simParticipant.update({
          where: { id: participantId },
          data: { messagesReceived: { increment: 1 }, lastSeenAt: new Date() },
        });
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
