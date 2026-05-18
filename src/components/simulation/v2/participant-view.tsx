"use client";

import { useState, useEffect, useRef, useCallback, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Mail, Phone, MessageSquare, Bell, Zap, FileText,
  Globe, Radio, Send, CheckCircle2,
  Clock, PhoneIncoming, PhoneMissed, Mic, MicOff,
  Shield, FileStack, ListTodo, MessageSquareText, Users, Forward,
  Award, Sparkles, TrendingUp, ThumbsUp, ChevronDown, ChevronRight, Pause
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import CrisisLogPanel from "./crisis-log-panel";
import CrisisDocsPanel from "./crisis-docs-panel";
import ChatPanel from "./chat-panel";
import ExternalChatPanel from "./external-chat-panel";
import { replyToMessage, markMessageRead, logSimEvent, markParticipantConnected, updateCall, forwardSimMessage } from "@/actions/simulation/sim-session-actions";
import { getParticipantScoreForSimulation } from "@/actions/simulation/analysis-actions";
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

// ─── Web Audio API Sound Synthesizer ──────────────────────────────────────────
class SoundEffects {
  private audioCtx: AudioContext | null = null;
  private ringtoneInterval: NodeJS.Timeout | null = null;

  private initCtx() {
    if (!this.audioCtx) {
      const AudioCtxClass = typeof window !== "undefined" && ((window as any).AudioContext || (window as any).webkitAudioContext);
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Elegant two-tone chime for normal injects
  playChime() {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Tone 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, now); // D5
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.15, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc1.start(now);
      osc1.stop(now + 0.5);

      // Tone 2
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, now + 0.12); // A5
      gain2.gain.setValueAtTime(0, now + 0.12);
      gain2.gain.linearRampToValueAtTime(0.15, now + 0.17);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.65);
    } catch (e) {
      console.warn("Audio synthesis failed:", e);
    }
  }

  // Urgent double siren beep for critical alerts
  playCriticalAlarm() {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Sound 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.type = "triangle";
      osc1.frequency.setValueAtTime(880, now); // A5
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.2, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Sound 2
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(880, now + 0.4); // A5
      gain2.gain.setValueAtTime(0, now + 0.4);
      gain2.gain.linearRampToValueAtTime(0.2, now + 0.45);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc2.start(now + 0.4);
      osc2.stop(now + 0.75);
    } catch (e) {
      console.warn("Audio synthesis failed:", e);
    }
  }

  // Modern Corporate Digital Office Ringtone (Teams-like clean chimes)
  startPhoneRingtone() {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      this.stopPhoneRingtone();

      const playRing = () => {
        const now = ctx.currentTime;

        // Modern office digital melody notes
        const notes = [
          // First triplet bounce
          { time: 0.00, freq: 932.33, dur: 0.08 },  // Bb5
          { time: 0.08, freq: 1046.50, dur: 0.08 }, // C6
          { time: 0.16, freq: 1396.91, dur: 0.15 }, // F6

          { time: 0.35, freq: 932.33, dur: 0.08 },  // Bb5
          { time: 0.43, freq: 1046.50, dur: 0.08 }, // C6
          { time: 0.51, freq: 1396.91, dur: 0.25 }, // F6

          // Ascending response
          { time: 0.85, freq: 1046.50, dur: 0.08 }, // C6
          { time: 0.93, freq: 1174.66, dur: 0.08 }, // D6
          { time: 1.01, freq: 1567.98, dur: 0.30 }, // G6

          // Secondary echo
          { time: 1.50, freq: 1396.91, dur: 0.10 }, // F6
          { time: 1.60, freq: 1174.66, dur: 0.10 }, // D6
          { time: 1.70, freq: 1046.50, dur: 0.35 }  // C6
        ];

        notes.forEach(note => {
          const oscNode = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          // Pure sine wave for a crystal-clear digital chime
          oscNode.type = "sine";
          oscNode.frequency.setValueAtTime(note.freq, now + note.time);
          
          // Add a soft triangle sub-harmonic for fullness
          const subOsc = ctx.createOscillator();
          const subGain = ctx.createGain();
          subOsc.type = "triangle";
          subOsc.frequency.setValueAtTime(note.freq / 2, now + note.time);

          oscNode.connect(gainNode);
          gainNode.connect(ctx.destination);

          subOsc.connect(subGain);
          subGain.connect(ctx.destination);

          // Volume envelopes
          gainNode.gain.setValueAtTime(0, now + note.time);
          gainNode.gain.linearRampToValueAtTime(0.12, now + note.time + 0.008);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.dur);

          subGain.gain.setValueAtTime(0, now + note.time);
          subGain.gain.linearRampToValueAtTime(0.03, now + note.time + 0.015);
          subGain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.dur);

          oscNode.start(now + note.time);
          oscNode.stop(now + note.time + note.dur + 0.05);

          subOsc.start(now + note.time);
          subOsc.stop(now + note.time + note.dur + 0.05);
        });
      };

      playRing();

      // Loop every 2.8 seconds
      this.ringtoneInterval = setInterval(() => {
        playRing();
      }, 2800);

    } catch (e) {
      console.warn("Ringtone failed to start:", e);
    }
  }

  stopPhoneRingtone() {
    if (this.ringtoneInterval) {
      clearInterval(this.ringtoneInterval);
      this.ringtoneInterval = null;
    }
  }
}

