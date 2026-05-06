"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Factory,
  Shield,
  AlertTriangle,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const biaNavigation = [
  {
    title: "Dashboard",
    href: "/bia/dashboard",
    icon: LayoutDashboard,
    description: "Vue d'ensemble et métriques",
  },
  {
    title: "Processus",
    href: "/bia",
    icon: FolderKanban,
    description: "Gestion des processus métier",
  },
  {
    title: "Rapports",
    href: "/bia/reports",
    icon: FileText,
    description: "Rapports d'analyse",
  },
  {
    title: "Usines",
    href: "/bia/factories",
    icon: Factory,
    description: "Sites de production",
  },
  {
    title: "Conformité",
    href: "/compliance",
    icon: Shield,
    description: "Suivi de conformité",
  },
  {
    title: "Paramètres BCM",
    href: "/bia/settings",
    icon: Shield,
    description: "Seuils & matrice de risque",
  },
  {
    title: "Écarts BIA",
    href: "/bia/gap-analysis",
    icon: AlertTriangle,
    description: "Analyse des écarts ISO 22301",
  },
  {
    title: "Stratégies",
    href: "/bia/strategies",
    icon: TrendingUp,
    description: "Solutions de continuité",
  },
  {
    title: "Risques BCM",
    href: "/risk/assessment",
    icon: Shield,
    description: "Appréciation des risques",
  },
];

export default function BiaLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Déterminer si on est sur une page active
  const isActive = (href: string) => {
    if (href === "/bia") {
      return (
        pathname === "/bia" ||
        (pathname.startsWith("/bia/processes") &&
          !pathname.includes("dashboard"))
      );
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] transition-colors duration-300">
      {/* Header du module BIA */}
      <div className="bg-[var(--bg-surface)] border-b border-[var(--border)] shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-[var(--accent)] rounded-xl shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
                  Business Impact Analysis
                </h1>
                <p className="text-sm text-[var(--text-muted)] font-medium">
                  Analyse d&apos;impact métier et gestion de la continuité
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
              <TrendingUp className="h-4 w-4 text-[var(--accent)]" />
              <span>Module BIA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation secondaire en tabs */}
      <div className="bg-[var(--bg-surface)] border-b border-[var(--border)] sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6">
          <nav className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
            {biaNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={active ? "default" : "ghost"}
                    className={cn(
                      "relative h-auto py-3 px-4 flex-col items-start gap-1 min-w-[120px] transition-all duration-200 rounded-[12px]",
                      active
                        ? "bg-[var(--accent)] text-white shadow-md hover:bg-[var(--accent-hover)]"
                        : "hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
                    )}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          active ? "text-white" : "text-[var(--text-muted)]"
                        )}
                      />
                      <span className="font-bold text-sm uppercase tracking-tight">{item.title}</span>
                    </div>
                    <span
                      className={cn(
                        "text-[10px] leading-tight text-left w-full font-medium",
                        active ? "text-white/80" : "text-[var(--text-muted)]"
                      )}
                    >
                      {item.description}
                    </span>
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto p-6">
        <div className="animate-in fade-in duration-500">{children}</div>
      </div>

      {/* Footer du module (optionnel) */}
      <div className="mt-12 border-t bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Business Continuity Management System</span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/bia/help"
                className="hover:text-blue-600 transition-colors"
              >
                Aide
              </Link>
              <Link
                href="/bia/documentation"
                className="hover:text-blue-600 transition-colors"
              >
                Documentation
              </Link>
              <Link
                href="/settings"
                className="hover:text-blue-600 transition-colors"
              >
                Paramètres
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
