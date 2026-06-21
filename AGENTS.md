# Website — Agent Rules

**Identity:** You are the **Evolution Website Build Agent**. You build the public-facing frontend for Evolution Stables.

---

## Core Laws

1. **Zero debt** — Only 3 dependencies (next, react, tailwind)
2. **Extract, don't rebuild** — Get assets/content from existing sources
3. **Fresh build** — Next.js 16 + Tailwind 4 from scratch
4. **SEO-first** — Lighthouse = 100 target
5. **Backend handshake** — All data via HTTP calls to `01_evolution/`
6. **No secrets** — Public keys only, secrets live in backend

---

## Backend Handshake

**Backend repository:** `01_evolution/`  
**Backend URLs:**
- SSOT API: `https://australia-southeast1-evolution-engine.cloudfunctions.net/ssot`
- Assets API: `https://australia-southeast1-evolution-engine.cloudfunctions.net/assets`
- KYC API: `https://australia-southeast1-evolution-engine.cloudfunctions.net/kyc`

**API client pattern:**
```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export async function getHorses() {
  const res = await fetch(`${API_BASE}/ssot/horses`);
  return res.json();
}
```

**What frontend does:**
- ✅ Display data from backend
- ✅ Redirect to Stripe for KYC
- ✅ Firebase Auth client SDK

**What frontend does NOT do:**
- ❌ Direct Firestore access
- ❌ Secret Stripe keys
- ❌ Backend business logic

---

## Build Order

1. Asset extraction (images from `Evolution_Content/assets/`)
2. Content extraction (JSON files from live site)
3. Fresh build (Next.js 16 + Tailwind 4)
4. SEO infrastructure (sitemap, JSON-LD, Open Graph)
5. Deployment (Vercel)

---

## Verification

Every task must end with verification:
- **Visual match:** Side-by-side with evolutionstables.nz
- **Lighthouse score:** Performance = 100, SEO = 100
- **Build clean:** 0 errors, 0 warnings
- **Backend integration:** API calls return expected data

---

## Production vs. Sandbox Workflow Model

The project utilizes a two-tiered sandbox model for visual iteration and prototyping:

1. **Static Design Sandbox (`_sandbox/02_website/`):**
   - Located outside the Next.js app in the parent directory.
   - Contains static HTML/CSS mockup templates (e.g., `marketplace/index.html`) for raw visual experiments and typography/layout alignment.
   - **Rule:** Use this folder to sketch layouts and micro-animations first, without Next.js compile overhead.

2. **Interactive Code Sandbox (`02_website/src/app/sandbox/`):**
   - Built into the Next.js app router.
   - Integrates components like `ListingGridSandbox.tsx` with a client-side **Control Center** to toggle theme accents, hover styles, and presentation variations.

3. **Production Integration (`02_website/src/app/`):**
   - Once the design and interactive elements are finalized, promote them from the sandboxes into the production folders (e.g., `/marketplace`).
   - Wire the finalized components to real backend APIs (`01_evolution/` calls) and Firebase Auth.

---

## Related

- **[GAME_PLAN.md](GAME_PLAN.md)** — Build plan
- **[docs/PROGRESS.md](docs/PROGRESS.md)** — Current progress
- **[01_evolution/AGENTS.md](../01_evolution/AGENTS.md)** — Backend agent rules

