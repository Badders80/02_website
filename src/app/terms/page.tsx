import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import Link from "next/link";

export default function TermsPage() {
  return (
    <>
      <NavBar />
      <main className="pt-24 pb-24">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <Link
            href="/"
            className="text-sm text-gold transition-colors hover:text-gold-hover"
          >
            ← Home
          </Link>

          <h1 className="mt-8 font-display text-4xl font-normal text-foreground">
            Terms of Service
          </h1>

          <div className="mt-12 space-y-8 text-white/70 font-light leading-relaxed">
            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using the Evolution Stables website, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">2. Use License</h2>
              <p className="mb-4">
                Permission is granted to temporarily download one copy of the materials (information or software) on Evolution Stables' website for personal, non-commercial transitory viewing only.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">3. Investment Risks</h2>
              <p className="mb-4">
                Racehorse ownership carries inherent risks including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Injury or illness of horses</li>
                <li>Performance variability</li>
                <li>Market fluctuations</li>
                <li>Regulatory changes</li>
              </ul>
              <p className="mt-4">
                Past performance is not indicative of future results. Returns are not guaranteed.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">4. Disclaimer</h2>
              <p>
                The materials on Evolution Stables' website are provided on an 'as is' basis. Evolution Stables makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">5. Governing Law</h2>
              <p>
                These terms and conditions are governed by and construed in accordance with the laws of New Zealand and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">6. Contact</h2>
              <p>
                For any questions regarding these Terms of Service, please contact us at alex@evolutionstables.nz
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
