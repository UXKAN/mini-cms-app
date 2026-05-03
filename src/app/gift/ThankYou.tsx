"use client";

import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { GiftScenario } from "./actions";

type Props = {
  referenceCode: string;
  email: string;
  scenario: GiftScenario;
  mailWarning?: string;
  onReset: () => void;
};

function scenarioContent(scenario: GiftScenario): {
  title: string;
  body: React.ReactNode;
} {
  switch (scenario) {
    case "eenmalige_paid":
      return {
        title: "Bedankt voor uw gift",
        body: (
          <>
            Uw eenmalige gift is geregistreerd <strong>én de ontvangst is
            bevestigd</strong>. Bewaar uw referentienummer voor uw administratie.
          </>
        ),
      };
    case "eenmalige_unpaid":
      return {
        title: "Overeenkomst geregistreerd",
        body: (
          <>
            Uw eenmalige gift-overeenkomst is geregistreerd. Wij verwachten uw
            bankoverschrijving binnenkort. Zodra het bedrag binnen is, registreren
            wij de ontvangst.
          </>
        ),
      };
    case "periodieke_lid":
      return {
        title: "Welkom als lid!",
        body: (
          <>
            Uw periodieke gift-overeenkomst is geregistreerd <strong>én u bent
            toegevoegd als lid</strong> van de moskee. Welkom!
          </>
        ),
      };
    case "periodieke_geen_lid":
      return {
        title: "Bedankt voor uw periodieke gift",
        body: (
          <>
            Uw periodieke gift-overeenkomst is geregistreerd. Uw maandelijkse
            bijdrage komt binnen via uw bankoverschrijving.
          </>
        ),
      };
  }
}

export function ThankYou({
  referenceCode,
  email,
  scenario,
  mailWarning,
  onReset,
}: Props) {
  const { title, body } = scenarioContent(scenario);

  return (
    <Card className="p-8 sm:p-10 text-center space-y-6">
      <div className="flex justify-center">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle2 className="h-9 w-9 text-primary" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="font-serif text-3xl text-foreground">{title}</h2>
        <p className="text-muted-foreground max-w-md mx-auto">{body}</p>
      </div>

      <div className="bg-muted/50 rounded-lg py-5 px-6 inline-block">
        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
          Referentienummer
        </div>
        <div className="font-mono text-2xl font-semibold text-foreground tracking-widest">
          #{referenceCode}
        </div>
      </div>

      {mailWarning ? (
        <div className="flex items-start gap-3 p-4 rounded-md border border-amber-300 bg-amber-50 text-amber-900 text-left max-w-md mx-auto">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm">{mailWarning}</p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          U ontvangt binnen enkele minuten een bevestigingsmail op{" "}
          <span className="font-medium text-foreground">{email}</span>.
        </p>
      )}

      <div className="pt-2">
        <Button type="button" variant="outline" onClick={onReset}>
          Nieuw formulier invullen
        </Button>
      </div>
    </Card>
  );
}
