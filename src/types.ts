import type { ReactNode } from "react";

export interface SpotlightAction {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  shortcut?: string;
  group?: string;
  keywords?: string[];
  onSelect: () => void;
}

export interface ApiRow {
  prop: string;
  type: string;
  default?: string;
  desc: string;
}
