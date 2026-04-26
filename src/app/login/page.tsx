"use client";

import { useEffect, useState } from "react";
import { Shield, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
      setError(error.message);
      setLoading(false);
      return;
    }
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top logo bar */}
      <header className="h-14 flex items-center px-8 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-primary" />
          <span className="font-sans text-[13px] font-bold text-foreground">
            Nieuwe Moskee
          </span>
        </div>
      </header>

      {/* Centered form */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div
          className="w-full"
          style={{
            maxWidth: 400,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(-10px)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
          }}
        >
          {/* Lock icon circle */}
          <div className="flex justify-center mb-6">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "var(--accent-light)" }}
            >
              <Lock size={22} className="text-primary" />
            </div>
          </div>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <h1 className="font-serif text-2xl font-normal text-foreground text-center mb-6">
                Inloggen
              </h1>

              <form onSubmit={handleLogin} className="flex flex-col gap-3">
                <Input
                  type="email"
                  placeholder="E-mailadres"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />

                <div className="relative">
                  <Input
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
                  <div
                    className="flex items-center gap-2 p-3 rounded-[7px] text-sm"
                    style={{
                      background: "var(--error-light)",
                      color: "var(--error)",
                    }}
                  >
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button type="submit" className="w-full mt-1" disabled={loading}>
                  {loading ? "Bezig..." : "Inloggen"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-10 flex items-center justify-center border-t border-border shrink-0">
        <p className="text-[11px] text-muted-foreground">
          Nieuwe Moskee · ANBI Dashboard
        </p>
      </footer>
    </div>
  );
}
