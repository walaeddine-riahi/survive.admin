"use client";

import { NotificationsDropdown } from "@/components/notifications-dropdown";
import { ThemeToggle } from "@/components/theme-toggle";
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
import { Menu, Moon, Search, Sun, User, Loader2, PlayCircle, BarChart3, Factory, Users, Users2, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

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
  const { data: session } = useSession();

  // État pour la recherche
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 300);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fermer les résultats si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Appel API de recherche
  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.length < 2) {
        setResults(null);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
        if (response.ok) {
          const data = await response.ok ? await response.json() : null;
          setResults(data);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  const hasResults = results && (
    results.simulations?.length > 0 ||
    results.processes?.length > 0 ||
    results.factories?.length > 0 ||
    results.users?.length > 0 ||
    results.teams?.length > 0
  );

  return (
    <header className="bg-[var(--bg-primary)] h-[52px] flex items-center px-[24px] justify-between sticky top-0 z-[100] border-b border-[var(--bg-tertiary)]">
      {/* Left: Menu Toggle (Mobile) & Brand */}
      <div className="flex items-center gap-4">
        {showSidebarToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hover:bg-[#3C3834] rounded-[8px] h-9 w-9 transition-[var(--transition)] md:hidden"
          >
            <Menu size={20} strokeWidth={1.5} className="text-[var(--text-secondary)]" />
          </Button>
        )}
        
        <div className="md:hidden">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-[8px] bg-[var(--accent)] flex items-center justify-center shrink-0">
              <span className="text-[var(--text-inverse)] font-bold text-sm">S</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Center: Search */}
      <div className="flex-1 flex justify-start max-w-[320px] relative mx-4" ref={searchRef}>
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={16} strokeWidth={1.5} className="text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" />
          </div>
          <Input
            type="search"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            className="pl-10 pr-12 w-full h-8 text-[13px] bg-[var(--bg-surface)] border-[var(--border)] hover:border-[var(--border-subtle)] focus-visible:ring-[var(--accent)]/20 transition-[var(--transition)] placeholder:text-[var(--text-muted)] rounded-[8px]"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isLoading ? (
              <Loader2 size={14} strokeWidth={1.5} className="animate-spin text-[#D97706]" />
            ) : (
              <div className="hidden sm:flex items-center px-1.5 py-0.5 bg-[var(--bg-tertiary)] rounded-[4px] text-[10px] font-medium text-[var(--text-secondary)]">
                <span>⌘K</span>
              </div>
            )}
          </div>
        </div>

        {/* Search Results Dropdown */}
        {isFocused && (searchQuery.length >= 2 || isLoading) && (
          <div className="absolute top-10 left-0 right-0 bg-[#292524] rounded-[8px] shadow-2xl border border-[#3C3835] overflow-hidden z-[110] max-h-[70vh] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 flex flex-col items-center justify-center gap-4">
                <Loader2 size={24} strokeWidth={1.5} className="animate-spin text-[#D97706]" />
                <span className="text-xs text-[#A8A29E] italic">Recherche en cours...</span>
              </div>
            ) : !hasResults ? (
              <div className="p-8 text-center flex flex-col gap-1">
                <span className="text-[14px] font-medium text-[#FAFAF9]">Aucun résultat</span>
                <span className="text-[12px] text-[#78716C]">Affinez votre recherche.</span>
              </div>
            ) : (
              <div className="p-2">
                {results.simulations?.length > 0 && (
                  <div className="mb-2">
                    <div className="px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold text-[#D97706]">Simulations</div>
                    {results.simulations.map((item: any) => (
                      <button key={item.id} onClick={() => { router.push(`/simulation/${item.id}`); setIsFocused(false); }}
                        className="w-full text-left px-3 py-2 hover:bg-[#3C3834] rounded-[6px] transition-all flex items-center gap-3 group">
                        <div className="h-7 w-7 rounded-[4px] bg-[#3C3834] flex items-center justify-center group-hover:bg-[#44403C] transition-colors">
                          <PlayCircle size={14} strokeWidth={1.5} className="text-[#D97706]" />
                        </div>
                        <span className="text-[13px] text-[#FAFAF9]">{item.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Section Actions */}
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <NotificationsDropdown />
        
        <div className="h-4 w-px bg-[#33302D] mx-2 hidden sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-[8px] p-0 hover:bg-[var(--bg-hover)] border border-[var(--border)] overflow-hidden">
              <div className="h-full w-full bg-[var(--accent)] flex items-center justify-center">
                <span className="text-[var(--text-inverse)] font-bold text-[13px]">
                  {session?.user?.name?.charAt(0) || "A"}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[var(--bg-surface)] rounded-[12px] w-56 border border-[var(--border)] mt-2 shadow-2xl">
            <DropdownMenuLabel className="px-4 py-3">
              <div className="flex flex-col space-y-1">
                <p className="text-[14px] font-bold text-[var(--text-primary)]">
                  {session?.user?.name || "Administrateur"}
                </p>
                <p className="text-[12px] text-[var(--text-muted)] truncate">{session?.user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[var(--border)]" />
            <DropdownMenuItem onClick={() => router.push("/profile")} className="px-4 py-2.5 rounded-[8px] m-1 hover:bg-[var(--bg-hover)] text-[var(--text-primary)] text-[13px]">
              <User size={16} strokeWidth={1.5} className="mr-3" /> Profil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")} className="px-4 py-2.5 rounded-[8px] m-1 hover:bg-[var(--bg-hover)] text-[var(--text-primary)] text-[13px]">
              <BarChart3 size={16} strokeWidth={1.5} className="mr-3" /> Paramètres
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[var(--border)]" />
            <DropdownMenuItem className="px-4 py-2.5 rounded-[8px] m-1 text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 text-[13px]" 
              onClick={() => router.push("/connection")}>
              <LogOut size={16} strokeWidth={1.5} className="mr-3" /> Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
