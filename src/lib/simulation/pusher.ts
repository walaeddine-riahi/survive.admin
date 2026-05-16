// ─── Pusher Server (backend) ─────────────────────────────────────────────────
import PusherServer from "pusher";

let pusherServer: PusherServer | null = null;

export function getPusherServer(): PusherServer {
  if (!pusherServer) {
    if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_SECRET) {
      // Development fallback — log a warning but don't crash
      console.warn("⚠️  Pusher env vars not configured — real-time disabled");
      // Return a mock that silently fails
      return {
        trigger: async () => ({ status: 200 }),
      } as unknown as PusherServer;
    }
    pusherServer = new PusherServer({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.PUSHER_CLUSTER || "eu",
      useTLS: true,
    });
  }
  return pusherServer;
}

// ─── Pusher Client (frontend) ─────────────────────────────────────────────────
// This is called from client components
export const PUSHER_CONFIG = {
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || "",
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "eu",
};

// ─── Channel naming conventions ──────────────────────────────────────────────
export function getSessionChannel(sessionId: string) {
  return `sim-session-${sessionId}`;
}

export function getParticipantChannel(sessionId: string, participantId: string) {
  return `sim-participant-${sessionId}-${participantId}`;
}

export function getInstructorChannel(sessionId: string) {
  return `sim-instructor-${sessionId}`;
}

// ─── Event types ──────────────────────────────────────────────────────────────
export const SIM_EVENTS = {
  // To participants
  NEW_MESSAGE:        "new-message",          // New inject delivered
  MESSAGE_EXPIRED:    "message-expired",       // Inject time expired
  SESSION_STATUS:     "session-status",        // Session started/paused/ended
  INCOMING_CALL:      "incoming-call",         // Call ringing
  CALL_UPDATED:       "call-updated",          // Call status changed
  FLASH_ALERT:        "flash-alert",           // Critical immediate alert

  // To instructor
  PARTICIPANT_JOINED:  "participant-joined",   // Participant connected
  PARTICIPANT_LEFT:    "participant-left",      // Participant disconnected
  MESSAGE_READ:        "message-read",         // Participant read a message
  REPLY_SENT:         "reply-sent",            // Participant replied
  CALL_ANSWERED:      "call-answered",         // Call picked up
  CALL_DECLINED:      "call-declined",         // Call refused
} as const;

// ─── Push helpers ─────────────────────────────────────────────────────────────
export async function pushToParticipant(
  sessionId: string,
  participantId: string,
  event: string,
  data: unknown
) {
  const pusher = getPusherServer();
  try {
    await pusher.trigger(
      getParticipantChannel(sessionId, participantId),
      event,
      data
    );
  } catch (e) {
    console.warn("Pusher push failed:", e);
  }
}

export async function pushToSession(
  sessionId: string,
  event: string,
  data: unknown
) {
  const pusher = getPusherServer();
  try {
    await pusher.trigger(
      getSessionChannel(sessionId),
      event,
      data
    );
  } catch (e) {
    console.warn("Pusher push failed:", e);
  }
}

export async function pushToInstructor(
  sessionId: string,
  event: string,
  data: unknown
) {
  const pusher = getPusherServer();
  try {
    await pusher.trigger(
      getInstructorChannel(sessionId),
      event,
      data
    );
  } catch (e) {
    console.warn("Pusher push failed:", e);
  }
}
