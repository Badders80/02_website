# Continue — Fixed Marketplace Horse Images & Full Site Image Audit

**Boot order:** this file → `../../docs/next-session-notes.md` → execute Next action.  
**Sprint plan:** `../../docs/plans/2026-08-05-two-horse-list-go-live.md`  

## Last action

2026-08-10: **Updated campaign status badges for First Gear, Prudentia, and Hottathanafantasy to Fully Subscribed**.
- **Change:** Set `campaign_status` to `fully_subscribed`, `shares_sold` to `20`, and `marketplace_visible` to `true` across `src/data/hlts.json`.
- **Verification:** Verified full Next.js production build (`85/85` pages compiled cleanly).

## Next action

1. Ensure Google Sheet `hlts` tab reflects `fully_subscribed` status for First Gear, Prudentia, and Hottathanafantasy.
2. Share Interest Signups **Editor** with `evolution-web-admin@evolution-engine.iam.gserviceaccount.com` so primary sheet writes stick.
3. **TML soft-list** / Syndicate OS when ready.

## Do not

- Re-introduce Tokinvest branding or marketplace mentions  
- Re-embed email form inside About scroll content  
- Post bare `/` for paid/social campaigns — always use `?source=<key>`  
