# Blockers & Handoff Points — Website

## 1. Asset Extraction — 🔶 Ready to Start

- **Status:** Can extract from `Evolution_Content/assets/`
- **What's needed:** Manual copy of ~15 images
- **Handoff:** User copies images from backend to frontend

**Checklist:**
- [ ] Partner logos (Investing.com, BusinessDesk, Trackside, etc.)
- [ ] Icons (Increased Access, Greater Transparency)
- [ ] Hero images (Horse-Double-Black.png, Logo.png)

---

## 2. Content Extraction — 🔶 Ready to Start

- **Status:** Can extract from live site (evolutionstables.nz)
- **What's needed:** Manual copy of text content
- **Handoff:** User provides content or I scrape from live site

**Checklist:**
- [ ] Homepage copy (hero, sections, FAQ)
- [ ] Press releases (10 releases with metadata)
- [ ] Footer content (links, social)

---

## 3. Environment Variables — ⬜ Not Started

- **Status:** Need to configure
- **What's needed:** Stripe public key, Firebase config
- **Handoff:** User provides keys from Stripe/Firebase dashboards

**Variables:**
- `NEXT_PUBLIC_API_BASE` — Backend URL (known)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — From Stripe dashboard
- `NEXT_PUBLIC_FIREBASE_CONFIG` — From Firebase console

---

## 4. Deployment — ⬜ Not Started

- **Status:** Vercel account needed
- **What's needed:** Connect GitHub repo to Vercel
- **Handoff:** User creates Vercel project

**Steps:**
1. Push code to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy

---

## Related

- **[docs/PROGRESS.md](docs/PROGRESS.md)** — Current progress
- **[01_evolution/BLOCKERS.md](../01_evolution/BLOCKERS.md)** — Backend blockers
