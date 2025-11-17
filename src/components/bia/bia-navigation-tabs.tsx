"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  List,
  FileText,
  BarChart3,
  Settings,
} from "lucide-react";

type BiaNavigationTabsProps = {
  children: React.ReactNode;
};

export function BiaNavigationTabs({ children }: BiaNavigationTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex bg-muted/50 p-1">
        <TabsTrigger
          value="overview"
          className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          <LayoutDashboard className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Vue d&apos;ensemble</span>
          <span className="sm:hidden">Vue</span>
        </TabsTrigger>
        <TabsTrigger
          value="processes"
          className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          <List className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Processus</span>
          <span className="sm:hidden">Liste</span>
        </TabsTrigger>
        <TabsTrigger
          value="reports"
          className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          <FileText className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Rapports</span>
          <span className="sm:hidden">Docs</span>
        </TabsTrigger>
        <TabsTrigger
          value="analytics"
          className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Analyses</span>
          <span className="sm:hidden">Stats</span>
        </TabsTrigger>
        <TabsTrigger
          value="settings"
          className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          <Settings className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Paramètres</span>
          <span className="sm:hidden">Config</span>
        </TabsTrigger>
      </TabsList>

      <div className="mt-6">{children}</div>
    </Tabs>
  );
}
