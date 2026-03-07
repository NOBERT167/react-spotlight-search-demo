import { Button } from "@/components/ui/button";
import { DotGrid } from "@/components/DotGrid";
import { CopyInline } from "@/components/CopyInline";
import Icon from "@/components/icons";
import { BorderBeam } from "@/components/ui/border-beam";

interface HeroSectionProps {
  onGetStarted: () => void;
  onOpenSpotlight: () => void;
}

export function HeroSection({
  onGetStarted,
  onOpenSpotlight,
}: HeroSectionProps) {
  return (
    <section
      id="Overview"
      className="relative py-[100px] pb-20 text-center overflow-hidden"
    >
      <DotGrid />

      {/* Glow */}
      <div
        className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(0,212,255,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 border border-cyan-300 dark:border-[#00d4ff]/20 bg-cyan-50 dark:bg-[#00d4ff]/6">
          <Icon.Star className="w-3 h-3 text-cyan-600 dark:text-[#00d4ff]" />
          <span className="text-xs text-cyan-700 dark:text-[#00d4ff] font-mono font-semibold tracking-[.04em]">
            ZERO DEPENDENCIES · ~4KB GZIPPED
          </span>
        </div>

        <h1 className="text-[clamp(42px,7vw,72px)] font-extrabold tracking-[-0.04em] leading-[1.05] mb-5">
          Command palette
          <br />
          <span className="bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] bg-clip-text text-transparent">
            for every React app
          </span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-[520px] mx-auto mb-12 leading-7">
          A beautiful, accessible spotlight search with fuzzy matching, grouped
          actions, keyboard navigation, and theme support — drop-in ready.
        </p>

        {/* CTAs */}
        <div className="flex gap-3 justify-center flex-wrap mb-14">
          <Button
            size="lg"
            onClick={onGetStarted}
            className="bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-white border-0 shadow-[0_8px_32px_rgba(0,212,255,0.2)] hover:opacity-90 hover:shadow-[0_8px_40px_rgba(0,212,255,0.3)] transition-all text-sm font-semibold"
          >
            Get Started <Icon.ChevronRight className="w-4 h-4 ml-1" />
          </Button>
          <div className="relative rounded-md">
            <Button
              size="lg"
              variant="outline"
              onClick={onOpenSpotlight}
              className="text-sm font-semibold border-border"
            >
              <Icon.Search className="w-4 h-4 mr-2" />
              Live Demo
              <kbd className="ml-2 text-[11px] px-1.5 py-px rounded bg-muted/50 border border-border font-mono">
                ⌘K
              </kbd>
            </Button>
            <BorderBeam
              duration={4}
              size={60}
              //   colorFrom="#00d4ff"
              //   colorTo="#7c3aed"
            />
          </div>
        </div>

        {/* Install pill */}
        <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl border border-border bg-[#080d14] dark:bg-[#080d14] font-mono text-sm">
          <span className="text-muted-foreground">$</span>
          <span className="text-[#00d4ff]">npm install</span>
          <span className="text-gray-200">
            @nobertdev/react-spotlight-search
          </span>
          <CopyInline text="npm install @nobertdev/react-spotlight-search" />
        </div>
      </div>
    </section>
  );
}