const sounds = new SoundEffects();

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

// ─── Embeds Parser & Media Display ───────────────────────────────────────────
interface EmbedMedia {
  type: "image" | "youtube" | "pdf" | "drive";
  url: string;
  youtubeId?: string;
}

function parseEmbeds(text: string): EmbedMedia[] {
  if (!text) return [];
  const embeds: EmbedMedia[] = [];
  const foundUrls = new Set<string>();

  // Extract all URLs
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  let match;
  while ((match = urlRegex.exec(text)) !== null) {
    let url = match[1];
    
    // Clean trailing punctuation if any (like commas, periods, parentheses at the end of URL in text)
    url = url.replace(/[.,;:)\]]+$/, "");
    
    if (foundUrls.has(url)) continue;
    foundUrls.add(url);

    const lowerUrl = url.toLowerCase();

    // 1. Check YouTube
    const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
    const ytMatch = ytRegex.exec(url);
    if (ytMatch) {
      embeds.push({
        type: "youtube",
        url,
        youtubeId: ytMatch[1]
      });
      continue;
    }

    // 2. Check PDF
    if (lowerUrl.includes(".pdf")) {
      embeds.push({
        type: "pdf",
        url
      });
      continue;
    }

    // 3. Check Google Drive
    if (lowerUrl.includes("drive.google.com")) {
      embeds.push({
        type: "drive",
        url
      });
      continue;
    }

    // 4. Check Image
    const isImage = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff)(\?|$)/i.test(lowerUrl) ||
                    [
                      "bing.net/th",
                      "googleusercontent.com",
                      "unsplash.com/photo-",
                      "images.unsplash.com",
                      "images.pexels.com",
                      "pixabay.com/get/",
                      "i.imgur.com"
                    ].some(host => lowerUrl.includes(host));
    if (isImage) {
      embeds.push({
        type: "image",
        url
      });
      continue;
    }
  }

  return embeds;
}

