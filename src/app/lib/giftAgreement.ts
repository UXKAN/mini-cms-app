import { z } from "zod";

/** ISO `YYYY-MM-DD` matcher die ook reëel-bestaande kalenderdagen verifieert
 *  (zodat bv. `2020-02-31` wordt afgewezen ondanks geldig pattern). */
function isRealCalendarDate(iso: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12) return false;
  if (d < 1 || d > 31) return false;
  const date = new Date(iso);
  return (
    date.getFullYear() === y &&
    date.getMonth() + 1 === mo &&
    date.getDate() === d
  );
}

function isInFuture(iso: string): boolean {
  return new Date(iso) > new Date();
}

export const COUNTRIES = [
  "Nederland",
  "België",
  "Duitsland",
  "Turkije",
  "Marokko",
  "Anders",
] as const;

export type GiftType = "periodieke" | "eenmalige";

export const giftSchema = z
  .object({
    schenker_naam: z.string().min(2, "Vul uw volledige naam in"),
    schenker_geboortedatum: z
      .string()
      .min(1, "Geboortedatum is verplicht")
      .refine(
        (s) => /^\d{4}-\d{2}-\d{2}$/.test(s),
        "Vul de datum in als dd/mm/jjjj"
      )
      .refine(isRealCalendarDate, "Deze datum bestaat niet")
      .refine((s) => !isInFuture(s), "Geboortedatum kan niet in de toekomst liggen")
      .refine((s) => Number(s.slice(0, 4)) >= 1900, "Vul een geldige geboortedatum in"),
    schenker_telefoon: z.string().min(6, "Vul een geldig telefoonnummer in"),
    schenker_adres: z.string().min(5, "Vul een geldig adres in"),
    schenker_postcode: z.string().min(4, "Vul een geldige postcode in"),
    schenker_woonplaats: z.string().min(2, "Vul de woonplaats in"),
    schenker_land: z.string().min(2, "Vul het land in"),
    schenker_email: z
      .string()
      .trim()
      .email("Vul een geldig e-mailadres in"),

    type: z.enum(["periodieke", "eenmalige"]),
    bedrag_per_maand: z.string().optional(),
    startdatum: z.string().optional(),
    bedrag_eenmalig: z.string().optional(),

    payment_method: z.string().optional(),
    payment_status: z.string().optional(),
    payment_date: z.string().optional(),

    wants_membership: z.string().optional(),

    akkoord: z.literal(true, {
      message: "U moet akkoord gaan met de overeenkomst",
    }),

    iban: z
      .string()
      .min(15, "Vul een geldig IBAN in")
      .max(34, "IBAN te lang"),
    rekeninghouder: z.string().min(2, "Vul de naam van de rekeninghouder in"),

    ondertekening_plaats: z.string().min(2, "Vul de plaats in"),
    ondertekening_datum: z.string().min(1, "Datum is verplicht"),
    ondertekening_naam: z.string().min(2, "Vul uw volledige naam in"),
    handtekening_png: z.string().min(50, "Handtekening is verplicht"),
  })
  .superRefine((data, ctx) => {
    if (data.type === "periodieke") {
      if (
        !data.bedrag_per_maand ||
        Number(data.bedrag_per_maand) <= 0 ||
        Number.isNaN(Number(data.bedrag_per_maand))
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["bedrag_per_maand"],
          message: "Bedrag per maand verplicht",
        });
      }
      if (!data.startdatum) {
        ctx.addIssue({
          code: "custom",
          path: ["startdatum"],
          message: "Startdatum verplicht",
        });
      }
      if (data.wants_membership !== "yes" && data.wants_membership !== "no") {
        ctx.addIssue({
          code: "custom",
          path: ["wants_membership"],
          message: "Geef aan of u ook lid wilt worden",
        });
      }
    } else {
      if (
        !data.bedrag_eenmalig ||
        Number(data.bedrag_eenmalig) <= 0 ||
        Number.isNaN(Number(data.bedrag_eenmalig))
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["bedrag_eenmalig"],
          message: "Bedrag verplicht",
        });
      }
      if (data.payment_method !== "cash" && data.payment_method !== "bank") {
        ctx.addIssue({
          code: "custom",
          path: ["payment_method"],
          message: "Kies een betaalmethode",
        });
      }
      if (
        data.payment_status !== "paid" &&
        data.payment_status !== "unpaid"
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["payment_status"],
          message: "Geef aan of het bedrag al is voldaan",
        });
      }
      if (data.payment_status === "paid" && !data.payment_date) {
        ctx.addIssue({
          code: "custom",
          path: ["payment_date"],
          message: "Vul de betaaldatum in",
        });
      }
    }
  });

export type GiftFormData = z.infer<typeof giftSchema>;

export function overeenkomstTekst(type: GiftType): string {
  if (type === "periodieke") {
    return "Ik verklaar hierbij dat ik een periodieke gift doe aan HDV Selimiye / HDV Anadolu ten behoeve van de Nieuwe Moskee Enschede. Ik verbind mij om dit bedrag gedurende minimaal vijf (5) jaar te schenken, in gelijke periodieke termijnen. Deze gift eindigt uiterlijk bij het overlijden van de schenker. Deze overeenkomst geldt als schriftelijke vastlegging van een periodieke gift zoals bedoeld voor ANBI-instellingen.";
  }
  return "Ik verklaar hierbij dat ik een eenmalige gift doe aan HDV Selimiye / HDV Anadolu ten behoeve van de Nieuwe Moskee Enschede. Deze overeenkomst dient als bevestiging van mijn donatie.";
}

export type PaymentMethodChoice = "" | "cash" | "bank";
export type PaymentStatusChoice = "" | "paid" | "unpaid";
export type WantsMembershipChoice = "" | "yes" | "no";

export type GiftFormState = {
  schenker_naam: string;
  schenker_geboortedatum: string;
  schenker_telefoon: string;
  schenker_adres: string;
  schenker_postcode: string;
  schenker_woonplaats: string;
  schenker_land: string;
  schenker_email: string;

  type: GiftType;
  bedrag_per_maand: string;
  startdatum: string;
  bedrag_eenmalig: string;

  payment_method: PaymentMethodChoice;
  payment_status: PaymentStatusChoice;
  payment_date: string;

  wants_membership: WantsMembershipChoice;

  akkoord: boolean;

  iban: string;
  rekeninghouder: string;

  ondertekening_plaats: string;
  ondertekening_datum: string;
  ondertekening_naam: string;
  handtekening_png: string;
};

export const emptyGiftFormState: GiftFormState = {
  schenker_naam: "",
  schenker_geboortedatum: "",
  schenker_telefoon: "",
  schenker_adres: "",
  schenker_postcode: "",
  schenker_woonplaats: "",
  schenker_land: "Nederland",
  schenker_email: "",

  type: "periodieke",
  bedrag_per_maand: "",
  startdatum: "",
  bedrag_eenmalig: "",

  payment_method: "",
  payment_status: "",
  payment_date: "",

  wants_membership: "",

  akkoord: false,

  iban: "",
  rekeninghouder: "",

  ondertekening_plaats: "",
  ondertekening_datum: new Date().toISOString().split("T")[0],
  ondertekening_naam: "",
  handtekening_png: "",
};
