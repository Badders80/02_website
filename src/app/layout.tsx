import type { Metadata } from "next";
import "../styles/globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { PostHogProviderWrapper } from "@/lib/posthog-client";
import { Geist, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { StructuredData } from "@/components/seo/StructuredData";
import { getPressArticlesForStructuredData } from "@/lib/press-articles";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.evolutionstables.nz"),
  title: {
    default: "Evolution Stables — Digital Racehorse Ownership",
    template: "%s | Evolution Stables",
  },
  description:
    "Own thoroughbreds through digital-syndication. Evolution Stables makes racehorse ownership accessible, transparent, and liquid. Regulated digital-syndication for modern racehorse owners.",
  keywords: [
    "racehorse ownership",
    "digital syndication",
    "real world assets",
    "RWA",
    "fractional ownership",
    "New Zealand racing",
    "NZTR",
    "authorised syndicator",
    "regulated investment",
    "horse racing investment",
  ],
  authors: [{ name: "Evolution Stables" }],
  creator: "Evolution Stables",
  publisher: "Evolution Stables",
  openGraph: {
    type: "website",
    locale: "en_NZ",
    url: "https://www.evolutionstables.nz",
    siteName: "Evolution Stables",
    title: "Evolution Stables — Digital Racehorse Ownership",
    description:
      "Own thoroughbreds through digital-syndication. Making racehorse ownership accessible, transparent, and liquid.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Evolution Stables",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@EvolutionStables",
    creator: "@EvolutionStables",
    title: "Evolution Stables — Digital Racehorse Ownership",
    description:
      "Own racehorses through digital-syndication. Making racehorse ownership accessible, transparent, and liquid.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: "/images/brand/legacy/legacy-logo-gold-favicon.png",
    shortcut: "/images/brand/legacy/legacy-logo-gold-favicon.png",
    apple: "/images/brand/legacy/legacy-logo-gold-favicon.png",
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
      </head>
      <body className="min-h-screen bg-canvas text-foreground antialiased relative" suppressHydrationWarning>
        <SmoothScrollProvider>
          <AuthProvider>
            <PostHogProviderWrapper>{children}</PostHogProviderWrapper>
          </AuthProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
