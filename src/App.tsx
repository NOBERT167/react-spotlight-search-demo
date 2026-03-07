import { useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/sections/HeroSection";
import { FeaturesSection } from "@/sections/FeaturesSection";
import { InstallSection } from "@/sections/InstallSection";
import { QuickStartSection } from "@/sections/QuickStartSection";
import { ApiSection } from "@/sections/ApiSection";
import { ThemingSection } from "@/sections/ThemingSection";
import { ExamplesSection } from "@/sections/ExamplesSection";
import type { SectionId } from "@/data/content";
import { useSpotlightContext } from "@nobertdev/react-spotlight-search";

export default function App() {
  const [activeSection, setActiveSection] = useState<string>("Overview");

  const { open } = useSpotlightContext();

  const scrollTo = (id: SectionId) => {
    setActiveSection(id);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Navbar
          activeSection={activeSection}
          onSectionClick={scrollTo}
          onSearchClick={open}
        />

        <div className="max-w-[1100px] mx-auto px-6">
          <HeroSection
            onGetStarted={() => scrollTo("Quick Start")}
            onOpenSpotlight={open}
          />
          <FeaturesSection />
          <InstallSection />
          <QuickStartSection />
          <ApiSection />
          <ThemingSection />
          <ExamplesSection />
        </div>

        <Footer />
      </div>
    </TooltipProvider>
  );
}
