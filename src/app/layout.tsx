import { RootLayoutContent } from "@/components/layout/root-layout-content";
import { HydrationFix } from "@/components/hydration-fix";
import { authOptions } from "@/lib/auth";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { Crimson_Pro, JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const serif = Crimson_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-serif",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "S.U.R.V.I.V.E. Resilience",
  description:
    "Plateforme de gestion de la continuité d'activité et de simulation de crise - Sustainability, Unity, Resilience, Vision, Innovation, Versatility, and Efficiency",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="fr" suppressHydrationWarning translate="no">
      <body
        className={`${inter.variable} ${serif.variable} ${mono.variable} font-sans`}
        suppressHydrationWarning
      >
        <HydrationFix />
        <RootLayoutContent session={session}>{children}</RootLayoutContent>
      </body>
    </html>
  );
}
