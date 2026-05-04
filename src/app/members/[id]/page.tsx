"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/useAuth";
import AppShell from "../../components/AppShell";
import { useOrg } from "../../lib/orgContext";
import type {
  Member,
  Donation,
  GiftAgreement,
} from "../../lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function fmtEuro(n: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(n);
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function displayName(m: Member): string {
  const combined = [m.first_name, m.last_name].filter(Boolean).join(" ").trim();
  return combined || m.name || "—";
}

const METHOD_LABELS: Record<string, string> = {
  cash: "Contant",
  bank: "Bank",
  online: "Online",
  other: "Overig",
};

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
  const { user } = useAuth();
  const org = useOrg();

  const [member, setMember] = useState<Member | null>(null);
  const [periodieke, setPeriodieke] = useState<GiftAgreement[]>([]);
  const [eenmalige, setEenmalige] = useState<GiftAgreement[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
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
  }, [user, id, org.id]);

  if (loading) {
    return <p className="text-muted-foreground">Laden…</p>;
  }
  if (error || !member) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-destructive mb-4">{error ?? "Lid niet gevonden"}</p>
          <Link href="/members">
            <Button variant="outline">← Terug naar leden</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const totalDonated = donations.reduce((s, d) => s + Number(d.amount), 0);
  const monthlyExpected = periodieke
    .filter((p) => p.agreement_status === "signed")
    .reduce((s, p) => s + Number(p.bedrag_per_maand ?? 0), 0);

  return (
    <>
      <div className="mb-6">
        <Link
          href="/members"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Terug naar leden
        </Link>
      </div>

      <div className="flex items-start justify-between mb-7 gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-4xl font-normal text-foreground">
            {displayName(member)}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            {member.membership_type === "lid" && (
              <Badge className="bg-emerald-100 text-emerald-900 hover:bg-emerald-100">
                Lid
              </Badge>
            )}
            {member.membership_type === "donateur" && (
              <Badge className="bg-sky-100 text-sky-900 hover:bg-sky-100">
                Donateur
              </Badge>
            )}
            {member.membership_type &&
              !["lid", "donateur"].includes(member.membership_type) && (
                <Badge variant="secondary">{member.membership_type}</Badge>
              )}
            <span className="text-sm text-muted-foreground">
              · Sinds {fmtDate(member.created_at)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Totaal ontvangen
            </div>
            <div className="font-serif text-3xl">{fmtEuro(totalDonated)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Aantal donaties
            </div>
            <div className="font-serif text-3xl">{donations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Verwacht per maand
            </div>
            <div className="font-serif text-3xl">
              {fmtEuro(monthlyExpected)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Persoonsgegevens */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Contactgegevens
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-muted-foreground text-xs">E-mail</div>
              <div>{member.email ?? "—"}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Telefoon</div>
              <div>{member.phone ?? "—"}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Adres</div>
              <div>
                {member.address ?? "—"}
                {member.postcode && member.city
                  ? `, ${member.postcode} ${member.city}`
                  : ""}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">IBAN</div>
              <div>{member.iban ?? "—"}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Periodieke akten */}
      {periodieke.length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Periodieke gift-akten ({periodieke.length})
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum ondertekening</TableHead>
                  <TableHead className="text-right">Bedrag/maand</TableHead>
                  <TableHead>Startdatum</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Omschrijving</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periodieke.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-sm">
                      {fmtDate(p.akkoord_at)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {p.bedrag_per_maand
                        ? fmtEuro(Number(p.bedrag_per_maand))
                        : "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {fmtDate(p.startdatum)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{p.agreement_status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.purpose ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Eenmalige akten */}
      {eenmalige.length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Eenmalige gift-akten ({eenmalige.length})
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead className="text-right">Bedrag</TableHead>
                  <TableHead>Methode</TableHead>
                  <TableHead>Betaalstatus</TableHead>
                  <TableHead>Omschrijving</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eenmalige.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="text-sm">
                      {fmtDate(e.akkoord_at)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {e.bedrag_eenmalig
                        ? fmtEuro(Number(e.bedrag_eenmalig))
                        : "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {e.payment_method_intent
                        ? METHOD_LABELS[e.payment_method_intent] ??
                          e.payment_method_intent
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {e.payment_status ?? "—"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {e.purpose ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Donatie-historie */}
      <Card>
        <CardContent className="p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Donatie-historie ({donations.length})
          </div>
          {donations.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              Nog geen donaties geregistreerd voor deze persoon.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead className="text-right">Bedrag</TableHead>
                  <TableHead>Methode</TableHead>
                  <TableHead>Omschrijving</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="text-sm">
                      {fmtDate(d.donated_at)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {fmtEuro(Number(d.amount))}
                    </TableCell>
                    <TableCell className="text-sm">
                      {METHOD_LABELS[d.method] ?? d.method}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {d.notes ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
