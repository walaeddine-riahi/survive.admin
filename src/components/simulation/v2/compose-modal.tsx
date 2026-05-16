"use client";

import { useState } from "react";
import { X, Mail, MessageSquare, Bell, FileText, Globe, Zap, Radio, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import all specific V1 forms
import EmailComposeForm from "@/components/participant-mode/communication-forms/EmailComposeForm";
import SmsComposeForm from "@/components/participant-mode/communication-forms/SmsComposeForm";
import CallComposeForm from "@/components/participant-mode/communication-forms/CallComposeForm";
import AlertComposeForm from "@/components/participant-mode/communication-forms/AlertComposeForm";
import MemoComposeForm from "@/components/participant-mode/communication-forms/MemoComposeForm";
import NewsBroadcastComposeForm from "@/components/participant-mode/communication-forms/NewsBroadcastComposeForm";
import NewspaperComposeForm from "@/components/participant-mode/communication-forms/NewspaperComposeForm";
import SocialComposeForm from "@/components/participant-mode/communication-forms/SocialComposeForm";

const ACTIONS = [
  { id: "EMAIL", label: "Email", icon: Mail, color: "#185FA5", form: EmailComposeForm },
  { id: "SMS", label: "SMS", icon: MessageSquare, color: "#0F6E56", form: SmsComposeForm },
  { id: "CALL", label: "Appel Vocal", icon: Phone, color: "#A32D2D", form: CallComposeForm },
  { id: "WHATSAPP", label: "WhatsApp", icon: MessageSquare, color: "#25D366", form: MemoComposeForm },
  { id: "SOCIAL", label: "Réseau Social", icon: Globe, color: "#1DA1F2", form: SocialComposeForm },
  { id: "NEWS", label: "Journal TV/Radio", icon: Radio, color: "#3B6D11", form: NewsBroadcastComposeForm },
  { id: "NEWSPAPER", label: "Presse Écrite", icon: FileText, color: "#534AB7", form: NewspaperComposeForm },
  { id: "ALERT", label: "Alerte Flash", icon: Bell, color: "#A32D2D", form: AlertComposeForm },
];

export default function ComposeModal({
  isOpen,
  onClose,
  simulationId,
  participantId,
}: {
  isOpen: boolean;
  onClose: () => void;
  simulationId: string;
  participantId: string;
}) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  if (!isOpen) return null;

  const ActiveForm = selectedAction 
    ? ACTIONS.find(a => a.id === selectedAction)?.form 
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {selectedAction ? (
              <>
                <button 
                  onClick={() => setSelectedAction(null)}
                  className="text-gray-400 hover:text-white mr-2"
                >
                  ← Retour
                </button>
                {ACTIONS.find(a => a.id === selectedAction)?.label}
              </>
            ) : (
              "Nouvelle Action / Message"
            )}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-full p-2 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selectedAction ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => setSelectedAction(action.id)}
                    className="flex flex-col items-center justify-center p-6 gap-3 rounded-xl border border-gray-800 bg-gray-800/30 hover:bg-gray-800 transition-all hover:scale-105 group"
                  >
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `\${action.color}20`, color: action.color }}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium text-gray-200">{action.label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-950 rounded-lg p-4 border border-gray-800">
              {ActiveForm && (
                <ActiveForm 
                  onSubmit={() => {
                    // On submit success from the V1 forms, we close the modal
                    onClose();
                  }}
                  onCancel={() => setSelectedAction(null)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
