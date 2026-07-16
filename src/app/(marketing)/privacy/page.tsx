import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacyverklaring",
  robots: { index: false },
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl px-6 py-20">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-accent-dark">
        Juridisch
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Privacyverklaring
      </h1>
      {/* TODO(owner): definitieve privacyverklaring laten opstellen (jurist of
          modelverklaring) en deze placeholder vervangen. Daarna robots-noindex
          hierboven verwijderen. */}
      <div className="mt-8 space-y-4 leading-relaxed text-muted-foreground">
        <p>
          Deze pagina is een tijdelijke plaatshouder. De definitieve
          privacyverklaring van Mosqon wordt hier gepubliceerd vóór de
          livegang.
        </p>
        <p>
          Daarin leest u onder meer welke gegevens Mosqon verwerkt, met welk
          doel, hoe lang ze bewaard blijven, en hoe u uw rechten onder de AVG
          uitoefent.
        </p>
        <p>
          Vragen over privacy? Mail naar{" "}
          <a
            className="mk-link rounded-sm font-medium text-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            href="mailto:demo@mosqon.com"
          >
            demo@mosqon.com
          </a>
          .
        </p>
      </div>
    </article>
  );
}
