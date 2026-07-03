"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./lib/supabase";
import { withTimeout } from "./lib/withTimeout";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    withTimeout(supabase.auth.getUser(), 10_000)
      .then(({ data }) => {
        router.replace(data.user ? "/dashboard" : "/login");
      })
      .catch(() => {
        // Bij een hangende of falende auth-check niet eeuwig "Laden..." tonen.
        router.replace("/login");
      });
  }, [router]);

  return <main style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>Laden...</main>;
}
