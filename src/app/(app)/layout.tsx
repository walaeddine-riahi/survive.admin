"use client";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { SimulationSidebar } from "@/components/layout/SimulationSidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ModeProvider, useMode } from "@/context/mode-context";
import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import { useState } from "react";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

function AppContent({ children }: { children: React.ReactNode }) {
  const { mode } = useMode();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const isParticipantMode =
    pathname === "/participant-mode" || pathname.includes("/participant-view");

  return (
    <div
      className={
        inter.variable +
        " min-h-screen bg-background font-sans antialiased h-full relative"
      }
    >
      {!isParticipantMode && isSidebarOpen && (
        <div className="hidden h-full md:flex md:w-64 lg:w-72 md:flex-col md:fixed md:inset-y-0 z-[80]">
          {mode === "incident" ? (
            <Sidebar isMobileMenuOpen={false} setIsMobileMenuOpen={() => {}} />
          ) : (
            <SimulationSidebar />
          )}
        </div>
      )}
      <main
        className={
          isParticipantMode ? "" : isSidebarOpen ? "md:pl-64 lg:pl-72" : ""
        }
      >
        <Header
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          showSidebarToggle={!isParticipantMode}
        />
        <div className="px-6 py-6">{children}</div>
      </main>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModeProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AppContent>{children}</AppContent>
        <Toaster />
      </ThemeProvider>
    </ModeProvider>
  );
}
