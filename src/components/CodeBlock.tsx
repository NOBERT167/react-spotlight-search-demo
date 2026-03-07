import { useState } from "react";
import type { ReactElement } from "react";
import Icon from "@/components/icons";

interface CodeBlockProps {
  code: string;
  lang?: string;
  title?: string;
}

function highlight(line: string): ReactElement[] {
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
}

export function CodeBlock({ code, lang = "tsx", title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-white/[0.07] bg-[#080d14]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-[#0a1020]">
        <div className="flex items-center gap-2">
          <div className="flex gap-[5px]">
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
              <div
                key={c}
                className="w-2.5 h-2.5 rounded-full opacity-80"
                style={{ background: c }}
              />
            ))}
          </div>
          {title && (
            <span className="text-xs text-slate-500 font-mono ml-1.5">
              {title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-600 font-mono">{lang}</span>
          <button
            onClick={copy}
            className={[
              "inline-flex items-center gap-[5px] px-2.5 py-1 rounded-md border text-xs font-mono cursor-pointer transition-all duration-150",
              copied
                ? "border-[#00d4ff]/30 bg-[#00d4ff]/10 text-[#00d4ff]"
                : "border-white/10 bg-white/5 text-slate-500 hover:text-slate-300",
            ].join(" ")}
          >
            {copied ? (
              <Icon.Check className="w-3 h-3" />
            ) : (
              <Icon.Copy className="w-3 h-3" />
            )}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
      {/* Code */}
      <div className="py-5 overflow-x-auto">
        <pre className="m-0 font-mono text-[13px] leading-7">
          {code.split("\n").map((line, i) => (
            <div key={i} className="flex pl-4 pr-6">
              <span className="text-slate-700 min-w-[28px] select-none pr-4 text-right flex-shrink-0">
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
