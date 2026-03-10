import type { FC, SVGProps } from "react";
import { SectionTag } from "@/components/SectionTag";
import Icon from "@/components/icons";

interface FeatureItem {
  icon: FC<SVGProps<SVGSVGElement>>;
  title: string;
  desc: string;
}

const FEATURES: FeatureItem[] = [
  {
    icon: Icon.Keyboard,
    title: "Keyboard First",
    desc: "Cmd+K out of the box. Fully navigable with ↑↓ Enter Escape. Customizable shortcut string.",
  },
  {
    icon: Icon.Zap,
    title: "Action Shortcuts",
    desc: "Each action's shortcut field registers a real global keybinding — fires onSelect even when the palette is closed.",
  },
  {
    icon: Icon.Search,
    title: "Fuzzy Search",
    desc: "Smart weighted ranking across label, description and keywords. Scores and sorts results by relevance.",
  },
  {
    icon: Icon.Layers,
    title: "Grouped Actions",
    desc: "Organize actions into labelled groups. Groups are preserved during search.",
  },
  {
    icon: Icon.Moon,
    title: "Auto Theme",
    desc: "Watches your html class and system preference. Works with Tailwind, shadcn, next-themes, and custom providers.",
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
  {
    icon: Icon.Star,
    title: "Fully Typed",
    desc: "Written in TypeScript with all types exported. Full IntelliSense and autocomplete support.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-[60px]">
      <div className="text-center mb-12">
        <SectionTag>Features</SectionTag>
        <h2 className="text-3xl font-bold tracking-[-0.03em] mt-2">
          Everything you need
        </h2>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
        {FEATURES.map(({ icon: Ic, title, desc }) => (
          <div
            key={title}
            className="p-6 rounded-xl border border-border bg-card transition-colors duration-200 hover:border-[#00d4ff]/20 hover:bg-[#00d4ff]/[0.015] cursor-default group"
          >
            <div className="w-9 h-9 rounded-[9px] bg-[#00d4ff]/10 border border-[#00d4ff]/15 flex items-center justify-center mb-[14px]">
              <Ic className="w-[17px] h-[17px] text-[#00d4ff]" />
            </div>
            <div className="font-semibold text-[15px] mb-1.5 tracking-[-0.01em]">
              {title}
            </div>
            <div className="text-[13px] text-muted-foreground leading-[1.65]">
              {desc}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
