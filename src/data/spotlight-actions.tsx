import Icon from "@/components/icons";
import type { SpotlightAction } from "@nobertdev/react-spotlight-search";
import { SECTIONS } from "./content";
import { Coffee } from "lucide-react";

const BMC_URL = "https://buymeacoffee.com/nobertdev";
const GITHUB_URL = "https://github.com/NOBERT167/react-spotlight-search";
const NPM_URL =
  "https://www.npmjs.com/package/@nobertdev/react-spotlight-search";

export const DEMO_ACTIONS: SpotlightAction[] = [
  {
    id: "home",
    label: "Home",
    description: "Back to the landing page",
    icon: <Icon.Home className="w-[15px] h-[15px]" />,
    group: "Navigation",
    keywords: ["main", "start", "landing", "top"],
    onSelect: () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  },
  {
    id: "docs",
    label: "Documentation",
    description: "Browse the full API reference",
    icon: <Icon.BookOpen className="w-[15px] h-[15px]" />,
    group: "Navigation",
    keywords: ["docs", "documentation", "api", "reference"],
    onSelect: () => {
      window.open(
        "https://github.com/NOBERT167/react-spotlight-search#readme",
        "_blank",
      );
    },
  },
  {
    id: "github",
    label: "GitHub Repo",
    description: "View source on GitHub",
    icon: <Icon.Github className="w-[15px] h-[15px]" />,
    group: "Navigation",
    keywords: ["github", "source", "code", "repository"],
    onSelect: () => window.open(GITHUB_URL, "_blank"),
  },
  {
    id: "settings",
    label: "Settings",
    description: "Open app settings",
    icon: <Icon.Settings className="w-[15px] h-[15px]" />,
    group: "Navigation",
    keywords: ["settings", "preferences", "options"],
    shortcut: "⌘,",
    onSelect: () => {
      window.location.href = "/settings";
    },
  },
  {
    id: "buy-me-coffee",
    label: "Buy Me a Coffee",
    description: "Support this project",
    icon: <Coffee className="w-[15px] h-[15px]" />,
    group: "Navigation",
    keywords: ["support", "donate", "sponsor", "coffee", "tip"],
    shortcut: "⌘B",
    onSelect: () => {
      window.open(BMC_URL, "_blank");
    },
  },

  //quick actions
  {
    id: "theme",
    label: "Toggle Theme",
    description: "Switch between light and dark",
    icon: <Icon.Moon className="w-[15px] h-[15px]" />,
    group: "Quick Actions",
    shortcut: "⌘D",
    keywords: ["dark", "light", "appearance"],
    onSelect: () => {},
  },
  {
    id: "deploy",
    label: "Deploy Project",
    description: "Push to production",
    icon: <Icon.Zap className="w-[15px] h-[15px]" />,
    group: "Quick Actions",
    keywords: ["publish", "release"],
    onSelect: () => {},
  },
  {
    id: "search",
    label: "Global Search",
    description: "Search across everything",
    icon: <Icon.Search className="w-[15px] h-[15px]" />,
    group: "Quick Actions",
    shortcut: "⌘F",
    onSelect: () => {},
  },
  {
    id: "packages",
    label: "Packages",
    description: "Manage npm dependencies",
    icon: <Icon.Package className="w-[15px] h-[15px]" />,
    group: "Developer",
    keywords: ["packages", "dependencies", "npm"],
    onSelect: () => {},
  },
  {
    id: "palette",
    label: "Color Palette",
    description: "Customize your theme colors",
    icon: <Icon.Palette className="w-[15px] h-[15px]" />,
    group: "Developer",
    keywords: ["color", "palette", "theme", "customize"],
    onSelect: () => {},
  },
  {
    id: "layers",
    label: "Layers",
    description: "Manage project layers",
    icon: <Icon.Layers className="w-[15px] h-[15px]" />,
    group: "Developer",
    keywords: ["layers", "project", "manage"],
    onSelect: () => {},
  },

  // Support
  {
    id: "buy-me-coffee",
    label: "Buy Me a Coffee",
    description: "Support this project",
    icon: <Icon.Coffee className="w-[15px] h-[15px]" />,
    group: "Support",
    keywords: ["support", "donate", "sponsor", "coffee", "tip"],
    onSelect: () => window.open(BMC_URL, "_blank"),
  },
  {
    id: "npm-package",
    label: "View on npm",
    description: "See the package on npm registry",
    icon: <Icon.Package className="w-[15px] h-[15px]" />,
    group: "Support",
    keywords: ["npm", "registry", "package"],
    onSelect: () => window.open(NPM_URL, "_blank"),
  },
];

export const navActions = SECTIONS.map((s) => ({
  id: `nav-${s}`,
  label: s,
  group: "Sections",
  icon: <Icon.Navigation className="w-3.5 h-3.5" />,
  onSelect: () => {
    document
      .getElementById(s)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  },
}));
