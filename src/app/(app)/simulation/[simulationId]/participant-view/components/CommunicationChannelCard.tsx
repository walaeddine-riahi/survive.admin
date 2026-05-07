import React from "react";

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
        group flex flex-col items-center gap-2 p-4 rounded-xl cursor-pointer transition-all duration-200 border
        ${isActive 
          ? "bg-[#FFF7ED] border-[#D97706] text-[#D97706] shadow-sm shadow-[#D97706]/10 dark:bg-[#2C2118] dark:shadow-lg dark:shadow-[#D97706]/10" 
          : "bg-[#FAF8F5] border-[#E7E5E4] hover:bg-[#F5F2EB] hover:border-[#D6D3D1] dark:bg-[#252220] dark:border-[#3C3835] dark:hover:bg-[#2E2B28] dark:hover:border-[#57534E]"}
      `}
    >
      <div className="relative">
        <Icon 
          className={`w-5 h-5 transition-colors duration-200 ${isActive ? "text-[#D97706]" : "text-[#78716C] group-hover:text-[#44403C] dark:group-hover:text-[#FAFAF9]"}`} 
          strokeWidth={1.5}
        />
        {totalCount > 0 && (
          <span 
            className={`
              absolute -top-2.5 -right-2.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[9px] font-bold rounded-full border-2 transition-colors duration-200
              ${isActive 
                ? "bg-[#D97706] border-[#FFF7ED] dark:border-[#2C2118] text-white dark:text-[#1C1917]" 
                : "bg-[#E7E5E4] dark:bg-[#2E2B28] border-[#FAF8F5] dark:border-[#252220] text-[#57534E] dark:text-[#A8A29E]"}
            `}
          >
            {totalCount}
          </span>
        )}
      </div>
      <span 
        className={`text-[11px] font-medium tracking-wide transition-colors duration-200 ${isActive ? "text-[#D97706]" : "text-[#78716C] group-hover:text-[#44403C] dark:group-hover:text-[#A8A29E]"}`}
      >
        {title}
      </span>
    </div>
  );
}
