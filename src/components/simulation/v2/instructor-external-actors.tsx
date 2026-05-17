"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Mail, Phone, MessageSquare, Send, Users, ShieldAlert, Plus, FileText, Sparkles, AlertCircle,
} from "lucide-react";
import { addExternalActor, sendSimMessage } from "@/actions/simulation/sim-session-actions";

interface InstructorExternalActorsMonitorProps {
  sessionId: string;
  participants: any[];
  initialMessages: any[];
  onUpdate: () => void;
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

  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  let match;
  while ((match = urlRegex.exec(text)) !== null) {
    let url = match[1];
    url = url.replace(/[.,;:)\]]+$/, "");
    if (foundUrls.has(url)) continue;
    foundUrls.add(url);
    const lowerUrl = url.toLowerCase();

    // YouTube
    const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
    const ytMatch = ytRegex.exec(url);
    if (ytMatch) {
      embeds.push({ type: "youtube", url, youtubeId: ytMatch[1] });
      continue;
    }

    // PDF
    if (lowerUrl.includes(".pdf")) {
      embeds.push({ type: "pdf", url });
      continue;
    }

    // Drive
    if (lowerUrl.includes("drive.google.com")) {
      embeds.push({ type: "drive", url });
      continue;
    }

    // Image
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
      embeds.push({ type: "image", url });
      continue;
    }
  }

  return embeds;
}

