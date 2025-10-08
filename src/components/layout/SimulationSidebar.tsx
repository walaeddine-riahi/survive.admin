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
    <div className="flex flex-col h-full bg-muted text-muted-foreground border-r">
      <div className="p-6">
        <Link href="/simulation" className="flex items-center">
          <h1 className="text-2xl font-bold">Simulation</h1>
        </Link>
      </div>
      <Separator />
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-2">
          {simulationRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-accent-foreground hover:bg-accent rounded-lg transition",
                isActive(route.href)
                  ? "text-accent-foreground bg-accent" // Active state color
                  : "text-muted-foreground" // Inactive state color
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className="h-5 w-5 mr-3 shrink-0" />
                <span className="truncate">{route.title}</span>
              </div>
            </Link>
          ))}
        </div>
      </ScrollArea>
      {/* Optionnellement, ajouter un séparateur et d'autres éléments spécifiques à la simulation ici */}
      {/* <Separator /> */}
      {/* <div className="p-3">...</div> */}
    </div>
  );
}
