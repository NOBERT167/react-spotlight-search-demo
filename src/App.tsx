import { useState, useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SpotlightModal } from "@/components/SpotlightModal";
import { HeroSection } from "@/sections/HeroSection";
import { FeaturesSection } from "@/sections/FeaturesSection";
import { InstallSection } from "@/sections/InstallSection";
import { QuickStartSection } from "@/sections/QuickStartSection";
import { ApiSection } from "@/sections/ApiSection";
import { ThemingSection } from "@/sections/ThemingSection";
import { ExamplesSection } from "@/sections/ExamplesSection";
import { DEMO_ACTIONS } from "@/data/actions";
import { SECTIONS } from "@/data/content";
import type { SectionId } from "@/data/content";
import Icon from "@/components/icons";

export default function App() {
  const [spotOpen, setSpotOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("Overview");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSpotOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const scrollTo = (id: SectionId) => {
    setActiveSection(id);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const navActions = SECTIONS.map((s) => ({
    id: `nav-${s}`,
    label: s,
    group: "Sections",
    icon: <Icon.Navigation className="w-3.5 h-3.5" />,
    onSelect: () => {
      scrollTo(s);
      setSpotOpen(false);
    },
  }));

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Navbar
          activeSection={activeSection}
          onSectionClick={scrollTo}
          onSearchClick={() => setSpotOpen(true)}
        />

        <div className="max-w-[1100px] mx-auto px-6">
          <HeroSection
            onGetStarted={() => scrollTo("Quick Start")}
            onOpenSpotlight={() => setSpotOpen(true)}
          />
          <FeaturesSection />
          <InstallSection />
          <QuickStartSection />
          <ApiSection />
          <ThemingSection />
          <ExamplesSection />
        </div>

        <Footer />

        {spotOpen && (
          <SpotlightModal
            actions={[...navActions, ...DEMO_ACTIONS]}
            onClose={() => setSpotOpen(false)}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
