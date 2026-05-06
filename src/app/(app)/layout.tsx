"use client";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { SimulationSidebar } from "@/components/layout/SimulationSidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ModeProvider, useMode } from "@/context/mode-context";
import { Inter } from "next/font/google";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

function AppContent({ children }: { children: React.ReactNode }) {
  const { mode } = useMode();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Gestion des notifications d'erreur (ex: Redirection par middleware)
  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "unauthorized") {
      toast.error("Accès refusé", {
        description: "Vous n'avez pas les droits nécessaires pour accéder à cette page.",
        duration: 5000,
      });
    }
  }, [searchParams]);

  const isParticipantMode =
    pathname === "/participant-mode" || pathname.includes("/participant-view");

  return (
    <div
      className="min-h-screen bg-[var(--bg-primary)] font-sans antialiased transition-colors duration-300"
      style={{
        display: "grid",
        gridTemplateColumns: isParticipantMode || !isSidebarOpen ? "1fr" : "220px 1fr",
      }}
    >
      {!isParticipantMode && isSidebarOpen && (
        <aside className="h-screen sticky top-0">
          {mode === "incident" ? (
            <Sidebar isMobileMenuOpen={false} setIsMobileMenuOpen={() => {}} />
          ) : (
            <SimulationSidebar />
          )}
        </aside>
      )}
      <div className="flex flex-col min-w-0">
        {!isParticipantMode && (
          <Header
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            showSidebarToggle={!isParticipantMode}
          />
        )}
        <main
          className="w-full flex-1"
          style={{
            padding: isParticipantMode ? "0" : "0 var(--s6)",
          }}
        >
          <div className="py-8 flex-1">{children}</div>
        </main>
      </div>
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
