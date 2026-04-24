"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import type { Organization } from "./types";

export function useCurrentOrg(user: User | null) {
  const router = useRouter();
  const pathname = usePathname();
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;

    (async () => {
      const { data: memberships, error } = await supabase
        .from("organization_members")
        .select("org_id, organizations(id, name, rsin, created_at)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(1);

      if (!active) return;

      if (error) {
        setLoading(false);
        return;
      }

      const first = memberships?.[0];
      const orgRow =
        first && first.organizations
          ? (Array.isArray(first.organizations)
              ? first.organizations[0]
              : first.organizations) ?? null
          : null;

      if (!orgRow) {
        if (pathname !== "/onboarding") router.replace("/onboarding");
        setLoading(false);
        return;
      }

      setOrg(orgRow as Organization);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [user, router, pathname]);

  return { org, loading };
}
