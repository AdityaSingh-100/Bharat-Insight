import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { CTASection } from "@/components/landing/CTASection";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <TrustSection />
      <FeaturesSection />
      <CTASection />
    </main>
  );
}

/* ─── Trust / Social Proof strip ─────────────────────────────────────────── */
function TrustSection() {
  const logos = [
    "TRAI",
    "MeitY",
    "BharatNet",
    "Digital India",
    "NITI Aayog",
    "NASSCOM",
  ];

  return (
    <section className="relative py-16 border-y border-white/[0.04]">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-center text-white/20 text-xs uppercase tracking-[0.2em] mb-8">
          Designed for India&apos;s public data ecosystem
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {logos.map((name) => (
            <div
              key={name}
              className="text-white/[0.12] hover:text-white/25 text-lg font-bold tracking-wider transition-colors duration-300 cursor-default font-inter"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
