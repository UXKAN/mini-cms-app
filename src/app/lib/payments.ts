// Betaalstatus-logica voor toezeggingen en ANBI-akten. Vergelijkt altijd met
// het totaal van álle betalingen (eerdere + nieuwe), niet alleen de nieuwe —
// anders blijft een toezegging na een restbetaling eeuwig "Deels betaald".
// Cent-tolerantie tegen floating-point-afwijkingen.
const EPSILON = 0.005;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function remainingAmount(total: number, paidSoFar: number): number {
  return Math.max(0, round2(total - paidSoFar));
}

export function resolvePaymentStatus(
  total: number,
  paidSoFar: number,
  payment: number
): "paid" | "partial" {
  return paidSoFar + payment >= total - EPSILON ? "paid" : "partial";
}

export type MatchedDonationRow = {
  pledge_id: string | null;
  gift_agreement_id: string | null;
  amount: number | string | null;
};

// Sleutels: "pledge:<id>" / "gift_agreement:<id>". Een rij met beide ids telt
// bij de pledge. Incrementeel aanroepbaar per pagina.
export function addMatchedDonations(
  map: Map<string, number>,
  rows: MatchedDonationRow[]
): Map<string, number> {
  rows.forEach((d) => {
    const key = d.pledge_id
      ? `pledge:${d.pledge_id}`
      : d.gift_agreement_id
        ? `gift_agreement:${d.gift_agreement_id}`
        : null;
    if (!key) return;
    map.set(key, (map.get(key) ?? 0) + Number(d.amount));
  });
  return map;
}
