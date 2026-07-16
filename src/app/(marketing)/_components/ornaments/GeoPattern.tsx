type Props = {
  id: string;
  className?: string;
  /** Fade binnen de SVG zelf: goedkoper dan een CSS-masker op de hele laag. */
  fade?: "bottom" | "top";
};

/**
 * Achtpuntige-ster tegelpatroon (khatam) als subtiel achtergrond-ornament.
 * Puur decoratief: aria-hidden, kleur via currentColor zodat de wrapper de
 * tint bepaalt (bijv. text-primary met lage opacity).
 */
export function GeoPattern({ id, className, fade }: Props) {
  const patternId = `geo-pattern-${id}`;
  return (
    <svg
      aria-hidden="true"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
    >
      <defs>
        <pattern
          id={patternId}
          width="72"
          height="72"
          patternUnits="userSpaceOnUse"
        >
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            transform="translate(36 36)"
          >
            <rect x="-15" y="-15" width="30" height="30" />
            <rect x="-15" y="-15" width="30" height="30" transform="rotate(45)" />
            <circle r="3.5" />
          </g>
          <g fill="none" stroke="currentColor" strokeWidth="0.75">
            <path d="M0 36h13M59 36h13M36 0v13M36 59v13" />
          </g>
        </pattern>
        {fade && (
          <>
            <linearGradient
              id={`${patternId}-fade`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0"
                stopColor="#fff"
                stopOpacity={fade === "bottom" ? 1 : 0}
              />
              <stop
                offset="1"
                stopColor="#fff"
                stopOpacity={fade === "bottom" ? 0 : 1}
              />
            </linearGradient>
            <mask id={`${patternId}-mask`}>
              <rect
                width="100%"
                height="100%"
                fill={`url(#${patternId}-fade)`}
              />
            </mask>
          </>
        )}
      </defs>
      <rect
        width="100%"
        height="100%"
        fill={`url(#${patternId})`}
        mask={fade ? `url(#${patternId}-mask)` : undefined}
      />
    </svg>
  );
}
