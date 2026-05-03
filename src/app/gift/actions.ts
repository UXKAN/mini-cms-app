"use server";

import { randomUUID } from "node:crypto";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { giftSchema, type GiftFormState } from "../lib/giftAgreement";
import { buildConfirmationEmail } from "../lib/giftAgreementEmail";

export type GiftScenario =
  | "eenmalige_paid"
  | "eenmalige_unpaid"
  | "periodieke_lid"
  | "periodieke_geen_lid";

type SubmitResult =
  | {
      success: true;
      referenceCode: string;
      scenario: GiftScenario;
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
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const organizationId = process.env.GIFT_ORGANIZATION_ID;

  if (!url || !serviceKey || !organizationId) {
    return {
      success: false,
      error: "Server is niet correct geconfigureerd. Neem contact op.",
    };
  }

  // Service-role client: bypassed RLS voor server-side admin-acties.
  // Input is door Zod gevalideerd, akkoord-veld is verplicht true.
  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const data = parsed.data;
  const id = randomUUID();
  const referenceCode = id.substring(0, 6).toUpperCase();

  const isEenmalige = data.type === "eenmalige";
  const isPaid = isEenmalige && data.payment_status === "paid";
  const wantsMember =
    data.type === "periodieke" && data.wants_membership === "yes";

  const scenario: GiftScenario = isEenmalige
    ? isPaid
      ? "eenmalige_paid"
      : "eenmalige_unpaid"
    : wantsMember
      ? "periodieke_lid"
      : "periodieke_geen_lid";

  // 1. Altijd: gift_agreement
  const { error: giftError } = await supabase.from("gift_agreements").insert({
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
    payment_method_intent: isEenmalige ? data.payment_method : null,
    payment_status: isEenmalige ? data.payment_status : null,
    paid_at: isPaid ? new Date().toISOString() : null,
    wants_membership:
      data.type === "periodieke" ? data.wants_membership === "yes" : null,
    agreement_status: "signed",
    akkoord_overeenkomst: data.akkoord,
    akkoord_at: new Date().toISOString(),
    iban: data.iban,
    rekeninghouder: data.rekeninghouder,
    ondertekening_plaats: data.ondertekening_plaats,
    ondertekening_datum: data.ondertekening_datum,
    ondertekening_naam: data.ondertekening_naam,
    ondertekening_handtekening_png: data.handtekening_png,
  });

  if (giftError) {
    console.error("[gift] insert gift_agreement error", giftError);
    return {
      success: false,
      error:
        "Er ging iets mis bij het opslaan. Probeer het opnieuw of neem contact op.",
    };
  }

  const sideWarnings: string[] = [];

  // 2. Eenmalige + voldaan -> donation
  if (isPaid && data.payment_method && data.bedrag_eenmalig) {
    const donatedAt =
      data.payment_date || new Date().toISOString().slice(0, 10);
    const { error: donationError } = await supabase.from("donations").insert({
      org_id: organizationId,
      member_id: null,
      amount: Number(data.bedrag_eenmalig),
      method: data.payment_method,
      donated_at: donatedAt,
      gift_agreement_id: id,
      signature_png:
        data.payment_method === "cash" ? data.handtekening_png : null,
      source: "gift_form",
      notes: `Via ANBI-formulier #${referenceCode}`,
    });
    if (donationError) {
      console.error("[gift] insert donation error", donationError);
      sideWarnings.push(
        "De inzending is opgeslagen, maar de bijbehorende donatie kon niet automatisch geregistreerd worden."
      );
    }
  }

  // 3. Periodieke + lid -> member + update gift_agreement.member_id
  if (wantsMember) {
    const { first, last } = splitName(data.schenker_naam);
    const { data: insertedMember, error: memberError } = await supabase
      .from("members")
      .insert({
        org_id: organizationId,
        first_name: first || null,
        last_name: last || null,
        name: data.schenker_naam,
        email: data.schenker_email,
        phone: data.schenker_telefoon,
        address: data.schenker_adres,
        postcode: data.schenker_postcode,
        city: data.schenker_woonplaats,
        iban: data.iban,
        status: "active",
        monthly_amount: null, // bedrag staat al in gift_agreement
        notes: `Aangemaakt via ANBI-formulier #${referenceCode}`,
      })
      .select("id")
      .single();

    if (memberError || !insertedMember) {
      console.error("[gift] insert member error", memberError);
      sideWarnings.push(
        "De inzending is opgeslagen, maar het lidmaatschap kon niet automatisch aangemaakt worden."
      );
    } else {
      const { error: updateError } = await supabase
        .from("gift_agreements")
        .update({ member_id: insertedMember.id })
        .eq("id", id);
      if (updateError) {
        console.error(
          "[gift] update gift_agreement.member_id error",
          updateError
        );
      }
    }
  }

  const mailResult = await sendConfirmationEmail(data, referenceCode, scenario);

  const combinedWarning =
    [...sideWarnings, mailResult.warning].filter(Boolean).join(" ") ||
    undefined;

  return {
    success: true,
    referenceCode,
    scenario,
    mailSent: mailResult.sent,
    mailWarning: combinedWarning,
  };
}

function splitName(fullName: string): { first: string; last: string } {
  const trimmed = fullName.trim();
  const idx = trimmed.indexOf(" ");
  if (idx === -1) return { first: trimmed, last: "" };
  return {
    first: trimmed.substring(0, idx),
    last: trimmed.substring(idx + 1).trim(),
  };
}

async function sendConfirmationEmail(
  data: ReturnType<typeof giftSchema.parse>,
  referenceCode: string,
  scenario: GiftScenario
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
      referenceCode,
      scenario
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
