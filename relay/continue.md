# Continue — SEO phase 2 in flight; Manolo listing (Alex)

**Boot order:** this file → `../../docs/next-session-notes.md` → execute Next action.  
**Do not** open `GAME_PLAN.md` or list the monorepo first.  
**Start here file:** `../00_START_HERE.md`  
**Protocol:** `../../docs/SESSION_PROTOCOL.md`

## Last action

2026-07-16 — SEO Phase 2 started on branch `seo-phase2-internal-links` (no deploy yet):
- Related Articles + Next-steps hubs on insights (marketplace / returns / FAQ)
- BreadcrumbList JSON-LD on insights + `/learn/returns`
- `llms.txt` polish (cite list, preferred language, anti-hallucination)
- Phase 1 verified **live** (www, sitemap prune, llms, returns)

Alex working **I Stole A Manolo listing** separately — do not collide on marketplace horse page / horses.json / terms modal.

## Next action

1. **Review + merge** `seo-phase2-internal-links` when build is clean (Alex or agent).  
2. **Deploy** after review — then re-curl `/llms.txt` + sample insight HTML for Related block.  
3. **Manolo (Alex):** listing content / docs; agent stays off that surface unless asked.  
4. After Manolo listing stable: schema offer honesty (`InStock` vs kill-switch + lifecycle) — only then.  
5. Controlled open remaining lots only when PDS/SA ready. Kill-switch stays **OFF** until founder intent.

## Why

Phase 1 crawl/content foundation is live. Remaining SEO leverage is internal graph + listing depth (Manolo first), not more crawl rewrites.

## Open threads

- Thin press/race report triage (merge or leave)  
- PDF e-sign deferred  
- Nellie / TML draft  
- GSC baseline if credentials available  

## Do not

- Casual `PURCHASES_ENABLED=true` without docs  
- Re-run Phase 1 crawl fixes (done + live)  
- Touch Manolo listing files while Alex owns that track  
- Refund / wipe holdings without ask  
- GAME_PLAN as boot  

## Key paths

| What | Path |
|------|------|
| Related insights | `src/components/seo/RelatedInsights.tsx` |
| Breadcrumbs | `src/components/seo/BreadcrumbJsonLd.tsx` |
| Insights page | `src/app/insights/[slug]/page.tsx` |
| llms.txt | `public/llms.txt` |
| SEO Phase 1 relay (done) | `relay/2026-07-13-seo-phase1-llms-content.md` |
