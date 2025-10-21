"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckSquare,
  ChevronDown,
  Eye,
  LayoutDashboard,
  LineChart,
  LogOut,
  LucideIcon,
  PlayCircle,
  Settings,
  User,
  Users,
  UserCircle,
  FileText,
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
    title: "Tableau de bord",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Users",
    href: "/users",
    icon: Users,
  },

  {
    title: "Équipe",
    icon: Users,
    children: [
      {
        title: "Liste des équipes",
        href: "/team",
      },
      {
        title: "Membres",
        href: "/team-members",
      },
      {
        title: "Chat",
        href: "/team-chat",
      },
    ],
  },
  {
    title: "Tâches",
    icon: CheckSquare,
    children: [
      {
        title: "Liste des tâches",
        href: "/task",
      },
      {
        title: "Créer une tâche",
        href: "/task/create",
      },
    ],
  },
  {
    title: "Incidents",
    icon: AlertTriangle,
    children: [
      {
        title: "Liste des incidents",
        href: "/incident",
      },
      {
        title: "Créer un incident",
        href: "/incident/create",
      },
      {
        title: "Rapports",
        href: "/report",
      },
    ],
  },
  {
    title: "Plans",
    icon: Calendar,
    children: [
      {
        title: "Liste des plans",
        href: "/plan",
      },
      {
        title: "Types de plans",
        href: "/plan-type",
      },
    ],
  },
  {
    title: "Notifications",
    icon: Bell,
    href: "/notifications",
  },
  {
    title: "Simulations",
    icon: LineChart,
    href: "/simulation",
  },
  {
    title: "Vue Instructeur",
    icon: Eye,
    href: "/instructor-simulations",
  },
  {
    title: "Scénarios",
    href: "/scenario",
    icon: PlayCircle,
  },
  {
    title: "Mode Participant",
    href: "/participant-mode",
    icon: UserCircle,
  },
  {
    title: "BIA",
    href: "/bia",
    icon: FileText,
  },
  {
    title: "Participations",
    href: "/participations",
    icon: Users,
  },
  {
    title: "Injections",
    href: "/injections",
    icon: PlayCircle,
  },
  {
    title: "Risques",
    icon: AlertTriangle,
    href: "/risk",
  },
  {
    title: "Profil",
    icon: User,
    href: "/profile",
  },
  {
    title: "Paramètres",
    icon: Settings,
    href: "/settings",
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
        "fixed inset-y-0 z-40 w-64 transform bg-card text-card-foreground border-r transition-transform duration-200 ease-in-out md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-full flex-col">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center">
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </Link>
        </div>
        <Separator />
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1 py-2">
            {routes.map((route) => (
              <div key={route.href || route.title}>
                {route.children ? (
                  <>
                    <button
                      onClick={() => handleMenuClick(route.title)}
                      className={cn(
                        "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-accent-foreground hover:bg-accent rounded-lg transition",
                        isActive(route.href || "") ||
                          isChildActive(route.children)
                          ? "text-accent-foreground bg-accent"
                          : "text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center flex-1">
                        <route.icon className="h-5 w-5 mr-3 shrink-0" />
                        <span className="truncate">{route.title}</span>
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
                      <div className="ml-6 mt-1 space-y-1">
                        {route.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "text-sm group flex p-2.5 w-full justify-start font-medium cursor-pointer hover:text-accent-foreground hover:bg-accent rounded-lg transition",
                              isActive(child.href)
                                ? "text-accent-foreground bg-accent"
                                : "text-muted-foreground"
                            )}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <div className="flex items-center flex-1">
                              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 mr-3 shrink-0" />
                              <span className="truncate text-sm">
                                {child.title}
                              </span>
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
                      "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-accent-foreground hover:bg-accent rounded-lg transition",
                      isActive(route.href || "")
                        ? "text-accent-foreground bg-accent"
                        : "text-muted-foreground"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center flex-1">
                      <route.icon className="h-5 w-5 mr-3 shrink-0" />
                      <span className="truncate">{route.title}</span>
                    </div>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <Separator />
        <div className="p-3">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-accent-foreground hover:bg-accent"
            onClick={() => {
              // Ajouter la logique de déconnexion ici
              setIsMobileMenuOpen(false);
            }}
          >
            <LogOut className="h-5 w-5 mr-3 shrink-0" />
            <span className="truncate">Déconnexion</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
