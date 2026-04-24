"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/login");
        return;
      }

      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return <main style={{ padding: 40 }}>Laden...</main>;
  }

  return (
    <main style={{ height: "100vh" }}>
      {/* Logout knop */}
      <button
        onClick={handleLogout}
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 9999,
          padding: "10px 14px",
          background: "black",
          color: "white",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Uitloggen
      </button>

      {/* Jouw oude dashboard */}
      <iframe
        src="/Dashboard.html"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
      />
    </main>
  );
}