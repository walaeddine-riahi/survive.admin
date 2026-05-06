import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LucideIcon,
  Mail,
  Menu,
  MessageSquare,
  PlayCircle,
  Presentation,
  Settings,
  Shield,
  ShieldAlert,
  Target,
  UserCircle,
  Users,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavigationItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  children?: Omit<NavigationItem, "children">[];
};

export const navigation: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },

  // =====================================================
  // MODULE 1: SIMULATION
  // =====================================================
  {
    title: "🎮 Simulation",
    href: "/simulation",
    icon: PlayCircle,
    children: [
      {
        title: "Liste des simulations",
        href: "/simulation",
        icon: PlayCircle,
      },
      {
        title: "Créer simulation",
        href: "/simulation/create",
        icon: PlayCircle,
      },
      {
        title: "Scénarios",
        href: "/scenario",
        icon: Target,
      },
      {
        title: "Injections",
        href: "/app/injections",
        icon: Workflow,
      },
      {
        title: "Mode Participant",
        href: "/app/participant-mode",
        icon: UserCircle,
      },
      {
        title: "Participations",
        href: "/app/participations",
        icon: Users,
      },
    ],
  },

  // =====================================================
  // MODULE 2: INSTRUCTEUR
  // =====================================================
  {
    title: "🎓 Instructeur",
    href: "/instructor",
    icon: Presentation,
    children: [
      {
        title: "Vue Instructeur",
        href: "/instructor-simulations",
        icon: Presentation,
      },
      {
        title: "Gestion d'équipes",
        href: "/team",
        icon: Users,
      },
      {
        title: "Membres d'équipe",
        href: "/team-member",
        icon: Users,
      },
      {
        title: "Chat d'équipe",
        href: "/team-chat",
        icon: MessageSquare,
      },
      {
        title: "Gestion des tâches",
        href: "/task",
        icon: ClipboardList,
      },
      {
        title: "Incidents",
        href: "/incident",
        icon: AlertTriangle,
      },
      {
        title: "Rapports",
        href: "/report",
        icon: FileText,
      },
    ],
  },

  // =====================================================
  // MODULE 3: BIA (Business Impact Analysis)
  // =====================================================
  {
    title: "📊 BIA - Analyse d'Impact",
    href: "/bia",
    icon: BarChart3,
    children: [
      {
        title: "Dashboard BIA",
        href: "/bia/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Liste des processus",
        href: "/bia",
        icon: ClipboardList,
      },
      {
        title: "Nouveau processus",
        href: "/bia/processes/new",
        icon: FileText,
      },
      {
        title: "Usines / Factories",
        href: "/bia/factories",
        icon: Settings,
      },
      {
        title: "Rapports BIA",
        href: "/bia/reports",
        icon: FileText,
      },
      {
        title: "Conformité",
        href: "/compliance",
        icon: Shield,
      },
      {
        title: "Analyse des Écarts",
        href: "/bia/gap-analysis",
        icon: AlertTriangle,
      },
      {
        title: "Stratégies BCM",
        href: "/bia/strategies",
        icon: ShieldAlert,
      },
      {
        title: "Appréciation Risques",
        href: "/risk/assessment",
        icon: ShieldAlert,
      },
      {
        title: "Dashboard BCM",
        href: "/bcm",
        icon: Shield,
      },
    ],
  },

  // =====================================================
  // MODULE 4: WORKSHOP (Formation & Développement)
  // =====================================================
  {
    title: "📚 Workshop",
    href: "/workshop",
    icon: GraduationCap,
    children: [
      {
        title: "Formations",
        href: "/training",
        icon: BookOpen,
      },
      {
        title: "Plans d'action",
        href: "/plan",
        icon: ClipboardList,
      },
      {
        title: "Types de plans",
        href: "/plan-type",
        icon: Workflow,
      },
      {
        title: "Événements",
        href: "/participations",
        icon: Users,
      },
      {
        title: "Notifications",
        href: "/notifications",
        icon: Mail,
      },
    ],
  },

  // =====================================================
  // AUTRES SECTIONS (Profil, Admin, Paramètres)
  // =====================================================
  {
    title: "Profil & Compte",
    href: "/profile",
    icon: UserCircle,
    children: [
      {
        title: "Mon Profil",
        href: "/profile",
        icon: UserCircle,
      },
      {
        title: "Paramètres",
        href: "/settings",
        icon: Settings,
      },
      {
        title: "Plans & Abonnements",
        href: "/plan",
        icon: CreditCard,
      },
    ],
  },
  {
    title: "Administration",
    href: "/admin",
    icon: Shield,
    children: [
      {
        title: "Panel Admin",
        href: "/admin",
        icon: Shield,
      },
      {
        title: "Utilisateurs",
        href: "/users",
        icon: Users,
      },
      {
        title: "Super Admin",
        href: "/super-admin",
        icon: ShieldAlert,
      },
      {
        title: "Email Diagnostics",
        href: "/email-diagnostic",
        icon: Mail,
      },
    ],
  },
];

interface NavigationProps {
  items: {
    title: string;
    href: string;
    icon?: React.ReactNode;
  }[];
}

export function Navigation({ items }: NavigationProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-16 items-center border-b px-4 md:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="pr-0">
          <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10">
            <div className="flex flex-col space-y-3">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    pathname === item.href
                      ? "bg-accent text-accent-foreground"
                      : "transparent"
                  )}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
      <nav className="hidden md:flex md:items-center md:space-x-6">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
              pathname === item.href
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            {item.icon}
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
