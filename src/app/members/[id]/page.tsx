"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";
import { supabase } from "../../lib/supabase";
import AppShell from "../../components/AppShell";
import { useOrg } from "../../lib/orgContext";
import type {
  Member,
  MemberStatus,
  Donation,
  GiftAgreement,
  GiftAgreementStatus,
  GiftAgreementPaymentStatus,
} from "../../lib/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatCard } from "@/components/table/StatCard";
import { fmtEuro, fmtDate, displayName, initials } from "../../lib/formatters";

const PANEL = "rounded-lg bg-card p-5 shadow-[var(--shadow)]";
const PANEL_LABEL =
  "text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground";
const COL_HEAD =
  "text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground first:pl-0 last:pr-0";
const CELL = "px-4 py-3.5 first:pl-0 last:pr-0";
const PILL =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold";

const TONE_ACCENT = "bg-[var(--accent-light)] text-primary";
const TONE_ZONE = "bg-[var(--surface-zone)] text-muted-foreground";
const TONE_WARN = "bg-[var(--warn-light)] text-[var(--warn)]";

const STATUS_PILL: Record<MemberStatus, { label: string; tone: string }> = {
  active: { label: "Actief", tone: TONE_ACCENT },
  inactive: { label: "Inactief", tone: TONE_ZONE },
  prospect: { label: "Prospect", tone: TONE_WARN },
  cancelled: {
    label: "Opgezegd",
    tone: "bg-[var(--error-light)] text-destructive",
  },
};

const AGREEMENT_STATUS_PILL: Record<
  GiftAgreementStatus,
  { label: string; tone: string }
> = {
  signed: { label: "Getekend", tone: TONE_ACCENT },
  completed: { label: "Afgerond", tone: TONE_ACCENT },
  lapsed: { label: "Vervallen", tone: TONE_ZONE },
  withdrawn: { label: "Ingetrokken", tone: TONE_ZONE },
};

const PAYMENT_STATUS_PILL: Record<
  GiftAgreementPaymentStatus,
  { label: string; tone: string }
> = {
  paid: { label: "Voldaan", tone: TONE_ACCENT },
  partial: { label: "Deels betaald", tone: TONE_WARN },
  unpaid: { label: "Open", tone: TONE_WARN },
};

const METHOD_LABELS: Record<string, string> = {
  cash: "Contant",
  bank: "Bank",
  online: "Online",
  other: "Overig",
};

function Pill({ label, tone }: { label: string; tone: string }) {
  return <span className={`${PILL} ${tone}`}>{label}</span>;
}

export default function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <AppShell>
      <MemberDetailInner params={params} />
    </AppShell>
  );
}

