"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  MessageSquare, Send, ChevronLeft, Hash,
  Megaphone, Users, Lock, AtSign, Plus, Copy, Trash2,
} from "lucide-react";
import {
  getChannels, getMessages, sendChatMessage, deleteChatMessage,
  markChannelRead, getChatDelta, createDirectChannel, getAllChannels, createGroupChannel,
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
function MessageBubble({ msg, isMine, isInstructor, onDelete }: {
  msg: Message; isMine: boolean; isInstructor: boolean; onDelete?: (id: string) => void;
}) {
  const isAlert = msg.messageType === "alert";
  const isAnnouncement = isInstructor && !isMine;

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    toast.success("Message copié !");
  };

  if (isAnnouncement) {
    return (
      <div className="flex justify-center my-2.5">
        <div className="max-w-[90%] text-center">
          <div className="inline-flex items-center gap-2 bg-orange-950/20 border border-orange-900/40 rounded-2xl px-4 py-2.5 shadow-lg shadow-black/20">
            <Megaphone className="h-4 w-4 text-orange-400 flex-shrink-0 animate-bounce" />
            <div className="text-left">
              <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">Instructeur</p>
              <p className="text-sm text-gray-200 mt-0.5 leading-relaxed break-all break-words">{msg.content}</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mt-1">
            <p className="text-[10px] text-slate-500 font-mono">{formatTime(msg.sentAt)}</p>
            <button
              onClick={handleCopy}
              className="text-slate-500 hover:text-slate-300 transition-colors"
              title="Copier le message"
            >
              <Copy className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-3`}>
      <div className={`max-w-[78%] ${isMine ? "items-end" : "items-start"} flex flex-col`}>
        {!isMine && (
          <div className="flex items-center gap-1.5 mb-1 px-1">
            <div className="w-5.5 h-5.5 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300 text-[10px] font-bold flex-shrink-0">
              {msg.senderName[0]}
            </div>
            <span className="text-xs font-semibold text-slate-300">{msg.senderName}</span>
            <span className="text-[10px] text-slate-500 font-medium">· {msg.senderRole}</span>
          </div>
        )}
        <div className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed shadow-sm break-all break-words ${
          isMine
            ? "bg-blue-600/80 border border-blue-500/20 text-white rounded-tr-sm"
            : isAlert
            ? "bg-rose-950/30 border border-rose-900/40 text-rose-300 rounded-tl-sm"
            : "bg-slate-900/80 border border-slate-800/60 text-slate-200 rounded-tl-sm"
        }`}>
          {msg.content}
        </div>
        <div className="flex items-center gap-2 mt-1 px-1">
          <p className="text-[9px] text-slate-500 font-mono">{formatTime(msg.sentAt)}</p>
          <button
            onClick={handleCopy}
            className="text-slate-500 hover:text-slate-300 transition-colors"
            title="Copier le message"
          >
            <Copy className="h-3 w-3" />
          </button>
          {isMine && onDelete && (
            <button
              onClick={async () => {
                if (confirm("Supprimer ce message ?")) {
                  const r = await deleteChatMessage(msg.id, msg.senderId);
                  if (r.success) {
                    onDelete(msg.id);
                  } else {
                    toast.error(r.error || "Erreur");
                  }
                }
              }}
              className="text-slate-500 hover:text-red-400 transition-colors"
              title="Supprimer le message"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
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
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all border ${
        isActive
          ? "bg-orange-600/10 border-orange-500/30 text-orange-400 font-bold shadow-md shadow-orange-950/5"
          : "bg-transparent border-transparent hover:bg-slate-900/40 text-slate-450 hover:text-slate-200"
      }`}>
      {/* Channel icon or emoji */}
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-base transition-all duration-300"
        style={{ background: isActive ? "rgba(249, 115, 22, 0.15)" : (channel.color || cfg.color) + "12" }}>
        {channel.emoji || <Icon className="h-4 w-4" style={{ color: isActive ? "#f97316" : channel.color || cfg.color }} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className={`text-xs font-semibold truncate uppercase tracking-wider ${isActive ? "text-orange-400" : "text-slate-350"}`}>
            {channel.name}
          </span>
          {lastMsg && (
            <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">
              {formatTime(lastMsg.sentAt)}
            </span>
          )}
        </div>
        {lastMsg && (
          <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium leading-none">
            <span className="text-slate-400">{lastMsg.senderName}:</span> {lastMsg.content}
          </p>
        )}
      </div>

      {unread > 0 && (
        <div className="w-4.5 h-4.5 rounded-full bg-rose-600 flex items-center justify-center flex-shrink-0 animate-pulse">
          <span className="text-[9px] text-white font-bold leading-none">{unread > 9 ? "9+" : unread}</span>
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
  const [selectedTargetIds, setSelectedTargetIds] = useState<string[]>([]);
  const [dmSearch, setDmSearch] = useState("");
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
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

  async function handleOpenGroupDM(targets: Participant[]) {
    setShowDMPicker(false);
    setSelectedTargetIds([]);
    const r = await createGroupChannel(
      sessionId,
      { id: participant.id, displayName: participant.displayName },
      targets.map(t => ({ id: t.id, displayName: t.displayName }))
    );
    if (r.success && r.data) {
      const ch = r.data;
      setChannels(prev => prev.some(c => c.id === ch.id) ? prev : [...prev, { ...ch, unreadCount: 0, messages: [] }]);
      setActiveChannelId(ch.id);
      setShowChannelList(false);
    } else {
      toast.error("Erreur de création de canal");
    }
  }

  const otherParticipants = allParticipants.filter(
    p => p.id !== participant.id && !p.isInstructor
  );

  return (
    <div className="flex h-full bg-transparent text-white">
      {/* Sidebar — channel list */}
      <div className={`${showChannelList ? "flex" : "hidden"} md:flex flex-col w-52 border-r border-slate-800/80 flex-shrink-0 bg-[#060a13]/85`}>
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3.5 border-b border-slate-800/80">
          <MessageSquare className="h-4 w-4 text-orange-500" />
          <p className="text-xs font-bold text-gray-300 uppercase tracking-widest flex-1">Chat interne</p>
          {totalUnread > 0 && (
            <div className="w-5 h-5 rounded-full bg-rose-600 flex items-center justify-center animate-pulse">
              <span className="text-xs text-white font-bold leading-none">{totalUnread}</span>
            </div>
          )}
        </div>

        {/* Channel sections */}
        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 no-scrollbar">
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
              <p className="text-[10px] text-slate-500 uppercase tracking-wider px-3 pt-3 pb-1 font-bold">
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
              <p className="text-[10px] text-slate-500 uppercase tracking-wider px-3 pt-3 pb-1 font-bold">
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
          <div className="border-t border-slate-800/60 px-2 py-2.5">
            {showDMPicker ? (
              <div className="space-y-2 p-1 bg-slate-950/60 rounded-xl border border-slate-800/60">
                <div className="flex items-center justify-between px-2 pt-1 pb-1">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Destinataires</p>
                  {selectedTargetIds.length > 0 && (
                    <button
                      onClick={() => setSelectedTargetIds([])}
                      className="text-[9px] text-orange-400 hover:text-orange-350 font-semibold"
                    >
                      Effacer
                    </button>
                  )}
                </div>
                
                <div className="relative mt-1 mb-2 px-1">
                  <Input
                    className="h-7 text-xs bg-slate-900 border-slate-800 focus-visible:ring-orange-500 text-white rounded-lg placeholder:text-gray-600"
                    placeholder="Rechercher..."
                    value={dmSearch}
                    onChange={(e) => setDmSearch(e.target.value)}
                  />
                </div>
                <div className="max-h-[160px] overflow-y-auto space-y-1 pr-1 no-scrollbar">
                  {otherParticipants
                    .filter(p => p.displayName.toLowerCase().includes(dmSearch.toLowerCase()))
                    .map(p => {
                    const isSelected = selectedTargetIds.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedTargetIds(prev => prev.filter(id => id !== p.id));
                          } else {
                            setSelectedTargetIds(prev => [...prev, p.id]);
                          }
                        }}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg border transition-all text-left ${
                          isSelected
                            ? "bg-orange-600/10 border-orange-500/30 text-orange-200"
                            : "bg-transparent border-transparent hover:bg-slate-900/40 text-slate-400"
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected ? "bg-orange-600 border-orange-500 text-white" : "border-slate-800 bg-slate-950"
                        }`}>
                          {isSelected && <span className="text-[9px] font-bold leading-none">✓</span>}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate text-white">{p.displayName}</p>
                          <p className="text-[9px] opacity-70 truncate text-slate-550">{p.role}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-1.5 pt-1.5 border-t border-slate-800/50">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-[10px] flex-1 font-semibold text-slate-400 hover:bg-slate-900/50"
                    onClick={() => {
                      setShowDMPicker(false);
                      setSelectedTargetIds([]);
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-[10px] flex-1 font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-950/20"
                    disabled={selectedTargetIds.length === 0}
                    onClick={() => {
                      const targets = otherParticipants.filter(p => selectedTargetIds.includes(p.id));
                      handleOpenGroupDM(targets);
                    }}
                  >
                    Démarrer ({selectedTargetIds.length})
                  </Button>
                </div>
              </div>
            ) : (
              <Button size="sm" variant="ghost" className="h-7 text-xs w-full gap-1.5 text-slate-400 hover:bg-slate-900/40 hover:text-slate-200 rounded-lg"
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
            <div className="flex items-center gap-2 px-5 py-3.5 bg-[#0b0f19]/60 backdrop-blur-md border-b border-slate-800/80 flex-shrink-0">
              <button className="md:hidden mr-1 text-slate-400 hover:text-slate-250" onClick={() => setShowChannelList(true)}>
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-lg">{activeChannel.emoji || "#"}</span>
              <div>
                <p className="text-sm font-semibold text-slate-100 uppercase tracking-wider">{activeChannel.name}</p>
                {activeChannel.description && (
                  <p className="text-xs text-slate-400 mt-0.5">{activeChannel.description}</p>
                )}
              </div>
              <Badge className="ml-auto text-xs border-slate-800 bg-slate-900/60 text-slate-300" variant="outline">
                {CH_TYPE_CONFIG[activeChannel.type as keyof typeof CH_TYPE_CONFIG]?.label}
              </Badge>
              {activeChannel.type === "BROADCAST" && (
                <span className="text-xs text-orange-500 font-semibold uppercase tracking-wide bg-orange-950/20 px-2 py-0.5 rounded border border-orange-900/40">Lecture seule</span>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 no-scrollbar">
              {activeMessages.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                  <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-semibold">Aucun message dans ce canal</p>
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
                      onDelete={(id) => {
                        setMessages(prev => ({
                          ...prev,
                          [activeChannelId!]: (prev[activeChannelId!] || []).filter(m => m.id !== id)
                        }));
                      }}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            {activeChannel.type !== "BROADCAST" && (
              <div className="flex items-center gap-2 px-5 py-4 bg-[#090e1a]/80 border-t border-slate-800/80 flex-shrink-0 relative">
                {showTagPicker && (
                  <div className="absolute bottom-full mb-2 left-5 right-5 bg-[#0b0f19] border border-slate-800 rounded-lg shadow-lg p-2 max-h-40 overflow-y-auto z-50 no-scrollbar">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 px-1">Taguer un participant</p>
                    {allParticipants
                      .filter(p => p.id !== participant.id)
                      .filter(p => p.displayName.toLowerCase().includes(tagSearch.toLowerCase()))
                      .map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setInput(prev => {
                            const words = prev.split(" ");
                            words.pop(); // Remove the incomplete tag like "@Ra"
                            return [...words, `@${p.displayName} `].join(" ");
                          });
                          setShowTagPicker(false);
                          setTagSearch("");
                          inputRef.current?.focus();
                        }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-900/40 text-left transition-colors"
                      >
                        <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-[10px] font-bold">
                          {p.displayName[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{p.displayName}</p>
                          <p className="text-[9px] text-slate-500 truncate">{p.role}</p>
                        </div>
                      </button>
                    ))}
                    {allParticipants.filter(p => p.id !== participant.id).filter(p => p.displayName.toLowerCase().includes(tagSearch.toLowerCase())).length === 0 && (
                      <p className="text-xs text-slate-600 p-1">Aucun résultat.</p>
                    )}
                  </div>
                )}
                <Input
                  ref={inputRef}
                  className="flex-1 h-9.5 bg-slate-950/60 border-slate-800 text-slate-100 placeholder-slate-500 focus-visible:ring-slate-700 rounded-lg text-xs"
                  placeholder={`Écrire dans ${activeChannel.name}...`}
                  value={input}
                  onChange={e => {
                    const val = e.target.value;
                    setInput(val);
                    const lastWord = val.split(" ").pop() || "";
                    if (lastWord.startsWith("@")) {
                      setShowTagPicker(true);
                      setTagSearch(lastWord.slice(1));
                    } else {
                      setShowTagPicker(false);
                      setTagSearch("");
                    }
                  }}
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
                  variant="ghost"
                  className="h-9.5 w-9.5 p-0 text-slate-400 hover:bg-slate-900/40 hover:text-slate-200 rounded-lg"
                  onClick={() => setShowTagPicker(!showTagPicker)}
                >
                  <AtSign className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  className="h-9.5 w-9.5 p-0 bg-orange-600 hover:bg-orange-700 text-white rounded-lg shadow-md shadow-orange-950/20 transition-all duration-300"
                  onClick={handleSend}
                  disabled={!input.trim() || isSending}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20 animate-pulse" />
              <p className="text-sm font-semibold tracking-wide">Sélectionnez un canal de discussion</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
