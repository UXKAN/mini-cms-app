"use client";

import type { User } from "@supabase/supabase-js";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "../../lib/supabase";

type Props = {
  user?: User | null;
};

export function PublicHeader({ user }: Props) {
  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <header className="h-14 flex items-center justify-between gap-4 px-6 sm:px-8 border-b border-border bg-background">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-9 w-9 shrink-0 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
          <Shield size={18} />
        </div>
        <div className="leading-tight min-w-0">
          <div className="font-sans text-sm font-bold text-foreground truncate">
            Nieuwe Moskee Enschede
          </div>
          <div className="font-sans text-xs text-muted-foreground truncate">
            HDV Selimiye / HDV Anadolu · ANBI
          </div>
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm text-muted-foreground hidden md:inline">
            {user.email}
          </span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Uitloggen
          </Button>
        </div>
      )}
    </header>
  );
}
