# Continue — Fixed Marketplace Horse Images & Full Site Image Audit

**Boot order:** this file → `../../docs/next-session-notes.md` → execute Next action.  
**Sprint plan:** `../../docs/plans/2026-08-05-two-horse-list-go-live.md`  

## Last action

2026-08-10: **Fixed broken horse images on Marketplace & performed full website image audit**.
- **Root Cause:** Linux case-sensitivity on Vercel prod caused 404s when loading `first-gear-BG.png` vs `FirstGear-BG.png`, `prudentia-BG.png` vs `prudentia.png`, `hottathanafantasy-BG.png` vs `Hottathan-BG.png`, and `i-stole-a-manolo-BG.png` vs `IStole-BG.png`.
- **Fix:** Created exact lowercase aliased copies in `public/images/content/horses/` and resolved all 65 image references across the entire codebase (`0 missing`).
- **Build & Push:** Verified full Next.js production build (`85/85` pages compiled cleanly). Committed & pushed to `main` (`d1d0d93`).

## Next action

1. Share Interest Signups **Editor** with `evolution-web-admin@evolution-engine.iam.gserviceaccount.com` so primary sheet writes stick.
2. **TML soft-list** / Syndicate OS when ready.

## Do not

- Re-introduce Tokinvest branding or marketplace mentions  
- Re-embed email form inside About scroll content  
- Post bare `/` for paid/social campaigns — always use `?source=<key>`  
