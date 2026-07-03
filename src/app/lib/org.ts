"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { withTimeout } from "./withTimeout";
import type { Organization } from "./types";

const ORG_TIMEOUT_MS = 10_000;

export function useCurrentOrg(user: User | null) {
  const router = useRouter();
  const pathname = usePathname();
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setError(false);
    setLoading(true);
    setAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;

    (async () => {
      try {
        const { data: memberships, error: queryError } = await withTimeout(
          supabase
            .from("organization_members")
            .select("org_id, organizations(id, name, rsin, created_at)")
            .eq("user_id", user.id)
            .order("created_at", { ascending: true })
            .limit(1),
          ORG_TIMEOUT_MS
        );

        if (!active) return;

        if (queryError) {
          setError(true);
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
      } catch {
        if (!active) return;
        setError(true);
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [user, router, pathname, attempt]);

  return { org, loading, error, retry };
}
