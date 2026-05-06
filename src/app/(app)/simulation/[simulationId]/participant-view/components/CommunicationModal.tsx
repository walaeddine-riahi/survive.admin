import React from "react";
import { X, Calendar, User, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Communication } from "../types";
import { formatDate, getChannelGradient } from "../constants";
import { getIconForType } from "../icons";

interface CommunicationModalProps {
  communication: Communication;
  onClose: () => void;
}



export function CommunicationModal({ communication, onClose }: CommunicationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-primary)]/80 backdrop-blur-md animate-fade-in p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] bg-[var(--bg-surface)] shadow-2xl rounded-3xl border border-[var(--border)] overflow-hidden flex flex-col">
        <div className={`bg-gradient-to-r ${getChannelGradient(communication.type)} px-8 py-6 border-b border-white/10`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl border border-white/20 shadow-inner">
                {getIconForType(communication.type)}
              </div>
              <h2 className="text-2xl font-serif font-black text-white truncate max-w-[70%]">
                {communication.subject || "Communication"}
              </h2>
            </div>
            <Button size="icon" variant="ghost" className="text-white/80 hover:bg-white/20 hover:text-white rounded-xl" onClick={onClose}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-white/90">
            <div className="flex items-center bg-white/15 px-3 py-1.5 rounded-lg border border-white/10">
              <Calendar className="h-3.5 w-3.5 mr-2" />
              <span>{formatDate(communication.createdAt)}</span>
            </div>
            {communication.sender && (
              <div className="flex items-center bg-white/15 px-3 py-1.5 rounded-lg border border-white/10">
                <User className="h-3.5 w-3.5 mr-2" />
                <span>De: {communication.sender.firstName} {communication.sender.lastName}</span>
              </div>
            )}
            {communication.recipient && (
              <div className="flex items-center bg-white/15 px-3 py-1.5 rounded-lg border border-white/10">
                <Mail className="h-3.5 w-3.5 mr-2" />
                <span>À: {communication.recipient.firstName} {communication.recipient.lastName}</span>
              </div>
            )}
          </div>
        </div>
        <CardContent className="p-8 overflow-y-auto flex-1">
          <div className="text-[var(--text-primary)] text-lg leading-relaxed mb-8 whitespace-pre-line break-words opacity-90 font-medium">
            {communication.content}
          </div>
          <div className="flex justify-end pt-8 border-t border-[var(--border)]">
            <Button variant="outline" className="border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] font-bold rounded-xl px-8" onClick={onClose}>Fermer</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
