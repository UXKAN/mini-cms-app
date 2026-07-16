/**
 * Uitsluitend fictieve gegevens voor de marketing-mockups.
 * "Moskee An-Nasr" in "Rivierstad" bestaat niet; namen en bedragen zijn
 * verzonnen en mogen nooit vervangen worden door echte ledendata.
 */

export const mockMosque = "Moskee An-Nasr";

export const mockChartPoints = [
  4, 9, 14, 16, 22, 27, 30, 38, 41, 47, 55, 58, 66, 71, 78, 84, 92, 100,
];

export const mockDashboardStats = {
  monthTotal: "€ 4.280",
  monthTrend: "+12%",
  monthCompare: "vs. vorige maand (€ 3.815)",
  monthLabel: "Juli 2026",
  yearTotal: "€ 28.640",
  yearLabel: "Jan – Jul 2026",
  cards: [
    { label: "Periodiek verwacht / maand", value: "€ 1.980", hint: "36 actieve akten" },
    { label: "Niet betaald deze maand", value: "€ 240", hint: "3 akten open" },
    { label: "Openstaande toezeggingen", value: "8", hint: "€ 3.450 verwacht" },
  ],
};

export const mockFloatingCards = {
  members: { label: "Actieve leden", value: "342", trend: "+12 deze maand" },
  matching: {
    label: "Automatische matching",
    value: "€ 1.240",
    hint: "gekoppeld deze week",
    spark: [4, 7, 5, 9, 8, 12, 10, 14, 13, 17],
  },
};

export const mockMembers = [
  { name: "Ahmet Yılmaz", type: "Lid", status: "Actief", amount: "€ 15,00" },
  { name: "Fatma Demir", type: "Lid", status: "Actief", amount: "€ 10,00" },
  { name: "Jan de Vries", type: "Donateur", status: "Actief", amount: "€ 25,00" },
  { name: "Meryem Kaya", type: "Lid", status: "Actief", amount: "€ 12,50" },
  { name: "Mustafa Öztürk", type: "Donateur", status: "Inactief", amount: "-" },
];

export const mockDonations = [
  { date: "12 jul", name: "Ahmet Yılmaz", amount: "€ 50,00", method: "Bank" },
  { date: "12 jul", name: "Anoniem", amount: "€ 20,00", method: "Contant" },
  { date: "11 jul", name: "Meryem Kaya", amount: "€ 100,00", method: "Online" },
  { date: "10 jul", name: "Jan de Vries", amount: "€ 25,00", method: "Bank" },
];

export const mockPledges = [
  {
    name: "Sanne Bakker",
    purpose: "Nieuwe gevel",
    paid: 300,
    total: 500,
    status: "Deels betaald",
  },
  {
    name: "Mustafa Öztürk",
    purpose: "Ramadan-actie",
    paid: 0,
    total: 250,
    status: "Open",
  },
  {
    name: "Fatma Demir",
    purpose: "Onderhoud",
    paid: 150,
    total: 150,
    status: "Voldaan",
  },
];

export const mockImport = {
  steps: ["Bestand kiezen", "Kolommen koppelen", "Controleren"],
  activeStep: 1,
  mappings: [
    { column: "Naam", field: "Naam" },
    { column: "E-mail", field: "E-mailadres" },
    { column: "Bedrag p/m", field: "Maandbedrag" },
  ],
  counts: [
    { label: "18 nieuw", tone: "success" },
    { label: "3 bijgewerkt", tone: "accent" },
    { label: "1 overgeslagen", tone: "muted" },
  ],
};

export const mockAutomation = {
  transactions: [
    { desc: "SEPA Overboeking · A. Yılmaz", amount: "€ 50,00", match: "Gekoppeld aan toezegging" },
    { desc: "iDEAL · M. Kaya", amount: "€ 100,00", match: "Gekoppeld aan lid" },
    { desc: "Incasso · F. Demir", amount: "€ 10,00", match: "Periodieke gift" },
  ],
  assistant: {
    question: "Hoeveel is er deze Ramadan gedoneerd?",
    answer: "In de Ramadan van 2026 is € 12.480 gedoneerd, 23% meer dan vorig jaar.",
  },
  chips: ["iDEAL-link", "Collecte-QR", "Incasso", "Bankkoppeling"],
};
