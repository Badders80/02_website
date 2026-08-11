import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import hltsData from "@/data/hlts.json";

export const runtime = "nodejs";
export const dynamicParams = true;

export async function generateStaticParams() {
  return (hltsData as any[]).map((hlt) => ({ id: hlt.horse_slug || hlt.id }));
}

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}

export default async function ConfirmPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { success } = await searchParams;
  const hlt = (hltsData as any[]).find((h) => (h.horse_slug || h.id) === id);

  if (!hlt) {
    return (
      <>
        <NavBar />
        <main className="min-h-screen bg-canvas text-heading font-sans pt-32 pb-24">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h1 className="text-[28px] font-light text-white mb-4">Campaign not found</h1>
            <Link href="/marketplace" className="text-accent text-sm">← Back to Marketplace</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const horseName = hlt.horse_name || "Racehorse";

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-canvas text-heading font-sans pt-32 pb-24">
        <div className="mx-auto max-w-2xl px-6 sm:px-10 lg:px-12 text-center space-y-8">
          {/* Success icon */}
          {success === "true" && (
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}

          <div className="space-y-3">
            <h1 className="text-[32px] font-light text-white tracking-tight">
              {success === "true" ? "Purchase complete." : "Purchase confirmation"}
            </h1>
            <p className="text-[15px] font-light text-muted-foreground leading-relaxed max-w-md mx-auto">
              {success === "true"
                ? `Your unit(s) in ${horseName} are recorded. A welcome note is on its way — check MyStable for your holding.`
                : "If you completed payment, your holding will show in MyStable. If you cancelled, no charge was made."}
            </p>
          </div>

          {/* What happens next */}
          {success === "true" && (
            <div className="rounded-2xl border border-border bg-surface-base p-8 space-y-4 text-left max-w-md mx-auto">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">What happens next</p>
              <div className="space-y-3 text-[13px] font-light text-muted-foreground leading-relaxed">
                <p>• Welcome email with your holding details</p>
                <p>• Units appear in MyStable once payment is fulfilled</p>
                <p>• Quarterly investor reports on the reporting cycle</p>
                <p>• Race updates and stable news as they happen</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/mystable"
              className="text-center py-3.5 px-8 rounded-full text-[12px] font-medium uppercase tracking-[0.15em] bg-white text-black hover:bg-white/90 transition"
            >
              Go to MyStable
            </Link>
            <Link
              href={`/marketplace/${id}`}
              className="text-center py-3.5 px-8 rounded-full text-[12px] font-medium uppercase tracking-[0.15em] border border-border text-white hover:bg-white/5 transition"
            >
              Back to {horseName}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}