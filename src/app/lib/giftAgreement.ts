import { z } from "zod";

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
    schenker_geboortedatum: z.string().min(1, "Geboortedatum is verplicht"),
    schenker_telefoon: z.string().min(6, "Vul een geldig telefoonnummer in"),
    schenker_adres: z.string().min(5, "Vul een geldig adres in"),
    schenker_postcode_woonplaats: z
      .string()
      .min(7, "Postcode en woonplaats verplicht"),
    schenker_land: z.enum(COUNTRIES),
    schenker_email: z.string().email("Vul een geldig e-mailadres in"),

    type: z.enum(["periodieke", "eenmalige"]),
    bedrag_per_maand: z.string().optional(),
    startdatum: z.string().optional(),
    bedrag_eenmalig: z.string().optional(),

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
    }
  });

export type GiftFormData = z.infer<typeof giftSchema>;

export function overeenkomstTekst(type: GiftType): string {
  if (type === "periodieke") {
    return "Ik verklaar hierbij dat ik een periodieke gift doe aan HDV Selimiye / HDV Anadolu ten behoeve van de Nieuwe Moskee Enschede. Ik verbind mij om dit bedrag gedurende minimaal vijf (5) jaar te schenken, in gelijke periodieke termijnen. Deze gift eindigt uiterlijk bij het overlijden van de schenker. Deze overeenkomst geldt als schriftelijke vastlegging van een periodieke gift zoals bedoeld voor ANBI-instellingen.";
  }
  return "Ik verklaar hierbij dat ik een eenmalige gift doe aan HDV Selimiye / HDV Anadolu ten behoeve van de Nieuwe Moskee Enschede. Deze overeenkomst dient als bevestiging van mijn donatie.";
}

export type GiftFormState = {
  schenker_naam: string;
  schenker_geboortedatum: string;
  schenker_telefoon: string;
  schenker_adres: string;
  schenker_postcode_woonplaats: string;
  schenker_land: (typeof COUNTRIES)[number];
  schenker_email: string;

  type: GiftType;
  bedrag_per_maand: string;
  startdatum: string;
  bedrag_eenmalig: string;

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
  schenker_postcode_woonplaats: "",
  schenker_land: "Nederland",
  schenker_email: "",

  type: "periodieke",
  bedrag_per_maand: "",
  startdatum: "",
  bedrag_eenmalig: "",

  akkoord: false,

  iban: "",
  rekeninghouder: "",

  ondertekening_plaats: "",
  ondertekening_datum: new Date().toISOString().split("T")[0],
  ondertekening_naam: "",
  handtekening_png: "",
};
