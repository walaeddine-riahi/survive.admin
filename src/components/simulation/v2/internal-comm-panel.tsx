"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Mail, Phone, MessageSquare, Send, Users, ShieldAlert, FileText, Bell, Share2, Search, Check,
} from "lucide-react";
import { sendSimMessage } from "@/actions/simulation/sim-session-actions";

interface InternalCommPanelProps {
  sessionId: string;
  participant: any;
  participants: any[];
}

export default function InternalCommPanel({
  sessionId,
  participant,
  participants,
}: InternalCommPanelProps) {
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
  const [channel, setChannel] = useState<"EMAIL" | "SMS" | "WHATSAPP" | "CALL" | "ALERT" | "MEDIA">("EMAIL");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [search, setSearch] = useState("");

  // Get only internal participants (not external actors) and not me
  const internalParticipants = participants.filter((p) => p.isExternal !== true && p.id !== participant.id);
  
  const filteredParticipants = internalParticipants.filter(p => 
    p.displayName.toLowerCase().includes(search.toLowerCase()) ||
    p.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = async () => {
    if (selectedRecipientIds.length === 0) {
      toast.error("Veuillez sélectionner au moins un destinataire");
      return;
    }
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
        recipientIds: selectedRecipientIds,
        body,
        subject: channel === "EMAIL" ? subject : undefined,
        isFromParticipant: true,
        fromParticipantId: participant.id,
      });

      if (res.success) {
        toast.success(`Message envoyé par ${channel} aux participants sélectionnés`);
        setBody("");
        setSubject("");
        setSelectedRecipientIds([]);
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
    ALERT: { label: "Alerte", icon: Bell, color: "#EF4444", bg: "bg-red-950/40 text-red-300" },
    MEDIA: { label: "Média", icon: Share2, color: "#8B5CF6", bg: "bg-purple-950/40 text-purple-300" },
  };

  return (
    <div className="flex w-full h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
      {/* Sidebar with recipients list */}
      <div className="w-64 border-r border-gray-800 bg-gray-900/60 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <Users className="h-4 w-4 text-orange-500" />
            Destinataires
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Sélectionnez un ou plusieurs participants
          </p>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 bg-slate-800/50 border-slate-700 text-xs text-white"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredParticipants.map((p) => {
            const isSelected = selectedRecipientIds.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => {
                  if (isSelected) {
                    setSelectedRecipientIds(prev => prev.filter(id => id !== p.id));
                  } else {
                    setSelectedRecipientIds(prev => [...prev, p.id]);
                  }
                }}
                className={`w-full text-left p-3 rounded-lg transition-all flex items-start gap-2.5 ${
                  isSelected
                    ? "bg-orange-600/10 text-white border border-orange-500/30"
                    : "text-gray-400 hover:bg-gray-800/40 border border-transparent"
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                  isSelected ? "bg-orange-500 text-white" : "bg-gray-800 text-gray-400"
                }`}>
                  {isSelected ? <Check className="h-3 w-3" /> : p.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate text-white">
                    {p.displayName}
                  </p>
                  <p className="text-[10px] text-gray-500 font-medium truncate mt-0.5">
                    {p.role}
                  </p>
                </div>
              </button>
            );
          })}
          {filteredParticipants.length === 0 && (
            <div className="text-center py-8 px-4 text-gray-600 text-xs">
              <ShieldAlert className="h-6 w-6 mx-auto mb-2 opacity-30" />
              <p>Aucun participant trouvé.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main form area */}
      <div className="flex-1 flex flex-col bg-gray-950/40 min-w-0 p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full space-y-6">
          <div>
            <h4 className="text-white font-bold text-lg">Nouvelle Transmission</h4>
            <p className="text-xs text-gray-500 mt-1">
              Envoyez une communication spécifique aux participants sélectionnés.
            </p>
          </div>

          {/* Selected Recipients Chips */}
          {selectedRecipientIds.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-gray-900/50 rounded-lg border border-gray-800">
              <span className="text-xs text-gray-500 flex items-center">À :</span>
              {selectedRecipientIds.map(id => {
                const p = participants.find(part => part.id === id);
                return (
                  <span key={id} className="bg-orange-500/10 text-orange-400 text-xs px-2 py-1 rounded-full flex items-center gap-1 border border-orange-500/20">
                    {p?.displayName || id}
                    <button onClick={() => setSelectedRecipientIds(prev => prev.filter(rid => rid !== id))} className="hover:text-red-400">
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Channel Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-400 uppercase">Canal de transmission</Label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(channelConfigs) as Array<keyof typeof channelConfigs>).map((ch) => {
                const cfg = channelConfigs[ch];
                const Icon = cfg.icon;
                const isSelected = channel === ch;

                return (
                  <button
                    key={ch}
                    onClick={() => setChannel(ch)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
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
          </div>

          {/* Subject (Only for Email) */}
          {channel === "EMAIL" && (
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-xs font-bold text-gray-400 uppercase">Objet de l'e-mail</Label>
              <Input
                id="subject"
                placeholder="Saisissez l'objet..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-gray-900/50 border-gray-800 text-white"
              />
            </div>
          )}

          {/* Body */}
          <div className="space-y-2">
            <Label htmlFor="body" className="text-xs font-bold text-gray-400 uppercase">Message</Label>
            <Textarea
              id="body"
              placeholder={`Saisissez votre message ici...`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[200px] bg-gray-900/50 border-gray-800 text-white text-sm"
            />
          </div>

          {/* Send Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSend}
              disabled={isSending || selectedRecipientIds.length === 0 || !body.trim()}
              className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {isSending ? "Envoi en cours..." : "Transmettre le message"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
