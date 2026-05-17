"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Mail, Phone, MessageSquare, Send, Users, ShieldAlert,
} from "lucide-react";
import { sendSimMessage } from "@/actions/simulation/sim-session-actions";

interface ExternalChatPanelProps {
  sessionId: string;
  participant: any;
  participants: any[];
  initialMessages: any[];
}

export default function ExternalChatPanel({
  sessionId,
  participant,
  participants,
  initialMessages,
}: ExternalChatPanelProps) {
  const [selectedActorId, setSelectedActorId] = useState<string | null>(null);
  const [channel, setChannel] = useState<"EMAIL" | "SMS" | "WHATSAPP" | "CALL">("EMAIL");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Get only external actors (isExternal === true)
  const externalActors = participants.filter((p) => p.isExternal === true);
  const selectedActor = externalActors.find((p) => p.id === selectedActorId);

  // Get conversation messages for selected actor
  const conversationMessages = selectedActor
    ? initialMessages
        .filter((m) => {
          const isSentByMeToActor =
            m.isFromParticipant &&
            m.fromParticipantId === participant.id &&
            m.recipientIds?.includes(selectedActor.id);
          const isReceivedFromActor =
            !m.isFromParticipant &&
            m.senderName === selectedActor.displayName &&
            m.recipientIds?.includes(participant.id);
          return isSentByMeToActor || isReceivedFromActor;
        })
        .sort((a, b) => new Date(a.triggeredAt).getTime() - new Date(b.triggeredAt).getTime())
    : [];

  const handleSend = async () => {
    if (!selectedActor) return;
    if (!body.trim()) {
      toast.error("Veuillez saisir un message");
      return;
    }
    if (channel === "EMAIL" && !subject.trim()) {
      toast.error("Veuillez saisir un objet pour l'e-mail");
      return;
    }

    try {
      setIsSending(true);
      const res = await sendSimMessage({
        sessionId,
        channel,
        priority: "NORMAL",
        senderName: participant.displayName,
        senderEmail: participant.simEmail || undefined,
        senderPhone: participant.simPhone || undefined,
        recipientIds: [selectedActor.id],
        body,
        subject: channel === "EMAIL" ? subject : undefined,
        isFromParticipant: true,
        fromParticipantId: participant.id,
      });

      if (res.success) {
        toast.success(`Message envoyé par ${channel} à ${selectedActor.displayName}`);
        setBody("");
        setSubject("");
      } else {
        toast.error(res.error || "Erreur lors de l'envoi du message");
      }
    } catch (e) {
      console.error(e);
      toast.error("Erreur réseau lors de l'envoi");
    } finally {
      setIsSending(false);
    }
  };

  const channelConfigs = {
    EMAIL: { label: "E-mail", icon: Mail, color: "#185FA5", bg: "bg-blue-950/40 text-blue-300" },
    SMS: { label: "SMS", icon: MessageSquare, color: "#0F6E56", bg: "bg-emerald-950/40 text-emerald-300" },
    WHATSAPP: { label: "WhatsApp", icon: MessageSquare, color: "#25D366", bg: "bg-green-950/40 text-green-300" },
    CALL: { label: "Appel", icon: Phone, color: "#EA580C", bg: "bg-orange-950/40 text-orange-300" },
  };

  return (
    <div className="flex w-full h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
      {/* Sidebar with external actors list */}
      <div className="w-64 border-r border-gray-800 bg-gray-900/60 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <Users className="h-4 w-4 text-orange-500" />
            Acteurs Externes
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Entités externes simulées à contacter
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {externalActors.map((actor) => (
            <button
              key={actor.id}
              onClick={() => {
                setSelectedActorId(actor.id);
                setBody("");
                setSubject("");
              }}
              className={`w-full text-left p-3 rounded-lg transition-all flex items-start gap-2.5 ${
                selectedActorId === actor.id
                  ? "bg-gray-800/80 text-white border border-gray-700"
                  : "text-gray-400 hover:bg-gray-800/40"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-orange-600/10 border border-orange-500/20 flex items-center justify-center font-bold text-xs text-orange-400 flex-shrink-0">
                {actor.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate text-white">
                  {actor.displayName}
                </p>
                <p className="text-[10px] text-orange-400 font-medium truncate mt-0.5">
                  {actor.role}
                </p>
              </div>
            </button>
          ))}
          {externalActors.length === 0 && (
            <div className="text-center py-8 px-4 text-gray-600 text-xs">
              <ShieldAlert className="h-6 w-6 mx-auto mb-2 opacity-30" />
              <p>Aucun acteur externe défini par l'instructeur pour le moment.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main chat window */}
      <div className="flex-1 flex flex-col bg-gray-950/40 min-w-0">
        {selectedActor ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-800 bg-gray-900/30 flex items-center justify-between">
              <div>
                <h4 className="text-white font-bold text-sm">{selectedActor.displayName}</h4>
                <div className="flex gap-3 text-[10px] text-gray-500 mt-1">
                  {selectedActor.simEmail && <span>📧 {selectedActor.simEmail}</span>}
                  {selectedActor.simPhone && <span>📞 {selectedActor.simPhone}</span>}
                </div>
              </div>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {conversationMessages.map((msg) => {
                const isSentByMe = msg.isFromParticipant;
                const activeCfg = channelConfigs[msg.channel as keyof typeof channelConfigs] || channelConfigs.EMAIL;
                const Icon = activeCfg.icon;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isSentByMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-xl p-3 border ${
                        isSentByMe
                          ? "bg-orange-600/10 border-orange-500/30 text-white"
                          : "bg-gray-900 border-gray-800 text-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase flex items-center gap-1 ${activeCfg.bg}`}>
                          <Icon className="h-2.5 w-2.5" />
                          {msg.channel}
                        </span>
                        <span className="text-[10px] text-gray-500">
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
              {conversationMessages.length === 0 && (
                <div className="text-center py-16 text-gray-600 text-xs">
                  <p>Aucun échange avec cet acteur.</p>
                  <p className="mt-1">Choisissez un canal ci-dessous pour initier la communication.</p>
                </div>
              )}
            </div>

            {/* Input Panel */}
            <div className="p-4 border-t border-gray-800 bg-gray-900/20 space-y-3 flex-shrink-0">
              {/* Channel Selector */}
              <div className="flex gap-2">
                {(Object.keys(channelConfigs) as Array<keyof typeof channelConfigs>).map((ch) => {
                  const cfg = channelConfigs[ch];
                  const Icon = cfg.icon;
                  const isSelected = channel === ch;

                  return (
                    <button
                      key={ch}
                      onClick={() => setChannel(ch)}
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
              {channel === "EMAIL" && (
                <div>
                  <Label className="text-[10px] text-gray-400">Objet de l'e-mail</Label>
                  <Input
                    className="mt-1 h-8 text-xs bg-gray-800 border-gray-700 text-white"
                    placeholder="Sujet du message..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
              )}

              {/* Message Content */}
              <div>
                <Label className="text-[10px] text-gray-400">Votre message</Label>
                <Textarea
                  className="mt-1 text-xs bg-gray-800 border-gray-700 text-white resize-none"
                  rows={3}
                  placeholder={`Rédigez votre message ${channelConfigs[channel].label.toLowerCase()}...`}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </div>

              {/* Action buttons */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSend}
                  disabled={isSending || !body.trim() || (channel === "EMAIL" && !subject.trim())}
                  className="bg-orange-600 hover:bg-orange-700 gap-1.5 h-8 text-xs font-semibold px-4"
                >
                  <Send className="h-3.5 w-3.5" />
                  {isSending ? "Envoi..." : "Envoyer"}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500">
            <Users className="h-12 w-12 text-gray-700 mb-3" />
            <h4 className="text-white font-semibold text-sm">Aucun acteur sélectionné</h4>
            <p className="text-xs text-gray-600 mt-1 max-w-xs">
              Sélectionnez un acteur externe dans la liste de gauche pour démarrer une communication simulée.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
