"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { withTimeout } from "./withTimeout";

const AUTH_TIMEOUT_MS = 10_000;

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setError(false);
    setLoading(true);
    setAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    let active = true;
    withTimeout(supabase.auth.getUser(), AUTH_TIMEOUT_MS)
      .then(({ data, error: authError }) => {
        if (!active) return;
        if (data.user) {
          setUser(data.user);
          setLoading(false);
          return;
        }
        // Alleen bij een verbindingsprobleem loont retry; elke andere
        // auth-fout (bv. ingetrokken refresh token) is alleen op te lossen
        // door opnieuw in te loggen — dus direct door naar /login.
        if (authError && authError.name === "AuthRetryableFetchError") {
          setError(true);
          setLoading(false);
          return;
        }
        router.push("/login");
      })
      .catch(() => {
        if (!active) return;
        setError(true);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [router, attempt]);

  return { user, loading, error, retry };
}
