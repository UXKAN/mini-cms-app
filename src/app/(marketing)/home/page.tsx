import type { Metadata } from "next";
import { nl } from "../_content/nl";
import { Hero } from "../_components/Hero";
import { SocialProofStrip } from "../_components/SocialProofStrip";
import { RecognitionSection } from "../_components/RecognitionSection";
import { StickyDemoPill } from "../_components/StickyDemoPill";
import { SectionHeading } from "../_components/SectionHeading";
import { FeatureBento } from "../_components/FeatureBento";
import { MissionSection } from "../_components/MissionSection";
import { HowItWorks } from "../_components/HowItWorks";
import { SecuritySection } from "../_components/SecuritySection";
import { PricingSection } from "../_components/PricingSection";
import { FaqSection } from "../_components/FaqSection";
import { DemoCta } from "../_components/DemoCta";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mosqon.com";

// De pagina leeft op /home, maar wordt op het marketingdomein als "/" getoond;
// de canonieke URL is daarom de kale root.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Mosqon",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  inLanguage: "nl",
  description: nl.meta.description,
  url: `${siteUrl}/`,
  provider: {
    "@type": "Organization",
    name: "Mosqon",
    url: siteUrl,
  },
};

export default function MarketingHomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero content={nl.hero} />
      <SocialProofStrip content={nl.socialProof} />
      <RecognitionSection content={nl.recognition} />

      <section
        id="functies"
        className="mx-auto mt-24 max-w-6xl scroll-mt-28 px-6"
      >
        <SectionHeading
          eyebrow={nl.features.eyebrow}
          title={nl.features.title}
          intro={nl.features.intro}
        />
        <FeatureBento content={nl.features} />
      </section>

      <MissionSection content={nl.mission} />
      <HowItWorks content={nl.howItWorks} />
      <SecuritySection content={nl.security} />
      <PricingSection content={nl.pricing} />
      <FaqSection content={nl.faq} whatsapp={nl.demo.whatsapp} />
      <DemoCta content={nl.demo} />
      <StickyDemoPill label={nl.nav.cta} />
    </>
  );
}
