import type { MarketingContent } from "./types";

export const nl = {
  meta: {
    title: "Mosqon · Digitaal beheer voor moskeeën en verenigingen",
    description:
      "Mosqon geeft besturen van moskeeën, verenigingen en stichtingen één helder overzicht van leden, donaties en toezeggingen. Weg met losse lijsten, WhatsApp-berichten en papiertjes. Alles staat veilig op één plek.",
  },

  nav: {
    skipLink: "Naar inhoud",
    ariaLabel: "Hoofdnavigatie",
    links: [
      { label: "Functies", href: "/#functies" },
      { label: "Hoe het werkt", href: "/#hoe-het-werkt" },
      { label: "Veiligheid", href: "/#veiligheid" },
      { label: "Prijzen", href: "/#prijzen" },
      { label: "FAQ", href: "/#faq" },
    ],
    login: "Inloggen",
    cta: "Plan een demo",
  },

  hero: {
    eyebrow: "Voor moskeeën, verenigingen en hun vrijwilligers",
    title: "Alle administratie van uw gemeenschap, op één plek",
    subtitle:
      "Geen losse lijsten, WhatsApp-groepen en briefjes van de collecte meer. Mosqon geeft het bestuur één helder overzicht van leden, donaties en toezeggingen, ook voor contant geld.",
    ctaPrimary: "Plan een demo",
    ctaSecondary: "Bekijk functies",
    mockAlt:
      "Voorbeeldweergave van het Mosqon-dashboard met donatietotalen, een donatiegrafiek en openstaande toezeggingen, met fictieve gegevens.",
  },

  socialProof: {
    ariaLabel: "Kernpunten",
    // TODO(owner): echte logo's/aantallen verzamelen en showLogos aanzetten.
    showLogos: false,
    claims: [
      "Leden, donaties en toezeggingen in één systeem",
      "Ledenlijst overzetten met controlerapport",
      "Gebouwd voor de praktijk van uw bestuur",
    ],
  },

  features: {
    eyebrow: "Functies",
    title: "Alles wat het bestuur nodig heeft",
    intro:
      "Van de ledenlijst tot de collecte op vrijdag: Mosqon is gebouwd rond de dagelijkse praktijk van moskeeën en verenigingen.",
    items: [
      {
        id: "leden",
        tag: "Leden",
        icon: "users",
        title: "Ledenadministratie zonder gedoe",
        body: "Alle leden en donateurs in één overzicht: zoeken, filteren en aanpassen in seconden. Klik door naar een persoon en zie direct de contactgegevens en de volledige donatiehistorie.",
        mockup: "leden",
        mockAlt:
          "Voorbeeldweergave van de ledenlijst in Mosqon met namen, status en maandbedragen, met fictieve gegevens.",
      },
      {
        id: "donaties",
        tag: "Donaties",
        icon: "heart",
        title: "Elke donatie geregistreerd, ook contant",
        body: "Bank, online of contant geld na het vrijdaggebed of de ledenavond: leg elke donatie in een paar klikken vast. Koppel de donatie aan een lid, of registreer anoniem. Er raakt niets meer zoek.",
        mockup: "donaties",
        mockAlt:
          "Voorbeeldweergave van het donatie-overzicht in Mosqon met bedragen en betaalmethodes, met fictieve gegevens.",
      },
      {
        id: "toezeggingen",
        tag: "Toezeggingen",
        icon: "file-check",
        title: "Toezeggingen die niet meer verdampen",
        body: "Een belofte tijdens de inzamelavond in de Ramadan of de actie voor het nieuwe dak is zo vergeten. Mosqon houdt elke toezegging bij, ook deelbetalingen, en herinnert vriendelijk wie er nog openstaat.",
        mockup: "toezeggingen",
        mockAlt:
          "Voorbeeldweergave van openstaande toezeggingen in Mosqon met voortgangsbalken en statussen, met fictieve gegevens.",
      },
      {
        id: "anbi",
        tag: "ANBI",
        icon: "pen-line",
        title: "ANBI-giften digitaal geregeld",
        body: "Donateurs ondertekenen een periodieke of eenmalige schenkingsovereenkomst digitaal, met automatische bevestiging per e-mail. En het jaaroverzicht voor de Belastingdienst? Dat staat in twee klikken klaar.",
        mockup: "gift",
        mockAlt:
          "Voorbeeldweergave van het digitale schenkingsformulier in Mosqon met keuze tussen periodieke en eenmalige gift en een handtekeningveld, met fictieve gegevens.",
      },
      {
        id: "import",
        tag: "Import",
        icon: "upload",
        title: "Met of zonder bestaande lijst beginnen",
        body: "Heeft u een ledenlijst in Excel of een ander bestand? Upload hem, koppel de kolommen en controleer het resultaat: het controlerapport laat per regel zien wat er is overgenomen. Heeft u nog geen lijst? Dan begint u gewoon in Mosqon zelf.",
        mockup: "import",
        mockAlt:
          "Voorbeeldweergave van de ledenimport in Mosqon met drie stappen en een kolomkoppeling, met fictieve gegevens.",
      },
      {
        id: "dashboard",
        tag: "Rapporten",
        icon: "layout-dashboard",
        title: "Het hele overzicht in één oogopslag",
        body: "Zie direct hoe de maand loopt: donaties, verwachte periodieke giften en openstaande toezeggingen. En staat de kascommissie of de ledenvergadering gepland? Elke donatie en toezegging is terug te vinden.",
        mockup: "dashboard",
        mockAlt:
          "Voorbeeldweergave van het Mosqon-dashboard met maandtotalen en statistieken, met fictieve gegevens.",
      },
      {
        id: "slim",
        tag: "Automatisering",
        icon: "sparkles",
        title: "Slim & automatisch",
        body: "Mosqon neemt het handwerk over, zodat het bestuur zich kan richten op de gemeenschap.",
        bullets: [
          {
            heading: "Automatisch geregeld",
            items: [
              "Betaal-matching: binnenkomende betalingen worden herkend en gekoppeld aan leden en toezeggingen",
              "Slimme herinneringen: wie nog openstaat, krijgt vanzelf een vriendelijk bericht",
              "AI-assistent: stel vragen in gewone taal, zoals “Hoeveel is er deze Ramadan gedoneerd?”",
            ],
          },
          {
            heading: "Betalen zoals uw leden het willen",
            items: [
              "iDEAL-betaallinks voor toezeggingen en contributie",
              "Collecte-QR voor het vrijdaggebed: contantloos doneren",
              "Automatische incasso voor periodieke giften",
              "Bankkoppeling: afschriften worden automatisch ingelezen",
            ],
          },
        ],
        mockup: "automatisering",
        mockAlt:
          "Voorbeeldweergave van automatische betaal-matching en de AI-assistent in Mosqon, met fictieve gegevens.",
      },
    ],
    more: {
      title: "En nog meer",
      items: [
        {
          icon: "calendar",
          title: "Evenementen",
          body: "Organiseer iftars en open dagen met interne inschrijvingen voor uw eigen leden.",
        },
        {
          icon: "briefcase",
          title: "Ondernemers & sponsors",
          body: "Houd bij welke ondernemers uw organisatie steunen, per jaar en per bedrag.",
        },
        {
          icon: "shield",
          title: "Rollen & rechten",
          body: "Geef bestuursleden en commissieleden precies de toegang die bij hun taak past.",
        },
      ],
    },
  },

  mission: {
    eyebrow: "Vertrouwen & verantwoording",
    title: "Het vertrouwen van uw gemeenschap, zorgvuldig beschermd",
    body: "Moskeeën en culturele instellingen dragen de verantwoordelijkheid om iedere donatie zorgvuldig, eerlijk en inzichtelijk te beheren. Met een duidelijke administratie helpen we besturen verantwoording af te leggen en het vertrouwen van de gemeenschap te beschermen.",
    imageAlt: "Twee mannen in gesprek op het tapijt van een moskee",
  },

  recognition: {
    eyebrow: "Herkent u dit?",
    title: "Alles staat ergens, niets staat samen",
    intro:
      "Een ledenlijst hier, een groepsapp daar en briefjes in de la. Elke moskee en vereniging kent het. Mosqon brengt het samen.",
    linkLabel: "Bekijk hoe Mosqon dit oplost",
    scenarios: [
      {
        id: "ledenlijst",
        tabLabel: "De ledenlijst",
        icon: "file-spreadsheet",
        title: "Drie versies van dezelfde ledenlijst",
        chip: "leden-definitief-v3.xlsx",
        body: "De secretaris heeft versie drie, de penningmeester werkt nog in versie twee en niemand weet welke klopt. In Mosqon is er één lijst, altijd actueel, voor het hele bestuur.",
        visual: "leden",
        visualAria:
          "Voorbeeldweergave van één actuele ledenlijst in Mosqon, met fictieve gegevens.",
      },
      {
        id: "collecte",
        tabLabel: "De collecte",
        icon: "hand-coins",
        title: "Contant geld op briefjes",
        chip: "€ 250, contant, vrijdag",
        body: "Na het vrijdaggebed of de ledenavond telt iemand het geld en schrijft het op een briefje dat nog moet worden overgetypt. Met Mosqon legt uw vrijwilliger het direct vast op de telefoon. Probeer het hiernaast.",
        visual: "telefoon",
        visualAria:
          "Voorbeeld: een contante donatie vastleggen op de telefoon, met fictieve gegevens.",
      },
      {
        id: "groepsapp",
        tabLabel: "De groepsapp",
        icon: "messages-square",
        title: "Toezeggingen verdwijnen in de groepsapp",
        chip: "Wie heeft de lijst van de collecte?",
        body: "Een belofte tijdens de inzamelavond is snel gedaan en nog sneller vergeten. Mosqon onthoudt elke toezegging, ook deelbetalingen, en laat precies zien wie er nog openstaat.",
        visual: "toezeggingen",
        visualAria:
          "Voorbeeldweergave van openstaande toezeggingen met voortgangsbalken in Mosqon, met fictieve gegevens.",
      },
    ],
    phone: {
      aria: "Voorbeeld: een contante donatie vastleggen op de telefoon, met fictieve gegevens.",
      appTitle: "Nieuwe donatie",
      amount: "€ 20,00",
      method: "Contant",
      donor: "Anoniem",
      save: "Opslaan",
      saved: "Donatie vastgelegd",
    },
  },

  howItWorks: {
    eyebrow: "Hoe het werkt",
    title: "Binnen een dag aan de slag",
    intro:
      "Geen ingewikkelde installatie of trainingen. De inrichting doet u samen met ons op één dag, daarna is alles goed geregeld: van de collecte op vrijdag tot de cijfers voor uw gemeenschap.",
    steps: [
      {
        title: "Meld uw organisatie aan",
        body: "Plan een demo en we richten Mosqon samen met u in, op de manier die past bij uw moskee of vereniging.",
      },
      {
        title: "Voeg uw leden toe",
        body: "Heeft u al een ledenlijst? Die zet u in een paar stappen over, en u ziet precies wat er is overgenomen. Nog geen lijst? Dan begint u gewoon in Mosqon zelf.",
      },
      {
        title: "Koppel uw betaalsystemen",
        body: "Verbind Mosqon met betaalsystemen zoals Mollie, Stripe of Pay. Ook uw boekhoudprogramma kan gekoppeld worden. Zo komen online betalingen en contant geld samen in één overzicht, zonder zoeken op verschillende websites.",
      },
      {
        title: "Beheer met het hele bestuur",
        body: "Iedereen werkt in hetzelfde overzicht: leden, donaties en toezeggingen, altijd actueel. Wat er via de koppelingen binnenkomt, staat er direct bij.",
      },
      {
        title: "Geef vrijwilligers een veilige link",
        body: "Gaat een vrijwilliger op pad voor de collecte of ledenwerving? Stuur een veilige link die maar één keer werkt. U ziet precies wie wat heeft opgehaald, en er raakt geen briefje meer kwijt.",
      },
      {
        title: "Deel de cijfers met uw gemeenschap",
        body: "Laat uw gemeenschap zien wat er met donaties gebeurt. Deel de cijfers veilig via een link met bestuursleden, commissies en leden, of toon ze op een scherm in de moskee of vereniging.",
      },
    ],
  },

  security: {
    eyebrow: "Veiligheid & privacy",
    title: "Uw ledengegevens zijn veilig",
    intro:
      "Een ledenlijst is persoonlijk. Daarom is Mosqon vanaf de eerste regel gebouwd met privacy als uitgangspunt.",
    cards: [
      {
        title: "Strikt gescheiden per organisatie",
        body: "Elke organisatie heeft een eigen, afgeschermde omgeving. Uw gegevens zijn nooit zichtbaar voor andere organisaties.",
      },
      {
        title: "Versleutelde verbindingen",
        body: "Alle gegevens reizen versleuteld over de lijn, net als bij uw bank. Niemand kan meelezen tussen uw scherm en Mosqon.",
      },
      {
        title: "Geen reclame met uw data",
        body: "Mosqon stuurt alleen functionele e-mails, zoals een donatiebevestiging. Uw ledenlijst wordt nooit gebruikt voor marketing.",
      },
      {
        title: "De data blijft van uw organisatie",
        body: "U kunt al uw gegevens op elk moment zelf exporteren. Stopt u met Mosqon, dan neemt u gewoon alles mee.",
      },
    ],
    gated: {
      // TODO(owner): aanzetten ná verificatie van de Supabase/Vercel-regio's
      // in de dashboards. Tot die tijd worden deze kaarten niet getoond.
      euRegion: {
        enabled: false,
        title: "Data opgeslagen in de EU",
        body: "Uw gegevens staan op servers binnen de Europese Unie.",
      },
      avg: {
        enabled: false,
        title: "AVG-verwerkersovereenkomst",
        body: "Standaard een verwerkersovereenkomst conform de AVG.",
      },
    },
  },

  pricing: {
    eyebrow: "Prijzen",
    title: "Een eerlijke prijs, zonder limieten",
    intro:
      "Kies het pakket dat past bij wat u bijhoudt. Geen limieten op het aantal leden of donaties, en het hele bestuur werkt mee zonder extra kosten.",
    tiers: [
      {
        name: "Donaties",
        audience: "Voor wie de geldstromen op orde wil hebben",
        price: "€ 29",
        period: "per maand",
        yearly: "of € 290 per jaar, twee maanden gratis",
        features: [
          "Donaties registreren: bank, online en contant",
          "Toezeggingen bijhouden, ook deelbetalingen",
          "Digitaal ANBI-schenkingsformulier",
          "ANBI-jaaroverzicht voor de Belastingdienst",
          "Live dashboard met uw eigen cijfers",
          "Ledenlijst overzetten met controlerapport",
          "Support per e-mail",
        ],
        cta: "Plan een demo",
      },
      {
        name: "Compleet",
        audience: "De volledige administratie van uw gemeenschap",
        price: "€ 49",
        period: "per maand",
        yearly: "of € 490 per jaar, twee maanden gratis",
        features: [
          "Alles uit Donaties",
          "Volledige ledenadministratie",
          "Contributie en periodieke giften",
          "Evenementen met inschrijvingen",
          "Ondernemers en sponsors",
          "Rollen en rechten voor het hele bestuur",
        ],
        highlighted: true,
        badge: "Meest gekozen",
        cta: "Plan een demo",
      },
      {
        name: "Compleet + automatisering",
        audience: "Laat het handwerk over aan Mosqon",
        price: "€ 89",
        period: "per maand",
        yearly: "of € 890 per jaar, twee maanden gratis",
        features: [
          "Alles uit Compleet",
          "Mosqon AI: stel vragen in gewone taal",
          "Automatische betaal-matching",
          "Slimme herinneringen die vanzelf worden verstuurd",
          "Bankkoppeling: afschriften automatisch ingelezen",
          "iDEAL-betaallinks, collecte-QR en incasso",
        ],
        cta: "Plan een demo",
      },
    ],
    promo: {
      title: "Introductieaanbod",
      body: "Organisaties die nu instappen krijgen de volledige inrichting en hulp bij het overzetten van hun bestaande lijst cadeau.",
    },
    footnote:
      "Alle bedragen zijn per organisatie en maandelijks opzegbaar. Geen opstartkosten, geen verborgen kosten, geen percentage over uw donaties.",
  },

  faq: {
    eyebrow: "Veelgestelde vragen",
    title: "Wat besturen ons vragen",
    intro:
      "Staat uw vraag er niet tussen? Mail ons gerust, we denken graag mee.",
    contactHeading: "Liever even persoonlijk?",
    contactBody:
      "Stel uw vraag per e-mail en u krijgt snel antwoord van iemand die de praktijk van moskeeën en verenigingen kent.",
    contactEmail: "demo@mosqon.com",
    items: [
      {
        q: "Moeten we al een ledenlijst hebben om te beginnen?",
        a: "Nee. Heeft u een lijst in Excel of CSV, dan zet u die met de ingebouwde import over: u koppelt de kolommen en ziet per regel wat er wordt overgenomen. Werkt u nu met een schrift, een map of helemaal niets? Dan begint u gewoon in Mosqon zelf en voegt u leden toe wanneer het uitkomt. Bij de start helpen we u desgewenst persoonlijk.",
      },
      {
        q: "Wij zijn niet zo technisch. Is Mosqon moeilijk te leren?",
        a: "Nee. Mosqon is gebouwd voor besturen en vrijwilligers, niet voor IT'ers. Er valt niets te installeren: het werkt in de browser en op de telefoon. Bij de start richten we alles samen met u in.",
      },
      {
        q: "Wij zijn een vereniging of stichting, geen moskee. Past Mosqon dan?",
        a: "Zeker. Leden, contributie, donaties en toezeggingen werken voor een vereniging of stichting precies hetzelfde. Mosqon is ontstaan in een moskee, maar gebouwd voor elke gemeenschap die haar administratie op orde wil hebben.",
      },
      {
        q: "Van wie is de data?",
        a: "Van uw organisatie, altijd. U kunt alle gegevens op elk moment zelf exporteren. Mosqon gebruikt uw gegevens nooit voor reclame en verkoopt niets door.",
      },
      {
        q: "Wat kost Mosqon?",
        a: "Vanaf € 29 per maand, afhankelijk van wat u bijhoudt. Niet van hoe groot u bent: er zijn geen limieten op het aantal leden of donaties en het hele bestuur werkt mee zonder extra kosten. Maandelijks opzegbaar, en tijdens de demo krijgt u een voorstel op papier dat u rustig aan het bestuur kunt voorleggen.",
      },
      {
        q: "Wat is de opzegtermijn?",
        a: "Mosqon is maandelijks opzegbaar. Geen langlopende contracten of kleine lettertjes: stopt u, dan exporteert u uw gegevens en neemt u alles mee.",
      },
      {
        q: "Wie van het bestuur kan erbij?",
        a: "Het hele bestuur werkt in hetzelfde overzicht, ieder met een eigen account. Met rollen en rechten bepaalt u wie wat mag. De penningmeester ziet meer dan een commissielid.",
      },
      {
        q: "Is het veilig?",
        a: "Ja. Elke organisatie heeft een eigen afgeschermde omgeving, verbindingen zijn versleuteld en alleen uw eigen bestuur kan bij uw gegevens.",
      },
      {
        q: "Vervangt Mosqon onze boekhouding?",
        a: "Nee, bewust niet. Mosqon is de ledenadministratie van uw organisatie: leden, donaties en toezeggingen. Uw boekhouding blijft waar die is en u exporteert er in een paar klikken naartoe.",
      },
      {
        q: "In welke talen is Mosqon beschikbaar?",
        a: "Vandaag in het Nederlands. Turkse en Arabische versies zijn in voorbereiding, zodat ook bestuursleden en vrijwilligers die liever in hun eigen taal werken goed terechtkunnen.",
      },
      {
        q: "Hoe werkt support?",
        a: "U bereikt ons per e-mail en tijdens de introductieperiode denken we actief mee met uw bestuur, van de eerste inrichting tot het jaaroverzicht.",
      },
    ],
  },

  demo: {
    eyebrow: "Demo",
    title: "Zie Mosqon in actie",
    body: "Plan een vrijblijvende demo van 30 minuten. We laten zien hoe Mosqon werkt voor úw moskee of vereniging, met uw eigen vragen als leidraad.",
    expectations: [
      "30 minuten, online, geen voorbereiding nodig",
      "Vrijblijvend: u beslist daarna in alle rust met uw bestuur",
      "Neem gerust meerdere bestuursleden mee in het gesprek",
    ],
    form: {
      name: "Uw naam",
      organisation: "Moskee of organisatie",
      email: "E-mailadres",
      message: "Uw vraag (optioneel)",
      submit: "Vraag een demo aan",
      mailSubject: "Demo-aanvraag Mosqon",
      note: "U krijgt persoonlijk antwoord van de maker, geen mailinglijst.",
    },
    calendlyPlaceholder:
      "Hier komt straks de agenda om direct een tijdstip te kiezen.",
    mailNote: "Liever direct mailen?",
    email: "demo@mosqon.com",
    whatsapp: {
      // TODO(owner): zakelijk WhatsApp-nummer instellen (internationaal
      // formaat zonder +, bijv. "31612345678") en enabled op true zetten.
      enabled: false,
      number: "",
      linkText: "Liever appen?",
      message:
        "Goedendag, ik ben bestuurslid van een moskee of vereniging en wil graag een demo van Mosqon plannen.",
    },
    share: {
      prompt: "Beslist u samen? Stuur deze pagina door naar uw bestuur.",
      buttonLabel: "Deel Mosqon met uw bestuur",
      title: "Mosqon · Digitaal beheer voor moskeeën en verenigingen",
      text: "Kijk eens naar Mosqon: één overzicht voor leden, donaties en toezeggingen.",
    },
  },

  footer: {
    tagline: "Digitaal beheer voor moskeeën en verenigingen.",
    languagesNote: "Nederlands · Türkçe en العربية in voorbereiding",
    productHeading: "Product",
    legalHeading: "Juridisch",
    contactHeading: "Contact",
    legalLinks: [
      { label: "Privacyverklaring", href: "/privacy" },
      { label: "Algemene voorwaarden", href: "/voorwaarden" },
    ],
    copyright: "© 2026 Mosqon. Alle rechten voorbehouden.",
  },
} satisfies MarketingContent;
