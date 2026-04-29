"use client";

import { useAuth } from "../lib/useAuth";
import { GiftForm } from "./GiftForm";
import { PublicHeader } from "./_components/PublicHeader";

export default function GiftPage() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader user={user} />
      <main className="px-4 sm:px-6 py-8 sm:py-12">
        <div className="mx-auto w-full max-w-[640px]">
          <GiftForm />
        </div>
      </main>
    </div>
  );
}
