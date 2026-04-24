"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
