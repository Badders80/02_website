import type { Metadata } from "next";
import "../styles/globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { Geist, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  metadataBase: new URL("https://evolutionstables.nz"),
  title: {
    default: "Evolution Stables - Digital Racehorse Ownership",
    template: "%s | Evolution Stables",
  },
  description:
    "Own racehorses through digital-syndication. Evolution Stables makes elite thoroughbred racehorse ownership accessible, transparent, and connected for local fans.",
  keywords: [
    "racehorse ownership",
    "digital syndication",
    "fractional ownership",
    "New Zealand racing",
    "NZTR",
    "regulated investment",
    "horse racing investment",
    "syndicate horses",
  ],
  authors: [{ name: "Evolution Stables" }],
  creator: "Evolution Stables",
  publisher: "Evolution Stables",
  openGraph: {
    type: "website",
    locale: "en_NZ",
    url: "https://evolutionstables.nz",
    siteName: "Evolution Stables",
    title: "Evolution Stables - Digital Racehorse Ownership",
    description:
      "Own racehorses through digital-syndication. Making racehorse ownership accessible, transparent, and liquid.",
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
    title: "Evolution Stables - Digital Racehorse Ownership",
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
      <body className="min-h-screen bg-black text-foreground antialiased relative" suppressHydrationWarning>
        <SmoothScrollProvider>
          <AuthProvider>{children}</AuthProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
