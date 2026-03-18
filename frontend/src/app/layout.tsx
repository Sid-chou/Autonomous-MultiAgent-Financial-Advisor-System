import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinAdvisor — AI Stock Analysis for Indian Markets",
  description: "Six specialized AI agents delivering grounded, risk-aware stock analysis for NSE listed companies in under 15 seconds.",
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%232563EB" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 6.873a2 2 0 0 1 1 1.747v6.536a2 2 0 0 1 -1.029 1.748l-6 3.833a2 2 0 0 1 -1.942 0l-6 -3.833a2 2 0 0 1 -1.029 -1.747v-6.537a2 2 0 0 1 1.029 -1.748l6 -3.572a2.056 2.056 0 0 1 2 0l6 3.573z" /><path d="M9 15v-4" /><path d="M12 15v-7" /><path d="M15 15v-2" /></svg>',
  },
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
