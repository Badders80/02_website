import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { DigitalSyndicationSection } from "@/components/sections/DigitalSyndicationSection";
import { MarketplaceSection } from "@/components/sections/MarketplaceSection";
import { PressShowcaseSection } from "@/components/sections/PressShowcaseSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { FixedBg } from "@/components/ui/FixedBg";
import { GrassBg } from "@/components/ui/GrassBg";

export default function HomePage() {
  return (
    <>
      <NavBar />
      <main className="text-foreground">
        <h1 className="sr-only">
          Evolution Stables - Digital Racehorse Ownership & Tokenized RWA Platform
        </h1>

        <div className="w-full bg-black px-0 shadow-[0_0_80px_RGBA(0,0,0,0.35)] m-0 p-0 border-none max-w-none">
          <HeroSection />
        </div>

        <AboutSection />

        <section className="px-0 md:px-0 m-0 p-0 border-none" data-cta-overlay="off">
          <FixedBg
            src="/images/content/background/hooves-black-white.jpg"
            height="h-[50vh]"
            alt="Horse hooves background"
          />
        </section>

        <HowItWorksSection />

        <section className="px-0 md:px-0 m-0 p-0 border-none" data-cta-overlay="off">
          <FixedBg
            src="/images/content/background/landscape-digital-overlay.jpg"
            height="h-[50vh]"
            alt="Digital landscape background"
          />
        </section>

        <DigitalSyndicationSection />

        <section className="px-0 md:px-0 m-0 p-0 border-none">
          <FixedBg
            src="/images/content/background/horse-and-foal.jpg"
            height="h-[50vh]"
            alt="Horse and foal background"
          />
        </section>

        <MarketplaceSection />

        <section id="get-started" className="bg-black">
          <GrassBg src="/images/content/background/hooves-on-grass.png" alt="Hooves on grass background" />
        </section>

        <PressShowcaseSection />

        <FAQSection />

        <Footer />
      </main>
    </>
  );
}
