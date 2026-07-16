"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  label: string;
  title: string;
  text: string;
  url: string;
};

/**
 * Deelt de pagina via de native share-sheet (mobiel: direct naar de
 * bestuurs-groepsapp). Zonder navigator.share opent een wa.me-deellink.
 */
export function ShareButton({ label, title, text, url }: Props) {
  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // Gebruiker sloot de share-sheet; geen fallback nodig.
      }
      return;
    }
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="rounded-full"
      onClick={handleShare}
    >
      <Share2 className="me-2 h-4 w-4" aria-hidden="true" />
      {label}
    </Button>
  );
}
