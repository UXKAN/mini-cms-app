"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [rsin, setRsin] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("organization_members")
        .select("org_id")
        .eq("user_id", user.id)
        .limit(1);
      if (!active) return;
      if (data && data.length > 0) {
        router.replace("/dashboard");
        return;
      }
      setChecking(false);
    })();
    return () => {
      active = false;
    };
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setSaving(true);
    setError(null);

    const { data: org, error: orgErr } = await supabase
      .from("organizations")
      .insert({ name: name.trim(), rsin: rsin.trim() || null })
      .select()
      .single();

    if (orgErr || !org) {
      setSaving(false);
      setError(orgErr?.message ?? "Kon organisatie niet aanmaken");
      return;
    }

    const { error: memberErr } = await supabase
      .from("organization_members")
      .insert({ org_id: org.id, user_id: user.id, role: "owner" });

    setSaving(false);
    if (memberErr) {
      setError(memberErr.message);
      return;
    }
    router.replace("/dashboard");
  };

  if (authLoading || checking) {
    return <main style={{ padding: 40 }}>Laden...</main>;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "var(--bg)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          padding: 32,
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          background: "var(--surface)",
          boxShadow: "var(--shadow)",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-serif), Georgia, serif",
            fontSize: 28,
            fontWeight: 400,
            color: "var(--ink)",
            marginBottom: 6,
          }}
        >
          Welkom
        </h1>
        <p style={{ fontSize: 14, color: "var(--ink-muted)", marginBottom: 20 }}>
          Maak je organisatie aan om te beginnen. Je kunt later nog collega&apos;s toevoegen.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label style={labelStyle}>
            Naam organisatie
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Bijv. Nieuwe Moskee Enschede"
              required
              style={inputStyle}
            />
          </label>
          <label style={labelStyle}>
            RSIN (optioneel)
            <input
              value={rsin}
              onChange={(e) => setRsin(e.target.value)}
              placeholder="ANBI RSIN-nummer"
              style={inputStyle}
            />
          </label>

          {error && (
            <div
              style={{
                padding: 10,
                background: "var(--error-light)",
                color: "var(--error)",
                borderRadius: "var(--radius-sm)",
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving || !name.trim()}
            style={{
              padding: "11px 16px",
              background: "var(--accent)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius-sm)",
              fontSize: 14,
              fontWeight: 500,
              cursor: saving ? "wait" : "pointer",
              opacity: !name.trim() ? 0.5 : 1,
            }}
          >
            {saving ? "Aanmaken..." : "Organisatie aanmaken"}
          </button>
        </form>
      </div>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontSize: 13,
  color: "var(--ink-muted)",
  fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  background: "var(--bg)",
  color: "var(--ink)",
  fontSize: 14,
  outline: "none",
};
