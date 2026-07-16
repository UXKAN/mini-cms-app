"use client";

import { useEffect } from "react";

// Hoogte van de zwevende sticky-nav plus wat lucht; gelijk aan de scroll-mt-28
// (7rem) die de secties zelf gebruiken, zodat het doel er net onder landt.
const NAV_OFFSET = 112;
// Zo lang blijven bijsturen na het laden; genoeg voor fonts, afbeeldingen en
// de meeschalende mockups om uitgelijnd te raken.
const SETTLE_MS = 1800;

/**
 * Springt bij het laden naar het element uit de URL-hash. Robuust tegen
 * layoutverschuivingen: afbeeldingen, fonts en de meeschalende mockups
 * veranderen de paginahoogte ná de eerste render. We berekenen de doelpositie
 * zelf (scrollIntoView overschiet bij secties met scroll-margin) en houden hem
 * elke frame op zijn plek tot de layout is uitgewerkt, of tot de bezoeker zelf
 * scrolt.
 */
export function HashScroll() {
  useEffect(() => {
    const { hash } = window.location;
    if (!hash || hash === "#") return;

    const id = decodeURIComponent(hash.slice(1));
    const target = document.getElementById(id);
    if (!target) return;

    let raf = 0;
    let stopped = false;
    const startedAt = performance.now();

    const stop = () => {
      stopped = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchmove", stop);
      window.removeEventListener("keydown", stop);
    };

    const tick = () => {
      if (stopped) return;
      const rectTop = target.getBoundingClientRect().top;
      const y = Math.max(0, Math.round(rectTop + window.scrollY - NAV_OFFSET));
      // Alleen echt bijsturen als het meer dan een pixel scheelt; eenmaal
      // uitgelijnd is dit een no-op en merkt de bezoeker er niets van.
      if (Math.abs(rectTop - NAV_OFFSET) > 1) {
        window.scrollTo({ top: y, behavior: "instant" });
      }
      if (performance.now() - startedAt > SETTLE_MS) {
        stop();
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    // De bezoeker heeft voorrang: eigen scroll stopt het corrigeren meteen.
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchmove", stop, { passive: true });
    window.addEventListener("keydown", stop);

    raf = requestAnimationFrame(tick);
    return stop;
  }, []);

  return null;
}