function MessageEmbeds({ text }: { text: string }) {
  const embeds = parseEmbeds(text);
  if (embeds.length === 0) return null;

  return (
    <div className="mt-2.5 space-y-2.5">
      {embeds.map((embed, idx) => {
        if (embed.type === "youtube" && embed.youtubeId) {
          return (
            <div key={idx} className="relative aspect-video w-full max-w-md rounded-xl overflow-hidden border border-slate-800 shadow-md bg-black">
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
            <div key={idx} className="relative max-w-md rounded-xl overflow-hidden border border-slate-800 shadow-md bg-slate-950 group">
              <img
                src={embed.url}
                alt="Embedded media"
                className="w-full h-auto max-h-[220px] object-contain transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <a
                href={embed.url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-lg text-[9px] font-semibold transition-colors flex items-center gap-1 backdrop-blur-sm"
              >
                👁️ Ouvrir
              </a>
            </div>
          );
        }
        if (embed.type === "pdf") {
          return (
            <div key={idx} className="flex items-center gap-3 p-2.5 bg-slate-900 border border-slate-800 rounded-xl max-w-md shadow-sm hover:shadow-md transition-all">
              <div className="w-8 h-8 bg-red-950/40 text-red-400 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-gray-200 truncate">Document PDF Joint</p>
                <p className="text-[9px] text-gray-500 truncate">{embed.url}</p>
              </div>
              <a
                href={embed.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1.5 rounded-lg text-[9px] font-semibold transition-all flex-shrink-0"
              >
                Télécharger
              </a>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

function cleanMessageBody(body: string): string {
  if (!body) return "";
  let clean = body;
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  let match;
  const urlsToRemove: string[] = [];
  while ((match = urlRegex.exec(body)) !== null) {
    const url = match[1].replace(/[.,;:)\]]+$/, "");
    const lowerUrl = url.toLowerCase();
    const isEmbed = lowerUrl.includes(".pdf") ||
                    lowerUrl.includes("drive.google.com") ||
                    lowerUrl.includes("youtube.com") ||
                    lowerUrl.includes("youtu.be") ||
                    /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff)(\?|$)/i.test(lowerUrl) ||
                    [
                      "bing.net/th",
                      "googleusercontent.com",
                      "unsplash.com/photo-",
                      "images.unsplash.com",
                      "images.pexels.com",
                      "pixabay.com/get/",
                      "i.imgur.com"
                    ].some(host => lowerUrl.includes(host));
    if (isEmbed) {
      urlsToRemove.push(url);
    }
  }

  urlsToRemove.forEach(url => {
    clean = clean.replace(url, "");
  });

  return clean.trim();
}

export default function InstructorExternalActorsMonitor({
  sessionId,
  participants,
  initialMessages,
  onUpdate,
}: InstructorExternalActorsMonitorProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  const [selectedActorId, setSelectedActorId] = useState<string | null>(null);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);

  const [replyChannel, setReplyChannel] = useState<string>("EMAIL");
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");

  const externalActors = participants.filter((p) => p.isExternal);

  const selectedActor = externalActors.find((actor) => actor.id === selectedActorId) || null;

  const actorMessages = initialMessages.filter((msg) => {
    if (!selectedActor) return false;
    const actorEmail = selectedActor.simEmail;
    const actorPhone = selectedActor.simPhone;

    const matchesSender = (actorEmail && msg.senderEmail === actorEmail) || (actorPhone && msg.senderPhone === actorPhone);
    const matchesRecipient = (actorEmail && msg.recipientEmail === actorEmail) || (actorPhone && msg.recipientPhone === actorPhone);

    return matchesSender || matchesRecipient;
  });

  const activeConversationParticipants = participants.filter((p) => {
    if (p.isExternal || p.isInstructor || p.isObserver) return false;
    return actorMessages.some(
      (msg) => msg.participantId === p.id || msg.recipientIds?.includes(p.id)
    );
  });

  const selectedParticipant = participants.find((p) => p.id === selectedParticipantId) || null;

  const conversationMessages = actorMessages
    .filter((msg) => {
      if (!selectedParticipant) return false;
      return msg.participantId === selectedParticipant.id || msg.recipientIds?.includes(selectedParticipant.id);
    })
    .sort((a, b) => new Date(a.triggeredAt).getTime() - new Date(b.triggeredAt).getTime());

  useEffect(() => {
    if (selectedActor && activeConversationParticipants.length > 0 && !selectedParticipantId) {
      setSelectedParticipantId(activeConversationParticipants[0].id);
    }
  }, [selectedActorId, activeConversationParticipants]);

  const handleSelectParticipant = (id: string) => {
    setSelectedParticipantId(id);
    setReplyBody("");
    if (replyChannel === "EMAIL") {
      setReplySubject("Re: Communication");
    }
  };

  const handleCreateActor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;
    if (!email.trim() && !phone.trim()) {
      toast.error("Veuillez renseigner au moins un e-mail ou un numéro de téléphone.");
      return;
    }

    try {
      setIsCreating(true);
      const res = await addExternalActor(sessionId, {
        displayName: name,
        role,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      });

      if (res.success) {
        toast.success(`Acteur externe "${name}" créé avec succès !`);
        setName("");
        setRole("");
        setEmail("");
        setPhone("");
        onUpdate();
      } else {
        toast.error(res.error || "Erreur lors de la création de l'acteur");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur réseau");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedActor || !selectedParticipant) return;
    if (!replyBody.trim()) {
      toast.error("Veuillez saisir un message de réponse");
      return;
    }
    if (replyChannel === "EMAIL" && !replySubject.trim()) {
      toast.error("Veuillez saisir un objet pour l'e-mail");
      return;
    }

    try {
      setIsReplying(true);
      const res = await sendSimMessage({
        sessionId,
        channel: replyChannel,
        priority: "NORMAL",
        senderName: selectedActor.displayName,
        senderEmail: selectedActor.simEmail || undefined,
        senderPhone: selectedActor.simPhone || undefined,
        recipientIds: [selectedParticipant.id],
        body: replyBody,
        subject: replyChannel === "EMAIL" ? replySubject : undefined,
        isFromParticipant: false,
      });

      if (res.success) {
        toast.success(`Réponse envoyée en tant que ${selectedActor.displayName} à ${selectedParticipant.displayName}`);
        setReplyBody("");
        onUpdate();
      } else {
        toast.error(res.error || "Erreur lors de l'envoi de la réponse");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur réseau");
    } finally {
      setIsReplying(false);
    }
  };

  const channelConfigs = {
    EMAIL: { label: "E-mail", icon: Mail, color: "#3b82f6", bg: "bg-blue-950/40 text-blue-300" },
    SMS: { label: "SMS", icon: MessageSquare, color: "#10b981", bg: "bg-emerald-950/40 text-emerald-300" },
    WHATSAPP: { label: "WhatsApp", icon: MessageSquare, color: "#22c55e", bg: "bg-green-950/40 text-green-300" },
    CALL: { label: "Appel", icon: Phone, color: "#ef4444", bg: "bg-red-950/40 text-red-300" },
  };

  return (
    <div className="flex w-full h-[calc(100vh-160px)] bg-[#050914] rounded-2xl overflow-hidden border border-slate-800/80">
      
      {/* Left panel — Actor Creation & List */}
      <div className="w-80 border-r border-slate-800/80 bg-[#060a13] p-4.5 space-y-5 flex flex-col flex-shrink-0 overflow-y-auto no-scrollbar">
        
        {/* Creator Form */}
        <form onSubmit={handleCreateActor} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4.5 space-y-3.5 shadow-xl shadow-black/25">
          <h4 className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <Plus className="h-4 w-4 text-orange-500" />
            Créer un Acteur Externe
          </h4>
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-gray-400 uppercase">Nom de l'entité</Label>
            <Input
              required
              className="h-8.5 text-xs bg-slate-950/40 border-slate-800 text-white rounded-xl focus-visible:ring-orange-500"
              placeholder="ex: ANSSI, Gendarmerie"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-gray-400 uppercase">Rôle / Fonction</Label>
            <Input
              required
              className="h-8.5 text-xs bg-slate-950/40 border-slate-800 text-white rounded-xl focus-visible:ring-orange-500"
              placeholder="ex: Secours, Journaliste"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-gray-400 uppercase">Email fictif (Optionnel)</Label>
            <Input
              className="h-8.5 text-xs bg-slate-950/40 border-slate-800 text-white rounded-xl focus-visible:ring-orange-500"
              placeholder="ex: contact@anssi.gouv.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-gray-400 uppercase">Téléphone fictif (Optionnel)</Label>
            <Input
              className="h-8.5 text-xs bg-slate-950/40 border-slate-800 text-white rounded-xl focus-visible:ring-orange-500"
              placeholder="ex: +33 6 12 34 56 78"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            disabled={isCreating}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white h-9 rounded-xl text-xs font-semibold shadow-md shadow-orange-950/20 active:scale-95 transition-transform duration-200"
          >
            {isCreating ? "Création..." : "Ajouter l'Acteur"}
          </Button>
        </form>

        {/* Actors List */}
        <div className="flex-1 flex flex-col min-h-0 space-y-3">
          <h4 className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <Users className="h-4 w-4 text-orange-500" />
            Acteurs créés ({externalActors.length})
          </h4>
          <div className="space-y-2 flex-1 overflow-y-auto pr-1 no-scrollbar">
            {externalActors.map((actor) => {
              const isSelected = selectedActorId === actor.id;
              return (
                <button
                  key={actor.id}
                  onClick={() => {
                    setSelectedActorId(actor.id);
                    setSelectedParticipantId(null);
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-300 flex items-start gap-3 ${
                    isSelected
                      ? "bg-slate-900 border-orange-500/50 shadow-md shadow-orange-950/5 text-white"
                      : "bg-[#0e1726]/40 border-slate-850 text-gray-400 hover:bg-[#0e1726]/60 hover:text-gray-200"
                  }`}
                >
                  <div className="w-8.5 h-8.5 rounded-xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center font-bold text-xs text-orange-400 flex-shrink-0">
                    {actor.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-xs font-bold truncate text-white">{actor.displayName}</p>
                    <p className="text-[10px] text-orange-400 font-semibold truncate uppercase tracking-wider">{actor.role}</p>
                    <div className="flex gap-2 text-[9px] text-gray-500 truncate pt-0.5">
                      {actor.simEmail && <span>📧 {actor.simEmail.substring(0, 10)}...</span>}
                      {actor.simPhone && <span>📞 {actor.simPhone}</span>}
                    </div>
                  </div>
                </button>
              );
            })}
            {externalActors.length === 0 && (
              <div className="text-center py-10 bg-slate-900/10 rounded-2xl border border-slate-850 border-dashed text-gray-600 text-xs">
                Aucun acteur externe configuré.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Center panel — Participants Discussions */}
      <div className="w-64 border-r border-slate-800/80 bg-[#060a13]/60 flex flex-col flex-shrink-0">
        <div className="p-4.5 border-b border-slate-800/80">
          <h3 className="text-white font-bold text-xs uppercase tracking-widest">Conversations</h3>
          <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed">Fils de discussion initiés avec cet acteur</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 no-scrollbar">
          {selectedActor ? (
            activeConversationParticipants.map((part) => {
              const isSelected = selectedParticipantId === part.id;
              return (
                <button
                  key={part.id}
                  onClick={() => handleSelectParticipant(part.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-300 border ${
                    isSelected
                      ? "bg-slate-900 border-slate-850 text-white shadow-sm"
                      : "bg-transparent border-transparent text-gray-400 hover:bg-[#0e1726]/40 hover:text-gray-300"
                  }`}
                >
                  <p className="text-xs font-bold text-white">{part.displayName}</p>
                  <p className="text-[10px] text-orange-500 font-semibold uppercase tracking-wider mt-0.5">{part.role}</p>
                </button>
              );
            })
          ) : (
            <div className="text-center py-16 text-gray-600 text-xs px-2.5">
              Sélectionnez un acteur externe à gauche.
            </div>
          )}
          {selectedActor && activeConversationParticipants.length === 0 && (
            <div className="text-center py-16 text-gray-600 text-xs px-4">
              <ShieldAlert className="h-6 w-6 mx-auto mb-2 text-slate-700 animate-pulse" />
              <p className="leading-relaxed">Aucune communication initiée par les participants avec cet acteur.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right panel — Chat & Reply Thread */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#080d19]/20">
        {selectedActor && selectedParticipant ? (
          <>
            {/* Thread Header */}
            <div className="p-4.5 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
              <div>
                <h4 className="text-white font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                  Console : {selectedParticipant.displayName} ⇄ {selectedActor.displayName}
                </h4>
                <p className="text-[10px] text-gray-400 mt-1 font-medium">
                  Participant : <span className="text-orange-400 font-semibold">{selectedParticipant.role}</span> ({selectedParticipant.team || "Sans cellule"})
                </p>
              </div>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
              {conversationMessages.map((msg) => {
                const isSentByPart = msg.isFromParticipant;
                const activeCfg = channelConfigs[msg.channel as keyof typeof channelConfigs] || channelConfigs.EMAIL;
                const Icon = activeCfg.icon;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isSentByPart ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl p-4.5 border transition-all duration-300 ${
                        isSentByPart
                          ? "bg-slate-900/60 border-slate-800 text-gray-200 shadow-sm"
                          : "bg-orange-600/10 border-orange-500/30 text-white shadow-md shadow-orange-950/5"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-800/40">
                        <span className={`text-[9px] px-2 py-0.5 rounded-lg font-mono font-bold uppercase flex items-center gap-1 ${activeCfg.bg}`}>
                          <Icon className="h-3 w-3" />
                          {msg.channel}
                        </span>
                        <span className="text-[10px] text-gray-300 font-bold">
                          {isSentByPart ? selectedParticipant.displayName : `Simulé : ${selectedActor.displayName}`}
                        </span>
                        <span className="text-[10px] text-gray-500 ml-auto font-mono">
                          {new Date(msg.triggeredAt).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {msg.subject && (
                        <p className="text-xs font-semibold text-orange-400 mb-1.5">
                          Objet : {msg.subject}
                        </p>
                      )}
                      <p className="text-xs leading-relaxed whitespace-pre-wrap text-gray-300 break-all break-words">
                        {cleanMessageBody(msg.body)}
                      </p>
                      <MessageEmbeds text={msg.body} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input Panel */}
            <div className="p-4.5 border-t border-slate-800/80 bg-slate-900/40 space-y-4 flex-shrink-0">
              
              {/* Channel Selector */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Canal d'Incarnation</Label>
                <div className="flex gap-2.5">
                  {(Object.keys(channelConfigs) as Array<keyof typeof channelConfigs>).map((ch) => {
                    const cfg = channelConfigs[ch];
                    const Icon = cfg.icon;
                    const isSelected = replyChannel === ch;

                    return (
                      <button
                        key={ch}
                        onClick={() => {
                          setReplyChannel(ch);
                          if (ch === "EMAIL" && !replySubject) {
                            setReplySubject("Re: Communication");
                          }
                        }}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                          isSelected
                            ? "text-white border-orange-500/40 shadow-sm"
                            : "text-gray-400 border-slate-800 hover:border-slate-700 hover:bg-slate-950/20"
                        }`}
                        style={isSelected ? { background: `${cfg.color}15`, borderColor: cfg.color } : {}}
                      >
                        <Icon className="h-3.5 w-3.5" style={{ color: cfg.color }} />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subject if EMAIL */}
              {replyChannel === "EMAIL" && (
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase">Objet de l'e-mail</Label>
                  <Input
                    className="h-8.5 text-xs bg-slate-950/40 border-slate-800 text-white rounded-xl focus-visible:ring-orange-500"
                    placeholder="Sujet de l'email..."
                    value={replySubject}
                    onChange={(e) => setReplySubject(e.target.value)}
                  />
                </div>
              )}

              {/* Message Content */}
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-gray-400 uppercase">Votre réponse incarnée</Label>
                <Textarea
                  className="text-xs bg-slate-950/40 border-slate-800 text-white rounded-xl resize-none placeholder-gray-600 focus-visible:ring-orange-500"
                  rows={3}
                  placeholder={`Rédigez la réponse à transmettre au participant en incarnant ${selectedActor.displayName}...`}
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                />
              </div>

              {/* Action button */}
              <div className="flex justify-between items-center pt-1.5">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Cette réponse alimentera le flux de communication du participant en direct.</span>
                </div>
                <Button
                  onClick={handleSendReply}
                  disabled={isReplying || !replyBody.trim() || (replyChannel === "EMAIL" && !replySubject.trim())}
                  className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 gap-2 h-9 text-xs font-semibold px-4.5 rounded-xl shadow-md shadow-orange-950/20 active:scale-95 transition-transform"
                >
                  <Send className="h-3.5 w-3.5" />
                  {isReplying ? "Envoi..." : `Transmettre au participant`}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500 bg-slate-950/10 rounded-2xl border border-slate-900">
            <Users className="h-12 w-12 text-slate-700 mb-4 animate-pulse" />
            <h4 className="text-white font-semibold text-sm">Aucune discussion sélectionnée</h4>
            <p className="text-xs text-gray-600 mt-1 max-w-xs leading-relaxed">
              Sélectionnez un acteur externe à gauche, puis cliquez sur une conversation de participant pour commencer à y répondre.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
