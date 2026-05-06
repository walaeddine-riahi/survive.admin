import React from "react";
import { CommunicationChannelCard } from "./CommunicationChannelCard";
import { 
  Mail, Phone, MessageSquare, Bell, FileText, 
  Newspaper, Rss, Users 
} from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { ParticipantViewData } from "../types";

interface ChannelSidebarProps {
  counts: ParticipantViewData["counts"];
  selectedChannel: keyof ParticipantViewData["communications"] | null;
  onChannelClick: (channel: keyof ParticipantViewData["communications"]) => void;
  resolvedTheme: string | undefined;
}

export function ChannelSidebar({ 
  counts, 
  selectedChannel, 
  onChannelClick,
  resolvedTheme 
}: ChannelSidebarProps) {
  const getChannelClass = (channel: string) => {
    return selectedChannel === channel
      ? "border-primary" 
      : "";
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <CommunicationChannelCard
        title="Email"
        icon={Mail}
        commCount={counts.email}
        onClick={() => onChannelClick("email")}
        isActive={selectedChannel === "email"}
      />
      <CommunicationChannelCard
        title="Appels"
        icon={Phone}
        commCount={counts.call}
        onClick={() => onChannelClick("call")}
        isActive={selectedChannel === "call"}
      />
      <CommunicationChannelCard
        title="SMS"
        icon={MessageSquare}
        commCount={counts.sms}
        onClick={() => onChannelClick("sms")}
        isActive={selectedChannel === "sms"}
      />
      <CommunicationChannelCard
        title="Alertes"
        icon={Bell}
        commCount={counts.alert}
        onClick={() => onChannelClick("alert")}
        isActive={selectedChannel === "alert"}
      />
      <CommunicationChannelCard
        title="WhatsApp"
        icon={WhatsAppIcon}
        commCount={counts.memo}
        onClick={() => onChannelClick("memo")}
        isActive={selectedChannel === "memo"}
      />
      <CommunicationChannelCard
        title="Flash Info"
        icon={Newspaper}
        commCount={counts.newsBroadcast}
        onClick={() => onChannelClick("newsBroadcast")}
        isActive={selectedChannel === "newsBroadcast"}
      />
      <CommunicationChannelCard
        title="Journal"
        icon={Rss}
        commCount={counts.newspaper}
        onClick={() => onChannelClick("newspaper")}
        isActive={selectedChannel === "newspaper"}
      />
      <CommunicationChannelCard
        title="Réseaux"
        icon={Users}
        commCount={counts.social}
        onClick={() => onChannelClick("social")}
        isActive={selectedChannel === "social"}
      />
      <CommunicationChannelCard
        title="Rapports"
        icon={FileText}
        commCount={counts.report}
        onClick={() => onChannelClick("report")}
        isActive={selectedChannel === "report"}
      />
    </div>
  );
}
