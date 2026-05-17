"use client";

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
  Sparkles,
  User,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";
import { useSession } from "next-auth/react";

interface RouteChild {
  title: string;
  href: string;
  rolesRequired?: string[];
}

interface Route {
  title: string;
  icon: LucideIcon;
  href?: string;
  children?: RouteChild[];
  rolesRequired?: string[];
}

const routes: Route[] = [
  {
    title: "Accueil",
    icon: Home,
    href: "/dashboard",
    rolesRequired: ["ADMIN", "USER"],
  },
  {
    title: "Simulation",
    icon: PlayCircle,
    children: [
      {
        title: "Liste des simulations",
        href: "/simulation",
        rolesRequired: ["ADMIN"],
      },
      {
        title: "Créer simulation (Wizard)",
        href: "/simulation/builder",
        rolesRequired: ["ADMIN"],
      },
      { title: "Scénarios", href: "/scenario", rolesRequired: ["ADMIN"] },
      { title: "Injections", href: "/injections", rolesRequired: ["ADMIN"] },
      {
        title: "Mode Participant",
        href: "/participant-mode",
        rolesRequired: ["ADMIN", "USER"],
      },
      {
        title: "Participations",
        href: "/participations",
        rolesRequired: ["ADMIN"],
      },
    ],
  },
  {
    title: "Instructeur",
    icon: Presentation,
    children: [
      {
        title: "Vue Instructeur",
        href: "/instructor-simulations",
        rolesRequired: ["ADMIN"],
      },
      { title: "Gestion d'équipes", href: "/team", rolesRequired: ["ADMIN"] },
      { title: "Liste des équipes", href: "/teams", rolesRequired: ["ADMIN"] },
      {
        title: "Membres d'équipe",
        href: "/team-members",
        rolesRequired: ["ADMIN"],
      },
      { title: "Chat d'équipe", href: "/team-chat", rolesRequired: ["ADMIN"] },
      { title: "Gestion des tâches", href: "/task", rolesRequired: ["ADMIN"] },
      { title: "Incidents", href: "/incident", rolesRequired: ["ADMIN"] },
      {
        title: "Créer incident",
        href: "/incident/create",
        rolesRequired: ["ADMIN"],
      },
      { title: "Rapports", href: "/report", rolesRequired: ["ADMIN"] },
    ],
  },
  {
    title: "BIA",
    icon: BarChart3,
    children: [
      {
        title: "Dashboard BIA",
        href: "/bia/dashboard",
        rolesRequired: ["ADMIN"],
      },
      { title: "Liste des processus", href: "/bia", rolesRequired: ["ADMIN"] },
      {
        title: "Nouveau processus",
        href: "/bia/processes/new",
        rolesRequired: ["ADMIN"],
      },
      {
        title: "Usines / Factories",
        href: "/bia/factories",
        rolesRequired: ["ADMIN"],
      },
      { title: "Rapports BIA", href: "/bia/reports", rolesRequired: ["ADMIN"] },
      {
        title: "Résumé de Document",
        href: "/document-summary",
        rolesRequired: ["ADMIN"],
      },
      { title: "Conformité", href: "/compliance", rolesRequired: ["ADMIN"] },
      { title: "Gestion des risques", href: "/risk", rolesRequired: ["ADMIN"] },
    ],
  },
  {
    title: "Workshop",
    icon: GraduationCap,
    rolesRequired: ["ADMIN"],
    children: [
      { title: "Formations", href: "/training", rolesRequired: ["ADMIN"] },
      { title: "Plans d'action", href: "/plan", rolesRequired: ["ADMIN"] },
      { title: "Types de plans", href: "/plan-type", rolesRequired: ["ADMIN"] },
      {
        title: "Événements",
        href: "/participations",
        rolesRequired: ["ADMIN"],
      },
      {
        title: "Notifications",
        href: "/notifications",
        rolesRequired: ["ADMIN"],
      },
    ],
  },
  {
    title: "Profil",
    icon: User,
    children: [
      {
        title: "Mon Profil",
        href: "/profile",
        rolesRequired: ["ADMIN", "USER"],
      },
      {
        title: "Paramètres",
        href: "/settings",
        rolesRequired: ["ADMIN", "USER"],
      },
    ],
  },
  {
    title: "Admin",
    icon: Shield,
    children: [
      { title: "Panel Admin", href: "/admin", rolesRequired: ["ADMIN"] },
      { title: "Utilisateurs", href: "/users", rolesRequired: ["ADMIN"] },
      { title: "Super Admin", href: "/super-admin", rolesRequired: ["ADMIN"] },
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
  const { data: session } = useSession();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const userRole = session?.user?.role || "USER";

  const canAccessRoute = (rolesRequired?: string[]): boolean => {
    if (!rolesRequired || rolesRequired.length === 0) return true;
    return rolesRequired.includes(userRole);
  };

  const getFilteredChildren = (children: RouteChild[]): RouteChild[] => {
    return children.filter((child) => canAccessRoute(child.rolesRequired));
  };

  const getFilteredRoutes = (): Route[] => {
    return routes
      .filter((route) => canAccessRoute(route.rolesRequired))
      .map((route) => ({
        ...route,
        children: route.children
          ? getFilteredChildren(route.children)
          : undefined,
      }))
      .filter((route) => !route.children || route.children.length > 0);
  };

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

  const filteredRoutes = getFilteredRoutes();

  const btnIconStyle =
    "flex items-center gap-[10px] px-3 py-2 rounded-[8px] text-[14px] transition-[var(--transition)] cursor-pointer w-full text-left";

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-[220px] transform bg-[var(--bg-secondary)] border-r border-[var(--border)] transition-transform duration-300 ease-in-out md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex h-full flex-col p-[var(--s4)] gap-[var(--s2)]">
        {/* Logo Section */}
        <div className="mb-[var(--s4)] px-1">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-[var(--radius-md)] bg-gradient-to-br from-[#A54D32] to-[#DA7757] flex items-center justify-center shrink-0">
              <Sparkles size={16} color="white" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[13px] tracking-tight text-[#FAFAF9] leading-tight">
                SURVIVE
              </span>
              <span className="text-[10px] uppercase tracking-[0.1em] text-[#78716C]">
                Resilience
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Section */}
        <ScrollArea className="flex-1 -mx-2 px-2">
          <div className="flex flex-col gap-[var(--s1)]">
            {filteredRoutes.map((route) => (
              <div key={route.href || route.title}>
                {route.children ? (
                  <>
                    <button
                      onClick={() => handleMenuClick(route.title)}
                      className={cn(
                        btnIconStyle,
                        isChildActive(route.children) ||
                          openMenuId === route.title
                          ? "bg-[var(--bg-hover)] text-[var(--text-primary)] border-l-2 border-[var(--accent)] rounded-l-none pl-[10px]"
                          : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]",
                      )}
                    >
                      <div className="flex items-center gap-[10px] flex-1">
                        <route.icon
                          size={16}
                          strokeWidth={1.5}
                          className={cn(
                            "shrink-0",
                            isChildActive(route.children)
                              ? "text-[#D97706]"
                              : "text-[#A8A29E]",
                          )}
                        />
                        <span className="truncate" suppressHydrationWarning>
                          {route.title}
                        </span>
                      </div>
                      <ChevronDown
                        size={14}
                        strokeWidth={1.5}
                        className={cn(
                          "transition-transform duration-300",
                          openMenuId === route.title && "rotate-180",
                        )}
                      />
                    </button>
                    {openMenuId === route.title && (
                      <div className="mt-1 space-y-1 ml-4 border-l border-[var(--border)] pl-3">
                        {route.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "block px-3 py-1.5 text-[13px] rounded-[8px] transition-[var(--transition)]",
                              isActive(child.href)
                                ? "bg-[var(--bg-hover)] text-[var(--text-primary)] font-medium"
                                : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]/50 hover:text-[var(--text-primary)]",
                            )}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <span suppressHydrationWarning>{child.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={route.href || "#"}
                    className={cn(
                      btnIconStyle,
                      isActive(route.href || "")
                        ? "bg-[var(--bg-hover)] text-[var(--text-primary)] border-l-2 border-[var(--accent)] rounded-l-none pl-[10px]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]/10 hover:text-[var(--text-primary)]",
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <route.icon
                      size={16}
                      strokeWidth={1.5}
                      className={cn(
                        "shrink-0",
                        isActive(route.href || "")
                          ? "text-[var(--accent)]"
                          : "text-[var(--text-secondary)]",
                      )}
                    />
                    <span className="truncate" suppressHydrationWarning>
                      {route.title}
                    </span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer Section */}
        <div className="mt-auto pt-2 border-t border-[var(--border)] mx-3">
          <div className="flex items-center gap-2 p-3">
            <div className="h-7 w-7 rounded-[6px] bg-[var(--bg-tertiary)] flex items-center justify-center text-[12px] font-medium text-[var(--text-primary)] shrink-0 border border-[var(--border)]">
              {session?.user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-[13px] font-medium text-[var(--text-primary)] truncate leading-tight">
                {session?.user?.name || "Administrateur"}
              </span>
              <span className="text-[11px] text-[var(--text-muted)] truncate">
                {session?.user?.email}
              </span>
            </div>
          </div>
          <button
            className={cn(
              btnIconStyle,
              "text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-400 mt-1",
            )}
            onClick={() => {
              // Add logout logic if needed
            }}
          >
            <LogOut size={16} strokeWidth={1.5} />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </div>
  );
}
