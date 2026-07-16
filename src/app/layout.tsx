import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-serif",
  subsets: ["latin", "latin-ext"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: { default: "Mosqon", template: "%s · Mosqon" },
  description: "Digitaal beheer voor moskeeën en verenigingen",
};

export const viewport = {
  colorScheme: "light" as const,
  themeColor: "#f5f1ea",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`${dmSans.variable} ${dmSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
