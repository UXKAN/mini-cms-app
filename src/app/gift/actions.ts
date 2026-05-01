"use server";

import { randomUUID } from "node:crypto";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { giftSchema, type GiftFormState } from "../lib/giftAgreement";
import { buildConfirmationEmail } from "../lib/giftAgreementEmail";

type SubmitResult =
  | {
      success: true;
      referenceCode: string;
      mailSent: boolean;
      mailWarning?: string;
    }
  | { success: false; error: string };

export async function submitGiftAgreement(
  formState: GiftFormState
): Promise<SubmitResult> {
  const parsed = giftSchema.safeParse(formState);
  if (!parsed.success) {
    return {
      success: false,
      error: "Niet alle velden zijn correct ingevuld.",
    };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return {
      success: false,
      error: "Server is niet correct geconfigureerd. Neem contact op.",
    };
  }

  const supabase = createClient(url, anonKey);
  const organizationId = process.env.GIFT_ORGANIZATION_ID || null;

  const data = parsed.data;
  const id = randomUUID();
  const referenceCode = id.substring(0, 6).toUpperCase();

  const { error } = await supabase
    .from("gift_agreements")
    .insert({
      id,
      organization_id: organizationId,
      type: data.type,
      schenker_naam: data.schenker_naam,
      schenker_geboortedatum: data.schenker_geboortedatum,
      schenker_telefoon: data.schenker_telefoon,
      schenker_adres: data.schenker_adres,
      schenker_postcode: data.schenker_postcode,
      schenker_woonplaats: data.schenker_woonplaats,
      schenker_land: data.schenker_land,
      schenker_email: data.schenker_email,
      bedrag_per_maand: data.bedrag_per_maand
        ? Number(data.bedrag_per_maand)
        : null,
      startdatum: data.startdatum || null,
      bedrag_eenmalig: data.bedrag_eenmalig
        ? Number(data.bedrag_eenmalig)
        : null,
      akkoord_overeenkomst: data.akkoord,
      akkoord_at: new Date().toISOString(),
      iban: data.iban,
      rekeninghouder: data.rekeninghouder,
      ondertekening_plaats: data.ondertekening_plaats,
      ondertekening_datum: data.ondertekening_datum,
      ondertekening_naam: data.ondertekening_naam,
      ondertekening_handtekening_png: data.handtekening_png,
    });

  if (error) {
    console.error("[gift] insert error", error);
    return {
      success: false,
      error:
        "Er ging iets mis bij het opslaan. Probeer het opnieuw of neem contact op.",
    };
  }

  const mailResult = await sendConfirmationEmail(data, referenceCode);

  return {
    success: true,
    referenceCode,
    mailSent: mailResult.sent,
    mailWarning: mailResult.warning,
  };
}

async function sendConfirmationEmail(
  data: ReturnType<typeof giftSchema.parse>,
  referenceCode: string
): Promise<{ sent: boolean; warning?: string }> {
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.GIFT_FROM_EMAIL;

  if (!resendKey || !fromEmail) {
    return {
      sent: false,
      warning:
        "De inzending is opgeslagen. De bevestigingsmail kon niet verzonden worden (server-configuratie). Bewaar uw referentienummer.",
    };
  }

  try {
    const resend = new Resend(resendKey);
    const { subject, html, text } = buildConfirmationEmail(
      data,
      referenceCode
    );

    const signatureBase64 = data.handtekening_png.replace(
      /^data:image\/\w+;base64,/,
      ""
    );

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: data.schenker_email,
      subject,
      html,
      text,
      attachments: [
        {
          filename: "handtekening.png",
          content: signatureBase64,
          contentId: "handtekening",
        },
      ],
    });

    if (error) {
      console.error("[gift] mail error", error);
      return {
        sent: false,
        warning:
          "De inzending is opgeslagen, maar de bevestigingsmail kon niet verstuurd worden. Bewaar uw referentienummer.",
      };
    }

    return { sent: true };
  } catch (err) {
    console.error("[gift] mail exception", err);
    return {
      sent: false,
      warning:
        "De inzending is opgeslagen, maar de bevestigingsmail kon niet verstuurd worden. Bewaar uw referentienummer.",
    };
  }
}
