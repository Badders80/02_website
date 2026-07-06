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
  category?: 'Guide' | 'Press' | 'Race Report' | 'Team';
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
    category: 'Guide',
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
  {
    slug: 'racing-goes-digital-businessdesk',
    title: 'NZ Racing Goes Digital: BusinessDesk Reports on Industry Transformation',
    subtitle: 'External press coverage and what it means for Evolution Stables',
    author: 'Evolution Stables',
    authorTitle: '',
    date: '2024-10-28',
    excerpt: 'BusinessDesk reported on New Zealand racing\'s shift toward digital ownership models, profiling Evolution Stables as one of the local operators reframing how thoroughbred syndicates are structured and accessed. The article notes the industry\'s broader move to attract younger, digitally native owners through transparent, technology-enabled participation. For Evolution Stables, the coverage signals early recognition that its regulated digital-syndication model is being watched as part of the sector\'s modernisation rather than a fringe experiment.',
    heroImage: '/images/press/businessdesk-bringing-racing-into-digital-age.webp',
    category: 'Press',
    body: [
      {
        type: 'paragraph',
        text: 'BusinessDesk reported on New Zealand racing\'s shift toward digital ownership models, profiling Evolution Stables as one of the local operators reframing how thoroughbred syndicates are structured and accessed. The article notes the industry\'s broader move to attract younger, digitally native owners through transparent, technology-enabled participation. For Evolution Stables, the coverage signals early recognition that its regulated digital-syndication model is being watched as part of the sector\'s modernisation rather than a fringe experiment.',
      },
      {
        type: 'paragraph',
        text: 'Read the original BusinessDesk article: https://businessdesk.co.nz/article/technology/bringing-racing-into-the-digital-age',
      },
    ],
  },
  {
    slug: 'thoroughbred-investment-new-frontier',
    title: 'Thoroughbred Investment: The New Frontier for NZ Investors',
    subtitle: 'External press coverage and what it means for Evolution Stables',
    author: 'Evolution Stables',
    authorTitle: '',
    date: '2025-01-16',
    excerpt: 'BusinessDesk followed up with a piece positioning digital investment in thoroughbreds as a new frontier for New Zealand investors. The reporting placed Evolution Stables in the context of regulated, asset-backed alternatives that sit outside traditional equities and property. The article framed the opportunity around accessibility, governance, and the ability to participate in a real-world asset class with lower minimums than conventional ownership. For Evolution Stables, the second BusinessDesk mention confirms the story has moved beyond launch coverage into investor-interest territory.',
    heroImage: '/images/press/businessdesk-bringing-racing-into-digital-age.webp',
    category: 'Press',
    body: [
      {
        type: 'paragraph',
        text: 'BusinessDesk followed up with a piece positioning digital investment in thoroughbreds as a new frontier for New Zealand investors. The reporting placed Evolution Stables in the context of regulated, asset-backed alternatives that sit outside traditional equities and property. The article framed the opportunity around accessibility, governance, and the ability to participate in a real-world asset class with lower minimums than conventional ownership. For Evolution Stables, the second BusinessDesk mention confirms the story has moved beyond launch coverage into investor-interest territory.',
      },
      {
        type: 'paragraph',
        text: 'Read the original BusinessDesk article: https://businessdesk.co.nz/article/sport/digital-investment-in-thoroughbred-horses-the-new-frontier',
      },
    ],
  },
  {
    slug: 'ownership-reimagined-trackside',
    title: 'Racehorse Ownership Reimagined: Trackside Features Evolution Stables',
    subtitle: 'External press coverage and what it means for Evolution Stables',
    author: 'Evolution Stables',
    authorTitle: '',
    date: '2024-11-15',
    excerpt: 'Trackside covered Evolution Stables\' effort to reimagine racehorse ownership for a contemporary audience. The feature described how digital-syndication opens participation to a wider base of racing fans without replacing the core experience of trainer, horse, and racetrack. For Evolution Stables, Trackside coverage matters because it reaches the existing racing audience and explains the model in language familiar to traditional owners.',
    heroImage: '/images/press/trackside.webp',
    category: 'Press',
    body: [
      {
        type: 'paragraph',
        text: 'Trackside covered Evolution Stables\' effort to reimagine racehorse ownership for a contemporary audience. The feature described how digital-syndication opens participation to a wider base of racing fans without replacing the core experience of trainer, horse, and racetrack. For Evolution Stables, Trackside coverage matters because it reaches the existing racing audience and explains the model in language familiar to traditional owners.',
      },
      {
        type: 'paragraph',
        text: 'Read the original Trackside article: https://trackside.co.nz/article/thoroughbred-ownership-reimagined',
      },
    ],
  },
  {
    slug: 'tokinvest-singularry-partnership',
    title: 'Regulated Real-World Asset Investing Goes Mainstream',
    subtitle: 'External press coverage and what it means for Evolution Stables',
    author: 'Evolution Stables',
    authorTitle: '',
    date: '2024-12-19',
    excerpt: 'Investing.com reported on the partnership between Tokinvest and Singularry SuperApp to make regulated real-world asset investing more accessible. The article described the infrastructure layer that allows fractional interests in regulated assets to be offered, held, and settled through compliant marketplaces. For Evolution Stables, the partnership is relevant because Tokinvest is the distribution and settlement partner behind its digital-syndication programme, and the Singularry integration extends reach into a broader user base.',
    heroImage: '/images/press/investing-com.webp',
    category: 'Press',
    body: [
      {
        type: 'paragraph',
        text: 'Investing.com reported on the partnership between Tokinvest and Singularry SuperApp to make regulated real-world asset investing more accessible. The article described the infrastructure layer that allows fractional interests in regulated assets to be offered, held, and settled through compliant marketplaces. For Evolution Stables, the partnership is relevant because Tokinvest is the distribution and settlement partner behind its digital-syndication programme, and the Singularry integration extends reach into a broader user base.',
      },
      {
        type: 'paragraph',
        text: 'Read the original Investing.com article: https://www.investing.com/news/cryptocurrency-news/tokinvest-and-singularry-superapp-partner-to-make-regulated-realworld-asset-investing-accessible-to-everyone-4316762',
      },
    ],
  },
  {
    slug: 'evolution-tokinvest-dubai-world-cup',
    title: 'Evolution Stables and Tokinvest: NZ Meets Dubai',
    subtitle: 'External press coverage and what it means for Evolution Stables',
    author: 'Evolution Stables',
    authorTitle: '',
    date: '2025-01-10',
    excerpt: 'Arabian Business reported that New Zealand\'s Evolution Stables had teamed up with Tokinvest to offer digital racehorse leases ahead of the Dubai World Cup. The article highlighted the cross-border nature of the arrangement and the timing of the launch around one of racing\'s premier international events. For Evolution Stables, the coverage marked the first prominent regional-market acknowledgment of its Dubai programme and positioned the model as a bridge between New Zealand racing assets and global capital.',
    heroImage: '/images/press/arabian-business.webp',
    category: 'Press',
    body: [
      {
        type: 'paragraph',
        text: 'Arabian Business reported that New Zealand\'s Evolution Stables had teamed up with Tokinvest to offer digital racehorse leases ahead of the Dubai World Cup. The article highlighted the cross-border nature of the arrangement and the timing of the launch around one of racing\'s premier international events. For Evolution Stables, the coverage marked the first prominent regional-market acknowledgment of its Dubai programme and positioned the model as a bridge between New Zealand racing assets and global capital.',
      },
      {
        type: 'paragraph',
        text: 'Read the original Arabian Business article: https://www.arabianbusiness.com/gcc/uae/new-zealands-evolution-stables-teams-up-with-tokinvest-for-tokenised-racehorse-leases-ahead-of-dubai-world-cup',
      },
    ],
  },
  {
    slug: 'tokinvest-appointed-launch',
    title: 'Tokinvest Appointed to Launch Racehorse Leases',
    subtitle: 'External press coverage and what it means for Evolution Stables',
    author: 'Evolution Stables',
    authorTitle: '',
    date: '2025-04-04',
    excerpt: 'Tokinvest announced that it had been appointed to launch racehorse leases in partnership with Evolution Stables. The release described how Tokinvest\'s regulated marketplace would host the offerings, handle onboarding, and manage settlement for lease participants. For Evolution Stables, the appointment formalised the operating partnership and made clear that its assets would be distributed through a VARA-regulated venue.',
    heroImage: '/images/press/tokinvest.webp',
    category: 'Press',
    body: [
      {
        type: 'paragraph',
        text: 'Tokinvest announced that it had been appointed to launch racehorse leases in partnership with Evolution Stables. The release described how Tokinvest\'s regulated marketplace would host the offerings, handle onboarding, and manage settlement for lease participants. For Evolution Stables, the appointment formalised the operating partnership and made clear that its assets would be distributed through a VARA-regulated venue.',
      },
      {
        type: 'paragraph',
        text: 'Read the original Tokinvest article: https://tokinvest.capital/insights-and-news/tokinvest-and-evolution-stables',
      },
    ],
  },
  {
    slug: 'tokinvest-raises-3-2m',
    title: 'Tokinvest Raises Pre-Seed Funding for RWA Platform',
    subtitle: 'External press coverage and what it means for Evolution Stables',
    author: 'Evolution Stables',
    authorTitle: '',
    date: '2025-09-30',
    excerpt: 'FinTech Global reported that Tokinvest raised $3.2 million in pre-seed funding to expand its real-world asset platform. The article noted that the capital would support product development, licensing, and market expansion for regulated fractional ownership. For Evolution Stables, Tokinvest\'s funding round is a supporting signal: the marketplace through which its digital-syndication offerings are distributed has backing to maintain infrastructure, compliance, and operational scale.',
    heroImage: '/images/press/fintech-global.webp',
    category: 'Press',
    body: [
      {
        type: 'paragraph',
        text: 'FinTech Global reported that Tokinvest raised $3.2 million in pre-seed funding to expand its real-world asset platform. The article noted that the capital would support product development, licensing, and market expansion for regulated fractional ownership. For Evolution Stables, Tokinvest\'s funding round is a supporting signal: the marketplace through which its digital-syndication offerings are distributed has backing to maintain infrastructure, compliance, and operational scale.',
      },
      {
        type: 'paragraph',
        text: 'Read the original FinTech Global article: https://fintech.global/2025/09/30/tokinvest-raises-3-2m-pre-seed-for-rwa-platform/',
      },
    ],
  },
  {
    slug: 'vara-multi-asset-licence',
    title: 'VARA Issues First Multi-Asset Licence',
    subtitle: 'External press coverage and what it means for Evolution Stables',
    author: 'Evolution Stables',
    authorTitle: '',
    date: '2025-10-03',
    excerpt: 'Gulf Business reported that Tokinvest had received a multi-asset issuance licence from the Dubai Virtual Assets Regulatory Authority (VARA). The article described the licence as a first for the jurisdiction and noted that it would allow the platform to issue a broader range of asset-backed offerings under a single regulatory umbrella. For Evolution Stables, the licence is the compliance foundation that enables its Dubai programme to operate under a recognised regulatory framework.',
    heroImage: '/images/press/gulf-business.jpg',
    category: 'Press',
    body: [
      {
        type: 'paragraph',
        text: 'Gulf Business reported that Tokinvest had received a multi-asset issuance licence from the Dubai Virtual Assets Regulatory Authority (VARA). The article described the licence as a first for the jurisdiction and noted that it would allow the platform to issue a broader range of asset-backed offerings under a single regulatory umbrella. For Evolution Stables, the licence is the compliance foundation that enables its Dubai programme to operate under a recognised regulatory framework.',
      },
      {
        type: 'paragraph',
        text: 'Read the original Gulf Business article: https://gulfbusiness.com/tokinvest-gets-vara-multi-asset-issuance-licence/',
      },
    ],
  },
  {
    slug: 'dubai-racing-club-tokinvest',
    title: 'Dubai Racing Club Partners with Tokinvest',
    subtitle: 'External press coverage and what it means for Evolution Stables',
    author: 'Evolution Stables',
    authorTitle: '',
    date: '2026-01-20',
    excerpt: 'Tokinvest announced a partnership with the Dubai Racing Club to develop digital ownership products around racehorse assets. The release described how the collaboration would connect racing with regulated, technology-enabled participation structures for a broader ownership base. For Evolution Stables, the partnership matters because the Dubai Racing Club\'s involvement adds institutional validation to the same digital-syndication model it has been operating with Tokinvest.',
    heroImage: '/images/press/tokinvest.webp',
    category: 'Press',
    body: [
      {
        type: 'paragraph',
        text: 'Tokinvest announced a partnership with the Dubai Racing Club to develop digital ownership products around racehorse assets. The release described how the collaboration would connect racing with regulated, technology-enabled participation structures for a broader ownership base. For Evolution Stables, the partnership matters because the Dubai Racing Club\'s involvement adds institutional validation to the same digital-syndication model it has been operating with Tokinvest.',
      },
      {
        type: 'paragraph',
        text: 'Read the original Tokinvest article: https://tokinvest.capital/insights-and-news/tokinvest-and-dubai-racing-club',
      },
    ],
  },
  {
    slug: 'rwa-digital-syndication-racing',
    title: 'Real-World Asset Digital Syndication Comes to Racing',
    subtitle: 'External press coverage and what it means for Evolution Stables',
    author: 'Evolution Stables',
    authorTitle: '',
    date: '2025-04-06',
    excerpt: 'Ledger Insights covered Tokinvest\'s move into racehorse-backed real-world assets with Evolution Stables. The article described the structure of the lease product and the way regulated infrastructure connects asset performance to digital ownership records. For Evolution Stables, the coverage in a publication focused on enterprise and institutional digital assets underscored that the model is being observed by regulated-asset observers rather than speculative markets.',
    heroImage: '/images/press/tokinvest.webp',
    category: 'Press',
    body: [
      {
        type: 'paragraph',
        text: 'Ledger Insights covered Tokinvest\'s move into racehorse-backed real-world assets with Evolution Stables. The article described the structure of the lease product and the way regulated infrastructure connects asset performance to digital ownership records. For Evolution Stables, the coverage in a publication focused on enterprise and institutional digital assets underscored that the model is being observed by regulated-asset observers rather than speculative markets.',
      },
      {
        type: 'paragraph',
        text: 'Read the original Ledger Insights article: https://www.ledgerinsights.com/tokinvest-rwa-tokenization-race-horse/',
      },
    ],
  },
  {
    slug: 'founder-focus-nz-entrepreneur',
    title: 'From Farm to Founder: Building Evolution Stables',
    subtitle: 'External press coverage and what it means for Evolution Stables',
    author: 'Evolution Stables',
    authorTitle: '',
    date: '2024-12-01',
    excerpt: 'NZ Entrepreneur featured the founder story behind Evolution Stables, tracing the path from farm background to building a regulated digital-syndication platform for thoroughbred ownership. The profile described the motivation to modernise syndication while retaining the integrity of the racing industry. For Evolution Stables, the founder-focused coverage added a local entrepreneurial angle to its public narrative.',
    heroImage: '',
    category: 'Press',
    body: [
      {
        type: 'paragraph',
        text: 'NZ Entrepreneur featured the founder story behind Evolution Stables, tracing the path from farm background to building a regulated digital-syndication platform for thoroughbred ownership. The profile described the motivation to modernise syndication while retaining the integrity of the racing industry. For Evolution Stables, the founder-focused coverage added a local entrepreneurial angle to its public narrative.',
      },
      {
        type: 'paragraph',
        text: 'Read the original NZ Entrepreneur article: https://nzentrepreneur.co.nz/evolution-stables/',
      },
    ],
  },
  {
    slug: 'tokenize-racehorses-lara',
    title: 'How Digital Racehorse Leases Work',
    subtitle: 'External press coverage and what it means for Evolution Stables',
    author: 'Evolution Stables',
    authorTitle: '',
    date: '2025-04-06',
    excerpt: 'Lara on the Block explained the mechanics of the Tokinvest and Evolution Stables racehorse lease product. The article broke down how regulated digital-syndication allows participants to access the economics of a racehorse lease without taking on the operational burdens of traditional ownership. For Evolution Stables, the explainer-style coverage helps prospective participants understand the structure before engaging.',
    heroImage: '',
    category: 'Press',
    body: [
      {
        type: 'paragraph',
        text: 'Lara on the Block explained the mechanics of the Tokinvest and Evolution Stables racehorse lease product. The article broke down how regulated digital-syndication allows participants to access the economics of a racehorse lease without taking on the operational burdens of traditional ownership. For Evolution Stables, the explainer-style coverage helps prospective participants understand the structure before engaging.',
      },
      {
        type: 'paragraph',
        text: 'Read the original Lara on the Block article: https://laraontheblock.com/tokinvest-and-evolution-stables-tokenize-racehorses/',
      },
    ],
  },
  {
    slug: 'prudentia-pukekohe-april-2026',
    title: 'Prudentia Returns at Pukekohe',
    subtitle: 'Race report from the Evolution Stables stable',
    author: 'Evolution Stables',
    authorTitle: '',
    date: '2026-04-01',
    excerpt: 'Prudentia returns to the 1400m trip at Pukekohe Park on 1 April 2026, looking to build on a promising recent effort over the same distance.',
    heroImage: '/images/content/horses/prudentia-action.png',
    category: 'Race Report',
    body: [
      {
        type: 'paragraph',
        text: 'Prudentia heads to Pukekohe Park on Wednesday, 1 April 2026, for the Mount Shop 1400. After a solid fifth at Tauranga, where she made up significant ground late, the step back up to 1400m is expected to suit her.',
      },
      {
        type: 'paragraph',
        text: 'The Wexford Stables team reports that the mare has stripped fitter for that run. She jumps from barrier 7 with Masa Hashizume in the saddle and carries 56kg in the Rating 60 contest. The plan is to find a rhythmic position early before asking for a final effort.',
      },
      {
        type: 'paragraph',
        text: 'Trainer Lance O\'Sullivan and Andrew Scott have the mare in excellent order, and she is expected to be competitive at the business end if she gets the run of the race.',
      },
    ],
  },
  {
    slug: 'prudentia-te-rapa-preparation-april-2026',
    title: 'Prudentia Prepares for Te Rapa Second-Up',
    subtitle: 'Race report from the Evolution Stables stable',
    author: 'Evolution Stables',
    authorTitle: '',
    date: '2026-04-12',
    excerpt: 'Prudentia\'s early April campaign required patience as weather forced a shift from Pukekohe to a rescheduled Te Rapa meeting.',
    heroImage: '/images/content/horses/prudentia-action.png',
    category: 'Race Report',
    body: [
      {
        type: 'paragraph',
        text: 'Prudentia was originally entered for Pukekohe on 1 April, but the meeting was abandoned due to weather before she could line up. The Wexford Stables team regrouped and targeted Te Rapa on 12 April for her resumption.',
      },
      {
        type: 'paragraph',
        text: 'That plan shifted again when New Zealand Thoroughbred Racing postponed the Te Rapa meeting to Friday, 17 April, due to severe weather concerns. While the delay is frustrating, it keeps Prudentia fresh and on track for a proper resumption.',
      },
      {
        type: 'paragraph',
        text: 'She has accepted for the BM65 over 1300m, and the stable are confident she will strip fitter for the extra week.',
      },
      {
        type: 'quote',
        text: 'Due to safety concerns regarding the severe weather forecast, NZTR have elected to move the Te Rapa meeting to Friday the 17th of April. We will be in touch in the new week if there are any further changes. — Wexford Stables',
      },
    ],
  },
  {
    slug: 'prudentia-maiden-win-te-rapa',
    title: 'Prudentia Breaks Through: Maiden Win at Te Rapa',
    subtitle: 'Race report from the Evolution Stables stable',
    author: 'Evolution Stables',
    authorTitle: '',
    date: '2026-04-17',
    excerpt: 'Prudentia delivered her maiden victory for Evolution Stables at Te Rapa on 17 April 2026, taking out the 1300m BM65 in convincing fashion.',
    heroImage: '/images/content/horses/prudentia-action.png',
    category: 'Race Report',
    body: [
      {
        type: 'paragraph',
        text: 'Prudentia won the 1300m BM65 at Te Rapa on Friday, 17 April. Drawn barrier 8 with 56kg, she settled into the race under Masahiro Hashizume and found the line strongly to win by 0.3 lengths. The time of 1:20.580 confirmed the quality of the performance.',
      },
      {
        type: 'paragraph',
        text: 'The result came at her third start for the stable and followed a deliberate preparation. After the scratching at Pukekohe the previous week due to weather, the Wexford Stables team elected to press on at Te Rapa rather than wait. Starting at $10.60, she outstayed Fleeting Star and Amusement in the closing stages.',
      },
      {
        type: 'quote',
        text: 'She\'s taken the next step up. Once you\'re in a maiden and you\'ve got to go the next step — it was a good performance. We\'re gonna take another step up now into 75, which is never easy, but time also helps them as they get a bit more stronger, a bit more mature. — Lance O\'Sullivan, Wexford Stables',
      },
    ],
  },
  {
    slug: 'prudentia-bm75-company-may-2026',
    title: 'Prudentia Steps Up to BM75 Company at Te Rapa',
    subtitle: 'Race report from the Evolution Stables stable',
    author: 'Evolution Stables',
    authorTitle: '',
    date: '2026-05-02',
    excerpt: 'Prudentia finished third in the BM75 at Te Rapa on 2 May 2026, confirming she is competitive at the higher grade.',
    heroImage: '/images/content/horses/prudentia-action.png',
    category: 'Race Report',
    body: [
      {
        type: 'paragraph',
        text: 'Prudentia lined up at Te Rapa on Saturday, 2 May, stepping up to Benchmark 75 company for the first time in the 1400m event. She drew barrier 1 with 54kg and settled into a hotly contested race under Masahiro Hashizume.',
      },
      {
        type: 'paragraph',
        text: 'The mare found the line strongly to finish third, just 0.3 lengths behind the winner Overdrawn and 0.1 lengths off second-placed Merchant Queen. Starting at $14.10, she outran her odds and confirmed she is competitive at this level.',
      },
      {
        type: 'paragraph',
        text: 'The margin was tight — the first six across the line were separated by less than a length — and Prudentia was right in the finish against seasoned opposition. She pulled up well after the run, and the stable assessed her next target in the coming days.',
      },
    ],
  },
  {
    slug: 'prudentia-wexford-video-update-may-2026',
    title: 'Inside Wexford Stables: Prudentia Video Update',
    subtitle: 'Race report from the Evolution Stables stable',
    author: 'Evolution Stables',
    authorTitle: '',
    date: '2026-05-12',
    excerpt: 'Wexford Stables shared a video training update for Prudentia on 12 May 2026, providing a visual look at her condition and training progression.',
    heroImage: '/images/content/horses/prudentia-action.png',
    category: 'Race Report',
    body: [
      {
        type: 'paragraph',
        text: 'The Wexford Stables team shared a new video update for Prudentia, providing insight into her current condition and training progression. The video was recorded on 12 May 2026 and features trainers Lance O\'Sullivan and Andrew Scott.',
      },
      {
        type: 'paragraph',
        text: 'The update marks the first formal video briefing since her acquisition and gives owners a valuable look at how she is settling into her environment at one of New Zealand\'s premier racing establishments.',
      },
      {
        type: 'paragraph',
        text: 'No specific race target had been announced at the time of the update, but these regular briefings demonstrate the stable\'s commitment to keeping owners closely connected with the development programme.',
      },
      {
        type: 'quote',
        text: 'We\'re pleased to share this visual update on Prudentia\'s progress as she continues her preparation. — Lance O\'Sullivan and Andrew Scott, Wexford Stables',
      },
    ],
  },
  {
    slug: 'prudentia-te-rapa-review-june-2026',
    title: 'Te Rapa Review: Prudentia Finishes Tenaciously in BM75',
    subtitle: 'Race report from the Evolution Stables stable',
    author: 'Evolution Stables',
    authorTitle: '',
    date: '2026-06-02',
    excerpt: 'Prudentia finished fifth at Te Rapa on 30 May 2026 in a traffic-heavy BM75 sprint, but came out of the race sound and in peak fitness.',
    heroImage: '/images/content/horses/prudentia-action.png',
    category: 'Race Report',
    body: [
      {
        type: 'paragraph',
        text: 'Prudentia put in a strong effort at Te Rapa on Saturday, 30 May, though her fifth-place finish does not tell the full story. Jumping cleanly from barrier 1, she was immediately positioned on the fence.',
      },
      {
        type: 'paragraph',
        text: 'As the field bunched around the bend, she became pocketed along the rail, leaving her with nowhere to stretch her stride. She travelled comfortably but spent the straight held up behind a wall of thoroughbreds, only finding a sliver of daylight in the final 100 metres. Once clear, she surged through the line with late speed to finish fifth.',
      },
      {
        type: 'paragraph',
        text: 'On 2 June, the Wexford yard conducted a comprehensive post-race assessment. Trainers Lance O\'Sullivan and Andrew Scott report that she trotted up completely soundly. An endoscopy scoped clean, showing clear airways, and she fully cleared her feed box. Because she was so heavily held up, she did not have a hard run and comes out of the weekend in peak fitness.',
      },
      {
        type: 'paragraph',
        text: 'Lance and Andrew planned to keep her active, targeting another Benchmark 75 event over 1200m or 1400m in late June, where her heavy-track pedigree would serve her well.',
      },
    ],
  },
  {
    slug: 'prudentia-tauranga-pivot-june-2026',
    title: 'Campaign Pivot: Prudentia Targets Tauranga',
    subtitle: 'Race report from the Evolution Stables stable',
    author: 'Evolution Stables',
    authorTitle: '',
    date: '2026-06-10',
    excerpt: 'Prudentia was withdrawn from her planned 13 June engagement due to minor front-foot soreness, with the campaign pivoted to Tauranga on 27 June.',
    heroImage: '/images/content/horses/prudentia-action.png',
    category: 'Race Report',
    body: [
      {
        type: 'paragraph',
        text: 'Prudentia has been withdrawn from her planned Saturday engagement due to minor front-foot soreness. While recovering well, the timing has interrupted her galloping schedule.',
      },
      {
        type: 'paragraph',
        text: 'Rider Noel reported she did not feel fully fluid on Wednesday. Having missed key gallop sessions, she will not race without preparation, instead maintaining fitness via swimming.',
      },
      {
        type: 'paragraph',
        text: 'The disruption to her training means she has run out of runway for the weekend. The yard is pivoting her campaign to a Rating 75 event at Tauranga on 27 June, using swimming work in the interim to maintain fitness.',
      },
    ],
  },
  {
    slug: 'prudentia-tauranga-result-june-2026',
    title: 'Tauranga Result: Prudentia Sixth on Testing Ground',
    subtitle: 'Race report from the Evolution Stables stable',
    author: 'Evolution Stables',
    authorTitle: '',
    date: '2026-06-27',
    excerpt: 'Prudentia finished sixth in Race 7 at Tauranga on 27 June 2026, a BM75 over 1400m on a Heavy 10 track.',
    heroImage: '/images/content/horses/prudentia-action.png',
    category: 'Race Report',
    body: [
      {
        type: 'paragraph',
        text: 'Prudentia finished sixth in Race 7 at Tauranga on Saturday, 27 June. The event was a BM75 over 1400m run on a Heavy 10 track.',
      },
      {
        type: 'paragraph',
        text: 'From barrier 1 at 54kg with Masa Hashizume in the saddle, she ran on strongly through the testing card, but did not have her usual kick in the home straight. Rocking won by 0.89 lengths; Prudentia crossed the line 4.59 lengths back in sixth.',
      },
      {
        type: 'paragraph',
        text: 'A fuller yard report with trainer and jockey comments was to follow after the race.',
      },
    ],
  },
  {
    slug: 'prudentia-tauranga-review-june-2026',
    title: 'Tauranga Review: Yard Reports Prudentia Fine',
    subtitle: 'Race report from the Evolution Stables stable',
    author: 'Evolution Stables',
    authorTitle: '',
    date: '2026-06-28',
    excerpt: 'Prudentia tried hard on puggier ground at Tauranga on 27 June 2026, finishing sixth. The yard reports she has pulled up fine.',
    heroImage: '/images/content/horses/prudentia-action.png',
    category: 'Race Report',
    body: [
      {
        type: 'paragraph',
        text: 'Prudentia finished sixth in Race 7 at Tauranga on Saturday, 27 June, on ground that turned puggier through the card. From barrier 1, she jumped cleanly with Masa Hashizume in the saddle.',
      },
      {
        type: 'paragraph',
        text: 'Rocking won by 0.89 lengths; Prudentia crossed the line 4.59 lengths back in sixth. The card began on Heavy 10 footing, but as the afternoon wore on the surface grew stickier — a very different proposition from the looser ground on which she broke her maiden at the same track last May. Masa stayed on the rail where the winners were coming from, yet it proved a day when ground was hard to make.',
      },
      {
        type: 'quote',
        text: 'She tried really hard — but today she just found that ground a little bit too testing. It was really holding. What she won here last time was pretty loose. — Andrew Scott, Wexford Stables',
      },
      {
        type: 'paragraph',
        text: 'Masa reported that every time she tried to stretch, she got stuck in the mud. Andrew Scott confirms she had a blow post-race, though the effort will do her good. Kyle Bax reports she is fine this evening. If she has a good week, the yard will look to back her up the following Saturday at Te Rapa over 1400m, a track she has already won on.',
      },
    ],
  },
  {
    slug: 'prudentia-q1q2-2026-quarterly-report',
    title: 'Prudentia Q1/Q2 2026: Five Starts, One Win, First Settlement',
    subtitle: 'Race report from the Evolution Stables stable',
    author: 'Evolution Stables',
    authorTitle: '',
    date: '2026-07-04',
    excerpt: 'Prudentia\'s first quarterly investor report is now available, covering five starts, one win, two placings, and the first settlement to holders.',
    heroImage: '/images/content/horses/prudentia-action.png',
    category: 'Race Report',
    body: [
      {
        type: 'paragraph',
        text: 'The first quarterly investor report for Prudentia is now available. This quarter, Prudentia ran five races under Lance O\'Sullivan and Andrew Scott at Wexford Stables. She won once at Te Rapa, placed twice, and stepped from Rating 65 to Rating 75.',
      },
      {
        type: 'paragraph',
        text: 'The report covers race-by-race performance and stakes breakdown, full settlement calculation with methodology disclosed, carry-forward policy and treatment of final-month earnings, and regulatory disclosures from both jurisdictions.',
      },
      {
        type: 'paragraph',
        text: 'Settlement has been completed and credited to holders\' digital wallets. The next full financial summary and settlement is scheduled for Q3 2026. Performance updates will continue between quarterly reports as the winter programme progresses at Rating 75.',
      },
    ],
  },
  {
    slug: 'first-gear-otaki-preparation-dec-2025',
    title: 'First Gear Set for Otaki Return',
    subtitle: 'Race report from the Evolution Stables stable',
    author: 'Evolution Stables',
    authorTitle: '',
    date: '2025-12-11',
    excerpt: 'First Gear is being prepared for a Rating 65 over 1200m at Otaki on 19 December 2025, following encouraging signs over the sprint trip.',
    heroImage: '/images/content/horses/FirstGear-BG.png',
    category: 'Race Report',
    body: [
      {
        type: 'paragraph',
        text: 'First Gear has come through his recent racing assignment in good order, with trainer Stephen Gray reporting that the gelding is doing well since the run and appears bright in himself.',
      },
      {
        type: 'paragraph',
        text: 'Looking back at his performance on 22 November, it was a pivotal turning point for his maturity. Despite a tricky trip where he was caught three-wide early and had to work hard to find cover, he stuck to the task and hit the line impressively. The strategy to ride him quietly paid off; he was more relaxed and happier, and raced genuinely on the good track compared to previous outings.',
      },
      {
        type: 'paragraph',
        text: 'While there was a brief discussion about stepping him up to 1400m immediately, jockey Bruno Queiroz felt the horse learned from the experience but advised staying at the sprint distance is the better move right now.',
      },
      {
        type: 'paragraph',
        text: 'The plan is set for the Rating 65 over 1200m at Otaki on 19 December. The timing places him just before Christmas with enough time to freshen up afterwards.',
      },
    ],
  },
  {
    slug: 'first-gear-otaki-race-day-dec-2025',
    title: 'Otaki R6: First Gear Heads to the Gates',
    subtitle: 'Race report from the Evolution Stables stable',
    author: 'Evolution Stables',
    authorTitle: '',
    date: '2025-12-19',
    excerpt: 'First Gear lines up in Race 6 at Otaki on 19 December 2025, with moisture in the track expected to suit his rhythm.',
    heroImage: '/images/content/horses/FirstGear-BG.png',
    category: 'Race Report',
    body: [
      {
        type: 'paragraph',
        text: 'First Gear lines up in Race 6 at Otaki on Friday, 19 December. The track has taken moisture, which Stephen Gray notes will take the fire out of the surface and should provide ideal footing for First Gear to find his rhythm early.',
      },
      {
        type: 'paragraph',
        text: 'The tactical plan is direct: roll forward from the jump to secure a handy position just behind the speed. Bruno Queiroz is booked to ride.',
      },
      {
        type: 'quote',
        text: 'He\'s done really well, I expect a good run out of him today. Bruno on board, he\'s worked up well. — Stephen Gray',
      },
      {
        type: 'paragraph',
        text: 'With the horse looking ready to go, the stable expects him to be competitive in what looks like a well-placed assignment.',
      },
    ],
  },
  {
    slug: 'first-gear-otaki-review-dec-2025',
    title: 'Distance the Key for First Gear After Otaki',
    subtitle: 'Race report from the Evolution Stables stable',
    author: 'Evolution Stables',
    authorTitle: '',
    date: '2025-12-22',
    excerpt: 'First Gear earned a pass mark at Otaki on 19 December 2025 despite a tough map, and the stable is now looking to step him up in distance.',
    heroImage: '/images/content/horses/FirstGear-BG.png',
    category: 'Race Report',
    body: [
      {
        type: 'paragraph',
        text: 'First Gear\'s performance at Otaki on Friday earned a pass mark from trainer Stephen Gray, despite a racing map that went against him from the jump. After being trapped three-wide without cover for much of the 1200m journey, the gelding showed heart to keep finding under pressure.',
      },
      {
        type: 'paragraph',
        text: 'The way he laid in over the final stages suggests he has reached his top-end speed at the sprint trips and is now looking for more ground to use his action.',
      },
      {
        type: 'quote',
        text: 'Looking at his pedigree and the type of horse he is, I think he\'s probably looking for the 1400 or even the mile. — Stephen Gray',
      },
      {
        type: 'paragraph',
        text: 'The team leaves Otaki encouraged by his condition and ready to reset for a target that suits his pedigree.',
      },
    ],
  },
  {
    slug: 'first-gear-january-2026-review',
    title: 'First Gear: Tough Run on Soft Going',
    subtitle: 'Race report from the Evolution Stables stable',
    author: 'Evolution Stables',
    authorTitle: '',
    date: '2026-01-02',
    excerpt: 'First Gear produced a disappointing run at Tauherenikau on a Soft 5 track, and the stable is evaluating gear and rider options to spark his form.',
    heroImage: '/images/content/horses/FirstGear-BG.png',
    category: 'Race Report',
    body: [
      {
        type: 'paragraph',
        text: 'It was a disappointing result at Tauherenikau for First Gear. The stable went in with the expectation of a return to form, but the performance was average and leaves plenty to consider regarding his future.',
      },
      {
        type: 'paragraph',
        text: 'The track was rated a Soft 5. While he has handled similar conditions previously, he never seemed to find his rhythm. The ride did not go to plan; the instructions were to jump and trail to give him every opportunity, but the execution left the team frustrated at the top of the straight.',
      },
      {
        type: 'paragraph',
        text: 'Options under consideration include gear changes, specifically adding blinkers, and a potential change of rider. Ultimately, it was a tough watch for investors and supporters alike.',
      },
    ],
  },
  {
    slug: 'first-gear-retirement-march-2026',
    title: 'First Gear Retires: A Career in Review',
    subtitle: 'Race report from the Evolution Stables stable',
    author: 'Evolution Stables',
    authorTitle: '',
    date: '2026-03-03',
    excerpt: 'First Gear has been retired. The lease concludes early, and the remaining balance is expected to be returned to investors via Tokinvest wallets once final trainer billing is confirmed.',
    heroImage: '/images/content/horses/FirstGear-BG.png',
    category: 'Race Report',
    body: [
      {
        type: 'paragraph',
        text: 'First Gear has been retired, triggering the early conclusion of the lease under the syndicate agreement. The final trainer statement had not yet been received at the time of the update, with billing typically running four to six weeks behind.',
      },
      {
        type: 'paragraph',
        text: 'Once the final balance is confirmed and passed to Tokinvest, the remaining funds will be deposited into the wallet attached to each investor\'s Tokinvest account. From there, investors will be able to withdraw the funds or reinvest into other offerings on the platform.',
      },
      {
        type: 'paragraph',
        text: 'It was an emotional campaign, and while the potential was clear, potential does not guarantee performance on the track.',
      },
      {
        type: 'list',
        items: [
          'Status: thoroughbred retired',
          'Return: approximately five months of lease balance',
          'Distribution: via Tokinvest wallet',
          'Next update: once official confirmation from the trainer is received',
        ],
      },
    ],
  },
  {
    slug: 'how-much-does-it-cost-to-own-a-racehorse-in-nz',
    title: 'How Much Does It Cost to Own a Racehorse in New Zealand?',
    subtitle: 'Educational guide for prospective and current thoroughbred owners',
    author: 'Evolution Stables',
    authorTitle: '',
    date: '2026-07-06',
    excerpt: 'Owning a thoroughbred in New Zealand involves more than the purchase price. Understanding the ongoing costs helps set realistic expectations before committing to ownership.',
    heroImage: '/images/content/horses/prudentia-action.png',
    category: 'Guide',
    body: [
      {
        type: 'heading',
        text: 'The true cost of thoroughbred ownership in New Zealand',
      },
      {
        type: 'paragraph',
        text: 'Owning a racehorse in New Zealand is often described as a dream, but the financial reality matters. Before buying a thoroughbred, prospective owners should understand both the upfront outlay and the ongoing costs that continue whether the horse wins, places, or runs unplaced.',
      },
      {
        type: 'subheading',
        text: 'Initial purchase price',
      },
      {
        type: 'paragraph',
        text: 'The purchase price depends on age, pedigree, conformation, and vendor. A yearling at public auction can range from a few thousand dollars to six figures for premium bloodstock. In addition to the hammer price, buyers pay the bloodstock agent\'s commission, transport, and insurance. Some owners purchase tried thoroughbreds already racing, which may command a higher initial price but reduce the waiting period before a first start.',
      },
      {
        type: 'subheading',
        text: 'Monthly training fees',
      },
      {
        type: 'paragraph',
        text: 'Training fees are the largest regular expense. A thoroughbred in full training with a New Zealand trainer typically costs between $3,000 and $5,000 per month, depending on the stable, location, and level of service. This covers trackwork, feed, stabling, basic farriery, and routine care. Veterinary costs, specialised shoeing, and race-day expenses are usually billed separately.',
      },
      {
        type: 'subheading',
        text: 'Race-day and nomination costs',
      },
      {
        type: 'paragraph',
        text: 'Each race entry incurs nomination and acceptance fees, transport to the track, jockey fees, and gear such as rugs and boots. These costs vary by meeting and distance, but owners should budget for them across a campaign. A horse racing every few weeks can add several hundred dollars per start in direct race-day costs.',
      },
      {
        type: 'subheading',
        text: 'Veterinary and ancillary care',
      },
      {
        type: 'paragraph',
        text: 'Soundness is everything in racing. Veterinary costs can include routine vaccinations, dental work, diagnostic imaging, and treatment for minor injuries. Some thoroughbreds require ongoing management such as chiropractic care, acupuncture, or specialised farriery. These costs are unpredictable but should be factored into annual budgeting.',
      },
      {
        type: 'subheading',
        text: 'Insurance and administration',
      },
      {
        type: 'paragraph',
        text: 'Mortality and major medical insurance premiums are based on the horse\'s value and age. Owners also pay registration and syndication administration costs, including New Zealand Thoroughbred Racing fees, syndicate management, and any technology platform used for investor reporting or distributions.',
      },
      {
        type: 'subheading',
        text: 'How syndication changes the cost profile',
      },
      {
        type: 'paragraph',
        text: 'Syndication divides these costs among multiple owners. Instead of one person funding the entire horse, participants contribute a share of the purchase price and pay their portion of ongoing expenses. This makes thoroughbred ownership accessible at a lower entry point, though each owner remains exposed to the same cost categories proportionally.',
      },
      {
        type: 'paragraph',
        text: 'Before entering any ownership arrangement, prospective owners should review the syndicate agreement, understand how bills are calculated, and confirm what is included in the monthly fee versus billed separately. Clear cost disclosure is the foundation of a well-run syndicate.',
      },
    ],
  },
  {
    slug: 'racehorse-syndication-explained-nz',
    title: 'Racehorse Syndication Explained: A New Zealand Owner\'s Guide',
    subtitle: 'Educational guide for prospective and current thoroughbred owners',
    author: 'Evolution Stables',
    authorTitle: '',
    date: '2026-07-06',
    excerpt: 'Racehorse syndication allows multiple people to share the costs and experience of owning a thoroughbred in New Zealand. Here is how it works in practice.',
    heroImage: '/images/content/horses/prudentia-action.png',
    category: 'Guide',
    body: [
      {
        type: 'heading',
        text: 'What is racehorse syndication?',
      },
      {
        type: 'paragraph',
        text: 'Racehorse syndication is the practice of dividing ownership of a thoroughbred into multiple shares. Instead of one owner funding the entire purchase and ongoing costs, a syndicate allows a group of people to participate according to the percentage they hold. Each owner receives a proportionate share of prize money, owner privileges, and racing experience.',
      },
      {
        type: 'subheading',
        text: 'How syndicates are structured',
      },
      {
        type: 'paragraph',
        text: 'In New Zealand, syndicates are regulated by New Zealand Thoroughbred Racing. A licensed syndicator is responsible for forming the syndicate, managing the paperwork, collecting contributions, paying bills, and distributing any returns to owners. The syndicator acts as the single point of contact between the trainer and the group of owners.',
      },
      {
        type: 'paragraph',
        text: 'A syndicate can be formed as a partnership, a company, or through a licensed syndication service. The structure determines how tax, liability, and voting rights are handled. Prospective owners should read the syndicate rules carefully before committing.',
      },
      {
        type: 'subheading',
        text: 'What owners receive',
      },
      {
        type: 'list',
        items: [
          'A defined percentage share of the thoroughbred',
          ' proportional share of prize money after deductions',
          'Access to stable updates, race previews, and post-race reports',
          'Invitations to trackwork, barrier trials, and raceday hospitality when available',
          'Voting rights on major decisions, depending on the syndicate structure',
        ],
      },
      {
        type: 'subheading',
        text: 'Costs and responsibilities',
      },
      {
        type: 'paragraph',
        text: 'Owners pay an upfront contribution that covers the purchase of the horse and establishment costs. After that, ongoing fees are usually levied monthly or quarterly to cover training, veterinary care, race-day expenses, and administration. A well-run syndicate provides regular financial reporting so owners know where their money is going.',
      },
      {
        type: 'subheading',
        text: 'Digital-syndication in New Zealand',
      },
      {
        type: 'paragraph',
        text: 'Digital-syndication applies the same ownership model through technology-enabled infrastructure. Reporting, subscriptions, and distributions can be managed through regulated platforms, giving owners a clearer view of their holding and reducing administrative friction. The thoroughbred still trains, races, and earns prize money in the same way; the difference is in how ownership is recorded and communicated.',
      },
      {
        type: 'paragraph',
        text: 'Syndication does not remove the risks of racing. Thoroughbreds can be injured, fail to measure up, or retire early. What syndication does is make those risks shared, transparent, and manageable for people who want to participate without bearing the full cost alone.',
      },
    ],
  },
  {
    slug: 'how-prize-money-works-in-nz-racing',
    title: 'How Prize Money Works in New Zealand Racing',
    subtitle: 'Educational guide for prospective and current thoroughbred owners',
    author: 'Evolution Stables',
    authorTitle: '',
    date: '2026-07-06',
    excerpt: 'Prize money in New Zealand thoroughbred racing is distributed through a defined process. Understanding that process helps owners know what to expect after race day.',
    heroImage: '/images/content/horses/prudentia-action.png',
    category: 'Guide',
    body: [
      {
        type: 'heading',
        text: 'Prize money distribution in New Zealand racing',
      },
      {
        type: 'paragraph',
        text: 'New Zealand Thoroughbred Racing sets the prize money for each race and distributes it according to a published scale. Prize money is usually paid to the first five placegetters, with the winner receiving the largest share and each subsequent place receiving a smaller portion.',
      },
      {
        type: 'subheading',
        text: 'From racecourse to owner',
      },
      {
        type: 'paragraph',
        text: 'After a race, the stakes are processed by New Zealand Thoroughbred Racing and paid into the nominated owner or syndicate account. The timing depends on the meeting and administrative processing, but it typically follows a predictable cycle. If the horse is syndicated, the syndicator receives the payment and then allocates it to owners according to their share.',
      },
      {
        type: 'subheading',
        text: 'Deductions before distribution',
      },
      {
        type: 'paragraph',
        text: 'Before prize money reaches individual owners, several deductions are usually made. These can include the trainer\'s percentage, jockey fees, stable expenses related to the race, bloodstock agent commissions where applicable, and administration fees. What remains is distributed to owners in proportion to their ownership percentage.',
      },
      {
        type: 'subheading',
        text: 'Syndicate settlements',
      },
      {
        type: 'paragraph',
        text: 'A licensed syndicator is responsible for calculating each owner\'s share, deducting applicable costs, and distributing the net amount. Good syndicators provide a settlement statement showing gross stakes, itemised deductions, and the net amount per share. This transparency is important for owners who want to understand the economics of their investment.',
      },
      {
        type: 'subheading',
        text: 'How digital-syndication changes delivery',
      },
      {
        type: 'paragraph',
        text: 'Under digital-syndication, the same prize-money calculation applies, but the settlement can be delivered directly to an owner\'s account or wallet through a regulated platform. The calculation method does not change; only the speed and traceability of delivery improve.',
      },
      {
        type: 'paragraph',
        text: 'Owners should always ask how prize money is calculated, when settlements are made, and what deductions apply. Clear answers are a sign of a well-managed ownership arrangement.',
      },
    ],
  },
  {
    slug: 'digital-vs-traditional-syndication',
    title: 'Digital Syndication vs Traditional Syndication',
    subtitle: 'Educational guide for prospective and current thoroughbred owners',
    author: 'Evolution Stables',
    authorTitle: '',
    date: '2026-07-06',
    excerpt: 'Digital-syndication and traditional syndication both divide thoroughbred ownership into shares. The difference lies in how ownership is recorded, reported, and settled.',
    heroImage: '/images/content/horses/prudentia-action.png',
    category: 'Guide',
    body: [
      {
        type: 'heading',
        text: 'Comparing syndication models',
      },
      {
        type: 'paragraph',
        text: 'Traditional racehorse syndication has operated in New Zealand for decades. A licensed syndicator forms a group, collects funds, manages the horse, and distributes any prize money to owners. Digital-syndication follows the same legal and regulatory framework but uses technology to improve access, transparency, and settlement efficiency.',
      },
      {
        type: 'subheading',
        text: 'Ownership structure',
      },
      {
        type: 'paragraph',
        text: 'In both models, ownership is divided into shares. Traditional syndicates may record ownership through paper registers, spreadsheets, or trust deeds. Digital-syndication records ownership through a regulated platform, giving each participant a clear, auditable record of their holding.',
      },
      {
        type: 'subheading',
        text: 'Reporting and communication',
      },
      {
        type: 'paragraph',
        text: 'Traditional syndicates typically communicate through email, phone, and occasional newsletters. Digital-syndication platforms provide standardised reporting, including race previews, post-race analysis, financial summaries, and settlement statements. The information is the same; the format and regularity differ.',
      },
      {
        type: 'subheading',
        text: 'Settlements',
      },
      {
        type: 'paragraph',
        text: 'In a traditional syndicate, prize money is paid into a trust or syndicate account and then transferred to individual owners by bank transfer or cheque. Digital-syndication delivers the same net settlement through a regulated platform, often with faster reconciliation and a transparent audit trail. The regulatory obligations remain identical.',
      },
      {
        type: 'subheading',
        text: 'Access and scale',
      },
      {
        type: 'paragraph',
        text: 'Digital-syndication can lower the minimum participation threshold, making thoroughbred ownership available to a broader audience. It can also operate across jurisdictions, provided the platform holds the appropriate licences. Traditional syndication remains a proven model, particularly for local groups who prefer direct relationships with the trainer and syndicator.',
      },
      {
        type: 'paragraph',
        text: 'Neither model changes the underlying asset. The thoroughbred still trains, races, and earns prize money under New Zealand Thoroughbred Racing rules. The choice between models depends on how owners prefer to interact with their investment.',
      },
    ],
  },
  {
    slug: 'how-to-buy-a-racehorse-share-in-nz',
    title: 'How to Buy a Racehorse Share in New Zealand',
    subtitle: 'Educational guide for prospective and current thoroughbred owners',
    author: 'Evolution Stables',
    authorTitle: '',
    date: '2026-07-06',
    excerpt: 'Buying a racehorse share in New Zealand involves choosing a syndicator, understanding the offering, and completing the subscription process.',
    heroImage: '/images/content/horses/prudentia-action.png',
    category: 'Guide',
    body: [
      {
        type: 'heading',
        text: 'Steps to buying a racehorse share',
      },
      {
        type: 'paragraph',
        text: 'Buying a share in a New Zealand thoroughbred is more accessible than many people assume. The process is regulated by New Zealand Thoroughbred Racing and typically follows a clear sequence from selection to subscription.',
      },
      {
        type: 'subheading',
        text: '1. Choose a licensed syndicator',
      },
      {
        type: 'paragraph',
        text: 'New Zealand Thoroughbred Racing licenses syndicators who are authorised to offer shares in racehorses. A licensed syndicator is responsible for compliance, financial management, and owner communication. Prospective owners should verify that the operator holds a current licence.',
      },
      {
        type: 'subheading',
        text: '2. Review the offering',
      },
      {
        type: 'paragraph',
        text: 'Each syndicate offering will describe the horse, the trainer, the share price, the ongoing fees, and the terms of participation. Review the syndicate agreement, the fee schedule, and any risk disclosures. Pay attention to what is included in the purchase price and what is billed separately.',
      },
      {
        type: 'subheading',
        text: '3. Complete identity verification',
      },
      {
        type: 'paragraph',
        text: 'Depending on the platform, buyers may need to complete know-your-customer checks before subscribing. This is standard for regulated investment products and helps protect both the syndicator and other owners.',
      },
      {
        type: 'subheading',
        text: '4. Subscribe and pay',
      },
      {
        type: 'paragraph',
        text: 'Once approved, the buyer subscribes for a share and pays the subscription amount. The syndicator then records the ownership interest and begins providing updates. Some platforms accept payment through bank transfer, card, or regulated digital payment rails.',
      },
      {
        type: 'subheading',
        text: '5. Receive updates and settlements',
      },
      {
        type: 'paragraph',
        text: 'After purchase, owners receive stable updates, race previews, and post-race reports. When the horse earns prize money, the syndicator calculates each owner\'s share and distributes the net amount according to the syndicate agreement.',
      },
      {
        type: 'paragraph',
        text: 'Buying a racehorse share is not a guaranteed investment. Thoroughbreds can be injured, fail to perform, or retire early. Prospective owners should participate for the experience as much as the financial outcome and should only commit money they can afford to lose.',
      },
    ],
  },
  {
    slug: 'team-evolution',
    title: 'Team Evolution: The People Behind the Thoroughbreds',
    subtitle: 'The trainers, bloodstock advisors, and regulated marketplace partners that power the Evolution Stables programme',
    author: 'Evolution Stables',
    authorTitle: '',
    date: '2026-07-06',
    excerpt: 'Evolution Stables works with a small group of specialist partners: Wexford Stables, Stephen Gray Racing, B.A.X Bloodstock, and Tokinvest.',
    heroImage: '/images/content/stables/prudentia-action.png',
    category: 'Team',
    body: [
      {
        type: 'paragraph',
        text: 'Evolution Stables is an authorised syndicator with New Zealand Thoroughbred Racing (NZTR). Authorised syndicators are approved by NZTR to publicly offer and manage shares in thoroughbred racehorses for the general public. This status requires compliance with the Bloodstock Syndicator Code of Practice, rigorous disclosure statements, and oversight to ensure transparency, investor protection, and proper management of syndicates.',
      },
      {
        type: 'paragraph',
        text: 'By operating as a digital-first authorised syndicator, Evolution Stables combines traditional racing expertise with modern digital-syndication ownership. This model lowers barriers to entry, enhances liquidity through regulated secondary markets, and provides investors with transparent performance tracking, compliance, and shared ownership in high-quality thoroughbreds.',
      },
      {
        type: 'heading',
        text: 'Wexford Stables — Lance O\'Sullivan ONZM and Andrew Scott, Matamata',
      },
      {
        type: 'paragraph',
        text: 'Wexford Stables is a world-class training facility in Matamata, the heart of New Zealand\'s thoroughbred industry. Led by 12-time champion jockey Lance O\'Sullivan ONZM and experienced trainer Andrew Scott, the partnership has delivered over 600 wins together, including multiple Group and Listed race victories. Lance enjoyed a stellar riding career with 2,479 wins, highlighted by his 1989 Japan Cup triumph aboard Horlicks. Andrew Scott has trained over 1,000 winners and previously worked under prominent trainers before forming the partnership in 2006.',
      },
      {
        type: 'paragraph',
        text: 'Wexford Stables manages the training, trackwork, and raceday preparation for Evolution Stables\' thoroughbreds, including campaign planning for athletes like Prudentia. Their deep local knowledge, state-of-the-art facilities, and proven record in producing top performers make them a cornerstone of our racing operations.',
      },
      {
        type: 'heading',
        text: 'Stephen Gray Racing — Copper Belt Lodge, Palmerston North',
      },
      {
        type: 'paragraph',
        text: 'Stephen Gray Racing operates from Copper Belt Lodge in Awahuri, near Palmerston North. Stephen, in partnership with his father Kevin, brings 24 years of international success from Singapore, where he developed a reputation for patience with stayers and late-maturing types. The family returned to New Zealand in 2024 to base operations at the lodge they acquired in 2006.',
      },
      {
        type: 'paragraph',
        text: 'Known for strategic development of thoroughbreds suited to longer trips, Stephen Gray Racing informed key decisions such as stepping up First Gear in distance. Their expertise in building staying power and international perspective complements our portfolio, delivering thoughtful, long-term racing strategies.',
      },
      {
        type: 'heading',
        text: 'B.A.X Bloodstock — Kylie Bax, Owner-Manager',
      },
      {
        type: 'paragraph',
        text: 'B.A.X Bloodstock Achieving Xcellence Limited, led by owner-manager Kylie Bax, provides specialist bloodstock advisory services. Kylie transitioned from an international modelling career to become a respected figure in New Zealand thoroughbred breeding and syndication. Through B.A.X, she sources high-quality thoroughbreds, manages syndication teams, and races her own string with a focus on attitude, pedigree, and athletic potential.',
      },
      {
        type: 'paragraph',
        text: 'Kylie advises Evolution Stables on bloodstock acquisition and sales strategy, ensuring our syndicates feature thoroughbreds aligned with targeted racing campaigns. Her hands-on experience as both buyer and syndicator adds a sharp commercial and breeding eye to the team.',
      },
      {
        type: 'heading',
        text: 'Tokinvest — VARA-Licensed Marketplace Partner',
      },
      {
        type: 'paragraph',
        text: 'Tokinvest is a pioneering, VARA-regulated real-world asset marketplace based in Dubai. It holds one of the first full multi-asset issuance licences from the Dubai Virtual Assets Regulatory Authority (VARA), enabling compliant digital-syndication, brokerage, and global distribution of assets. Tokinvest provides the technology backbone for Evolution Stables\' digital-syndication, handling investor onboarding, ownership records, KYC/AML compliance, settlements, and secondary market liquidity.',
      },
      {
        type: 'paragraph',
        text: 'This partnership delivers regulated, financial-grade infrastructure that bridges traditional racing with accessible, digital-syndication ownership — making high-calibre racehorse investment available to a broader audience while maintaining full compliance.',
      },
      {
        type: 'heading',
        text: 'Working Together',
      },
      {
        type: 'paragraph',
        text: 'At Evolution Stables, these partners form a complete ecosystem: elite bloodstock sourcing (B.A.X), world-class training across regions (Wexford Stables and Stephen Gray Racing), and regulated digital infrastructure (Tokinvest). Together with our role as an NZTR-authorised syndicator, this team delivers transparent, high-integrity syndication that honours racing tradition while embracing modern ownership. Whether you\'re a first-time investor or seasoned owner, our collective expertise ensures every syndicate is built for performance, compliance, and shared enjoyment.',
      },
    ],
  },
];

export function getInsightArticle(slug: string): InsightArticle | undefined {
  return insightArticles.find((a) => a.slug === slug);
}
