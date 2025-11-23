"use client";

import { NotificationsDropdown } from "@/components/notifications-dropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Moon, Search, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

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
    <header className="header-enterprise">
      <div className="flex items-center gap-4">
        {showSidebarToggle && (
          <button
            onClick={toggleSidebar}
            className="icon-btn"
            title={
              isSidebarOpen
                ? "Masquer la barre latérale"
                : "Afficher la barre latérale"
            }
          >
            <Menu className="icon-enterprise" />
            <span className="sr-only">
              {isSidebarOpen ? "Masquer" : "Afficher"} la barre latérale
            </span>
          </button>
        )}
        
        <div className="flex flex-1 items-center justify-between gap-4">
          {/* Enterprise Search */}
          <div className="search-enterprise w-full max-w-md">
            <Search className="icon-enterprise text-muted-foreground" />
            <input
              type="search"
              placeholder="Rechercher..."
              className="flex-1 min-w-0"
            />
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="icon-btn">
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Thème</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="dropdown-enterprise">
                <DropdownMenuItem onClick={() => setTheme("light")} className="dropdown-item">
                  Clair
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="dropdown-item">
                  Sombre
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} className="dropdown-item">
                  Système
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <NotificationsDropdown />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="icon-btn" title="Menu utilisateur">
                  <User className="icon-enterprise" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="dropdown-enterprise">
                <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")} className="dropdown-item">
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/settings")} className="dropdown-item">
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="dropdown-item text-destructive"
                  onClick={() => {
                    // Ajouter la logique de déconnexion ici
                    router.push("/connection");
                  }}
                >
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
