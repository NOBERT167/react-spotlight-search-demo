import { SectionTag } from "@/components/SectionTag";
import { CopyInline } from "@/components/CopyInline";

const PACKAGE_MANAGERS = [
  ["npm", "npm install @nobertdev/react-spotlight-search"],
  ["pnpm", "pnpm add @nobertdev/react-spotlight-search"],
  ["yarn", "yarn add @nobertdev/react-spotlight-search"],
] as const;

export function InstallSection() {
  return (
    <section id="Installation" className="py-[60px]">
      <SectionTag>Installation</SectionTag>
      <h2 className="text-3xl font-bold tracking-[-0.03em] mb-2">
        Get started in seconds
      </h2>
      <p className="text-muted-foreground mb-8 text-[15px]">
        Install via your preferred package manager. React 17+ is supported.
      </p>

      <div className="flex flex-col gap-3">
        {PACKAGE_MANAGERS.map(([pm, cmd]) => (
          <div
            key={pm}
            className="flex items-center gap-3 px-5 py-3.5 rounded-xl border border-border bg-[#080d14] dark:bg-[#080d14] font-mono text-sm"
          >
            <span className="text-[#7c3aed] min-w-[40px] font-bold">{pm}</span>
            <span className="text-muted-foreground">$</span>
            <span className="flex-1 text-gray-200">{cmd}</span>
            <CopyInline text={cmd} />
          </div>
        ))}
      </div>
    </section>
  );
}
