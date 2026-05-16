import { NextRequest, NextResponse } from "next/server";
import { parseIncomingSms } from "@/lib/simulation/twilio";
import { prisma } from "@/lib/prisma";
import { pushToInstructor, SIM_EVENTS } from "@/lib/simulation/pusher";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const params = Object.fromEntries(formData) as Record<string, string>;
    const { from, messageBody, messageSid } = parseIncomingSms(params);

    if (!from || !messageBody) {
      return new NextResponse(`<?xml version="1.0"?><Response/>`, {
        headers: { "Content-Type": "text/xml" },
      });
    }

    // Find participant by phone number in active sessions
    const participant = await prisma.simParticipant.findFirst({
      where: {
        phone: from,
        session: { status: { in: ["ACTIVE", "BRIEFING"] } },
      },
      include: {
        session: {
          select: { id: true, title: true },
        },
      },
    });

    if (!participant) {
      // Unknown sender — acknowledge but don't process
      return new NextResponse(
        `<?xml version="1.0"?><Response><Message>Message reçu. Aucune simulation active associée à ce numéro.</Message></Response>`,
        { headers: { "Content-Type": "text/xml" } }
      );
    }

    const sessionId = participant.session.id;

    // Find the last unread SMS inject sent to this participant
    const lastSmsInject = await prisma.simMessage.findFirst({
      where: {
        sessionId,
        channel: "SMS",
        recipientIds: { has: participant.id },
        status: { in: ["DELIVERED", "READ"] },
      },
      orderBy: { triggeredAt: "desc" },
    });

    // Record the reply
    const now = new Date();
    const responseTime = lastSmsInject
      ? Math.round((now.getTime() - new Date(lastSmsInject.triggeredAt).getTime()) / 1000)
      : 0;

    const reply = await prisma.simReply.create({
      data: {
        messageId: lastSmsInject?.id || "",
        sessionId,
        participantId: participant.id,
        participantName: participant.displayName,
        channel: "SMS",
        body: messageBody,
        responseTimeSeconds: responseTime,
        sentAt: now,
      },
    });

    // Update message status if there was a linked inject
    if (lastSmsInject) {
      await prisma.simMessage.update({
        where: { id: lastSmsInject.id },
        data: { status: "REPLIED" },
      });
    }

    // Update participant stats
    await prisma.simParticipant.update({
      where: { id: participant.id },
      data: {
        messagesReplied: { increment: 1 },
        lastSeenAt: now,
      },
    });

    // Log event
    await prisma.simEvent.create({
      data: {
        sessionId,
        type: "sms_reply_received",
        actorId: participant.id,
        actorName: participant.displayName,
        description: `SMS reçu de ${participant.displayName} : "${messageBody.slice(0, 80)}${messageBody.length > 80 ? "..." : ""}"`,
        metadata: { messageSid, from } as unknown as object,
        occurredAt: now,
      },
    });

    // Push to instructor in real-time
    await pushToInstructor(sessionId, SIM_EVENTS.REPLY_SENT, {
      replyId: reply.id,
      participantId: participant.id,
      participantName: participant.displayName,
      channel: "SMS",
      body: messageBody,
      responseTimeSeconds: responseTime,
      linkedMessageId: lastSmsInject?.id,
    });

    // Acknowledge receipt via SMS
    return new NextResponse(
      `<?xml version="1.0"?><Response><Message>✓ Message reçu — [${participant.session.title}]</Message></Response>`,
      { headers: { "Content-Type": "text/xml" } }
    );
  } catch (error) {
    console.error("Twilio SMS webhook error:", error);
    return new NextResponse(`<?xml version="1.0"?><Response/>`, {
      headers: { "Content-Type": "text/xml" },
    });
  }
}
