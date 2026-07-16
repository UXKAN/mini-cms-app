/**
 * Contract voor alle marketing-copy. Eén bestand per taal (nl.ts, later tr.ts /
 * ar.ts) implementeert deze interface, zodat vertalen = één bestand toevoegen.
 *
 * RTL-notities voor een latere Arabische versie:
 * - Componenten gebruiken logische Tailwind-utilities (ps-/pe-/ms-/me-/text-start)
 *   waar richting ertoe doet; die spiegelen automatisch onder dir="rtl".
 * - Afwisselende feature-rijen gebruiken flex-row-reverse en spiegelen dus mee.
 * - Chevrons/pijlen hebben rtl:rotate-180 nodig; de AR-versie vraagt daarnaast
 *   een dir-attribuut op de marketing-wrapper en een passend Arabisch font.
 */

export type MockupKind =
  | "dashboard"
  | "leden"
  | "donaties"
  | "toezeggingen"
  | "gift"
  | "import"
  | "automatisering";

export interface FeatureItem {
  id: string;
  icon: string;
  /** Korte badge op de bento-kaart, bijv. "Leden" of "Automatisering". */
  tag: string;
  title: string;
  body: string;
  bullets?: { heading?: string; items: string[] }[];
  mockup: MockupKind;
  mockAlt: string;
}

export interface MarketingContent {
  meta: {
    title: string;
    description: string;
  };
  nav: {
    skipLink: string;
    ariaLabel: string;
    links: { label: string; href: string }[];
    login: string;
    cta: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    mockAlt: string;
  };
  socialProof: {
    ariaLabel: string;
    showLogos: boolean;
    claims: string[];
  };
  features: {
    eyebrow: string;
    title: string;
    intro: string;
    items: FeatureItem[];
    more: {
      title: string;
      items: { icon: string; title: string; body: string }[];
    };
  };
  mission: {
    eyebrow: string;
    title: string;
    body: string;
    imageAlt: string;
  };
  recognition: {
    eyebrow: string;
    title: string;
    intro: string;
    /** Ankertekst onderin elke scenario-kaart, wijst naar #functies. */
    linkLabel: string;
    scenarios: {
      id: string;
      tabLabel: string;
      icon: "file-spreadsheet" | "hand-coins" | "messages-square";
      title: string;
      /** Herkenbaar chaos-fragment, bijv. een bestandsnaam of chatbericht. */
      chip: string;
      body: string;
      visual: "leden" | "telefoon" | "toezeggingen";
      visualAria: string;
    }[];
    phone: {
      aria: string;
      appTitle: string;
      amount: string;
      method: string;
      donor: string;
      save: string;
      saved: string;
    };
  };
  howItWorks: {
    eyebrow: string;
    title: string;
    intro: string;
    steps: { title: string; body: string }[];
  };
  security: {
    eyebrow: string;
    title: string;
    intro: string;
    cards: { title: string; body: string }[];
    /** Pas tonen na verificatie van de hostingregio's — zie flags hieronder. */
    gated: {
      euRegion: { enabled: boolean; title: string; body: string };
      avg: { enabled: boolean; title: string; body: string };
    };
  };
  pricing: {
    eyebrow: string;
    title: string;
    intro: string;
    /** Pakketten verschillen op functies, nooit op ledenaantal: een moskee
     *  kan Mosqon ook uitsluitend voor donaties gebruiken. */
    tiers: {
      name: string;
      audience: string;
      price: string;
      period: string;
      /** Jaarprijs met korting, bijv. "of € 490 per jaar (2 maanden gratis)". */
      yearly: string;
      features: string[];
      highlighted?: boolean;
      badge?: string;
      cta: string;
    }[];
    /** Tijdelijk introductieaanbod; verwijderen zodra de periode voorbij is. */
    promo: {
      title: string;
      body: string;
    };
    footnote: string;
  };
  faq: {
    eyebrow: string;
    title: string;
    intro: string;
    contactHeading: string;
    contactBody: string;
    contactEmail: string;
    items: { q: string; a: string }[];
  };
  demo: {
    eyebrow: string;
    title: string;
    body: string;
    /** Geruststellende verwachtingen bij het demoformulier. */
    expectations: string[];
    form: {
      name: string;
      organisation: string;
      email: string;
      message: string;
      submit: string;
      mailSubject: string;
      note: string;
    };
    calendlyPlaceholder: string;
    mailNote: string;
    email: string;
    /** Pas tonen als er een zakelijk WhatsApp-nummer is; zie enabled-flag. */
    whatsapp: {
      enabled: boolean;
      number: string;
      linkText: string;
      message: string;
    };
    share: {
      prompt: string;
      buttonLabel: string;
      title: string;
      text: string;
    };
  };
  footer: {
    tagline: string;
    /** Talen-signaal, bijv. "Nederlands · Türkçe en العربية in voorbereiding". */
    languagesNote: string;
    productHeading: string;
    legalHeading: string;
    contactHeading: string;
    legalLinks: { label: string; href: string }[];
    copyright: string;
  };
}
