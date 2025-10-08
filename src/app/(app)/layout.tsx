"use client";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { SimulationSidebar } from "@/components/layout/SimulationSidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ModeProvider, useMode } from "@/context/mode-context";
import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import "../globals.css";
//import { SetStateAction } from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

function AppContent({ children }: { children: React.ReactNode }) {
  const { mode } = useMode();
  const pathname = usePathname();

  const isParticipantMode =
    pathname === "/participant-mode" || pathname.includes("/participant-view");

  return (
    <div
      className={
        inter.variable +
        " min-h-screen bg-background font-sans antialiased h-full relative bg-background"
      }
    >
      {!isParticipantMode && (
        <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80]">
          {mode === "incident" ? (
            <Sidebar 
              isMobileMenuOpen={false} 
              setIsMobileMenuOpen={() => {}} 
            />
          ) : (
            <SimulationSidebar />
          )}
        </div>
      )}
      <main className={isParticipantMode ? "" : "md:pl-72"}>
        <Header />
        <div className="p-6">{children}</div>
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
