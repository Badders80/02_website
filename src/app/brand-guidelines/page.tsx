import { Metadata } from 'next';
import Image from 'next/image';
import { Check, Download } from 'lucide-react';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Brand Guidelines',
  description:
    'The brand guidelines for Evolution Stables — visual identity, colour system, typography, voice and tone, and developer tokens.',
  alternates: {
    canonical: '/brand-guidelines',
  },
};

// ——— Content mirrors BRAND_KIT.md v2.4 ———

const BRAND_NAME = 'Evolution Stables';
const TAGLINE = 'The Future of Ownership Has Arrived';

const sections = [
  { id: 'brand-essentials', label: 'Brand Essentials' },
  { id: 'logo-system', label: 'Logo System' },
  { id: 'color-palette', label: 'Colour Palette' },
  { id: 'typography', label: 'Typography' },
  { id: 'voice-tone', label: 'Voice & Tone' },
  { id: 'cta-logic', label: 'CTA Logic' },
  { id: 'developer-reference', label: 'Developer Reference' },
];

const coreNeutrals = [
  { name: 'Black', hex: '#000000', usage: 'Light-background applications / deep contrast.' },
  { name: 'White', hex: '#ffffff', usage: 'Primary high-contrast logo and text.' },
  { name: 'Light Grey', hex: '#d2d2d2', usage: 'Secondary text and subtle surfaces.' },
  { name: 'Medium Grey', hex: '#969696', usage: 'Muted foregrounds and tertiary detail.' },
  { name: 'Dark Grey', hex: '#747474', usage: 'Dividers, inactive states, quiet structure.' },
];

const goldAccent = {
  name: 'Gold Accent',
  hex: '#d4a964',
  usage: 'Monograms, premium structural details, high-tier CTAs.',
};

const backupPalettes = [
  { name: 'Navy & Cream', bg: '#0F172A', surface: '#1E293B', fg: '#F8F5F0', note: 'Corporate / Boardroom' },
  { name: 'Emerald & Gold', bg: '#064E3B', surface: '#065F46', fg: '#F5F5F5', note: 'Growth / Launches' },
  { name: 'Charcoal & Silver', bg: '#1a1a1a', surface: '#2a2a2a', fg: '#e5e5e5', note: 'Technical / Data-heavy' },
];

const logoColors = [
  { label: 'White', bg: 'bg-canvas', monogram: '/images/brand/monograms/white/monogram-white.svg', lockup: '/images/brand/lockups/white/lockup-horizontal-white.svg' },
  { label: 'Muted Grey', bg: 'bg-canvas', monogram: '/images/brand/monograms/black/monogram-black.svg', lockup: '/images/brand/wordmarks/grey/wordmark-muted-grey.svg' },
  { label: 'Border Grey', bg: 'bg-canvas', monogram: '/images/brand/monograms/white/monogram-white.svg', lockup: '/images/brand/wordmarks/grey/wordmark-border-grey.svg' },
  { label: 'Black', bg: 'bg-white', monogram: '/images/brand/monograms/black/monogram-black.svg', lockup: '/images/brand/lockups/black/lockup-horizontal-black.svg' },
  { label: 'Gold', bg: 'bg-canvas', monogram: '/images/brand/monograms/gold/monogram-gold.svg', lockup: '/images/brand/lockups/gold/lockup-horizontal-gold.svg' },
];

const vocabulary = [
  { approved: 'Thoroughbreds / Racehorses', banned: 'Horses, animals, Equine Assets' },
  { approved: 'Digital-syndication', banned: 'Tokenised shares, blockchain, crypto' },
  { approved: 'Payment (inflows)', banned: 'Money transfer, transaction, top-up' },
  { approved: 'Fractional Ownership', banned: 'Pieces, parts, “bits of horse”' },
  { approved: 'Regulated', banned: 'Cutting-edge, disruptive, game-changing' },
  { approved: 'Tradition & Heritage', banned: 'Stewardship, philosophical ownership' },
  { approved: 'Settlement (outflows)', banned: 'Payout, earnings, reward, payment' },
];

const weAre = [
  'Professional but not stuffy',
  'Analytical but not cold',
  'Confident but not arrogant',
  'Visionary but grounded',
];

const weAreNot = [
  'Overly casual or playful',
  'Buzzword-heavy',
  'Complicated or verbose',
  'Aggressive or pushy',
  'Generic or templated',
];

