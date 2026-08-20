"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Volledig-scherm foutstaat voor mislukte auth-/orgladingen. De link naar de
// inlogpagina is de uitweg bij een kapotte sessie waar retry niet helpt.
export function LoadErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="min-h-screen flex items-center justify-center p-10">
      <div className="max-w-md text-center flex flex-col items-center gap-3">
        <div
          className="mb-1 h-12 w-12 rounded-full grid place-items-center"
          style={{ background: "var(--error-light)", color: "var(--error)" }}
        >
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="text-[15px] font-bold text-foreground">
          Er ging iets mis bij het laden
        </h1>
        <p className="text-sm text-muted-foreground">
          We konden je gegevens niet ophalen. Controleer je internetverbinding
          en probeer het opnieuw.
        </p>
        <div className="mt-2 flex items-center gap-3">
          <Button variant="secondary" onClick={onRetry}>
            Opnieuw proberen
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              window.location.href = "/login";
            }}
          >
            Naar inlogpagina
          </Button>
        </div>
      </div>
    </main>
  );
}
