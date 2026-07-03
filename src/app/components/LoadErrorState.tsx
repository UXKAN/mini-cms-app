"use client";

import { Button } from "@/components/ui/button";

// Volledig-scherm foutstaat voor mislukte auth-/orgladingen. De link naar de
// inlogpagina is de uitweg bij een kapotte sessie waar retry niet helpt.
export function LoadErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="min-h-screen flex items-center justify-center p-10">
      <div className="max-w-md text-center flex flex-col items-center gap-3">
        <h1 className="font-serif text-2xl text-foreground">
          Er ging iets mis bij het laden
        </h1>
        <p className="text-sm text-muted-foreground">
          We konden je gegevens niet ophalen. Controleer je internetverbinding
          en probeer het opnieuw.
        </p>
        <div className="mt-2 flex items-center gap-3">
          <Button onClick={onRetry}>Opnieuw proberen</Button>
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
