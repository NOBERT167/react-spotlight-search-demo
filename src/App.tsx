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
import { SupportSection } from "@/sections/SupportSection";
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
        {/* animated background  */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full blur-3xl opacity-20 bg-[#00d4ff]/60 animate-pulse"></div>
          <div
            className="absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full blur-3xl opacity-20 bg-[#7c3aed]/60 animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>
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
          <SupportSection />
        </div>
        <Footer />
      </div>
    </TooltipProvider>
  );
}
