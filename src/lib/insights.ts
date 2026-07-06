export interface InsightArticle {
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  authorTitle: string;
  date: string;
  excerpt: string;
  heroImage: string;
  linkedinUrl?: string;
  body: {
    type: 'paragraph' | 'heading' | 'quote' | 'list' | 'subheading' | 'image';
    text?: string;
    items?: string[];
    src?: string;
    alt?: string;
  }[];
}

export const insightArticles: InsightArticle[] = [
  {
    slug: 'everyone-talking-rwas-we-deliver-them',
    title: "Everyone's been talking about RWAs. We deliver them.",
    subtitle: 'Prudentia (NZ) · Asset ID 10 · Q1/Q2 2026 Quarterly Investor Report',
    author: 'Alex Baddeley',
    authorTitle: 'Founder, Evolution Stables',
    date: '2026-07-06',
    excerpt:
      'The real-world asset conversation has been running for years. What has been largely absent is the part that actually matters: returns from the asset, calculated under regulation, and settled directly to investor wallets. This month, Evolution Stables shipped investor reporting.',
    heroImage: '/images/content/horses/prudentia-action.png',
    linkedinUrl:
      'https://www.linkedin.com/pulse/everyones-been-talking-rwas-we-deliver-them-alex-baddeley-sldze/',
    body: [
      {
        type: 'image',
        src: '/images/content/insights/prudentia-report-composite.png',
        alt: 'Prudentia Q1/Q2 2026 Quarterly Investor Report — race-by-race performance, financial summary, and investor returns documented across dual jurisdictions.',
      },
      {
        type: 'paragraph',
        text: 'The real-world asset conversation has been running for years. Whitepapers, conference panels, framework documents, pilot programmes. The thesis is sound — real assets, fractionalised, governed, with income flowing to holders.',
      },
      {
        type: 'heading',
        text: 'What has been largely absent is twofold.',
      },
      {
        type: 'paragraph',
        text: 'First, high-quality, regulated real-world assets that are actually ready for investors — not crypto proxies, not stablecoins dressed as returns, not speculative wrappers around assets that were never built to perform. There is plenty of interest in what tokenisation might offer. There are far fewer assets worth underwriting.',
      },
      {
        type: 'paragraph',
        text: 'Second, the part that matters once you have one: returns from the asset, calculated under regulation, and settled directly to investor wallets. Their wallet, their discretion.',
      },
      {
        type: 'quote',
        text: 'Tokenisation was never the hard part. Finding assets that deserve it — and getting returns into wallets — was.',
      },
      {
        type: 'paragraph',
        text: 'This month, Evolution Stables published its first quarterly investor report for Prudentia (NZ) — Asset ID 10 — and completed our first settlement to holders under the digital-syndication model. We shipped investor reporting.',
      },
      {
        type: 'subheading',
        text: 'What delivery looks like',
      },
      {
        type: 'paragraph',
        text: 'Prudentia is a New Zealand Thoroughbred syndicated through Evolution Stables and distributed via regulated infrastructure operated by Tokinvest. She is Asset ID 10 in a portfolio approach to digital-syndication — not a one-off offering, but a traceable, reportable asset with ongoing obligations.',
      },
      {
        type: 'paragraph',
        text: 'In the first half of 2026, Prudentia ran five races under Lance O\u2019Sullivan and Andrew Scott at Wexford Stables. She won once, placed twice, and stepped from Rating 65 to Rating 75. That is the on-track context. The operational story is what happened to the stakes she earned.',
      },
      {
        type: 'paragraph',
        text: 'Those earnings were settled by New Zealand Thoroughbred Racing. They were then processed through the syndication settlement waterfall, calculated with full methodology disclosed, and credited directly to holders\u2019 digital wallets.',
      },
      {
        type: 'paragraph',
        text: 'Executed settlement, documented in a quarterly report that holders can read, retain, and reconcile.',
      },
      {
        type: 'subheading',
        text: 'The reporting standard',
      },
      {
        type: 'list',
        items: [
          'Race-by-race performance and stakes breakdown',
          'Full settlement calculation with methodology disclosed',
          'Carry-forward policy and treatment of final-month earnings',
          'Regulatory disclosures from both jurisdictions',
          'Institutional layout and presentation',
        ],
      },
      {
        type: 'paragraph',
        text: 'The report is co-published by Evolution Stables, an authorised NZTR syndicator, and Tokinvest FZCO, licensed by the Dubai Virtual Assets Regulatory Authority (VARA).',
      },
      {
        type: 'paragraph',
        text: 'Two jurisdictions. One auditable trail from racetrack to wallet.',
      },
      {
        type: 'subheading',
        text: 'How the structure is built',
      },
      {
        type: 'paragraph',
        text: 'Evolution Stables originates and manages each asset through a disciplined selection process. Thoroughbreds are vetted for quality, campaign readiness, and proximity to racing — assets chosen to perform, not to populate a catalogue.',
      },
      {
        type: 'paragraph',
        text: 'The syndication structure is built to protect investors from capital calls. Race-day costs — jockey, trainer, nominations — are handled within the ownership framework so holders are not asked to fund operating expenses on top of their stake.',
      },
      {
        type: 'paragraph',
        text: 'Settlement is calculated, disclosed, and executed through regulated cross-border infrastructure. Evolution Stables leads the asset and the reporting. Tokinvest operates the distribution rails. The report documents both.',
      },
      {
        type: 'paragraph',
        text: 'Asset ID 10 is not a label. It signals portfolio thinking: traceable assets, recurring reporting cycles, and a standard that scales.',
      },
      {
        type: 'subheading',
        text: 'Why this matters now',
      },
      {
        type: 'paragraph',
        text: 'The RWA thesis is sound in principle: real assets, fractionalised, governed, with income flowing to holders. The gap has always been execution — the last mile of turning asset activity into delivered returns, with documentation that holds up under scrutiny.',
      },
      {
        type: 'paragraph',
        text: 'Sports and passion assets are institutionalising. Family offices, allocators, and advisors are looking at experiential categories with the same questions they ask of private markets: governance, transparency, reporting discipline, and proof that income reaches holders.',
      },
      {
        type: 'paragraph',
        text: 'A performing asset class treated with private-markets reporting standards — digital-syndication that reflects what a modern investor expects from ownership: documented, regulated, and delivered on schedule.',
      },
      {
        type: 'subheading',
        text: 'Syndication 2.0',
      },
      {
        type: 'image',
        src: '/images/content/insights/prudentia-quote-syndication-2.0.png',
        alt: 'Digital-syndication changes the ownership experience without changing what the asset is. — Alex Baddeley, Founder, Evolution Stables',
      },
      {
        type: 'paragraph',
        text: 'Thoroughbred syndication has operated largely unchanged for decades.',
      },
      {
        type: 'quote',
        text: 'Digital-syndication changes the ownership experience without changing what the asset is.',
      },
      {
        type: 'paragraph',
        text: 'The Thoroughbred still runs. The trainer still trains. The governing body still settles the stakes. What changes is everything around it: how ownership is structured, how returns are calculated, how reporting is delivered, and how regulation spans jurisdictions when capital is global.',
      },
      {
        type: 'paragraph',
        text: 'Prudentia is the first full cycle. It will not be the last.',
      },
      {
        type: 'subheading',
        text: 'What comes next',
      },
      {
        type: 'paragraph',
        text: 'Prudentia proves the model. The work ahead is scaling it. Evolution Stables will continue the winter programme at Rating 75, with performance updates between quarterly reports and the next full financial summary and settlement scheduled for Q3 2026.',
      },
      {
        type: 'paragraph',
        text: 'Through the Dubai Digital Syndication programme — in partnership with Tokinvest and validated by the Dubai Racing Club — we are extending structured, regulated digital ownership into new markets and new assets. More syndicates. More settlements. The same reporting standard.',
      },
      {
        type: 'paragraph',
        text: 'Prudentia delivered on the track. The structure delivered for investors.',
      },
      {
        type: 'paragraph',
        text: 'If you are an investor, advisor, or industry participant interested in how regulated fractional ownership and digital-syndication work in practice — particularly for alternative assets that most people would not think of as investable — I would welcome the conversation.',
      },
      {
        type: 'paragraph',
        text: 'This is what doing looks like.',
      },
    ],
  },
];

export function getInsightArticle(slug: string): InsightArticle | undefined {
  return insightArticles.find((a) => a.slug === slug);
}