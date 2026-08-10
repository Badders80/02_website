## VERDICT: NEEDS REVISION

### Critical Issues

**1. `accent` color is used everywhere but never registered in `tailwind.config.ts`**

The plan introduces `bg-accent`, `text-accent`, `border-accent/30`, `hover:bg-accent-hover`, and `via-accent` in Tasks 7, 7.5, 8, 9, 11, 14, etc. However, Task 2 only registers `muted-steel`, `steel-border`, `frost`, `pure-white`, `success`, `warning`, and `error`. There is no `accent` or `accent-hover` entry. This is a build-breaker: every one of those utility classes will generate no CSS. Fix by adding to Task 2:

```typescript
"accent": "var(--brand-gold)",
"accent-hover": "var(--brand-gold-hover)",
```

**2. shadcn base-nova variables conflict with the existing Evo warm palette**

The current `globals.css` already has a shadcn-style `@layer base :root` block using `oklch` light-mode values for `--background`, `--primary`, `--card`, etc. Installed shadcn components (Card, Dialog, Select, etc.) rely on these CSS variables. Unless the site explicitly applies a `.dark` class, components will render with the wrong (light) palette. The plan assumes shadcn components "automatically pick up our token layer," but they reference `--background`/`--primary`, not `--color-background`/`--brand-gold`. You need to either:

- Remap the shadcn variables in `@layer base` to the Evo tokens (e.g., `--background: var(--color-background)`, `--primary: var(--brand-gold)`), or
- Add all shadcn-expected Tailwind theme colors (`primary`, `secondary`, `muted`, `accent`, `destructive`, `card`, `popover`, `border`, `input`, `ring`) to `tailwind.config.ts` pointing at the correct CSS vars, and ensure the site is always in dark mode.

**3. Existing `button.tsx` default variant already uses unmapped `bg-primary` / `text-primary-foreground`**

The current config does not define `primary`, yet the default button variant uses it. This suggests the default Button is already visually broken (or relies on undocumented config). Adding an `accent` variant without fixing the underlying theme mapping is insufficient. Task 7.5 should also register `primary`/`primary-foreground` (and other shadcn core colors) to match the design system, or the default variant should be rewritten to use `accent`/`pure-white`.

### Remaining Gaps

- **Sheet/Slide-over primitive is still missing.** It was listed in "What's missing" but never added to Phase 2. If mobile slide-overs are needed later, this will require another pass.
- **No strategy for shadcn core color theme mapping.** The plan needs an explicit task or step to register `primary`, `secondary`, `muted`, `destructive`, `card`, `popover`, `border`, `input`, `ring` in `tailwind.config.ts` so installed primitives don't fall back to light-mode oklch values.
- **LogoCarousel edge-fade masks are fragile for reuse.** The masks use `from-canvas to-transparent`, which works on the `#030303` page background but will look wrong if the carousel is placed on `bg-surface-base` or another surface. Document the limitation or add a `fadeFrom`/`backgroundColor` prop.
- **No explicit dark-mode contract.** The plan should state whether the root element has `class="dark"` applied (and verify it), or whether the shadcn variables are remapped unconditionally.
- **Reduced-motion query may break `LogoCarousel` usability on reduced-motion systems** if it fully stops all animations with `!important`. That's generally correct behavior, but consider adding a static duplicate-row fallback for the carousel.

### What was fixed well since v1

- Primitives now come from shadcn CLI (`npx shadcn add`) rather than hand-rolled components, which reduces maintenance burden and improves a11y/Radix behavior.
- Status color aliases (`success`, `warning`, `error`) and `prefers-reduced-motion` were added, addressing reviewer concerns.
- Button `accent` variant concept is correct (gold bg / white text) once the color mapping exists.
- `LogoCarousel` correctly abandons the broken `next/image fill` pattern for plain `<img>` with explicit dimensions and a duplicated track for seamless scrolling.
- `TypeWriter` now has a sound cycling state machine (type → hold → delete → next) and a token-colored blinking cursor.
- The neutral decision matrix and WCAG contrast table in `DESIGN.md` clearly codify when warm vs. cool neutrals are safe to use.
- `Table` and `Checkbox` were added to Phase 2 where they were missing.
- Sandbox scope was wisely changed from tokenise to delete.
- Login reskin task was added and correctly scoped to primitives + tonal surfaces.
