"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./lib/supabase";

// ⚠️ TEMP DEMO MODE — keep in sync with useAuth.ts, org.ts, login/page.tsx.
const DEMO_MODE = true;

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (DEMO_MODE) {
      router.replace("/dashboard");
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      router.replace(data.user ? "/dashboard" : "/login");
    });
  }, [router]);

  return <main style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>Laden...</main>;
}
