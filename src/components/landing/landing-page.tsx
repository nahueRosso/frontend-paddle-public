"use client";

import { HeroSection } from "@/components/landing/hero-section";
import { MultiplataformaSection } from "@/components/landing/multiplataforma-section";
import { WhatsAppSpotlightSection } from "@/components/landing/whatsapp-spotlight-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { LibroDiarioSection } from "@/components/landing/libro-diario-section";
import { AntesDepuesSection } from "@/components/landing/antes-despues-section";
import { PlansSection } from "@/components/landing/plans-section";
import { FaqSection } from "@/components/landing/faq-section";
import { CtaFinalSection } from "@/components/landing/cta-final-section";

export function LandingPage() {
  return (
    <>
      <HeroSection />
      <MultiplataformaSection />
      <WhatsAppSpotlightSection />
      <FeaturesSection />
      <LibroDiarioSection />
      <AntesDepuesSection />
      <PlansSection />
      <FaqSection />
      <CtaFinalSection />
    </>
  );
}
