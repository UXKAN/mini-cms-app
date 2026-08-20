"use client";

import { useEffect, useState } from "react";
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MosqonLogo } from "@/components/MosqonLogo";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(translateAuthError(error.message));
      setLoading(false);
      return;
    }
    window.location.href = "/gift";
  };

  return (
    <div className="min-h-screen bg-[var(--surface-zone)] flex flex-col">
      {/* Top logo bar */}
      <header className="h-14 flex items-center px-8 shrink-0">
        <MosqonLogo
          className="h-8 w-auto text-foreground"
          ariaLabel="Mosqon"
        />
      </header>

      {/* Centered form */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div
          className="w-full max-w-sm"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(-10px)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
          }}
        >
          {/* Lock icon circle */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[var(--accent-light)] text-primary">
              <Lock size={22} />
            </div>
          </div>

          <div className="w-full max-w-sm rounded-[16px] bg-card p-8 shadow-[var(--shadow)]">
            <h1 className="text-xl font-bold tracking-[-0.02em] text-foreground text-center mb-6">
              Inloggen
            </h1>

            <form onSubmit={handleLogin} className="flex flex-col gap-3">
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="E-mailadres"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />

              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Wachtwoord"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Verberg wachtwoord" : "Toon wachtwoord"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-[10px] bg-[var(--error-light)] p-3 text-sm text-destructive">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" className="w-full mt-1" disabled={loading}>
                {loading ? "Inloggen…" : "Inloggen"}
              </Button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-10 flex items-center justify-center shrink-0">
        <p className="text-[11px] text-muted-foreground">
          Powered by Mosqon · Digitaal beheer voor moskeeën
        </p>
      </footer>
    </div>
  );
}

function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials") || m.includes("invalid_credentials")) {
    return "Onjuist e-mailadres of wachtwoord.";
  }
  if (m.includes("email not confirmed")) {
    return "Je e-mailadres is nog niet bevestigd. Check je inbox voor de bevestigingsmail.";
  }
  if (m.includes("rate limit")) {
    return "Te veel inlogpogingen. Probeer het over een paar minuten opnieuw.";
  }
  if (m.includes("user not found")) {
    return "Geen account gevonden met dit e-mailadres.";
  }
  if (m.includes("network")) {
    return "Geen verbinding. Controleer je internet en probeer opnieuw.";
  }
  return "Inloggen mislukt. Probeer het opnieuw.";
}
