## VERDICT: NEEDS REVISION

The plan is well-structured and covers the right scope, but it contains several critical technical errors that will break the build or cause visual regressions. The token system is sound, but the primitive implementations need corrections before execution.

---

### Critical Issues (must fix before execution)

1. **Badge component references undefined Tailwind color names**
   In `Task 7` (Badge), variants use `bg-success/10`, `text-success-text`, `border-success/30`, and similarly `warning`, `error`. The Tailwind config only defines `success-bg`, `success-text`, `success-border` (and `warning-*`, `error-*`), not `success`, `warning`, or `error`. This will cause the build to fail or the classes to be silently ignored.
   **Fix:** Use the existing aliases (e.g., `bg-success-bg/10`, `text-success-text`, `border-success-border/30`) or add proper aliases to the Tailwind config.

2. **LogoCarousel uses `fill` with contradictory classes**
   `Task 17` uses `next/image` with `fill` and simultaneously adds `className="!relative !h-full !w-auto"`. `fill` sets `position: absolute` by default; adding `!relative` overrides that and breaks the layout entirely. The image will likely render with zero dimensions.
   **Fix:** Remove `fill` and use explicit `width`/`height` props, or keep `fill` and remove the conflicting classes. For a fixed-height carousel, using `width`/`height` is simpler and more predictable.

3. **Rounded corner mapping is inconsistent**
   The plan says `rounded-xl` → `rounded-lg` (assuming 12px), but the Tailwind config sets `rounded-lg: 16px` and `rounded-md: 12px`. Using `rounded-lg` for inputs/nav will change the radius from 12px to 16px. Also, the Card primitive uses `rounded-lg` (16px) but many existing cards use `rounded-2xl` (32px). Replacing them will cause a visual change.
   **Fix:** Use `rounded-md` (12px) for inputs/nav and decide on a single card radius (16px or 24px) and apply consistently.

4. **Button primitive lacks an `accent` variant**
   The login reskin (Task 21.5) plans to use a Button "accent variant", but the existing `button.tsx` has no such variant. The plan only overrides with `!bg-zinc-900/80`, which is not token-driven and contradicts the design system goal.
   **Fix:** Add an `accent` variant to `button.tsx` (gold background, white text) before the login reskin.

5. **`scrollbar-none` class is undefined**
   `Task 10` (Tabs) uses `scrollbar-none`, which is not a standard Tailwind utility and is not defined anywhere in the plan. It will simply be ignored, but it indicates an incomplete utility set.
   **Fix:** Either remove it or add a custom utility (e.g., `::-webkit-scrollbar { display: none; }`).

---

### High-Priority Gaps (should fix)

1. **Missing Table primitive**
   PedigreeTable remains raw HTML with inline styling. The plan lists “No Table primitive” as a gap but does not implement one. A reusable Table would be useful for the pedigree and any future data tables.

2. **Missing Sheet/Slide-over primitive**
   The plan explicitly mentions “No Sheet/Slide-over primitive” but does not create one. If mobile navigation or action panels need this, it should be added or explicitly deferred with a reason.

3. **No accessibility in Modal and Tabs**
   - Modal: no `role="dialog"`, `aria-modal`, focus trap, or `aria-labelledby`.
   - Tabs: no `role="tablist"`, `role="tab"`, `aria-selected`, or keyboard navigation.
   These are essential for a design system and should be included.

4. **Ambiguous token mapping for `text-white/40` and similar**
   The plan maps `text-white/40` → `text-muted-foreground` and `text-white/60` → `text-frost`. However, in many contexts `text-white/40` might be better as `text-muted` or `text-muted-steel`. The plan does not provide a decision tree for when to use each token. This could lead to inconsistent text colors.

5. **No visual regression testing strategy**
   With 632 ad-hoc values being replaced, there is high risk of unintended visual changes. The plan only mentions manual visual diff at the end. Adding a screenshot diffing tool (e.g., Playwright, Chromatic) or at least a checklist of key pages before/after would be prudent.

---

### Minor Issues (nice to fix)

1. **Container could support `asChild`** for polymorphic usage (e.g., render as `<section>` or `<div>`).
2. **Card uses a simple variant object** rather than CVA; consistency with Badge and Button would be nicer.
3. **Modal** uses `React.useState` to gate mounting; this is safe but can cause a flash of missing content. Ensure no hydration mismatch.
4. **LogoCarousel** could add `prefers-reduced-motion` support to disable animation.
5. **Token names** – `surface-base` and `raised` are slightly redundant; consider `surface` and `surface-raised` for clarity.

---

### What the plan gets right

- **Comprehensive token foundation** – clearly defined warm/cool neutrals, elevation system, and dot-grid utility.
- **Correct dependency order** – tokens → primitives → page application, with commits after each step.
- **Incremental sweep** – breaking the sweep into small, per-file tasks reduces risk.
- **Dead code cleanup** – deleting sandbox pages and the `isSandbox` prop is a good housekeeping step.
- **Documentation** – creating `DESIGN.md` as a living spec is excellent.
- **Scope control** – deferring performance and content restructure to separate tasks keeps the design system focused.
- **Preservation of existing animations and noise texture** – avoids unnecessary disruption.

The plan is close to being executable, but the critical issues above must be addressed first to avoid build failures and visual regressions. Once fixed, the execution order is sound and the design system will provide a solid foundation.
