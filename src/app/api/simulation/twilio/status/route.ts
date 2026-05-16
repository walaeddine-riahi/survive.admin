import { NextRequest, NextResponse } from "next/server";
import { parseCallStatus } from "@/lib/simulation/twilio";
import { prisma } from "@/lib/prisma";
import { pushToInstructor, pushToParticipant, SIM_EVENTS } from "@/lib/simulation/pusher";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const params = Object.fromEntries(formData) as Record<string, string>;
    const { callSid, callStatus, duration, sessionId, callId } = parseCallStatus(params);

    if (!callId) {
      return NextResponse.json({ ok: true }); // Unknown call, ignore
    }

    // Map Twilio status to our status
    const statusMap: Record<string, string> = {
      "initiated":    "RINGING",
      "ringing":      "RINGING",
      "in-progress":  "ACTIVE",
      "completed":    "COMPLETED",
      "failed":       "MISSED",
      "busy":         "MISSED",
      "no-answer":    "MISSED",
    };
    const ourStatus = statusMap[callStatus] || "MISSED";

    // Update SimCall record
    const call = await prisma.simCall.update({
      where: { id: callId },
      data: {
        status: ourStatus as "RINGING" | "ACTIVE" | "COMPLETED" | "MISSED" | "DECLINED",
        ...(ourStatus === "ACTIVE" && { answeredAt: new Date(), wasAnswered: true }),
        ...(ourStatus === "COMPLETED" && {
          endedAt: new Date(),
          durationSeconds: duration,
        }),
        ...(ourStatus === "MISSED" && {
          missedReason: `Twilio: ${callStatus}`,
        }),
      },
    });

    // Push real-time updates
    if (sessionId) {
      // Notify instructor
      await pushToInstructor(sessionId, SIM_EVENTS.CALL_UPDATED, {
        callId: call.id,
        status: ourStatus,
        callSid,
        duration,
        recipientId: call.recipientId,
        recipientName: call.recipientName,
      });

      // Notify participant
      await pushToParticipant(sessionId, call.recipientId, SIM_EVENTS.CALL_UPDATED, {
        callId: call.id,
        status: ourStatus,
        callerName: call.callerName,
      });

      // Log event
      await prisma.simEvent.create({
        data: {
          sessionId,
          type: `call_${ourStatus.toLowerCase()}`,
          description: `Appel de ${call.callerName} → ${call.recipientName} : ${callStatus}${duration ? ` (${duration}s)` : ""}`,
          targetId: call.id,
          occurredAt: new Date(),
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Twilio status webhook error:", error);
    return NextResponse.json({ ok: true }); // Always 200 to Twilio
  }
}
