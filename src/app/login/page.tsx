"use client";
import { useEffect } from "react";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      console.log("current user:", data.user);
    };

    checkUser();
  }, []);

  const handleSignUp = async () => {
    setMessage("Bezig met account aanmaken...");
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Account aangemaakt. Check je mail om te bevestigen.");
  };

  const handleLogin = async () => {
    setMessage("Bezig met inloggen...");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Inloggen gelukt.");
  };

  return (
    <main style={{ maxWidth: 420, margin: "60px auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, marginBottom: 16 }}>Supabase test login</h1>

      <div style={{ display: "grid", gap: 12 }}>
        <input
          type="email"
          placeholder="E-mailadres"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 12, fontSize: 16 }}
        />

        <input
          type="password"
          placeholder="Wachtwoord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 12, fontSize: 16 }}
        />

        <button onClick={handleSignUp} style={{ padding: 12, fontSize: 16 }}>
          Account aanmaken
        </button>

        <button onClick={handleLogin} style={{ padding: 12, fontSize: 16 }}>
          Inloggen
        </button>

        {message && <p>{message}</p>}
      </div>
    </main>
  );
}