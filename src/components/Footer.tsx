import Icon from "@/components/icons";
import { Links } from "@/data/content";
import { Github } from "lucide-react";

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
          {Links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[13px] text-muted-foreground hover:text-foreground transition-colors no-underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
      <div className="text-center mt-10 flex gap-2 items-center justify-center">
        <span className="text-sm text-muted-foreground">
          Made with ❤️ by{" "}
          <a
            href="https://nobertdev.vercel.app/"
            className="hover:text-foreground transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Nobert Langat
          </a>
        </span>
        <span className="text-sm text-muted-foreground">
          <a
            href="https://github.com/NOBERT167"
            className="hover:text-foreground transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="inline-block w-4 h-4 mr-1" />
          </a>
        </span>
      </div>
      <div className="text-center text-muted-foreground text-xs mt-2">
        &copy; {new Date().getFullYear()} All rights reserved.
      </div>
    </footer>
  );
}
