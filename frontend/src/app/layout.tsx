import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "NIRIKSHAK AI — MPLADS Integrity Platform",
  description: "Government-grade investigation and integrity analysis dashboard for MPLADS spending data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased selection:bg-blue-500 selection:text-white">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
