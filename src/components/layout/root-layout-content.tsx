"use client";

import { Button } from "@/components/ui/button";
import { ChatAI } from "@/components/ui/chat-ai";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { Menu, X } from "lucide-react";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "../ui/theme-provider";

// Créer une instance de QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

export function RootLayoutContent({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Effet pour corriger les problèmes d'hydratation causés par les extensions
  useEffect(() => {
    const fixHydrationMismatch = () => {
      const body = document.body;
      if (body) {
        // Supprimer les attributs ajoutés par les extensions après l'hydratation
        body.removeAttribute("data-new-gr-c-s-check-loaded");
        body.removeAttribute("data-gr-ext-installed");
        body.removeAttribute("data-new-gr-c-s-loaded");
        body.removeAttribute("cz-shortcut-listen");
        body.removeAttribute("data-lt-installed");
      }
    };

    // Exécuter immédiatement et après un délai pour s'assurer que les extensions ont terminé
    fixHydrationMismatch();
    const timeoutId = setTimeout(fixHydrationMismatch, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  const pathname = usePathname() || "";
  const isFullScreenLive = pathname.includes("/live");

  if (isFullScreenLive) {
    return (
      <SessionProvider session={session}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen w-full bg-[#050914] overflow-hidden">
              {children}
            </div>
            <Toaster />
            <SonnerToaster position="top-right" />
          </ThemeProvider>
        </QueryClientProvider>
      </SessionProvider>
    );
  }

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Mobile Header with Menu Button - Visible only on mobile */}
          <header className="flex items-center justify-between h-16 px-4 border-b md:hidden bg-card fixed top-0 left-0 right-0 z-20">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
            <span
              className="text-lg font-bold"
              suppressHydrationWarning
              translate="no"
            >
              S.U.R.V.I.V.E. Resilience
            </span>
          </header>

          <div className="flex min-h-screen flex-col md:flex-row pt-16 md:pt-0">
            <main className="flex-1">
              <div className="container mx-auto p-4 md:p-6">{children}</div>
            </main>
          </div>

          {/* Bouton Assistant AI flottant */}
          <ChatAI />
          <Toaster />
          <SonnerToaster position="top-right" />

          {/* Overlay for mobile */}
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 z-10 bg-background/80 backdrop-blur-sm md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
