import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Algemene voorwaarden",
  robots: { index: false },
};

export default function VoorwaardenPage() {
  return (
    <article className="mx-auto max-w-2xl px-6 py-20">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-accent-dark">
        Juridisch
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Algemene voorwaarden
      </h1>
      {/* TODO(owner): definitieve algemene voorwaarden laten opstellen en deze
          placeholder vervangen. Daarna robots-noindex hierboven verwijderen. */}
      <div className="mt-8 space-y-4 leading-relaxed text-muted-foreground">
        <p>
          Deze pagina is een tijdelijke plaatshouder. De definitieve algemene
          voorwaarden van Mosqon worden hier gepubliceerd vóór de livegang.
        </p>
        <p>
          Daarin staan onder meer de licentievoorwaarden, betalingsafspraken,
          de maandelijkse opzegbaarheid en wat er met uw gegevens gebeurt als u
          stopt.
        </p>
        <p>
          Vragen? Mail naar{" "}
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
