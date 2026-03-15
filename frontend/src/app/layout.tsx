import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinAdvisor — AI Stock Analysis for Indian Markets",
  description: "Six specialized AI agents delivering grounded, risk-aware stock analysis for NSE listed companies in under 15 seconds.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
