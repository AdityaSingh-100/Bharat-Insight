import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { CTASection } from "@/components/landing/CTASection";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-background overflow-x-hidden">
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </main>
  );
}
