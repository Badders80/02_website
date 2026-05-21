# Evolution Stables — Website Game Plan

**Track:** Frontend (investor/user-facing)  
**Repository:** `02_website/`  
**Deployment:** Vercel  
**Timeline:** 6-8 weeks  
**Status:** 🟢 Phase 0 — Asset Extraction

---

## 🎯 Goal

Zero-debt replication of evolutionstables.nz — the public-facing website for Evolution Stables.

**Success Criteria:**
- ✅ Visual match: Side-by-side with evolutionstables.nz
- ✅ SEO score: Lighthouse = 100
- ✅ Zero debt: Only 3 dependencies (next, react, tailwind)
- ✅ Build clean: 0 errors, 0 warnings
- ✅ Live URL: evolutionstables.nz (or staging subdomain)

---

## Phase 0: Asset Extraction (2-3 days)

**Goal:** Extract only visible assets from existing build.

### Checklist

- [ ] Extract ~15 images from `Evolution_Content/assets/`
  - Partner logos (Investing.com, BusinessDesk, Trackside, etc.)
  - Icons (Increased Access, Greater Transparency, Borderless Flexibility)
  - Hero images (Horse-Double-Black.png, Evolution-Stables-Logo.png)
- [ ] Organize into `public/images/`
- [ ] Verify image quality + licenses
- [ ] Optimize for web (Next.js Image component)

**Not extracting:**
- ❌ Admin page assets
- ❌ Marketplace mockups
- ❌ MyStable dashboard images
- ❌ Source files (PSD, AI, Figma)

---

## Phase 1: Content Extraction (1-2 days)

**Goal:** Create structured JSON content files from live site.

### Checklist

- [ ] Create `dna/content/homepage.json`
  - Hero copy
  - Stakeholder sections
  - Digital Syndication benefits
  - FAQ
- [ ] Create `dna/content/press.json`
  - 10 press releases (date, source, title, excerpt, link)
  - Media relations section
- [ ] Create `dna/content/footer.json`
  - Privacy/Terms links
  - Social links

**Not extracting:**
- ❌ Admin dashboard content
- ❌ Marketplace listings
- ❌ MyStable user data

---

## Phase 2: Fresh Build (2-3 weeks)

**Goal:** Build minimal Next.js app from scratch.

### Checklist

- [ ] Initialize Next.js 16 + Tailwind 4
- [ ] Build homepage from `dna/content/homepage.json`
- [ ] Build press page from `dna/content/press.json`
- [ ] Build privacy/terms pages
- [ ] Apply brand system (colors, fonts from `dna/brand/`)
- [ ] Responsive design (mobile, tablet, desktop)

---

## Phase 3: SEO + Deployment (1 week)

**Goal:** Production-ready deployment with perfect SEO.

### Checklist

- [ ] Add metadata + Open Graph tags
- [ ] Generate sitemap.xml + robots.txt
- [ ] Add JSON-LD structured data (Organization, NewsArticle)
- [ ] Deploy to Vercel
- [ ] Lighthouse audit (Performance = 100, SEO = 100)
- [ ] Core Web Vitals (LCP < 2.5s, INP < 200ms, CLS < 0.1)

---

## Phase 4: Investor Features (Future)

**Goal:** Connect to backend for investor onboarding.

### Checklist

- [ ] Login/auth flow (Firebase Auth)
- [ ] KYC verification (Stripe Identity via backend API)
- [ ] Browse horses (calls `01_evolution/` SSOT API)
- [ ] MyStable dashboard (future)

---

## Backend Handshake

This website connects to `01_evolution/` (backend) via HTTP:

| Feature | Frontend (This Repo) | Backend (01_evolution/) |
|---------|---------------------|------------------------|
| **Browse horses** | Display list | `GET /ssot/horses` |
| **Horse detail** | Display images, info | `GET /ssot/horses/{microchip}` |
| **KYC verification** | UI + redirect | `POST /kyc/create-session` |
| **Login/auth** | Firebase Auth UI | Token verification |
| **Upload documents** | Upload form | `POST /assets/upload` |

**Environment variables:**
```env
NEXT_PUBLIC_API_BASE=https://australia-southeast1-evolution-engine.cloudfunctions.net
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_FIREBASE_CONFIG={...}
```

---

## Related

- **[01_evolution/GAME_PLAN.md](../01_evolution/GAME_PLAN.md)** — Backend platform plan
- **[docs/PROGRESS.md](docs/PROGRESS.md)** — Website progress tracker
- **[README.md](README.md)** — Quick start + architecture

---

## Notes

- **Timeline:** 6-8 weeks total (realistic estimate)
- **Dependencies:** Minimal (next, react, tailwind only)
- **Deployment:** Vercel (automatic CI/CD from Git)
- **Content updates:** Edit JSON files in `dna/content/`
