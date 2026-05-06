import React from "react";
import { 
  Mail, Phone, MessageSquare, Bell, FileText, 
  Newspaper, Rss, Users, User2, User, Clock, 
  Check, Paperclip, Heart, Repeat2, Share2, Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { 
  ParticipantViewData, Communication, Injection, 
  CombinedContentItem, ChannelKey 
} from "../types";
import { formatDate } from "../constants";

interface CommunicationFeedProps {
  channelType: ChannelKey;
  data: ParticipantViewData | null;
  searchQuery?: string;
  onViewInjection: (injection: Injection) => void;
  onAcknowledgeInjection: (injectionId: string) => void;
  onViewCommunication: (comm: Communication) => void;
  onViewReport: (reportId: string, fileName: string) => void;
}

const getIconForType = (type: string): React.ReactElement => {
  const iconProps = {
    className: "h-6 w-6 text-white drop-shadow-sm",
    strokeWidth: 1.75,
  };

  switch (type.toLowerCase()) {
    case "email": return <Mail {...iconProps} />;
    case "sms": return <MessageSquare {...iconProps} />;
    case "call": return <Phone {...iconProps} />;
    case "alert": return <Bell {...iconProps} />;
    case "memo": return <WhatsAppIcon className={iconProps.className} />;
    case "newsbroadcast": return <Newspaper {...iconProps} />;
    case "newspaper": return <Rss {...iconProps} />;
    case "social": return <Users {...iconProps} />;
    case "report": return <FileText {...iconProps} />;
    default: return <MessageSquare {...iconProps} />;
  }
};

const getChannelColor = (type: string) => {
  return "border-l-2 border-l-[#D97706]";
};

export function CommunicationFeed({
  channelType,
  data,
  searchQuery = "",
  onViewInjection,
  onAcknowledgeInjection,
  onViewCommunication,
  onViewReport
}: CommunicationFeedProps) {
  if (!data) return null;

  const channelCommunications = data.communications[channelType] || [];
  const channelInjections = data.injections.filter((inj) => {
    if (!inj.type) return false;
    const normalizedInjType = inj.type.toUpperCase().replace(/_/g, "");
    const normalizedChannelType = channelType.toUpperCase().replace(/_/g, "");
    if (normalizedChannelType === "SOCIAL") {
      return normalizedInjType === "SOCIAL" || normalizedInjType === "SOCIALMEDIA";
    }
    return normalizedInjType === normalizedChannelType;
  });

  const combinedContent: CombinedContentItem[] = [
    ...channelCommunications.map((comm) => ({ ...comm, isInjection: false })),
    ...channelInjections.map((inj) => ({ ...inj, isInjection: true })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filteredContent = combinedContent.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const matchesContent = item.content?.toLowerCase().includes(query);
    const matchesTitle = item.isInjection 
      ? (item as Injection).title?.toLowerCase().includes(query)
      : (item as Communication).subject?.toLowerCase().includes(query);
    const matchesSender = item.sender 
      ? `${item.sender.firstName} ${item.sender.lastName}`.toLowerCase().includes(query)
      : false;
    
    return matchesContent || matchesTitle || matchesSender;
  });

  if (channelType === "social") {
    const socialItems = filteredContent;
    if (socialItems.length === 0 && searchQuery) {
      return (
        <div 
          className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed"
          style={{ backgroundColor: "#252220", borderColor: "#3C3835" }}
        >
          <Search className="h-8 w-8 text-[#3C3835] mb-4" />
          <h3 className="text-[15px] font-medium text-[#57534E]">Aucun résultat</h3>
          <p className="text-[13px] text-[#78716C] mt-2">Aucun message ne correspond à &quot;{searchQuery}&quot;.</p>
        </div>
      );
    }
    return (
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {socialItems.map((item, index) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] p-6 shadow-sm hover:border-[var(--accent)]/30 transition-all duration-300"
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] flex items-center justify-center text-white shadow-lg shadow-[var(--accent)]/20">
                    <User2 className="h-6 w-6" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-black text-[var(--text-primary)] tracking-tight">
                      {item.isInjection ? "@Alerte_Crise" : "@Participant"}
                    </span>
                    <span className="text-[var(--text-muted)] text-xs">· {formatDate(item.createdAt)}</span>
                    {item.isInjection && (
                      <Badge className="bg-[var(--accent)]/10 text-[var(--accent)] border-none text-[9px] uppercase font-black py-0 h-4 ml-1">
                        Officiel
                      </Badge>
                    )}
                  </div>
                  <div className="text-[var(--text-primary)] text-base leading-relaxed whitespace-pre-line mb-4 font-medium">
                    {item.content}
                  </div>
                  <div className="flex items-center justify-between text-[var(--text-muted)] max-w-sm pt-2 border-t border-[var(--border)]/50">
                    <button className="flex items-center gap-2 hover:text-[var(--accent)] transition-colors">
                      <MessageSquare className="h-4 w-4" /><span className="text-[10px] font-bold">12</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-green-500 transition-colors">
                      <Repeat2 className="h-4 w-4" /><span className="text-[10px] font-bold">4</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                      <Heart className="h-4 w-4" /><span className="text-[10px] font-bold">28</span>
                    </button>
                    <button className="hover:text-[var(--accent)] transition-colors"><Share2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  if (filteredContent.length === 0) {
    return (
      <div 
        className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed"
        style={{ backgroundColor: "#252220", borderColor: "#3C3835" }}
      >
        <MessageSquare className="h-8 w-8 text-[#3C3835] mb-4" />
        <h3 className="text-[15px] font-medium text-[#57534E]">
          {searchQuery ? "Aucun résultat trouvé" : "Flux vide"}
        </h3>
        <p className="text-[13px] text-[#78716C] mt-2 max-w-xs leading-relaxed">
          {searchQuery 
            ? `Aucune communication ne correspond à "${searchQuery}".` 
            : "Aucune communication n'a été envoyée sur ce canal pour le moment."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header du Flux — Style Email comme demandé */}
      <div 
        className="px-6 py-4 flex items-center justify-between border-t-2"
        style={{ backgroundColor: "#252220", borderTopColor: "#D97706", borderBottom: "1px solid #3C3835" }}
      >
        <div className="flex flex-col">
          <span className="text-[14px] font-semibold text-[#D97706]">
            {channelType === "newsBroadcast" ? "Flash Info" : 
             channelType === "memo" ? "WhatsApp" : 
             channelType.charAt(0).toUpperCase() + channelType.slice(1)}
          </span>
          <span className="text-[11px] text-[#78716C]">Flux opérationnel</span>
        </div>
        <Button 
          size="sm"
          className="rounded-lg px-4 py-1.5 text-[12px] font-medium"
          style={{ backgroundColor: "#D97706", color: "#1C1917" }}
          onClick={() => {}} // This should trigger compose, logic handled in parent usually
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Nouveau
        </Button>
      </div>

      {/* Barre de Recherche */}
      <div className="p-4" style={{ borderBottom: "1px solid #3C3835" }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716C]" />
          <input 
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            readOnly // Managed by parent
            className="w-full bg-[#1E1C1A] border-[#3C3835] border rounded-lg pl-10 pr-4 py-2 text-[13px] text-[#FAFAF9] placeholder-[#78716C] focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/10 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {filteredContent.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className={`group flex flex-col gap-3 p-5 rounded-xl border transition-all duration-200 ${
                item.isInjection && !item.acknowledged 
                  ? "border-[#D97706]/40 bg-[#2C2118]" 
                  : "border-[#3C3835] bg-[#252220] hover:border-[#57534E]"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div 
                    className={`p-2.5 rounded-lg ${item.isInjection ? "bg-[#D97706]/10 text-[#D97706]" : "bg-[#1C1917] text-[#78716C]"}`}
                    style={{ border: "1px solid", borderColor: item.isInjection ? "rgba(217,119,6,0.2)" : "#3C3835" }}
                  >
                    {getIconForType(item.type)}
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-[15px] font-semibold text-[#FAFAF9] leading-tight">
                      {item.isInjection ? (item as Injection).title : (item as Communication).subject || "Sans sujet"}
                    </h3>
                    <div className="flex items-center gap-3 text-[10px] text-[#78716C]">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3 h-3" />
                        {item.sender ? `${item.sender.firstName} ${item.sender.lastName}` : "Système"}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.isInjection && !item.acknowledged && (
                    <button 
                      className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#D97706] text-[#1C1917] uppercase tracking-wider"
                      onClick={() => onAcknowledgeInjection(item.id)}
                    >
                      Reçu
                    </button>
                  )}
                  <button 
                    className="p-2 text-[#78716C] hover:text-[#FAFAF9] transition-colors"
                    onClick={() => item.isInjection ? onViewInjection(item as Injection) : onViewCommunication(item as Communication)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="text-[13px] text-[#A8A29E] leading-relaxed line-clamp-3">
                {item.content}
              </div>

              {item.type === "report" && (
                <button 
                  className="mt-2 flex items-center gap-3 p-3 rounded-lg bg-[#1C1917] border border-[#3C3835] hover:border-[#57534E] transition-all"
                  onClick={() => onViewReport(item.payload?.reportId as string, (item.payload?.originalFileName as string) || "Rapport PDF")}
                >
                  <FileText className="w-4 h-4 text-[#D97706]" />
                  <span className="text-[12px] text-[#A8A29E] font-medium truncate">
                    {(item.payload?.originalFileName as string) || "Visualiser le rapport"}
                  </span>
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
