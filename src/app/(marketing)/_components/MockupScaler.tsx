"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  designWidth?: number;
  children: React.ReactNode;
  className?: string;
};

/**
 * Schaalt een mockup die op vaste ontwerpbreedte is gebouwd mee met zijn
 * container (transform: scale), met gecompenseerde hoogte. Vóór de eerste
 * meting (en zonder JavaScript) clipt overflow-hidden de ongeschaalde inhoud;
 * daarna wordt overflow vrijgegeven zodat schaduwen niet hard worden
 * afgesneden langs de containerranden.
 */
export function MockupScaler({ designWidth = 760, children, className }: Props) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [fitted, setFitted] = useState(false);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const update = () => {
      // Ook licht opschalen (>1) zodat de mockup zijn wrapper exact vult en
      // er geen witte reststrook naast het vaste ontwerp overblijft.
      const next = outer.clientWidth / designWidth;
      setScale(next);
      setHeight(inner.offsetHeight * next);
      setFitted(true);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(outer);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [designWidth]);

  return (
    <div
      ref={outerRef}
      className={cn(fitted ? "overflow-visible" : "overflow-hidden", className)}
      style={{ height }}
    >
      <div
        ref={innerRef}
        style={{
          width: designWidth,
          transform: scale === 1 ? undefined : `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}
