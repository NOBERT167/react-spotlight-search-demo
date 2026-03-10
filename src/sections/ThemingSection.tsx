import { SectionTag } from "@/components/SectionTag";
import { CodeBlock } from "@/components/CodeBlock";
import { InlineCode } from "@/components/InlineCode";

const THEME_OPTIONS = [
  {
    theme: "auto",
    label: "Auto (Recommended)",
    desc: "Watches <html class='dark'> and system preference. Works with shadcn, Tailwind, MUI.",
    color: "#00d4ff",
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
] as const;

const THEMING_CODE = `// Inside ThemeProvider so useTheme() has access to context
import {actions} from "@/data/spotlight-actions"; // your actions file

const SpotlightWrapper = ({ children }) => {
  const { theme, toggleTheme } = useTheme(); // shadcn useTheme

  const spotlightTheme =
    theme === "dark" ? "dark" :
    theme === "light" ? "light" : "auto"; // "system" → auto

  return (
    <SpotlightProvider actions={actions} theme={spotlightTheme} limit={20}>
      {children}
    </SpotlightProvider>
  );
};`;

export function ThemingSection() {
  return (
    <section id="Theming" className="py-[60px]">
      <SectionTag>Theming</SectionTag>
      <h2 className="text-3xl font-bold tracking-[-0.03em] mb-2">
        Dark, Light, Auto
      </h2>
      <p className="text-muted-foreground mb-8 text-[15px] leading-7">
        The <InlineCode>theme</InlineCode> prop accepts{" "}
        <InlineCode>&quot;light&quot;</InlineCode>,{" "}
        <InlineCode>&quot;dark&quot;</InlineCode>, or{" "}
        <InlineCode>&quot;auto&quot;</InlineCode>. In auto mode, it watches both
        the system preference <em>and</em> the <InlineCode>dark</InlineCode>{" "}
        class on <InlineCode>{"<html>"}</InlineCode> — so it works natively with
        Tailwind, shadcn, and any class-based theme provider.
      </p>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4 mb-8">
        {THEME_OPTIONS.map(({ theme, label, desc, color }) => (
          <div
            key={theme}
            className="p-5 rounded-xl border border-border bg-card"
          >
            <div className="flex items-center gap-2 mb-2.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: color }}
              />
              <InlineCode>{`theme="${theme}"`}</InlineCode>
            </div>
            <div className="font-semibold text-sm mb-1.5">{label}</div>
            <div className="text-[13px] text-muted-foreground leading-[1.6]">
              {desc}
            </div>
          </div>
        ))}
      </div>

      <CodeBlock lang="tsx" title="AppProviders.tsx" code={THEMING_CODE} />
    </section>
  );
}
