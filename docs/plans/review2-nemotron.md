## VERDICT: NEEDS REVISION

### Critical Issues

**1. shadcn "base-nova" style does not exist in the official registry**
- `components.json` specifies `"style": "base-nova"` — only `"default"` and `"new-york"` are valid shadcn styles. Running `npx shadcn@latest add card` will either fail or fall back to default, producing components that don't match the expected API. Must change to `"default"` or `"new-york"` before any `shadcn add` commands.

**2. Missing Tailwind tokens referenced in primitive customisations**
- Task 7 (Badge variants) references `success-text`, `warning-text`, `error-text` — only `success`, `warning`, `error` are added in Task 2. These don't exist in Tailwind config.
- Task 7 (Input/Textarea) references `ring-accent` — not in Tailwind config. Only `accent` (color) exists.
- Task 7.5 (Button accent variant) uses `text-pure-white` — `pure-white` exists as color but `text-pure-white` utility won't exist unless added to `colors` (it is, so this works).
- **Fix:** Add `success-text: "var(--success-text)"`, `warning-text: "var(--warning-text)"`, `error-text: "var(--error-text)"`, and `ring-accent: "var(--brand-gold)"` to Tailwind config in Task 2.

**3. base-ui + shadcn (Radix) mixing risk**
- `button.tsx` uses `@base-ui/react/button` (headless UI), but Tasks 7, 8, 7.5 install shadcn components built on Radix primitives. Two different headless libraries = duplicated logic, potential conflicts, inconsistent behaviour. **Recommendation:** Either migrate button to shadcn Button (Radix) or install all primitives from base-ui. Since shadcn is the declared standard, rewrite `button.tsx` as a shadcn Button wrapper.

**4. Card variant implementation underspecified**
- Task 7 says "add variant support by modifying card.tsx" but shadcn Card is a set of compound components (`Card`, `CardHeader`, `CardContent`, `CardFooter`), not a single CVA component. Adding `elevated`/`inset`/`outline` variants requires either:
  - A wrapper component that composes the Card parts with variant classes, or
  - Extending each sub-component with `className` overrides.
- Current plan lacks implementation detail — will cause inconsistency.

**5. Task 19.5 (login reskin) depends on Button accent variant from Task 7.5**
- Execution order is correct (Phase 5 after Phase 2), but verify Task 7.5 completes before Task 19.5 starts.

---

### Remaining Gaps

| Gap | Location | Severity |
|-----|----------|----------|
| `ring-accent`, `success-text`, `warning-text`, `error-text` missing from Tailwind config | Task 2 | Critical (build breaks) |
| `"base-nova"` → `"default"` or `"new-york"` in `components.json` | Pre-requisite | Critical (shadcn add fails) |
| Button rewrite to use shadcn/Radix instead of base-ui | `src/components/ui/button.tsx` | High (architectural inconsistency) |
| Card variant implementation spec | Task 7 | High (incomplete spec) |
| Sheet/Slide-over primitive not in plan | Phase 2 | Medium (mobile UX gap) |
| Toast/Notification primitive not in plan | Phase 2 | Medium (feedback gap) |
| Avatar, Separator, Tooltip, Popover not in plan | Phase 2 | Low (may not be needed yet) |
| `prefers-reduced-motion` disables `cursor-blink` but not `logo-scroll` | Task 1 + 15 | Low (animation persists) |
| `LogoCarousel` uses `bg-canvas` for edge fade — correct token? | Task 15 | Low (verify `--color-background` = `#030303`) |

---

### What Was Fixed Well Since v1

| Improvement | Why It Matters |
|-------------|----------------|
| Primitives via `npx shadcn add` instead of hand-written | Consistency, a11y, maintenance |
| Status colour aliases (`success`, `warning`, `error`) in Tailwind | Enables Badge primitive variants |
| Button accent variant (gold bg, white text) | Login reskin + CTA consistency |
| `prefers-reduced-motion` in globals.css | WCAG 2.3.3 compliance |
| TypeWriter cycling mode + blinking cursor | Hero animation parity with Render |
| LogoCarousel uses plain `<img>` (not `next/image` fill) | Fixes layout breakage, simpler |
| Neutral decision matrix in DESIGN.md | Codifies warm vs cool token usage |
| WCAG contrast table documenting cool neutrals for UI chrome only | Prevents misuse on body text |
| Table + Checkbox primitives added | Covers PedigreeTable + KYC forms |
| Sandbox pages → delete (not sweep) | Removes dead code cleanly |
| Login page reskin task added | High-visibility page fixed properly |

---

### Required Revisions Before Execution

1. **Change `components.json` style to `"default"` or `"new-york"`** — do this first, before any `shadcn add`.
2. **Add missing Tailwind tokens in Task 2**: `ring-accent`, `success-text`, `warning-text`, `error-text`.
3. **Rewrite `button.tsx` as shadcn Button wrapper** (Radix) — drop `@base-ui/react/button`.
4. **Specify Card variant implementation** in Task 7 (wrapper component approach recommended).
5. **Add `logo-scroll` to `prefers-reduced-motion` disable list** in Task 1.
6. **Verify `bg-canvas` edge fade on LogoCarousel matches page background** — it does (`--color-background` = `#030303`), but confirm no transparency issues.

Once these are addressed, the plan is technically sound and executable.
