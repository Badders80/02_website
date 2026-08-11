import { Metadata } from "next";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How Racehorse Ownership Returns Work",
  description:
    "How prize money and stakes flow back to digital syndicate members in NZ thoroughbred ownership. Pro-rata distribution, settlement cadence, and what to expect.",
  alternates: {
    canonical: "/learn/returns",
  },
  openGraph: {
    type: "article",
    locale: "en_NZ",
    url: "https://www.evolutionstables.nz/learn/returns",
    siteName: "Evolution Stables",
    title: "How Racehorse Ownership Returns Work",
    description:
      "How prize money and stakes flow back to digital syndicate members in NZ thoroughbred ownership. Pro-rata distribution, settlement cadence, and what to expect.",
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
    title: "How Racehorse Ownership Returns Work",
    description:
      "How prize money and stakes flow back to digital syndicate members in NZ thoroughbred ownership. Pro-rata distribution, settlement cadence, and what to expect.",
    images: ["/opengraph-image"],
  },
};

function ReturnsJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How Racehorse Ownership Returns Work",
    description:
      "How prize money and stakes flow back to digital syndicate members in NZ thoroughbred ownership.",
    image: "https://www.evolutionstables.nz/opengraph-image",
    datePublished: "2026-07-13",
    author: {
      "@type": "Organization",
      name: "Evolution Stables",
    },
    publisher: {
      "@type": "Organization",
      name: "Evolution Stables",
      logo: {
        "@type": "ImageObject",
        url: "https://www.evolutionstables.nz/images/brand/legacy/legacy-logo-gold-favicon.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://www.evolutionstables.nz/learn/returns",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function ReturnsPage() {
  return (
    <>
      <ReturnsJsonLd />
      <NavBar />
      <main className="min-h-screen bg-canvas text-heading font-sans pt-32 pb-24 selection:bg-[#d4a964] selection:text-black">
        <div className="mx-auto max-w-3xl px-6 sm:px-10 lg:px-12">
          {/* Breadcrumb */}
          <div className="mb-10 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <Link href="/" className="hover:text-frost transition duration-300">
              Home
            </Link>
            <span>/</span>
            <span className="text-frost">Returns</span>
          </div>

          {/* Header */}
          <div className="mb-16 space-y-4">
            <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-accent">
              Ownership Explainer
            </p>
            <h1 className="text-[36px] font-light tracking-tight text-white md:text-[48px] leading-tight">
              How Racehorse Ownership Returns Work
            </h1>
            <p className="text-[16px] leading-[1.8] font-light text-frost max-w-2xl">
              Prize money in New Zealand thoroughbred racing flows from the track, through the official settlement process, and back to owners in proportion to what they own. Here is how that works for Evolution Stables investors.
            </p>
          </div>

          <div className="space-y-12 text-[15px] leading-[1.85] font-light text-frost">
            <section className="space-y-4">
              <h2 className="text-[20px] font-light text-white tracking-tight">
                The source of returns: NZTR prize money
              </h2>
              <p>
                When a thoroughbred races in New Zealand, the connections are competing for stakes set by New Zealand Thoroughbred Racing (NZTR). These stakes are not a dividend, a reward, or a guaranteed distribution. They are prize money paid to placegetters according to the official scale for that meeting and race grade.
              </p>
              <p>
                NZTR classifies meetings as metropolitan, provincial, or rural. Higher-grade races at major tracks carry larger stakes than maiden or benchmark events at smaller venues. Stakes are also affected by sponsorship, field size, and whether the race carries added money or bonus schemes. The winner receives the largest portion, with decreasing shares paid to the second, third, fourth, and fifth placegetters in most races.
              </p>
              <p>
                After the race, the official results are confirmed, and NZTR processes the stakes. The money is paid into the nominated syndicate or owner account once the administrative cycle is complete. From there, the licensed syndicator calculates each owner&apos;s share.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-[20px] font-light text-white tracking-tight">
                From syndicate to owner: pro-rata distribution
              </h2>
              <p>
                If the thoroughbred is syndicated, the syndicator receives the gross stakes and then applies the agreed waterfall. Typical deductions before distribution include the trainer&apos;s percentage, jockey fees, transport, gear, race-day expenses, bloodstock agent commission where applicable, and administration fees.
              </p>
              <p>
                The net amount is then divided among owners based on their percentage holding. A 1% owner receives 1% of the net distribution. A 5% owner receives 5%. This is pro-rata ownership in its simplest form. Good syndicators provide a settlement statement that shows the gross stakes, itemised deductions, net amount, and the calculation per share.
              </p>
              <p>
                At Evolution Stables, our model pays 75% of gross stakes back to investors. The remaining portion covers trainer, stable, and operational costs associated with the syndicated stake. Each investor&apos;s share is calculated against their ownership in the syndicate, not the entire horse.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-[20px] font-light text-white tracking-tight">
                Settlement cadence: quarterly, after race-day reconciliation
              </h2>
              <p>
                Returns are not instant. Race-day stakes must be confirmed by NZTR, collected by the syndicate, reconciled against deductions, and approved before any distribution. Evolution Stables settles with investors quarterly. This timing allows us to batch reconciliations, verify all race-day costs, and present a clear settlement statement rather than making piecemeal transfers after every start.
              </p>
              <p>
                If a race falls close to the end of a quarter, its earnings may be carried into the next settlement period. This avoids partial reconciliations and ensures the statement is complete. Quarterly settlement is a discipline that benefits both the operator and the owner.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-[20px] font-light text-white tracking-tight">
                What investors actually receive
              </h2>
              <p>
                After settlement, investors receive their pro-rata portion of the 75% gross-stakes pool allocated to investors. This is delivered to investor accounts through our regulated settlement partner, Tokinvest. Settlement timing and account access are governed by the terms of the syndication agreement and the platform&apos;s respective terms.
              </p>
              <p>
                Alongside the distribution, investors receive reporting that explains the calculation. This includes race-by-race stakes, gross and net figures, the 75% investor allocation, and the pro-rata calculation applied to their holding.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-[20px] font-light text-white tracking-tight">
                Tax treatment basics
              </h2>
              <p>
                The tax treatment of racehorse ownership returns depends on the investor&apos;s circumstances, the structure of the syndicate, and how the holding is classified. Some investors may treat returns as taxable income; others may be subject to different rules depending on whether they are in business, hold the interest as a hobby, or participate through a trust or company.
              </p>
              <p>
                Evolution Stables does not provide tax advice. Investors should consult their accountant or tax adviser to understand how their particular holding is treated.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-[20px] font-light text-white tracking-tight">
                Important risks and disclosures
              </h2>
              <p>
                Racehorse ownership is speculative. Prize money is not guaranteed. A thoroughbred may race poorly, be injured, or retire before earning any material stakes. There is no assurance that an investor will recover their subscription amount or generate any return.
              </p>
              <p>
                Past performance of one horse is not indicative of future results. Returns depend on race results, which depend on form, fitness, track conditions, barriers, ride luck, and competition. The figures described on this page describe the distribution mechanics, not a forecast of future earnings.
              </p>
            </section>
          </div>

          <div className="mt-16 pt-8 border-t border-border space-y-4">
            <p className="text-[12px] font-light text-muted-foreground leading-[1.8]">
              This page is for informational purposes only and does not constitute financial, legal, or tax advice. Racehorse ownership and digital-syndication carry risk, including the risk of loss. Read the offering documents and consult a professional adviser before subscribing.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/marketplace"
                className="text-[11px] uppercase tracking-[0.2em] text-accent hover:text-white transition duration-300"
              >
                View Marketplace →
              </Link>
              <Link
                href="/insights/how-prize-money-works-in-nz-racing"
                className="text-[11px] uppercase tracking-[0.2em] text-accent hover:text-white transition duration-300"
              >
                How Prize Money Works →
              </Link>
              <Link
                href="/insights/racehorse-syndication-explained-nz"
                className="text-[11px] uppercase tracking-[0.2em] text-accent hover:text-white transition duration-300"
              >
                Syndication Explained →
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer minimal={true} />
    </>
  );
}