function MessageEmbeds({ text }: { text: string }) {
  const embeds = parseEmbeds(text);
  if (embeds.length === 0) return null;

  return (
    <div className="mt-3 space-y-3">
      {embeds.map((embed, idx) => {
        if (embed.type === "youtube" && embed.youtubeId) {
          return (
            <div key={idx} className="relative aspect-video w-full max-w-lg rounded-xl overflow-hidden border border-gray-800 shadow-md bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${embed.youtubeId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          );
        }
        if (embed.type === "image") {
          return (
            <div key={idx} className="relative max-w-lg rounded-xl overflow-hidden border border-gray-800 shadow-md bg-gray-950 group">
              <img
                src={embed.url}
                alt="Embedded media"
                className="w-full h-auto max-h-[300px] object-contain transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <a
                href={embed.url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-lg text-[10px] font-semibold transition-colors flex items-center gap-1 backdrop-blur-sm"
              >
                👁️ Ouvrir
              </a>
            </div>
          );
        }
        if (embed.type === "pdf") {
          return (
            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-800 rounded-xl max-w-lg shadow-sm hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-red-950/40 text-red-400 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-200 truncate">Document PDF Joint</p>
                <p className="text-[10px] text-gray-500 truncate">{embed.url}</p>
              </div>
              <a
                href={embed.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-colors flex-shrink-0"
              >
                📥 Ouvrir
              </a>
            </div>
          );
        }
        if (embed.type === "drive") {
          const previewUrl = getGoogleDrivePreviewUrl(embed.url);
          return (
            <div key={idx} className="relative w-full max-w-2xl rounded-xl overflow-hidden border border-gray-800 bg-gray-950 shadow-md">
              <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-gray-800 text-[10px] md:text-xs">
                <div className="flex items-center gap-2 text-blue-400 font-semibold">
                  <FileText className="h-4 w-4" />
                  <span>Aperçu Document Google Drive</span>
                </div>
                <a
                  href={embed.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800 hover:bg-gray-700 text-white px-2.5 py-1 rounded text-[10px] font-semibold transition-colors flex items-center gap-1"
                >
                  👁️ Plein Écran
                </a>
              </div>
              <div className="w-full h-[450px] bg-gray-900">
                <iframe
                  src={previewUrl}
                  className="w-full h-full border-0"
                  allow="autoplay"
                  title="Google Drive File Preview"
                />
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

function getGoogleDrivePreviewUrl(url: string): string {
  const match = /\/file\/d\/([a-zA-Z0-9_-]+)/.exec(url);
  if (match && match[1]) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  const idMatch = /[?&]id=([a-zA-Z0-9_-]+)/.exec(url);
  if (idMatch && idMatch[1]) {
    return `https://drive.google.com/file/d/${idMatch[1]}/preview`;
  }
  return url;
}

function cleanMessageBody(text: string): string {
  if (!text) return "";
  const embeds = parseEmbeds(text);
  let cleaned = text;
  
  // Sort embeds by URL length descending to avoid partial matches
  const sortedEmbeds = [...embeds].sort((a, b) => b.url.length - a.url.length);
  
  for (const embed of sortedEmbeds) {
    const escapedUrl = embed.url.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\s*${escapedUrl}\\s*`, "gi");
    cleaned = cleaned.replace(regex, "\n");
  }
  
  return cleaned.replace(/\n{2,}/g, "\n\n").trim();
}

// ─── Message Thread ───────────────────────────────────────────────────────────
function MessageThread({ message, participantId, participantName, sessionId, onReplied, participants = [] }: {
  message: Msg; participantId: string; participantName: string;
  sessionId: string; onReplied: () => void; participants?: any[];
}) {
  const [replyText, setReplyText] = useState("");
  const [showReply, setShowReply] = useState(false);
  const [showForward, setShowForward] = useState(false);
  const [forwardNote, setForwardNote] = useState("");
  const [selectedForwardIds, setSelectedForwardIds] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isForwarding, setIsForwarding] = useState(false);

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

  async function handleForward() {
    if (selectedForwardIds.length === 0 || isForwarding) return;
    setIsForwarding(true);

    const r = await forwardSimMessage({
      messageId: message.id,
      sessionId,
      senderParticipantId: participantId,
      senderParticipantName: participantName,
      targetParticipantIds: selectedForwardIds,
      noteText: forwardNote,
    });

    if (r.success) {
      toast.success("Message transféré avec succès !");
      setShowForward(false);
      setForwardNote("");
      setSelectedForwardIds([]);
    } else {
      toast.error(r.error || "Erreur lors du transfert");
    }
    setIsForwarding(false);
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
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap break-all break-words">{cleanMessageBody(message.body)}</p>
            <MessageEmbeds text={message.body} />

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
            {showReply && (
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
            )}

            {/* Forward/Transfer area */}
            {showForward && (
              <div className="mt-4 p-3 bg-gray-950/60 rounded-xl border border-gray-800 space-y-3">
                <div className="flex items-center justify-between border-b border-gray-800/80 pb-2">
                  <p className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                    <Forward className="h-3.5 w-3.5 text-blue-500" />
                    Transférer ce message
                  </p>
                  {selectedForwardIds.length > 0 && (
                    <button
                      onClick={() => setSelectedForwardIds([])}
                      className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      Effacer la sélection
                    </button>
                  )}
                </div>

                {/* Participant list checkboxes */}
                <div className="space-y-1.5">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Sélectionner les destinataires</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                    {participants
                      .filter((p: any) => p.id !== participantId && !p.isInstructor && !p.isExternal)
                      .map((p: any) => {
                        const isChecked = selectedForwardIds.includes(p.id);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              if (isChecked) {
                                setSelectedForwardIds(prev => prev.filter(id => id !== p.id));
                              } else {
                                setSelectedForwardIds(prev => [...prev, p.id]);
                              }
                            }}
                            className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${
                              isChecked
                                ? "bg-blue-600/10 border-blue-500/40 text-blue-200"
                                : "bg-gray-900/40 border-gray-800/60 hover:bg-gray-800 text-gray-400"
                            }`}
                          >
                            <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                              isChecked ? "bg-blue-600 border-blue-500 text-white" : "border-gray-700 bg-gray-900"
                            }`}>
                              {isChecked && <span className="text-[9px] font-bold leading-none">✓</span>}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold truncate text-white">{p.displayName}</p>
                              <p className="text-[9px] opacity-70 truncate">{p.role}</p>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* Optional note */}
                <div className="space-y-1.5">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Note personnelle (optionnelle)</p>
                  <Textarea
                    className="bg-gray-800 border-gray-700 text-white text-xs resize-none placeholder-gray-500 min-h-[50px] max-h-[80px]"
                    placeholder="Ajouter une note d'accompagnement..."
                    value={forwardNote}
                    onChange={e => setForwardNote(e.target.value)}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs text-gray-400 hover:text-white"
                    onClick={() => {
                      setShowForward(false);
                      setForwardNote("");
                      setSelectedForwardIds([]);
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 text-xs text-white font-bold bg-blue-600 hover:bg-blue-700"
                    disabled={selectedForwardIds.length === 0 || isForwarding}
                    onClick={handleForward}
                  >
                    {isForwarding ? "Transfert..." : `Transférer (${selectedForwardIds.length})`}
                  </Button>
                </div>
              </div>
            )}

            {/* Action buttons */}
            {!showReply && !showForward && (
              <div className="flex gap-2 mt-2">
                {!hasReplied && (
                  <Button size="sm" variant="ghost"
                    className="h-8 text-xs gap-1.5 text-gray-400 hover:text-white hover:bg-gray-800 px-3"
                    onClick={() => setShowReply(true)}>
                    <Send className="h-3.5 w-3.5" />
                    Répondre
                  </Button>
                )}
                <Button size="sm" variant="ghost"
                  className="h-8 text-xs gap-1.5 text-gray-400 hover:text-white hover:bg-gray-800 px-3"
                  onClick={() => setShowForward(true)}>
                  <Forward className="h-3.5 w-3.5 animate-pulse" />
                  Transférer
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Bilan de Performance Individuel ──────────────────────────────────────────
function BilanPerformance({ scoreData, loading, onRefresh }: { scoreData: any; loading: boolean; onRefresh: () => void }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          <Sparkles className="absolute inset-0 m-auto h-5 w-5 text-amber-400 animate-pulse" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Génération de votre bilan en cours</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Notre IA analyse vos décisions, la tonalité de vos messages et votre réactivité pour dresser votre profil de gestion de crise...
          </p>
        </div>
      </div>
    );
  }

  const score = scoreData?.score;
  const injectResponses = scoreData?.injectResponses || [];

  if (!score) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <Award className="h-12 w-12 text-slate-500 opacity-45 animate-pulse" />
        <div>
          <h3 className="text-base font-semibold text-slate-350">Aucun bilan disponible pour le moment</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
            L'analyse automatisée de votre performance sera disponible dès que l'instructeur aura déclenché le debrief.
          </p>
        </div>
        <Button onClick={onRefresh} className="h-8 text-xs bg-slate-800 hover:bg-slate-750 text-white font-medium border border-slate-700/80">
          Actualiser mon bilan
        </Button>
      </div>
    );
  }

  const chartData = [
    { subject: "Conformité Plan", score: score.scoreConformity || 0 },
    { subject: "Réactivité", score: score.scoreTimeliness || 0 },
    { subject: "Décisions", score: score.scoreDecision || 0 },
    { subject: "Communication", score: score.scoreCommunication || 0 },
    { subject: "Gestion Stress", score: score.scoreTonality || 0 },
    { subject: "Leadership", score: score.scoreLeadership || 0 },
  ];

  // Level config matching the colors
  const levels = {
    EXCELLENT: { label: "Excellent", color: "text-green-400 border-green-900/40 bg-green-950/20" },
    GOOD: { label: "Bon", color: "text-blue-400 border-blue-900/40 bg-blue-950/20" },
    ACCEPTABLE: { label: "Acceptable", color: "text-amber-400 border-amber-900/40 bg-amber-950/20" },
    INSUFFICIENT: { label: "Insuffisant", color: "text-orange-400 border-orange-900/40 bg-orange-950/20" },
    CRITICAL: { label: "Critique", color: "text-red-400 border-red-900/40 bg-red-950/20" },
  };
  const lvl = levels[score.level as keyof typeof levels] || levels.ACCEPTABLE;

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-2 md:p-4 pb-20">
      {/* Executive banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/20 p-5 md:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.45)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              <span className="text-xs font-mono tracking-wider uppercase text-amber-500 font-semibold">Bilan Individuel</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Votre Diagnostic de Gestion de Crise</h2>
            <p className="text-xs text-slate-400 font-medium">Analyse et évaluation comportementale sous stress opérationnel</p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/40 border border-slate-800/80 p-3 rounded-2xl self-start md:self-auto shadow-sm">
            <div className="text-right">
              <p className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-medium">Score Global</p>
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-3xl font-extrabold font-mono text-white tracking-tighter">{score.scoreGlobal}</span>
                <span className="text-sm text-slate-500">/100</span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <Badge className={`text-xs px-2.5 py-1 rounded-xl font-semibold border ${lvl.color}`}>
              {lvl.label}
            </Badge>
          </div>
        </div>

        {score.aiNarrative && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 text-sm italic text-slate-300 leading-relaxed font-sans pl-3 border-l-2 border-l-amber-500/65">
            "{score.aiNarrative}"
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Performance */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/10 p-4 md:p-5 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <div>
            <h3 className="text-sm font-semibold text-white mb-0.5">Radar des Compétences</h3>
            <p className="text-xs text-slate-500 mb-4">Aperçu dimensionnel de vos aptitudes clés</p>
          </div>

          <div className="w-full h-[280px] sm:h-[320px] flex items-center justify-center overflow-visible">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 500 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 8 }} />
                <Radar
                  name="Mon Score"
                  dataKey="score"
                  stroke="#DA7757"
                  fill="#DA7757"
                  fillOpacity={0.25}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Competency list with bars */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/10 p-4 md:p-5 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <div>
            <h3 className="text-sm font-semibold text-white mb-0.5">Détail des Aptitudes</h3>
            <p className="text-xs text-slate-500 mb-4">Scores individuels par composante évaluée</p>
          </div>

          <div className="space-y-3.5 flex-1 justify-center flex flex-col">
            {chartData.map((d) => {
              const val = d.score;
              const color = val >= 80 ? "bg-green-500" : val >= 60 ? "bg-blue-500" : val >= 45 ? "bg-amber-500" : "bg-red-500";
              const text = val >= 80 ? "text-green-400" : val >= 60 ? "text-blue-400" : val >= 45 ? "text-amber-400" : "text-red-400";
              return (
                <div key={d.subject} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{d.subject}</span>
                    <span className={`font-mono font-bold ${text}`}>{val}%</span>
                  </div>
                  <div className="h-2 bg-slate-950/80 border border-slate-900 rounded-full overflow-hidden p-0.5">
                    <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${val}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/10 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-green-400">
            <ThumbsUp className="h-4.5 w-4.5" />
            <h3 className="text-sm font-semibold text-white">Points Forts</h3>
          </div>
          {score.strengths?.length > 0 ? (
            <ul className="space-y-2">
              {score.strengths.map((str: string, i: number) => (
                <li key={i} className="text-xs text-slate-350 flex items-start gap-2 leading-relaxed">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic">Aucun point fort spécifique consigné.</p>
          )}
        </div>

        {/* Weaknesses */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/10 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-amber-500">
            <TrendingUp className="h-4.5 w-4.5" />
            <h3 className="text-sm font-semibold text-white">Axes d'Amélioration</h3>
          </div>
          {score.weaknesses?.length > 0 ? (
            <ul className="space-y-2">
              {score.weaknesses.map((weak: string, i: number) => (
                <li key={i} className="text-xs text-slate-350 flex items-start gap-2 leading-relaxed">
                  <span className="text-amber-500 mt-0.5 flex-shrink-0">→</span>
                  <span>{weak}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic">Aucun axe d'amélioration spécifique consigné.</p>
          )}
        </div>
      </div>

      {/* Injects logs timeline summary */}
      {injectResponses.length > 0 && (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/10 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-white mb-0.5">Historique des Injectes Évalués</h3>
            <p className="text-xs text-slate-500">Conformité et réactivité sur vos décisions directes</p>
          </div>

          <div className="space-y-2">
            {injectResponses.map((r: any) => {
              const confColors = {
                CONFORMANT: "text-green-400 bg-green-950/20 border-green-900/40",
                PARTIAL: "text-amber-400 bg-amber-950/20 border-amber-900/40",
                NON_CONFORMANT: "text-red-400 bg-red-950/20 border-red-900/40",
                NOT_APPLICABLE: "text-slate-400 bg-slate-900/20 border-slate-850",
              };
              const c = confColors[r.conformity as keyof typeof confColors] || confColors.NOT_APPLICABLE;
              return (
                <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 border border-slate-850 bg-[#0e1726]/10 rounded-xl">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-white">Injecte #{r.injectionId.slice(-4)}</p>
                    {r.actualAction && <p className="text-[11px] text-slate-400 truncate max-w-lg">{r.actualAction}</p>}
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {r.reactionDelayMin != null && (
                      <span className="text-[10px] font-mono bg-slate-850 px-2 py-0.5 rounded text-slate-400">
                        {r.reactionDelayMin} min
                      </span>
                    )}
                    <span className="text-[10px] font-mono bg-slate-850 px-2 py-0.5 rounded text-slate-400">
                      Score: {r.conformityScore || 0}%
                    </span>
                    <Badge className={`text-[10px] border px-2 py-0 font-medium rounded-full ${c}`}>
                      {r.conformity === "CONFORMANT" ? "Conforme" : r.conformity === "PARTIAL" ? "Partiel" : r.conformity === "NON_CONFORMANT" ? "Non-Conforme" : "N/A"}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
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
  session: { id: string; title: string; status: string; wsRoomId: string; startedAt?: string | null; pausedAt?: string | null; durationMinutes?: number | null; simulationId?: string; participants?: any[]; crisisLog?: any[]; };
  participant: { id: string; displayName: string; role: string; team?: string | null; simEmail?: string | null; simPhone?: string | null };
  initialMessages: Msg[];
  initialCalls: Call[];
}) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [calls, setCalls] = useState<Call[]>(initialCalls);
  const [participants, setParticipants] = useState<any[]>(session.participants || []);
  const [incomingCall, setIncomingCall] = useState<Call | null>(null);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [sessionStatus, setSessionStatus] = useState(session.status);
  const [startedAt, setStartedAt] = useState<string | null>(session.startedAt || null);
  const [pausedAt, setPausedAt] = useState<string | null>(session.pausedAt || null);
  const [activeChannel, setActiveChannel] = useState<string>(
    session.status === "DEBRIEF" || session.status === "ENDED" ? "PERFORMANCE" : "ALL"
  );
  const [elapsed, setElapsed] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const lastPollRef = useRef(new Date().toISOString());
  const hasPusher = !!process.env.NEXT_PUBLIC_PUSHER_KEY;

  const [scoreData, setScoreData] = useState<any>(null);
  const [loadingScore, setLoadingScore] = useState(false);

  const loadScore = useCallback(async () => {
    if (!session.simulationId) return;
    setLoadingScore(true);
    const r = await getParticipantScoreForSimulation(session.simulationId, participant.id);
    if (r.success && r.data) {
      setScoreData(r.data);
    }
    setLoadingScore(false);
  }, [session.simulationId, participant.id]);

  useEffect(() => {
    if (sessionStatus === "DEBRIEF" || sessionStatus === "ENDED" || activeChannel === "PERFORMANCE") {
      loadScore();
    }
  }, [sessionStatus, activeChannel, loadScore]);

  // Fallback scoring polling when score is not ready yet
  useEffect(() => {
    if ((sessionStatus === "DEBRIEF" || sessionStatus === "ENDED" || activeChannel === "PERFORMANCE") && !scoreData && !loadingScore) {
      const t = setInterval(() => {
        loadScore();
      }, 5000);
      return () => clearInterval(t);
    }
  }, [sessionStatus, activeChannel, scoreData, loadingScore, loadScore]);

  // Register as connected on mount
  useEffect(() => {
    markParticipantConnected(participant.id, true, session.id);
    setIsConnected(true);
    return () => {
      markParticipantConnected(participant.id, false, session.id);
      sounds.stopPhoneRingtone();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Elapsed timer
  useEffect(() => {
    if (!startedAt) return;
    
    if (sessionStatus === "PAUSED") {
      if (pausedAt) {
        setElapsed(Math.floor((new Date(pausedAt).getTime() - new Date(startedAt).getTime()) / 1000));
      } else {
        // Fallback: keep current elapsed static
      }
      return;
    }

    const t = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [startedAt, sessionStatus, pausedAt]);

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
      
      // Play sound
      if (msg.priority === "CRITICAL" || msg.priority === "HIGH") {
        sounds.playCriticalAlarm();
      } else {
        sounds.playChime();
      }

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
      sounds.playCriticalAlarm();
      toast.error(`🚨 ALERTE CRITIQUE — ${msg.senderName}: ${msg.body}`, {
        duration: 30000,
      });
      setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [{ ...msg, replies: [] }, ...prev]);
    }, []),
    onSessionStatus: useCallback((data: unknown) => {
      const d = data as { status: string; startedAt?: string | null; pausedAt?: string | null };
      setSessionStatus(d.status);
      if (d.startedAt !== undefined) setStartedAt(d.startedAt);
      if (d.pausedAt !== undefined) setPausedAt(d.pausedAt);
      if (d.status === "ACTIVE") {
        toast.success("🚀 La simulation a été relancée !");
        setActiveChannel("ALL");
      }
      if (d.status === "PAUSED") toast.info("⏸ Simulation en pause");
      if (d.status === "DEBRIEF") {
        toast.info("📋 Passage en phase debrief");
        setActiveChannel("PERFORMANCE");
      }
      if (d.status === "ENDED") {
        setActiveChannel("PERFORMANCE");
      }
    }, []),
    onIncomingCall: useCallback((data: unknown) => {
      const call = data as Call;
      setIncomingCall(call);
      sounds.startPhoneRingtone();
    }, []),
    onCallUpdated: useCallback((data: unknown) => {
      const d = data as { callId: string; status: string };
      if (d.status === "MISSED") {
        setIncomingCall(null);
        sounds.stopPhoneRingtone();
      }
    }, []),
    onScoreReady: useCallback(() => {
      toast.success("✨ Votre bilan de performance individuel est prêt !");
      loadScore();
    }, [loadScore]),
    onFormAvailable: useCallback((data: unknown) => {
      const d = data as { formId: string; type: string; title: string; urgent?: boolean };
      toast.info(`📝 Nouveau questionnaire disponible : ${d.title}`, {
        duration: 15000,
      });
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
                if (m.priority === "CRITICAL" || m.priority === "HIGH") sounds.playCriticalAlarm();
                else sounds.playChime();

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
            if (c.recipientId === participant.id && c.status === "RINGING" && !incomingCall) {
              setIncomingCall(c);
              sounds.startPhoneRingtone();
            }
          });
        }
        if (data.session?.status) {
          setSessionStatus(prev => {
            if (prev !== data.session.status) {
              if (data.session.status === "DEBRIEF" || data.session.status === "ENDED") {
                setActiveChannel("PERFORMANCE");
              }
            }
            return data.session.status;
          });
          if (data.session.startedAt) setStartedAt(data.session.startedAt);
          if (data.session.pausedAt) setPausedAt(data.session.pausedAt);
        }
      } catch {}
    };

    pollRef.current = setInterval(poll, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPusher]);

  async function handleAnswerCall(call: Call) {
    sounds.stopPhoneRingtone();
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
    sounds.stopPhoneRingtone();
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

      {/* Session paused modal overlay */}
      {sessionStatus === "PAUSED" && (
        <div className="fixed inset-0 z-[9999] bg-[#050914]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e1628]/95 border border-amber-500/30 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-[0_0_50px_rgba(245,158,11,0.15)] animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 animate-pulse">
              <Pause className="h-8 w-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-white tracking-wide uppercase">Simulation Suspendue</h2>
              <p className="text-xs font-bold text-amber-500 uppercase tracking-widest">Briefing en cours</p>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              L'instructeur a suspendu temporairement l'exercice pour un briefing ou une pause technique.
              Vos accès et communications sont gelés. Veuillez patienter...
            </p>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b] animate-ping" />
              <span className="font-semibold tracking-wider uppercase font-mono">En attente de reprise...</span>
            </div>
          </div>
        </div>
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

          <div className="mt-auto pt-3 border-t border-slate-800/80 px-2 space-y-1">
            {(sessionStatus === "DEBRIEF" || sessionStatus === "ENDED" || scoreData) && (
              <button onClick={() => setActiveChannel("PERFORMANCE")} className={`flex items-center gap-2 px-3 py-2 w-full text-left rounded-lg text-sm font-semibold transition-all border border-amber-500/25 mb-1.5 ${activeChannel === "PERFORMANCE" ? "bg-amber-500/20 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.15)]" : "text-amber-400/90 hover:bg-amber-500/10"}`}>
                <Award className="h-4 w-4 flex-shrink-0 text-amber-400" /> <span className="truncate">Bilan & Performance</span>
              </button>
            )}
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
            
            <div className="mt-4 pt-2 border-t border-slate-800/80 space-y-1">
              <p className="text-xs text-gray-650">Mes coordonnées sim.</p>
              {participant.simEmail && (
                <p className="text-xs text-gray-650 truncate" title={participant.simEmail}>
                  📧 {participant.simEmail}
                </p>
              )}
              {participant.simPhone && (
                <p className="text-xs text-gray-650">📞 {participant.simPhone}</p>
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
            {(sessionStatus === "DEBRIEF" || sessionStatus === "ENDED" || scoreData) && (
              <button onClick={() => setActiveChannel("PERFORMANCE")} className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border border-amber-500/35 ${activeChannel === "PERFORMANCE" ? "bg-amber-500/20 text-amber-200" : "bg-gray-800 text-amber-400"}`}>
                <Award className="h-3.5 w-3.5 text-amber-400" /> Bilan
              </button>
            )}
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
          <div className={`flex-1 space-y-3 ${activeCall ? "pb-52" : ""} ${activeChannel === "CHAT" || activeChannel === "EXTERNAL_CHAT" ? "p-0 overflow-hidden" : "p-4 overflow-y-auto"}`}>
            {activeChannel === "CHAT" ? (
              <ChatPanel sessionId={session.id} participant={participant} allParticipants={participants} />
            ) : activeChannel === "EXTERNAL_CHAT" ? (
              <ExternalChatPanel sessionId={session.id} participant={participant} participants={participants} initialMessages={messages} />
            ) : activeChannel === "CRISIS_LOG" ? (
              <CrisisLogPanel sessionId={session.id} participant={participant} initialEntries={session.crisisLog || []} />
            ) : activeChannel === "CRISIS_DOCS" ? (
              <CrisisDocsPanel sessionId={session.id} simulationId={session.simulationId || ""} participant={participant} />
            ) : activeChannel === "PERFORMANCE" ? (
              <BilanPerformance scoreData={scoreData} loading={loadingScore} onRefresh={loadScore} />
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
                    participants={participants}
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
