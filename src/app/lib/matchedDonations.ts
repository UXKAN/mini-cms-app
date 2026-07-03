import { supabase } from "./supabase";
import { addMatchedDonations } from "./payments";

const PAGE_SIZE = 1000;

// Som van alle aan pledges/akten gekoppelde donaties, per gekoppelde rij.
// Gepagineerd: PostgREST geeft maximaal 1000 rijen per request terug, dus een
// enkele query zou bij grotere datasets stilletjes bedragen missen.
export async function fetchPaidByKey(
  orgId: string
): Promise<{ paidByKey: Map<string, number>; error: string | null }> {
  const paidByKey = new Map<string, number>();
  let from = 0;
  for (;;) {
    const { data, error } = await supabase
      .from("donations")
      .select("pledge_id, gift_agreement_id, amount")
      .eq("org_id", orgId)
      .or("pledge_id.not.is.null,gift_agreement_id.not.is.null")
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) return { paidByKey, error: error.message };
    addMatchedDonations(paidByKey, data ?? []);
    if (!data || data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return { paidByKey, error: null };
}
