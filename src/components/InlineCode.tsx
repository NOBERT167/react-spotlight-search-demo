import type { ReactNode } from "react";

export function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code className="font-mono text-[0.85em] px-[7px] py-[2px] rounded-md bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20 dark:bg-[#00d4ff]/10 dark:text-[#00d4ff] dark:border-[#00d4ff]/20">
      {children}
    </code>
  );
}
