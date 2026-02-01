import { RootLayoutContent } from "@/components/layout/root-layout-content";
import { HydrationFix } from "@/components/hydration-fix";
import { authOptions } from "@/lib/auth";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
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
    <html lang="fr" suppressHydrationWarning>
      <body
        className={roboto.className}
        suppressHydrationWarning
        data-new-gr-c-s-check-loaded=""
        data-gr-ext-installed=""
      >
        <HydrationFix />
        <RootLayoutContent session={session}>{children}</RootLayoutContent>
      </body>
    </html>
  );
}
