"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, FileText, Settings2, BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const bcmNav = [
  { title: "Dashboard", href: "/bcm", icon: LayoutDashboard, description: "Vue PowerBI temps réel" },
  { title: "Rapports", href: "/bcm/reports", icon: FileText, description: "Générer Word / PDF" },
];

export default function BcmLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  BCM Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Business Continuity Management — ISO 22301
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nav tabs */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6">
          <nav className="flex items-center gap-1 overflow-x-auto py-2">
            {bcmNav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.href !== "/bcm" && pathname.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={active ? "default" : "ghost"}
                    className={cn(
                      "relative h-auto py-3 px-4 flex-col items-start gap-1 min-w-[130px] transition-all duration-200",
                      active
                        ? "bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-md"
                        : "hover:bg-indigo-50 hover:text-indigo-700"
                    )}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Icon className={cn("h-4 w-4", active ? "text-white" : "text-muted-foreground")} />
                      <span className="font-medium text-sm">{item.title}</span>
                    </div>
                    <span className={cn("text-xs leading-tight text-left w-full", active ? "text-indigo-100" : "text-muted-foreground")}>
                      {item.description}
                    </span>
                    {active && <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-t-full" />}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="animate-in fade-in duration-500">{children}</div>
      </div>
    </div>
  );
}
