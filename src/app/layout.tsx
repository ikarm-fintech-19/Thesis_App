import type { Metadata } from "next";
import { Lexend, Source_Sans_3, Cairo } from "next/font/google";
import "./globals.css";
import { BRAND } from "@/lib/brand";


const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
});

const sourceSans3 = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: `${BRAND.name} — ${BRAND.tagline.fr}`,
  description: BRAND.tagline.fr,
  keywords: ["TVA", "Algérie", "Matax", "SaaS", "FinTech", "RegTech", "Loi de Finances 2026", "G50", "IRG", "CNAS"],
  authors: [{ name: BRAND.name }],
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192.png",
  },
  manifest: "/manifest.json",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: `${BRAND.name} — ${BRAND.tagline.fr}`,
    description: BRAND.tagline.fr,
    url: '/',
    siteName: BRAND.name,
    locale: 'fr_DZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: BRAND.name,
    description: BRAND.tagline.fr,
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Providers } from '@/components/layout/Providers';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} antialiased bg-background text-foreground font-sans min-h-screen flex flex-col`}
      >
        <Providers>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
