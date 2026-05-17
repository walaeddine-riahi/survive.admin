"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  MessageSquare, Send, ChevronLeft, Hash,
  Megaphone, Users, Lock, AtSign, Plus,
} from "lucide-react";
import {
  getChannels, getMessages, sendChatMessage,
  markChannelRead, getChatDelta, createDirectChannel, getAllChannels,
} from "@/actions/simulation/chat-actions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Channel = any; type Message = any; type Participant = any;

// ─── Channel type config ──────────────────────────────────────────────────────
const CH_TYPE_CONFIG = {
  GENERAL:   { icon: Hash,       label: "Général",   color: "#185FA5" },
  TEAM:      { icon: Users,      label: "Équipe",    color: "#0F6E56" },
  DIRECT:    { icon: Lock,       label: "Direct",    color: "#534AB7" },
  BROADCAST: { icon: Megaphone,  label: "Annonces",  color: "#f97316" },
};

function formatTime(d: string | Date) {
  return new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

// ─── Single message bubble ────────────────────────────────────────────────────
function MessageBubble({ msg, isMine, isInstructor }: {
  msg: Message; isMine: boolean; isInstructor: boolean;
}) {
  const isAlert = msg.messageType === "alert";
  const isAnnouncement = isInstructor && !isMine;

  if (isAnnouncement) {
    return (
      <div className="flex justify-center my-2">
        <div className="max-w-[90%] text-center">
          <div className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
            <Megaphone className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
            <div className="text-left">
              <p className="text-xs font-semibold text-orange-700">Instructeur</p>
              <p className="text-sm text-orange-800">{msg.content}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{formatTime(msg.sentAt)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-1.5`}>
      <div className={`max-w-[78%] ${isMine ? "items-end" : "items-start"} flex flex-col`}>
        {!isMine && (
          <div className="flex items-center gap-1.5 mb-1 px-1">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold flex-shrink-0">
              {msg.senderName[0]}
            </div>
            <span className="text-xs font-medium text-foreground">{msg.senderName}</span>
            <span className="text-xs text-muted-foreground">· {msg.senderRole}</span>
          </div>
        )}
        <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
          isMine
            ? "bg-blue-600 text-white rounded-tr-sm"
            : isAlert
            ? "bg-red-50 border border-red-200 text-red-800 rounded-tl-sm"
            : "bg-muted text-foreground rounded-tl-sm"
        }`}>
          {msg.content}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 px-1">{formatTime(msg.sentAt)}</p>
      </div>
    </div>
  );
}

// ─── Channel list item ────────────────────────────────────────────────────────
function ChannelItem({ channel, isActive, unread, onSelect }: {
  channel: Channel; isActive: boolean; unread: number; onSelect: () => void;
}) {
  const cfg = CH_TYPE_CONFIG[channel.type as keyof typeof CH_TYPE_CONFIG] || CH_TYPE_CONFIG.GENERAL;
  const Icon = cfg.icon;
  const lastMsg = channel.messages?.[0];

  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all ${
        isActive
          ? "bg-blue-50 border border-blue-200"
          : "hover:bg-muted/50"
      }`}>
      {/* Channel icon or emoji */}
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
        style={{ background: (channel.color || cfg.color) + "20" }}>
        {channel.emoji || <Icon className="h-4 w-4" style={{ color: channel.color || cfg.color }} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className={`text-sm font-medium truncate ${isActive ? "text-blue-700" : ""}`}>
            {channel.name}
          </span>
          {lastMsg && (
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {formatTime(lastMsg.sentAt)}
            </span>
          )}
        </div>
        {lastMsg && (
          <p className="text-xs text-muted-foreground truncate">
            {lastMsg.senderName}: {lastMsg.content}
          </p>
        )}
      </div>

      {unread > 0 && (
        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
          <span className="text-xs text-white font-bold">{unread > 9 ? "9+" : unread}</span>
        </div>
      )}
    </button>
  );
}

// ─── Main chat panel ──────────────────────────────────────────────────────────
export default function ChatPanel({
  sessionId,
  participant,
  allParticipants = [],
}: {
  sessionId: string;
  participant: { id: string; displayName: string; role: string; isInstructor?: boolean };
  allParticipants?: Participant[];
}) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showChannelList, setShowChannelList] = useState(true);
  const [showDMPicker, setShowDMPicker] = useState(false);
  const [lastPoll, setLastPoll] = useState(new Date().toISOString());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeChannel = channels.find(c => c.id === activeChannelId);
  const activeMessages = activeChannelId ? (messages[activeChannelId] || []) : [];
  const totalUnread = channels.reduce((s, c) => s + (c.unreadCount || 0), 0);

  // Load channels on mount
  useEffect(() => {
    const load = async () => {
      const r = participant.isInstructor 
        ? await getAllChannels(sessionId)
        : await getChannels(sessionId, participant.id);
      if (r.success && r.data) {
        setChannels(r.data as Channel[]);
        // Auto-open general channel
        const general = r.data.find((c: Channel) => c.type === "GENERAL");
        if (general && !activeChannelId) setActiveChannelId(general.id);
      }
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Load messages when switching channel
  useEffect(() => {
    if (!activeChannelId || messages[activeChannelId]) return;
    getMessages(activeChannelId).then(r => {
      if (r.success && r.data) {
        setMessages(prev => ({ ...prev, [activeChannelId]: r.data as Message[] }));
      }
    });
    // Mark as read
    markChannelRead(activeChannelId, participant.id);
    setChannels(prev => prev.map(c => c.id === activeChannelId ? { ...c, unreadCount: 0 } : c));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChannelId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages.length]);

  // Poll for new messages
  const poll = useCallback(async () => {
    const r = await getChatDelta(sessionId, lastPoll, participant.id);
    if (r.success && r.data && r.data.length > 0) {
      setLastPoll(new Date().toISOString());
      r.data.forEach((msg: Message) => {
        setMessages(prev => {
          const existing = prev[msg.channelId] || [];
          if (existing.some((m: Message) => m.id === msg.id)) return prev;
          return { ...prev, [msg.channelId]: [...existing, msg] };
        });
        // Update channel unread / last message
        setChannels(prev => prev.map(c => {
          if (c.id !== msg.channelId) return c;
          const isActive = c.id === activeChannelId;
          if (!isActive) markChannelRead(msg.channelId, participant.id);
          return {
            ...c,
            unreadCount: isActive ? 0 : (c.unreadCount || 0) + 1,
            messages: [{ content: msg.content, senderName: msg.senderName, sentAt: msg.sentAt, readByIds: [] }],
          };
        }));
        // Toast if not in active channel
        if (msg.channelId !== activeChannelId) {
          toast.info(`💬 ${msg.senderName}: ${msg.content.slice(0, 50)}`, {
            description: `Dans ${(r.data as Message[]).find((m: Message) => m.id === msg.id)?.channel?.name || ""}`,
            duration: 4000,
          });
        }
      });
    }
  }, [sessionId, lastPoll, participant.id, activeChannelId]);

  useEffect(() => {
    pollRef.current = setInterval(poll, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [poll]);

  async function handleSend() {
    if (!input.trim() || !activeChannelId || isSending) return;
    setIsSending(true);
    const content = input.trim();
    setInput("");

    // Optimistic update
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      channelId: activeChannelId,
      senderId: participant.id,
      senderName: participant.displayName,
      senderRole: participant.role,
      content,
      messageType: "text",
      isInstructor: participant.isInstructor ?? false,
      sentAt: new Date().toISOString(),
      readByIds: [participant.id],
    };
    setMessages(prev => ({ ...prev, [activeChannelId]: [...(prev[activeChannelId] || []), tempMsg] }));

    const r = await sendChatMessage({
      channelId: activeChannelId,
      sessionId,
      senderId: participant.id,
      senderName: participant.displayName,
      senderRole: participant.role,
      content,
      isInstructor: participant.isInstructor ?? false,
    });

    if (r.success && r.data) {
      // Replace temp with real
      setMessages(prev => ({
        ...prev,
        [activeChannelId]: (prev[activeChannelId] || []).map(m =>
          m.id === tempMsg.id ? r.data : m
        ),
      }));
    } else {
      // Revert
      setMessages(prev => ({
        ...prev,
        [activeChannelId]: (prev[activeChannelId] || []).filter(m => m.id !== tempMsg.id),
      }));
      toast.error("Erreur envoi message");
      setInput(content);
    }
    setIsSending(false);
    inputRef.current?.focus();
  }

  async function handleOpenDM(target: Participant) {
    setShowDMPicker(false);
    const r = await createDirectChannel(
      sessionId,
      { id: participant.id, displayName: participant.displayName },
      { id: target.id, displayName: target.displayName }
    );
    if (r.success && r.data) {
      const ch = r.data;
      setChannels(prev => prev.some(c => c.id === ch.id) ? prev : [...prev, { ...ch, unreadCount: 0, messages: [] }]);
      setActiveChannelId(ch.id);
      setShowChannelList(false);
    }
  }

  const otherParticipants = allParticipants.filter(
    p => p.id !== participant.id && !p.isInstructor
  );

  return (
    <div className="flex h-full bg-background">
      {/* Sidebar — channel list */}
      <div className={`${showChannelList ? "flex" : "hidden"} md:flex flex-col w-52 border-r flex-shrink-0 bg-background`}>
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-3 border-b">
          <MessageSquare className="h-4 w-4 text-blue-600" />
          <p className="text-sm font-semibold flex-1">Chat interne</p>
          {totalUnread > 0 && (
            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
              <span className="text-xs text-white font-bold">{totalUnread}</span>
            </div>
          )}
        </div>

        {/* Channel sections */}
        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {/* General */}
          {channels.filter(c => c.type === "GENERAL" || c.type === "BROADCAST").map(ch => (
            <ChannelItem key={ch.id} channel={ch}
              isActive={activeChannelId === ch.id}
              unread={ch.unreadCount || 0}
              onSelect={() => { setActiveChannelId(ch.id); setShowChannelList(false); }} />
          ))}

          {/* Teams */}
          {channels.filter(c => c.type === "TEAM").length > 0 && (
            <>
              <p className="text-xs text-muted-foreground uppercase tracking-wide px-2 pt-3 pb-1 font-medium">
                Équipes
              </p>
              {channels.filter(c => c.type === "TEAM").map(ch => (
                <ChannelItem key={ch.id} channel={ch}
                  isActive={activeChannelId === ch.id}
                  unread={ch.unreadCount || 0}
                  onSelect={() => { setActiveChannelId(ch.id); setShowChannelList(false); }} />
              ))}
            </>
          )}

          {/* Direct messages */}
          {channels.filter(c => c.type === "DIRECT").length > 0 && (
            <>
              <p className="text-xs text-muted-foreground uppercase tracking-wide px-2 pt-3 pb-1 font-medium">
                Messages directs
              </p>
              {channels.filter(c => c.type === "DIRECT").map(ch => (
                <ChannelItem key={ch.id} channel={ch}
                  isActive={activeChannelId === ch.id}
                  unread={ch.unreadCount || 0}
                  onSelect={() => { setActiveChannelId(ch.id); setShowChannelList(false); }} />
              ))}
            </>
          )}
        </div>

        {/* New DM button */}
        {otherParticipants.length > 0 && (
          <div className="border-t px-2 py-2">
            {showDMPicker ? (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground px-2 pb-1">Envoyer un message à...</p>
                {otherParticipants.map(p => (
                  <button key={p.id} onClick={() => handleOpenDM(p)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted text-left">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold">
                      {p.displayName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{p.displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{p.role}</p>
                    </div>
                  </button>
                ))}
                <Button size="sm" variant="ghost" className="h-7 text-xs w-full"
                  onClick={() => setShowDMPicker(false)}>Annuler</Button>
              </div>
            ) : (
              <Button size="sm" variant="ghost" className="h-7 text-xs w-full gap-1.5 text-muted-foreground"
                onClick={() => setShowDMPicker(true)}>
                <Plus className="h-3.5 w-3.5" /> Nouveau message direct
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Main chat area */}
      <div className={`flex-1 flex flex-col min-h-0 ${!showChannelList || activeChannelId ? "flex" : "hidden md:flex"}`}>
        {activeChannel ? (
          <>
            {/* Channel header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b flex-shrink-0">
              <button className="md:hidden mr-1" onClick={() => setShowChannelList(true)}>
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-lg">{activeChannel.emoji || "#"}</span>
              <div>
                <p className="text-sm font-semibold">{activeChannel.name}</p>
                {activeChannel.description && (
                  <p className="text-xs text-muted-foreground">{activeChannel.description}</p>
                )}
              </div>
              <Badge className="ml-auto text-xs" variant="outline">
                {CH_TYPE_CONFIG[activeChannel.type as keyof typeof CH_TYPE_CONFIG]?.label}
              </Badge>
              {activeChannel.type === "BROADCAST" && (
                <span className="text-xs text-orange-500 font-medium">Lecture seule</span>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {activeMessages.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Aucun message dans ce canal</p>
                  <p className="text-xs mt-1">Soyez le premier à écrire</p>
                </div>
              ) : (
                <>
                  {activeMessages.map((msg: Message) => (
                    <MessageBubble
                      key={msg.id}
                      msg={msg}
                      isMine={msg.senderId === participant.id}
                      isInstructor={msg.isInstructor}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            {activeChannel.type !== "BROADCAST" && (
              <div className="flex items-center gap-2 px-4 py-3 border-t flex-shrink-0">
                <Input
                  ref={inputRef}
                  className="flex-1 h-9"
                  placeholder={`Message dans ${activeChannel.name}...`}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  disabled={isSending}
                  maxLength={1000}
                />
                <Button
                  size="sm"
                  className="h-9 w-9 p-0 bg-blue-600 hover:bg-blue-700"
                  onClick={handleSend}
                  disabled={!input.trim() || isSending}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Sélectionnez un canal</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
