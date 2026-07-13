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
    subtitle: 'A practical guide to thoroughbred ownership costs in New Zealand, including full-cost scenarios and syndication pricing',
    author: 'Evolution Stables',
    authorTitle: '',
    date: '2026-07-13',
    excerpt: 'Thoroughbred ownership in New Zealand has upfront and ongoing costs. This guide breaks down training, vet, race-day, insurance, and administration expenses, and explains how Evolution Stables bundles them into a single monthly rate.',
    heroImage: '/images/content/horses/prudentia-action.png',
    category: 'Guide',
    body: [
      {
        type: 'heading',
        text: 'The true cost of owning a racehorse in New Zealand',
      },
      {
        type: 'paragraph',
        text: 'Owning a thoroughbred racehorse in New Zealand is often described as a dream, but the financial reality matters. Before committing, prospective owners should understand both the upfront outlay and the ongoing costs that continue whether the thoroughbred wins, places, or runs unplaced. This guide explains the major cost categories, provides realistic scenarios, and shows how digital-syndication changes the cost profile.',
      },
      {
        type: 'subheading',
        text: 'Initial purchase price',
      },
      {
        type: 'paragraph',
        text: 'The purchase price depends on age, pedigree, conformation, and vendor. A yearling at public auction can range from a few thousand dollars to six figures for premium bloodstock. Buyers also pay the bloodstock agent\'s commission, transport, and insurance on top of the hammer price. Some owners purchase tried thoroughbreds already racing, which may command a higher initial price but reduce the waiting period before a first start.',
      },
      {
        type: 'subheading',
        text: 'Monthly training fees',
      },
      {
        type: 'paragraph',
        text: 'Training fees are the largest regular expense. Industry estimates for a thoroughbred in full training with a New Zealand trainer typically cite three to five thousand dollars per month, depending on the stable, location, and level of service. This covers trackwork, feed, stabling, basic farriery, and routine care. Veterinary costs, specialised shoeing, and race-day expenses are usually billed separately.',
      },
      {
        type: 'paragraph',
        text: 'At the lower end, a country trainer with a small string may charge a modest weekly rate. At the upper end, a premier stable in Matamata or Cambridge with higher overheads and more staff will charge more. Location, facilities, and the trainer\'s track record all influence the fee.',
      },
      {
        type: 'subheading',
        text: 'Race-day and nomination costs',
      },
      {
        type: 'paragraph',
        text: 'Each race entry incurs nomination and acceptance fees, transport to the track, jockey fees, and gear such as rugs and boots. These costs vary by meeting and distance, but owners should budget for them across a campaign. A thoroughbred racing every few weeks can add several hundred dollars per start in direct race-day costs.',
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
        text: 'Mortality and major medical insurance premiums are based on the thoroughbred\'s value and age. Owners also pay registration and syndication administration costs, including New Zealand Thoroughbred Racing fees, syndicate management, and any technology platform used for investor reporting or distributions.',
      },
      {
        type: 'subheading',
        text: 'Typical monthly cost scenarios',
      },
      {
        type: 'paragraph',
        text: 'A single thoroughbred in training can easily cost several thousand dollars per month before it ever races. Over a year, industry estimates suggest totals ranging from around forty thousand dollars at the low end to seventy thousand dollars or more at the high end, depending on the trainer, campaign frequency, and veterinary needs. These figures are indicative only and vary widely between stables and individual thoroughbreds.',
      },
      {
        type: 'paragraph',
        text: 'At the budget end, a thoroughbred spelling or racing infrequently at a country stable may keep monthly costs lower. At the premium end, a metropolitan campaign with regular transport, specialist care, and high-quality facilities will push costs to the top of the range. The key is that costs are continuous: they do not stop when the thoroughbred is not racing.',
      },
      {
        type: 'subheading',
        text: 'How Evolution Stables prices ownership',
      },
      {
        type: 'paragraph',
        text: 'Evolution Stables uses a simple monthly-owner-rate model. The owner rate is the cost per month for each 1% of the thoroughbred. The list rate adds a small platform fee. The all-in subscription price for a unit is the list rate multiplied by the unit percentage and the lease term in months.',
      },
      {
        type: 'paragraph',
        text: 'For example, a current Evolution Stables campaign offers ownership at an owner rate of seventy dollars per month per 1% of the thoroughbred. With a 5% platform fee, the list rate is seventy-three dollars and fifty cents per month per 1%, snapped to seventy-four dollars for investor-facing pricing. The syndicate holds 5% of the thoroughbred, divided into twenty lots, so each lot is 0.25%. Over a twelve-month lease term, the subscription price for one lot is listed at two hundred and twenty-five dollars. This is the total amount payable — not a monthly fee, but the full upfront subscription for the entire lease period.',
      },
      {
        type: 'paragraph',
        text: 'This single payment covers your share of training, veterinary care, race-day expenses, insurance, and administration for the lease period. There are no additional capital calls during the campaign. If the thoroughbred earns prize money, 75% of gross stakes flow back to investors as described in the returns explainer.',
      },
      {
        type: 'subheading',
        text: 'What is included and what is not',
      },
      {
        type: 'list',
        items: [
          'Included: training fees, stabling, feed, routine farriery, veterinary care, race entries, jockey fees, transport to local meetings, insurance, and syndicate administration.',
          'Sometimes separate: transport to international or long-distance meetings, specialised surgery, or optional veterinary treatments beyond normal campaign care.',
          'Not included: any form of guaranteed prize money or return. Race results determine whether the thoroughbred earns stakes.',
        ],
      },
      {
        type: 'subheading',
        text: 'Traditional syndicate vs Evolution Stables cost model',
      },
      {
        type: 'paragraph',
        text: 'Traditional syndicates often ask for an upfront purchase contribution followed by monthly or quarterly levies. Levies can rise unexpectedly if the thoroughbred needs extra veterinary work or travels more than expected. Owners may also receive bills for race-day extras or end-of-year top-ups.',
      },
      {
        type: 'paragraph',
        text: 'Evolution Stables bundles the expected campaign costs into the upfront subscription price. This gives owners cost certainty and removes the risk of mid-campaign capital calls. It also simplifies accounting: one payment, one holding, one quarterly settlement statement.',
      },
      {
        type: 'subheading',
        text: 'Hidden costs traditional syndicates may not highlight',
      },
      {
        type: 'list',
        items: [
          'Unexpected levies for vets, travel, or gear.',
          'Insurance excesses or exclusions that leave owners exposed.',
          'Bloodstock agent commission hidden in the purchase price.',
          'Late-payment fees or administration charges.',
          'Costs that continue while the thoroughbred is spelling or injured.',
        ],
      },
      {
        type: 'paragraph',
        text: 'Before entering any ownership arrangement, prospective owners should review the syndicate agreement, understand how bills are calculated, and confirm what is included in the monthly fee versus billed separately. Clear cost disclosure is the foundation of a well-run syndicate.',
      },
      {
        type: 'paragraph',
        text: 'If you want to see how these numbers translate into a real offering, browse the Evolution Stables marketplace and compare the listed campaigns, unit sizes, and lease terms.',
      },
      {
        type: 'subheading',
        text: 'A simple way to estimate your subscription cost',
      },
      {
        type: 'paragraph',
        text: 'Evolution Stables uses a transparent formula: owner rate per 1% per month, plus a small platform fee to form the list rate, multiplied by the lot size and the lease term in months. If the owner rate is fifty dollars per month per 1%, a 5% platform fee would make the list rate roughly fifty-two dollars and fifty cents per 1% per month. A 0.25% lot over twelve months would therefore cost 0.25% times twelve times the list rate, or around one hundred and fifty-seven dollars and fifty cents for the full term. Actual rates vary by campaign and are shown on each listing.',
      },
      {
        type: 'paragraph',
        text: 'This single figure covers the expected campaign cost. There are no monthly invoices, no surprise levies, and no extra calls for capital during the lease. The calculation is displayed before checkout, so you can compare campaigns directly without needing to ask the syndicator for a separate fee schedule.',
      },
      {
        type: 'subheading',
        text: 'Hidden costs traditional syndicates do not always disclose',
      },
      {
        type: 'paragraph',
        text: 'Traditional syndicates often advertise a headline buy-in price, then add levies for training, veterinary work, transport, and administration. Some charge extra when the thoroughbred races at a non-local track or needs specialist treatment. Insurance excesses, late levies, and year-end reconciliations can also appear unexpectedly. These are not hidden by intent in every case, but they are often communicated informally and arrive as a surprise to first-time owners.',
      },
      {
        type: 'paragraph',
        text: 'Digital-syndication addresses this by bundling expected campaign costs into the upfront subscription. The price you see is the price you pay for the defined lease term. Any exceptional expenses that fall outside normal campaign care are managed within the syndicate structure rather than passed to owners as ad-hoc bills. That is the difference between an estimate and a fixed subscription.',
      },
      {
        type: 'subheading',
        text: 'Included, sometimes included, and not included',
      },
      {
        type: 'paragraph',
        text: 'Included in the Evolution Stables subscription are full training fees, stabling, feed, routine farriery, normal veterinary care, race entries, jockey fees, local transport, insurance, and syndicate administration. Sometimes separate are long-distance or international transport, complex surgery, or optional therapies beyond the campaign plan. Never included is any promise of prize money or profit. Returns depend entirely on race performance, and many thoroughbreds earn little or nothing at all.',
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
        text: 'Thoroughbred syndication is the practice of dividing ownership of a thoroughbred into multiple shares. Instead of one owner funding the entire purchase and ongoing costs, a syndicate allows a group of people to participate according to the percentage they hold. Each owner receives a proportionate share of prize money, owner privileges, and racing experience.',
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
        text: 'Owners pay an upfront contribution that covers the purchase of the thoroughbred and establishment costs. After that, ongoing fees are usually levied monthly or quarterly to cover training, veterinary care, race-day expenses, and administration. A well-run syndicate provides regular financial reporting so owners know where their money is going.',
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
      {
        type: 'subheading',
        text: 'The New Zealand regulatory framework',
      },
      {
        type: 'paragraph',
        text: 'Thoroughbred syndication in New Zealand sits at the intersection of racing regulation and financial markets law. New Zealand Thoroughbred Racing (NZTR) is the industry body that licenses syndicators, approves disclosure statements, and sets the Bloodstock Syndicator Code of Practice. Because selling shares in a thoroughbred to the public involves an offer of securities, the Financial Markets Conduct Act also applies. Authorised syndicators operate under a streamlined exemption that recognises the special nature of bloodstock syndication, provided they meet strict transparency and conduct standards.',
      },
      {
        type: 'paragraph',
        text: 'The Bloodstock Syndicator Code covers advertising, disclosure, handling of funds, record keeping, dispute resolution, and ongoing communication with owners. NZTR can discipline, fine, or revoke the licence of a syndicator who breaches the code. This gives investors a layer of industry oversight that does not exist in unregulated private arrangements.',
      },
      {
        type: 'subheading',
        text: 'Types of syndicate structures',
      },
      {
        type: 'paragraph',
        text: 'Syndicates can be structured in several ways. A partnership syndicate is the simplest form: owners hold direct shares in the thoroughbred and share liability proportionally. A company-based syndicate forms a limited liability company that owns the thoroughbred; owners hold shares in the company rather than direct interests in the animal. A trust structure places ownership in the hands of a trustee who manages the asset for the benefit of unit holders. Finally, a digital-syndication platform records fractional interests through regulated infrastructure, with the underlying legal structure still governed by the syndicate agreement and NZTR rules.',
      },
      {
        type: 'paragraph',
        text: 'Each structure has different implications for tax, voting, transfer of interests, and personal liability. The right structure depends on the number of owners, the size of the offering, and how the syndicator plans to manage distributions and governance.',
      },
      {
        type: 'subheading',
        text: 'What authorised syndicators must do',
      },
      {
        type: 'list',
        items: [
          'Provide a NZTR-approved disclosure statement before accepting subscriptions.',
          'Keep accurate records of ownership, contributions, expenses, and distributions.',
          'Pay trainer and veterinary bills promptly and account for all syndicate funds.',
          'Distribute prize money and any sale proceeds in accordance with the syndicate agreement.',
          'Communicate regularly with owners and respond to reasonable inquiries.',
          'Comply with anti-money-laundering and identity-verification requirements.',
        ],
      },
      {
        type: 'subheading',
        text: 'Tax treatment basics',
      },
      {
        type: 'paragraph',
        text: 'Tax treatment depends on the structure and your personal circumstances. In many cases, syndicate income is treated as partnership or trust income and flows through to individual owners. Expenses may be deductible against income if the syndicate is run with a view to profit, but hobby or recreational ownership usually does not allow the same deductions. Capital gains or losses may arise when the thoroughbred is sold, depending on how the syndicate is structured and whether the asset is held on capital account.',
      },
      {
        type: 'paragraph',
        text: 'This guide is not tax advice. Owners should speak to a qualified accountant or tax adviser before subscribing, especially if they are based outside New Zealand or if the syndicate has a cross-border structure.',
      },
      {
        type: 'subheading',
        text: 'Common myths about syndication',
      },
      {
        type: 'list',
        items: [
          'Myth: syndication guarantees a return. Fact: most thoroughbreds do not earn enough prize money to cover their campaign costs.',
          'Myth: small lots mean less risk. Fact: smaller entry amounts reduce your exposure, but the thoroughbred still faces the same racing, injury, and market risks.',
          'Myth: digital-syndication changes the legal rules. Fact: the same NZTR and FMC Act obligations apply; the technology only changes administration.',
          'Myth: you need to be wealthy to participate. Fact: syndication exists precisely to spread the cost of ownership across many people.',
          'Myth: syndicators keep most of the prize money. Fact: licensed syndicators are required to distribute stakes according to the disclosure statement and syndicate agreement.',
        ],
      },
      {
        type: 'paragraph',
        text: 'Understanding these basics helps you ask better questions before subscribing. A well-run syndicate will welcome scrutiny and provide clear answers on structure, costs, and regulatory status.',
      },
      {
        type: 'paragraph',
        text: 'Questions to ask before you subscribe',
      },
      {
        type: 'paragraph',
        text: 'Before committing, ask the syndicator: Is the syndicator NZTR-authorised and current? Can I see the disclosure statement? What are the total costs over the full term, not just the monthly rate? How often will I receive updates and what format will they take? What happens if the thoroughbred is injured or retires? How are stakes calculated and distributed? What is the exit process if I need to sell my share? These are not aggressive questions — they are the baseline a reputable syndicator expects.',
      },
      {
        type: 'paragraph',
        text: 'If the answers are vague or evasive, walk away. The regulatory framework gives you the right to clear information before you commit. A syndicator that cannot explain its cost structure or distribution waterfall in plain language is not one you should trust with your capital.',
      },
      {
        type: 'paragraph',
        text: 'The Evolution Stables model',
      },
      {
        type: 'paragraph',
        text: 'Evolution Stables operates as an NZTR-authorised syndicator using a digital-syndication model. Each thoroughbred is offered in fractional lots with a fixed monthly rate and defined term. Onboarding includes identity verification through regulated infrastructure. Owners receive race updates, trainer reports, and quarterly statements. Stakes are distributed on a pro-rata basis with 75% of gross stakes returned to investors. The full process — from browse to ownership to settlement — is documented and auditable.',
      },
      {
        type: 'paragraph',
        text: 'This is one example of how the regulatory framework and modern technology can work together. The syndication model has existed for decades in New Zealand. The digital layer adds transparency, accessibility, and structured reporting without changing the underlying regulatory obligations.',
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
        text: 'After a race, the stakes are processed by New Zealand Thoroughbred Racing and paid into the nominated owner or syndicate account. The timing depends on the meeting and administrative processing, but it typically follows a predictable cycle. If the thoroughbred is syndicated, the syndicator receives the payment and then allocates it to owners according to their share.',
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
      {
        type: 'subheading',
        text: 'NZTR prize money structure',
      },
      {
        type: 'paragraph',
        text: 'New Zealand Thoroughbred Racing publishes a national prize-money scale that divides race meetings into categories. Metropolitan meetings, usually held at the major tracks such as Ellerslie, Riccarton, Te Rapa, and Trentham, carry the highest stakes. Provincial meetings are the next tier, run at regional courses with competitive but smaller pools. Rural or country meetings sit at the grassroots level and offer more modest prize money designed to support local owners and trainers. The scale is reviewed periodically and reflects the size of the betting turnover and the strategic importance of the meeting to the racing calendar.',
      },
      {
        type: 'paragraph',
        text: 'Each race has a published stake pool that is split among the placed runners. While the exact shareout varies by race type and classification, a common distribution pays roughly half of the pool to the winner, around a quarter to second place, and declining percentages to third, fourth, and fifth. The precise percentages are set by NZTR and disclosed in the race conditions.',
      },
      {
        type: 'subheading',
        text: 'Stake distribution percentages',
      },
      {
        type: 'paragraph',
        text: 'After NZTR releases the stakes, the syndicator applies the deductions agreed in the syndicate agreement. Under the Evolution Stables model, 75% of gross stakes flows to investors. The remaining 25% covers trainer percentages, jockey fees, stable expenses, and syndicate administration. This means investors do not see a separate trainer or jockey deduction on their settlement statement — those costs are already accounted for in the 25% retained by the syndicate. Always check the specific campaign disclosure statement, because percentages can differ between syndicates.',
      },
      {
        type: 'subheading',
        text: 'Worked example of a settlement calculation',
      },
      {
        type: 'paragraph',
        text: 'Imagine a hypothetical race with a published stake pool of ten thousand dollars. If the thoroughbred finishes first and the winner receives 50% of the pool, the gross stakes credited to the syndicate would be five thousand dollars. Under the Evolution Stables model, 75% of gross stakes flows to investors — that is three thousand seven hundred and fifty dollars. The remaining 25% covers trainer percentages, jockey fees, stable expenses, and syndicate administration. If the syndicate owns 50% of the thoroughbred, the investor pool is calculated against the syndicate stake. A person holding a 0.25% lot in the syndicate would receive 0.25% of the three thousand seven hundred and fifty dollar investor pool, or approximately nine dollars and thirty-eight cents. This is a simplified illustration; real calculations follow the exact disclosure statement and NZTR payment rules.',
      },
      {
        type: 'subheading',
        text: 'Added stakes and bonus schemes',
      },
      {
        type: 'paragraph',
        text: 'NZTR and industry partners sometimes run bonus schemes that add to the published stakes. Examples include added-money races for early nominations, bonus pools for registered owners, and incentive schemes for country thoroughbreds or maiden winners. These are usually announced in advance and form part of the total prize money available on race day. They are included in the same settlement process and distributed according to the syndicate agreement. Not every thoroughbred qualifies, but owners should be aware that the published stake can be supplemented by added money or bonuses.',
      },
      {
        type: 'subheading',
        text: 'Where to read more',
      },
      {
        type: 'paragraph',
        text: 'Prize money is only one part of the ownership economics. To see how subscriptions, costs, and returns fit together across a full campaign, read the returns explainer at /learn/returns. It walks through the ownership waterfall, the 75% investor return policy, and how quarterly settlements are delivered to owner accounts.',
      },
      {
        type: 'paragraph',
        text: 'What affects the size of the prize pool',
      },
      {
        type: 'paragraph',
        text: 'Several factors determine how much money is on the line in any given race. The grade of the meeting is the biggest: metropolitan Saturday meetings carry the highest stakes, followed by premier provincial meetings, then midweek and rural fixtures. Sponsored races may have contributed stakes above the base NZTR allocation. Group and Listed races carry the largest pools but require the thoroughbred to meet eligibility criteria including ratings and nominations.',
      },
      {
        type: 'paragraph',
        text: 'The number of runners also matters. Some races guarantee a minimum payment to every starter, while others pay only the first few past the post. Races with smaller fields may offer less total prize money but a higher probability of earning a share. Owners and syndicators factor this into campaign planning — targeting races where the thoroughbred is competitive and the prize money justifies the entry and travel costs.',
      },
      {
        type: 'paragraph',
        text: 'Prize money versus total ownership economics',
      },
      {
        type: 'paragraph',
        text: 'It is important to separate prize money from the total economics of ownership. A thoroughbred that earns stakes has done well on the track, but the cost of training, agistment, veterinary care, transport, and insurance runs whether the thoroughbred wins or not. A campaign that earns moderate prize money may still be net-negative for owners once costs are accounted for. Conversely, a thoroughbred that does not win much can still be valuable if it is later sold for breeding or as a performing asset.',
      },
      {
        type: 'paragraph',
        text: 'This is why disclosure statements matter. They set out the cost structure, the distribution waterfall, and the assumptions behind any projections. A reputable syndicator will be clear about the costs that exist regardless of prize money, and will not present stakes as the only economic variable that matters.',
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
        text: 'Traditional racehorse syndication has operated in New Zealand for decades. A licensed syndicator forms a group, collects funds, manages the thoroughbred, and distributes any prize money to owners. Digital-syndication follows the same legal and regulatory framework but uses technology to improve access, transparency, and settlement efficiency.',
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
      {
        type: 'subheading',
        text: 'Side-by-side comparison',
      },
      {
        type: 'paragraph',
        text: 'The comparison below sets out the two models across the dimensions that matter most to owners. Both are legal under New Zealand Thoroughbred Racing rules; the differences are operational.',
      },
      {
        type: 'list',
        items: [
          'Structure: traditional syndicates use paper registers, trust deeds, or company shares; digital-syndication records ownership on a regulated platform with auditable holdings.',
          'Minimum buy-in: traditional syndicates often require a larger upfront contribution plus ongoing levies; digital offerings can split ownership into much smaller lots, lowering the entry point.',
          'Liquidity: traditional shares are typically hard to sell or transfer; digital-syndication may support secondary-market transfers where the platform and regulations allow.',
          'Transparency: traditional reporting is usually ad-hoc by email or phone; digital platforms provide standardised race previews, financial summaries, and settlement statements.',
          'Access: traditional syndicates are usually marketed locally and rely on personal networks; digital-syndication is accessible online to verified investors across jurisdictions.',
          'Reporting: traditional syndicates reconcile distributions manually; digital-syndication automates the calculation and delivery of settlements to owner accounts.',
        ],
      },
      {
        type: 'subheading',
        text: 'How the traditional New Zealand syndicate model works',
      },
      {
        type: 'paragraph',
        text: 'The traditional model is built on personal trust and direct relationships. A licensed syndicator sources a thoroughbred, sets the share price, and invites participants through word of mouth, stable contacts, or racing clubs. Owners sign paper forms, pay by bank transfer, and receive updates from the trainer or syndicator by email, phone, or post-race gatherings. The syndicator collects prize money from New Zealand Thoroughbred Racing, deducts trainer fees and expenses, and distributes the net amount to each owner by direct credit.',
      },
      {
        type: 'paragraph',
        text: 'This model has served the industry for decades and remains appropriate for local groups who value face-to-face contact and a single point of accountability. Its weakness is scalability and administrative overhead. As the number of owners grows, record-keeping, communication, and settlement reconciliation become more burdensome, and small shareholders may be overlooked.',
      },
      {
        type: 'subheading',
        text: 'How the digital-syndication model works',
      },
      {
        type: 'paragraph',
        text: 'Digital-syndication follows the same legal structure but replaces manual administration with regulated platform infrastructure. Ownership is recorded digitally, identity verification is handled by a licensed provider, subscriptions are paid through the platform, and reporting is delivered through a standardised owner portal. Prize money is still calculated according to NZTR rules and the syndicate agreement, but the settlement can be processed faster and with a clearer audit trail.',
      },
      {
        type: 'paragraph',
        text: 'The model is particularly useful when owners are spread across regions or countries. It also supports smaller lot sizes, making thoroughbred ownership accessible to a wider audience without changing the legal rights of each owner. The trainer, the thoroughbred, and the racing regulator remain the same; only the administrative layer is modernised.',
      },
      {
        type: 'subheading',
        text: 'Trade-offs and when each model makes sense',
      },
      {
        type: 'paragraph',
        text: 'Traditional syndication works well when a small group of known owners wants a direct relationship with a specific trainer and is comfortable with manual reporting. It suits people who already move in racing circles and prefer to settle bills and distributions through familiar banking channels. Digital-syndication works better when the owner base is broader, geographically dispersed, or more accustomed to online investing. It also suits people who want cost certainty, regular reporting, and a clear view of their holding at any time.',
      },
      {
        type: 'paragraph',
        text: 'Neither model removes the risks of racing. A thoroughbred can still be injured, retire early, or fail to win enough prize money to cover costs. The right choice depends on how you prefer to interact with the investment, not on the underlying sport.',
      },
      {
        type: 'subheading',
        text: 'Regulatory framing',
      },
      {
        type: 'paragraph',
        text: 'Both models are governed by the same New Zealand framework. New Zealand Thoroughbred Racing licenses syndicators, approves disclosure statements, and enforces the Bloodstock Syndicator Code of Practice. The Financial Markets Conduct Act provides the legal backdrop for any offer of shares to the public. Digital-syndication platforms must meet the same obligations and may also hold additional licences in other jurisdictions where they operate, such as the Dubai Virtual Assets Regulatory Authority licence held by Tokinvest. Regulation is not a feature of one model or the other; it is a baseline requirement for both.',
      },
      {
        type: 'paragraph',
        text: 'Making the choice',
      },
      {
        type: 'paragraph',
        text: 'If you are already embedded in the NZ racing community, know your trainer personally, and want a hands-on relationship with a small group of co-owners, a traditional syndicate may suit you. The social dimension of racing is real, and traditional structures often deliver it well.',
      },
      {
        type: 'paragraph',
        text: 'If you are new to racing, live outside New Zealand, or want a structured investment-style exposure with clear reporting and cost certainty, digital-syndication is designed for you. The onboarding is online, the terms are documented, and the reporting arrives on a schedule rather than when someone remembers to send it.',
      },
      {
        type: 'paragraph',
        text: 'Some owners will use both. A traditional syndicate for the social club, a digital holding for the transparency and ease. The models are not mutually exclusive — they serve different needs within the same sport.',
      },
      {
        type: 'paragraph',
        text: 'Whichever path you choose, verify that the syndicator is NZTR-authorised, read the disclosure statement before subscribing, and confirm you understand the cost structure and term length. The regulatory framework exists to protect owners, but only if you engage with it.',
      },
    ],
  },
  {
    slug: 'how-to-buy-a-racehorse-share-in-nz',
    title: 'How to Buy a Racehorse Share in New Zealand',
    subtitle: 'A complete walkthrough for buying a share in a New Zealand thoroughbred, from browsing to ownership',
    author: 'Evolution Stables',
    authorTitle: '',
    date: '2026-07-13',
    excerpt: 'Buying a racehorse share in New Zealand is straightforward when you understand the steps. This guide explains how to choose a syndicator, review an offering, complete identity verification, and start receiving updates and settlements.',
    heroImage: '/images/content/horses/prudentia-action.png',
    category: 'Guide',
    body: [
      {
        type: 'heading',
        text: 'How to buy a racehorse share in New Zealand',
      },
      {
        type: 'paragraph',
        text: 'Owning a thoroughbred racehorse in New Zealand is more accessible than most people assume. You do not need to buy an entire thoroughbred, manage a trainer, or write open-ended cheques for veterinary bills. Through syndication, you can own a defined percentage of a thoroughbred, receive regular updates, and share in any prize money the thoroughbred earns. The process is regulated by New Zealand Thoroughbred Racing (NZTR) and, on a digital-syndication platform like Evolution Stables, can be completed online in a matter of days.',
      },
      {
        type: 'subheading',
        text: 'Step 1: Browse available offerings',
      },
      {
        type: 'paragraph',
        text: 'Start with the marketplace. Each listing shows the thoroughbred, trainer, location, campaign status, share structure, and terms. Look for thoroughbreds that match your interest in terms of distance preference, trainer reputation, pedigree, and campaign timing. Read the story, review the available units, and check whether the campaign is listed, coming soon, or fully subscribed.',
      },
      {
        type: 'paragraph',
        text: 'On Evolution Stables, every campaign page explains the ownership model, the lease term, the minimum unit, and what percentage of the thoroughbred each unit represents. You can also see how much of the syndicate is already subscribed.',
      },
      {
        type: 'subheading',
        text: 'Step 2: Review the terms and risks',
      },
      {
        type: 'paragraph',
        text: 'Before subscribing, review the syndicate agreement, the disclosure statement, and the fee schedule. A licensed NZTR syndicator must provide clear information about the thoroughbred, the trainer, the costs, the ownership structure, and how prize money is calculated and distributed. If you are using a digital platform, the terms should also explain how identity verification, settlement, and ongoing reporting work.',
      },
      {
        type: 'paragraph',
        text: 'Pay close attention to what is included in the subscription price and what is billed separately. On Evolution Stables, the monthly rate is bundled into the upfront subscription price, so there are no additional capital calls during the campaign.',
      },
      {
        type: 'subheading',
        text: 'Step 3: Complete identity verification (KYC)',
      },
      {
        type: 'paragraph',
        text: 'Because racehorse syndication is a regulated investment activity, syndicators must verify the identity of every owner. This is standard anti-money-laundering (AML) practice and protects both the syndicator and other owners. On Evolution Stables, identity verification is completed through Stripe Identity, a regulated provider that checks your ID document and matches it to a live selfie.',
      },
      {
        type: 'paragraph',
        text: 'The process takes a few minutes. You will need a passport or driver licence and a device with a camera. Once verified, your status is recorded in the platform and you can proceed to subscribe.',
      },
      {
        type: 'subheading',
        text: 'Step 4: Select your lot and subscribe',
      },
      {
        type: 'paragraph',
        text: 'Choose the number of units you want. Each unit represents a clean fraction of the syndicate stake. For example, if the syndicate holds 5% of a thoroughbred and the offering is divided into 20 units, each unit is 0.25% of the thoroughbred. The total subscription cost is the list rate multiplied by your unit percentage and the lease term in months.',
      },
      {
        type: 'paragraph',
        text: 'At checkout, you pay the subscription amount through the platform. Your ownership is recorded on the regulated platform, and you receive confirmation of your holding. There are no physical certificates; your holding is maintained digitally by Tokinvest, our VARA-licensed settlement partner.',
      },
      {
        type: 'subheading',
        text: 'Step 5: Onboarding and ownership updates',
      },
      {
        type: 'paragraph',
        text: 'After subscription, you become a registered owner in the syndicate. You will receive stable updates, race previews, post-race reviews, and quarterly settlement statements when the thoroughbred earns prize money. You may also receive invitations to trackwork, barrier trials, and raceday hospitality, depending on availability and the trainer.',
      },
      {
        type: 'paragraph',
        text: 'Digital-syndication does not change the underlying experience of ownership. The thoroughbred still trains with a licensed trainer, still races under NZTR rules, and still earns prize money the same way. What changes is how ownership is recorded, communicated, and settled.',
      },
      {
        type: 'subheading',
        text: 'What happens after you verify your identity',
      },
      {
        type: 'paragraph',
        text: 'Stripe Identity handles the document and selfie check in a secure, compliant flow. Evolution Stables does not store your ID document; we receive only a verification result and a record that your account has passed AML screening. This allows us to meet our NZTR and AML obligations while keeping your information safe. If the check fails, you will be prompted to retake the photo or provide a clearer ID. Most verifications complete in under five minutes, and some may require a quick manual review if the automated match is inconclusive.',
      },
      {
        type: 'subheading',
        text: 'Typical timeline from signup to first race update',
      },
      {
        type: 'list',
        items: [
          'Day 1: create your account and complete Stripe Identity verification.',
          'Day 2-3: browse active campaigns, review the disclosure statement, and select a lot.',
          'Week 1: subscription confirmed and your ownership record is created on the regulated platform.',
          'Week 2-4: the thoroughbred enters or resumes its campaign; you receive a welcome update and stable briefing.',
          'After each start: race preview, post-race review, and any settlement statement are published through the owner portal.',
        ],
      },
      {
        type: 'paragraph',
        text: 'Timelines vary because racing is seasonal and thoroughbreds do not run on demand. A thoroughbred that is already racing may produce an update within days. A yearling or early preparation may take months before its first start. Either way, you know the schedule because the campaign page and stable reports keep you informed.',
      },
      {
        type: 'subheading',
        text: 'What owners actually receive',
      },
      {
        type: 'paragraph',
        text: 'Your subscription buys a transparent ownership experience, not just a percentage. You receive regular stable updates, video and photo briefings when available, pre-race and post-race analysis, quarterly financial summaries, and a settlement statement whenever the thoroughbred earns stakes. You also get owner-level access to trackwork, barrier trials, and raceday hospitality where the trainer makes those available. Distributions are processed through the regulated settlement infrastructure and deposited to your wallet on the platform, with a clear audit trail from racetrack to account.',
      },
      {
        type: 'paragraph',
        text: 'Digital-syndication does not create a new category of ownership rights. It makes the same rights easier to track, communicate, and settle. You still hold a defined share, still share in the economics, and still interact with the trainer and stable in the same way as owners in a traditional syndicate.',
      },
      {
        type: 'subheading',
        text: 'Traditional syndicate signup vs digital signup',
      },
      {
        type: 'paragraph',
        text: 'A traditional New Zealand syndicate typically requires a paper application, a bank transfer or cheque, proof of identity sent by email, and manual entry into the syndicator\'s register. Updates often arrive by newsletter or phone, and prize-money settlements are reconciled quarterly by bank transfer. It works, but it is slow, opaque, and hard to scale across regions or time zones. Digital-syndication replaces those manual steps with a single regulated workflow, while preserving the same legal protections and NZTR oversight.',
      },
      {
        type: 'paragraph',
        text: 'The most important difference is not the thoroughbred or the trainer. It is the operating system around ownership: identity verification, subscription, reporting, and settlement are all auditable from one account. For new owners, that means fewer forms and faster clarity. For experienced owners, it means less administration and a cleaner record of every distribution.',
      },
      {
        type: 'subheading',
        text: 'Understanding the risks before you subscribe',
      },
      {
        type: 'paragraph',
        text: 'Thoroughbred ownership is a high-risk activity. A thoroughbred can be injured in training, fail to measure up at the races, retire early, or earn prize money that does not cover the cost of the campaign. Past performance of other thoroughbreds is not a guide to future results, and there is no guaranteed return. You should subscribe only with capital you can afford to lose, read the disclosure statement in full, and seek independent financial, tax, or legal advice if you are unsure.',
      },
      {
        type: 'paragraph',
        text: 'Ready to see what is currently available? Visit /marketplace to browse active Evolution Stables campaigns, compare unit sizes and lease terms, and start your ownership journey with a licensed NZTR syndicator.',
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
        text: 'Evolution Stables is an authorised syndicator with New Zealand Thoroughbred Racing (NZTR). We specialise in digital-syndication — offering transparent, fractional ownership of thoroughbred racehorses to everyday investors and enthusiasts.',
      },
      {
        type: 'heading',
        text: 'What is an Authorised Syndicator?',
      },
      {
        type: 'paragraph',
        text: 'An authorised syndicator is a person or entity formally approved by New Zealand Thoroughbred Racing (NZTR) to publicly advertise and manage shares in thoroughbred racehorses on behalf of the public.',
      },
      {
        type: 'paragraph',
        text: 'To achieve this status, syndicators must comply with the Bloodstock Syndicator Code of Practice, submit detailed disclosure statements for NZTR approval before any public offer, and adhere to strict standards around transparency, investor protection, financial management, and ongoing reporting.',
      },
      {
        type: 'paragraph',
        text: 'This framework was established because selling shares in racehorses to the public is regulated under New Zealand law (Financial Markets Conduct Act). Becoming an authorised syndicator provides a streamlined exemption pathway while ensuring high standards of governance. It gives investors confidence that the syndicate is properly structured, managed, and overseen by the industry body.',
      },
      {
        type: 'paragraph',
        text: 'As a digital-first authorised syndicator, Evolution Stables builds on this foundation by combining traditional racing expertise with modern digital-syndication. This delivers greater liquidity, accessibility, real-time performance tracking, and global reach — all while maintaining full regulatory compliance.',
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
