"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  ChevronDown,
  GraduationCap,
  Home,
  LogOut,
  PlayCircle,
  Presentation,
  Shield,
  User,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";

interface RouteChild {
  title: string;
  href: string;
}

interface Route {
  title: string;
  icon: LucideIcon;
  href?: string;
  children?: RouteChild[];
}

const routes: Route[] = [
  {
    title: "Accueil",
    icon: Home,
    href: "/dashboard",
  },

  // =====================================================
  // MODULE 1: SIMULATION
  // =====================================================
  {
    title: "Simulation",
    icon: PlayCircle,
    children: [
      {
        title: "Liste des simulations",
        href: "/simulation",
      },
      {
        title: "Créer simulation",
        href: "/simulation/create",
      },
      {
        title: "Scénarios",
        href: "/scenario",
      },
      {
        title: "Injections",
        href: "/injections",
      },
      {
        title: "Mode Participant",
        href: "/participant-mode",
      },
      {
        title: "Participations",
        href: "/participations",
      },
    ],
  },

  // =====================================================
  // MODULE 2: INSTRUCTEUR
  // =====================================================
  {
    title: "Instructeur",
    icon: Presentation,
    children: [
      {
        title: "Vue Instructeur",
        href: "/instructor-simulations",
      },
      {
        title: "Gestion d'équipes",
        href: "/team",
      },
      {
        title: "Liste des équipes",
        href: "/teams",
      },
      {
        title: "Membres d'équipe",
        href: "/team-members",
      },
      {
        title: "Membre (ancien)",
        href: "/team-member",
      },
      {
        title: "Chat d'équipe",
        href: "/team-chat",
      },
      {
        title: "Gestion des tâches",
        href: "/task",
      },
      {
        title: "Incidents",
        href: "/incident",
      },
      {
        title: "Créer incident",
        href: "/incident/create",
      },
      {
        title: "Rapports",
        href: "/report",
      },
    ],
  },

  // =====================================================
  // MODULE 3: BIA (Business Impact Analysis)
  // =====================================================
  {
    title: "BIA",
    icon: BarChart3,
    children: [
      {
        title: "Dashboard BIA",
        href: "/bia/dashboard",
      },
      {
        title: "Liste des processus",
        href: "/bia",
      },
      {
        title: "Nouveau processus",
        href: "/bia/processes/new",
      },
      {
        title: "Éditer processus",
        href: "/bia/processes/edit",
      },
      {
        title: "Usines / Factories",
        href: "/bia/factories",
      },
      {
        title: "Rapports BIA",
        href: "/bia/reports",
      },
      {
        title: "Conformité",
        href: "/compliance",
      },
      {
        title: "Conformité (alt)",
        href: "/conformity",
      },
      {
        title: "Gestion des risques",
        href: "/risk",
      },
    ],
  },

  // =====================================================
  // MODULE 4: WORKSHOP (Formation & Développement)
  // =====================================================
  {
    title: "Workshop",
    icon: GraduationCap,
    children: [
      {
        title: "Formations",
        href: "/training",
      },
      {
        title: "Plans d'action",
        href: "/plan",
      },
      {
        title: "Types de plans",
        href: "/plan-type",
      },
      {
        title: "Événements",
        href: "/participations",
      },
      {
        title: "Notifications",
        href: "/notifications",
      },
    ],
  },

  // =====================================================
  // PROFIL & COMPTE
  // =====================================================
  {
    title: "Profil",
    icon: User,
    children: [
      {
        title: "Mon Profil",
        href: "/profile",
      },
      {
        title: "Paramètres",
        href: "/settings",
      },
    ],
  },

  // =====================================================
  // ADMINISTRATION
  // =====================================================
  {
    title: "Admin",
    icon: Shield,
    children: [
      {
        title: "Panel Admin",
        href: "/admin",
      },
      {
        title: "Utilisateurs",
        href: "/users",
      },
      {
        title: "Super Admin",
        href: "/super-admin",
      },
    ],
  },
];

interface SidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: Dispatch<SetStateAction<boolean>>;
}

export function Sidebar({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: SidebarProps) {
  const pathname = usePathname();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleMenuClick = (menuId: string) => {
    setOpenMenuId((currentId) => (currentId === menuId ? null : menuId));
  };

  const isActive = (href: string) => {
    if (href === pathname) return true;
    if (href === "/dashboard" && pathname === "/") return true;
    return false;
  };

  const isChildActive = (children: RouteChild[]) => {
    return children?.some((child) => child.href === pathname);
  };

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 transform bg-background border-r border-border transition-transform duration-200 ease-in-out md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo Section - YouTube Style */}
        <div className="h-14 px-4 flex items-center border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-sm bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-base">S</span>
            </div>
            <span className="font-medium text-base">SURVIVE</span>
          </Link>
        </div>

        {/* Navigation Section - YouTube Style */}
        <ScrollArea className="flex-1 px-3 py-2">
          <div className="space-y-1">
            {routes.map((route) => (
              <div key={route.href || route.title}>
                {route.children ? (
                  <>
                    <button
                      onClick={() => handleMenuClick(route.title)}
                      className={cn(
                        "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-normal transition-colors",
                        isChildActive(route.children)
                          ? "bg-muted font-medium"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <route.icon className="h-5 w-5 flex-shrink-0" />
                        <span className="truncate text-sm">{route.title}</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 flex-shrink-0 transition-transform duration-200",
                          openMenuId === route.title && "rotate-180"
                        )}
                      />
                    </button>
                    {openMenuId === route.title && (
                      <div className="ml-8 mt-1 space-y-0.5 pb-1">
                        {route.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "block px-3 py-1.5 text-xs rounded-lg transition-colors",
                              isActive(child.href)
                                ? "bg-muted font-medium text-foreground"
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {child.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={route.href || "#"}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-normal transition-colors",
                      isActive(route.href || "")
                        ? "bg-muted font-medium text-foreground"
                        : "text-foreground hover:bg-muted/50"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <route.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="truncate text-sm">{route.title}</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer Section - YouTube Style */}
        <div className="border-t border-border p-3">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-3 py-2 text-sm font-normal hover:bg-muted rounded-lg"
            onClick={() => {
              setIsMobileMenuOpen(false);
            }}
          >
            <LogOut className="h-5 w-5" />
            <span>Déconnexion</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
