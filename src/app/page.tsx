"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./lib/supabase";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      router.replace(data.user ? "/dashboard" : "/login");
    });
  }, [router]);

  return <main style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>Laden...</main>;
}
