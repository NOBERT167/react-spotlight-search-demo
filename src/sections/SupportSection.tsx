import { SectionTag } from "@/components/SectionTag";
import Icon from "@/components/icons";
import buymecoffeeImg from "@/assets/bmc-button.png";

export function SupportSection() {
  return (
    <section id="Support" className="py-[60px] pb-[100px]">
      <SectionTag>Support</SectionTag>
      <h2 className="text-3xl font-bold tracking-[-0.03em] mb-2">
        Support this project
      </h2>
      <p className="text-muted-foreground mb-10 text-[15px] leading-7">
        If this package saves you time or you enjoy using it, consider buying me
        a coffee. Your support helps keep this project maintained and
        improving&nbsp;— every contribution is appreciated!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Buy Me a Coffee card */}
        <a
          href="https://buymeacoffee.com/nobertdev"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex flex-col items-center gap-5 p-8 rounded-2xl border border-[#FFDD00]/30 bg-gradient-to-b from-[#FFDD00]/[0.04] to-transparent hover:border-[#FFDD00]/50 hover:from-[#FFDD00]/[0.08] transition-all duration-300 no-underline"
        >
          {/* <div className="w-16 h-16 rounded-2xl bg-[#FFDD00]/10 border border-[#FFDD00]/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Icon.Coffee className="w-8 h-8 text-[#FFDD00]" />
          </div> */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl bg-gradient-to-br from-[#f59e0b]/20 to-[#f59e0b]/5 border border-[#f59e0b]/20">
            ☕
          </div>

          <div className="text-center">
            <h3 className="text-lg font-bold tracking-[-0.02em] mb-1.5">
              Buy Me a Coffee
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              A quick way to show appreciation and fuel late-night coding
              sessions.
            </p>
          </div>
          {/* <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFDD00] text-[#0d0d0d] font-semibold text-sm hover:bg-[#FFDD00]/90 transition-colors">
            <Icon.Coffee className="w-4 h-4" />
            Buy me a coffee
          </span> */}
          <img
            src={buymecoffeeImg}
            alt="Buy Me a Coffee"
            className="w-auto h-12 object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </a>

        {/* Star on GitHub card */}
        <a
          href="https://github.com/NOBERT167/react-spotlight-search"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex flex-col items-center gap-5 p-8 rounded-2xl border border-border bg-gradient-to-b from-[#00d4ff]/[0.03] to-transparent hover:border-[#00d4ff]/30 hover:from-[#00d4ff]/[0.06] transition-all duration-300 no-underline"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Icon.Star className="w-8 h-8 text-[#00d4ff]" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold tracking-[-0.02em] mb-1.5">
              Star on GitHub
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Stars help others discover the project and motivate continued
              development.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20 font-semibold text-sm hover:bg-[#00d4ff]/20 transition-colors">
            <Icon.Star className="w-4 h-4" />
            Star on GitHub
          </span>
        </a>
      </div>

      {/* Additional ways to support */}
      <div className="mt-10 p-6 rounded-xl border border-border bg-card">
        <h3 className="text-base font-semibold mb-4 tracking-[-0.01em]">
          Other ways to support
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/15 flex items-center justify-center flex-shrink-0">
              <Icon.Share className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Share it</div>
              <div className="text-xs text-muted-foreground leading-relaxed mb-2">
                Spread the word on Twitter/X.
              </div>
              <a
                href={`https://x.com/intent/tweet?text=${encodeURIComponent("Just discovered @nobertdev/react-spotlight-search — a beautiful, accessible ⌘K command palette for React apps. Fuzzy search, grouped actions, keyboard nav, dark/light/auto theme — all in ~4kb!\n\nCheck it out 👇\nhttps://www.npmjs.com/package/@nobertdev/react-spotlight-search")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1DA1F2]/10 text-[#1DA1F2] border border-[#1DA1F2]/20 text-xs font-semibold hover:bg-[#1DA1F2]/20 transition-colors no-underline"
              >
                <Icon.Twitter className="w-3.5 h-3.5" />
                Share on X
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center flex-shrink-0">
              <Icon.Terminal className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-sm font-medium mb-0.5">Contribute</div>
              <div className="text-xs text-muted-foreground leading-relaxed">
                Open issues, submit PRs, or improve docs.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/15 flex items-center justify-center flex-shrink-0">
              <Icon.Star className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-sm font-medium mb-0.5">Leave feedback</div>
              <div className="text-xs text-muted-foreground leading-relaxed">
                Report bugs or suggest features on GitHub.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
