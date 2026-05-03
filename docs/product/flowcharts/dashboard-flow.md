# Mosqon — bronnen, menu's en dashboard

**Doel:** in één plaatje uitleggen hoe geld en toezeggingen door Mosqon stromen, **welke menu-items van de app waar gebruikt worden**, en welke widgets op het dashboard verschijnen.

Drie kleuren doen het werk:
- 🟦 **Blauw** = invoer (formulier, cash, bank, import)
- 🟧 **Oranje** = belofte / nog niet voldaan
- 🟩 **Groen** = ontvangen geld

> **Kernregel:** een ondertekend formulier is nog geen geld. Pas als de penningmeester het bedrag op de rekening ziet (of cash heeft ontvangen) telt het mee als "ontvangen".

---

## Hoe te bekijken / exporteren

Plak de Mermaid-blokken hieronder op [mermaid.live](https://mermaid.live) → **Actions → PNG/SVG** voor een plaatje in je presentatie. Zie *Tools* onderaan voor andere opties.

---

## Diagram 1 — bronnen → menu's → dashboard

Hoofdflow: waar komt het binnen, waar zie je het terug in Mosqon, en wat verschijnt er op het dashboard.

```mermaid
flowchart LR
    subgraph IN["📥 Waar komt het binnen?"]
        direction TB
        S1["📝 Eenmalige gift<br/><b>direct betaald</b>"]:::sourceReceived
        S2["📝 Eenmalige gift<br/><b>nog niet betaald</b>"]:::sourcePromise
        S3["📝 Periodieke gift<br/><b>+ lidmaatschap</b>"]:::sourcePromise
        S4["📝 Periodieke gift<br/><b>geen lidmaatschap</b>"]:::sourcePromise
        S5["💵 Cash<br/>bij vrijdaggebed"]:::sourceReceived
        S6["🏦 Bankafschrift<br/>(MT940)"]:::sourceReceived
        S7["📂 Excel /<br/>handmatige invoer"]:::sourceMixed
    end

    subgraph APP["📱 Menu in Mosqon"]
        direction TB
        M_LEDEN["👥 Leden"]:::menu
        M_DON["💰 Donaties"]:::menuReceived
        M_TOE["⏳ Toezeggingen"]:::menuPromise
        M_PER["🔁 Periodieke giften"]:::menu
        M_IMP["📂 Imports"]:::menu
    end

    subgraph DASH["📊 Dashboard widgets"]
        direction TB
        W1["💰 Ontvangen deze maand"]:::widgetReceived
        W2["⏳ Openstaande toezeggingen"]:::widgetPromise
        W3["🔁 Periodieke per maand"]:::widget
        W4["👥 Ledenbijdragen per maand"]:::widget
        W5["❓ Nog te matchen"]:::widgetWarning
    end

    %% Bronnen → Menu's
    S1 --> M_DON
    S2 --> M_TOE
    S3 --> M_PER
    S3 --> M_LEDEN
    S4 --> M_PER
    S5 --> M_DON
    S6 --> M_DON
    S6 -.-> M_IMP
    S7 --> M_DON
    S7 -.-> M_IMP

    %% Menu's → Dashboard widgets
    M_DON --> W1
    M_DON --> W5
    M_TOE --> W2
    M_PER --> W3
    M_LEDEN --> W4

    %% Styling
    classDef sourceReceived fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef sourcePromise fill:#dbeafe,stroke:#2563eb,color:#1e3a8a,stroke-dasharray:4
    classDef sourceMixed fill:#e0e7ff,stroke:#6366f1,color:#3730a3
    classDef menu fill:#f1f5f9,stroke:#475569,color:#0f172a
    classDef menuReceived fill:#d1fae5,stroke:#059669,color:#064e3b
    classDef menuPromise fill:#fef3c7,stroke:#d97706,color:#92400e
    classDef widget fill:#ecfdf5,stroke:#059669,color:#064e3b
    classDef widgetReceived fill:#bbf7d0,stroke:#15803d,color:#14532d
    classDef widgetPromise fill:#fef3c7,stroke:#d97706,color:#78350f
    classDef widgetWarning fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
```

---

## Diagram 2 — wat doet het ANBI-formulier per scenario?

Het ANBI-formulier is één publiek formulier, maar levert **vier verschillende uitkomsten** op afhankelijk van wat de schenker invult:

```mermaid
flowchart TB
    FORM["📝 ANBI-formulier ingevuld"]:::form

    Q1{"Type gift?"}:::question
    Q2{"Al betaald?"}:::question
    Q3{"Wil ook lid worden?"}:::question

    R1["✓ Donaties<br/>(method: cash/bank)<br/>+ Toezeggingen<br/>(geregistreerd)"]:::outcomeReceived
    R2["⏳ Toezeggingen<br/>(openstaand,<br/>wacht op betaling)"]:::outcomePromise
    R3["🔁 Periodieke giften<br/>+ 👥 Leden<br/>(persoon staat in beide)"]:::outcomeMember
    R4["🔁 Periodieke giften<br/>(persoon alleen hier)"]:::outcomeDonor

    FORM --> Q1
    Q1 -- "Eenmalig" --> Q2
    Q1 -- "Periodiek" --> Q3

    Q2 -- "Ja" --> R1
    Q2 -- "Nee" --> R2

    Q3 -- "Ja" --> R3
    Q3 -- "Nee" --> R4

    classDef form fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef question fill:#fef9c3,stroke:#ca8a04,color:#713f12
    classDef outcomeReceived fill:#bbf7d0,stroke:#15803d,color:#14532d
    classDef outcomePromise fill:#fef3c7,stroke:#d97706,color:#78350f
    classDef outcomeMember fill:#e9d5ff,stroke:#9333ea,color:#581c87
    classDef outcomeDonor fill:#fce7f3,stroke:#db2777,color:#831843
```

---

## Wat staat er in elk menu-item?

Voor de niet-technische blik: per menu-item één regel uitleg.

| Menu-item | Wat staat erin | Voorbeeld-regel in de tabel |
|---|---|---|
| **📊 Dashboard** | Samenvatting in widgets — geen lijsten | "€ 8.420 ontvangen deze maand" + "€ 12.500 openstaand" |
| **👥 Leden** | Personen met een lidmaatschap (al dan niet met maandbedrag) | Ahmed Yilmaz · €25/m · actief sinds 01-03-2026 |
| **💰 Donaties** | Alle daadwerkelijke betalingen — uit alle bronnen | 12-04 · €100 · cash · Ahmed Y. |
| **⏳ Toezeggingen** | Beloftes die nog niet voldaan zijn | Mohamed K. · €500 voor renovatie · open · gemaakt 02-04 |
| **🔁 Periodieke giften** | Lopende ANBI-akten met maandbedrag | Fatima B. · €30/m · sinds jan-2026 · lid: ja · betaald deze maand: ja |
| **📂 Imports** | Wat is er recent geüpload + wat is gematcht/niet | 01-04 · MT940-april.xml · 23 rijen · 19 gematcht · 4 onbekend |
| **⚙️ Instellingen** | Organisatie-info, gebruikersrollen | (nog niet in MVP) |

---

## Hoe de dashboard-widgets gevuld worden

| Widget | Bron-menu | Telt mee wanneer | Telt **niet** mee |
|---|---|---|---|
| **💰 Ontvangen deze maand** | Donaties | Geld is binnen (cash/bank/online) deze maand | Belofte zonder betaling |
| **⏳ Openstaande toezeggingen** | Toezeggingen | Eenmalige ANBI-akte zonder betaling, of mondelinge belofte | Voldane akte |
| **🔁 Periodieke per maand** | Periodieke giften | Lopende ANBI-akte met maandbedrag | Eenmalige gift |
| **👥 Ledenbijdragen / maand** | Leden | Lid heeft een eigen maandbedrag (niet via periodieke ANBI) | Lid die zijn maandbedrag via een ANBI-akte betaalt — voorkomt dubbele telling |
| **❓ Nog te matchen** | Donaties | Geld is binnen, maar nog niet aan een persoon of afspraak gekoppeld | Gematchte donaties |

**Anti-dubbele-telling:** als iemand én lid is én een periodieke ANBI-akte heeft, telt zijn maandbedrag in het dashboard maar één keer mee — onder "Periodieke per maand", niet ook nog onder "Ledenbijdragen".

---

## Cliché-scenario voor in een presentatie

Stel: Fatima vult op de moskee-website het ANBI-formulier in, kiest "periodieke gift van €30/maand" en vinkt "ik wil ook lid worden" aan.

1. Direct na submit:
   - 🔁 **Periodieke giften** toont een nieuwe regel met Fatima · €30/m
   - 👥 **Leden** toont Fatima ook als lid (zonder eigen maandbedrag — bedrag staat al in de gift)
   - 📊 **Dashboard** widget "Periodieke per maand" gaat omhoog met €30
2. Een maand later, na de bankimport:
   - 💰 **Donaties** toont een nieuwe rij van €30 van Fatima, gekoppeld aan haar periodieke gift
   - 📊 **Dashboard** widget "Ontvangen deze maand" gaat omhoog met €30
   - 🔁 **Periodieke giften**-tabel toont voor Fatima: "betaald deze maand: ✓"

Dat is wat het dashboard kloppend houdt: **één bron voor beloftes, één bron voor ontvangen, en een matching-relatie ertussen.**

---

## Tools voor de presentatie

| Tool | Sterk in | Wanneer kiezen |
|---|---|---|
| **[mermaid.live](https://mermaid.live)** | Snel exporteren naar PNG/SVG vanuit code | Wil je vandaag een plaatje voor in de bestuursvergadering — plak de code, exporteer, klaar. |
| **[Excalidraw](https://excalidraw.com)** | Hand-getekende, speelse stijl | Voor stakeholders die schrikken van "te tech" — voelt aan als een whiteboard. |
| **[Whimsical](https://whimsical.com)** of **[FigJam](https://figjam.com)** | Clean, professional, met sjablonen | Voor een definitieve versie in een pitch-deck of website. |
| **[draw.io](https://app.diagrams.net)** | Gratis, zonder account, veel symbolen | Als je iconen, screenshots en flow wilt mengen. |

**Aanbevolen voor jouw gebruik:** start met mermaid.live om beide diagrammen te zien renderen → exporteer als SVG → importeer in Figma/Keynote als basis. Voor de bestuursvergadering kun je daar wireframe-screenshots van de echte Mosqon-pagina's naast plakken (Leden-tabel, Donaties-tabel, Dashboard) zodat het diagram aansluit op wat ze straks in het echt gaan zien.
