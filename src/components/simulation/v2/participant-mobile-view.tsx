"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Mail, Phone, MessageSquare, Bell, Zap, FileText,
  Globe, Radio, Send, CheckCircle2,
  Clock, PhoneIncoming, PhoneMissed, Mic, MicOff,
  Shield, FileStack, ListTodo, MessageSquareText, Users, Forward,
  Award, Sparkles, TrendingUp, ThumbsUp, ChevronDown, ChevronRight, Pause,
  Menu, X, Search, Check
} from "lucide-react";
import CrisisLogPanel from "./crisis-log-panel";
import CrisisDocsPanel from "./crisis-docs-panel";
import ChatPanel from "./chat-panel";
import ExternalChatPanel from "./external-chat-panel";
import InternalCommPanel from "./internal-comm-panel";
import { replyToMessage, markMessageRead, logSimEvent, markParticipantConnected, updateCall, forwardSimMessage } from "@/actions/simulation/sim-session-actions";
import { getParticipantScoreForSimulation } from "@/actions/simulation/analysis-actions";
import { usePusherChannel } from "./use-pusher-channel";

interface ParticipantMobileViewProps {
  session: any;
  participant: any;
  participants: any[];
  initialMessages: any[];
}

export default function ParticipantMobileView({
  session,
  participant,
  participants,
  initialMessages,
}: ParticipantMobileViewProps) {
  const [activeTab, setActiveTab] = useState<"CHAT" | "TRANS" | "EXTERN" | "MORE">("CHAT");
  const [messages, setMessages] = useState(initialMessages);
  const [sessionStatus, setSessionStatus] = useState(session.status);
  const [elapsed, setElapsed] = useState(0);
  
  // Chat states
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  
  // Pusher integration
  const hasPusher = usePusherChannel(session.id, (event, data) => {
    if (event === "chat_message") {
      setMessages(prev => [...prev, data]);
    } else if (event === "session_status_changed") {
      setSessionStatus(data.status);
    }
  });

  // Calculate elapsed time
  useEffect(() => {
    if (session.startedAt) {
      const start = new Date(session.startedAt).getTime();
      const interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - start) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [session.startedAt]);

  const formatElapsed = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-screen bg-gray-950 text-white flex flex-col select-none overflow-hidden">
      {/* Session paused modal overlay */}
      {sessionStatus === "PAUSED" && (
        <div className="fixed inset-0 z-[9999] bg-[#050914]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e1628]/95 border border-amber-500/30 rounded-3xl p-6 w-full text-center space-y-6 shadow-[0_0_50px_rgba(245,158,11,0.15)]">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Pause className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-extrabold text-white tracking-wide uppercase">Simulation Suspendue</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                L'exercice est temporairement suspendu par l'instructeur.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 py-3 bg-gray-900 border-b border-gray-800 flex-shrink-0">
        <div className="w-7 h-7 bg-orange-600 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0">S</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate">{session.title}</p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-orange-400 font-mono">{formatElapsed(elapsed)}</span>
            <span className="text-[10px] text-gray-500">{participant.role}</span>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "CHAT" && (
          <div className="h-full flex flex-col">
            <ChatPanel sessionId={session.id} participant={participant} allParticipants={participants} />
          </div>
        )}

        {activeTab === "TRANS" && (
          <div className="h-full flex flex-col">
            <InternalCommPanel sessionId={session.id} participant={participant} participants={participants} />
          </div>
        )}

        {activeTab === "EXTERN" && (
          <div className="h-full flex flex-col">
            <ExternalChatPanel sessionId={session.id} participant={participant} participants={participants} initialMessages={messages} />
          </div>
        )}

        {activeTab === "MORE" && (
          <div className="h-full flex flex-col p-4 space-y-4 overflow-y-auto">
            <h3 className="text-white font-bold text-sm">Outils supplémentaires</h3>
            
            <button className="w-full flex items-center gap-3 p-4 bg-gray-900 border border-gray-800 rounded-xl text-left">
              <Shield className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-xs font-semibold text-white">Main Courante</p>
                <p className="text-[10px] text-gray-500">Journal des événements</p>
              </div>
              <ChevronRight className="h-4 w-4 ml-auto text-gray-600" />
            </button>

            <button className="w-full flex items-center gap-3 p-4 bg-gray-900 border border-gray-800 rounded-xl text-left">
              <FileStack className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-xs font-semibold text-white">Documents</p>
                <p className="text-[10px] text-gray-500">Médiathèque et fichiers</p>
              </div>
              <ChevronRight className="h-4 w-4 ml-auto text-gray-600" />
            </button>

            <button className="w-full flex items-center gap-3 p-4 bg-gray-900 border border-gray-800 rounded-xl text-left">
              <Award className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-xs font-semibold text-white">Performance</p>
                <p className="text-[10px] text-gray-500">Bilan et scores</p>
              </div>
              <ChevronRight className="h-4 w-4 ml-auto text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-gray-900 border-t border-gray-800 flex-shrink-0 flex justify-around items-center px-2 py-1.5">
        <button
          onClick={() => setActiveTab("CHAT")}
          className={`flex flex-col items-center p-2 gap-1 min-w-[60px] ${
            activeTab === "CHAT" ? "text-orange-500" : "text-gray-500"
          }`}
        >
          <MessageSquareText className="h-5 w-5" />
          <span className="text-[10px] font-medium">Chat</span>
        </button>

        <button
          onClick={() => setActiveTab("TRANS")}
          className={`flex flex-col items-center p-2 gap-1 min-w-[60px] ${
            activeTab === "TRANS" ? "text-orange-500" : "text-gray-500"
          }`}
        >
          <Send className="h-5 w-5" />
          <span className="text-[10px] font-medium">Transmissions</span>
        </button>

        <button
          onClick={() => setActiveTab("EXTERN")}
          className={`flex flex-col items-center p-2 gap-1 min-w-[60px] ${
            activeTab === "EXTERN" ? "text-orange-500" : "text-gray-500"
          }`}
        >
          <Users className="h-5 w-5" />
          <span className="text-[10px] font-medium">Externes</span>
        </button>

        <button
          onClick={() => setActiveTab("MORE")}
          className={`flex flex-col items-center p-2 gap-1 min-w-[60px] ${
            activeTab === "MORE" ? "text-orange-500" : "text-gray-500"
          }`}
        >
          <Menu className="h-5 w-5" />
          <span className="text-[10px] font-medium">Plus</span>
        </button>
      </div>
    </div>
  );
}
