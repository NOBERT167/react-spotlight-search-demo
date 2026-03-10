import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/icons";
import { useTheme } from "@/context/ThemeContext";
import { SECTIONS } from "@/data/content";
import type { SectionId } from "@/data/content";
import { cn } from "@/lib/utils";

interface NavbarProps {
  activeSection: string;
  onSectionClick: (id: SectionId) => void;
  onSearchClick: () => void;
}

export function Navbar({
  activeSection,
  onSectionClick,
  onSearchClick,
}: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileOpen]);

  // Close mobile menu on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [mobileOpen]);

  const handleSectionClick = (s: SectionId) => {
    onSectionClick(s);
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-[100] border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0 min-w-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#00d4ff] to-[#7c3aed] flex-shrink-0">
            <Icon.Search className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-[15px] tracking-[-0.02em] truncate hidden sm:inline">
            @nobertdev/react-spotlight-search
          </span>
          <span className="font-bold text-[15px] tracking-[-0.02em] sm:hidden">
            spotlight
          </span>
          <Badge
            variant="secondary"
            className="text-[11px] font-mono bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20 hover:bg-[#00d4ff]/10 hidden xs:inline-flex"
          >
            v0.1.0
          </Badge>
        </div>

        {/* Section links — hidden below lg */}
        <div className="hidden lg:flex items-center gap-1">
          {SECTIONS.map((s) => (
            <Button
              key={s}
              variant="ghost"
              size="sm"
              onClick={() => onSectionClick(s)}
              className={cn(
                "text-[13px] font-medium transition-colors",
                activeSection === s
                  ? "bg-[#00d4ff]/10 text-[#00d4ff] hover:bg-[#00d4ff]/15 hover:text-[#00d4ff]"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {s}
            </Button>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onSearchClick}
            className="flex items-center gap-2 text-muted-foreground text-[13px] border-border"
          >
            <Icon.Search className="w-3 h-3" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline text-[10px] px-1.5 py-px rounded bg-white/5 border border-border font-mono">
              ⌘K
            </kbd>
          </Button>

          {/* Dark / Light toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground w-9 h-9"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Icon.Sun className="w-[18px] h-[18px]" />
            ) : (
              <Icon.Moon className="w-[18px] h-[18px]" />
            )}
          </Button>

          <a
            href="https://github.com/NOBERT167/react-spotlight-search"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon.Github className="w-[18px] h-[18px]" />
          </a>

          {/* Mobile hamburger — visible below lg */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden text-muted-foreground hover:text-foreground w-9 h-9"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <Icon.Close className="w-[18px] h-[18px]" />
            ) : (
              <Icon.Menu className="w-[18px] h-[18px]" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div
          ref={menuRef}
          className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl animate-in slide-in-from-top-1 fade-in duration-150"
        >
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {SECTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSectionClick(s)}
                className={cn(
                  "w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  activeSection === s
                    ? "bg-[#00d4ff]/10 text-[#00d4ff]"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
              >
                {s}
              </button>
            ))}
            <div className="border-t border-border my-1.5" />
            <a
              href="https://github.com/NOBERT167/react-spotlight-search"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors no-underline"
            >
              <Icon.Github className="w-4 h-4" />
              GitHub
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
