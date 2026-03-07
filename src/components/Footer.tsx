import Icon from "@/components/icons";

export function Footer() {
  return (
    <footer className="border-t border-border py-10 px-6">
      <div className="max-w-[1100px] mx-auto flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md flex items-center justify-center bg-gradient-to-br from-[#00d4ff] to-[#7c3aed]">
            <Icon.Search className="w-3 h-3 text-white" />
          </div>
          <span className="font-semibold text-sm tracking-[-0.01em]">
            @nobertdev/react-spotlight-search
          </span>
          <span className="text-muted-foreground text-[13px]">
            · MIT License
          </span>
        </div>

        <div className="flex gap-6">
          {["npm", "GitHub", "Issues"].map((l) => (
            <a
              key={l}
              href="#"
              className="text-[13px] text-muted-foreground hover:text-foreground transition-colors no-underline"
            >
              {l}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
