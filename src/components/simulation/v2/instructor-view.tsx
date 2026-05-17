"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Mail, Phone, MessageSquare, Bell, Zap, FileText,
  Globe, Radio, Send, Play, Pause, Square, Users,
  Clock, AlertTriangle, CheckCircle2, Eye, Activity,
  ChevronDown, X, PhoneCall, Timer,
  Shield, ListTodo, MessageSquareText,
} from "lucide-react";
import InstructorCrisisLogMonitor from "./instructor-crisis-log";
import FormSynthesisView from "./form-synthesis";
import ChatPanel from "./chat-panel";
import {
  sendSimMessage, updateSessionStatus, initiateCall,
  updateCall, logSimEvent,
} from "@/actions/simulation/sim-session-actions";
import { usePusherChannel } from "./use-pusher-channel";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Participant = any; type Message = any; type Call = any; type Event = any;

const CHANNELS = [
  { key: "EMAIL",          label: "Email",         icon: Mail,          color: "#185FA5" },
  { key: "SMS",            label: "SMS",           icon: MessageSquare, color: "#0F6E56" },
  { key: "WHATSAPP",       label: "WhatsApp",      icon: MessageSquare, color: "#25D366" },
  { key: "CALL",           label: "Appel",         icon: Phone,         color: "#A32D2D" },
  { key: "ALERT",          label: "Alerte",        icon: Bell,          color: "#A32D2D" },
  { key: "FLASH_INFO",     label: "Flash Info",    icon: Zap,           color: "#854F0B" },
  { key: "JOURNAL",        label: "Journal",       icon: FileText,      color: "#534AB7" },
  { key: "SOCIAL_MEDIA",   label: "Réseaux soc.", icon: Globe,         color: "#185FA5" },
  { key: "INTERNAL_RADIO", label: "Radio interne", icon: Radio,         color: "#3B6D11" },
];

const PERSONAS = [
  "Direction Générale", "RSSI", "DSI", "Directeur RH", "Directeur Communication",
  "ANSSI", "CERT-FR", "Autorité de Contrôle", "Médias / Presse",
  "Assureur Cyber", "Client Prioritaire", "Fournisseur Critique",
  "Équipes Terrain", "Cellule de Crise", "Partenaire Externe",
];