const writingRules = [
  { rule: 'Active voice always', example: 'We have opened the stable gates.' },
  { rule: 'Plain English, British spelling', example: 'Behaviour, modernise, colour.' },
  { rule: 'No exclamation marks or hype', example: 'Four units remain. The stable is closing soon.' },
  { rule: 'Lead with the Thoroughbred', example: 'Prudentia won by 0.8 metres on soft ground.' },
];

const translations = [
  { before: 'Our platform democratizes racehorse investment using secure tokenized real-world assets on the blockchain.', after: 'We have opened the stable gates. Through digital syndication, we invite qualified participants to share in the tradition and heritage of elite Thoroughbreds.' },
  { before: 'Invest in this tokenized horse now and trade fractional shares on our marketplace.', after: 'Acquire units in the campaign. Follow her journey alongside a community of dedicated co-owners.' },
  { before: 'Check out our new Web3 dApp dashboard to manage your portfolio and claim rewards.', after: 'We have updated MyStable. Your private dashboard now provides refined sectional timing analysis and automated settlement ledger audits.' },
];

const ctas = [
  { objective: 'Data / News', directive: 'View Analysis', tone: 'Implies the work is already done.' },
  { objective: 'Onboarding', directive: 'Enter Stable', tone: 'A definitive physical movement.' },
  { objective: 'Purchase', directive: 'Become an Owner', tone: 'Focuses on the heritage and result.' },
  { objective: 'Direct Action', directive: 'Acquire Units', tone: 'Clinical and professional.' },
];

const tailwindTokens = [
  { token: 'bg-background', value: 'var(--color-background) → #030303', usage: 'Page / surface base' },
  { token: 'text-foreground', value: 'rgba(255,255,255,0.5)', usage: 'Body text' },
  { token: 'text-heading', value: '#f8fafc', usage: 'Headings' },
  { token: 'text-muted', value: '#a1a1aa', usage: 'Secondary labels' },
  { token: 'border-border', value: 'rgba(255,255,255,0.1)', usage: 'Subtle dividers' },
  { token: 'text-gold', value: '#d4a964', usage: 'Premium monograms / CTAs' },
  { token: 'font-sans', value: 'Geist Sans', usage: 'UI and body' },
  { token: 'font-mono', value: 'Geist Mono', usage: 'Data, timings, ledgers' },
];

// ——— Components ———

function ColorCard({
  name,
  hex,
  usage,
  className,
}: {
  name: string;
  hex: string;
  usage?: string;
  className?: string;
}) {
  const isLight = hex.toLowerCase() === '#ffffff' || hex.toLowerCase() === '#f8f5f0' || hex.toLowerCase() === '#f5f5f5' || hex.toLowerCase() === '#e5e5e5';

  return (
    <div className={`group rounded-sm border border-border bg-surface-base hover:border-border hover:bg-white/[0.04] transition-all duration-500 ${className || ''}`}>
      <div
        className="h-24 rounded-t-sm relative cursor-pointer flex items-center justify-center"
        style={{ backgroundColor: hex }}
      >
        <span className={`text-[10px] font-mono uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity ${isLight ? 'text-black' : 'text-white'}`}>
          {hex}
        </span>
      </div>
      <div className="p-4">
        <p className="text-sm font-light text-heading">{name}</p>
        <p className="text-xs font-mono text-muted-foreground mt-1">{hex}</p>
        {usage && <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{usage}</p>}
      </div>
    </div>
  );
}

