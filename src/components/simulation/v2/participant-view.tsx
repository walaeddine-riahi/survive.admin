"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Mail, Phone, MessageSquare, Bell, Zap, FileText,
  Globe, Radio, Send, CheckCircle2,
  Clock, PhoneIncoming, PhoneMissed, Mic, MicOff,
  Shield, FileStack, ListTodo, MessageSquareText, Users,
} from "lucide-react";
import CrisisLogPanel from "./crisis-log-panel";
import CrisisDocsPanel from "./crisis-docs-panel";
import ChatPanel from "./chat-panel";
import ExternalChatPanel from "./external-chat-panel";
import { replyToMessage, markMessageRead, logSimEvent, markParticipantConnected, updateCall } from "@/actions/simulation/sim-session-actions";
import { usePusherChannel } from "./use-pusher-channel";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Msg = any; type Call = any;

const CHANNEL_CONFIG = {
  EMAIL:         { label: "Email",         icon: Mail,          color: "#185FA5", bg: "#E6F1FB" },
  SMS:           { label: "SMS",           icon: MessageSquare, color: "#0F6E56", bg: "#E1F5EE" },
  WHATSAPP:      { label: "WhatsApp",      icon: MessageSquare, color: "#25D366", bg: "#e7fbe7" },
  CALL:          { label: "Appel",         icon: Phone,         color: "#A32D2D", bg: "#FCEBEB" },
  ALERT:         { label: "Alerte",        icon: Bell,          color: "#A32D2D", bg: "#FCEBEB" },
  FLASH_INFO:    { label: "Flash Info",    icon: Zap,           color: "#854F0B", bg: "#FAEEDA" },
  JOURNAL:       { label: "Journal",       icon: FileText,      color: "#534AB7", bg: "#EEEDFE" },
  SOCIAL_MEDIA:  { label: "Réseaux soc.", icon: Globe,         color: "#185FA5", bg: "#E6F1FB" },
  INTERNAL_RADIO:{ label: "Radio",         icon: Radio,         color: "#3B6D11", bg: "#EAF3DE" },
} as const;

function formatTime(d: string | Date) {
  return new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function formatElapsed(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0
    ? `${h}h${String(m).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ─── Incoming Call Modal ──────────────────────────────────────────────────────
function IncomingCallModal({ call, onAnswer, onDecline }: {
  call: Call; onAnswer: () => void; onDecline: () => void;
}) {
  const [ringSeconds, setRingSeconds] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setRingSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-3xl p-8 w-[320px] text-center shadow-2xl">
        <div className="relative mx-auto mb-6 w-24 h-24">
          <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-green-500/30 animate-ping" style={{ animationDelay: "0.5s" }} />
          <div className="relative w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center border-4 border-green-500">
            <PhoneIncoming className="h-11 w-11 text-white" />
          </div>
        </div>
        <p className="text-white text-xl font-bold mb-1">{call.callerName}</p>
        {call.callerRole && <p className="text-gray-400 text-sm mb-1">{call.callerRole}</p>}
        <p className="text-green-400 text-xs mb-2">Simulation — sonnerie {ringSeconds}s</p>
        <p className="text-gray-500 text-xs mb-8">Cet appel fait partie de l'exercice</p>

        {call.script && (
          <div className="hidden" id="call-script">{call.script}</div>
        )}

        <div className="flex justify-around items-center">
          <div className="flex flex-col items-center gap-2">
            <button onClick={onDecline}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
              <PhoneMissed className="h-8 w-8 text-white" />
            </button>
            <span className="text-xs text-gray-500">Refuser</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <button onClick={onAnswer}
              className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 animate-pulse">
              <Phone className="h-8 w-8 text-white" />
            </button>
            <span className="text-xs text-gray-500">Décrocher</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Active Call Panel ────────────────────────────────────────────────────────
function ActiveCallPanel({ call, onEnd }: { call: Call; onEnd: (notes: string) => void }) {
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-gray-900 border-t border-gray-700 shadow-2xl">
      <div className="max-w-lg mx-auto p-4 space-y-3">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-700 rounded-full flex items-center justify-center animate-pulse flex-shrink-0">
            <Phone className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold">{call.callerName}</p>
            <p className="text-green-400 text-sm font-mono">
              🔴 En communication · {formatElapsed(seconds)}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setMuted(!muted)}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                muted ? "bg-red-700 hover:bg-red-600" : "bg-gray-700 hover:bg-gray-600"
              }`}
              title={muted ? "Activer le micro" : "Couper le micro"}>
              {muted ? <MicOff className="h-5 w-5 text-white" /> : <Mic className="h-5 w-5 text-white" />}
            </button>
            <button onClick={() => onEnd(notes)}
              className="w-11 h-11 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors"
              title="Raccrocher">
              <Phone className="h-5 w-5 text-white rotate-[135deg]" />
            </button>
          </div>
        </div>

        {call.script && (
          <div className="bg-gray-800 rounded-lg p-3 text-xs text-gray-300 border border-gray-700">
            <p className="text-gray-500 mb-1 text-xs uppercase tracking-wide">Ce que dit l'appelant :</p>
            <p className="leading-relaxed">{call.script}</p>
          </div>
        )}

        <Textarea
          className="bg-gray-800 border-gray-700 text-white text-sm resize-none placeholder-gray-600"
          rows={2}
          placeholder="Notes de conversation... (optionnel — Ctrl+Enter pour raccrocher)"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          onKeyDown={e => { if (e.ctrlKey && e.key === "Enter") onEnd(notes); }}
        />
      </div>
    </div>
  );
}

