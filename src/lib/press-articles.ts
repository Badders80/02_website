export interface PressArticle {
  title: string;
  url: string;
  publisher: string;
  date: string;
  excerpt?: string;
  imageUrl?: string;
}

export const pressArticles: PressArticle[] = [
  {
    title: 'Global Validation: Racehorse Tokenization Framework Enters the UAE Market',
    url: 'https://www.gtlaw.com/en/insights/2026/3/racehorse-tokenization-enters-the-uae-market',
    publisher: 'Greenberg Traurig',
    date: '2026-03-19',
    excerpt:
      'A GT Alert by international law firm Greenberg Traurig analyses the landmark partnership between Dubai Racing Club and Tokinvest, detailing how racehorse tokenization is moving from policy to production for the 2026/27 season. The legal insight validates the exact digital-syndication architecture that Evolution Stables pioneered under NZTR regulation in New Zealand — the same compliance and operational framework now defining the global standard.',
    imageUrl: '/images/press/tokinvest-drc.webp',
  },
  {
    title: "Everyone's been talking about RWAs. We deliver them.",
    url: '/insights/everyone-talking-rwas-we-deliver-them',
    publisher: 'Evolution Stables',
    date: '2026-07-06',
    excerpt:
      'The real-world asset conversation has been running for years. What has been largely absent is the part that actually matters: returns from the asset, calculated under regulation, and settled directly to investor wallets. This month, Evolution Stables shipped investor reporting.',
    imageUrl: '/images/content/horses/prudentia-action.png',
  },
  {
    title: 'Prudentia Wins at Te Rapa in Gutsy Heavy Track Performance',
    url: 'https://x.com/EvolutionStable/status/2045096014466760782',
    publisher: 'Evolution Stables',
    date: '2026-04-17',
    excerpt: "Great news for Evolution Stables investors — Prudentia has scored a tough, gutsy victory in Race 7 (BM65, 1300m) at Te Rapa this afternoon on a Heavy 10 track. She showed her class, coming from deep in the field at the halfway mark, running the perfect race to take the lead where it counted and fighting hard all the way to the line under Masa Hashizume. Prudentia won by 0.33L from Fleeting Star (0.33L back), with Amusement 0.73L third. To put that into context, that's approximately 0.8 metres!",
    imageUrl: '/updates/Prudentia Te Rapa Winner Cover.png',
  },
  {
    title: 'Dubai Racing Club and Tokinvest Announce Partnership',
    url: 'https://tokinvest.capital/insights-and-news/tokinvest-and-dubai-racing-club',
    publisher: 'TOKINVEST',
    date: '2026-01-20',
    excerpt: "Digital syndication is transforming racehorse ownership globally, and Evolution Stables stands at the forefront of this revolution. The partnership between Dubai Racing Club and Tokinvest validates what we've been building in New Zealand—a regulated, accessible model for fractional horse ownership. While Dubai targets elite international campaigns with premium investor tiers, Evolution Stables democratizes the experience for local racing enthusiasts. This landmark partnership proves digital syndication isn't just the future—it's happening now, and Evolution is leading the charge locally.",
    imageUrl: '/images/press/tokinvest-drc.webp',
  },
  {
    title: 'Tokinvest and Singularry Superapp Partner to Make Regulated Real-World Asset Investing Accessible to Everyone',
    url: 'https://www.investing.com/news/cryptocurrency-news/tokinvest-and-singularry-superapp-partner-to-make-regulated-realworld-asset-investing-accessible-to-everyone-4316762',
    publisher: 'Investing.com',
    date: '2024-12-19',
    excerpt: 'Strategic partnership bringing regulated real-world asset investing to mainstream audiences through innovative digital platforms.',
    imageUrl: '/images/press/investing-com.webp',
  },
  {
    title: 'Thoroughbred Ownership Reimagined',
    url: 'https://trackside.co.nz/article/thoroughbred-ownership-reimagined',
    publisher: 'Trackside',
    date: '2024-11-15',
    excerpt: 'How Evolution Stables is transforming traditional racehorse syndication through digital innovation and blockchain technology.',
    imageUrl: '/images/press/trackside.webp',
  },
  {
    title: 'Digital Investment in Thoroughbred Horses: The New Frontier',
    url: 'https://businessdesk.co.nz/article/sport/digital-investment-in-thoroughbred-horses-the-new-frontier',
    publisher: 'BusinessDesk',
    date: '2025-01-16',
    excerpt: 'To most people, a racehorse is a thoroughbred animal that runs around a racetrack. To an emerging group of investors, it represents a digital transaction on a blockchain.',
    imageUrl: '/images/press/businessdesk-digital-investment.webp',
  },
  {
    title: 'Tokinvest Appointed by Evolution Stables to Launch Tokenised Racehorse Leases',
    url: 'https://tokinvest.capital/insights-and-news/tokinvest-and-evolution-stables',
    publisher: 'Tokinvest',
    date: '2025-04-04',
    excerpt: 'Tokinvest, the VARA-regulated marketplace transforming real-world asset (RWA) investing, has been appointed by Evolution Stables.',
    imageUrl: '/images/press/tokinvest.webp',
  },
  {
    title: 'Tokinvest Raises $3.2m Pre-Seed for RWA Platform',
    url: 'https://fintech.global/2025/09/30/tokinvest-raises-3-2m-pre-seed-for-rwa-platform/',
    publisher: 'FinTech Global',
    date: '2025-09-30',
    excerpt: 'Founded to democratise access to premium assets, Tokinvest provides a platform for fractional ownership across diverse asset classes.',
    imageUrl: '/images/press/fintech-global.webp',
  },
  {
    title: 'Bringing Racing into the Digital Age',
    url: 'https://businessdesk.co.nz/article/technology/bringing-racing-into-the-digital-age',
    publisher: 'BusinessDesk',
    date: '2024-10-28',
    excerpt: 'New Zealand racing industry embraces digital transformation with Evolution Stables leading the charge.',
    imageUrl: '/images/press/businessdesk-bringing-racing-into-digital-age.webp',
  },
  {
    title: "New Zealand's Evolution Stables Teams Up with Tokinvest for Tokenised Racehorse Leases Ahead of Dubai World Cup",
    url: 'https://www.arabianbusiness.com/gcc/uae/new-zealands-evolution-stables-teams-up-with-tokinvest-for-tokenised-racehorse-leases-ahead-of-dubai-world-cup',
    publisher: 'Arabian Business',
    date: '2025-01-10',
    excerpt: 'Evolution Stables partners with Tokinvest to bring tokenised racehorse ownership to the Middle East market.',
    imageUrl: '/images/press/arabian-business.webp',
  },
  {
    title: "Tokinvest secures VARA's first multi-asset issuance licence, raises $3.2m",
    url: 'https://gulfbusiness.com/tokinvest-gets-vara-multi-asset-issuance-licence/',
    publisher: 'Gulf Business',
    date: '2025-10-03',
    excerpt: "Tokinvest's $3.2m pre-seed round was backed by VCs, family offices and high-net-worth investors, including Triliv Holdings and Exponential Science.",
    imageUrl: '/images/press/gulf-business.jpg',
  },
];

export function getPressArticlesForStructuredData() {
  return pressArticles.map((article) => ({
    headline: article.title,
    url: article.url,
    publisher: article.publisher,
    datePublished: article.date,
  }));
}
