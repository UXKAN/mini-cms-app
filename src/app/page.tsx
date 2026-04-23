"use client";

export default function Home() {
  return (
    <main style={{ width: "100%", height: "100vh", margin: 0 }}>
      <iframe
        src="/Dashboard.html"
        style={{ width: "100%", height: "100%", border: "none" }}
        title="Dashboard"
      />
    </main>
  );
}