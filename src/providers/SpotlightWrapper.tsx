import { useTheme } from "@/context/ThemeContext";
import { DEMO_ACTIONS, navActions } from "@/data/spotlight-actions";
import { SpotlightProvider } from "@nobertdev/react-spotlight-search";
import React, { useMemo } from "react";

const SpotlightWrapper = ({ children }: { children: React.ReactNode }) => {
  const { theme, toggleTheme } = useTheme();
  const spotlightTheme =
    theme === "dark" ? "dark" : theme === "light" ? "light" : "auto";

  const actions = useMemo(() => {
    const themed = DEMO_ACTIONS.map((a) =>
      a.id === "theme" ? { ...a, onSelect: toggleTheme } : a,
    );
    return [...themed, ...navActions];
  }, [toggleTheme]);

  return (
    <SpotlightProvider actions={actions} theme={spotlightTheme} limit={20}>
      {children}
    </SpotlightProvider>
  );
};

export default SpotlightWrapper;
