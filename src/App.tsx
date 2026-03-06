import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type {
  FC,
  ReactElement,
  ReactNode,
  SVGProps,
  KeyboardEvent as ReactKeyboardEvent,
} from "react";

// ─── Embedded Spotlight (self-contained) ──────────────────────────────────────
const SPOTLIGHT_CSS = `
.sp-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding-top:13vh;animation:sp-in 130ms ease;background:rgba(0,0,0,0.65);backdrop-filter:blur(8px)}
@keyframes sp-in{from{opacity:0}to{opacity:1}}
.sp-modal{width:100%;max-width:580px;margin:0 16px;border-radius:16px;overflow:hidden;box-shadow:0 0 0 1px rgba(0,212,255,0.15),0 40px 100px rgba(0,0,0,0.6);animation:sp-modal-in 170ms cubic-bezier(.16,1,.3,1);background:#0d1117;border:1px solid rgba(255,255,255,0.07)}
@keyframes sp-modal-in{from{opacity:0;transform:scale(.95) translateY(-10px)}to{opacity:1;transform:scale(1) translateY(0)}}
.sp-search{display:flex;align-items:center;gap:12px;padding:16px 18px;border-bottom:1px solid rgba(255,255,255,0.06)}
.sp-icon{flex-shrink:0;width:18px;height:18px;opacity:0.35;color:#00d4ff}
.sp-input{flex:1;border:none;outline:none;font-size:16px;font-family:'Geist Mono',monospace;background:transparent;color:#e2e8f0;letter-spacing:-.01em}
.sp-input::placeholder{color:#334155}
.sp-esc{font-size:10px;font-family:'Geist Mono',monospace;padding:3px 8px;border-radius:5px;background:rgba(255,255,255,0.05);color:#475569;border:1px solid rgba(255,255,255,0.08);flex-shrink:0}
.sp-results{max-height:380px;overflow-y:auto;padding:8px;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,0.06) transparent}
.sp-group{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;padding:10px 10px 5px;color:#334155}
.sp-item{display:flex;align-items:center;gap:12px;padding:10px 10px;border-radius:9px;cursor:pointer;transition:background 80ms;border:none;width:100%;text-align:left;background:transparent;font-family:inherit}
.sp-item:hover,.sp-item.active{background:rgba(0,212,255,0.06)}
.sp-item.active{box-shadow:inset 0 0 0 1px rgba(0,212,255,0.12)}
.sp-item-icon{flex-shrink:0;width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;background:rgba(255,255,255,0.05);color:#94a3b8}
.sp-item-icon svg{width:15px;height:15px}
.sp-item-body{flex:1;min-width:0}
.sp-item-label{font-size:14px;font-weight:500;color:#e2e8f0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-.01em}
.sp-item.active .sp-item-label{color:#00d4ff}
.sp-item-desc{font-size:12px;color:#475569;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sp-item-shortcut{font-size:10px;font-family:'Geist Mono',monospace;padding:2px 7px;border-radius:5px;background:rgba(255,255,255,0.05);color:#475569;border:1px solid rgba(255,255,255,0.07);flex-shrink:0}
.sp-footer{display:flex;align-items:center;gap:14px;padding:9px 18px;border-top:1px solid rgba(255,255,255,0.04);font-size:11px;color:#334155;font-family:'Geist Mono',monospace}
.sp-footer-hint{display:flex;align-items:center;gap:5px}
.sp-empty{padding:40px 16px;text-align:center;font-size:14px;color:#334155;font-family:'Geist Mono',monospace}
`;

function injectSpotlightCSS() {
  if (document.querySelector("[data-sp-docs]")) return;
  const s = document.createElement("style");
  s.setAttribute("data-sp-docs", "");
  s.textContent = SPOTLIGHT_CSS;
  document.head.appendChild(s);
}

interface SpotlightAction {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  shortcut?: string;
  group?: string;
  keywords?: string[];
  onSelect: () => void;
}

function fuzzyScore(query: string, target: string): number {
  if (!query) return 1;
  const q = query.toLowerCase(),
    t = target.toLowerCase();
  if (t === q) return 3;
  if (t.startsWith(q)) return 2.5;
  if (t.includes(q)) return 2;
  let qi = 0,
    score = 0,
    cons = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) {
      qi++;
      cons++;
      score += cons * 0.1;
    } else cons = 0;
  }
  return qi === q.length ? score : 0;
}

