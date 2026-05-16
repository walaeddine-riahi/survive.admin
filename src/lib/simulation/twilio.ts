import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken  = process.env.TWILIO_AUTH_TOKEN!;
const fromNumber = process.env.TWILIO_PHONE_NUMBER!;

let client: ReturnType<typeof twilio> | null = null;

function getTwilioClient() {
  if (!client) {
    client = twilio(accountSid, authToken);
  }
  return client;
}

// ─── SMS ──────────────────────────────────────────────────────────────────────

export interface SmsSendResult {
  success: boolean;
  sid?: string;
  error?: string;
}

export async function sendSimSms(
  toPhone: string,
  body: string,
  senderName?: string
): Promise<SmsSendResult> {
  try {
    const c = getTwilioClient();
    // Prepend sender name for context
    const fullBody = senderName
      ? `[SIMULATION SURVIVE]\n${senderName}:\n${body}`
      : `[SIMULATION SURVIVE]\n${body}`;

    const message = await c.messages.create({
      body: fullBody,
      from: fromNumber,
      to: toPhone,
    });

    return { success: true, sid: message.sid };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Twilio SMS error";
    console.error("Twilio SMS error:", msg);
    return { success: false, error: msg };
  }
}

// ─── Voice Calls ──────────────────────────────────────────────────────────────

export interface CallResult {
  success: boolean;
  sid?: string;
  error?: string;
}

export async function initiateSimCall(
  toPhone: string,
  callerName: string,
  script: string,
  callbackBaseUrl: string,
  metadata?: Record<string, string>
): Promise<CallResult> {
  try {
    const c = getTwilioClient();

    // Build TwiML URL — Twilio will call this to get the call script
    const twimlUrl = new URL(`${callbackBaseUrl}/api/simulation/twilio/voice`);
    twimlUrl.searchParams.set("callerName", callerName);
    // Encode script to pass via URL safely
    twimlUrl.searchParams.set("script", encodeURIComponent(script.slice(0, 500)));
    if (metadata) {
      Object.entries(metadata).forEach(([k, v]) => twimlUrl.searchParams.set(k, v));
    }

    const call = await c.calls.create({
      url: twimlUrl.toString(),
      from: fromNumber,
      to: toPhone,
      // Status callback to track call events
      statusCallback: `${callbackBaseUrl}/api/simulation/twilio/status`,
      statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
      statusCallbackMethod: "POST",
      // Record the call (optional — check GDPR implications)
      // record: true,
    });

    return { success: true, sid: call.sid };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Twilio Call error";
    console.error("Twilio Call error:", msg);
    return { success: false, error: msg };
  }
}

// ─── TwiML builder ────────────────────────────────────────────────────────────

export function buildCallTwiml(callerName: string, script: string): string {
  // Clean script for TTS
  const cleanScript = script
    .replace(/[<>&"']/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Pause length="1"/>
  <Say voice="Polly.Celine" language="fr-FR">
    Bonjour, je suis ${callerName}. Message de simulation SURVIVE.
  </Say>
  <Pause length="1"/>
  <Say voice="Polly.Celine" language="fr-FR">
    ${cleanScript || "Veuillez rappeler la salle de crise dès que possible."}
  </Say>
  <Pause length="2"/>
  <Say voice="Polly.Celine" language="fr-FR">
    Fin du message de simulation. Bonne journée.
  </Say>
</Response>`;
}

// ─── SMS reply parser (incoming webhook from Twilio) ─────────────────────────

export function parseIncomingSms(body: Record<string, string>) {
  return {
    from: body.From || "",
    to: body.To || "",
    messageBody: body.Body || "",
    messageSid: body.MessageSid || "",
    numMedia: parseInt(body.NumMedia || "0"),
  };
}

// ─── Call status parser ───────────────────────────────────────────────────────

export function parseCallStatus(body: Record<string, string>) {
  return {
    callSid: body.CallSid || "",
    callStatus: body.CallStatus || "", // initiated | ringing | in-progress | completed | failed | busy | no-answer
    from: body.From || "",
    to: body.To || "",
    duration: body.CallDuration ? parseInt(body.CallDuration) : undefined,
    callId: body.callId || "",         // Our custom metadata
    sessionId: body.sessionId || "",
    participantId: body.participantId || "",
  };
}

// ─── Validation helper ────────────────────────────────────────────────────────

export function validateTwilioRequest(
  signature: string,
  url: string,
  params: Record<string, string>
): boolean {
  try {
    return twilio.validateRequest(authToken, signature, url, params);
  } catch {
    return false;
  }
}

export { fromNumber as TWILIO_FROM_NUMBER };
