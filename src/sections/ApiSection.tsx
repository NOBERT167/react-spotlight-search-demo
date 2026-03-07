import { SectionTag } from "@/components/SectionTag";
import { ApiTable } from "@/components/ApiTable";
import { InlineCode } from "@/components/InlineCode";
import {
  PROVIDER_PROPS,
  ACTION_PROPS,
  KEYBOARD_SHORTCUTS,
} from "@/data/content";

export function ApiSection() {
  return (
    <section id="API" className="py-[60px]">
      <SectionTag>API Reference</SectionTag>
      <h2 className="text-3xl font-bold tracking-[-0.03em] mb-10">
        Props &amp; Types
      </h2>

      <h3 className="text-lg font-semibold mb-4 tracking-[-0.02em]">
        <InlineCode>SpotlightProvider</InlineCode> props
      </h3>
      <ApiTable rows={PROVIDER_PROPS} />

      <h3 className="text-lg font-semibold mt-12 mb-4 tracking-[-0.02em]">
        <InlineCode>SpotlightAction</InlineCode> shape
      </h3>
      <ApiTable rows={ACTION_PROPS} />

      <h3 className="text-lg font-semibold mt-12 mb-4 tracking-[-0.02em]">
        Keyboard shortcuts
      </h3>
      <div className="rounded-xl border border-border overflow-hidden">
        {KEYBOARD_SHORTCUTS.map(([key, desc], i) => (
          <div
            key={key}
            className={[
              "flex items-center gap-4 px-5 py-3.5",
              i < KEYBOARD_SHORTCUTS.length - 1 ? "border-b border-border" : "",
              i % 2 !== 0 ? "bg-muted/30" : "",
            ].join(" ")}
          >
            <kbd className="font-mono text-xs px-2.5 py-1 rounded-md bg-cyan-50 border border-cyan-200 text-cyan-700 dark:bg-[#00d4ff]/10 dark:border-[#00d4ff]/20 dark:text-[#00d4ff] flex-shrink-0">
              {key}
            </kbd>
            <span className="text-sm text-muted-foreground">{desc}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