function SideNav() {
  return (
    <nav className="hidden lg:block fixed left-8 top-1/2 -translate-y-1/2 z-40">
      <ul className="space-y-3">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-white transition-colors duration-300 block py-1"
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function SectionHeading({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={`text-[28px] md:text-[36px] leading-[1.1] font-light tracking-tight text-white ${className || ''}`}>
      {children}
    </h2>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-4">
      {children}
    </h3>
  );
}

export default function BrandGuidelinesPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-canvas text-foreground">
        <SideNav />

        {/* Hero */}
        <header className="border-b border-border">
          <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-20 py-24 md:py-32">
            <p className="text-[11px] font-light tracking-[0.2em] uppercase text-muted-foreground mb-10">
              {BRAND_NAME}
            </p>
            <h1 className="text-[36px] md:text-[56px] leading-[1.1] text-white font-light tracking-tight mb-6">
              Brand Guidelines
            </h1>
            <p className="text-[16px] md:text-[18px] leading-[1.7] font-light text-white/65 max-w-2xl mb-10">
              A comprehensive guide to maintaining the Private Banker Standard across every Evolution Stables touchpoint — visual, verbal, and digital.
            </p>
            <a
              href="/_assets/brand/deploy/website/"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-frost hover:text-white hover:border-white/[0.24] hover:bg-white/[0.04] transition-all duration-500 text-[12px] uppercase tracking-[0.2em]"
            >
              <Download className="w-4 h-4" />
              Download Assets
            </a>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-20">
          {/* Brand Essentials */}
          <section id="brand-essentials" className="py-20 md:py-28 border-b border-border">
            <SectionHeading className="mb-12">Brand Essentials</SectionHeading>

            <div className="grid md:grid-cols-2 gap-12 md:gap-16 mb-16">
              <div>
                <SectionLabel>Brand Name</SectionLabel>
                <p className="text-[32px] md:text-[40px] font-light text-white tracking-tight mb-4">
                  {BRAND_NAME}
                </p>
                <p className="text-[14px] leading-[1.7] text-white/55">
                  Use title case. Never abbreviate, alter the wordmark, or add secondary descriptors to the logo.
                </p>
              </div>
              <div>
                <SectionLabel>Tagline</SectionLabel>
                <p className="text-[24px] md:text-[30px] font-light text-frost tracking-tight mb-4">
                  “{TAGLINE}”
                </p>
                <p className="text-[14px] leading-[1.7] text-white/55">
                  Reserved for hero moments and high-level brand statements. Never use for body copy.
                </p>
              </div>
            </div>

            <div>
              <SectionLabel>Core Attributes</SectionLabel>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { title: 'Private Banker Standard', desc: 'Professional, restrained, quietly authoritative.' },
                  { title: 'Heritage-Led', desc: 'The Thoroughbred, the trainer, and the yard come first.' },
                  { title: 'Data-Refined', desc: 'Sectional timings and ledgers speak before adjectives do.' },
                ].map((attr) => (
                  <div
                    key={attr.title}
                    className="rounded-sm border border-border bg-surface-base p-6 hover:border-border hover:bg-white/[0.04] transition-all duration-500"
                  >
                    <h4 className="text-[15px] font-light text-white mb-2">{attr.title}</h4>
                    <p className="text-[13px] leading-[1.6] text-muted-foreground">{attr.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Logo System */}
          <section id="logo-system" className="py-20 md:py-28 border-b border-border">
            <SectionHeading className="mb-12">Logo System</SectionHeading>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
              {logoColors.map((color) => (
                <div
                  key={color.label}
                  className={`rounded-sm border border-border p-8 flex flex-col items-center justify-center min-h-[220px] ${color.bg}`}
                >
                  <div className="relative h-10 w-auto mb-6">
                    <Image
                      src={color.lockup}
                      alt={`Evolution Stables ${color.label} lockup`}
                      width={240}
                      height={48}
                      className="h-full w-auto"
                    />
                  </div>
                  <p className={`text-[11px] uppercase tracking-[0.2em] ${color.bg === 'bg-white' ? 'text-black/50' : 'text-muted-foreground'}`}>
                    {color.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-12 md:gap-16 mb-16">
              <div>
                <SectionLabel>Clear Space</SectionLabel>
                <p className="text-[14px] leading-[1.7] text-white/55 mb-6">
                  Maintain clear space around the logo equal to the height of the “E” in Evolution. Do not crowd it with text, borders, or imagery.
                </p>
                <div className="inline-block rounded-sm border border-dashed border-border p-8 bg-surface-base">
                  <div className="border border-dashed border-gold/60 p-6">
                    <div className="relative h-12 w-auto">
                      <Image
                        src="/images/brand/lockups/white/lockup-horizontal-white.svg"
                        alt="Evolution Stables logo clear space"
                        width={200}
                        height={48}
                        className="h-full w-auto"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <SectionLabel>Minimum Sizes</SectionLabel>
                <div className="space-y-5">
                  <div className="flex items-center gap-5">
                    <div className="relative h-6 w-auto">
                      <Image
                        src="/images/brand/lockups/white/lockup-horizontal-white.svg"
                        alt="24px logo minimum"
                        width={120}
                        height={24}
                        className="h-full w-auto"
                      />
                    </div>
                    <span className="text-[13px] text-white/55">24px — Mobile header minimum</span>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="relative h-8 w-auto">
                      <Image
                        src="/images/brand/lockups/white/lockup-horizontal-white.svg"
                        alt="32px logo recommended"
                        width={160}
                        height={32}
                        className="h-full w-auto"
                      />
                    </div>
                    <span className="text-[13px] text-white/55">32px — Desktop header standard</span>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="relative h-12 w-12 bg-white/5 rounded-full flex items-center justify-center p-2.5">
                      <Image
                        src="/images/brand/monograms/white/monogram-white.svg"
                        alt="40px monogram"
                        width={40}
                        height={40}
                        className="h-full w-full"
                      />
                    </div>
                    <span className="text-[13px] text-white/55">40×40px — Standalone monogram (avatar / icon)</span>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="relative h-12 w-12 bg-white/5 rounded-full flex items-center justify-center p-2">
                      <Image
                        src="/images/brand/monograms/gold/monogram-gold.svg"
                        alt="48px monogram"
                        width={48}
                        height={48}
                        className="h-full w-full"
                      />
                    </div>
                    <span className="text-[13px] text-white/55">48×48px — Premium monogram (marketing / app icon)</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <SectionLabel>Logo Misuse</SectionLabel>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'No glows', style: { filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' } },
                  { label: 'No stretching', style: { transform: 'scaleX(1.5)' } },
                  { label: 'No rotation', style: { transform: 'rotate(12deg)' } },
                  { label: 'No low opacity (primary)', style: { opacity: 0.4 } },
                ].map((misuse, i) => (
                  <div key={i} className="rounded-sm border border-border bg-surface-base p-6 relative">
                    <div className="flex items-center justify-center h-16">
                      <div className="relative h-8 w-auto" style={misuse.style}>
                        <Image
                          src="/images/brand/lockups/white/lockup-horizontal-white.svg"
                          alt={misuse.label}
                          width={160}
                          height={32}
                          className="h-full w-auto"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground text-center mt-4 uppercase tracking-[0.15em]">
                      {misuse.label}
                    </p>
                    <div className="absolute top-3 right-3 w-5 h-5 border border-white/20 rounded-full flex items-center justify-center">
                      <span className="text-muted-foreground text-xs">✕</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Colour Palette */}
          <section id="color-palette" className="py-20 md:py-28 border-b border-border">
            <SectionHeading className="mb-2">Colour Palette</SectionHeading>
            <p className="text-[14px] text-white/55 mb-10">Click any swatch to copy the HEX value.</p>

            <div className="space-y-14">
              <div>
                <SectionLabel>Velvet Night — Core Neutrals</SectionLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {coreNeutrals.map((color) => (
                    <ColorCard key={color.name} {...color} />
                  ))}
                </div>
              </div>

              <div>
                <SectionLabel>Gold Accent</SectionLabel>
                <div className="grid grid-cols-2 md:grid-cols-4">
                  <ColorCard {...goldAccent} />
                </div>
                <p className="text-[13px] leading-[1.7] text-muted-foreground mt-4">
                  Gold is reserved for monograms and premium structural details. Never use it for body text or standard wording.
                </p>
              </div>

              <div>
                <SectionLabel>Backup Palettes (Opt-in per campaign)</SectionLabel>
                <div className="grid md:grid-cols-3 gap-4">
                  {backupPalettes.map((palette) => (
                    <div key={palette.name} className="rounded-sm border border-border bg-surface-base p-5">
                      <div className="flex gap-2 mb-4">
                        <div className="h-10 flex-1 rounded-t-sm" style={{ backgroundColor: palette.bg }} />
                        <div className="h-10 flex-1 rounded-t-sm" style={{ backgroundColor: palette.surface }} />
                        <div className="h-10 flex-1 rounded-t-sm" style={{ backgroundColor: palette.fg }} />
                      </div>
                      <p className="text-sm font-light text-white mb-1">{palette.name}</p>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-[0.15em] mb-3">{palette.note}</p>
                      <div className="space-y-1 font-mono text-[11px] text-muted-foreground">
                        <p>bg {palette.bg}</p>
                        <p>surface {palette.surface}</p>
                        <p>fg {palette.fg}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Typography */}
          <section id="typography" className="py-20 md:py-28 border-b border-border">
            <SectionHeading className="mb-12">Typography</SectionHeading>

            <div className="grid md:grid-cols-2 gap-12 md:gap-16 mb-16">
              <div>
                <SectionLabel>Primary Font</SectionLabel>
                <p className="text-[40px] font-light tracking-tight text-white mb-3">Geist Sans</p>
                <p className="text-[14px] leading-[1.7] text-white/55">
                  The engine for all headings, body copy, and UI elements.
                </p>
              </div>
              <div>
                <SectionLabel>Data & Code</SectionLabel>
                <p className="text-[40px] font-mono tracking-tight text-white mb-3">Geist Mono</p>
                <p className="text-[14px] leading-[1.7] text-white/55">
                  Used for sectional timings, odds, ledgers, hashes, and ticker data.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 md:gap-16 mb-16">
              <div>
                <SectionLabel>Editorial Hero</SectionLabel>
                <p className="text-[40px] tracking-tight text-white mb-3" style={{ fontFamily: 'serif' }}>
                  Instrument Serif
                </p>
                <p className="text-[14px] leading-[1.7] text-white/55">
                  Reserved for high-impact headlines and pitch-deck hero sections. Use sparingly.
                </p>
              </div>
              <div>
                <SectionLabel>Brand Mark</SectionLabel>
                <p className="text-[40px] tracking-tight text-white mb-3">Bw Gradual</p>
                <p className="text-[14px] leading-[1.7] text-white/55">
                  Strictly for logo wordmarks. Never use for UI typing or body copy.
                </p>
              </div>
            </div>

            <div>
              <SectionLabel>Type Scale</SectionLabel>
              <div className="rounded-sm border border-border bg-surface-base p-6 md:p-10 space-y-8">
                <div className="border-b border-border pb-6">
                  <p className="text-[11px] text-muted-foreground mb-2 font-mono">H1 — 56px / Light / -0.02em</p>
                  <p className="text-[36px] md:text-[56px] leading-[1.1] font-light tracking-tight text-white">
                    Own the future of racing
                  </p>
                </div>
                <div className="border-b border-border pb-6">
                  <p className="text-[11px] text-muted-foreground mb-2 font-mono">H2 — 36px / Light / -0.02em</p>
                  <p className="text-[28px] md:text-[36px] leading-[1.2] font-light tracking-tight text-white">
                    Digital-syndication, refined
                  </p>
                </div>
                <div className="border-b border-border pb-6">
                  <p className="text-[11px] text-muted-foreground mb-2 font-mono">H3 — 24px / Light / -0.02em</p>
                  <p className="text-[22px] md:text-[24px] font-light tracking-tight text-white">
                    Heritage-led ownership
                  </p>
                </div>
                <div className="border-b border-border pb-6">
                  <p className="text-[11px] text-muted-foreground mb-2 font-mono">Body — 16px / Light / 1.7</p>
                  <p className="text-[16px] leading-[1.7] font-light text-white/65">
                    We speak with the Private Banker Standard: professional but not stuffy, analytical but not cold, confident but not arrogant, and visionary but grounded.
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-2 font-mono">Data — 14px / Mono / 1.5</p>
                  <p className="text-[14px] leading-[1.5] font-mono text-frost">
                    0.8m win · soft ground · final 600m 33.42s
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Voice & Tone */}
          <section id="voice-tone" className="py-20 md:py-28 border-b border-border">
            <SectionHeading className="mb-12">Voice & Tone</SectionHeading>

            <p className="text-[16px] md:text-[18px] leading-[1.7] font-light text-white/65 max-w-3xl mb-12">
              We speak with the <span className="text-gold">Private Banker Standard</span>: professional but not stuffy, analytical but not cold, confident but not arrogant, and visionary but grounded. Active voice always. British English spelling. No exclamation marks or hype.
            </p>

            <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-16">
              <div className="rounded-sm border border-border bg-surface-base p-8">
                <h3 className="text-[11px] uppercase tracking-[0.2em] text-gold mb-6">We Are</h3>
                <ul className="space-y-3">
                  {weAre.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[14px] text-frost">
                      <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-sm border border-border bg-surface-base p-8">
                <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-6">We Are Not</h3>
                <ul className="space-y-3">
                  {weAreNot.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[14px] text-frost">
                      <span className="text-muted-foreground shrink-0">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mb-16">
              <SectionLabel>Vocabulary Standard</SectionLabel>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-3 pr-4 text-[11px] uppercase tracking-[0.2em] text-gold font-normal">Approved Term</th>
                      <th className="py-3 pl-4 text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-normal">Banned / Discouraged</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vocabulary.map((row) => (
                      <tr key={row.approved} className="border-b border-border">
                        <td className="py-3 pr-4 text-[14px] text-heading">{row.approved}</td>
                        <td className="py-3 pl-4 text-[14px] text-muted-foreground">{row.banned}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-16">
              {writingRules.map((item) => (
                <div key={item.rule} className="rounded-sm border border-border bg-surface-base p-6">
                  <p className="text-[14px] font-light text-white mb-2">{item.rule}</p>
                  <p className="text-[13px] text-muted-foreground">“{item.example}”</p>
                </div>
              ))}
            </div>

            <div>
              <SectionLabel>Translation Formulas</SectionLabel>
              <div className="space-y-4">
                {translations.map((t, i) => (
                  <div key={i} className="rounded-sm border border-border bg-surface-base p-6 md:p-8">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Before</p>
                    <p className="text-[14px] leading-[1.6] text-white/55 mb-4">{t.before}</p>
                    <div className="h-px bg-white/[0.06] mb-4" />
                    <p className="text-[11px] uppercase tracking-[0.2em] text-gold mb-3">After</p>
                    <p className="text-[14px] leading-[1.6] text-heading">{t.after}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Logic */}
          <section id="cta-logic" className="py-20 md:py-28 border-b border-border">
            <SectionHeading className="mb-12">CTA Logic</SectionHeading>

            <p className="text-[16px] leading-[1.7] font-light text-white/65 max-w-3xl mb-12">
              We provide access, not sales pitches. The directive changes with the funnel layer — from spectator to participant.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ctas.map((cta) => (
                <div key={cta.directive} className="rounded-sm border border-border bg-surface-base p-6 hover:border-border hover:bg-white/[0.04] transition-all duration-500">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">{cta.objective}</p>
                  <p className="text-[22px] font-light text-white tracking-tight mb-3">{cta.directive}</p>
                  <p className="text-[12px] leading-[1.6] text-muted-foreground">{cta.tone}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Developer Reference */}
          <section id="developer-reference" className="py-20 md:py-28">
            <SectionHeading className="mb-12">Developer Reference</SectionHeading>

            <div className="grid md:grid-cols-2 gap-12 md:gap-16">
              <div className="rounded-sm border border-border bg-surface-base p-6 md:p-8">
                <SectionLabel>Tailwind Tokens</SectionLabel>
                <div className="space-y-3">
                  {tailwindTokens.map((token) => (
                    <div key={token.token} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3 last:border-0 last:pb-0">
                      <div>
                        <code className="text-[13px] font-mono text-gold">{token.token}</code>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{token.usage}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[12px] font-mono text-frost">{token.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <div className="rounded-sm border border-border bg-surface-base p-6 md:p-8">
                  <SectionLabel>Spacing Grid</SectionLabel>
                  <p className="text-[14px] leading-[1.7] text-white/55 mb-4">
                    All layouts, component padding, and margins align to an 8px grid.
                  </p>
                  <div className="grid grid-cols-4 gap-2 font-mono text-[11px] text-frost">
                    {['8px', '16px', '24px', '32px', '48px', '64px', '96px', '128px'].map((s) => (
                      <div key={s} className="rounded-sm bg-surface-base py-2 text-center">{s}</div>
                    ))}
                  </div>
                </div>

                <div className="rounded-sm border border-border bg-surface-base p-6 md:p-8">
                  <SectionLabel>Asset Paths</SectionLabel>
                  <div className="space-y-2 font-mono text-[12px] text-frost">
                    <p>/images/brand/lockups/{'{color}'}/lockup-horizontal-{'{color}'}.svg</p>
                    <p>/images/brand/lockups/{'{color}'}/lockup-vertical-{'{color}'}.svg</p>
                    <p>/images/brand/monograms/{'{color}'}/monogram-{'{color}'}.svg</p>
                    <p>/images/brand/wordmarks/{'{color}'}/wordmark-{'{color}'}.svg</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
