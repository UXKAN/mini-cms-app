"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

// ⚠️ TEMP DEMO MODE — set to false to restore normal auth flow.
// When true: skips Supabase auth check and uses a fake user so the Vercel
// preview is browseable without logging in. Pages will load empty data
// (RLS blocks queries without a real session) but the UI is fully visible.
const DEMO_MODE = true;

const DEMO_USER = {
  id: "00000000-0000-0000-0000-000000000000",
  email: "demo@nieuwe-moskee.nl",
  app_metadata: {},
  user_metadata: { full_name: "Demo gebruiker" },
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as unknown as User;

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(DEMO_MODE ? DEMO_USER : null);
  const [loading, setLoading] = useState(!DEMO_MODE);

  useEffect(() => {
    if (DEMO_MODE) return;

    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      if (!data.user) {
        router.push("/login");
        return;
      }
      setUser(data.user);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [router]);

  return { user, loading };
}