// ─── Message Thread ───────────────────────────────────────────────────────────
function MessageThread({ message, participantId, participantName, sessionId, onReplied }: {
  message: Msg; participantId: string; participantName: string;
  sessionId: string; onReplied: () => void;
}) {
  const [replyText, setReplyText] = useState("");
  const [showReply, setShowReply] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const cfg = CHANNEL_CONFIG[message.channel as keyof typeof CHANNEL_CONFIG];
  const Icon = cfg?.icon || Mail;
  const isRead = message.readByIds?.includes(participantId);
  const myReplies = (message.replies || []).filter((r: Msg) => r.participantId === participantId);
  const hasReplied = myReplies.length > 0;
  const isCritical = message.priority === "CRITICAL";
  const isHigh = message.priority === "HIGH";

  async function handleReply() {
    if (!replyText.trim()) return;
    setIsSending(true);
    const r = await replyToMessage({
      messageId: message.id,
      sessionId,
      participantId,
      participantName,
      channel: message.channel,
      body: replyText,
    });
    if (r.success) {
      setReplyText("");
      setShowReply(false);
      onReplied();
    } else {
      toast.error("Erreur envoi réponse");
    }
    setIsSending(false);
  }

  return (
    <div className={`rounded-xl border transition-all overflow-hidden ${
      isCritical && !isRead
        ? "border-red-500 shadow-red-900/30 shadow-lg"
        : isHigh && !isRead
        ? "border-orange-700"
        : !isRead
        ? "border-blue-800"
        : hasReplied
        ? "border-green-900/50"
        : "border-gray-800"
    } bg-gray-900/70`}>
      {/* Priority bar */}
      {(isCritical || isHigh) && (
        <div className={`h-0.5 w-full ${isCritical ? "bg-red-500" : "bg-orange-500"}`} />
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Channel indicator */}
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: cfg?.color + "25" }}>
              <Icon className="h-4.5 w-4.5" style={{ color: cfg?.color }} />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white font-semibold text-sm">{message.senderName}</span>
                <span className="text-gray-500 text-xs px-1.5 py-0.5 bg-gray-800 rounded">
                  {cfg?.label}
                </span>
                {isCritical && (
                  <span className="text-red-400 text-xs font-bold animate-pulse bg-red-950 px-2 py-0.5 rounded-full">
                    🔴 URGENT
                  </span>
                )}
                {isHigh && !isCritical && (
                  <span className="text-orange-400 text-xs font-semibold bg-orange-950 px-2 py-0.5 rounded-full">
                    ⚠️ PRIORITAIRE
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {hasReplied
                  ? <span className="text-green-400 text-xs flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Répondu</span>
                  : isRead
                  ? <span className="text-blue-400 text-xs">Lu</span>
                  : <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                }
                <span className="text-gray-600 text-xs">{formatTime(message.triggeredAt)}</span>
              </div>
            </div>

            {/* Subject (email) */}
            {message.subject && (
              <p className="text-gray-200 text-sm font-medium mb-2">{message.subject}</p>
            )}

            {/* Body */}
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{message.body}</p>

            {/* Expiry */}
            {message.expiresAt && new Date(message.expiresAt) > new Date() && (
              <div className="flex items-center gap-1 mt-2 text-xs text-amber-400">
                <Clock className="h-3 w-3" />
                <span>Expire à {formatTime(message.expiresAt)}</span>
              </div>
            )}

            {/* All replies */}
            {message.replies?.length > 0 && (
              <div className="mt-3 space-y-2 border-t border-gray-800 pt-3">
                {message.replies.map((r: Msg) => (
                  <div key={r.id} className={`rounded-lg px-3 py-2 text-xs ${
                    r.participantId === participantId
                      ? "bg-blue-900/40 text-blue-100 border border-blue-800"
                      : "bg-gray-800 text-gray-400"
                  }`}>
                    <div className="flex justify-between mb-0.5">
                      <p className="font-semibold">{r.participantName}</p>
                      <p className="text-gray-500">{formatTime(r.sentAt)}</p>
                    </div>
                    <p>{r.body}</p>
                    {r.responseTimeSeconds && (
                      <p className="text-gray-500 mt-1">⏱ {r.responseTimeSeconds}s de délai de réponse</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Reply area */}
            {showReply ? (
              <div className="mt-3 space-y-2">
                <Textarea
                  className="bg-gray-800 border-gray-700 text-white text-sm resize-none placeholder-gray-500"
                  rows={3}
                  placeholder={`Répondre via ${cfg?.label}... (Ctrl+Enter pour envoyer)`}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => { if (e.ctrlKey && e.key === "Enter") handleReply(); }}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm"
                    className="gap-1.5 h-8 text-xs text-white font-medium"
                    style={{ background: cfg?.color }}
                    onClick={handleReply}
                    disabled={isSending || !replyText.trim()}>
                    <Send className="h-3.5 w-3.5" />
                    {isSending ? "Envoi..." : `Répondre via ${cfg?.label}`}
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 text-xs text-gray-400"
                    onClick={() => { setShowReply(false); setReplyText(""); }}>
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              !hasReplied && (
                <Button size="sm" variant="ghost"
                  className="mt-2 h-8 text-xs gap-1.5 text-gray-400 hover:text-white hover:bg-gray-800 px-3"
                  onClick={() => setShowReply(true)}>
                  <Send className="h-3.5 w-3.5" />
                  Répondre
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Participant View ────────────────────────────────────────────────────
export default function ParticipantView({
  session,
  participant,
  initialMessages,
  initialCalls,
}: {
  session: { id: string; title: string; status: string; wsRoomId: string; startedAt?: string | null; durationMinutes?: number | null; simulationId?: string; participants?: any[]; crisisLog?: any[]; };
  participant: { id: string; displayName: string; role: string; team?: string | null; simEmail?: string | null; simPhone?: string | null };
  initialMessages: Msg[];
  initialCalls: Call[];
}) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [calls, setCalls] = useState<Call[]>(initialCalls);
  const [participants, setParticipants] = useState<any[]>(session.participants || []);
  const [incomingCall, setIncomingCall] = useState<Call | null>(null);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [activeChannel, setActiveChannel] = useState<string>("ALL");
  const [sessionStatus, setSessionStatus] = useState(session.status);
  const [elapsed, setElapsed] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const lastPollRef = useRef(new Date().toISOString());
  const hasPusher = !!process.env.NEXT_PUBLIC_PUSHER_KEY;

  // Register as connected on mount
  useEffect(() => {
    markParticipantConnected(participant.id, true, session.id);
    setIsConnected(true);
    return () => {
      markParticipantConnected(participant.id, false, session.id);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Elapsed timer
  useEffect(() => {
    if (!session.startedAt) return;
    const t = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(session.startedAt!).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [session.startedAt]);

  // ── Pusher WebSocket ───────────────────────────────────────────────────────
  usePusherChannel({
    sessionId: session.id,
    participantId: participant.id,
    isInstructor: false,
    onParticipantJoined: useCallback((data: unknown) => {
      const d = data as { participantId: string; displayName: string; role: string; isExternal?: boolean; simEmail?: string; simPhone?: string; isConnected?: boolean };
      if (d.isExternal) {
        toast.info(`👤 Nouvel acteur externe disponible : ${d.displayName}`);
      }
      setParticipants(prev => {
        const exists = prev.some(p => p.id === d.participantId);
        if (exists) {
          return prev.map(p => p.id === d.participantId ? { ...p, isConnected: true } : p);
        }
        const newP = {
          id: d.participantId,
          displayName: d.displayName,
          role: d.role,
          isExternal: d.isExternal || false,
          simEmail: d.simEmail,
          simPhone: d.simPhone,
          isConnected: d.isConnected ?? true,
        };
        return [...prev, newP];
      });
    }, []),
    onNewMessage: useCallback((data: unknown) => {
      const msg = data as Msg;
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        // Toast notification
        if (msg.priority === "CRITICAL") {
          toast.error(`🔴 URGENT — ${msg.senderName}`, {
            description: msg.subject || msg.body?.slice(0, 80),
            duration: 12000,
          });
        } else if (msg.priority === "HIGH") {
          toast.warning(`⚠️ ${msg.senderName}`, {
            description: msg.subject || msg.body?.slice(0, 60),
            duration: 7000,
          });
        } else {
          toast.info(`📬 ${CHANNEL_CONFIG[msg.channel as keyof typeof CHANNEL_CONFIG]?.label || msg.channel} de ${msg.senderName}`);
        }
        return [{ ...msg, replies: [] }, ...prev];
      });
    }, []),
    onFlashAlert: useCallback((data: unknown) => {
      const msg = data as Msg;
      toast.error(`🚨 ALERTE CRITIQUE — ${msg.senderName}: ${msg.body}`, {
        duration: 30000,
      });
      setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [{ ...msg, replies: [] }, ...prev]);
    }, []),
    onSessionStatus: useCallback((data: unknown) => {
      const d = data as { status: string };
      setSessionStatus(d.status);
      if (d.status === "ACTIVE") toast.success("🚀 La simulation démarre !");
      if (d.status === "PAUSED") toast.info("⏸ Simulation en pause");
      if (d.status === "DEBRIEF") toast.info("📋 Passage en phase debrief");
    }, []),
    onIncomingCall: useCallback((data: unknown) => {
      const call = data as Call;
      setIncomingCall(call);
    }, []),
    onCallUpdated: useCallback((data: unknown) => {
      const d = data as { callId: string; status: string };
      if (d.status === "MISSED") setIncomingCall(null);
    }, []),
  });

  // ── Polling fallback (when Pusher not configured) ──────────────────────────
  useEffect(() => {
    if (hasPusher) return; // Use Pusher instead

    const poll = async () => {
      try {
        // Heartbeat
        await fetch(`/api/sim/${session.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "heartbeat", participantId: participant.id }),
        });
        // Get delta
        const res = await fetch(`/api/sim/${session.id}?participantId=${participant.id}&since=${lastPollRef.current}`);
        if (!res.ok) return;
        const data = await res.json();
        lastPollRef.current = data.serverTime;
        if (data.newMessages?.length > 0) {
          setMessages(prev => {
            const ids = new Set(prev.map((m: Msg) => m.id));
            const newOnes = data.newMessages.filter((m: Msg) => !ids.has(m.id));
            if (newOnes.length > 0) {
              newOnes.forEach((m: Msg) => {
                if (m.priority === "CRITICAL") toast.error(`🔴 URGENT — ${m.senderName}`, { duration: 12000 });
                else if (m.priority === "HIGH") toast.warning(`⚠️ ${m.senderName}`, { duration: 7000 });
                else toast.info(`📬 ${m.senderName}`);
              });
              return [...newOnes.map((m: Msg) => ({ ...m, replies: [] })), ...prev];
            }
            return prev;
          });
        }
        if (data.newReplies?.length > 0) {
          setMessages(prev => prev.map((msg: Msg) => {
            const nr = data.newReplies.filter((r: Msg) => r.messageId === msg.id);
            if (!nr.length) return msg;
            const ids = new Set((msg.replies || []).map((r: Msg) => r.id));
            return { ...msg, replies: [...(msg.replies || []), ...nr.filter((r: Msg) => !ids.has(r.id))] };
          }));
        }
        if (data.newCalls?.length > 0) {
          data.newCalls.forEach((c: Call) => {
            if (c.recipientId === participant.id && c.status === "RINGING") setIncomingCall(c);
          });
        }
        if (data.session?.status) setSessionStatus(data.session.status);
      } catch {}
    };

    pollRef.current = setInterval(poll, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPusher]);

  async function handleAnswerCall(call: Call) {
    setIncomingCall(null);
    setActiveCall(call);
    
    // Set call status to ACTIVE in database
    await updateCall(call.callId, { status: "ACTIVE", answeredAt: true });

    await logSimEvent(session.id, {
      type: "call_answered",
      actorId: participant.id,
      actorName: participant.displayName,
      description: `${participant.displayName} a décroché l'appel de ${call.callerName}`,
    });
  }

  async function handleDeclineCall(call: Call) {
    setIncomingCall(null);
    await logSimEvent(session.id, {
      type: "call_declined",
      actorId: participant.id,
      actorName: participant.displayName,
      description: `${participant.displayName} a refusé l'appel de ${call.callerName}`,
    });
  }

  async function handleEndCall(notes: string) {
    if (!activeCall) return;
    
    // Send transcript to instructor
    await updateCall(activeCall.callId, { 
      status: "COMPLETED", 
      endedAt: true, 
      transcript: notes || "Appel terminé sans notes." 
    });

    await logSimEvent(session.id, {
      type: "call_ended",
      actorId: participant.id,
      actorName: participant.displayName,
      description: `${participant.displayName} a raccroché avec ${activeCall.callerName}${notes ? ` — Notes: ${notes.slice(0, 100)}` : ""}`,
    });
    setActiveCall(null);
  }

  const filteredMessages = activeChannel === "ALL"
    ? messages
    : messages.filter((m: Msg) => m.channel === activeChannel);

  const unread = messages.filter((m: Msg) => !m.readByIds?.includes(participant.id)).length;

  const channelCounts = Object.keys(CHANNEL_CONFIG).reduce((acc: Record<string, number>, ch) => {
    acc[ch] = messages.filter((m: Msg) => m.channel === ch && !m.readByIds?.includes(participant.id)).length;
    return acc;
  }, {});

  const activeChannels = Object.keys(CHANNEL_CONFIG).filter(ch =>
    messages.some((m: Msg) => m.channel === ch)
  );

  const statusColor: Record<string, string> = {
    ACTIVE: "#22c55e", PAUSED: "#f59e0b", BRIEFING: "#3b82f6",
    ENDED: "#6b7280", SETUP: "#6b7280", DEBRIEF: "#a855f7",
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col select-none">
      {/* Incoming call overlay */}
      {incomingCall && (
        <IncomingCallModal
          call={incomingCall}
          onAnswer={() => handleAnswerCall(incomingCall)}
          onDecline={() => handleDeclineCall(incomingCall)}
        />
      )}

      {/* Active call bar */}
      {activeCall && (
        <ActiveCallPanel call={activeCall} onEnd={handleEndCall} />
      )}

      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 py-3 bg-gray-900 border-b border-gray-800 sticky top-0 z-30">
        <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">S</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{session.title}</p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor[sessionStatus] || "#6b7280" }} />
            <span className="text-xs text-gray-400">{sessionStatus}</span>
            {session.startedAt && (
              <span className="text-xs text-orange-400 font-mono">⏱ {formatElapsed(elapsed)}</span>
            )}
            {!hasPusher && (
              <span className="text-xs text-gray-600">(polling)</span>
            )}
          </div>
        </div>
        <div className="hidden sm:flex flex-col items-end flex-shrink-0">
          <span className="text-xs text-orange-400 font-semibold">{participant.role}</span>
          {participant.team && <span className="text-xs text-gray-500">{participant.team}</span>}
        </div>
        {unread > 0 && (
          <div className="flex items-center gap-1.5 bg-red-950 border border-red-800 rounded-full px-3 py-1 flex-shrink-0">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-300 text-xs font-bold">{unread}</span>
          </div>
        )}
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-52 bg-gray-900 border-r border-gray-800 p-3 gap-1 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto flex-shrink-0">
          <p className="text-xs text-gray-500 uppercase tracking-wide px-2 mb-2">Canaux</p>
          <button
            onClick={() => setActiveChannel("ALL")}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
              activeChannel === "ALL" ? "bg-gray-700 text-white" : "text-gray-400 hover:bg-gray-800"
            }`}>
            <span>Tout ({messages.length})</span>
            {unread > 0 && (
              <span className="bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {unread}
              </span>
            )}
          </button>

          <div className="h-px bg-gray-800 my-1" />

          {Object.entries(CHANNEL_CONFIG).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const count = channelCounts[key] || 0;
            const total = messages.filter((m: Msg) => m.channel === key).length;
            if (!total) return null;
            return (
              <button key={key}
                onClick={() => setActiveChannel(key)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeChannel === key ? "bg-gray-700 text-white" : "text-gray-400 hover:bg-gray-800"
                }`}>
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: cfg.color }} />
                  <span className="truncate">{cfg.label}</span>
                </div>
                {count > 0 && (
                  <span className="bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0">
                    {count}
                  </span>
                )}
              </button>
            );
          })}

          <div className="mt-auto pt-3 border-t border-gray-800 px-2 space-y-1">
            <button onClick={() => setActiveChannel("CHAT")} className={`flex items-center gap-2 px-3 py-2 w-full text-left rounded-lg text-sm transition-colors ${activeChannel === "CHAT" ? "bg-gray-700 text-white" : "text-gray-400 hover:bg-gray-800"}`}>
              <MessageSquareText className="h-4 w-4 flex-shrink-0" /> <span className="truncate">Chat Interne</span>
            </button>
            <button onClick={() => setActiveChannel("EXTERNAL_CHAT")} className={`flex items-center gap-2 px-3 py-2 w-full text-left rounded-lg text-sm transition-colors ${activeChannel === "EXTERNAL_CHAT" ? "bg-gray-700 text-white" : "text-gray-400 hover:bg-gray-800"}`}>
              <Users className="h-4 w-4 flex-shrink-0" /> <span className="truncate">Comm. Externes</span>
            </button>
            <button onClick={() => setActiveChannel("CRISIS_LOG")} className={`flex items-center gap-2 px-3 py-2 w-full text-left rounded-lg text-sm transition-colors ${activeChannel === "CRISIS_LOG" ? "bg-gray-700 text-white" : "text-gray-400 hover:bg-gray-800"}`}>
              <Shield className="h-4 w-4 flex-shrink-0" /> <span className="truncate">Main Courante</span>
            </button>
            <button onClick={() => setActiveChannel("CRISIS_DOCS")} className={`flex items-center gap-2 px-3 py-2 w-full text-left rounded-lg text-sm transition-colors ${activeChannel === "CRISIS_DOCS" ? "bg-gray-700 text-white" : "text-gray-400 hover:bg-gray-800"}`}>
              <FileStack className="h-4 w-4 flex-shrink-0" /> <span className="truncate">Documents</span>
            </button>
            
            <div className="mt-4 pt-2 border-t border-gray-800 space-y-1">
              <p className="text-xs text-gray-600">Mes coordonnées sim.</p>
              {participant.simEmail && (
                <p className="text-xs text-gray-600 truncate" title={participant.simEmail}>
                  📧 {participant.simEmail}
                </p>
              )}
              {participant.simPhone && (
                <p className="text-xs text-gray-600">📞 {participant.simPhone}</p>
              )}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Mobile channel tabs */}
          <div className="md:hidden flex gap-2 p-3 bg-gray-900 border-b border-gray-800 overflow-x-auto no-scrollbar">
            <button onClick={() => setActiveChannel("ALL")}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${
                activeChannel === "ALL" ? "bg-orange-600 text-white" : "bg-gray-800 text-gray-400"
              }`}>
              Tout {unread > 0 && `(${unread})`}
            </button>
            {activeChannels.map(key => {
              const cfg = CHANNEL_CONFIG[key as keyof typeof CHANNEL_CONFIG];
              const c = channelCounts[key];
              return (
                <button key={key} onClick={() => setActiveChannel(key)}
                  className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${
                    activeChannel === key ? "text-white" : "bg-gray-800 text-gray-400"
                  }`}
                  style={activeChannel === key ? { background: cfg.color } : {}}>
                  {c > 0 && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                  {cfg.label}
                </button>
              );
            })}
            <button onClick={() => setActiveChannel("CHAT")} className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${activeChannel === "CHAT" ? "bg-gray-700 text-white" : "bg-gray-800 text-gray-400"}`}>
              <MessageSquareText className="h-3 w-3" /> Chat
            </button>
            <button onClick={() => setActiveChannel("EXTERNAL_CHAT")} className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${activeChannel === "EXTERNAL_CHAT" ? "bg-gray-700 text-white" : "bg-gray-800 text-gray-400"}`}>
              <Users className="h-3 w-3" /> Externes
            </button>
            <button onClick={() => setActiveChannel("CRISIS_LOG")} className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${activeChannel === "CRISIS_LOG" ? "bg-gray-700 text-white" : "bg-gray-800 text-gray-400"}`}>
              <Shield className="h-3 w-3" /> Main Courante
            </button>
            <button onClick={() => setActiveChannel("CRISIS_DOCS")} className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${activeChannel === "CRISIS_DOCS" ? "bg-gray-700 text-white" : "bg-gray-800 text-gray-400"}`}>
              <FileStack className="h-3 w-3" /> Documents
            </button>
          </div>

          {/* Messages feed */}
          <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${activeCall ? "pb-52" : ""} ${activeChannel === "CHAT" ? "p-0" : ""}`}>
            {activeChannel === "CHAT" ? (
              <ChatPanel sessionId={session.id} participant={participant} allParticipants={participants} />
            ) : activeChannel === "EXTERNAL_CHAT" ? (
              <ExternalChatPanel sessionId={session.id} participant={participant} participants={participants} initialMessages={messages} />
            ) : activeChannel === "CRISIS_LOG" ? (
              <CrisisLogPanel sessionId={session.id} participant={participant} initialEntries={session.crisisLog || []} />
            ) : activeChannel === "CRISIS_DOCS" ? (
              <CrisisDocsPanel sessionId={session.id} simulationId={session.simulationId || ""} participant={participant} />
            ) : filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-4 border border-gray-800">
                  <Bell className="h-9 w-9 text-gray-700" />
                </div>
                <p className="text-gray-500 text-sm font-medium">En attente de communications</p>
                <p className="text-gray-700 text-xs mt-2">
                  {sessionStatus === "SETUP" || sessionStatus === "BRIEFING"
                    ? "La simulation n'a pas encore démarré"
                    : "Les messages apparaîtront ici en temps réel"}
                </p>
                {!hasPusher && (
                  <p className="text-gray-700 text-xs mt-1">Actualisation auto. toutes les 3s</p>
                )}
              </div>
            ) : (
              filteredMessages.map((msg: Msg) => (
                <div key={msg.id} onClick={() => {
                  if (!msg.readByIds?.includes(participant.id)) {
                    markMessageRead(msg.id, participant.id);
                    setMessages(prev => prev.map((m: Msg) => m.id === msg.id
                      ? { ...m, readByIds: [...(m.readByIds || []), participant.id], status: "READ" }
                      : m
                    ));
                  }
                }}>
                  <MessageThread
                    message={msg}
                    participantId={participant.id}
                    participantName={participant.displayName}
                    sessionId={session.id}
                    onReplied={() => {}}
                  />
                </div>
              ))
            )}
          </div>

          {/* Status bar */}
          <div className="bg-gray-900 border-t border-gray-800 px-4 py-2 flex items-center justify-between text-xs text-gray-600 flex-shrink-0">
            <span>
              {messages.length} message{messages.length !== 1 ? "s" : ""} ·
              {unread > 0
                ? <span className="text-red-400 ml-1">{unread} non lu{unread > 1 ? "s" : ""}</span>
                : <span className="text-green-500 ml-1"> ✓ Tout lu</span>
              }
            </span>
            <span className={`flex items-center gap-1 ${isConnected ? "text-green-600" : "text-gray-600"}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-gray-600"}`} />
              {isConnected ? "Connecté" : "Déconnecté"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
