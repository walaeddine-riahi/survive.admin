import React from "react";
import { Card } from "@/components/ui/card";

interface CommunicationChannelCardProps {
  title: string;
  onClick: () => void;
  icon: React.ElementType;
  isActive?: boolean;
  commCount?: number;
  injCount?: number;
}

export function CommunicationChannelCard({
  title,
  onClick,
  icon: Icon,
  isActive = false,
  commCount = 0,
  injCount = 0,
}: CommunicationChannelCardProps) {
  const totalCount = commCount + injCount;

  return (
    <div
      onClick={onClick}
      className={`
        flex flex-col items-center gap-2 p-4 rounded-xl cursor-pointer transition-all duration-200 border
        ${isActive 
          ? "bg-[#2C2118] border-[#D97706] shadow-lg shadow-[#D97706]/10" 
          : "bg-[#252220] border-[#3C3835] hover:bg-[#2E2B28] hover:border-[#57534E]"}
      `}
    >
      <div className="relative">
        <Icon 
          className={`w-5 h-5 transition-colors duration-200 ${isActive ? "text-[#D97706]" : "text-[#78716C] group-hover:text-[#FAFAF9]"}`} 
          strokeWidth={1.5}
        />
        {totalCount > 0 && (
          <span 
            className="absolute -top-2.5 -right-2.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[9px] font-bold rounded-full border-2"
            style={{ 
              backgroundColor: isActive ? "#D97706" : "#2E2B28", 
              borderColor: isActive ? "#2C2118" : "#252220",
              color: isActive ? "#1C1917" : "#A8A29E"
            }}
          >
            {totalCount}
          </span>
        )}
      </div>
      <span 
        className={`text-[11px] font-medium tracking-wide transition-colors duration-200 ${isActive ? "text-[#D97706]" : "text-[#78716C] group-hover:text-[#A8A29E]"}`}
      >
        {title}
      </span>
    </div>
  );
}
