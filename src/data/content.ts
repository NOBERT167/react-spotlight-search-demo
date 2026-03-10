import type { ApiRow } from "@/types";

export const SECTIONS = [
  "Overview",
  "Installation",
  "Quick Start",
  "API",
  "Theming",
  "Examples",
  "Support",
] as const;

export type SectionId = (typeof SECTIONS)[number];

// ─── Code snippets ────────────────────────────────────────────────────────────

export const PROVIDER_CODE = `import { SpotlightProvider } from '@nobertdev/react-spotlight-search';

// Define your actions with onSelect handlers that perform the desired behavior (e.g. navigate, toggle theme, etc.) they can be static or computed dynamically from props, state, or context.
// Always use client-side navigation (e.g. React Router's useNavigate) in your onSelect handlers. Never use window.location.href — it causes a full page reload and drops app state.
// Optional: group and keywords improve organization and searchability but are not required.
// actions with a shortcut prop will be registered as global keybindings (e.g. ⌘S) in addition to showing the shortcut badge in the UI.
//actions can be updated at any time (e.g. in response to API calls or store changes) by calling setActions from useSpotlightContext.
// you can define actions outside the provider and pass them in, or compute them inside the provider component. Both patterns work great.
const actions = [
  {
    id: 'home',
    label: 'Go Home',
    icon: <HomeIcon />,
    group: 'Navigation',
    keywords: ['main', 'start'],
    onSelect: () => navigate('/'),
  },
  {
    id: "dark-mode-toggle",
    label: "Toggle Dark Mode",
    description: "Switch between light and dark themes",
    icon: <Moon />,
    group: "Quick Actions",
    keywords: ["dark", "mode", "theme"],
    shortcut: "⌘D",
    onSelect: () => document.documentElement.classList.toggle("dark"),
  },
];

function App() {
  return (
    <SpotlightProvider actions={actions} theme="auto">
      <YourApp />
    </SpotlightProvider>
  );
}`;

export const HOOK_CODE = `import { useSpotlightContext } from '@nobertdev/react-spotlight-search';

function SearchButton() {
  const { open } = useSpotlightContext();

  return (
    <button onClick={open}>
      Search <kbd>⌘K</kbd>
    </button>
  );
}`;

export const STANDALONE_CODE = `import { Spotlight, useSpotlight } from '@nobertdev/react-spotlight-search';
import { createPortal } from 'react-dom';

function MyApp() {
  const { isOpen, close } = useSpotlight({ shortcut: 'mod+k' });

  return (
    <>
      {isOpen && createPortal(
        <Spotlight actions={actions} onClose={close} />,
        document.body
      )}
    </>
  );
}`;

export const ROUTER_CODE = `// useSpotlightActions.tsx — use React Router navigate
import { useNavigate } from 'react-router-dom';
import { SpotlightAction } from '@nobertdev/react-spotlight-search';

export const useSpotlightActions = (): SpotlightAction[] => {
  const navigate = useNavigate();

  return [
    {
      id: 'settings',
      label: 'Settings',
      onSelect: () => navigate('/settings'), // client-side nav
    },
  ];
};`;

// ─── API Tables ───────────────────────────────────────────────────────────────

export const PROVIDER_PROPS: ApiRow[] = [
  {
    prop: "actions",
    type: "SpotlightAction[]",
    default: "[]",
    desc: "List of actions to display and search through",
  },
  {
    prop: "shortcut",
    type: "string",
    default: '"mod+k"',
    desc: "Keyboard shortcut to open. Supports mod, shift, alt modifiers",
  },
  {
    prop: "placeholder",
    type: "string",
    default: '"Search actions..."',
    desc: "Input placeholder text",
  },
  {
    prop: "emptyMessage",
    type: "string",
    default: '"No results found."',
    desc: "Message shown when search yields no results",
  },
  {
    prop: "limit",
    type: "number",
    default: "8",
    desc: "Maximum number of results to display",
  },
  {
    prop: "theme",
    type: '"light" | "dark" | "auto"',
    default: '"auto"',
    desc: "Color theme. auto follows system or html class",
  },
  {
    prop: "onOpen",
    type: "() => void",
    default: "—",
    desc: "Callback fired when the spotlight opens",
  },
  {
    prop: "onClose",
    type: "() => void",
    default: "—",
    desc: "Callback fired when the spotlight closes",
  },
  {
    prop: "className",
    type: "string",
    default: "—",
    desc: "Extra CSS class applied to the overlay element",
  },
];

export const ACTION_PROPS: ApiRow[] = [
  {
    prop: "id",
    type: "string",
    default: "—",
    desc: "Unique identifier for the action (required)",
  },
  {
    prop: "label",
    type: "string",
    default: "—",
    desc: "Display label shown in the list (required)",
  },
  {
    prop: "onSelect",
    type: "() => void",
    default: "—",
    desc: "Callback when the action is selected (required)",
  },
  {
    prop: "description",
    type: "string",
    default: "—",
    desc: "Secondary text shown below the label",
  },
  {
    prop: "icon",
    type: "React.ReactNode",
    default: "—",
    desc: "Icon — supports emoji, lucide-react, or any SVG component",
  },
  {
    prop: "shortcut",
    type: "string",
    default: "—",
    desc: "Keyboard shortcut (e.g. ⌘S, mod+shift+f). Displayed as a badge and registered as a real global keybinding.",
  },
  {
    prop: "group",
    type: "string",
    default: "—",
    desc: "Group/category name for organizing actions",
  },
  {
    prop: "keywords",
    type: "string[]",
    default: "—",
    desc: "Extra search terms to improve discoverability",
  },
];

export const KEYBOARD_SHORTCUTS = [
  ["⌘K / Ctrl+K", "Open spotlight (default, customizable)"],
  ["↑ / ↓", "Navigate between results"],
  ["Enter", "Select highlighted action"],
  ["Escape", "Close spotlight"],
] as const;

export const Links = [
  {
    label: "GitHub",
    href: "https://github.com/NOBERT167/react-spotlight-search",
  },
  {
    label: "npm",
    href: "https://www.npmjs.com/package/@nobertdev/react-spotlight-search",
  },
  {
    label: "Documentation",
    href: "https://github.com/NOBERT167/react-spotlight-search#readme",
  },
  {
    label: "Buy Me a Coffee",
    href: "https://buymeacoffee.com/nobertdev",
  },
];
