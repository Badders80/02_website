import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import Link from "next/link";

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>

          <div className="mt-12 space-y-8 text-white/70 font-light leading-relaxed">
            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">1. Introduction</h2>
              <p>
                Evolution Stables ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">2. Information We Collect</h2>
              <p className="mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Name and contact information</li>
                <li>Email address</li>
                <li>Investment preferences</li>
                <li>Communication preferences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide and maintain our services</li>
                <li>Send you updates and marketing communications</li>
                <li>Respond to your inquiries and requests</li>
                <li>Monitor and analyze trends and usage</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">4. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">5. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at alex@evolutionstables.nz
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
