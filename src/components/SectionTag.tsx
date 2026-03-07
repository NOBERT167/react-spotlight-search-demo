import type { ReactNode } from "react";

export function SectionTag({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-cyan-700 dark:text-[#00d4ff] font-mono mb-4">
      <div className="w-4 h-px bg-cyan-500 dark:bg-[#00d4ff] opacity-60" />
      {children}
      <div className="w-4 h-px bg-cyan-500 dark:bg-[#00d4ff] opacity-60" />
    </div>
  );
}
