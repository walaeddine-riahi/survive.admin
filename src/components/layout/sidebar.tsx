"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
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
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },

  // =====================================================
  // MODULE 1: SIMULATION
  // =====================================================
  {
    title: "🎮 Simulation",
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
    title: "🎓 Instructeur",
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
    title: "📊 BIA - Analyse d'Impact",
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
    title: "📚 Workshop",
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
    title: "👤 Profil & Compte",
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
    title: "🛡️ Administration",
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
        "sidebar-enterprise w-64 lg:w-72 transform bg-card text-card-foreground transition-transform duration-200 ease-in-out md:translate-x-0 z-40",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo Section - Clean & Minimal */}
        <div className="px-6 py-5 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center transition-opacity group-hover:opacity-90">
              <span className="text-white font-semibold text-lg">S</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-base font-semibold text-foreground">
                SURVIVE.ADMIN
              </h1>
              <p className="text-xs text-muted-foreground">Crisis Management</p>
            </div>
          </Link>
        </div>

        {/* Navigation Section */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2 py-4">
            {routes.map((route) => (
              <div key={route.href || route.title}>
                {route.children ? (
                  <>
                    <button
                      onClick={() => handleMenuClick(route.title)}
                      className={cn(
                        "sidebar-item-enterprise text-sm w-full justify-start",
                        isActive(route.href || "") ||
                          isChildActive(route.children)
                          ? "sidebar-item-active"
                          : "sidebar-item-inactive"
                      )}
                    >
                      <div className="flex items-center flex-1 gap-3">
                        <route.icon
                          className="h-5 w-5 shrink-0"
                        />
                        <span className="truncate">
                          {route.title}
                        </span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 ml-auto shrink-0 transition-transform duration-200",
                            openMenuId === route.title
                              ? "transform rotate-180"
                              : ""
                          )}
                        />
                      </div>
                    </button>
                    {openMenuId === route.title && (
                      <div className="ml-6 mt-1 space-y-0.5 border-l-2 border-border pl-3">
                        {route.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "flex items-center px-3 py-2.5 text-sm transition-colors duration-150 border-l-2 -ml-3 pl-3",
                              isActive(child.href)
                                ? "text-primary border-l-primary bg-primary/5 font-medium"
                                : "text-muted-foreground hover:text-foreground border-l-transparent hover:border-l-border"
                            )}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <div className="flex items-center flex-1 gap-3">
                              <div
                                className={cn(
                                  "h-1 w-1 rounded-full shrink-0",
                                  isActive(child.href)
                                    ? "bg-primary scale-125"
                                    : "bg-muted-foreground/40 group-hover:bg-foreground/60"
                                )}
                              />
                              <span className="truncate">{child.title}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={route.href || ""}
                    className={cn(
                      "text-sm group flex px-3 py-2.5 w-full justify-start font-medium cursor-pointer rounded-lg transition-all duration-200",
                      isActive(route.href || "")
                        ? "text-primary bg-primary/10 shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center flex-1 gap-3">
                      <route.icon
                        className={cn(
                          "h-5 w-5 shrink-0 transition-transform",
                          isActive(route.href || "")
                            ? "text-primary scale-110"
                            : "group-hover:scale-110"
                        )}
                      />
                      <span className="truncate">{route.title}</span>
                    </div>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Logout Section - Enterprise Style */}
        <div className="border-t border-border p-4">
          <button
            className="sidebar-item-enterprise w-full justify-start text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5"
            onClick={() => {
              // Ajouter la logique de déconnexion ici
              setIsMobileMenuOpen(false);
            }}
          >
            <LogOut className="h-5 w-5 mr-3 shrink-0" />
            <span className="truncate">Déconnexion</span>
          </button>
        </div>
      </div>
    </div>
  );
}
