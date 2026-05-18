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
  Shield, ListTodo, MessageSquareText, FileUp, Sparkles, FileStack,
} from "lucide-react";
import InstructorCrisisLogMonitor from "./instructor-crisis-log";
import FormSynthesisView from "./form-synthesis";
import ChatPanel from "./chat-panel";
import InstructorExternalActorsMonitor from "./instructor-external-actors";
import {
  sendSimMessage, updateSessionStatus, initiateCall,
  updateCall, logSimEvent, addExternalActor,
} from "@/actions/simulation/sim-session-actions";
import { usePusherChannel } from "./use-pusher-channel";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Participant = any; type Message = any; type Call = any; type Event = any;

const CHANNELS = [
  { key: "EMAIL",          label: "Email",         icon: Mail,          color: "#3b82f6" }, // Modern Blue
  { key: "SMS",            label: "SMS",           icon: MessageSquare, color: "#10b981" }, // Emerald Green
  { key: "WHATSAPP",       label: "WhatsApp",      icon: MessageSquare, color: "#22c55e" }, // Neon Green
  { key: "CALL",           label: "Appel",         icon: Phone,         color: "#ef4444" }, // Red
  { key: "ALERT",          label: "Alerte",        icon: Bell,          color: "#f59e0b" }, // Amber
  { key: "FLASH_INFO",     label: "Flash Info",    icon: Zap,           color: "#ec4899" }, // Hot Pink
  { key: "JOURNAL",        label: "Journal",       icon: FileText,      color: "#8b5cf6" }, // Purple
  { key: "SOCIAL_MEDIA",   label: "Réseaux soc.", icon: Globe,         color: "#06b6d4" }, // Cyan
  { key: "INTERNAL_RADIO", label: "Radio interne", icon: Radio,         color: "#84cc16" }, // Lime
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
  const [mediaImageUrl, setMediaImageUrl] = useState("");
  const [mediaYoutubeUrl, setMediaYoutubeUrl] = useState("");
  const [mediaPdfUrl, setMediaPdfUrl] = useState("");

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
        let finalBody = body;
        if (mediaImageUrl.trim()) {
          finalBody += `\n\n${mediaImageUrl.trim()}`;
        }
        if (mediaYoutubeUrl.trim()) {
          finalBody += `\n\n${mediaYoutubeUrl.trim()}`;
        }
        if (mediaPdfUrl.trim()) {
          finalBody += `\n\n${mediaPdfUrl.trim()}`;
        }

        const r = await sendSimMessage({
          sessionId: session.id,
          channel,
          priority,
          senderName: finalSender,
          recipientIds: recipients,
          isGroupMessage: isGroupMsg,
          groupName: isGroupMsg ? groupName : undefined,
          subject: subject || undefined,
          body: finalBody,
          callScript: callScript || undefined,
          expiresInMinutes: expiresIn ? parseInt(expiresIn) : undefined,
        });

        if (r.success) {
          const channelLabel = CHANNELS.find(c => c.key === channel)?.label || channel;
          toast.success(`✅ ${channelLabel} envoyé à ${isGroupMsg ? groupName : `${recipients.length} participant(s)`}`);
          setBody(""); setSubject(""); setCallScript(""); setSelectedRecipients([]);
          setMediaImageUrl(""); setMediaYoutubeUrl(""); setMediaPdfUrl("");
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
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 space-y-5 shadow-xl shadow-black/30">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-600/10 border border-orange-500/20">
            <Icon className="h-5 w-5" style={{ color: channelConfig?.color }} />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Nouvel Inject</h3>
            <p className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">Console d'envoi</p>
          </div>
        </div>
        <Sparkles className="h-4 w-4 text-orange-500/60" />
      </div>

      {/* Channel Grid (Digital switches style) */}
      <div className="space-y-1.5">
        <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Canal de transmission</Label>
        <div className="grid grid-cols-3 gap-2">
          {CHANNELS.map(ch => {
            const ChIcon = ch.icon;
            const isActive = channel === ch.key;
            return (
              <button key={ch.key}
                onClick={() => setChannel(ch.key)}
                className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border text-[11px] transition-all duration-300 ${
                  isActive 
                    ? "text-white font-semibold shadow-lg shadow-black/20" 
                    : "text-gray-400 hover:text-gray-200 bg-slate-950/20 hover:bg-slate-950/40 border-slate-800/60"
                }`}
                style={isActive ? { 
                  backgroundColor: `${ch.color}15`, 
                  borderColor: ch.color,
                  boxShadow: `0 0 12px ${ch.color}20`
                } : {}}>
                <ChIcon className="h-4.5 w-4.5 mb-1.5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" style={{ color: ch.color }} />
                <span className="truncate w-full text-center text-[10px] tracking-wide">{ch.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Sender Persona Selector */}
        <div className="space-y-1.5">
          <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Émetteur</Label>
          <Select value={senderName} onValueChange={setSenderName}>
            <SelectTrigger className="h-9 text-xs bg-slate-950/40 border-slate-800/80 hover:border-slate-700 rounded-xl text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-white">
              {PERSONAS.map(p => <SelectItem key={p} value={p} className="text-xs focus:bg-orange-600 focus:text-white rounded-lg">{p}</SelectItem>)}
              <SelectItem value="custom" className="text-xs text-orange-400 font-semibold focus:bg-orange-600 focus:text-white rounded-lg">✏️ Personnalisé...</SelectItem>
            </SelectContent>
          </Select>
          {senderName === "custom" && (
            <Input className="mt-1.5 h-9 text-xs bg-slate-950/40 border-slate-800/80 text-white rounded-xl focus-visible:ring-orange-500"
              placeholder="Nom personnalisé..."
              value={customSender} onChange={e => setCustomSender(e.target.value)} />
          )}
        </div>

        {/* Priority Selector */}
        <div className="space-y-1.5">
          <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Priorité</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="h-9 text-xs bg-slate-950/40 border-slate-800/80 hover:border-slate-700 rounded-xl text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-white">
              <SelectItem value="LOW" className="text-xs text-gray-400 focus:bg-slate-800 rounded-lg">🔵 Basse</SelectItem>
              <SelectItem value="NORMAL" className="text-xs text-blue-400 focus:bg-slate-800 rounded-lg">🔵 Normale</SelectItem>
              <SelectItem value="HIGH" className="text-xs text-orange-400 focus:bg-slate-800 rounded-lg">🟠 Haute</SelectItem>
              <SelectItem value="CRITICAL" className="text-xs text-red-400 font-bold focus:bg-slate-800 rounded-lg">🔴 CRITIQUE</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Recipients Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Cibles destinataires</Label>
          <div className="flex gap-2">
            <button onClick={() => { setIsGroupMsg(true); selectAll(); }}
              className="text-[10px] text-orange-400 hover:text-orange-300 font-semibold uppercase tracking-wider">
              Tous
            </button>
            <span className="text-slate-700 text-[10px]">|</span>
            <button onClick={() => { setIsGroupMsg(false); setSelectedRecipients([]); }}
              className="text-[10px] text-gray-500 hover:text-gray-400 font-semibold uppercase tracking-wider">
              Aucun
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
          {realParticipants.map(p => {
            const isSelected = selectedRecipients.includes(p.id);
            return (
              <button key={p.id}
                type="button"
                onClick={() => toggleRecipient(p.id)}
                className={`relative pl-2.5 pr-3 py-1 rounded-xl text-[11px] font-medium transition-all duration-300 flex items-center gap-1.5 border ${
                  isSelected
                    ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white border-orange-500 shadow-md shadow-orange-950/10"
                    : "bg-slate-950/40 text-gray-400 border-slate-800 hover:border-slate-700 hover:text-gray-300"
                }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${p.isConnected ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-slate-600"}`} />
                {p.displayName}
              </button>
            );
          })}
        </div>
        
        {selectedRecipients.length > 1 && (
          <label className="flex items-center gap-2.5 mt-2 cursor-pointer bg-slate-950/20 p-2 rounded-xl border border-slate-800/60 transition-colors hover:bg-slate-950/40">
            <input type="checkbox" checked={isGroupMsg} onChange={e => setIsGroupMsg(e.target.checked)}
              className="accent-orange-500 rounded h-3.5 w-3.5" />
            <span className="text-[11px] text-gray-400 font-medium">Créer un message de groupe</span>
            {isGroupMsg && (
              <Input className="h-7 text-xs bg-slate-900 border-slate-800 text-white w-40 rounded-lg ml-auto"
                value={groupName} onChange={e => setGroupName(e.target.value)} />
            )}
          </label>
        )}
      </div>

      {/* Content Form Fields */}
      <div className="space-y-4">
        {channel === "EMAIL" && (
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Objet du courriel</Label>
            <Input className="h-9 text-xs bg-slate-950/40 border-slate-800/80 focus-visible:ring-orange-500 text-white rounded-xl"
              placeholder="Sujet de l'email..." value={subject} onChange={e => setSubject(e.target.value)} />
          </div>
        )}

        <div className="space-y-1.5">
          <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            {isCall ? "Script de l'appelant (visible uniquement par l'instructeur)" : "Corps de l'inject"}
          </Label>
          <Textarea
            className="text-xs bg-slate-950/40 border-slate-800/80 focus-visible:ring-orange-500 text-white resize-none rounded-xl"
            rows={isCall ? 4 : 3}
            placeholder={
              isCall
                ? "Détaillez le script : que doit dire l'instructeur au téléphone, les consignes et les réponses clés attendues..."
                : channel === "EMAIL"
                ? "Écrivez le message de l'email..."
                : channel === "ALERT"
                ? "Message d'alerte critique..."
                : `Écrivez le message ${CHANNELS.find(c => c.key === channel)?.label.toLowerCase()}...`
            }
            value={body}
            onChange={e => setBody(e.target.value)}
          />
        </div>
      </div>

      {/* Attachments Section */}
      {!isCall && (
        <div className="border border-slate-800/60 rounded-xl p-3.5 bg-slate-950/20 space-y-3">
          <div className="flex items-center gap-1.5">
            <FileUp className="h-3.5 w-3.5 text-orange-500" />
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">Médias et Documents joints</p>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            <div>
              <Label className="text-[9px] text-gray-500 uppercase">Image URL (JPEG, PNG, WebP)</Label>
              <Input className="mt-1 h-8 text-[11px] bg-slate-900 border-slate-800/80 text-white rounded-lg focus-visible:ring-orange-500"
                placeholder="https://images.unsplash.com/photo-..."
                value={mediaImageUrl} onChange={e => setMediaImageUrl(e.target.value)} />
            </div>
            <div>
              <Label className="text-[9px] text-gray-500 uppercase">Lien YouTube (Vidéo simulée)</Label>
              <Input className="mt-1 h-8 text-[11px] bg-slate-900 border-slate-800/80 text-white rounded-lg focus-visible:ring-orange-500"
                placeholder="https://youtube.com/watch?v=..."
                value={mediaYoutubeUrl} onChange={e => setMediaYoutubeUrl(e.target.value)} />
            </div>
            <div>
              <Label className="text-[9px] text-gray-500 uppercase">Rapport PDF simulé</Label>
              <Input className="mt-1 h-8 text-[11px] bg-slate-900 border-slate-800/80 text-white rounded-lg focus-visible:ring-orange-500"
                placeholder="https://surve.admin/rapport-incidents.pdf"
                value={mediaPdfUrl} onChange={e => setMediaPdfUrl(e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* Expiration Timer */}
      {!isCall && (
        <div className="space-y-1.5">
          <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Durée de validité (Minutes)
          </Label>
          <div className="flex items-center gap-2">
            <Input className="h-8 text-xs bg-slate-950/40 border-slate-800/80 focus-visible:ring-orange-500 text-white w-24 rounded-lg"
              type="number" min="1" placeholder="Infini"
              value={expiresIn} onChange={e => setExpiresIn(e.target.value)} />
            <span className="text-[10px] text-gray-500">Laissez vide pour pas d'expiration.</span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        className="w-full gap-2 font-semibold h-10 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-lg shadow-orange-950/40 transition-transform active:scale-95 duration-200"
        onClick={handleSend} disabled={isSending || !body.trim()}>
        <Icon className="h-4 w-4" />
        {isSending ? "Transmission..." : isCall
          ? `📞 Lancer l'appel vers ${realParticipants.find(p => p.id === selectedRecipients[0])?.displayName || "..."}`
          : `Diffuser l'inject ${channelConfig?.label}`}
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
    <div className={`bg-[#0e1726]/60 backdrop-blur-md border rounded-2xl p-4 transition-all duration-300 hover:border-orange-500/50 hover:shadow-lg relative overflow-hidden group shadow-md ${
      participant.isConnected ? "border-emerald-800/40 shadow-emerald-950/5" : "border-slate-800/80"
    }`}>
      {/* Decorative vertical connection state indicator */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${participant.isConnected ? "bg-emerald-500" : "bg-slate-700"}`} />

      <div className="flex items-center justify-between mb-3 pl-1">
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className={`flex w-2.5 h-2.5 rounded-full ${
              participant.isConnected 
                ? "bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" 
                : "bg-slate-600"
            }`} />
            {participant.isConnected && (
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping -top-0 -left-0" />
            )}
          </div>
          <p className="text-white text-sm font-semibold tracking-wide">{participant.displayName}</p>
        </div>
        {participant.isObserver ? (
          <Badge className="text-[10px] bg-slate-800 text-gray-400 rounded-lg">Observateur</Badge>
        ) : (
          <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">{participant.role}</span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2.5 text-center mt-4 bg-slate-950/20 p-2.5 rounded-xl border border-slate-900/60">
        <div>
          <p className="text-white text-sm font-bold">{participant.messagesReceived}</p>
          <p className="text-gray-500 text-[10px] uppercase font-semibold">Injects</p>
        </div>
        <div>
          <p className={`text-sm font-bold ${responseRate >= 70 ? "text-emerald-400" : responseRate >= 40 ? "text-amber-400" : "text-rose-400"}`}>
            {responseRate}%
          </p>
          <p className="text-gray-500 text-[10px] uppercase font-semibold">Réponses</p>
        </div>
        <div>
          <p className="text-white text-sm font-bold">
            {participant.avgResponseTime ? `${Math.round(participant.avgResponseTime)}s` : "—"}
          </p>
          <p className="text-gray-500 text-[10px] uppercase font-semibold">Délai moy.</p>
        </div>
      </div>

      {/* Visual meter */}
      {participant.messagesReceived > 0 && (
        <div className="w-full bg-slate-800/40 rounded-full h-1 mt-3 overflow-hidden">
          <div className={`h-full rounded-full ${
            responseRate >= 70 ? "bg-emerald-500" : responseRate >= 40 ? "bg-amber-500" : "bg-rose-500"
          }`} style={{ width: `${responseRate}%` }} />
        </div>
      )}

      {participant.missedMessages > 0 && (
        <div className="mt-3 text-[11px] text-rose-400/90 font-medium flex items-center gap-1">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{participant.missedMessages} inject(s) expiré(s) sans réponse</span>
        </div>
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
  session: { id: string; title: string; status: string; startedAt?: string | null; pausedAt?: string | null; durationMinutes?: number | null; crisisLog?: any[] };
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
    
    if (session.status === "PAUSED") {
      if (session.pausedAt) {
        setElapsed(Math.floor((new Date(session.pausedAt).getTime() - new Date(session.startedAt).getTime()) / 1000));
      } else {
        // Fallback: keep current elapsed static
      }
      return;
    }

    const t = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(session.startedAt!).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [session.startedAt, session.status, session.pausedAt]);

  // Poll loop
  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/sim/${session.id}?instructor=1&since=${lastPoll}`);
      if (!res.ok) return;
      const data = await res.json();
      setLastPoll(data.serverTime);
      if (data.session) {
        setSession(s => ({
          ...s,
          status: data.session.status,
          startedAt: data.session.startedAt,
          pausedAt: data.session.pausedAt,
        }));
      }
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
    onInjectSent: useCallback((data: unknown) => {
      const msg = data as Message;
      setMessages(prev => {
        if (prev.some((m: Message) => m.id === msg.id)) return prev;
        return [msg, ...prev];
      });
      if (msg.isFromParticipant) {
        toast.info(`📬 Nouveau message externe de ${msg.senderName}`);
      }
    }, []),
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
      const d = data as { participantId: string; displayName: string; role: string; isExternal?: boolean; simEmail?: string; simPhone?: string; isConnected?: boolean };
      toast.success(`👤 ${d.displayName} ${d.isExternal ? "créé (externe)" : "a rejoint la simulation"}`);
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
    if (r.success && r.data) {
      setSession(s => ({
        ...s,
        status: newStatus,
        startedAt: r.data.startedAt ? new Date(r.data.startedAt).toISOString() : null,
        pausedAt: r.data.pausedAt ? new Date(r.data.pausedAt).toISOString() : null,
      }));
      toast.success(`Session : ${newStatus}`);
    }
  }

  const statusBg: Record<string, string> = {
    SETUP: "bg-slate-700/80 border-slate-600 text-gray-300", 
    BRIEFING: "bg-blue-900/60 border-blue-700 text-blue-300 animate-pulse", 
    ACTIVE: "bg-emerald-950/60 border-emerald-700 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]",
    PAUSED: "bg-amber-950/60 border-amber-700 text-amber-400", 
    DEBRIEF: "bg-purple-950/60 border-purple-700 text-purple-300", 
    ENDED: "bg-slate-800 border-slate-700 text-slate-400",
  };

  const unread = messages.filter((m: Message) => m.readByIds?.length === 0).length;
  const unanswered = messages.filter((m: Message) => m.status !== "REPLIED" && m.status !== "MISSED").length;
  const connectedCount = participants.filter(p => p.isConnected && !p.isInstructor).length;
  const totalParticipants = participants.filter(p => !p.isInstructor).length;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-[#050914] via-[#091124] to-[#050914] text-white font-sans antialiased overflow-hidden">
      
      {/* Header — Control Room */}
      <div className="bg-[#0b0f19]/90 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4 flex items-center justify-between gap-6 shadow-md shadow-black/20 relative z-30">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-orange-950/30">S</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-orange-500 uppercase tracking-widest bg-orange-600/10 border border-orange-500/20 px-2 py-0.5 rounded-md">LIVE PANEL</span>
              <span className="text-[10px] text-gray-500 font-semibold">• CONTROL ROOM</span>
            </div>
            <h1 className="text-sm text-gray-300 font-semibold tracking-wide mt-0.5">{session.title}</h1>
          </div>
        </div>

        {/* Session KPIs */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 bg-slate-900/60 border border-slate-800/80 px-3.5 py-1.5 rounded-xl shadow-inner">
            <Users className="h-3.5 w-3.5 text-blue-400" />
            <div className="text-left pl-1">
              <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider leading-none">Participants</p>
              <p className="text-xs text-blue-400 font-bold mt-0.5 leading-none">{connectedCount}/{totalParticipants}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-slate-900/60 border border-slate-800/80 px-3.5 py-1.5 rounded-xl shadow-inner">
            <Mail className={`h-3.5 w-3.5 ${unread > 0 ? "text-rose-400 animate-bounce" : "text-gray-500"}`} />
            <div className="text-left pl-1">
              <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider leading-none">Non lus</p>
              <p className={`text-xs font-bold mt-0.5 leading-none ${unread > 0 ? "text-rose-400" : "text-gray-400"}`}>{unread}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-slate-900/60 border border-slate-800/80 px-3.5 py-1.5 rounded-xl shadow-inner">
            <MessageSquareText className="h-3.5 w-3.5 text-amber-400" />
            <div className="text-left pl-1">
              <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider leading-none">Sans réponse</p>
              <p className="text-xs text-amber-400 font-bold mt-0.5 leading-none">{unanswered}</p>
            </div>
          </div>
          {session.startedAt && (
            <div className="flex items-center gap-1 bg-slate-900/60 border border-slate-800/80 px-3.5 py-1.5 rounded-xl shadow-inner">
              <Timer className="h-3.5 w-3.5 text-orange-400 animate-pulse" />
              <div className="text-left pl-1">
                <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider leading-none">Temps écoulé</p>
                <p className="text-xs text-orange-400 font-mono font-bold mt-0.5 leading-none">{formatElapsed(elapsed)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Session Controls */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5 bg-slate-950/40 p-1 rounded-xl border border-slate-800/60">
            {session.status === "SETUP" && (
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white gap-1.5 h-8 rounded-lg text-xs font-medium"
                onClick={() => handleStatus("BRIEFING")}>
                <Eye className="h-3.5 w-3.5" /> Briefing
              </Button>
            )}
            {(session.status === "BRIEFING" || session.status === "ENDED") && (
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 h-8 rounded-lg text-xs font-medium"
                onClick={() => handleStatus("ACTIVE")}>
                <Play className="h-3.5 w-3.5" /> Démarrer
              </Button>
            )}
            {session.status === "ACTIVE" && (
              <>
                <Button size="sm" className="bg-amber-600 hover:bg-amber-500 text-white gap-1.5 h-8 rounded-lg text-xs font-medium"
                  onClick={() => handleStatus("PAUSED")}>
                  <Pause className="h-3.5 w-3.5" /> Pause
                </Button>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-500 text-white gap-1.5 h-8 rounded-lg text-xs font-medium"
                  onClick={() => handleStatus("DEBRIEF")}>
                  <Square className="h-3.5 w-3.5" /> Debrief
                </Button>
              </>
            )}
            {session.status === "PAUSED" && (
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 h-8 rounded-lg text-xs font-medium"
                onClick={() => handleStatus("ACTIVE")}>
                <Play className="h-3.5 w-3.5" /> Reprendre
              </Button>
            )}
            {session.status === "DEBRIEF" && (
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 h-8 rounded-lg text-xs font-medium"
                onClick={() => handleStatus("ACTIVE")}>
                <Play className="h-3.5 w-3.5" /> Relancer la simulation
              </Button>
            )}
          </div>
          <div className={`px-3.5 py-1.5 rounded-xl border text-[11px] font-bold uppercase tracking-wider ${statusBg[session.status] || "bg-gray-700 border-gray-600"}`}>
            {session.status}
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 relative z-20">
        
        {/* Left Panel — Inject Form */}
        <div className="w-[340px] border-r border-slate-800/80 overflow-y-auto p-4 flex-shrink-0 bg-[#060a13]/80 space-y-4 no-scrollbar">
          <InjectPanel
            session={session}
            participants={participants}
            onSent={poll}
          />
        </div>

        {/* Center — Content and Dynamic Switch Tabs */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-[#080d19]/40">
          
          {/* Custom Segmented Switch Tabs */}
          <div className="px-6 py-4 flex-shrink-0">
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-1 flex gap-1.5 overflow-x-auto no-scrollbar shadow-lg">
              {[
                { key: "feed", label: "Flux Injects", count: messages.length, icon: FileStack },
                { key: "participants", label: "Participants", count: connectedCount, icon: Users },
                { key: "calls", label: "Communications", count: calls.length, icon: PhoneCall },
                { key: "chat", label: "Chat Equipe", count: 0, icon: MessageSquareText },
                { key: "externes", label: "Acteurs Externes", count: 0, icon: Radio },
                { key: "crisis_log", label: "Main Courante", count: 0, icon: Shield },
                { key: "forms", label: "Formulaires", count: 0, icon: ListTodo },
              ].map(tab => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-950/20"
                        : "text-gray-400 hover:text-gray-200 hover:bg-slate-850/40"
                    }`}>
                    <TabIcon className="h-4 w-4" />
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className={`ml-1.5 text-[10px] px-2 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-slate-800 text-gray-300"}`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Render Tab Area */}
          <div className={`flex-1 min-h-0 ${activeTab === "chat" || activeTab === "externes" ? "p-0 overflow-hidden" : "px-6 pb-6 pt-2 overflow-y-auto"}`}>
            
            {/* FEED TAB */}
            {activeTab === "feed" && (
              <div className="space-y-4 max-w-4xl">
                {messages.map((msg: Message) => {
                  const replies = msg.replies || [];
                  const isRead = msg.readByIds?.length > 0;
                  const isReplied = msg.status === "REPLIED";
                  const currentChannel = CHANNELS.find(c => c.key === msg.channel);
                  const ChannelIcon = currentChannel?.icon || Mail;

                  return (
                    <div key={msg.id} className={`bg-[#0e1726]/40 backdrop-blur-md border rounded-2xl p-4 transition-all hover:bg-[#0e1726]/60 flex gap-4 ${
                      isReplied ? "border-emerald-500/30" : isRead ? "border-slate-800/80" : "border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.05)]"
                    }`}>
                      
                      {/* Left color bar */}
                      <div className="w-1 rounded-full flex-shrink-0" style={{ backgroundColor: currentChannel?.color || "#f97316" }} />

                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${currentChannel?.color}15` }}>
                              <ChannelIcon className="h-4 w-4" style={{ color: currentChannel?.color }} />
                            </div>
                            <span className="text-xs text-white font-semibold">{msg.channel}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-xs text-gray-400 font-medium">De: <span className="text-gray-300 font-semibold">{msg.senderName}</span></span>
                            
                            {msg.priority === "CRITICAL" && (
                              <span className="text-[10px] font-bold bg-rose-600/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded-md uppercase tracking-wider animate-pulse">CRITIQUE</span>
                            )}
                            {msg.priority === "HIGH" && (
                              <span className="text-[10px] font-bold bg-orange-600/10 border border-orange-500/20 text-orange-400 px-2 py-0.5 rounded-md uppercase tracking-wider">HAUTE</span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2.5 flex-shrink-0">
                            {isReplied ? (
                              <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Répondu
                              </span>
                            ) : isRead ? (
                              <span className="text-xs text-blue-400 font-semibold bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-lg">Lu</span>
                            ) : (
                              <span className="text-xs text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg animate-pulse">Reçu</span>
                            )}
                            <span className="text-[11px] text-gray-500 font-mono font-medium">{formatTime(msg.triggeredAt)}</span>
                          </div>
                        </div>

                        <div className="space-y-1.5 pl-0.5">
                          {msg.subject && <h4 className="text-gray-200 text-sm font-semibold tracking-wide break-all break-words">{msg.subject}</h4>}
                          <p className="text-gray-400 text-xs leading-relaxed whitespace-pre-wrap break-all break-words">{msg.body}</p>
                        </div>

                        {/* Replies Deck */}
                        {replies.length > 0 && (
                          <div className="pt-2 border-t border-slate-800/40 space-y-2 mt-3 pl-1">
                            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                              Réponse reçue en temps réel
                            </p>
                            {replies.map((r: Message) => (
                              <div key={r.id} className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-3.5 text-xs space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <p className="text-emerald-400 font-semibold">{r.participantName}</p>
                                  <span className="text-[10px] text-gray-500 font-mono">Délai: {r.responseTimeSeconds} secondes</span>
                                </div>
                                <p className="text-gray-300 leading-relaxed break-all break-words">{r.body}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {messages.length === 0 && (
                  <div className="text-center py-24 bg-slate-900/20 rounded-2xl border border-slate-800/40">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-slate-700 animate-pulse" />
                    <p className="text-gray-400 text-sm font-semibold tracking-wide">Console d'injects en veille</p>
                    <p className="text-gray-600 text-xs mt-1">Utilisez le panneau de gauche pour diffuser des injects ou lancer des appels.</p>
                  </div>
                )}
              </div>
            )}

            {/* PARTICIPANTS TAB */}
            {activeTab === "participants" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl">
                {participants.filter(p => !p.isInstructor).map((p: Participant) => (
                  <ParticipantCard key={p.id} participant={p} />
                ))}
              </div>
            )}

            {/* CALLS TAB */}
            {activeTab === "calls" && (
              <div className="space-y-4 max-w-4xl">
                {calls.map((call: Call) => (
                  <div key={call.id} className="bg-[#0e1726]/40 backdrop-blur-md border border-slate-850 rounded-2xl p-4 transition-all hover:bg-[#0e1726]/60 flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0">
                      <PhoneCall className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <p className="text-white text-sm font-semibold tracking-wide">{call.callerName} → {call.recipientName}</p>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border ${
                            call.status === "ACTIVE" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 animate-pulse" :
                            call.status === "COMPLETED" ? "bg-slate-800 border-slate-700 text-slate-400" :
                            call.status === "MISSED" ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : 
                            "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          }`}>{call.status}</span>
                        </div>
                        <span className="text-[11px] text-gray-500 font-mono font-medium">{formatTime(call.createdAt)}</span>
                      </div>

                      {call.status === "RINGING" && (
                        <div className="flex gap-2 pt-1">
                          <Button size="sm" className="h-8 text-xs bg-rose-600 hover:bg-rose-500 text-white rounded-lg px-3.5 gap-1.5"
                            onClick={async () => {
                              await updateCall(call.id, { status: "MISSED", missedReason: "Participant n'a pas répondu" });
                              poll();
                            }}>
                              <X className="h-3.5 w-3.5" /> Raccrocher / Classer manqué
                          </Button>
                        </div>
                      )}
                      
                      {call.transcript && (
                        <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3 text-xs text-gray-300">
                          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">Transcription en direct</p>
                          <p className="leading-relaxed whitespace-pre-wrap">{call.transcript}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {calls.length === 0 && (
                  <div className="text-center py-24 bg-slate-900/20 rounded-2xl border border-slate-800/40">
                    <Phone className="h-12 w-12 mx-auto mb-4 text-slate-700" />
                    <p className="text-gray-400 text-sm font-semibold tracking-wide">Aucun appel passé</p>
                    <p className="text-gray-600 text-xs mt-1">Les enregistrements d'appels et transcriptions s'afficheront ici en direct.</p>
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

            {/* EXTERNAL ACTORS TAB */}
            {activeTab === "externes" && (
              <InstructorExternalActorsMonitor sessionId={session.id} participants={participants} initialMessages={messages} onUpdate={poll} />
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

        {/* Right Panel — Animated Timeline Log */}
        <div className="w-[300px] border-l border-slate-800/80 overflow-y-auto p-4 flex-shrink-0 bg-[#060a13]/80 space-y-4 no-scrollbar">
          <div className="pb-3 border-b border-slate-800/60">
            <p className="text-xs text-orange-500 uppercase font-bold tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316] animate-ping" />
              Main Courante V2
            </p>
            <p className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase mt-0.5">Activité de l'exercice</p>
          </div>
          
          <div className="relative pl-1">
            {/* Timeline line */}
            <div className="absolute left-3 top-2 bottom-2 w-px bg-slate-800" />
            
            <div className="space-y-4">
              {events.slice(0, 30).map((event: Event) => (
                <div key={event.id} className="relative flex gap-4 pl-7 text-xs group">
                  {/* Bullet */}
                  <div className="absolute left-[9px] top-1.5 w-2 h-2 rounded-full bg-orange-600/30 border border-orange-500 shadow-sm transition-transform duration-300 group-hover:scale-125" />
                  
                  <div className="flex-1 space-y-1">
                    <p className="text-[10px] text-gray-500 font-mono font-medium">{formatTime(event.occurredAt)}</p>
                    <p className="text-gray-300 leading-normal font-medium">{event.description}</p>
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <div className="text-center py-8 text-gray-600 text-xs">
                  Aucun événement enregistré.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
