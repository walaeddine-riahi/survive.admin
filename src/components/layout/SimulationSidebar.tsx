"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Briefcase, CircleDot, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const simulationRoutes = [
  {
    title: "Simulation",
    icon: Briefcase,
    href: "/simulation",
  },
  {
    title: "Injection",
    icon: CircleDot,
    href: "/simulation/injection",
  },
  {
    title: "Participants",
    icon: Users,
    href: "/simulation/participants",
  },
];

export function SimulationSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    // La route /simulation doit être active si on est sur /simulation ou ses sous-routes
    if (href === "/simulation" && pathname.startsWith("/simulation"))
      return true;
    return href === pathname;
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-secondary)] border-r border-[var(--border)] w-[220px]">
      <div className="h-[52px] px-6 flex items-center border-b border-[var(--bg-tertiary)]">
        <Link href="/simulation" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-[8px] bg-gradient-to-br from-[#A54D32] to-[#DA7757] flex items-center justify-center shrink-0">
            <Briefcase size={16} strokeWidth={1.5} className="text-white" />
          </div>
          <span className="font-bold text-[13px] tracking-tight text-[var(--text-primary)]">Simulation</span>
        </Link>
      </div>
      
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="flex flex-col gap-[4px]">
          {simulationRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-[10px] px-3 py-2 rounded-[8px] text-[14px] transition-[var(--transition)]",
                isActive(route.href)
                  ? "bg-[var(--bg-hover)] text-[var(--text-primary)] border-l-2 border-[var(--accent)] rounded-l-none pl-[10px]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]/10 hover:text-[var(--text-primary)]"
              )}
            >
              <route.icon 
                size={16} 
                strokeWidth={1.5} 
                className={cn(
                  "shrink-0",
                  isActive(route.href) ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"
                )} 
              />
              <span className="truncate">{route.title}</span>
            </Link>
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t border-[var(--border)]">
        <div className="bg-[var(--bg-hover)]/30 rounded-[8px] p-3 border border-[var(--border)]">
          <p className="text-[11px] font-medium text-[var(--text-muted)] tracking-[0.05em] mb-2">Statut simulation</p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#10B981]" />
            <span className="text-[12px] font-medium text-[var(--text-primary)]">Système opérationnel</span>
          </div>
        </div>
      </div>
    </div>
  );
}
