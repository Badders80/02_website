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

## Related

- **[GAME_PLAN.md](GAME_PLAN.md)** — Build plan
- **[docs/PROGRESS.md](docs/PROGRESS.md)** — Current progress
- **[01_evolution/AGENTS.md](../01_evolution/AGENTS.md)** — Backend agent rules
