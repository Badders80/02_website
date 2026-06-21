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

## 5. Email Notification Implementation — 🔴 TODO

- **Status:** Placeholder implemented (logs to console)
- **What's needed:** Choose email provider and implement actual sending
- **Handoff:** User chooses email provider (Gmail API, SendGrid, etc.)

**Options:**
- Gmail API (using existing email-ingest infrastructure)
- SendGrid (35k emails/month free)
- Firebase Functions email trigger (100/day free)

**ETA:** 2-4 hours

**Status:** 🔴 TODO

---

## 6. Cloud Function Deployment — 🔴 TODO

- **Status:** Code ready, needs deployment
- **What's needed:** Deploy `api/applications` Cloud Function
- **Handoff:** User runs deployment command

**Command:**
```bash
cd api/applications
gcloud functions deploy applications \
  --runtime python311 \
  --trigger-http \
  --region australia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars="ALLOWED_ORIGINS=https://evolution.2.0.vercel.app,https://02website-pearl.vercel.app"
```

**ETA:** 15 minutes

**Status:** 🔴 TODO

---

## 7. Email Notification Implementation — 🔴 TODO

- **Status:** Placeholder implemented (logs to console)
- **What's needed:** Choose email provider and implement actual sending
- **Handoff:** User chooses email provider (Gmail API, SendGrid, etc.)

**Options:**
- Gmail API (using existing email-ingest infrastructure)
- SendGrid (35k emails/month free)
- Firebase Functions email trigger (100/day free)

**ETA:** 2-4 hours

**Status:** 🔴 TODO

---

## Related

- **[docs/PROGRESS.md](docs/PROGRESS.md)** — Current progress
- **[01_evolution/BLOCKERS.md](../01_evolution/BLOCKERS.md)** — Backend blockers
- **[docs/APPLICATION_SYSTEM.md](docs/APPLICATION_SYSTEM.md)** — Application system documentation
- **[docs/IMPLEMENTATION_SUMMARY.md](docs/IMPLEMENTATION_SUMMARY.md)** — Implementation summary
