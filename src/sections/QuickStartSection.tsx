import { useState } from "react";
import { SectionTag } from "@/components/SectionTag";
import { CodeBlock } from "@/components/CodeBlock";
import { InlineCode } from "@/components/InlineCode";
import { cn } from "@/lib/utils";
import {
  PROVIDER_CODE,
  HOOK_CODE,
  STANDALONE_CODE,
  ROUTER_CODE,
} from "@/data/content";

const TABS = ["Provider", "Hook", "Standalone", "With Router"] as const;
type Tab = (typeof TABS)[number];

const TAB_CONTENT: Record<
  Tab,
  { desc: () => React.ReactNode; code: string; title: string }
> = {
  Provider: {
    desc: () => (
      <>
        Wrap your app with <InlineCode>SpotlightProvider</InlineCode> and pass
        your actions. The keyboard shortcut and portal are managed
        automatically.
      </>
    ),
    code: PROVIDER_CODE,
    title: "App.tsx",
  },
  Hook: {
    desc: () => (
      <>
        Call <InlineCode>useSpotlightContext()</InlineCode> anywhere inside the
        provider to programmatically open, close, or toggle the spotlight.
      </>
    ),
    code: HOOK_CODE,
    title: "SearchButton.tsx",
  },
  Standalone: {
    desc: () => (
      <>
        Use <InlineCode>useSpotlight</InlineCode> +{" "}
        <InlineCode>Spotlight</InlineCode> directly without any context. Full
        control, render wherever you like.
      </>
    ),
    code: STANDALONE_CODE,
    title: "MyApp.tsx",
  },
  "With Router": {
    desc: () => (
      <>
        When using React Router, always use <InlineCode>useNavigate</InlineCode>{" "}
        in your actions. Never use <InlineCode>window.location.href</InlineCode>{" "}
        — it causes a full page reload and drops app state.
      </>
    ),
    code: ROUTER_CODE,
    title: "useSpotlightActions.tsx",
  },
};

export function QuickStartSection() {
  const [activeTab, setActiveTab] = useState<Tab>("Provider");
  const content = TAB_CONTENT[activeTab];

  return (
    <section id="Quick Start" className="py-[60px]">
      <SectionTag>Quick Start</SectionTag>
      <h2 className="text-3xl font-bold tracking-[-0.03em] mb-2">
        Three ways to use it
      </h2>
      <p className="text-muted-foreground mb-8 text-[15px]">
        Use the provider for the simplest setup, or go standalone for full
        control.
      </p>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={cn(
              "px-4 py-2 rounded-t-lg border-none cursor-pointer -mb-px text-[13px] font-medium transition-colors",
              "border-b-2",
              activeTab === t
                ? "border-[#00d4ff] bg-[#00d4ff]/6 text-[#00d4ff]"
                : "border-transparent bg-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <p className="text-muted-foreground text-sm mb-4 leading-7">
        {content.desc()}
      </p>
      <CodeBlock code={content.code} lang="tsx" title={content.title} />
    </section>
  );
}
