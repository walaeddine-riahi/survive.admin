"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertCircle,
  Mail,
  Send,
  Phone,
  AlertTriangle,
  MessageSquare,
  Radio,
  Newspaper,
  Globe,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface InjectionDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  injection: {
    id: string;
    title: string;
    content?: string | null;
    type: string;
    acknowledged: boolean;
    createdAt: string;
    imageUrl?: string;
    videoUrl?: string;
    scenario?: {
      name: string;
    };
  } | null;
}

export function InjectionDetailModal({
  open,
  onOpenChange,
  injection,
}: InjectionDetailModalProps) {
  if (!injection) return null;

  const getChannelIcon = (type: string) => {
    const iconClass = "h-5 w-5";
    switch (type) {
      case "EMAIL":
      case "email":
        return <Mail className={iconClass} />;
      case "SMS":
      case "sms":
        return <Send className={iconClass} />;
      case "CALL":
      case "call":
        return <Phone className={iconClass} />;
      case "ALERT":
      case "alert":
        return <AlertTriangle className={iconClass} />;
      case "MEMO":
      case "memo":
        return <MessageSquare className={iconClass} />;
      case "NEWS_BROADCAST":
      case "newsBroadcast":
        return <Radio className={iconClass} />;
      case "NEWSPAPER":
      case "newspaper":
        return <Newspaper className={iconClass} />;
      case "SOCIAL":
      case "social":
        return <Globe className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  const getChannelLabel = (type: string) => {
    const labels: Record<string, string> = {
      EMAIL: "Email",
      email: "Email",
      SMS: "SMS",
      sms: "SMS",
      CALL: "Appel téléphonique",
      call: "Appel téléphonique",
      ALERT: "Alerte d'urgence",
      alert: "Alerte d'urgence",
      MEMO: "WhatsApp",
      memo: "WhatsApp",
      NEWS_BROADCAST: "Flash d'actualités",
      newsBroadcast: "Flash d'actualités",
      NEWSPAPER: "Article de journal",
      newspaper: "Article de journal",
      SOCIAL: "Réseaux sociaux",
      social: "Réseaux sociaux",
      OTHER: "Autre",
      other: "Autre",
    };
    return labels[type] || type;
  };

  const getChannelColor = (type: string) => {
    const colors: Record<string, string> = {
      EMAIL: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      email: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      SMS: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
      sms: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
      CALL: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
      call: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
      ALERT: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
      alert: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
      MEMO: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
      memo: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
      NEWS_BROADCAST: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
      newsBroadcast: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
      NEWSPAPER: "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400",
      newspaper: "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400",
      SOCIAL: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
      social: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
      OTHER: "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400",
      other: "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400",
    };
    return colors[type] || colors.OTHER;
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: fr,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getChannelColor(injection.type)}`}>
              {getChannelIcon(injection.type)}
            </div>
            <div className="flex-1">
              <div className="text-lg font-bold">{injection.title}</div>
              <div className="text-sm text-muted-foreground font-normal">
                {getChannelLabel(injection.type)}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-4">
            {/* Statut et informations */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {injection.acknowledged ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Acquittée
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Non acquittée
                  </Badge>
                )}
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(injection.createdAt)}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Scénario */}
            {injection.scenario && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Scénario</h4>
                <Badge variant="secondary">{injection.scenario.name}</Badge>
              </div>
            )}

            {/* Contenu */}
            {injection.content && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Contenu de l&apos;injection</h4>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{injection.content}</p>
                </div>
              </div>
            )}

            {/* Image */}
            {injection.imageUrl && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Image jointe
                </h4>
                <div className="border rounded-lg overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={injection.imageUrl}
                    alt={injection.title}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            )}

            {/* Vidéo */}
            {injection.videoUrl && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Vidéo jointe
                </h4>
                <div className="border rounded-lg overflow-hidden aspect-video">
                  {(injection.videoUrl?.includes("youtube.com") || injection.videoUrl?.includes("youtu.be")) ? (() => {
                    const videoId = injection.videoUrl?.match(/(?:youtu[.]be[/]|youtube[.]com[/](?:embed[/]|v[/]|watch[?]v=|watch[?].+&v=))([^"&?/ ]{11})/)?.[1];
                    return videoId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title={`Vidéo: ${injection.title}`}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video src={injection.videoUrl} controls playsInline preload="metadata" className="w-full h-full bg-black" />
                    );
                  })() : (
                    <video src={injection.videoUrl} controls playsInline preload="metadata" className="w-full h-full bg-black" />
                  )}
                </div>
              </div>
            )}

            {/* Informations techniques */}
            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-2">Informations</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">ID:</span>
                  <p className="font-mono text-xs truncate">{injection.id}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <p>{getChannelLabel(injection.type)}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Date de création:</span>
                  <p>{new Date(injection.createdAt).toLocaleString("fr-FR")}</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
