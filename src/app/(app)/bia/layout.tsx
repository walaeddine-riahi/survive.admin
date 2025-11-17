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
    title: "Risques",
    href: "/risk",
    icon: AlertTriangle,
    description: "Gestion des risques",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header du module BIA */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Business Impact Analysis
                </h1>
                <p className="text-sm text-muted-foreground">
                  Analyse d&apos;impact métier et gestion de la continuité
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Module BIA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation secondaire en tabs */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
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
                      "relative h-auto py-3 px-4 flex-col items-start gap-1 min-w-[120px] transition-all duration-200",
                      active
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md hover:shadow-lg hover:from-blue-600 hover:to-indigo-700"
                        : "hover:bg-blue-50 hover:text-blue-700"
                    )}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          active ? "text-white" : "text-muted-foreground"
                        )}
                      />
                      <span className="font-medium text-sm">{item.title}</span>
                    </div>
                    <span
                      className={cn(
                        "text-xs leading-tight text-left w-full",
                        active ? "text-blue-100" : "text-muted-foreground"
                      )}
                    >
                      {item.description}
                    </span>
                    {active && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-t-full" />
                    )}
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
