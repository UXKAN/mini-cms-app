import type { GiftFormData } from "./giftAgreement";

const PRIMARY = "#1a8c6e";
const BG = "#f7f4ef";
const INK = "#221F18";
const MUTED = "#6b6962";
const BORDER = "#dcd6cc";

function fmtBedrag(n: number | string): string {
  const v = typeof n === "string" ? Number(n) : n;
  if (Number.isNaN(v)) return "—";
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(v);
}

function fmtDatum(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("nl-NL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:8px 0;color:${MUTED};font-size:14px;width:45%;vertical-align:top;">${label}</td>
      <td style="padding:8px 0;color:${INK};font-size:14px;font-weight:500;">${value}</td>
    </tr>
  `;
}

export function buildConfirmationEmail(
  data: GiftFormData,
  referenceCode: string
): { subject: string; html: string; text: string } {
  const isPeriodiek = data.type === "periodieke";
  const subject = `Bevestiging gift-overeenkomst — referentie #${referenceCode}`;

  const bedragRegel = isPeriodiek
    ? row("Bedrag per maand", fmtBedrag(data.bedrag_per_maand!)) +
      row("Startdatum", fmtDatum(data.startdatum!))
    : row("Bedrag", fmtBedrag(data.bedrag_eenmalig!));

  const html = `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="utf-8">
<title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${INK};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;border:1px solid ${BORDER};overflow:hidden;">
          <tr>
            <td style="padding:32px 32px 0 32px;">
              <div style="font-size:14px;color:${MUTED};letter-spacing:0.05em;text-transform:uppercase;margin-bottom:8px;">
                Nieuwe Moskee Enschede
              </div>
              <h1 style="margin:0;font-size:28px;line-height:1.2;color:${INK};font-weight:600;">
                Bedankt voor uw gift
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px 0 32px;">
              <p style="margin:0;font-size:16px;line-height:1.5;color:${INK};">
                Beste ${escapeHtml(data.schenker_naam)},
              </p>
              <p style="margin:12px 0 0 0;font-size:16px;line-height:1.5;color:${INK};">
                Uw ${isPeriodiek ? "periodieke" : "eenmalige"} gift-overeenkomst voor HDV Selimiye / HDV Anadolu
                ten behoeve van de Nieuwe Moskee Enschede is geregistreerd.
                Bewaar deze e-mail als bevestiging.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px 0 32px;">
              <div style="background:${BG};border-radius:8px;padding:20px;text-align:center;">
                <div style="font-size:12px;color:${MUTED};text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">
                  Referentienummer
                </div>
                <div style="font-family:'SF Mono',Menlo,Consolas,monospace;font-size:24px;font-weight:600;color:${INK};letter-spacing:0.15em;">
                  #${referenceCode}
                </div>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 32px 0 32px;">
              <h2 style="margin:0 0 12px 0;font-size:14px;color:${MUTED};text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">
                Samenvatting
              </h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${row("Type gift", isPeriodiek ? "Periodieke gift (min. 5 jaar)" : "Eenmalige gift")}
                ${bedragRegel}
                ${row("Naam", escapeHtml(data.schenker_naam))}
                ${row("Adres", escapeHtml(data.schenker_adres))}
                ${row("Postcode/woonplaats", escapeHtml(data.schenker_postcode_woonplaats))}
                ${row("Land", escapeHtml(data.schenker_land))}
                ${row("E-mail", escapeHtml(data.schenker_email))}
                ${row("Telefoon", escapeHtml(data.schenker_telefoon))}
                ${row("IBAN", escapeHtml(data.iban))}
                ${row("Naam rekeninghouder", escapeHtml(data.rekeninghouder))}
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px 0 32px;">
              <h2 style="margin:0 0 12px 0;font-size:14px;color:${MUTED};text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">
                Ondertekening
              </h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${row("Plaats", escapeHtml(data.ondertekening_plaats))}
                ${row("Datum", fmtDatum(data.ondertekening_datum))}
                ${row("Naam", escapeHtml(data.ondertekening_naam))}
              </table>
              <div style="margin-top:16px;border:1px solid ${BORDER};border-radius:8px;background:#ffffff;padding:12px;">
                <div style="font-size:12px;color:${MUTED};text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">
                  Handtekening
                </div>
                <img src="cid:handtekening" alt="Handtekening van ${escapeHtml(data.ondertekening_naam)}" style="display:block;max-width:100%;height:auto;max-height:160px;" />
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 32px 0 32px;">
              <div style="border-top:1px solid ${BORDER};padding-top:20px;font-size:13px;color:${MUTED};line-height:1.5;">
                Voor vragen over deze overeenkomst kunt u contact opnemen met de penningmeester
                via <a href="mailto:financien@enschedecamii.nl" style="color:${PRIMARY};text-decoration:none;">financien@enschedecamii.nl</a>.
                <br><br>
                <strong style="color:${INK};">HDV Selimiye / HDV Anadolu</strong>
                &nbsp;·&nbsp; RSIN: 805141200
                <br>
                IBAN: NL33 ABNA 0550 1441 96
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:32px;"></td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    `Bedankt voor uw gift`,
    ``,
    `Beste ${data.schenker_naam},`,
    ``,
    `Uw ${isPeriodiek ? "periodieke" : "eenmalige"} gift-overeenkomst voor HDV Selimiye / HDV Anadolu ten behoeve van de Nieuwe Moskee Enschede is geregistreerd. Bewaar deze e-mail als bevestiging.`,
    ``,
    `Referentienummer: #${referenceCode}`,
    ``,
    `--- Samenvatting ---`,
    `Type gift: ${isPeriodiek ? "Periodieke gift (min. 5 jaar)" : "Eenmalige gift"}`,
    isPeriodiek
      ? `Bedrag per maand: ${fmtBedrag(data.bedrag_per_maand!)}\nStartdatum: ${fmtDatum(data.startdatum!)}`
      : `Bedrag: ${fmtBedrag(data.bedrag_eenmalig!)}`,
    `Naam: ${data.schenker_naam}`,
    `Adres: ${data.schenker_adres}`,
    `Postcode/woonplaats: ${data.schenker_postcode_woonplaats}`,
    `Land: ${data.schenker_land}`,
    `E-mail: ${data.schenker_email}`,
    `Telefoon: ${data.schenker_telefoon}`,
    `IBAN: ${data.iban}`,
    `Naam rekeninghouder: ${data.rekeninghouder}`,
    ``,
    `--- Ondertekening ---`,
    `Plaats: ${data.ondertekening_plaats}`,
    `Datum: ${fmtDatum(data.ondertekening_datum)}`,
    `Naam: ${data.ondertekening_naam}`,
    ``,
    `Voor vragen: financien@enschedecamii.nl`,
    ``,
    `(De handtekening is als bijlage 'handtekening.png' meegestuurd.)`,
    ``,
    `HDV Selimiye / HDV Anadolu`,
    `RSIN: 805141200`,
    `IBAN: NL33 ABNA 0550 1441 96`,
  ].join("\n");

  return { subject, html, text };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
