"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  label: string;
};

/**
 * Compacte demo-knop binnen duimbereik op mobiel: verschijnt zodra de hero
 * uit beeld is en verdwijnt weer zodra de demo-sectie zelf in beeld komt.
 */
export function StickyDemoPill({ label }: Props) {
  const [heroGone, setHeroGone] = useState(false);
  const [demoInView, setDemoInView] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("top");
    const demo = document.getElementById("demo");
    if (!hero || !demo) return;

    const heroObserver = new IntersectionObserver(([entry]) =>
      setHeroGone(!entry.isIntersecting),
    );
    const demoObserver = new IntersectionObserver(([entry]) =>
      setDemoInView(entry.isIntersecting),
    );
    heroObserver.observe(hero);
    demoObserver.observe(demo);
    return () => {
      heroObserver.disconnect();
      demoObserver.disconnect();
    };
  }, []);

  const visible = heroGone && !demoInView;

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "fixed inset-x-0 bottom-4 z-40 flex justify-center lg:hidden",
        "transition-opacity duration-300 motion-reduce:transition-none",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <Button
        asChild
        size="lg"
        className="rounded-full px-8"
        style={{ boxShadow: "var(--shadow-lg)" }}
      >
        <a href="#demo" tabIndex={visible ? undefined : -1}>
          {label}
        </a>
      </Button>
    </div>
  );
}
