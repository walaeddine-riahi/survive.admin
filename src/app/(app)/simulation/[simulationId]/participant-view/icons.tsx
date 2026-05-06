import { 
  Mail, MessageSquare, Phone, Bell, Newspaper, Rss, Users, FileText 
} from "lucide-react";
import React from "react";

export const getIconForType = (type: string): React.ReactNode => {
  const iconProps = { className: "h-6 w-6 text-white" };
  switch (type?.toLowerCase()) {
    case "email": return <Mail {...iconProps} />;
    case "sms": return <MessageSquare {...iconProps} />;
    case "call": return <Phone {...iconProps} />;
    case "alert": return <Bell {...iconProps} />;
    case "memo": return <MessageSquare {...iconProps} />;
    case "newsbroadcast": return <Newspaper {...iconProps} />;
    case "newspaper": return <Rss {...iconProps} />;
    case "social": return <Users {...iconProps} />;
    case "report": return <FileText {...iconProps} />;
    default: return <MessageSquare {...iconProps} />;
  }
};