function formatElapsed(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2,"0")}min`;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

function formatTime(d: string | Date) {
  return new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// ─── Inject Panel ─────────────────────────────────────────────────────────────
function InjectPanel({ session, participants, onSent }: {
  session: { id: string; status: string };
  participants: Participant[];
  onSent: () => void;
}) {
  const [channel, setChannel] = useState("EMAIL");
  const [priority, setPriority] = useState("NORMAL");
  const [senderName, setSenderName] = useState("Direction Générale");
  const [customSender, setCustomSender] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [isGroupMsg, setIsGroupMsg] = useState(false);
  const [groupName, setGroupName] = useState("Cellule de crise");
  const [expiresIn, setExpiresIn] = useState("");
  const [callScript, setCallScript] = useState("");
  const [isSending, setIsSending] = useState(false);

  const isCall = channel === "CALL";
  const realParticipants = participants.filter(p => !p.isInstructor && !p.isObserver);

  function toggleRecipient(id: string) {
    setSelectedRecipients(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  function selectAll() {
    setSelectedRecipients(realParticipants.map(p => p.id));
    setIsGroupMsg(true);
  }

  async function handleSend() {
    try {
      if (!body.trim()) { toast.error("Contenu requis"); return; }
      const recipients = isGroupMsg ? realParticipants.map(p => p.id) : selectedRecipients;
      if (recipients.length === 0) { toast.error("Sélectionnez au moins un destinataire"); return; }

      setIsSending(true);
      const finalSender = senderName === "custom" ? customSender : senderName;

      if (isCall && selectedRecipients.length === 1) {
        // Initiate call
        const participant = realParticipants.find(p => p.id === selectedRecipients[0]);
        // Fallback to a valid 24-character hex string (ObjectId) if instructor is not in the list
        const instructorId = participants.find(p => p.isInstructor)?.id || "000000000000000000000000";
        
        if (participant) {
          const r = await initiateCall({
            sessionId: session.id,
            callerId: instructorId,
            callerName: finalSender,
            recipientId: participant.id,
            recipientName: participant.displayName,
            script: callScript || body,
            scriptNotes: body,
          });
          if (r.success) {
            toast.success(`📞 Appel initié vers ${participant.displayName}`);
            setBody(""); setCallScript(""); setSelectedRecipients([]);
            onSent();
          } else {
            toast.error(r.error || "Erreur serveur lors de l'appel");
          }
        } else {
          toast.error("Erreur : Participant introuvable dans la liste");
        }
      } else {
        // Send message
        const r = await sendSimMessage({
          sessionId: session.id,
          channel,
          priority,
          senderName: finalSender,
          recipientIds: recipients,
          isGroupMessage: isGroupMsg,
          groupName: isGroupMsg ? groupName : undefined,
          subject: subject || undefined,
          body,
          callScript: callScript || undefined,
          expiresInMinutes: expiresIn ? parseInt(expiresIn) : undefined,
        });

        if (r.success) {
          const channelLabel = CHANNELS.find(c => c.key === channel)?.label || channel;
          toast.success(`✅ ${channelLabel} envoyé à ${isGroupMsg ? groupName : `${recipients.length} participant(s)`}`);
          setBody(""); setSubject(""); setCallScript(""); setSelectedRecipients([]);
          onSent();
        } else {
          toast.error(r.error || "Erreur serveur lors de l'envoi");
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Une erreur réseau critique s'est produite.");
    } finally {
      setIsSending(false);
    }
  }

  const channelConfig = CHANNELS.find(c => c.key === channel);
  const Icon = channelConfig?.icon || Send;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5" style={{ color: channelConfig?.color }} />
        <h3 className="text-white font-semibold text-sm">Nouvel Inject</h3>
      </div>

      {/* Channel grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {CHANNELS.map(ch => {
          const ChIcon = ch.icon;
          return (
            <button key={ch.key}
              onClick={() => setChannel(ch.key)}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                channel === ch.key ? "text-white font-semibold" : "text-gray-400 hover:bg-gray-800"
              }`}
              style={channel === ch.key ? { background: ch.color + "40", borderColor: ch.color, border: `1px solid ${ch.color}50` } : {}}>
              <ChIcon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: ch.color }} />
              <span className="truncate">{ch.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Sender */}
        <div>
          <Label className="text-xs text-gray-400">Expéditeur</Label>
          <Select value={senderName} onValueChange={setSenderName}>
            <SelectTrigger className="mt-1 h-8 text-xs bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              {PERSONAS.map(p => <SelectItem key={p} value={p} className="text-xs text-white">{p}</SelectItem>)}
              <SelectItem value="custom" className="text-xs text-orange-400">✏️ Personnalisé...</SelectItem>
            </SelectContent>
          </Select>
          {senderName === "custom" && (
            <Input className="mt-1 h-8 text-xs bg-gray-800 border-gray-700 text-white"
              placeholder="Nom de l'expéditeur"
              value={customSender} onChange={e => setCustomSender(e.target.value)} />
          )}
        </div>

        {/* Priority */}
        <div>
          <Label className="text-xs text-gray-400">Priorité</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="mt-1 h-8 text-xs bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="LOW" className="text-gray-400">🔵 Basse</SelectItem>
              <SelectItem value="NORMAL" className="text-blue-400">🔵 Normale</SelectItem>
              <SelectItem value="HIGH" className="text-orange-400">🟠 Haute</SelectItem>
              <SelectItem value="CRITICAL" className="text-red-400">🔴 CRITIQUE</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Recipients */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs text-gray-400">Destinataires</Label>
          <div className="flex gap-2">
            <button onClick={() => { setIsGroupMsg(true); selectAll(); }}
              className="text-xs text-orange-400 hover:text-orange-300">
              Tous
            </button>
            <button onClick={() => { setIsGroupMsg(false); setSelectedRecipients([]); }}
              className="text-xs text-gray-500 hover:text-gray-400">
              Aucun
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {realParticipants.map(p => (
            <button key={p.id}
              onClick={() => toggleRecipient(p.id)}
              className={`px-2 py-1 rounded-full text-xs transition-colors ${
                selectedRecipients.includes(p.id)
                  ? "bg-orange-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}>
              {p.isConnected ? "●" : "○"} {p.displayName}
            </button>
          ))}
        </div>
        {selectedRecipients.length > 1 && (
          <label className="flex items-center gap-2 mt-2 cursor-pointer">
            <input type="checkbox" checked={isGroupMsg} onChange={e => setIsGroupMsg(e.target.checked)}
              className="accent-orange-500" />
            <span className="text-xs text-gray-400">Message de groupe</span>
            {isGroupMsg && (
              <Input className="h-7 text-xs bg-gray-800 border-gray-700 text-white w-40"
                value={groupName} onChange={e => setGroupName(e.target.value)} />
            )}
          </label>
        )}
      </div>

      {/* Content */}
      {channel === "EMAIL" && (
        <div>
          <Label className="text-xs text-gray-400">Objet</Label>
          <Input className="mt-1 h-8 text-sm bg-gray-800 border-gray-700 text-white"
            placeholder="Objet de l'email" value={subject} onChange={e => setSubject(e.target.value)} />
        </div>
      )}

      <div>
        <Label className="text-xs text-gray-400">
          {isCall ? "Script / Notes pour l'appel (visible uniquement par l'instructeur)" : "Message"}
        </Label>
        <Textarea
          className="mt-1 text-sm bg-gray-800 border-gray-700 text-white resize-none"
          rows={isCall ? 4 : 3}
          placeholder={
            isCall
              ? "Script de l'appel : que dire, quelles informations donner, questions attendues..."
              : channel === "EMAIL"
              ? "Corps de l'email..."
              : channel === "ALERT"
              ? "Message d'alerte critique (bref et direct)..."
              : `Message ${CHANNELS.find(c => c.key === channel)?.label.toLowerCase()}...`
          }
          value={body}
          onChange={e => setBody(e.target.value)}
        />
      </div>

      {!isCall && (
        <div>
          <Label className="text-xs text-gray-400">
            Expire dans (minutes) — laissez vide pour pas d'expiration
          </Label>
          <Input className="mt-1 h-7 text-xs bg-gray-800 border-gray-700 text-white w-24"
            type="number" min="1" placeholder="ex: 10"
            value={expiresIn} onChange={e => setExpiresIn(e.target.value)} />
        </div>
      )}

      <Button
        className="w-full gap-2 font-semibold"
        style={{ background: channelConfig?.color || "#f97316" }}
        onClick={handleSend} disabled={isSending || !body.trim()}>
        <Icon className="h-4 w-4" />
        {isSending ? "Envoi..." : isCall
          ? `📞 Appeler ${realParticipants.find(p => p.id === selectedRecipients[0])?.displayName || "..."}`
          : `Envoyer ${channelConfig?.label}`}
      </Button>
    </div>
  );
}

// ─── Participant Status Card ───────────────────────────────────────────────────
function ParticipantCard({ participant }: { participant: Participant }) {
  const responseRate = participant.messagesReceived > 0
    ? Math.round((participant.messagesReplied / participant.messagesReceived) * 100)
    : 0;

  return (
    <div className={`bg-gray-900 border rounded-xl p-3 ${
      participant.isConnected ? "border-green-800" : "border-gray-800"
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${participant.isConnected ? "bg-green-500 animate-pulse" : "bg-gray-600"}`} />
        <p className="text-white text-sm font-semibold">{participant.displayName}</p>
        {participant.isObserver && <Badge className="text-xs bg-gray-800 text-gray-400">Observateur</Badge>}
      </div>
      <p className="text-orange-400 text-xs mb-2">{participant.role}</p>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-white text-sm font-bold">{participant.messagesReceived}</p>
          <p className="text-gray-500 text-xs">Reçus</p>
        </div>
        <div>
          <p className={`text-sm font-bold ${responseRate >= 70 ? "text-green-400" : responseRate >= 40 ? "text-amber-400" : "text-red-400"}`}>
            {responseRate}%
          </p>
          <p className="text-gray-500 text-xs">Réponses</p>
        </div>
        <div>
          <p className="text-white text-sm font-bold">
            {participant.avgResponseTime ? `${Math.round(participant.avgResponseTime)}s` : "—"}
          </p>
          <p className="text-gray-500 text-xs">Délai moy.</p>
        </div>
      </div>
      {participant.missedMessages > 0 && (
        <div className="mt-2 text-xs text-red-400">⚠️ {participant.missedMessages} message(s) expiré(s)</div>
      )}
    </div>
  );
}

// ─── Main Instructor View ─────────────────────────────────────────────────────
export default function InstructorView({
  session: initialSession,
  participants: initialParticipants,
  initialMessages,
  initialCalls,
  initialEvents,
}: {
  session: { id: string; title: string; status: string; startedAt?: string | null; durationMinutes?: number | null; crisisLog?: any[] };
  participants: Participant[];
  initialMessages: Message[];
  initialCalls: Call[];
  initialEvents: Event[];
}) {
  const [session, setSession] = useState(initialSession);
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [calls, setCalls] = useState<Call[]>(initialCalls);
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [lastPoll, setLastPoll] = useState(new Date().toISOString());
  const [elapsed, setElapsed] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("feed");
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Timer
  useEffect(() => {
    if (!session.startedAt) return;
    const t = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(session.startedAt!).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [session.startedAt]);

  // Poll loop
  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/sim/${session.id}?instructor=1&since=${lastPoll}`);
      if (!res.ok) return;
      const data = await res.json();
      setLastPoll(data.serverTime);
      if (data.session) setSession(s => ({ ...s, status: data.session.status }));
      if (data.participants?.length) setParticipants(data.participants);
      if (data.newMessages?.length) {
        setMessages(prev => {
          const ids = new Set(prev.map((m: Message) => m.id));
          return [...data.newMessages.filter((m: Message) => !ids.has(m.id)), ...prev];
        });
      }
      if (data.newReplies?.length) {
        setMessages(prev => prev.map((msg: Message) => {
          const newR = data.newReplies.filter((r: Message) => r.messageId === msg.id);
          if (!newR.length) return msg;
          const existIds = new Set((msg.replies || []).map((r: Message) => r.id));
          return { ...msg, replies: [...(msg.replies || []), ...newR.filter((r: Message) => !existIds.has(r.id))] };
        }));
      }
      if (data.newCalls?.length) {
        setCalls(prev => {
          const ids = new Set(prev.map((c: Call) => c.id));
          return [...data.newCalls.filter((c: Call) => !ids.has(c.id)), ...prev];
        });
      }
      if (data.newEvents?.length) {
        setEvents(prev => {
          const ids = new Set(prev.map((e: Event) => e.id));
          return [...data.newEvents.filter((e: Event) => !ids.has(e.id)), ...prev];
        });
      }
    } catch {}
  }, [session.id, lastPoll]);

  // Pusher real-time updates (replaces polling when available)
  const hasPusher = typeof process !== "undefined" && !!process.env.NEXT_PUBLIC_PUSHER_KEY;

  usePusherChannel({
    sessionId: session.id,
    isInstructor: true,
    onReplySent: useCallback((data: unknown) => {
      const d = data as { replyId: string; messageId: string; participantId: string; participantName: string; channel: string; body: string; responseTimeSeconds: number };
      toast.success(`💬 Réponse de ${d.participantName} en ${d.responseTimeSeconds}s`);
      setMessages(prev => prev.map((msg: Message) => {
        if (msg.id !== d.messageId) return msg;
        const reply = { id: d.replyId, participantId: d.participantId, participantName: d.participantName, channel: d.channel, body: d.body, responseTimeSeconds: d.responseTimeSeconds, sentAt: new Date().toISOString() };
        const exists = (msg.replies || []).some((r: Message) => r.id === d.replyId);
        return exists ? msg : { ...msg, status: "REPLIED", replies: [...(msg.replies || []), reply] };
      }));
    }, []),
    onMessageRead: useCallback((data: unknown) => {
      const d = data as { messageId: string; participantId: string; participantName: string };
      setMessages(prev => prev.map((msg: Message) => msg.id !== d.messageId ? msg : { ...msg, status: msg.status === "REPLIED" ? "REPLIED" : "READ" }));
    }, []),
    onParticipantJoined: useCallback((data: unknown) => {
      const d = data as { participantId: string; displayName: string; role: string };
      toast.success(`👤 ${d.displayName} a rejoint la simulation`);
      setParticipants(prev => prev.map(p => p.id === d.participantId ? { ...p, isConnected: true } : p));
    }, []),
    onParticipantLeft: useCallback((data: unknown) => {
      const d = data as { participantId: string; displayName: string };
      setParticipants(prev => prev.map(p => p.id === d.participantId ? { ...p, isConnected: false } : p));
    }, []),
    onCallUpdated: useCallback((data: unknown) => {
      const d = data as { callId: string; status: string; transcript?: string };
      setCalls(prev => prev.map((c: Call) => c.id === d.callId ? { ...c, status: d.status, transcript: d.transcript || c.transcript } : c));
      if (d.status === "ACTIVE") toast.success("📞 Appel décroché !");
      if (d.status === "MISSED") toast.error("📵 Appel manqué");
    }, []),
  });

  useEffect(() => {
    if (hasPusher) return; // Use Pusher instead
    pollRef.current = setInterval(poll, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [poll, hasPusher]);

  async function handleStatus(newStatus: string) {
    const r = await updateSessionStatus(session.id, newStatus, {
      startedAt: newStatus === "ACTIVE",
      endedAt: newStatus === "ENDED",
      pausedAt: newStatus === "PAUSED",
    });
    if (r.success) {
      setSession(s => ({ ...s, status: newStatus }));
      toast.success(`Session : ${newStatus}`);
    }
  }

  const statusBg: Record<string, string> = {
    SETUP: "bg-gray-700", BRIEFING: "bg-blue-800", ACTIVE: "bg-green-800",
    PAUSED: "bg-amber-800", DEBRIEF: "bg-purple-800", ENDED: "bg-gray-800",
  };

  const unread = messages.filter((m: Message) => m.readByIds?.length === 0).length;
  const unanswered = messages.filter((m: Message) => m.status !== "REPLIED" && m.status !== "MISSED").length;
  const connectedCount = participants.filter(p => p.isConnected && !p.isInstructor).length;
  const totalParticipants = participants.filter(p => !p.isInstructor).length;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header — Control Room */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">S</div>
          <div>
            <p className="text-xs text-orange-500 font-semibold">SURVIVE — INSTRUCTEUR</p>
            <p className="text-xs text-gray-400">{session.title}</p>
          </div>
        </div>

        <div className="flex-1" />

        {/* Session KPIs */}
        <div className="flex items-center gap-4 text-xs">
          <div className="text-center">
            <p className="text-green-400 font-bold">{connectedCount}/{totalParticipants}</p>
            <p className="text-gray-500">connectés</p>
          </div>
          <div className="text-center">
            <p className={`font-bold ${unread > 0 ? "text-red-400" : "text-gray-400"}`}>{unread}</p>
            <p className="text-gray-500">non lus</p>
          </div>
          <div className="text-center">
            <p className={`font-bold ${unanswered > 0 ? "text-amber-400" : "text-green-400"}`}>{unanswered}</p>
            <p className="text-gray-500">sans réponse</p>
          </div>
          {session.startedAt && (
            <div className="text-center">
              <p className="text-orange-400 font-mono font-bold">{formatElapsed(elapsed)}</p>
              <p className="text-gray-500">écoulé</p>
            </div>
          )}
        </div>

        {/* Session controls */}
        <div className="flex gap-2">
          {session.status === "SETUP" && (
            <Button size="sm" className="bg-blue-700 hover:bg-blue-800 gap-1 h-8"
              onClick={() => handleStatus("BRIEFING")}>
              <Eye className="h-4 w-4" /> Briefing
            </Button>
          )}
          {(session.status === "BRIEFING" || session.status === "ENDED") && (
            <Button size="sm" className="bg-green-700 hover:bg-green-800 gap-1 h-8"
              onClick={() => handleStatus("ACTIVE")}>
              <Play className="h-4 w-4" /> Démarrer
            </Button>
          )}
          {session.status === "ACTIVE" && (
            <>
              <Button size="sm" className="bg-amber-700 hover:bg-amber-800 gap-1 h-8"
                onClick={() => handleStatus("PAUSED")}>
                <Pause className="h-4 w-4" /> Pause
              </Button>
              <Button size="sm" className="bg-purple-700 hover:bg-purple-800 gap-1 h-8"
                onClick={() => handleStatus("DEBRIEF")}>
                <Square className="h-4 w-4" /> Debrief
              </Button>
            </>
          )}
          {session.status === "PAUSED" && (
            <Button size="sm" className="bg-green-700 hover:bg-green-800 gap-1 h-8"
              onClick={() => handleStatus("ACTIVE")}>
              <Play className="h-4 w-4" /> Reprendre
            </Button>
          )}
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBg[session.status] || "bg-gray-700"}`}>
            {session.status}
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-57px)]">
        {/* Left panel — inject */}
        <div className="w-80 border-r border-gray-800 overflow-y-auto p-3 flex-shrink-0">
          <InjectPanel
            session={session}
            participants={participants}
            onSent={poll}
          />
        </div>

        {/* Center — feed + tabs */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Tabs */}
          <div className="flex border-b border-gray-800 px-4 overflow-x-auto no-scrollbar flex-shrink-0">
            {[
              { key: "feed", label: "Feed", count: messages.length },
              { key: "participants", label: "Participants", count: connectedCount },
              { key: "calls", label: "Appels", count: calls.length },
              { key: "chat", label: "Chat", count: 0 },
              { key: "crisis_log", label: "Main Courante", count: 0 },
              { key: "forms", label: "Formulaires", count: 0 },
            ].map(tab => (
              <button key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-orange-500 text-orange-400"
                    : "border-transparent text-gray-500 hover:text-gray-300"
                }`}>
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className={`flex-1 overflow-y-auto ${activeTab === "chat" ? "p-0" : "p-4"}`}>
            {/* FEED TAB */}
            {activeTab === "feed" && (
              <div className="space-y-3">
                {messages.map((msg: Message) => {
                  const replies = msg.replies || [];
                  const isRead = msg.readByIds?.length > 0;
                  const isReplied = msg.status === "REPLIED";
                  return (
                    <div key={msg.id} className={`bg-gray-900 border rounded-xl p-3 ${
                      isReplied ? "border-green-900" : isRead ? "border-gray-700" : "border-amber-800"
                    }`}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">{msg.channel}</span>
                          {msg.priority === "CRITICAL" && <span className="text-xs text-red-400 font-bold animate-pulse">🔴 CRITIQUE</span>}
                          {msg.priority === "HIGH" && <span className="text-xs text-orange-400">⚠️ HAUTE</span>}
                          <span className="text-xs text-gray-500">{msg.senderName}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isReplied ? (
                            <span className="text-xs text-green-400 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Répondu
                            </span>
                          ) : isRead ? (
                            <span className="text-xs text-blue-400">Lu</span>
                          ) : (
                            <span className="text-xs text-amber-400 animate-pulse">Non lu</span>
                          )}
                          <span className="text-xs text-gray-600">{formatTime(msg.triggeredAt)}</span>
                        </div>
                      </div>
                      {msg.subject && <p className="text-gray-300 text-sm font-medium mb-1">{msg.subject}</p>}
                      <p className="text-gray-400 text-sm line-clamp-2">{msg.body}</p>
                      {replies.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {replies.map((r: Message) => (
                            <div key={r.id} className="bg-green-950/50 border border-green-900 rounded-lg px-3 py-2 text-xs">
                              <p className="text-green-400 font-semibold">{r.participantName} ({r.responseTimeSeconds}s)</p>
                              <p className="text-gray-300">{r.body}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                {messages.length === 0 && (
                  <div className="text-center py-20 text-gray-600">
                    <Activity className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p>En attente d'injects...</p>
                  </div>
                )}
              </div>
            )}

            {/* PARTICIPANTS TAB */}
            {activeTab === "participants" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {participants.filter(p => !p.isInstructor).map((p: Participant) => (
                  <ParticipantCard key={p.id} participant={p} />
                ))}
              </div>
            )}

            {/* CALLS TAB */}
            {activeTab === "calls" && (
              <div className="space-y-3">
                {calls.map((call: Call) => (
                  <div key={call.id} className="bg-gray-900 border border-gray-700 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PhoneCall className="h-4 w-4 text-green-400" />
                        <p className="text-white text-sm font-semibold">{call.callerName} → {call.recipientName}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          call.status === "ACTIVE" ? "bg-green-900 text-green-300" :
                          call.status === "COMPLETED" ? "bg-gray-800 text-gray-400" :
                          call.status === "MISSED" ? "bg-red-900 text-red-300" : "bg-amber-900 text-amber-300"
                        }`}>{call.status}</span>
                      </div>
                      <span className="text-xs text-gray-500">{formatTime(call.createdAt)}</span>
                    </div>
                    {call.status === "RINGING" && (
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" className="h-7 text-xs bg-red-900 hover:bg-red-800 gap-1"
                          onClick={async () => {
                            await updateCall(call.id, { status: "MISSED", missedReason: "Participant n'a pas décroché" });
                            poll();
                          }}>
                          <X className="h-3 w-3" /> Marquer manqué
                        </Button>
                      </div>
                    )}
                    {call.transcript && (
                      <p className="mt-2 text-xs text-gray-400 bg-gray-800 rounded p-2">📝 {call.transcript}</p>
                    )}
                  </div>
                ))}
                {calls.length === 0 && (
                  <div className="text-center py-20 text-gray-600">
                    <Phone className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p>Aucun appel</p>
                  </div>
                )}
              </div>
            )}

            {/* CHAT TAB */}
            {activeTab === "chat" && (
              <div className="h-full">
                <ChatPanel sessionId={session.id} participant={{ id: "instructor", displayName: "Instructeur", role: "Supervision", isInstructor: true }} allParticipants={participants} />
              </div>
            )}

            {/* CRISIS LOG TAB */}
            {activeTab === "crisis_log" && (
              <InstructorCrisisLogMonitor sessionId={session.id} initialEntries={session.crisisLog || []} />
            )}

            {/* FORMS TAB */}
            {activeTab === "forms" && (
              <FormSynthesisView sessionId={session.id} />
            )}
          </div>
        </div>

        {/* Right panel — Timeline */}
        <div className="w-72 border-l border-gray-800 overflow-y-auto p-3 flex-shrink-0">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Chronologie</p>
          <div className="space-y-2">
            {events.slice(0, 30).map((event: Event) => (
              <div key={event.id} className="flex gap-2 text-xs">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5" />
                  <div className="w-px flex-1 bg-gray-800 my-0.5" />
                </div>
                <div className="flex-1 pb-2">
                  <p className="text-gray-500">{formatTime(event.occurredAt)}</p>
                  <p className="text-gray-300">{event.description}</p>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <p className="text-gray-600 text-xs text-center py-4">Aucun événement</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
