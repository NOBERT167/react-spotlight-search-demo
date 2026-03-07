import { useState } from "react";
import Icon from "@/components/icons";
import { cn } from "@/lib/utils";

interface CopyInlineProps {
  text: string;
  className?: string;
}

export function CopyInline({ text, className }: CopyInlineProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono cursor-pointer transition-all duration-150 flex-shrink-0",
        "border border-white/10 bg-white/5",
        copied
          ? "text-[#00d4ff] border-[#00d4ff]/30 bg-[#00d4ff]/5"
          : "text-slate-500 hover:text-slate-300",
        className,
      )}
    >
      {copied ? (
        <Icon.Check className="w-[11px] h-[11px]" />
      ) : (
        <Icon.Copy className="w-[11px] h-[11px]" />
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
