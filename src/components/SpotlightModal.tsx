import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import type { SpotlightAction } from "@/types";
import { filterActions, groupBy } from "@/lib/spotlight-utils";

function MagicSearchIcon() {
  return (
    <svg
      className="flex-shrink-0 w-[18px] h-[18px] opacity-35 text-[#00d4ff]"
      viewBox="0 0 20 20"
      fill="none"
    >
      <circle
        cx="8.5"
        cy="8.5"
        r="5.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M13 13l3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface SpotlightModalProps {
  actions: SpotlightAction[];
  onClose: () => void;
}

export function SpotlightModal({ actions, onClose }: SpotlightModalProps) {
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () => filterActions(actions, query),
    [actions, query],
  );
  const grouped = useMemo(() => groupBy(filtered), [filtered]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-i="${activeIdx}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  const select = useCallback(
    (a: SpotlightAction) => {
      a.onSelect();
      onClose();
    },
    [onClose],
  );

  function onKey(e: ReactKeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[activeIdx]) select(filtered[activeIdx]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }

  let fi = 0;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[13vh] animate-in fade-in duration-150"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-[580px] mx-4 rounded-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-top-2 duration-150"
        style={{
          background: "#0d1117",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow:
            "0 0 0 1px rgba(0,212,255,0.15), 0 40px 100px rgba(0,0,0,0.6)",
        }}
        onKeyDown={onKey}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-[18px] py-4 border-b border-white/[0.06]">
          <MagicSearchIcon />
          <input
            ref={inputRef}
            className="flex-1 border-none outline-none text-base font-mono bg-transparent text-slate-200 tracking-[-0.01em] placeholder-slate-700"
            placeholder="Search commands…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-[5px] bg-white/5 text-slate-500 border border-white/[0.08] flex-shrink-0">
            ESC
          </span>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          className="max-h-[380px] overflow-y-auto p-2 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.06)_transparent]"
        >
          {filtered.length === 0 ? (
            <div className="py-10 px-4 text-center text-sm text-slate-700 font-mono">
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            Array.from(grouped.entries()).map(([g, items]) => (
              <div key={g}>
                {g && (
                  <div className="text-[10px] font-bold uppercase tracking-[.1em] px-2.5 pt-2.5 pb-1 text-slate-700">
                    {g}
                  </div>
                )}
                {items.map((a) => {
                  const idx = fi;
                  fi++;
                  return (
                    <button
                      key={a.id}
                      className={[
                        "flex items-center gap-3 px-2.5 py-2.5 rounded-[9px] cursor-pointer transition-colors duration-75 border-none w-full text-left bg-transparent font-sans",
                        idx === activeIdx
                          ? "bg-[#00d4ff]/[0.06] shadow-[inset_0_0_0_1px_rgba(0,212,255,0.12)]"
                          : "hover:bg-[#00d4ff]/[0.06]",
                      ].join(" ")}
                      data-i={idx}
                      onClick={() => select(a)}
                      onMouseEnter={() => setActiveIdx(idx)}
                    >
                      {a.icon && (
                        <span className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[15px] bg-white/5 text-slate-400">
                          {a.icon}
                        </span>
                      )}
                      <span className="flex-1 min-w-0">
                        <span
                          className={[
                            "block text-sm font-medium truncate tracking-[-0.01em]",
                            idx === activeIdx
                              ? "text-[#00d4ff]"
                              : "text-slate-200",
                          ].join(" ")}
                        >
                          {a.label}
                        </span>
                        {a.description && (
                          <span className="block text-xs text-slate-500 mt-px truncate">
                            {a.description}
                          </span>
                        )}
                      </span>
                      {a.shortcut && (
                        <kbd className="text-[10px] font-mono px-[7px] py-0.5 rounded-[5px] bg-white/5 text-slate-500 border border-white/[0.07] flex-shrink-0">
                          {a.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3.5 px-[18px] py-2 border-t border-white/[0.04] text-[11px] text-slate-700 font-mono">
          {[
            ["↑↓", "navigate"],
            ["↵", "select"],
            ["ESC", "close"],
          ].map(([k, label]) => (
            <span key={k} className="flex items-center gap-[5px]">
              <kbd className="text-[10px] font-mono px-2 py-0.5 rounded-[5px] bg-white/5 text-slate-500 border border-white/[0.08]">
                {k}
              </kbd>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
