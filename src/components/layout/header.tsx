"use client";

import { NotificationsDropdown } from "@/components/notifications-dropdown";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Menu, Moon, Search, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface HeaderProps {
  isSidebarOpen?: boolean;
  toggleSidebar?: () => void;
  showSidebarToggle?: boolean;
}

export function Header({
  isSidebarOpen = true,
  toggleSidebar,
  showSidebarToggle = true,
}: HeaderProps) {
  const router = useRouter();
  const { setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/98 backdrop-blur-md supports-[backdrop-filter]:bg-background/95">
      <div className="flex h-14 items-center justify-between px-4 gap-2">
        {/* Menu Toggle & Logo */}
        <div className="flex items-center gap-4 min-w-0 flex-shrink-0">
          {showSidebarToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="hover:bg-muted rounded-full h-10 w-10 transition-colors flex-shrink-0"
              title={
                isSidebarOpen ? "Masquer la sidebar" : "Afficher la sidebar"
              }
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          )}
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 flex-shrink-0"
          >
            <div className="h-8 w-8 rounded-sm bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-base">S</span>
            </div>
            <span className="font-medium text-lg hidden sm:inline-block">
              SURVIVE
            </span>
          </Link>
        </div>

        {/* Search Bar - YouTube Style */}
        <div className="flex-1 flex justify-center max-w-3xl mx-4">
          <div className="relative w-full">
            <Input
              type="search"
              placeholder="Rechercher"
              className="pl-4 pr-12 h-10 rounded-full bg-background border border-border hover:border-primary/30 focus-visible:border-primary transition-colors w-full"
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-0 top-0 h-10 w-12 rounded-r-full hover:bg-muted border-l border-border"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 hover:bg-muted rounded-full transition-colors"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem
                onClick={() => setTheme("light")}
                className="rounded-lg"
              >
                Clair
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className="rounded-lg"
              >
                Sombre
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("system")}
                className="rounded-lg"
              >
                Système
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <NotificationsDropdown />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl w-48">
              <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push("/profile")}
                className="rounded-lg"
              >
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/settings")}
                className="rounded-lg"
              >
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-primary rounded-lg"
                onClick={() => {
                  router.push("/connection");
                }}
              >
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
