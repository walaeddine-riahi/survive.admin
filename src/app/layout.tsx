import { RootLayoutContent } from "@/components/layout/root-layout-content";
import { HydrationFix } from "@/components/hydration-fix";
import { authOptions } from "@/lib/auth";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

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
    <html lang="fr" suppressHydrationWarning>
      <body
        className={inter.className}
        suppressHydrationWarning
        // Suppression proactive des attributs d'extensions courantes
        data-new-gr-c-s-check-loaded=""
        data-gr-ext-installed=""
      >
        <HydrationFix />
        <RootLayoutContent session={session}>{children}</RootLayoutContent>
      </body>
    </html>
  );
}