function filterActions(
  actions: SpotlightAction[],
  query: string,
  limit = 9,
): SpotlightAction[] {
  if (!query.trim()) return actions.slice(0, limit);
  return actions
    .map((a) => ({
      a,
      s: Math.max(
        fuzzyScore(query, a.label) * 2,
        fuzzyScore(query, a.description ?? "") * 1,
        ...(a.keywords ?? []).map((k) => fuzzyScore(query, k) * 1.5),
      ),
    }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.a);
}

function groupBy(actions: SpotlightAction[]): Map<string, SpotlightAction[]> {
  const m = new Map<string, SpotlightAction[]>();
  for (const a of actions) {
    const g = a.group ?? "";
    if (!m.has(g)) m.set(g, []);
    m.get(g)!.push(a);
  }
  return m;
}

const MagicSearchIcon = () => (
  <svg className="sp-icon" viewBox="0 0 20 20" fill="none">
    <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M13 13l3.5 3.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

interface SpotlightModalProps {
  actions: SpotlightAction[];
  onClose: () => void;
}

function SpotlightModal({ actions, onClose }: SpotlightModalProps) {
  injectSpotlightCSS();
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
      className="sp-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sp-modal" onKeyDown={onKey}>
        <div className="sp-search">
          <MagicSearchIcon />
          <input
            ref={inputRef}
            className="sp-input"
            placeholder="Search commands…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          <span className="sp-esc">ESC</span>
        </div>
        <div className="sp-results" ref={listRef}>
          {filtered.length === 0 ? (
            <div className="sp-empty">No results for "{query}"</div>
          ) : (
            Array.from(grouped.entries()).map(([g, items]) => (
              <div key={g}>
                {g && <div className="sp-group">{g}</div>}
                {items.map((a) => {
                  const idx = fi;
                  fi++;
                  return (
                    <button
                      key={a.id}
                      className={`sp-item${idx === activeIdx ? " active" : ""}`}
                      data-i={idx}
                      onClick={() => select(a)}
                      onMouseEnter={() => setActiveIdx(idx)}
                    >
                      {a.icon && <span className="sp-item-icon">{a.icon}</span>}
                      <span className="sp-item-body">
                        <span className="sp-item-label">{a.label}</span>
                        {a.description && (
                          <span className="sp-item-desc">{a.description}</span>
                        )}
                      </span>
                      {a.shortcut && (
                        <kbd className="sp-item-shortcut">{a.shortcut}</kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
        <div className="sp-footer">
          <span className="sp-footer-hint">
            <kbd className="sp-esc">↑↓</kbd> navigate
          </span>
          <span className="sp-footer-hint">
            <kbd className="sp-esc">↵</kbd> select
          </span>
          <span className="sp-footer-hint">
            <kbd className="sp-esc">ESC</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Icons (inline SVG) ───────────────────────────────────────────────────────
const Icon: Record<string, FC<SVGProps<SVGSVGElement>>> = {
  Search: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  ),
  Zap: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  Keyboard: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" />
    </svg>
  ),
  Moon: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  Shield: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Package: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  ),
  Layers: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </svg>
  ),
  Copy: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  ),
  Check: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  Github: (p) => (
    <svg {...p} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  ),
  ChevronRight: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
  Star: (p) => (
    <svg {...p} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  Home: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  BookOpen: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  Terminal: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  ),
  Palette: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  ),
  Settings: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Navigation: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
  ),
};

// ─── Code Block ───────────────────────────────────────────────────────────────
interface CodeBlockProps {
  code: string;
  lang?: string;
  title?: string;
}

function CodeBlock({ code, lang = "tsx", title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple token-based highlighting
  const highlight = (line: string): ReactElement[] => {
    const tokens: ReactElement[] = [];
    let remaining = line;
    const rules = [
      {
        re: /^(import|export|from|const|let|function|return|default|type|interface|extends)\b/,
        cls: "text-violet-400",
      },
      {
        re: /^(useState|useEffect|useCallback|useMemo|useRef)\b/,
        cls: "text-cyan-400",
      },
      { re: /^(".*?"|'.*?'|`[^`]*`)/, cls: "text-emerald-400" },
      { re: /^(\/\/.*)/, cls: "text-slate-500 italic" },
      { re: /^(<\/?[A-Z][a-zA-Z]*>?)/, cls: "text-orange-400" },
      { re: /^([A-Z][a-zA-Z]*)/, cls: "text-orange-400" },
      { re: /^\b(true|false|null|undefined)\b/, cls: "text-amber-400" },
      { re: /^\b\d+\b/, cls: "text-amber-400" },
      { re: /^[{}[\]().,;:<>|&=+\-*/?!]/, cls: "text-slate-400" },
    ];
    while (remaining.length > 0) {
      let matched = false;
      for (const { re, cls } of rules) {
        const m = remaining.match(re);
        if (m) {
          tokens.push(
            <span className={cls} key={tokens.length}>
              {m[0]}
            </span>,
          );
          remaining = remaining.slice(m[0].length);
          matched = true;
          break;
        }
      }
      if (!matched) {
        const idx = tokens.length;
        const last = tokens[idx - 1];
        const lastProps = last?.props as
          | { children?: string; className?: string }
          | undefined;
        if (
          lastProps &&
          typeof lastProps.children === "string" &&
          !lastProps.className
        ) {
          tokens[idx - 1] = (
            <span key={idx - 1}>{lastProps.children + remaining[0]}</span>
          );
        } else {
          tokens.push(<span key={idx}>{remaining[0]}</span>);
        }
        remaining = remaining.slice(1);
      }
    }
    return tokens;
  };

  return (
    <div
      style={{
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.07)",
        background: "#080d14",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          background: "#0a1020",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", gap: 5 }}>
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
              <div
                key={c}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: c,
                  opacity: 0.8,
                }}
              />
            ))}
          </div>
          {title && (
            <span
              style={{
                fontSize: 12,
                color: "#475569",
                fontFamily: "'Geist Mono',monospace",
                marginLeft: 6,
              }}
            >
              {title}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{ fontSize: 11, color: "#334155", fontFamily: "monospace" }}
          >
            {lang}
          </span>
          <button
            onClick={copy}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 10px",
              borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.08)",
              background: copied
                ? "rgba(0,212,255,0.1)"
                : "rgba(255,255,255,0.04)",
              color: copied ? "#00d4ff" : "#475569",
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "monospace",
              transition: "all .15s",
            }}
          >
            {copied ? (
              <Icon.Check style={{ width: 12, height: 12 }} />
            ) : (
              <Icon.Copy style={{ width: 12, height: 12 }} />
            )}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
      {/* Code */}
      <div style={{ padding: "20px 0", overflowX: "auto" }}>
        <pre
          style={{
            margin: 0,
            fontFamily: "'Geist Mono',monospace",
            fontSize: 13,
            lineHeight: 1.75,
          }}
        >
          {code.split("\n").map((line, i) => (
            <div
              key={i}
              style={{ display: "flex", paddingLeft: 16, paddingRight: 24 }}
            >
              <span
                style={{
                  color: "#1e293b",
                  minWidth: 28,
                  userSelect: "none",
                  paddingRight: 16,
                  textAlign: "right",
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>
              <span>{highlight(line)}</span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}

// ─── Inline Code ──────────────────────────────────────────────────────────────
const Code = ({ children }: { children: ReactNode }) => (
  <code
    style={{
      fontFamily: "'Geist Mono',monospace",
      fontSize: "0.85em",
      padding: "2px 7px",
      borderRadius: 5,
      background: "rgba(0,212,255,0.08)",
      color: "#00d4ff",
      border: "1px solid rgba(0,212,255,0.15)",
    }}
  >
    {children}
  </code>
);

// ─── Section heading ──────────────────────────────────────────────────────────
const SectionTag = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: ".1em",
      textTransform: "uppercase",
      color: "#00d4ff",
      fontFamily: "'Geist Mono',monospace",
      marginBottom: 16,
    }}
  >
    <div
      style={{ width: 16, height: 1, background: "#00d4ff", opacity: 0.6 }}
    />
    {children}
    <div
      style={{ width: 16, height: 1, background: "#00d4ff", opacity: 0.6 }}
    />
  </div>
);

// ─── API Table ────────────────────────────────────────────────────────────────
interface ApiRow {
  prop: string;
  type: string;
  default?: string;
  desc: string;
}

function ApiTable({ rows }: { rows: ApiRow[] }) {
  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.07)",
        overflow: "hidden",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: "'Geist Mono',monospace",
          fontSize: 13,
        }}
      >
        <thead>
          <tr style={{ background: "rgba(255,255,255,0.03)" }}>
            {["Prop", "Type", "Default", "Description"].map((h) => (
              <th
                key={h}
                style={{
                  padding: "10px 16px",
                  textAlign: "left",
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              style={{
                borderBottom:
                  i < rows.length - 1
                    ? "1px solid rgba(255,255,255,0.04)"
                    : "none",
              }}
            >
              <td style={{ padding: "12px 16px" }}>
                <Code>{r.prop}</Code>
              </td>
              <td style={{ padding: "12px 16px", color: "#7c3aed" }}>
                {r.type}
              </td>
              <td style={{ padding: "12px 16px", color: "#475569" }}>
                {r.default ?? "—"}
              </td>
              <td
                style={{
                  padding: "12px 16px",
                  color: "#94a3b8",
                  fontFamily: "system-ui",
                }}
              >
                {r.desc}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Demo Actions ─────────────────────────────────────────────────────────────
const DEMO_ACTIONS: SpotlightAction[] = [
  {
    id: "home",
    label: "Home",
    description: "Back to the landing page",
    icon: <Icon.Home style={{ width: 15, height: 15 }} />,
    group: "Navigation",
    onSelect: () => {},
  },
  {
    id: "docs",
    label: "Documentation",
    description: "Browse the full API reference",
    icon: <Icon.BookOpen style={{ width: 15, height: 15 }} />,
    group: "Navigation",
    onSelect: () => {},
  },
  {
    id: "github",
    label: "GitHub Repo",
    description: "View source on GitHub",
    icon: <Icon.Github style={{ width: 15, height: 15 }} />,
    group: "Navigation",
    onSelect: () => window.open("https://github.com", "_blank"),
  },
  {
    id: "settings",
    label: "Settings",
    description: "Open app settings",
    icon: <Icon.Settings style={{ width: 15, height: 15 }} />,
    group: "Navigation",
    shortcut: "⌘,",
    onSelect: () => {},
  },
  {
    id: "theme",
    label: "Toggle Theme",
    description: "Switch between light and dark",
    icon: <Icon.Moon style={{ width: 15, height: 15 }} />,
    group: "Quick Actions",
    keywords: ["dark", "light", "appearance"],
    onSelect: () => {},
  },
  {
    id: "deploy",
    label: "Deploy Project",
    description: "Push to production",
    icon: <Icon.Zap style={{ width: 15, height: 15 }} />,
    group: "Quick Actions",
    keywords: ["publish", "release"],
    shortcut: "⌘D",
    onSelect: () => {},
  },
  {
    id: "search",
    label: "Global Search",
    description: "Search across everything",
    icon: <Icon.Search style={{ width: 15, height: 15 }} />,
    group: "Quick Actions",
    shortcut: "⌘F",
    onSelect: () => {},
  },
  {
    id: "packages",
    label: "Packages",
    description: "Manage npm dependencies",
    icon: <Icon.Package style={{ width: 15, height: 15 }} />,
    group: "Developer",
    onSelect: () => {},
  },
  {
    id: "palette",
    label: "Color Palette",
    description: "Customize your theme colors",
    icon: <Icon.Palette style={{ width: 15, height: 15 }} />,
    group: "Developer",
    onSelect: () => {},
  },
  {
    id: "layers",
    label: "Layers",
    description: "Manage project layers",
    icon: <Icon.Layers style={{ width: 15, height: 15 }} />,
    group: "Developer",
    onSelect: () => {},
  },
];

// ─── Sections content ─────────────────────────────────────────────────────────
const PROVIDER_CODE = `import { SpotlightProvider } from 'react-spotlight';

const actions = [
  {
    id: 'home',
    label: 'Go Home',
    icon: <HomeIcon />,
    group: 'Navigation',
    keywords: ['main', 'start'],
    onSelect: () => navigate('/'),
  },
];

function App() {
  return (
    <SpotlightProvider actions={actions} theme="auto">
      <YourApp />
    </SpotlightProvider>
  );
}`;

const HOOK_CODE = `import { useSpotlightContext } from 'react-spotlight';

function SearchButton() {
  const { open } = useSpotlightContext();

  return (
    <button onClick={open}>
      Search <kbd>⌘K</kbd>
    </button>
  );
}`;

const STANDALONE_CODE = `import { Spotlight, useSpotlight } from 'react-spotlight';
import { createPortal } from 'react-dom';

function MyApp() {
  const { isOpen, close } = useSpotlight({ shortcut: 'mod+k' });

  return (
    <>
      {isOpen && createPortal(
        <Spotlight actions={actions} onClose={close} />,
        document.body
      )}
    </>
  );
}`;

const ROUTER_CODE = `// useSpotlightActions.tsx — use React Router navigate
import { useNavigate } from 'react-router-dom';
import { SpotlightAction } from 'react-spotlight';

export const useSpotlightActions = (): SpotlightAction[] => {
  const navigate = useNavigate();

  return [
    {
      id: 'settings',
      label: 'Settings',
      onSelect: () => navigate('/settings'), // client-side nav
    },
  ];
};`;

const PROVIDER_PROPS = [
  {
    prop: "actions",
    type: "SpotlightAction[]",
    default: "[]",
    desc: "List of actions to display and search through",
  },
  {
    prop: "shortcut",
    type: "string",
    default: '"mod+k"',
    desc: "Keyboard shortcut to open. Supports mod, shift, alt modifiers",
  },
  {
    prop: "placeholder",
    type: "string",
    default: '"Search actions..."',
    desc: "Input placeholder text",
  },
  {
    prop: "emptyMessage",
    type: "string",
    default: '"No results found."',
    desc: "Message shown when search yields no results",
  },
  {
    prop: "limit",
    type: "number",
    default: "8",
    desc: "Maximum number of results to display",
  },
  {
    prop: "theme",
    type: '"light" | "dark" | "auto"',
    default: '"auto"',
    desc: "Color theme. auto follows system or html class",
  },
  {
    prop: "onOpen",
    type: "() => void",
    default: "—",
    desc: "Callback fired when the spotlight opens",
  },
  {
    prop: "onClose",
    type: "() => void",
    default: "—",
    desc: "Callback fired when the spotlight closes",
  },
];

const ACTION_PROPS = [
  {
    prop: "id",
    type: "string",
    default: "—",
    desc: "Unique identifier for the action (required)",
  },
  {
    prop: "label",
    type: "string",
    default: "—",
    desc: "Display label shown in the list (required)",
  },
  {
    prop: "onSelect",
    type: "() => void",
    default: "—",
    desc: "Callback when the action is selected (required)",
  },
  {
    prop: "description",
    type: "string",
    default: "—",
    desc: "Secondary text shown below the label",
  },
  {
    prop: "icon",
    type: "React.ReactNode",
    default: "—",
    desc: "Icon — supports emoji, lucide-react, or any SVG component",
  },
  {
    prop: "shortcut",
    type: "string",
    default: "—",
    desc: "Display-only keyboard hint (e.g. ⌘K). Does not bind keys.",
  },
  {
    prop: "group",
    type: "string",
    default: "—",
    desc: "Group/category name for organizing actions",
  },
  {
    prop: "keywords",
    type: "string[]",
    default: "—",
    desc: "Extra search terms to improve discoverability",
  },
];

// ─── Dot Grid Background ──────────────────────────────────────────────────────
const DotGrid = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage:
        "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
      backgroundSize: "28px 28px",
      maskImage:
        "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
      pointerEvents: "none",
    }}
  />
);

// ─── Main Docs App ────────────────────────────────────────────────────────────
const SECTIONS = [
  "Overview",
  "Installation",
  "Quick Start",
  "API",
  "Theming",
  "Examples",
];

export default function SpotlightDocs() {
  const [spotOpen, setSpotOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Overview");
  const [activeTab, setActiveTab] = useState("Provider");

  // Cmd+K
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSpotOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const navActions = SECTIONS.map((s) => ({
    id: `nav-${s}`,
    label: s,
    group: "Sections",
    icon: <Icon.Navigation style={{ width: 14, height: 14 }} />,
    onSelect: () => {
      scrollTo(s);
      setSpotOpen(false);
    },
  }));

  const BG = "#060810";
  const CARD = "rgba(255,255,255,0.03)";
  const BORDER = "rgba(255,255,255,0.07)";
  const CYAN = "#00d4ff";
  const VIOLET = "#7c3aed";
  const TEXT = "#e2e8f0";
  const MUTED = "#475569";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        color: TEXT,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* ── Nav ── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          borderBottom: `1px solid ${BORDER}`,
          background: "rgba(6,8,16,0.85)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 24px",
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: `linear-gradient(135deg, ${CYAN}, ${VIOLET})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon.Search style={{ width: 14, height: 14, color: "#fff" }} />
            </div>
            <span
              style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-.02em" }}
            >
              react-spotlight
            </span>
            <span
              style={{
                fontSize: 11,
                padding: "2px 8px",
                borderRadius: 100,
                background: "rgba(0,212,255,0.1)",
                color: CYAN,
                border: `1px solid rgba(0,212,255,0.2)`,
                fontFamily: "monospace",
              }}
            >
              v0.1.0
            </span>
          </div>
          {/* Links */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {SECTIONS.map((s) => (
              <button
                key={s}
                onClick={() => scrollTo(s)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 7,
                  border: "none",
                  background:
                    activeSection === s
                      ? "rgba(0,212,255,0.08)"
                      : "transparent",
                  color: activeSection === s ? CYAN : MUTED,
                  fontSize: 13,
                  cursor: "pointer",
                  fontWeight: 500,
                  transition: "all .15s",
                }}
              >
                {s}
              </button>
            ))}
          </div>
          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setSpotOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 12px",
                borderRadius: 8,
                border: `1px solid ${BORDER}`,
                background: CARD,
                color: MUTED,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              <Icon.Search style={{ width: 13, height: 13 }} />
              <span>Search</span>
              <kbd
                style={{
                  fontSize: 10,
                  padding: "1px 6px",
                  borderRadius: 4,
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${BORDER}`,
                  fontFamily: "monospace",
                }}
              >
                ⌘K
              </kbd>
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                padding: 8,
                borderRadius: 8,
                color: MUTED,
                textDecoration: "none",
              }}
            >
              <Icon.Github style={{ width: 18, height: 18 }} />
            </a>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        {/* ── Hero ── */}
        <section
          id="Overview"
          style={{
            position: "relative",
            padding: "100px 0 80px",
            textAlign: "center",
            overflow: "hidden",
          }}
        >
          <DotGrid />
          {/* Glow */}
          <div
            style={{
              position: "absolute",
              top: "10%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 600,
              height: 300,
              background: `radial-gradient(ellipse, rgba(0,212,255,0.08) 0%, transparent 70%)`,
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 16px",
                borderRadius: 100,
                border: `1px solid rgba(0,212,255,0.2)`,
                background: "rgba(0,212,255,0.06)",
                marginBottom: 32,
              }}
            >
              <Icon.Star style={{ width: 12, height: 12, color: CYAN }} />
              <span
                style={{
                  fontSize: 12,
                  color: CYAN,
                  fontFamily: "monospace",
                  fontWeight: 600,
                  letterSpacing: ".04em",
                }}
              >
                ZERO DEPENDENCIES · ~4KB GZIPPED
              </span>
            </div>

            <h1
              style={{
                fontSize: "clamp(42px,7vw,72px)",
                fontWeight: 800,
                letterSpacing: "-.04em",
                margin: "0 0 20px",
                lineHeight: 1.05,
              }}
            >
              Command palette
              <br />
              <span
                style={{
                  backgroundImage: `linear-gradient(135deg, ${CYAN} 0%, ${VIOLET} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                for every React app
              </span>
            </h1>

            <p
              style={{
                fontSize: 18,
                color: MUTED,
                maxWidth: 520,
                margin: "0 auto 48px",
                lineHeight: 1.7,
              }}
            >
              A beautiful, accessible spotlight search with fuzzy matching,
              grouped actions, keyboard navigation, and theme support — drop-in
              ready.
            </p>

            {/* CTA buttons */}
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flexWrap: "wrap",
                marginBottom: 56,
              }}
            >
              <button
                onClick={() => scrollTo("Quick Start")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 24px",
                  borderRadius: 10,
                  border: "none",
                  background: `linear-gradient(135deg, ${CYAN}, ${VIOLET})`,
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: `0 8px 32px rgba(0,212,255,0.2)`,
                }}
              >
                Get Started{" "}
                <Icon.ChevronRight style={{ width: 16, height: 16 }} />
              </button>
              <button
                onClick={() => setSpotOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 24px",
                  borderRadius: 10,
                  border: `1px solid ${BORDER}`,
                  background: CARD,
                  color: TEXT,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Icon.Search style={{ width: 15, height: 15 }} /> Live Demo{" "}
                <kbd
                  style={{
                    fontSize: 11,
                    padding: "1px 7px",
                    borderRadius: 5,
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${BORDER}`,
                    fontFamily: "monospace",
                  }}
                >
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* Install pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 20px",
                borderRadius: 10,
                border: `1px solid ${BORDER}`,
                background: "#080d14",
                fontFamily: "monospace",
                fontSize: 14,
              }}
            >
              <span style={{ color: "#475569" }}>$</span>
              <span style={{ color: CYAN }}>npm install</span>
              <span style={{ color: TEXT }}>react-spotlight</span>
              <CopyInline text="npm install react-spotlight" />
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section style={{ padding: "60px 0" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <SectionTag>Features</SectionTag>
            <h2
              style={{
                fontSize: 32,
                fontWeight: 700,
                letterSpacing: "-.03em",
                margin: 0,
              }}
            >
              Everything you need
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {[
              {
                icon: Icon.Keyboard,
                title: "Keyboard First",
                desc: "Cmd+K out of the box. Fully navigable with ↑↓ Enter Escape. Customizable shortcut string.",
              },
              {
                icon: Icon.Search,
                title: "Fuzzy Search",
                desc: "Smart ranking across label, description and keywords. Scores and sorts results by relevance.",
              },
              {
                icon: Icon.Layers,
                title: "Grouped Actions",
                desc: "Organize actions into labelled groups. Groups are preserved during search.",
              },
              {
                icon: Icon.Moon,
                title: "Auto Theme",
                desc: "Watches your html class and system preference. Works with Tailwind, shadcn, and custom providers.",
              },
              {
                icon: Icon.Shield,
                title: "Accessible",
                desc: "Full ARIA roles: dialog, listbox, option, combobox. Screen-reader and keyboard compliant.",
              },
              {
                icon: Icon.Package,
                title: "Zero Dependencies",
                desc: "React is the only peer dep. ~4kb gzipped. Ships both ESM and CJS builds with .d.ts types.",
              },
            ].map(({ icon: Ic, title, desc }) => (
              <div
                key={title}
                style={{
                  padding: 24,
                  borderRadius: 12,
                  border: `1px solid ${BORDER}`,
                  background: CARD,
                  transition: "border-color .2s, background .2s",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(0,212,255,0.2)";
                  e.currentTarget.style.background = "rgba(0,212,255,0.03)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = BORDER;
                  e.currentTarget.style.background = CARD;
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: "rgba(0,212,255,0.08)",
                    border: "1px solid rgba(0,212,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 14,
                  }}
                >
                  <Ic style={{ width: 17, height: 17, color: CYAN }} />
                </div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 15,
                    marginBottom: 6,
                    letterSpacing: "-.01em",
                  }}
                >
                  {title}
                </div>
                <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.65 }}>
                  {desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Installation ── */}
        <section id="Installation" style={{ padding: "60px 0" }}>
          <SectionTag>Installation</SectionTag>
          <h2
            style={{
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: "-.03em",
              margin: "0 0 8px",
            }}
          >
            Get started in seconds
          </h2>
          <p style={{ color: MUTED, marginBottom: 32, fontSize: 15 }}>
            Install via your preferred package manager. React 17+ is supported.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              ["npm", "npm install react-spotlight"],
              ["pnpm", "pnpm add react-spotlight"],
              ["yarn", "yarn add react-spotlight"],
            ].map(([pm, cmd]) => (
              <div
                key={pm}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 20px",
                  borderRadius: 10,
                  border: `1px solid ${BORDER}`,
                  background: "#080d14",
                  fontFamily: "monospace",
                  fontSize: 14,
                }}
              >
                <span style={{ color: VIOLET, minWidth: 40, fontWeight: 700 }}>
                  {pm}
                </span>
                <span style={{ color: MUTED }}>$</span>
                <span style={{ color: TEXT, flex: 1 }}>{cmd}</span>
                <CopyInline text={cmd} />
              </div>
            ))}
          </div>
        </section>

        {/* ── Quick Start ── */}
        <section id="Quick Start" style={{ padding: "60px 0" }}>
          <SectionTag>Quick Start</SectionTag>
          <h2
            style={{
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: "-.03em",
              margin: "0 0 8px",
            }}
          >
            Three ways to use it
          </h2>
          <p style={{ color: MUTED, marginBottom: 32, fontSize: 15 }}>
            Use the provider for the simplest setup, or go standalone for full
            control.
          </p>

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: 4,
              marginBottom: 20,
              borderBottom: `1px solid ${BORDER}`,
              paddingBottom: 0,
            }}
          >
            {["Provider", "Hook", "Standalone", "With Router"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px 8px 0 0",
                  border: "none",
                  borderBottom:
                    activeTab === t
                      ? `2px solid ${CYAN}`
                      : "2px solid transparent",
                  background:
                    activeTab === t ? "rgba(0,212,255,0.06)" : "transparent",
                  color: activeTab === t ? CYAN : MUTED,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  marginBottom: -1,
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {activeTab === "Provider" && (
            <div>
              <p
                style={{
                  color: MUTED,
                  fontSize: 14,
                  marginBottom: 16,
                  lineHeight: 1.7,
                }}
              >
                Wrap your app with <Code>SpotlightProvider</Code> and pass your
                actions. The keyboard shortcut and portal are managed
                automatically.
              </p>
              <CodeBlock code={PROVIDER_CODE} lang="tsx" title="App.tsx" />
            </div>
          )}
          {activeTab === "Hook" && (
            <div>
              <p
                style={{
                  color: MUTED,
                  fontSize: 14,
                  marginBottom: 16,
                  lineHeight: 1.7,
                }}
              >
                Call <Code>useSpotlightContext()</Code> anywhere inside the
                provider to programmatically open, close, or toggle the
                spotlight.
              </p>
              <CodeBlock code={HOOK_CODE} lang="tsx" title="SearchButton.tsx" />
            </div>
          )}
          {activeTab === "Standalone" && (
            <div>
              <p
                style={{
                  color: MUTED,
                  fontSize: 14,
                  marginBottom: 16,
                  lineHeight: 1.7,
                }}
              >
                Use <Code>useSpotlight</Code> + <Code>Spotlight</Code> directly
                without any context. Full control, render wherever you like.
              </p>
              <CodeBlock code={STANDALONE_CODE} lang="tsx" title="MyApp.tsx" />
            </div>
          )}
          {activeTab === "With Router" && (
            <div>
              <p
                style={{
                  color: MUTED,
                  fontSize: 14,
                  marginBottom: 16,
                  lineHeight: 1.7,
                }}
              >
                When using React Router, always use <Code>useNavigate</Code> in
                your actions. Never use <Code>window.location.href</Code> — it
                causes a full page reload and drops app state.
              </p>
              <CodeBlock
                code={ROUTER_CODE}
                lang="tsx"
                title="useSpotlightActions.tsx"
              />
            </div>
          )}
        </section>

        {/* ── API ── */}
        <section id="API" style={{ padding: "60px 0" }}>
          <SectionTag>API Reference</SectionTag>
          <h2
            style={{
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: "-.03em",
              margin: "0 0 40px",
            }}
          >
            Props & Types
          </h2>

          <h3
            style={{
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 16,
              letterSpacing: "-.02em",
            }}
          >
            <Code>SpotlightProvider</Code> props
          </h3>
          <ApiTable rows={PROVIDER_PROPS} />

          <h3
            style={{
              fontSize: 18,
              fontWeight: 600,
              margin: "48px 0 16px",
              letterSpacing: "-.02em",
            }}
          >
            <Code>SpotlightAction</Code> shape
          </h3>
          <ApiTable rows={ACTION_PROPS} />

          <h3
            style={{
              fontSize: 18,
              fontWeight: 600,
              margin: "48px 0 16px",
              letterSpacing: "-.02em",
            }}
          >
            Keyboard shortcuts
          </h3>
          <div
            style={{
              borderRadius: 12,
              border: `1px solid ${BORDER}`,
              overflow: "hidden",
            }}
          >
            {[
              ["⌘K / Ctrl+K", "Open spotlight (default, customizable)"],
              ["↑ / ↓", "Navigate between results"],
              ["Enter", "Select highlighted action"],
              ["Escape", "Close spotlight"],
            ].map(([key, desc], i, arr) => (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "14px 20px",
                  borderBottom:
                    i < arr.length - 1 ? `1px solid ${BORDER}` : "none",
                  background:
                    i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                }}
              >
                <kbd
                  style={{
                    fontFamily: "monospace",
                    fontSize: 12,
                    padding: "4px 10px",
                    borderRadius: 6,
                    background: "rgba(0,212,255,0.08)",
                    border: "1px solid rgba(0,212,255,0.2)",
                    color: CYAN,
                    flexShrink: 0,
                  }}
                >
                  {key}
                </kbd>
                <span style={{ fontSize: 14, color: MUTED }}>{desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Theming ── */}
        <section id="Theming" style={{ padding: "60px 0" }}>
          <SectionTag>Theming</SectionTag>
          <h2
            style={{
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: "-.03em",
              margin: "0 0 8px",
            }}
          >
            Dark, Light, Auto
          </h2>
          <p
            style={{
              color: MUTED,
              marginBottom: 32,
              fontSize: 15,
              lineHeight: 1.7,
            }}
          >
            The <Code>theme</Code> prop accepts <Code>"light"</Code>,{" "}
            <Code>"dark"</Code>, or <Code>"auto"</Code>. In auto mode, it
            watches both the system preference <em>and</em> the{" "}
            <Code>dark</Code> class on <Code>{"<html>"}</Code> — so it works
            natively with Tailwind, shadcn, and any class-based theme provider.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 16,
              marginBottom: 32,
            }}
          >
            {[
              {
                theme: "auto",
                label: "Auto (Recommended)",
                desc: "Watches <html class='dark'> and system preference. Works with shadcn, Tailwind, MUI.",
                color: CYAN,
              },
              {
                theme: "dark",
                label: "Dark",
                desc: "Always dark regardless of system or html class.",
                color: "#a855f7",
              },
              {
                theme: "light",
                label: "Light",
                desc: "Always light regardless of system or html class.",
                color: "#f59e0b",
              },
            ].map(({ theme, label, desc, color }) => (
              <div
                key={theme}
                style={{
                  padding: 20,
                  borderRadius: 12,
                  border: `1px solid rgba(255,255,255,0.07)`,
                  background: CARD,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: color,
                    }}
                  />
                  <Code>{`theme="${theme}"`}</Code>
                </div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
                  {label}
                </div>
                <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>
                  {desc}
                </div>
              </div>
            ))}
          </div>

          <CodeBlock
            lang="tsx"
            title="AppProviders.tsx"
            code={`// Inside ThemeProvider so useTheme() has access to context
const SpotlightWrapper = ({ children }) => {
  const { theme } = useTheme(); // shadcn useTheme

  const spotlightTheme =
    theme === "dark" ? "dark" :
    theme === "light" ? "light" : "auto"; // "system" → auto

  return (
    <SpotlightProvider actions={actions} theme={spotlightTheme}>
      {children}
    </SpotlightProvider>
  );
};`}
          />
        </section>

        {/* ── Examples ── */}
        <section id="Examples" style={{ padding: "60px 0 100px" }}>
          <SectionTag>Examples</SectionTag>
          <h2
            style={{
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: "-.03em",
              margin: "0 0 8px",
            }}
          >
            Common patterns
          </h2>
          <p style={{ color: MUTED, marginBottom: 40, fontSize: 15 }}>
            Copy-paste patterns for real-world usage.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            <div>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  marginBottom: 6,
                  letterSpacing: "-.01em",
                }}
              >
                Custom shortcut
              </h3>
              <p style={{ color: MUTED, fontSize: 13, marginBottom: 14 }}>
                Override the default ⌘K with any combination.
              </p>
              <CodeBlock
                lang="tsx"
                code={`<SpotlightProvider actions={actions} shortcut="mod+shift+p">\n  <App />\n</SpotlightProvider>`}
              />
            </div>
            <div>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  marginBottom: 6,
                  letterSpacing: "-.01em",
                }}
              >
                Dynamic actions from Redux / context
              </h3>
              <p style={{ color: MUTED, fontSize: 13, marginBottom: 14 }}>
                Compute actions inside a hook to access store data.
              </p>
              <CodeBlock
                lang="tsx"
                code={`const useSpotlightActions = () => {\n  const user = useAppSelector(s => s.user);\n  const navigate = useNavigate();\n\n  return useMemo(() => [\n    {\n      id: 'profile',\n      label: \`\${user.name}'s Profile\`,\n      onSelect: () => navigate('/profile'),\n    },\n  ], [user.name, navigate]);\n};`}
              />
            </div>
            <div>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  marginBottom: 6,
                  letterSpacing: "-.01em",
                }}
              >
                Change Photo via custom event
              </h3>
              <p style={{ color: MUTED, fontSize: 13, marginBottom: 14 }}>
                Trigger UI elements (like a hidden file input) from spotlight
                without prop drilling.
              </p>
              <CodeBlock
                lang="tsx"
                code={`// In your action:\nonSelect: () => document.dispatchEvent(new CustomEvent('spotlight:change-photo'))\n\n// In your Header component:\nuseEffect(() => {\n  const handler = () => photoInputRef.current?.click();\n  document.addEventListener('spotlight:change-photo', handler);\n  return () => document.removeEventListener('spotlight:change-photo', handler);\n}, []);`}
              />
            </div>
          </div>
        </section>
      </div>

      {/* ── Footer ── */}
      <footer
        style={{ borderTop: `1px solid ${BORDER}`, padding: "40px 24px" }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: `linear-gradient(135deg, ${CYAN}, ${VIOLET})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon.Search style={{ width: 12, height: 12, color: "#fff" }} />
            </div>
            <span
              style={{ fontWeight: 600, fontSize: 14, letterSpacing: "-.01em" }}
            >
              react-spotlight
            </span>
            <span style={{ color: MUTED, fontSize: 13 }}>· MIT License</span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {["npm", "GitHub", "Issues"].map((l) => (
              <a
                key={l}
                href="#"
                style={{ fontSize: 13, color: MUTED, textDecoration: "none" }}
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>

      {/* ── Live Spotlight ── */}
      {spotOpen && (
        <SpotlightModal
          actions={[...navActions, ...DEMO_ACTIONS]}
          onClose={() => setSpotOpen(false)}
        />
      )}
    </div>
  );
}

function CopyInline({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "4px 8px",
        borderRadius: 5,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.04)",
        color: copied ? "#00d4ff" : "#475569",
        cursor: "pointer",
        fontSize: 11,
        fontFamily: "monospace",
        transition: "all .15s",
        flexShrink: 0,
      }}
    >
      {copied ? (
        <Icon.Check style={{ width: 11, height: 11 }} />
      ) : (
        <Icon.Copy style={{ width: 11, height: 11 }} />
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
