import React from "react";
import { X, Calendar, FileText, Check, Paperclip, Download } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Injection } from "../types";
import { formatDate, getInjectionGradient, getFileType } from "../constants";
import { getIconForType } from "../icons";

interface InjectionModalProps {
  injection: Injection;
  onClose: () => void;
  onAcknowledge: (id: string) => void;
}



export function InjectionModal({ injection, onClose, onAcknowledge }: InjectionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-primary)]/80 backdrop-blur-md animate-fade-in p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] bg-[var(--bg-surface)] shadow-2xl rounded-3xl border border-[var(--border)] overflow-hidden flex flex-col">
        <div className={`bg-gradient-to-r ${getInjectionGradient(injection.type)} px-8 py-6 border-b border-white/10`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl border border-white/20 shadow-inner">
                {getIconForType(injection.type)}
              </div>
              <h2 className="text-2xl font-serif font-black text-white leading-tight truncate max-w-[70%]">
                {injection.title}
              </h2>
            </div>
            <Button size="icon" variant="ghost" className="text-white/80 hover:bg-white/20 hover:text-white rounded-xl" onClick={onClose}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-white/90">
            <div className="flex items-center bg-white/15 px-3 py-1.5 rounded-lg border border-white/10">
              <Calendar className="h-3.5 w-3.5 mr-2" />
              <span>{formatDate(injection.createdAt)}</span>
            </div>
            {injection.scenarioName && (
              <div className="flex items-center bg-white/15 px-3 py-1.5 rounded-lg border border-white/10">
                <FileText className="h-3.5 w-3.5 mr-2" />
                <span>Scénario : {injection.scenarioName}</span>
              </div>
            )}
            {!injection.acknowledged && (
              <span className="ml-auto bg-white/25 px-3 py-1.5 rounded-lg text-[9px] font-black flex items-center border border-white/20">
                <span className="h-2 w-2 rounded-full bg-yellow-300 mr-2 animate-pulse shadow-[0_0_8px_rgba(253,224,71,0.5)]"></span>
                NON LU
              </span>
            )}
          </div>
        </div>
        <CardContent className="p-8 overflow-y-auto flex-1">
          <div className="text-[var(--text-primary)] text-lg leading-relaxed mb-10 whitespace-pre-line break-words opacity-90 font-medium">
            {injection.content}
          </div>
          {injection.imageUrl && (
            <div className="mb-10 rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--bg-secondary)] shadow-sm">
              <Image src={injection.imageUrl} alt={injection.title} width={800} height={450} className="w-full h-auto object-cover" />
            </div>
          )}
          {injection.videoUrl && (
            <div className="mb-10 rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--bg-secondary)] shadow-lg aspect-video w-full">
              {(injection.videoUrl.includes("youtube.com") || injection.videoUrl.includes("youtu.be")) ? (() => {
                const videoId = injection.videoUrl.match(/(?:youtu[.]be[/]|youtube[.]com[/](?:embed[/]|v[/]|watch[?]v=|watch[?].+&v=))([^"&?/ ]{11})/)?.[1];
                return videoId ? (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Vidéo YouTube"
                  />
                ) : (
                  <video
                    src={injection.videoUrl}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-full bg-black"
                  />
                );
              })() : (
                <video
                  src={injection.videoUrl}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full bg-black"
                />
              )}
            </div>
          )}
          {injection.attachments && injection.attachments.length > 0 && (
            <div className="mb-10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)] mb-4 flex items-center">
                <Paperclip className="h-4 w-4 mr-2" />
                Pièces jointes ({injection.attachments.length})
              </h4>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                {injection.attachments.map((attachment, index) => (
                  <a key={index} href={attachment.url} target="_blank" rel="noopener noreferrer" className="flex items-center p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--accent)]/50 hover:bg-[var(--bg-tertiary)] transition-all duration-300 group">
                    <div className="bg-[var(--accent-light)] p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform"><FileText className="h-5 w-5 text-[var(--accent)]" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[var(--text-primary)] truncate">{attachment.name}</p>
                      <p className="text-[10px] font-bold uppercase text-[var(--text-muted)] mt-1">{getFileType(attachment.name)}</p>
                    </div>
                    <Download className="h-4 w-4 text-[var(--text-muted)] ml-2 group-hover:text-[var(--accent)] transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-end pt-8 border-t border-[var(--border)] gap-4">
            <Button variant="outline" className="border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] font-bold rounded-xl px-6" onClick={onClose}>
              Fermer
            </Button>
            {!injection.acknowledged && (
              <Button onClick={() => onAcknowledge(injection.id)} className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl px-8 shadow-lg shadow-[var(--accent)]/20">
                <Check className="h-4 w-4 mr-2" />Accuser réception
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
