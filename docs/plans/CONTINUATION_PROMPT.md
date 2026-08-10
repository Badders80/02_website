# Design System Implementation — Continuation Prompt

## Context

We're executing a design system establishment for the Evolution Stables website (`/home/evo/evo_01/02_website`). The plan is at `docs/plans/2026-08-11-design-system-establishment.md`. Two rounds of multi-model review (Nemotron, DeepSeek, Kimi) have been completed. Reviews are saved in `docs/plans/review-*.md` and `docs/plans/review2-*.md`.

## What's Done

### Ponytail Cleanup (Complete)
- Phase 1 safe cuts executed: 67 files deleted, ~20MB freed, build passes. Commits `ad4d96a` and `bb0c7fa`.
- Phase 2 verified by Kimi: admin/ → ARCHIVE, sandbox/ → DELETE, GCP remnants safe to cut, `api/applications/` must KEEP (live callers), `insights.ts` and `marketplace-release-stage.ts` must KEEP (live).
- **Phase 2 cleanup NOT yet executed** — admin archive, sandbox delete, GCP remnant delete, agent dir untrack, stale doc shrink. This should happen before design system work starts.

### Design System Plan (Written, Reviewed x2, 4 Fixes Remaining)
- Plan uses **shadcn** for standard primitives (`npx shadcn add card badge input textarea label select dialog tabs table checkbox`), custom only for Evo-specific components (Container, LogoCarousel, KycBadge, CampaignStatusBadge, TypeWriter).
- Key decisions: stay Tailwind v3, keep warm greyscale + 4 Better Stack cool neutrals as supplements, gold `#d4a964` as single accent, Geist Sans font, Container primitive for shared max-width, no ad hoc components going forward.
- TypeWriter enhanced with Render-style cycling word animation (type/hold/delete/next + blinking cursor).
- Login page reskin task added (current page looks low-budget).
- Sandbox pages changed from sweep to delete (dead code).
- Deferred: marketplace lag (`force-dynamic` → ISR), homepage narrative restructure ("factorial" → ownership journey).

### 4 Fixes to Apply Before Execution (from round 2 reviews)
All three models (Nemotron, DeepSeek, Kimi) agreed on these:

1. **BUILD-BREAKER: `accent` and `accent-hover` never registered in Tailwind config.** The plan uses `text-accent`, `bg-accent`, `hover:bg-accent-hover` everywhere but the existing config only has `gold` and `gold-hover`. Fix: add `"accent": "var(--brand-gold)"` and `"accent-hover": "var(--brand-gold-hover)"` to `tailwind.config.ts` colors.

2. **shadcn `base-nova` style may not exist.** `components.json` says `"style": "base-nova"`. Verify `npx shadcn@latest add` works with this style. If not, switch to `"new-york"`.

3. **shadcn oklch vars in `globals.css` `@layer base` conflict with Evo tokens.** Lines 166-247 of globals.css have light-mode `:root` oklch vars and `.dark` vars from the initial shadcn install. Installed shadcn primitives will reference these, not our Evo tokens. Need to remap `--card`, `--popover`, `--primary`, `--secondary`, `--input`, `--border`, `--ring` etc. to reference Evo CSS vars.

4. **TypeWriter JS animation not stopped by `prefers-reduced-motion` CSS.** The CSS media query stops CSS animations but not JS `setTimeout`-driven typing. Add a JS check: `window.matchMedia('(prefers-reduced-motion: reduce)').matches` — if true, skip animation and show first word immediately.

## What to Do Next

1. **Apply the 4 fixes** to the plan document (`docs/plans/2026-08-11-design-system-establishment.md`)
2. **Execute Ponytail Phase 2** — archive admin, delete sandbox + dead GCP code, untrack agent dirs, shrink stale docs. Build must pass after.
3. **Start design system execution** — dispatch subagents task-by-task through the plan, starting with Phase 1 (token foundation).

## Key Files
- Plan: `docs/plans/2026-08-11-design-system-establishment.md`
- Reviews: `docs/plans/review-nemotron.md`, `docs/plans/review-deepseek.md`, `docs/plans/review2-nemotron.md`, `docs/plans/review2-deepseek.md`, `docs/plans/review2-kimi.md`
- Kimi Phase 2 audit: `/home/evo/.hermes/cache/delegation/subagent-summary-1-20260811_100648_564401.txt`
- Current tokens: `src/styles/globals.css`
- Current config: `tailwind.config.ts`
- shadcn config: `components.json`

## Rules
- shadcn for standard primitives, custom only for Evo-specific
- No ad hoc components going forward — everything uses primitives
- Build must pass after every task, commit after every task
- Dual-model review pattern: dispatch Nemotron + DeepSeek + Kimi for independent verification
- Keep notes, don't surface unless asked
- Caveman: short, no filler. TLDR first always. WSL paths.