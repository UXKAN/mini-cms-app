"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, AlertCircle, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { SignaturePad } from "@/components/SignaturePad";
import { OrgFooterCard } from "./_components/OrgFooterCard";
import { ThankYou } from "./ThankYou";
import { submitGiftAgreement } from "./actions";
import {
  COUNTRIES,
  emptyGiftFormState,
  giftSchema,
  overeenkomstTekst,
  type GiftFormState,
} from "../lib/giftAgreement";

type Errors = Partial<Record<keyof GiftFormState, string>>;

export function GiftForm() {
  const [form, setForm] = useState<GiftFormState>(emptyGiftFormState);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<{
    referenceCode: string;
    email: string;
    mailWarning?: string;
  } | null>(null);

  function update<K extends keyof GiftFormState>(
    field: K,
    value: GiftFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    const parsed = giftSchema.safeParse(form);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof GiftFormState;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      setSubmitting(false);
      const firstError = document.querySelector("[data-error='true']");
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const result = await submitGiftAgreement(form);

    if (!result.success) {
      setSubmitError(result.error);
      setSubmitting(false);
      return;
    }

    setSubmitted({
      referenceCode: result.referenceCode,
      email: form.schenker_email,
      mailWarning: result.mailWarning,
    });
    setSubmitting(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleReset() {
    setForm({
      ...emptyGiftFormState,
      ondertekening_datum: new Date().toISOString().split("T")[0],
    });
    setErrors({});
    setSubmitted(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (submitted) {
    return (
      <ThankYou
        referenceCode={submitted.referenceCode}
        email={submitted.email}
        mailWarning={submitted.mailWarning}
        onReset={handleReset}
      />
    );
  }

  const isPeriodiek = form.type === "periodieke";

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Hero */}
      <div className="space-y-3">
        <h1
          lang="nl"
          className="font-serif text-3xl sm:text-5xl leading-tight text-primary"
        >
          Schenkings&shy;overeenkomst
        </h1>
        <p className="text-muted-foreground max-w-xl">
          Dit formulier legt een bindende schenkingsovereenkomst vast. Na
          ondertekening ontvangt u een bevestiging per e-mail met uw
          referentienummer. Alle velden zijn verplicht.
        </p>
      </div>

      {/* Sectie 1 — Gegevens schenker */}
      <Card>
        <CardContent className="p-6 sm:p-8 space-y-6">
          <StepHeader n={1} title="Gegevens schenker" />

          <SubHeader>Je gegevens</SubHeader>

          <Field
            label="Voor- en achternaam"
            required
            error={errors.schenker_naam}
          >
            <Input
              autoComplete="name"
              value={form.schenker_naam}
              onChange={(e) => update("schenker_naam", e.target.value)}
              placeholder="Jan de Vries"
              data-error={!!errors.schenker_naam}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Geboortedatum"
              required
              error={errors.schenker_geboortedatum}
            >
              <DateInput
                autoComplete="bday"
                value={form.schenker_geboortedatum}
                onChange={(e) =>
                  update("schenker_geboortedatum", e.target.value)
                }
                data-error={!!errors.schenker_geboortedatum}
              />
            </Field>

            <Field
              label="Telefoonnummer"
              required
              error={errors.schenker_telefoon}
            >
              <Input
                autoComplete="tel"
                type="tel"
                value={form.schenker_telefoon}
                onChange={(e) => update("schenker_telefoon", e.target.value)}
                placeholder="+31 6 12345678"
                data-error={!!errors.schenker_telefoon}
              />
            </Field>
          </div>

          <SubHeader>Adresgegevens</SubHeader>

          <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-4">
            <Field label="Adres" required error={errors.schenker_adres}>
              <Input
                autoComplete="street-address"
                value={form.schenker_adres}
                onChange={(e) => update("schenker_adres", e.target.value)}
                placeholder="Straatnaam 12"
                data-error={!!errors.schenker_adres}
              />
            </Field>

            <Field
              label="Postcode"
              required
              error={errors.schenker_postcode}
            >
              <Input
                autoComplete="postal-code"
                value={form.schenker_postcode}
                onChange={(e) =>
                  update("schenker_postcode", e.target.value)
                }
                placeholder="1234 AB"
                data-error={!!errors.schenker_postcode}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Woonplaats"
              required
              error={errors.schenker_woonplaats}
            >
              <Input
                autoComplete="address-level2"
                value={form.schenker_woonplaats}
                onChange={(e) =>
                  update("schenker_woonplaats", e.target.value)
                }
                placeholder="Enschede"
                data-error={!!errors.schenker_woonplaats}
              />
            </Field>

            <Field label="Land" required error={errors.schenker_land}>
              <Input
                list="schenker-land-suggesties"
                autoComplete="country-name"
                value={form.schenker_land}
                onChange={(e) => update("schenker_land", e.target.value)}
                placeholder="Nederland"
                data-error={!!errors.schenker_land}
                className="[&::-webkit-calendar-picker-indicator]:hidden"
              />
              <datalist id="schenker-land-suggesties">
                {COUNTRIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
          </div>

          <Field label="E-mailadres" required error={errors.schenker_email}>
            <Input
              autoComplete="email"
              type="email"
              value={form.schenker_email}
              onChange={(e) => update("schenker_email", e.target.value)}
              placeholder="naam@voorbeeld.nl"
              data-error={!!errors.schenker_email}
            />
          </Field>
        </CardContent>
      </Card>

      {/* Sectie 2 — Type gift */}
      <Card>
        <CardContent className="p-6 sm:p-8 space-y-6">
          <StepHeader n={2} title="Type gift" />

          <div className="grid grid-cols-1 gap-3">
            <TypeOption
              selected={isPeriodiek}
              title="Periodieke gift"
              description="Min. 5 jaar — aftrekbaar voor de inkomstenbelasting"
              onClick={() => update("type", "periodieke")}
            />
            <TypeOption
              selected={!isPeriodiek}
              title="Eenmalige gift"
              description="Eenmalige bijdrage"
              onClick={() => update("type", "eenmalige")}
            />
          </div>

          {isPeriodiek ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Bedrag per maand (€)"
                required
                error={errors.bedrag_per_maand}
              >
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={form.bedrag_per_maand}
                  onChange={(e) => update("bedrag_per_maand", e.target.value)}
                  placeholder="25.00"
                  data-error={!!errors.bedrag_per_maand}
                />
              </Field>
              <Field
                label="Startdatum"
                required
                error={errors.startdatum}
              >
                <DateInput
                  value={form.startdatum}
                  onChange={(e) => update("startdatum", e.target.value)}
                  data-error={!!errors.startdatum}
                />
              </Field>
            </div>
          ) : (
            <Field
              label="Bedrag (€)"
              required
              error={errors.bedrag_eenmalig}
            >
              <Input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={form.bedrag_eenmalig}
                onChange={(e) => update("bedrag_eenmalig", e.target.value)}
                placeholder="100.00"
                data-error={!!errors.bedrag_eenmalig}
              />
            </Field>
          )}
        </CardContent>
      </Card>

      {/* Sectie 3 — Overeenkomsttekst + akkoord */}
      <Card>
        <CardContent className="p-6 sm:p-8 space-y-6">
          <StepHeader n={3} title="Overeenkomsttekst" />

          <blockquote className="border-l-2 border-primary pl-4 py-1 text-foreground/90 italic leading-relaxed">
            {overeenkomstTekst(form.type)}
          </blockquote>

          <label
            className={cn(
              "flex items-start gap-3 p-4 rounded-md border cursor-pointer transition",
              form.akkoord
                ? "border-primary bg-primary/5"
                : "border-input hover:border-primary/50",
              errors.akkoord && "border-destructive"
            )}
            data-error={!!errors.akkoord}
          >
            <input
              type="checkbox"
              checked={form.akkoord}
              onChange={(e) => update("akkoord", e.target.checked)}
              className="mt-1 h-4 w-4 accent-primary"
            />
            <span className="text-sm text-foreground">
              Ik ga akkoord met deze overeenkomst
            </span>
          </label>
          {errors.akkoord && (
            <p className="text-xs text-destructive -mt-3">{errors.akkoord}</p>
          )}
        </CardContent>
      </Card>

      {/* Sectie 4 — Betaalgegevens */}
      <Card>
        <CardContent className="p-6 sm:p-8 space-y-6">
          <StepHeader n={4} title="Betaalgegevens" />

          <Field label="IBAN" required error={errors.iban}>
            <Input
              value={form.iban}
              onChange={(e) =>
                update("iban", e.target.value.toUpperCase())
              }
              placeholder="NL91 ABNA 0417 1643 00"
              className="font-mono tracking-wide"
              data-error={!!errors.iban}
            />
          </Field>

          <Field
            label="Naam rekeninghouder"
            required
            error={errors.rekeninghouder}
          >
            <Input
              value={form.rekeninghouder}
              onChange={(e) => update("rekeninghouder", e.target.value)}
              placeholder="J. de Vries"
              data-error={!!errors.rekeninghouder}
            />
          </Field>
        </CardContent>
      </Card>

      {/* Sectie 5 — Digitale ondertekening */}
      <Card>
        <CardContent className="p-6 sm:p-8 space-y-6">
          <StepHeader n={5} title="Digitale ondertekening" />

          <p className="text-sm text-muted-foreground">
            Door hieronder te ondertekenen bevestigt u deze overeenkomst
            digitaal.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Plaats"
              required
              error={errors.ondertekening_plaats}
            >
              <Input
                value={form.ondertekening_plaats}
                onChange={(e) =>
                  update("ondertekening_plaats", e.target.value)
                }
                placeholder="Enschede"
                data-error={!!errors.ondertekening_plaats}
              />
            </Field>
            <Field
              label="Datum"
              required
              error={errors.ondertekening_datum}
            >
              <DateInput
                value={form.ondertekening_datum}
                onChange={(e) =>
                  update("ondertekening_datum", e.target.value)
                }
                data-error={!!errors.ondertekening_datum}
              />
            </Field>
          </div>

          <Field
            label="Volledige naam"
            required
            error={errors.ondertekening_naam}
          >
            <Input
              value={form.ondertekening_naam}
              onChange={(e) =>
                update("ondertekening_naam", e.target.value)
              }
              placeholder="Jan de Vries"
              data-error={!!errors.ondertekening_naam}
            />
          </Field>

          <Field
            label="Handtekening"
            required
            error={errors.handtekening_png}
          >
            <SignaturePad
              onChange={(data) => update("handtekening_png", data)}
              hasError={!!errors.handtekening_png}
            />
          </Field>
        </CardContent>
      </Card>

      <OrgFooterCard />

      <div className="space-y-3">
        {submitError && (
          <div className="flex items-start gap-3 p-4 rounded-md border border-destructive/30 bg-destructive/5 text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-sm">{submitError}</p>
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="w-full h-14 text-base"
        >
          {submitting ? (
            "Bezig met indienen…"
          ) : (
            <>
              Overeenkomst ondertekenen en indienen
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Na het indienen ontvangt u een bevestiging per e-mail.
        </p>
      </div>
    </form>
  );
}

function StepHeader({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
        {n}
      </div>
      <h2 className="font-serif text-2xl text-foreground">{title}</h2>
    </div>
  );
}

function SubHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2">
      {children}
    </h3>
  );
}

function DateInput(props: React.ComponentProps<typeof Input>) {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
  }, []);

  if (isIOS) {
    return (
      <Input
        type="date"
        {...props}
        className={cn("block w-full min-w-0", props.className)}
      />
    );
  }

  return (
    <div className="relative w-full">
      <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="date"
        {...props}
        className={cn(
          "block w-full min-w-0 pl-10",
          "[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0",
          props.className
        )}
      />
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      {children}
      {error && (
        <p className="text-xs text-destructive mt-1" data-error="true">
          {error}
        </p>
      )}
    </div>
  );
}

function TypeOption({
  selected,
  title,
  description,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "p-4 rounded-lg border-2 text-left transition",
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 bg-background"
      )}
    >
      <div className="font-medium text-foreground">{title}</div>
      <div className="text-xs text-muted-foreground mt-1">{description}</div>
    </button>
  );
}