function MemberDetailInner({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const org = useOrg();

  const [member, setMember] = useState<Member | null>(null);
  const [periodieke, setPeriodieke] = useState<GiftAgreement[]>([]);
  const [eenmalige, setEenmalige] = useState<GiftAgreement[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const [mRes, periodiekRes, eenmaligRes, donRes] = await Promise.all([
        supabase
          .from("members")
          .select("*")
          .eq("id", id)
          .eq("org_id", org.id)
          .maybeSingle(),
        supabase
          .from("gift_agreements")
          .select("*")
          .eq("organization_id", org.id)
          .eq("member_id", id)
          .eq("type", "periodieke")
          .order("akkoord_at", { ascending: false }),
        supabase
          .from("gift_agreements")
          .select("*")
          .eq("organization_id", org.id)
          .eq("member_id", id)
          .eq("type", "eenmalige")
          .order("akkoord_at", { ascending: false }),
        supabase
          .from("donations")
          .select("*")
          .eq("org_id", org.id)
          .eq("member_id", id)
          .order("donated_at", { ascending: false }),
      ]);

      if (!active) return;

      if (mRes.error) setError(mRes.error.message);
      else if (!mRes.data) setError("Lid niet gevonden");
      else setMember(mRes.data as Member);

      setPeriodieke((periodiekRes.data ?? []) as GiftAgreement[]);
      setEenmalige((eenmaligRes.data ?? []) as GiftAgreement[]);
      setDonations((donRes.data ?? []) as Donation[]);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [id, org.id]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Laden…</p>;
  }
  if (error || !member) {
    return (
      <div className={`${PANEL} text-center`}>
        <p className="mb-4 text-sm text-destructive">
          {error ?? "Lid niet gevonden"}
        </p>
        <Link href="/members">
          <Button variant="outline">← Terug naar leden</Button>
        </Link>
      </div>
    );
  }

  const totalDonated = donations.reduce((s, d) => s + Number(d.amount), 0);
  const monthlyExpected = periodieke
    .filter((p) => p.agreement_status === "signed")
    .reduce((s, p) => s + Number(p.bedrag_per_maand ?? 0), 0);

  const typeLabel =
    member.membership_type === "lid"
      ? "Lid"
      : member.membership_type === "donateur"
        ? "Donateur"
        : member.membership_type;

  return (
    <>
      <div className="mb-6">
        <Link
          href="/members"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Terug naar leden
        </Link>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-4">
        <span
          aria-hidden="true"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--accent-light)] text-sm font-bold text-primary"
        >
          {initials(member)}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-[-0.02em] text-foreground">
              {displayName(member)}
            </h1>
            <Pill {...STATUS_PILL[member.status]} />
            {typeLabel && <Pill label={typeLabel} tone={TONE_ZONE} />}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Sinds {fmtDate(member.created_at)}
          </p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          featured
          label="Totaal ontvangen"
          value={fmtEuro(totalDonated)}
        />
        <StatCard label="Aantal donaties" value={String(donations.length)} />
        <StatCard
          label="Verwacht per maand"
          value={fmtEuro(monthlyExpected)}
        />
      </div>

      <div className={`${PANEL} mb-4`}>
        <p className={PANEL_LABEL}>Contactgegevens</p>
        <div className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <div className="text-xs text-muted-foreground">E-mail</div>
            <div className="mt-0.5 text-foreground">{member.email ?? "—"}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Telefoon</div>
            <div className="mt-0.5 text-foreground">{member.phone ?? "—"}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Adres</div>
            <div className="mt-0.5 text-foreground">
              {member.address ?? "—"}
              {member.postcode && member.city
                ? `, ${member.postcode} ${member.city}`
                : ""}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">IBAN</div>
            <div className="mt-0.5 text-foreground">{member.iban ?? "—"}</div>
          </div>
        </div>
      </div>

      {periodieke.length > 0 && (
        <div className={`${PANEL} mb-4`}>
          <p className={PANEL_LABEL}>
            Periodieke gift-akten ({periodieke.length})
          </p>
          <div className="mt-2">
            <Table aria-label="Periodieke gift-akten">
              <TableHeader>
                <TableRow>
                  <TableHead className={COL_HEAD}>
                    Datum ondertekening
                  </TableHead>
                  <TableHead className={`${COL_HEAD} text-right`}>
                    Bedrag/maand
                  </TableHead>
                  <TableHead className={`${COL_HEAD} hidden sm:table-cell`}>
                    Startdatum
                  </TableHead>
                  <TableHead className={COL_HEAD}>Status</TableHead>
                  <TableHead className={`${COL_HEAD} hidden md:table-cell`}>
                    Omschrijving
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periodieke.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className={`${CELL} text-sm`}>
                      {fmtDate(p.akkoord_at)}
                    </TableCell>
                    <TableCell className={`${CELL} text-right font-semibold`}>
                      {p.bedrag_per_maand
                        ? fmtEuro(Number(p.bedrag_per_maand))
                        : "—"}
                    </TableCell>
                    <TableCell
                      className={`${CELL} hidden text-sm sm:table-cell`}
                    >
                      {fmtDate(p.startdatum)}
                    </TableCell>
                    <TableCell className={CELL}>
                      <Pill
                        {...(AGREEMENT_STATUS_PILL[p.agreement_status] ?? {
                          label: p.agreement_status,
                          tone: TONE_ZONE,
                        })}
                      />
                    </TableCell>
                    <TableCell
                      className={`${CELL} hidden text-sm text-muted-foreground md:table-cell`}
                    >
                      {p.purpose ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {eenmalige.length > 0 && (
        <div className={`${PANEL} mb-4`}>
          <p className={PANEL_LABEL}>
            Eenmalige gift-akten ({eenmalige.length})
          </p>
          <div className="mt-2">
            <Table aria-label="Eenmalige gift-akten">
              <TableHeader>
                <TableRow>
                  <TableHead className={COL_HEAD}>Datum</TableHead>
                  <TableHead className={`${COL_HEAD} text-right`}>
                    Bedrag
                  </TableHead>
                  <TableHead className={`${COL_HEAD} hidden sm:table-cell`}>
                    Methode
                  </TableHead>
                  <TableHead className={COL_HEAD}>Betaalstatus</TableHead>
                  <TableHead className={`${COL_HEAD} hidden md:table-cell`}>
                    Omschrijving
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eenmalige.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className={`${CELL} text-sm`}>
                      {fmtDate(e.akkoord_at)}
                    </TableCell>
                    <TableCell className={`${CELL} text-right font-semibold`}>
                      {e.bedrag_eenmalig
                        ? fmtEuro(Number(e.bedrag_eenmalig))
                        : "—"}
                    </TableCell>
                    <TableCell
                      className={`${CELL} hidden text-sm sm:table-cell`}
                    >
                      {e.payment_method_intent
                        ? METHOD_LABELS[e.payment_method_intent] ??
                          e.payment_method_intent
                        : "—"}
                    </TableCell>
                    <TableCell className={CELL}>
                      {e.payment_status ? (
                        <Pill
                          {...(PAYMENT_STATUS_PILL[e.payment_status] ?? {
                            label: e.payment_status,
                            tone: TONE_ZONE,
                          })}
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell
                      className={`${CELL} hidden text-sm text-muted-foreground md:table-cell`}
                    >
                      {e.purpose ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <div className={PANEL}>
        <p className={PANEL_LABEL}>Donatie-historie ({donations.length})</p>
        {donations.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">
            Nog geen donaties geregistreerd voor deze persoon.
          </p>
        ) : (
          <div className="mt-2">
            <Table aria-label="Donatiehistorie">
              <TableHeader>
                <TableRow>
                  <TableHead className={COL_HEAD}>Datum</TableHead>
                  <TableHead className={`${COL_HEAD} text-right`}>
                    Bedrag
                  </TableHead>
                  <TableHead className={`${COL_HEAD} hidden sm:table-cell`}>
                    Methode
                  </TableHead>
                  <TableHead className={`${COL_HEAD} hidden md:table-cell`}>
                    Omschrijving
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className={`${CELL} text-sm`}>
                      {fmtDate(d.donated_at)}
                    </TableCell>
                    <TableCell className={`${CELL} text-right font-semibold`}>
                      {fmtEuro(Number(d.amount))}
                    </TableCell>
                    <TableCell
                      className={`${CELL} hidden text-sm sm:table-cell`}
                    >
                      {METHOD_LABELS[d.method] ?? d.method}
                    </TableCell>
                    <TableCell
                      className={`${CELL} hidden text-sm text-muted-foreground md:table-cell`}
                    >
                      {d.notes ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
}
