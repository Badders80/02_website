import type { Metadata } from "next";
import "../styles/globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";
import { Geist, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { StructuredData } from "@/components/seo/StructuredData";
import { FAQStructuredData } from "@/components/seo/FAQStructuredData";
import { getPressArticlesForStructuredData } from "@/lib/press-articles";
import { faqItems } from "@/lib/faq-items";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  metadataBase: new URL("https://evolutionstables.nz"),
  title: {
    default: "Evolution Stables - Digital Racehorse Ownership | Tokenized RWA Platform",
    template: "%s | Evolution Stables",
  },
  description:
    "Own racehorses through digital-syndication. Evolution Stables makes racehorse ownership accessible, transparent, and liquid. Regulated real-world asset (RWA) investing powered by Tokinvest and blockchain technology.",
  keywords: [
    "racehorse ownership",
    "digital syndication",
    "tokenized assets",
    "real world assets",
    "RWA",
    "blockchain racing",
    "fractional ownership",
    "New Zealand racing",
    "NZTR",
    "Tokinvest",
    "Singularry",
    "regulated investment",
    "horse racing investment",
  ],
  authors: [{ name: "Evolution Stables" }],
  creator: "Evolution Stables",
  publisher: "Evolution Stables",
  openGraph: {
    type: "website",
    locale: "en_NZ",
    url: "https://evolutionstables.nz",
    siteName: "Evolution Stables",
    title: "Evolution Stables - Digital Racehorse Ownership | Tokenized RWA Platform",
    description:
      "Own racehorses through digital-syndication. Making racehorse ownership accessible, transparent, and liquid through blockchain innovation.",
    images: [
      {
        url: "/images/Logo-Gold-Favicon.png",
        width: 1200,
        height: 630,
        alt: "Evolution Stables Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@EvolutionStables",
    creator: "@EvolutionStables",
    title: "Evolution Stables - Digital Racehorse Ownership | Tokenized RWA Platform",
    description:
      "Own racehorses through digital-syndication. Making racehorse ownership accessible, transparent, and liquid.",
  },
  icons: {
    icon: "/images/Logo-Gold-Favicon.png",
    shortcut: "/images/Logo-Gold-Favicon.png",
    apple: "/images/Logo-Gold-Favicon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-NZ" className={cn("font-sans", geist.variable, geistMono.variable)} suppressHydrationWarning>
      <head>
        <StructuredData pressArticles={getPressArticlesForStructuredData()} />
        <FAQStructuredData items={faqItems} />
      </head>
      <body className="min-h-screen bg-black text-foreground antialiased relative" suppressHydrationWarning>
        <SmoothScrollProvider>
          <NextAuthProvider>
            <AuthProvider>{children}</AuthProvider>
          </NextAuthProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
