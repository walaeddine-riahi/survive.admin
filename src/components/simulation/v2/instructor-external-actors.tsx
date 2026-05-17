"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Mail, Phone, MessageSquare, Send, Users, ShieldAlert, Plus,
} from "lucide-react";
import { addExternalActor, sendSimMessage } from "@/actions/simulation/sim-session-actions";

interface InstructorExternalActorsMonitorProps {
  sessionId: string;
  participants: any[];
  initialMessages: any[];
  onUpdate: () => void;
}

export default function InstructorExternalActorsMonitor({
  sessionId,
  participants,
  initialMessages,
  onUpdate,
}: InstructorExternalActorsMonitorProps) {
  // Forms states
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Active view states
  const [selectedActorId, setSelectedActorId] = useState<string | null>(null);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const [replyChannel, setReplyChannel] = useState<"EMAIL" | "SMS" | "WHATSAPP" | "CALL">("EMAIL");
  const [isReplying, setIsReplying] = useState(false);

  // Filter external actors
  const externalActors = participants.filter((p) => p.isExternal === true);
  const selectedActor = externalActors.find((p) => p.id === selectedActorId);

  // Real participants (for linking conversations)
  const realParticipants = participants.filter((p) => !p.isInstructor && !p.isObserver && !p.isExternal);
  const selectedParticipant = realParticipants.find((p) => p.id === selectedParticipantId);

  // Group participants who have conversations with the selected actor
  const activeConversationParticipants = selectedActor
    ? realParticipants.filter((p) => {
        // Check if there are any messages exchanged between this participant and the selected actor
        return initialMessages.some((m) => {
          const isSentByPartToActor =
            m.isFromParticipant &&
            m.fromParticipantId === p.id &&
            m.recipientIds?.includes(selectedActor.id);
          const isReceivedByPartFromActor =
            !m.isFromParticipant &&
            m.senderName === selectedActor.displayName &&
            m.recipientIds?.includes(p.id);
          return isSentByPartToActor || isReceivedByPartFromActor;
        });
      })
    : [];

  // Get messages for active participant & actor conversation
  const conversationMessages = (selectedActor && selectedParticipant)
    ? initialMessages
        .filter((m) => {
          const isSentByPartToActor =
            m.isFromParticipant &&
            m.fromParticipantId === selectedParticipant.id &&
            m.recipientIds?.includes(selectedActor.id);
          const isReceivedByPartFromActor =
            !m.isFromParticipant &&
            m.senderName === selectedActor.displayName &&
            m.recipientIds?.includes(selectedParticipant.id);
          return isSentByPartToActor || isReceivedByPartFromActor;
        })
        .sort((a, b) => new Date(a.triggeredAt).getTime() - new Date(b.triggeredAt).getTime())
    : [];

  // Automatically update reply channel and subject when a new message is received in the active conversation
  useEffect(() => {
    if (conversationMessages.length > 0) {
      const lastMsg = conversationMessages[conversationMessages.length - 1];
      // Switch the reply channel to match the last message's channel
      setReplyChannel(lastMsg.channel as any);
      if (lastMsg.channel === "EMAIL") {
        setReplySubject(lastMsg.subject ? (lastMsg.subject.startsWith("Re:") ? lastMsg.subject : `Re: ${lastMsg.subject}`) : "Re: Communication");
      } else {
        setReplySubject("");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationMessages.length]);

  // Pre-fill last channel/subject when switching participants
  const handleSelectParticipant = (partId: string) => {
    setSelectedParticipantId(partId);
    setReplyBody("");
    
    // Find last message in this conversation to match channel and subject
    const actor = externalActors.find((p) => p.id === selectedActorId);
    if (!actor) return;

    const conv = initialMessages
      .filter((m) => {
        const isSentByPartToActor =
          m.isFromParticipant &&
          m.fromParticipantId === partId &&
          m.recipientIds?.includes(actor.id);
        const isReceivedByPartFromActor =
          !m.isFromParticipant &&
          m.senderName === actor.displayName &&
          m.recipientIds?.includes(partId);
        return isSentByPartToActor || isReceivedByPartFromActor;
      })
      .sort((a, b) => new Date(a.triggeredAt).getTime() - new Date(b.triggeredAt).getTime());

    if (conv.length > 0) {
      const lastMsg = conv[conv.length - 1];
      setReplyChannel(lastMsg.channel as any);
      if (lastMsg.channel === "EMAIL") {
        setReplySubject(lastMsg.subject ? (lastMsg.subject.startsWith("Re:") ? lastMsg.subject : `Re: ${lastMsg.subject}`) : "Re: Communication");
      } else {
        setReplySubject("");
      }
    } else {
      setReplyChannel("EMAIL");
      setReplySubject("Re: Communication");
    }
  };

  const handleCreateActor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) {
      toast.error("Veuillez saisir un nom et un rôle");
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
    EMAIL: { label: "E-mail", icon: Mail, color: "#185FA5", bg: "bg-blue-950/40 text-blue-300" },
    SMS: { label: "SMS", icon: MessageSquare, color: "#0F6E56", bg: "bg-emerald-950/40 text-emerald-300" },
    WHATSAPP: { label: "WhatsApp", icon: MessageSquare, color: "#25D366", bg: "bg-green-950/40 text-green-300" },
    CALL: { label: "Appel", icon: Phone, color: "#EA580C", bg: "bg-orange-950/40 text-orange-300" },
  };

  return (
    <div className="flex w-full h-[calc(100vh-100px)] bg-gray-950">
      {/* Left panel — Actor Creation & List */}
      <div className="w-80 border-r border-gray-800 bg-gray-900/40 p-4 space-y-5 flex flex-col flex-shrink-0 overflow-y-auto">
        {/* Creator Form */}
        <form onSubmit={handleCreateActor} className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
          <h4 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-800 pb-2">
            <Plus className="h-4 w-4 text-orange-500" />
            Créer un Acteur Externe
          </h4>
          <div>
            <Label className="text-[10px] text-gray-400">Nom de l'entité</Label>
            <Input
              required
              className="mt-1 h-8 text-xs bg-gray-800 border-gray-700 text-white"
              placeholder="ex: ANSSI, Police Nationale"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-[10px] text-gray-400">Rôle / Fonction</Label>
            <Input
              required
              className="mt-1 h-8 text-xs bg-gray-800 border-gray-700 text-white"
              placeholder="ex: Régulateur, Secours"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-[10px] text-gray-400">Email Fictif (Optionnel)</Label>
            <Input
              className="mt-1 h-8 text-xs bg-gray-800 border-gray-700 text-white"
              placeholder="ex: contact@anssi.gouv.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-[10px] text-gray-400">Téléphone Fictif (Optionnel)</Label>
            <Input
              className="mt-1 h-8 text-xs bg-gray-800 border-gray-700 text-white"
              placeholder="ex: +33612345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            disabled={isCreating}
            className="w-full bg-orange-600 hover:bg-orange-700 h-8 text-xs font-bold"
          >
            {isCreating ? "Création..." : "Ajouter l'Acteur"}
          </Button>
        </form>

        {/* Actors List */}
        <div className="flex-1 flex flex-col min-h-0">
          <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Users className="h-4 w-4 text-orange-500" />
            Acteurs définis ({externalActors.length})
          </h4>
          <div className="space-y-1.5 flex-1 overflow-y-auto">
            {externalActors.map((actor) => (
              <button
                key={actor.id}
                onClick={() => {
                  setSelectedActorId(actor.id);
                  setSelectedParticipantId(null);
                }}
                className={`w-full text-left p-3 rounded-lg border transition-all flex items-start gap-2.5 ${
                  selectedActorId === actor.id
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-gray-900/30 border-gray-800 text-gray-400 hover:bg-gray-800/40"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-orange-600/10 border border-orange-500/20 flex items-center justify-center font-bold text-xs text-orange-400 flex-shrink-0">
                  {actor.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate text-white">{actor.displayName}</p>
                  <p className="text-[10px] text-orange-400 font-medium truncate mt-0.5">{actor.role}</p>
                  <div className="flex gap-2 text-[9px] text-gray-500 mt-1 truncate">
                    {actor.simEmail && <span>📧 {actor.displayName.toLowerCase().substring(0, 5)}...</span>}
                    {actor.simPhone && <span>📞 {actor.simPhone}</span>}
                  </div>
                </div>
              </button>
            ))}
            {externalActors.length === 0 && (
              <div className="text-center py-8 text-gray-600 text-xs">
                Aucun acteur externe créé.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Center panel — Participants Discussions */}
      <div className="w-64 border-r border-gray-800 bg-gray-900/20 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-white font-bold text-xs uppercase tracking-wider">Conversations</h3>
          <p className="text-[10px] text-gray-500 mt-1">Participants en discussion avec cet acteur</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {selectedActor ? (
            activeConversationParticipants.map((part) => (
              <button
                key={part.id}
                onClick={() => handleSelectParticipant(part.id)}
                className={`w-full text-left p-3 rounded-lg transition-all border ${
                  selectedParticipantId === part.id
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-transparent border-transparent text-gray-400 hover:bg-gray-800/40"
                }`}
              >
                <p className="text-xs font-bold text-white">{part.displayName}</p>
                <p className="text-[10px] text-gray-500 truncate mt-0.5">{part.role}</p>
              </button>
            ))
          ) : (
            <div className="text-center py-12 text-gray-600 text-xs px-2">
              Sélectionnez un acteur externe à gauche.
            </div>
          )}
          {selectedActor && activeConversationParticipants.length === 0 && (
            <div className="text-center py-12 text-gray-600 text-xs px-2">
              <ShieldAlert className="h-6 w-6 mx-auto mb-2 opacity-30" />
              <p>Aucune communication initiée par les participants avec cet acteur.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right panel — Chat & Reply Thread */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-950/20">
        {selectedActor && selectedParticipant ? (
          <>
            {/* Thread Header */}
            <div className="p-4 border-b border-gray-800 bg-gray-900/30 flex items-center justify-between">
              <div>
                <h4 className="text-white font-bold text-xs uppercase tracking-wider">
                  Discussion : {selectedParticipant.displayName} ⇄ {selectedActor.displayName}
                </h4>
                <p className="text-[10px] text-gray-500 mt-1">
                  Participant : {selectedParticipant.role} ({selectedParticipant.team || "Sans cellule"})
                </p>
              </div>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                      className={`max-w-[75%] rounded-xl p-3 border ${
                        isSentByPart
                          ? "bg-gray-900 border-gray-800 text-gray-200"
                          : "bg-orange-600/10 border-orange-500/30 text-white"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase flex items-center gap-1 ${activeCfg.bg}`}>
                          <Icon className="h-2.5 w-2.5" />
                          {msg.channel}
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold">
                          {isSentByPart ? selectedParticipant.displayName : `Simulé : ${selectedActor.displayName}`}
                        </span>
                        <span className="text-[10px] text-gray-500 ml-auto">
                          {new Date(msg.triggeredAt).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {msg.subject && (
                        <p className="text-xs font-semibold text-orange-400 mb-1">
                          Objet : {msg.subject}
                        </p>
                      )}
                      <p className="text-xs leading-relaxed whitespace-pre-wrap">
                        {msg.body}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input Panel */}
            <div className="p-4 border-t border-gray-800 bg-gray-900/20 space-y-3 flex-shrink-0">
              {/* Channel Selector */}
              <div className="flex gap-2">
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
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                        isSelected
                          ? "text-white border-orange-500/40"
                          : "text-gray-400 border-gray-800 hover:bg-gray-800/40"
                      }`}
                      style={isSelected ? { background: `${cfg.color}15` } : {}}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: cfg.color }} />
                      {cfg.label}
                    </button>
                  );
                })}
              </div>

              {/* Subject if EMAIL */}
              {replyChannel === "EMAIL" && (
                <div>
                  <Label className="text-[10px] text-gray-400">Objet de l'e-mail</Label>
                  <Input
                    className="mt-1 h-8 text-xs bg-gray-800 border-gray-700 text-white"
                    placeholder="Sujet du message..."
                    value={replySubject}
                    onChange={(e) => setReplySubject(e.target.value)}
                  />
                </div>
              )}

              {/* Message Content */}
              <div>
                <Label className="text-[10px] text-gray-400">Votre réponse incarnée</Label>
                <Textarea
                  className="mt-1 text-xs bg-gray-800 border-gray-700 text-white resize-none"
                  rows={3}
                  placeholder={`Répondre au participant en tant que ${selectedActor.displayName}...`}
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                />
              </div>

              {/* Action button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSendReply}
                  disabled={isReplying || !replyBody.trim() || (replyChannel === "EMAIL" && !replySubject.trim())}
                  className="bg-orange-600 hover:bg-orange-700 gap-1.5 h-8 text-xs font-semibold px-4"
                >
                  <Send className="h-3.5 w-3.5" />
                  {isReplying ? "Envoi..." : `Répondre en tant que ${selectedActor.displayName}`}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500">
            <Users className="h-12 w-12 text-gray-700 mb-3" />
            <h4 className="text-white font-semibold text-sm">Aucune discussion sélectionnée</h4>
            <p className="text-xs text-gray-600 mt-1 max-w-xs">
              Sélectionnez un acteur externe à gauche, puis cliquez sur une conversation de participant pour y répondre.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
