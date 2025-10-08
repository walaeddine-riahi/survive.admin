import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  BarChart3,
  ClipboardList,
  CreditCard,
  FileText,
  LayoutDashboard,
  LucideIcon,
  Mail,
  Menu,
  MessageSquare,
  PlayCircle,
  Settings,
  Shield,
  ShieldAlert,
  UserCircle,
  Users,
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
  {
    title: "Mode Participant",
    href: "/app/participant-mode",
    icon: UserCircle,
  },
  {
    title: "BIA - Analyse d'Impact",
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
        title: "Rapports BIA",
        href: "/bia/reports",
        icon: FileText,
      },
    ],
  },
  {
    title: "Simulations",
    href: "/simulation",
    icon: PlayCircle,
    children: [
      {
        title: "Liste des simulations",
        href: "/simulation",
        icon: PlayCircle,
      },
      {
        title: "Scénarios",
        href: "/scenario",
        icon: PlayCircle,
      },
      {
        title: "Injections",
        href: "/app/injections",
        icon: PlayCircle,
      },
      {
        title: "Participations",
        href: "/app/participations",
        icon: Users,
      },
    ],
  },
  {
    title: "Authentication",
    href: "/auth",
    icon: UserCircle,
    children: [
      {
        title: "Login",
        href: "/connection",
        icon: UserCircle,
      },
      {
        title: "Sign Up",
        href: "/signup",
        icon: UserCircle,
      },
      {
        title: "Password Reset",
        href: "/password-reset",
        icon: UserCircle,
      },
      {
        title: "Profile",
        href: "/profile",
        icon: UserCircle,
      },
    ],
  },
  {
    title: "Team Management",
    href: "/team",
    icon: Users,
    children: [
      {
        title: "Teams",
        href: "/team",
        icon: Users,
      },
      {
        title: "Team Members",
        href: "/team-member",
        icon: Users,
      },
      {
        title: "Team Chat",
        href: "/team-chat",
        icon: MessageSquare,
      },
    ],
  },
  {
    title: "Task Management",
    href: "/task",
    icon: ClipboardList,
    children: [
      {
        title: "Tasks Overview",
        href: "/task",
        icon: ClipboardList,
      },
      {
        title: "Task Editor",
        href: "/task/edit",
        icon: ClipboardList,
      },
    ],
  },
  {
    title: "Incident Management",
    href: "/incident",
    icon: AlertTriangle,
    children: [
      {
        title: "Incidents List",
        href: "/incident",
        icon: AlertTriangle,
      },
      {
        title: "Create Incident",
        href: "/incident/create",
        icon: AlertTriangle,
      },
      {
        title: "Incident Reports",
        href: "/incident/report",
        icon: FileText,
      },
    ],
  },
  {
    title: "Reports",
    href: "/report",
    icon: FileText,
    children: [
      {
        title: "Reports List",
        href: "/report",
        icon: FileText,
      },
      {
        title: "Create Report",
        href: "/report/create",
        icon: FileText,
      },
    ],
  },
  {
    title: "Administration",
    href: "/admin",
    icon: Settings,
    children: [
      {
        title: "Admin Panel",
        href: "/admin",
        icon: Shield,
      },
      {
        title: "Users",
        href: "/users",
        icon: Users,
      },
      {
        title: "Super Admin",
        href: "/super-admin",
        icon: ShieldAlert,
      },
    ],
  },
  {
    title: "Plans & Billing",
    href: "/plan",
    icon: CreditCard,
    children: [
      {
        title: "Plans",
        href: "/plan",
        icon: CreditCard,
      },
      {
        title: "Subscriptions",
        href: "/plan/subscriptions",
        icon: CreditCard,
      },
    ],
  },
  {
    title: "Email Diagnostics",
    href: "/email-diagnostic",
    icon: Mail,
    children: [
      {
        title: "Diagnostics",
        href: "/email-diagnostic",
        icon: Mail,
      },
      {
        title: "Templates",
        href: "/email-diagnostic/templates",
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
