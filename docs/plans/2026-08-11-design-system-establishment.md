# Design System Establishment + Targeted Reskin

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Establish a proper design token system and component primitive layer so every card, modal, input, badge, and popup across the site is built from the same templated foundation — reactive to token changes and visually consistent.

**Architecture:** Three-layer system: (1) token foundation in `globals.css` + `tailwind.config.ts`, (2) reusable primitive components in `src/components/ui/`, (3) composite components and pages consuming primitives. Stay on Tailwind v3. Keep current warm greyscale as base. Add 4 Better Stack cool-neutral supplements (Muted Steel, Steel Border, Frost, Pure White) for text/border roles. Add dot-grid background texture and tonal surface layering to marketplace + mystable. Build scrolling partner logo carousel for homepage. Codify Evo-specific patterns (campaign badges, KYC states, purchase flow) as token-driven primitives.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 3.4, base-ui, class-variance-authority, clsx, tailwind-merge, Geist Sans (self-hosted)

---

## Current State Summary

### What exists (keep)
- `src/styles/globals.css` — CSS variables for colours, brand gold, status/role/KYC badges, font config, animations, noise texture overlay, glass-streak and masked-border utilities
- `tailwind.config.ts` — `theme.extend` with CSS var references, fontFamily, fontSize, letterSpacing, borderRadius, animations, keyframes
- `src/components/ui/button.tsx` — shadcn button with cva variants (default, outline, secondary, ghost, destructive, link) and sizes (xs through icon-lg). Uses `@base-ui/react/button`
- `src/components/ui/GlowPillButton.tsx` — custom pill button with hardcoded `text-white/70`, `border-white/[0.06]`, `text-[11px]`
- `src/components/ui/ComingSoonOverlay.tsx` — glassmorphic overlay, hardcoded `bg-black/40`, `border-white/[0.06]`
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)
- `src/components/sections/PressShowcaseSection.tsx` — has partner logos in a static grid (`AS FEATURED IN`), 7 logos with per-logo opacity adjustments
- `src/dna/content/press.json` — press articles data
- Noise texture already on body via `body::after` (SVG fractalNoise, 0.03 opacity)
- `components.json` — shadcn config (style: base-nova, baseColor: neutral, cssVariables: true)

### What's missing (build)
- **No Card primitive** — 50+ inline instances of `rounded-2xl border border-white/[0.06] bg-white/[0.01] p-8`, all slightly different
- **No Modal/Dialog primitive** — modals built ad-hoc per file (`fixed inset-0 bg-black/45 backdrop-blur`)
- **No Input/Select/Textarea primitives** — raw `<input>` with inline classes everywhere
- **No Badge primitive** — status/KYC/campaign badges hand-coded with different rgba per file
- **No Table primitive** — PedigreeTable is raw HTML with inline styling
- **No Tabs primitive** — DetailTabs is custom, not reusable
- **No Sheet/Slide-over primitive** — no mobile slide-over pattern
- **No dot-grid background** — noise texture exists but not the Better Stack dot grid
- **632 ad-hoc styling values** across 75 files (text-white/40, border-white/[0.06], text-[#d4a964], bg-black, etc.)

### Token gap analysis

| Current CSS var | Current value | Plan token | Plan value | Action |
|----------------|---------------|------------|------------|--------|
| `--color-background` | `#030303` | (keep) | `#030303` | Keep — page canvas |
| `--color-surface` | `#0a0a0a` | (keep) | `#0a0a0a` | Keep — card surface |
| `--color-surface-alt` | `#111111` | (keep) | `#111111` | Keep — elevated surface |
| `--color-border` | `rgba(255,255,255,0.1)` | (keep) | `rgba(255,255,255,0.1)` | Keep — hairline border |
| `--color-foreground` | `rgba(255,255,255,0.5)` | (keep) | `rgba(255,255,255,0.5)` | Keep — body text |
| `--color-heading` | `#f8fafc` | (keep) | `#f8fafc` | Keep — heading text |
| `--color-muted` | `#a1a1aa` | (keep) | `#a1a1aa` | Keep — muted text |
| `--color-muted-foreground` | `#737373` | (keep) | `#737373` | Keep — subdued text |
| `--brand-gold` | `#d4a964` | (keep) | `#d4a964` | Keep — accent |
| (none) | — | `--muted-steel` | `#646e87` | **Add** — secondary text, inactive nav |
| (none) | — | `--steel-border` | `#939db8` | **Add** — primary hairline, icon outlines |
| (none) | — | `--frost` | `#c9d3ee` | **Add** — active nav, light headings |
| (none) | — | `--pure-white` | `#ffffff` | **Add** — primary heading, button text |

---

## Phase 1: Token Foundation

### Task 0: Apply round-2 fixes — accent tokens, oklch remap, shadcn style verify

**Objective:** Apply the 4 fixes from round-2 reviews before any other task. These are prerequisites — the plan references `accent`/`accent-hover` everywhere but they don't exist in Tailwind config, and shadcn's oklch vars will override our token layer.

**Files:**
- Modify: `tailwind.config.ts` (add accent + accent-hover to colors)
- Modify: `src/styles/globals.css` (remap oklch `@layer base` vars to reference Evo tokens)
- Verify: `components.json` (shadcn style — verify or fix)

**Fix 1: Register `accent` and `accent-hover` in Tailwind config**

In `tailwind.config.ts`, `theme.extend.colors`, after the Brand section (after `"gold-hover": "var(--brand-gold-hover)"`), add:

```typescript
        // Accent (single source of truth for gold — used by all primitives)
        "accent": "var(--brand-gold)",
        "accent-hover": "var(--brand-gold-hover)",
```

This makes `text-accent`, `bg-accent`, `hover:bg-accent-hover`, `border-accent`, `ring-accent` all work. Every task in this plan uses `text-accent` / `bg-accent` — this is the build-breaker fix.

**Fix 2: Verify shadcn `base-nova` style works**

Run:
```bash
cd /home/evo/evo_01/02_website && npx shadcn@latest add card --yes 2>&1 | head -20
```

If it fails or can't find `base-nova` style, update `components.json`:
```json
"style": "new-york"
```

Then re-run the card install. If `base-nova` works, keep it and proceed.

**Fix 3: Remap shadcn oklch vars to Evo tokens**

In `src/styles/globals.css`, the `@layer base` block (lines 166-247) has shadcn's default oklch values for `:root` (light) and `.dark` (dark). These override our Evo token layer — installed primitives will reference these, not our gold/surface/foreground tokens.

Replace the entire `@layer base` `:root` and `.dark` blocks with Evo-token-referencing values:

```css
@layer base {
  .theme {
    --font-heading: var(--font-sans);
    --font-sans: var(--font-sans);
  }
  :root {
    --background: var(--color-background);
    --foreground: var(--color-foreground);
    --card: var(--color-surface);
    --card-foreground: var(--color-foreground);
    --popover: var(--color-surface);
    --popover-foreground: var(--color-foreground);
    --primary: var(--brand-gold);
    --primary-foreground: var(--pure-white);
    --secondary: var(--color-surface-alt);
    --secondary-foreground: var(--color-foreground);
    --muted: var(--color-surface-alt);
    --muted-foreground: var(--color-muted-foreground);
    --accent: var(--brand-gold);
    --accent-foreground: var(--pure-white);
    --destructive: var(--error-text);
    --border: var(--color-border);
    --input: var(--color-border);
    --ring: var(--brand-gold);
    --radius: 16px;
    --sidebar: var(--color-surface);
    --sidebar-foreground: var(--color-foreground);
    --sidebar-primary: var(--brand-gold);
    --sidebar-primary-foreground: var(--pure-white);
    --sidebar-accent: var(--color-surface-alt);
    --sidebar-accent-foreground: var(--color-foreground);
    --sidebar-border: var(--color-border);
    --sidebar-ring: var(--brand-gold);
  }
  .dark {
    /* Dark mode = same as :root — we're dark-only, no light theme */
    --background: var(--color-background);
    --foreground: var(--color-foreground);
    --card: var(--color-surface);
    --card-foreground: var(--color-foreground);
    --popover: var(--color-surface);
    --popover-foreground: var(--color-foreground);
    --primary: var(--brand-gold);
    --primary-foreground: var(--pure-white);
    --secondary: var(--color-surface-alt);
    --secondary-foreground: var(--color-foreground);
    --muted: var(--color-surface-alt);
    --muted-foreground: var(--color-muted-foreground);
    --accent: var(--brand-gold);
    --accent-foreground: var(--pure-white);
    --destructive: var(--error-text);
    --border: var(--color-border);
    --input: var(--color-border);
    --ring: var(--brand-gold);
    --radius: 16px;
    --sidebar: var(--color-surface);
    --sidebar-foreground: var(--color-foreground);
    --sidebar-primary: var(--brand-gold);
    --sidebar-primary-foreground: var(--pure-white);
    --sidebar-accent: var(--color-surface-alt);
    --sidebar-accent-foreground: var(--color-foreground);
    --sidebar-border: var(--color-border);
    --sidebar-ring: var(--brand-gold);
  }
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
  html {
    @apply font-sans;
  }
}
```

Note: The `--accent` var inside `@layer base` now references `var(--brand-gold)` instead of `oklch(0.97 0 0)`. This means shadcn primitives that use `bg-accent` / `text-accent` get gold, not light grey. Same for `--primary`, `--card`, `--popover`, `--border`, `--ring` — all now reference Evo tokens.

Note: `--pure-white` is referenced here before Task 1 adds it to `:root`. This is fine because Task 0 and Task 1 are executed in the same session — Task 1 adds the token, and by then the oklch block already references it. If building between Task 0 and Task 1, add `--pure-white: #ffffff;` to `:root` in this same step as a precaution.

**Fix 4: TypeWriter reduced-motion JS guard**

The existing TypeWriter component (line 25-48) uses `setTimeout`-driven typing. CSS `prefers-reduced-motion` media query stops CSS animations but not JS timers. Add a JS check at the start of the effect:

In `src/components/ui/TypeWriter.tsx`, add a guard at the top of the `useEffect`:

```typescript
  useEffect(() => {
    // Respect reduced-motion — skip animation, show full text immediately
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayedText(text);
      setCurrentIndex(text.length);
      setIsComplete(true);
      return;
    }
    // ... existing logic
  }, [currentIndex, text, speed, delay, loop, isComplete]);
```

This will be expanded in Task 16.5 when we rewrite TypeWriter for cycling mode, but the guard must exist now to satisfy the fix.

**Step 5: Verify build**

Run: `cd /home/evo/evo_01/02_website && npm run build`
Expected: 0 errors, build succeeds

**Step 6: Commit**

```bash
git add tailwind.config.ts src/styles/globals.css src/components/ui/TypeWriter.tsx
git commit -m "fix: apply round-2 fixes — accent tokens, oklch remap, TypeWriter reduced-motion"
```

---

### Task 1: Add supplementary neutral tokens to globals.css

**Objective:** Add the 4 Better Stack cool-neutral tokens + status colour aliases + `--pure-white` (referenced by Task 0 oklch remap) + reduced-motion CSS media query.

**Files:**
- Modify: `src/styles/globals.css` (`:root` block + end of file)

**Step 1: Add tokens to `:root`**

Insert after the existing `--color-border` line (line 23), before the Brand section:

```css
  /* Supplementary neutrals (Better Stack) — for text/border roles where cool tones read better */
  --muted-steel: #646e87;
  --steel-border: #939db8;
  --frost: #c9d3ee;
  --pure-white: #ffffff;

  /* Status colour shortcuts for Badge primitive */
  --color-success: #22c55e;
  --color-warning: #eab308;
  --color-error: #ef4444;
```

**Step 2: Add prefers-reduced-motion to globals.css**

Add at the end of the file, after all animations:

```css
/* Accessibility — respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Step 3: Verify build**

Run: `cd /home/evo/evo_01/02_website && npm run build`
Expected: 0 errors, build succeeds

**Step 4: Commit**

```bash
git add src/styles/globals.css
git commit -m "feat(tokens): add Better Stack neutrals, status colours, reduced-motion"
```

---

### Task 2: Register supplementary tokens in Tailwind config

**Objective:** Map the 4 new CSS variables to Tailwind colour tokens so they can be used as `text-muted-steel`, `border-steel-border`, `text-frost`, `text-pure-white`.

**Files:**
- Modify: `src/tailwind.config.ts` (the `theme.extend.colors` block)

> **Note:** `accent` and `accent-hover` were already added in Task 0 (Fix 1). Task 2 adds the remaining supplementary neutrals + status shortcuts.

**Step 1: Add colour mappings**

Insert into the `colors` object, after the `accent-hover` mapping from Task 0:

```typescript
        // Supplementary neutrals (Better Stack)
        "muted-steel": "var(--muted-steel)",
        "steel-border": "var(--steel-border)",
        "frost": "var(--frost)",
        "pure-white": "var(--pure-white)",

        // Status colour shortcuts (for Badge primitive)
        "success": "var(--color-success)",
        "warning": "var(--color-warning)",
        "error": "var(--color-error)",
```

**Step 2: Verify build**

Run: `npm run build`
Expected: 0 errors

**Step 3: Commit**

```bash
git add tailwind.config.ts
git commit -m "feat(tokens): register supplementary neutrals in Tailwind config"
```

---

### Task 3: Add dot-grid background utility

**Objective:** Add a CSS utility class for the Better Stack dot-grid texture. This is separate from the existing noise texture (which stays). The dot grid gives the "developer/technical" surface texture that prevents flat black.

**Files:**
- Modify: `src/styles/globals.css` (add to the `@layer utilities` block, after the existing `masked-border` utility around line 301)

**Step 1: Add the utility**

```css
  .dot-grid {
    background-image: radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px);
    background-size: 24px 24px;
    background-position: 0 0;
  }
  .dot-grid-sm {
    background-image: radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 16px 16px;
  }
```

**Step 2: Verify build**

Run: `npm run build`
Expected: 0 errors

**Step 3: Commit**

```bash
git add src/styles/globals.css
git commit -m "feat(tokens): add dot-grid background utility"
```

---

### Task 4: Add surface elevation tokens

**Objective:** Define the tonal layering system as semantic tokens. Better Stack uses 3 elevation levels (canvas → surface → elevated). We already have the values; we need to formalise them as elevation tokens.

**Files:**
- Modify: `src/styles/globals.css` (add to `:root` block)
- Modify: `tailwind.config.ts` (add to `theme.extend.colors`)

**Step 1: Add elevation CSS vars**

In `:root`, after the supplementary neutrals:

```css
  /* Elevation system — tonal layering for depth without shadows */
  --elevation-canvas: var(--color-background);    /* page background */
  --elevation-surface: var(--color-surface);      /* cards, one step up */
  --elevation-raised: var(--color-surface-alt);   /* elevated cards, inputs */
```

**Step 2: Add Tailwind mappings**

In `tailwind.config.ts` colors:

```typescript
        // Elevation system
        "canvas": "var(--elevation-canvas)",
        "surface-base": "var(--elevation-surface)",
        "raised": "var(--elevation-raised)",
```

**Step 3: Verify build**

Run: `npm run build`
Expected: 0 errors

**Step 4: Commit**

```bash
git add src/styles/globals.css tailwind.config.ts
git commit -m "feat(tokens): add elevation system tokens for tonal layering"
```

---

### Task 5: Write DESIGN.md token spec

**Objective:** Create a formal DESIGN.md file (Google's design token spec) as the human-readable source of truth for the design system. This is what the brand-guidelines page will eventually be generated from.

**Files:**
- Create: `DESIGN.md` (project root)

**Step 1: Write the spec**

```markdown
---
version: alpha
name: Evolution Stables
description: Regulated thoroughbred digital syndication. Authoritative, premium dark theme with gold accent.
colors:
  background: "#030303"
  surface: "#0a0a0a"
  surfaceAlt: "#111111"
  foreground: "rgba(255,255,255,0.5)"
  heading: "#f8fafc"
  muted: "#a1a1aa"
  mutedForeground: "#737373"
  border: "rgba(255,255,255,0.1)"
  accent: "#d4a964"
  accentHover: "#c49a5a"
  mutedSteel: "#646e87"
  steelBorder: "#939db8"
  frost: "#c9d3ee"
  pureWhite: "#ffffff"
typography:
  body:
    fontFamily: Geist Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: "1.7"
    letterSpacing: "-0.02em"
  heading:
    fontFamily: Geist Sans
    fontSize: 56px
    fontWeight: 400
    lineHeight: "1.1"
    letterSpacing: "-0.02em"
  label:
    fontFamily: Geist Sans
    fontSize: 11px
    fontWeight: 500
    letterSpacing: "0.2em"
rounded:
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  pill: 9999px
spacing:
  card: 24px
  section: 80px
  element: 20px
  max: 1200px
components:
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: 24px
  card-elevated:
    backgroundColor: "{colors.surfaceAlt}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: 24px
  badge:
    backgroundColor: "rgba(212,169,100,0.1)"
    textColor: "{colors.accent}"
    rounded: "{rounded.pill}"
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.pureWhite}"
    rounded: "{rounded.lg}"
  button-primary-hover:
    backgroundColor: "{colors.accentHover}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
---

# Evolution Stables Design System

## Overview

Premium dark theme for regulated thoroughbred digital syndication. Authoritative, not flashy. Gold accent is the only colour that isn't a neutral. Depth comes from tonal layering (canvas → surface → raised) and hairline borders, not drop shadows.

## Colors

**Base palette (warm greyscale — keep):**
- Background (`#030303`) — page canvas, darkest layer
- Surface (`#0a0a0a`) — card surfaces, one step above canvas
- Surface Alt (`#111111`) — elevated cards, input backgrounds
- Foreground (`rgba(255,255,255,0.5)`) — body text
- Heading (`#f8fafc`) — heading text
- Muted (`#a1a1aa`) — muted text
- Muted Foreground (`#737373`) — subdued text
- Border (`rgba(255,255,255,0.1)`) — hairline borders

**Supplementary neutrals (Better Stack — cool tones for specific roles):**
- Muted Steel (`#646e87`) — secondary text, inactive nav items, subdued borders
- Steel Border (`#939db8`) — primary hairline border, icon outlines, nav borders
- Frost (`#c9d3ee`) — active nav text, icon strokes, light-on-dark headings
- Pure White (`#ffffff`) — primary heading text emphasis, button text

**Accent:**
- Gold (`#d4a964`) — the single accent colour. Links, active states, badges, highlights. Nowhere else uses colour.

## Typography

Geist Sans (self-hosted variable font, 100-900 weight range). Fallback: system-ui stack.

- Body: 16px / 400 / 1.7 line-height / -0.02em
- Headings: 56px down to 24px / 400 / 1.1-1.25 line-height / -0.02em
- Labels: 11px / 500 / 0.2em letter-spacing / uppercase

Type scale: Major Second (1.125) from 16px base. 8 steps: 13px → 53px.

## Layout & Spacing

- Base unit: 4px
- Section gap: 80px
- Card padding: 24px
- Element gap: 20px
- Max width: 1200px

## Elevation & Depth

Three-layer tonal system — no drop shadows:

1. **Canvas** (`#030303`) — page background. Dot-grid texture overlay optional.
2. **Surface** (`#0a0a0a`) — cards, modals, panels. One step lighter than canvas.
3. **Raised** (`#111111`) — elevated cards within cards, input backgrounds. One step lighter again.

Borders define edges, not shadows. Hairline 1px `rgba(255,255,255,0.1)` on surface boundaries. Inset white highlight (`rgba(255,255,255,0.25) 0px 1px 3px inset`) for button/element depth.

## Shapes

- Inputs/Nav: 12px radius
- Cards: 16px radius
- Pills/Badges: 9999px (full)
- Small: 8px radius

## Components

All components reference tokens only — no hardcoded hex or opacity values.

- **Card** — surface background, hairline border, 16px radius, 24px padding
- **Card Elevated** — raised background, for cards within cards
- **Badge** — pill shape, gold-tinted background, gold text
- **Button Primary** — gold background, white text, 12px radius
- **Input** — surface background, hairline border, 12px radius

## Do's and Don'ts

**Do:**
- Use `text-accent` for all gold instances
- Use `bg-canvas`, `bg-surface-base`, `bg-raised` for elevation
- Use `dot-grid` utility on page backgrounds for texture
- Use `border-border` for all hairline borders
- Reference tokens, never raw hex

**Don't:**
- Hardcode `text-[#d4a964]` — use `text-accent`
- Hardcode `bg-black` — use `bg-canvas`
- Hardcode `border-white/[0.06]` — use `border-border`
- Hardcode `text-white/40` — use `text-muted-foreground` or `text-muted-steel`
- Use drop shadows — use tonal layering + hairline borders
- Mix warm and cool neutrals in the same component — pick one per context

**Neutral decision matrix — when to use which token:**

| Context | Text | Border | Background |
|---------|------|--------|------------|
| Primary content (cards, modals) | `text-foreground` / `text-heading` | `border-border` | `bg-surface-base` |
| Navigation, chrome, data-dense UI | `text-muted-steel` / `text-frost` | `border-steel-border` | `bg-raised` |
| Form inputs, elevated panels | `text-heading` | `border-border` | `bg-canvas` (input bg) / `bg-surface-base` (field bg) |
| Gold-accent actions | `text-accent` | `border-accent/30` | `bg-accent/10` |
| Inactive/disabled | `text-muted-foreground` | `border-border` | — |
| Labels, micro-text | `text-muted-foreground` (warm) or `text-muted-steel` (cool) | — | — |

**WCAG contrast notes:**

The cool neutrals (Muted Steel, Steel Border) have lower contrast on warm dark surfaces than the warm neutrals. They are intended for UI chrome (inactive nav, subdued borders, icon outlines) — not body text. Use warm neutrals (`text-muted-foreground`, `text-foreground`) for all readable text. Use cool neutrals only for decorative/structural elements where WCAG text contrast requirements don't apply.

| Token | Value | On `#0a0a0a` | WCAG | Safe use |
|-------|-------|-------------|------|----------|
| `text-foreground` | rgba(255,255,255,0.5) | ~7.5:1 | ✅ AA | Body text |
| `text-muted-foreground` | #737373 | ~4.5:1 | ✅ AA (large) | Subdued text |
| `text-muted-steel` | #646e87 | ~3.8:1 | ❌ AA text | UI chrome only — not body text |
| `text-frost` | #c9d3ee | ~11:1 | ✅ AAA | Active nav, headings |
| `text-heading` | #f8fafc | ~17:1 | ✅ AAA | Headings |
```

**Step 2: Lint the spec**

Run: `cd /home/evo/evo_01/02_website && npx -y @google/design.md lint DESIGN.md`
Expected: exits 0 (warnings OK, errors must be 0)

**Step 3: Commit**

```bash
git add DESIGN.md
git commit -m "docs: add DESIGN.md formal token spec"
```

---

## Phase 2: Primitive Components

> **Principle:** Standard UI primitives (Card, Badge, Input, Textarea, Select, Dialog, Tabs, Label) are installed via shadcn — not hand-rolled. shadcn is already configured (`components.json`: style base-nova, baseColor neutral, cssVariables true). These components are battle-tested, use the same `cn()` helper, and reference CSS variables — so they automatically pick up our token layer. Custom components are built only for things shadcn doesn't have (Container, LogoCarousel, KycBadge, CampaignStatusBadge).
>
> **No ad hoc going forward:** Every new box uses `<Card>`, every popup uses `<Dialog>`, every badge uses `<Badge>`, every input uses `<Input>`. No raw `<div>` with inline surface classes, no raw `<input>` with inline styling, no hand-coded modal `fixed inset-0` patterns.

### Task 6: Build Container primitive (custom — shadcn doesn't have one)

**Objective:** Create a shared layout container with one max-width token. Every page wraps in `<Container>`. This fixes the "every page guesses its own width" problem — NavBar uses `max-w-[1440px]`, hero uses `max-w-[720px]`, marketplace uses something else, login uses `max-w-sm`. One component, one token, used everywhere.

**Files:**
- Create: `src/components/ui/container.tsx`
- Modify: `src/styles/globals.css` (add `--max-width-page` token)
- Modify: `tailwind.config.ts` (add max-width mapping)

**Step 1: Add the page width token to globals.css**

In `:root`, after the elevation tokens:

```css
  /* Page layout */
  --max-width-page: 1200px;
  --max-width-narrow: 760px;
```

**Step 2: Add to Tailwind config**

In `tailwind.config.ts` `theme.extend`:

```typescript
      maxWidth: {
        page: "var(--max-width-page)",
        narrow: "var(--max-width-narrow)",
      },
```

**Step 3: Write the Container component**

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Max width variant. Default: page (1200px) */
  maxWidth?: "page" | "narrow" | "full"
  /** Horizontal padding. Default: px-6 md:px-8 lg:px-12 */
  padding?: "default" | "none" | "tight"
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, maxWidth = "page", padding = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "mx-auto w-full",
        maxWidth === "page" && "max-w-page",
        maxWidth === "narrow" && "max-w-narrow",
        maxWidth === "full" && "max-w-none",
        padding === "default" && "px-6 md:px-8 lg:px-12",
        padding === "tight" && "px-4 md:px-6",
        padding === "none" && "",
        className
      )}
      {...props}
    />
  )
)
Container.displayName = "Container"

export { Container }
```

**Step 4: Verify build**

Run: `npm run build`
Expected: 0 errors

**Step 5: Commit**

```bash
git add src/components/ui/container.tsx src/styles/globals.css tailwind.config.ts
git commit -m "feat(ui): add Container primitive with shared max-width token"
```

---

### Task 7: Install shadcn primitives (Card, Badge, Input, Textarea, Label, Select)

**Objective:** Install standard shadcn primitives via CLI. These are battle-tested, work with the existing `components.json` config, and reference CSS variables — so they automatically pick up our token layer. No hand-writing required.

**Files:**
- Create: `src/components/ui/card.tsx` (shadcn)
- Create: `src/components/ui/badge.tsx` (shadcn)
- Create: `src/components/ui/input.tsx` (shadcn)
- Create: `src/components/ui/textarea.tsx` (shadcn)
- Create: `src/components/ui/label.tsx` (shadcn)
- Create: `src/components/ui/select.tsx` (shadcn)

**Step 1: Install primitives via shadcn CLI**

```bash
cd /home/evo/evo_01/02_website
npx shadcn@latest add card badge input textarea label select
```

This installs the components into `src/components/ui/` with token-referencing classes that work with the existing `components.json` config.

**Step 2: Customise Card to add elevation variants**

After shadcn installs the Card, add variant support by modifying `src/components/ui/card.tsx` to include `elevated` and `inset` variants that reference our elevation tokens:

```tsx
// Add after the existing Card component:
const cardVariants = {
  default: "bg-surface-base border border-border",
  elevated: "bg-raised border border-border",
  outline: "bg-transparent border border-border",
  inset: "bg-canvas border border-border",
}

// Extend CardProps to accept variant prop
```

**Step 3: Customise Badge to add Evo-specific variants**

After shadcn installs the Badge, add `accent` variant (gold) and status variants to `src/components/ui/badge.tsx`:

```tsx
// Add to badgeVariants:
accent: "bg-accent/10 text-accent border border-accent/30",
success: "bg-success/10 text-success-text border border-success/30",
warning: "bg-warning/10 text-warning-text border border-warning/30",
destructive: "bg-error/10 text-error-text border border-error/30",
```

**Step 4: Customise Input/Textarea to reference Evo tokens**

After shadcn installs, modify the focus states to use `accent` instead of default `ring`:

```tsx
// Replace focus-visible:ring-ring with focus-visible:border-accent focus-visible:ring-accent
// Replace bg-background with bg-surface-base
// Replace bg-input with bg-canvas
```

**Step 5: Verify build**

Run: `npm run build`
Expected: 0 errors

**Step 6: Commit**

```bash
git add src/components/ui/card.tsx src/components/ui/badge.tsx src/components/ui/input.tsx src/components/ui/textarea.tsx src/components/ui/label.tsx src/components/ui/select.tsx
git commit -m "feat(ui): install shadcn primitives (Card, Badge, Input, Textarea, Label, Select) with Evo token customisations"
```

---

### Task 7.5: Add Button accent variant + install Table, Checkbox

**Objective:** Two fixes flagged by both reviewers: (1) existing button.tsx has no `accent` variant — login reskin needs it, (2) Table and Checkbox primitives are needed by PedigreeTable and PurchaseFlow/KYC forms but missing from Phase 2.

**Files:**
- Modify: `src/components/ui/button.tsx` (add accent variant)
- Create: `src/components/ui/table.tsx` (shadcn)
- Create: `src/components/ui/checkbox.tsx` (shadcn)

**Step 1: Add accent variant to button.tsx**

In the `variants.variant` object, add:

```typescript
        accent: "bg-accent text-pure-white hover:bg-accent-hover border border-accent/30 [a]:hover:bg-accent-hover",
```

**Step 2: Install Table + Checkbox via shadcn CLI**

```bash
cd /home/evo/evo_01/02_website
npx shadcn@latest add table checkbox
```

**Step 3: Customise Table to reference Evo tokens**

After shadcn installs, modify TableHeader/TableCell to use `border-border` instead of default border classes.

**Step 4: Verify build**

Run: `npm run build`
Expected: 0 errors

**Step 5: Commit**

```bash
git add src/components/ui/button.tsx src/components/ui/table.tsx src/components/ui/checkbox.tsx
git commit -m "feat(ui): add Button accent variant, install Table + Checkbox primitives"
```

---

### Task 8: Install shadcn Dialog + Tabs

**Objective:** Install Dialog (replaces ad-hoc `fixed inset-0 bg-black/45 backdrop-blur` modal patterns) and Tabs (replaces custom DetailTabs implementation) via shadcn CLI.

**Files:**
- Create: `src/components/ui/dialog.tsx` (shadcn)
- Create: `src/components/ui/tabs.tsx` (shadcn)

**Step 1: Install via shadcn CLI**

```bash
cd /home/evo/evo_01/02_website
npx shadcn@latest add dialog tabs
```

**Step 2: Customise Dialog to reference Evo tokens**

After shadcn installs, modify the Dialog overlay and content to reference our tokens:

```tsx
// DialogOverlay: bg-black/45 backdrop-blur-[6px] (keep as-is, already matches)
// DialogContent: bg-surface-base border-border rounded-lg (replace defaults)
// DialogHeader/DialogFooter: border-border (replace defaults)
```

**Step 3: Customise Tabs to reference Evo tokens**

After shadcn installs, modify the TabsTrigger active state:

```tsx
// Active: border-accent text-accent (replace border-ring text-ring)
// Inactive: text-muted-foreground hover:text-frost (replace text-muted-foreground)
// TabsList: border-border (replace border-input)
```

**Step 4: Verify build**

Run: `npm run build`
Expected: 0 errors

**Step 5: Commit**

```bash
git add src/components/ui/dialog.tsx src/components/ui/tabs.tsx
git commit -m "feat(ui): install shadcn Dialog + Tabs with Evo token customisations"
```

---

### Task 9: Tokenise GlowPillButton

**Objective:** Replace hardcoded values in GlowPillButton with token references. Keep the visual identical.

**Files:**
- Modify: `src/components/ui/GlowPillButton.tsx`

**Step 1: Update the base classes**

Replace the `baseButtonClasses` string:

```typescript
const baseButtonClasses =
  'relative inline-flex items-center justify-center whitespace-nowrap rounded-full px-6 py-2.5 text-xs font-light tracking-widest uppercase text-frost transition-all duration-300 hover:text-pure-white hover:scale-105 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent/50 bg-white/[0.03] hover:bg-white/[0.06] border border-border hover:border-steel-border overflow-hidden disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:text-frost';
```

And in the JSX, replace `via-primary` with `via-accent` in the gold accent line:

```typescript
// Gold accent line — was: via-primary
className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] w-0 bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 blur-[2px] transition-all duration-500 ease-out group-hover:w-full group-hover:opacity-100"
```

**Step 2: Verify build**

Run: `npm run build`
Expected: 0 errors

**Step 3: Commit**

```bash
git add src/components/ui/GlowPillButton.tsx
git commit -m "refactor(ui): tokenise GlowPillButton — replace hardcoded values"
```

---

### Task 10: Tokenise ComingSoonOverlay

**Objective:** Replace hardcoded values in ComingSoonOverlay with token references.

**Files:**
- Modify: `src/components/ui/ComingSoonOverlay.tsx`

**Step 1: Update the overlay classes**

Replace the hardcoded values:

```tsx
className="absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-canvas/40 backdrop-blur-md border border-border"
```

And the label:

```tsx
className="text-sm font-medium tracking-[0.3em] uppercase text-frost"
```

**Step 2: Verify build**

Run: `npm run build`
Expected: 0 errors

**Step 3: Commit**

```bash
git add src/components/ui/ComingSoonOverlay.tsx
git commit -m "refactor(ui): tokenise ComingSoonOverlay"
```

---

## Phase 3: Surface System (Marketplace + Mystable)

### Task 11: Apply dot-grid + tonal layering to marketplace detail page

**Objective:** Transform the marketplace detail page from flat black to the Better Stack tonal surface system. Page canvas gets dot-grid, cards use surface elevation, borders use tokens.

**Files:**
- Modify: `src/app/marketplace/[id]/page.tsx`

**Step 1: Apply dot-grid to page background**

Find the `<main>` element (line ~345) and add `dot-grid` class:

```tsx
<main className="min-h-screen bg-canvas text-foreground font-sans pt-32 pb-24 selection:bg-accent selection:text-black dot-grid">
```

**Step 2: Replace ad-hoc card patterns with Card primitive or token classes**

Sweep the file replacing:
- `bg-black` → `bg-canvas`
- `bg-zinc-900` → `bg-surface-base`
- `border-white/[0.06]` → `border-border`
- `bg-white/[0.01]` → `bg-surface-base`
- `bg-white/[0.02]` → `bg-surface-base`
- `text-[#d4a964]` → `text-accent`
- `text-white/40` → `text-muted-foreground`
- `text-white/60` → `text-frost`
- `text-white/70` → `text-frost`
- `text-white/20` → `text-muted-foreground`
- `text-white` → `text-heading` (for headings) or `text-pure-white` (for emphasis)

**Step 3: Verify build**

Run: `npm run build`
Expected: 0 errors

**Step 4: Commit**

```bash
git add src/app/marketplace/[id]/page.tsx
git commit -m "feat(marketplace): apply tonal surface system + dot-grid to detail page"
```

---

### Task 12: Apply tonal layering to marketplace listing page

**Objective:** Same treatment as Task 13 but for the marketplace grid/listing page.

**Files:**
- Modify: `src/app/marketplace/page.tsx`

**Step 1: Apply tokens**

Same sweep pattern as Task 13. Replace ad-hoc values with token classes.

**Step 2: Verify build**

Run: `npm run build`
Expected: 0 errors

**Step 3: Commit**

```bash
git add src/app/marketplace/page.tsx
git commit -m "feat(marketplace): apply tonal surface system to listing page"
```

---

### Task 13: Apply tonal layering to mystable page

**Objective:** Transform mystable from flat black to tonal surface system. This page has the most ad-hoc values (60+ instances in PurchaseFlow alone).

**Files:**
- Modify: `src/app/mystable/page.tsx`

**Step 1: Apply tokens**

Same sweep pattern. Replace ad-hoc values with token classes.

**Step 2: Verify build**

Run: `npm run build`
Expected: 0 errors

**Step 3: Commit**

```bash
git add src/app/mystable/page.tsx
git commit -m "feat(mystable): apply tonal surface system + dot-grid"
```

---

### Task 14: Tokenise marketplace composite components

**Objective:** Sweep the marketplace composite components — these are the components listed in the original migration plan priority order.

**Files (sweep in this order):**
1. `src/components/marketplace/DetailTabs.tsx`
2. `src/components/marketplace/PedigreeTable.tsx`
3. `src/components/marketplace/HeroPillarsGrid.tsx`
4. `src/components/marketplace/ListingGrid.tsx`
5. `src/components/marketplace/PurchaseFlow.tsx`
6. `src/components/marketplace/RightColumnActionPanel.tsx`

**Step 1: Sweep each file**

For each file, replace:
- `text-[#d4a964]` → `text-accent`
- `border-white/[0.06]` → `border-border`
- `text-white/40` → `text-muted-foreground`
- `text-white/70` → `text-frost`
- `text-white/60` → `text-frost`
- `bg-black` → `bg-canvas`
- `bg-zinc-900` → `bg-surface-base`
- `bg-white/[0.01]` → `bg-surface-base`
- `bg-white/[0.02]` → `bg-surface-base`
- `rounded-2xl` on cards → keep (16px = our card radius)
- `rounded-xl` → `rounded-lg` (12px = our input/nav radius)

Where a card pattern matches the Card primitive (`rounded-lg border border-border bg-surface-base p-6`), replace the inline classes with `<Card>` component.

Where a badge pattern matches the Badge primitive, replace with `<Badge variant="...">`.

**Step 2: Verify build after each file**

Run: `npm run build`
Expected: 0 errors

**Step 3: Commit after each file**

```bash
git add <file>
git commit -m "refactor(marketplace): tokenise <component-name>"
```

---

## Phase 4: Partner Logo Carousel

### Task 15: Build scrolling partner logo carousel component

**Objective:** Create a reusable scrolling logo carousel with edge-fade mask, monochrome treatment, and smooth animation. Replaces the static `AS FEATURED IN` grid in PressShowcaseSection.

**Files:**
- Create: `src/components/ui/LogoCarousel.tsx`

**Step 1: Write the component**

Uses plain `<img>` tags (not `next/image fill`) — both reviewers flagged that `fill` + `!relative` is contradictory and breaks layout. Plain `<img>` with explicit height is simpler and reliable for logos of varying widths.

```tsx
"use client";

import * as React from "react"
import { cn } from "@/lib/utils"

export interface LogoItem {
  name: string
  src: string
  alt?: string
  width?: number
  height?: number
}

interface LogoCarouselProps {
  logos: LogoItem[]
  /** Scroll speed in seconds for one full loop. Default 30s */
  speed?: number
  /** Logo height in px. Default 28 */
  logoHeight?: number
  className?: string
}

export function LogoCarousel({
  logos,
  speed = 30,
  logoHeight = 28,
  className,
}: LogoCarouselProps) {
  // Duplicate logos for seamless loop
  const loopLogos = [...logos, ...logos]

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        className
      )}
    >
      {/* Edge fade masks — left and right */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-canvas to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-canvas to-transparent"
        aria-hidden
      />

      {/* Scrolling track — duplicated for seamless loop */}
      <div
        className="flex items-center gap-12 whitespace-nowrap will-change-transform"
        style={{
          animation: `logo-scroll ${speed}s linear infinite`,
        }}
      >
        {loopLogos.map((logo, index) => (
          <img
            key={`${logo.name}-${index}`}
            src={logo.src}
            alt={logo.alt ?? logo.name}
            height={logoHeight}
            width={logo.width ?? logoHeight * 3}
            style={{ height: logoHeight, width: "auto", objectFit: "contain" }}
            className="shrink-0 opacity-60 grayscale transition-opacity duration-300 hover:opacity-90"
          />
        ))}
      </div>
    </div>
  )
}
```

**Step 2: Add the keyframe animation to globals.css**

In `src/styles/globals.css`, add to the animations section:

```css
@keyframes logo-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
```

**Step 3: Verify build**

Run: `npm run build`
Expected: 0 errors

**Step 4: Commit**

```bash
git add src/components/ui/LogoCarousel.tsx src/styles/globals.css
git commit -m "feat(ui): add LogoCarousel scrolling component with edge-fade mask"
```

---

### Task 16: Integrate LogoCarousel into homepage

**Objective:** Replace the static `AS FEATURED IN` partner logo grid in PressShowcaseSection with the scrolling carousel.

**Files:**
- Modify: `src/components/sections/PressShowcaseSection.tsx`

**Step 1: Import and replace**

Add import at top:

```tsx
import { LogoCarousel, type LogoItem } from "@/components/ui/LogoCarousel";
```

Replace the `partners` array and the static grid rendering (around lines 130-465) with:

```tsx
const partnerLogos: LogoItem[] = [
  { name: "Trackside NZ", src: "/images/partners/trackside-nz.png" },
  { name: "Business Desk", src: "/images/partners/businessdesk.jpg" },
  { name: "Singularry", src: "/images/partners/singularry.webp" },
  { name: "Investing.com", src: "/images/partners/investing-com.png" },
  { name: "NZTR", src: "/images/partners/nztr-white.png" },
  { name: "Stephen Grey Racing", src: "/images/partners/stephen-grey-racing.png" },
  { name: "Arabian Business", src: "/images/partners/arabian-business.png" },
];
```

Then replace the static grid section with:

```tsx
<section className="py-12 border-b border-border">
  <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8">
    AS FEATURED IN
  </p>
  <LogoCarousel logos={partnerLogos} speed={30} logoHeight={28} />
</section>
```

**Step 2: Verify build**

Run: `npm run build`
Expected: 0 errors

**Step 3: Commit**

```bash
git add src/components/sections/PressShowcaseSection.tsx
git commit -m "feat(homepage): replace static partner grid with scrolling LogoCarousel"
```

---

### Task 16.5: Enhance TypeWriter component for cycling word animation

**Objective:** Upgrade the existing `TypeWriter.tsx` to support multi-word cycling (type→hold→delete→next word) with a blinking cursor, inspired by Render's hero animation. The current component types a single string and optionally loops — no cycling through multiple words, no delete phase, no cursor.

**Files:**
- Modify: `src/components/ui/TypeWriter.tsx`

**Step 1: Rewrite TypeWriter to support cycling mode**

Add a `words` prop (array of strings). When provided, the component cycles through them: type character-by-character → hold 2.5s → delete character-by-character → move to next word → loop. Add a blinking cursor element after the text.

```tsx
"use client";

import { useState, useEffect, useRef } from "react";

interface TypeWriterProps {
  /** Single text to type (legacy mode) */
  text?: string;
  /** Array of words to cycle through (cycling mode) */
  words?: string[];
  /** Typing speed in ms per char. Default 80 */
  speed?: number;
  /** Delete speed in ms per char. Default 40 */
  deleteSpeed?: number;
  /** Hold time after complete word in ms. Default 2500 */
  holdDelay?: number;
  /** Delay before starting in ms. Default 500 */
  delay?: number;
  /** Loop (legacy mode only) */
  loop?: boolean;
  /** Trigger type */
  trigger?: "instant" | "inView";
  /** Show blinking cursor. Default true */
  cursor?: boolean;
  className?: string;
}

export function TypeWriter({
  text,
  words,
  speed = 80,
  deleteSpeed = 40,
  holdDelay = 2500,
  delay = 500,
  loop = false,
  trigger = "instant",
  cursor = true,
  className = "",
}: TypeWriterProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [phase, setPhase] = useState<"typing" | "holding" | "deleting">("typing");
  const [started, setStarted] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cycling mode
  const cyclingWords = words && words.length > 0;

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;

    if (cyclingWords) {
      // Cycling mode
      const currentWord = words![wordIndex];

      if (phase === "typing") {
        if (displayedText.length < currentWord.length) {
          timeoutRef.current = setTimeout(() => {
            setDisplayedText(currentWord.slice(0, displayedText.length + 1));
          }, speed);
        } else {
          timeoutRef.current = setTimeout(() => setPhase("holding"), holdDelay);
        }
      } else if (phase === "holding") {
        timeoutRef.current = setTimeout(() => setPhase("deleting"), 50);
      } else if (phase === "deleting") {
        if (displayedText.length > 0) {
          timeoutRef.current = setTimeout(() => {
            setDisplayedText(displayedText.slice(0, -1));
          }, deleteSpeed);
        } else {
          setWordIndex((prev) => (prev + 1) % words!.length);
          setPhase("typing");
        }
      }
    } else {
      // Legacy mode — single text
      const fullText = text ?? "";
      if (displayedText.length < fullText.length) {
        timeoutRef.current = setTimeout(() => {
          setDisplayedText(fullText.slice(0, displayedText.length + 1));
        }, speed);
      } else if (loop) {
        timeoutRef.current = setTimeout(() => {
          setDisplayedText("");
        }, holdDelay);
      }
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [displayedText, phase, wordIndex, started, cyclingWords, words, text, speed, deleteSpeed, holdDelay, loop]);

  return (
    <span className={className}>
      {displayedText}
      {cursor && (
        <span
          className="inline-block w-[2px] h-[1em] -mb-[0.1em] ml-[2px] bg-current animate-cursor-blink"
          aria-hidden
        />
      )}
    </span>
  );
}
```

**Step 2: Add cursor blink keyframe to globals.css**

```css
@keyframes cursor-blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

.animate-cursor-blink {
  animation: cursor-blink 1s step-end infinite;
}
```

Note: this is already covered by the `prefers-reduced-motion` media query added in Task 1.

**Step 3: Verify build**

Run: `npm run build`
Expected: 0 errors

**Step 4: Commit**

```bash
git add src/components/ui/TypeWriter.tsx src/styles/globals.css
git commit -m "feat(ui): enhance TypeWriter with cycling word mode + blinking cursor"
```

---

## Phase 5: Codify Evo-Specifics

### Task 17: Create CampaignStatus badge component from Badge primitive

**Objective:** Rebuild CampaignStatusBadge using the Badge primitive with token-driven variants.

**Files:**
- Modify: `src/components/marketplace/CampaignStatusBadge.tsx`

**Step 1: Read the current component**

```bash
cat src/components/marketplace/CampaignStatusBadge.tsx
```

Understand the current status → colour mapping.

**Step 2: Rewrite using Badge primitive**

Map each campaign status to a Badge variant:
- `draft` → `outline`
- `reviewed` → `accent`
- `publish-ready` → `success`
- `published` → `default`
- `sold-out` → `outline` with muted text
- `coming-soon` → `accent` with "Coming Soon" label

```tsx
import { Badge } from "@/components/ui/badge"
import { getCampaignStatus, type CampaignStatus } from "@/lib/campaign-status"

const statusConfig: Record<CampaignStatus, { variant: "default" | "accent" | "success" | "outline"; label: string }> = {
  draft: { variant: "outline", label: "Draft" },
  reviewed: { variant: "accent", label: "Reviewed" },
  "publish-ready": { variant: "success", label: "Publish Ready" },
  published: { variant: "default", label: "Live" },
  "sold-out": { variant: "outline", label: "Sold Out" },
  "coming-soon": { variant: "accent", label: "Coming Soon" },
}

export function CampaignStatusBadge({ status, className }: { status: CampaignStatus; className?: string }) {
  const config = statusConfig[status] ?? statusConfig.draft
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}
```

**Step 3: Verify build**

Run: `npm run build`
Expected: 0 errors

**Step 4: Commit**

```bash
git add src/components/marketplace/CampaignStatusBadge.tsx
git commit -m "refactor(marketplace): rebuild CampaignStatusBadge from Badge primitive"
```

---

### Task 18: Create KYC badge component from Badge primitive

**Objective:** Build a tokenised KYC badge component that replaces the hand-coded rgba badges across mystable and admin.

**Files:**
- Create: `src/components/ui/kyc-badge.tsx`

**Step 1: Write the component**

```tsx
import { Badge } from "./badge"

export type KycStatus = "verified" | "pending" | "requires-input" | "canceled" | "none"

const kycConfig: Record<KycStatus, { variant: "success" | "warning" | "destructive" | "default" | "outline"; label: string }> = {
  verified: { variant: "success", label: "Verified" },
  pending: { variant: "warning", label: "Pending" },
  "requires-input": { variant: "warning", label: "Action Required" },
  canceled: { variant: "destructive", label: "Canceled" },
  none: { variant: "outline", label: "Not Started" },
}

export function KycBadge({ status, className }: { status: KycStatus; className?: string }) {
  const config = kycConfig[status] ?? kycConfig.none
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: 0 errors

**Step 3: Commit**

```bash
git add src/components/ui/kyc-badge.tsx
git commit -m "feat(ui): add KycBadge component from Badge primitive"
```

---

### Task 19: Regenerate brand-guidelines page from DESIGN.md

**Objective:** The existing `/brand-guidelines` page has ad-hoc hardcoded values. Update it to reference the token system. This is the living documentation of the design system.

**Files:**
- Modify: `src/app/brand-guidelines/page.tsx`

**Step 1: Read current page**

```bash
cat src/app/brand-guidelines/page.tsx | head -100
```

**Step 2: Replace hardcoded colour swatches with token-referenced values**

Replace the inline colour arrays with token-referenced values. Each swatch should show:
- Token name (e.g., `--color-background`)
- Hex value (from CSS var)
- Usage description (from DESIGN.md)

Replace ad-hoc styling on the page itself with token classes (`bg-canvas`, `text-heading`, `border-border`, etc.).

**Step 3: Verify build**

Run: `npm run build`
Expected: 0 errors

**Step 4: Commit**

```bash
git add src/app/brand-guidelines/page.tsx
git commit -m "refactor(brand): regenerate brand-guidelines page from token system"
```

---

### Task 19.5: Rebuild login page using primitives

**Objective:** Replace the current low-budget login card with Card + Input primitives, tonal surface, proper token classes. Keep the split-screen jockey video layout — just fix the form side. The current card is `max-w-sm` (384px, too narrow), Google icon is invisible (`text-gray-900` on dark), submit button is dark-on-dark, no depth, no "forgot password".

**Files:**
- Modify: `src/app/auth/login/page.tsx`

**Step 1: Replace the login card structure**

- Swap `max-w-sm` card for `max-w-md` Card primitive with `elevated` variant
- Replace raw `<input>` elements with Input primitive
- Replace GlowPillButton submit with Button primitive (accent variant for primary action)
- Fix Google icon visibility (remove `text-gray-900`, use `text-white` or proper Google colours)
- Add "forgot password" link below the form
- Apply tonal surface: card uses `bg-surface-base`, inputs use `bg-canvas`, borders use `border-border`
- Footer link stays `text-accent` for "Sign up" toggle

**Step 2: Verify build**

Run: `npm run build`
Expected: 0 errors

**Step 3: Commit**

```bash
git add src/app/auth/login/page.tsx
git commit -m "feat(auth): rebuild login page with primitives + tonal surface"
```

---

## Phase 6: Sweep (Incremental)

### Task 20: Sweep NavBar and Footer

**Objective:** Tokenise the NavBar and Footer — these appear on every page.

**Files:**
- Modify: `src/components/NavBar.tsx`
- Modify: `src/components/Footer.tsx`

**Step 1: Sweep both files**

Replace all ad-hoc values with token classes using the same mapping as Task 16.

**Step 2: Verify build**

Run: `npm run build`
Expected: 0 errors

**Step 3: Commit**

```bash
git add src/components/NavBar.tsx src/components/Footer.tsx
git commit -m "refactor: tokenise NavBar and Footer"
```

---

### Task 21: Sweep homepage

**Objective:** Tokenise the homepage and its section components.

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/sections/HeroSection.tsx`
- Modify: `src/components/sections/AboutSection.tsx`
- Modify: `src/components/sections/HowItWorksSection.tsx`
- Modify: `src/components/sections/DigitalSyndicationSection.tsx`
- Modify: `src/components/sections/MarketplaceSection.tsx`
- Modify: `src/components/sections/FAQSection.tsx`

**Step 1: Sweep each file**

Same token mapping. Commit after each file to keep diffs reviewable.

**Step 2: Verify build after each file**

Run: `npm run build`
Expected: 0 errors

**Step 3: Commit after each file**

```bash
git add <file>
git commit -m "refactor(homepage): tokenise <component-name>"
```

---

### Task 22: Delete sandbox pages (dead code — verified by Kimi audit)

**Objective:** Sandbox pages are dead code. Delete them and clean up the `isSandbox` prop from ListingGrid. This replaces the original sweep task — no point tokenising files heading to the bin.

**Files:**
- Delete: `src/app/sandbox/` (all sandbox routes)
- Delete: `src/components/marketplace/ListingGridSandbox.tsx`
- Delete: `src/components/marketplace/DetailTabsSandbox.tsx`
- Delete: `src/components/marketplace/PedigreeTableSandbox.tsx`
- Delete: `src/components/marketplace/PurchaseFormSandbox.tsx`
- Modify: `src/components/marketplace/ListingGrid.tsx` — remove `isSandbox` prop and `/sandbox/marketplace/` branch

**Step 1: Delete sandbox files**

```bash
git rm -r src/app/sandbox
git rm src/components/marketplace/ListingGridSandbox.tsx
git rm src/components/marketplace/DetailTabsSandbox.tsx
git rm src/components/marketplace/PedigreeTableSandbox.tsx
git rm src/components/marketplace/PurchaseFormSandbox.tsx
```

**Step 2: Clean up ListingGrid isSandbox prop**

Read `ListingGrid.tsx`, remove the `isSandbox` prop and any conditional branching that references sandbox behaviour.

**Step 3: Verify build**

Run: `npm run build`
Expected: 0 errors

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: delete dead sandbox pages and clean up isSandbox prop"
```

---

### Task 22.5: Sweep remaining live pages (FAQ, privacy, terms)

**Objective:** Tokenise remaining live pages — sandbox is deleted, so only real pages remain.

**Files:**
- `src/app/faq/page.tsx`
- `src/app/privacy/page.tsx`
- Any other live files with ad-hoc values

**Step 1: Sweep each file**

Same token mapping. Commit after each file.

**Step 2: Verify build after each file**

Run: `npm run build`
Expected: 0 errors

**Step 3: Commit after each file**

```bash
git add <file>
git commit -m "refactor: tokenise <page-name>"
```

---

### Task 23: Final audit — zero ad-hoc values

**Objective:** Verify the sweep is complete. No hardcoded hex values, no ad-hoc opacity, no `bg-black` or `text-white/40` outside of deliberate exceptions.

**Step 1: Run the audit**

```bash
cd /home/evo/evo_01/02_website
rg -c 'text-\[#d4a964\]|border-white/\[0\.06\]|text-white/70|text-white/40|bg-black|bg-zinc-900|text-white/60|bg-white/\[0\.0' src/ --glob='*.tsx' | awk -F: '{sum+=$2} END {print sum" matches across "NR" files"}'
```

Expected: 0 matches, or only deliberate exceptions documented in DESIGN.md.

**Step 2: Verify build**

Run: `npm run build`
Expected: 0 errors

**Step 3: Visual diff**

Check each page against the current live site:
- Marketplace detail page
- Marketplace listing page
- Mystable page
- Homepage
- FAQ page
- Brand guidelines page

Verify:
- Gold accent renders correctly in all contexts (links, borders, badges, gradients)
- Type scale doesn't break layouts (headlines, card text, tables)
- Dot-grid texture visible on marketplace + mystable pages
- Cards show tonal layering (surface lighter than canvas, borders visible)
- Mobile breakpoints work

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: final design system sweep — zero ad-hoc values remaining"
```

---

## What NOT to Change

- **Layout structure** — two-column marketplace, grid layouts, tab structure: keep as-is
- **Component logic** — this is a styling + primitive layer migration, not a logic refactor
- **Content/data pipeline** — data files, JSON, API routes: untouched
- **Existing animations** — shimmer, fade-in, hero entrance, glass-streak, masked-border: keep
- **Existing noise texture** — `body::after` fractalNoise overlay stays; dot-grid is additive

## Key Decisions Locked

| Decision | Resolution |
|----------|-----------|
| Tailwind version | Stay v3. No upgrade. |
| Colour base | Keep current warm greyscale. Add 4 Better Stack cool neutrals as supplements only. |
| Accent | Gold `#d4a964` as single accent. Drop iris blue, drop periwinkle. |
| Typography | Keep Geist Sans (self-hosted). No Helvetica Now licensing. |
| Scope | Token foundation + primitive components + targeted reskin (marketplace, mystable, homepage). Not a rebuild. |
| Card approach | Build Card primitive, use everywhere. All future boxes/popups use primitives. |
| Partner logos | Scrolling carousel with edge-fade mask, monochrome treatment. |
| Primitives source | Standard UI via shadcn (`npx shadcn add`). Custom only for Evo-specific (Container, LogoCarousel, KycBadge, CampaignStatusBadge, TypeWriter). |
| Status colours | Add `success`, `warning`, `error` aliases to Tailwind config (existing config has `-bg`/`-text`/`-border` suffixes, Badge needs shorthand). |
| Button accent | Add `accent` variant to existing button.tsx (gold bg, white text). |
| Accessibility | shadcn Dialog + Tabs include Radix a11y. Add `prefers-reduced-motion` for all animations. WCAG: cool neutrals for UI chrome only, not body text. |
| TypeWriter | Enhance existing component with cycling word mode + blinking cursor (Render-style hero animation). |

## Verification Checklist

After all phases complete:
- [ ] `npm run build` — 0 errors
- [ ] Zero ad-hoc styling values in `src/` (or documented exceptions)
- [ ] DESIGN.md exists and lints clean
- [ ] Card, Badge, Input, Modal, Tabs, LogoCarousel primitives exist in `src/components/ui/`
- [ ] Marketplace detail page uses tonal layering + dot-grid
- [ ] Marketplace listing page uses tonal layering
- [ ] Mystable page uses tonal layering + dot-grid
- [ ] Homepage has scrolling partner logo carousel
- [ ] CampaignStatusBadge rebuilt from Badge primitive
- [ ] KycBadge component exists
- [ ] Brand guidelines page references token system
- [ ] NavBar and Footer tokenised
- [ ] Mobile breakpoints verified
- [ ] Gold accent renders correctly in all contexts

---

## Deferred Items (Not in This Plan — Flagged for Later)

These were identified during scoping but are **out of scope** for the design system establishment. They need their own tasks.

| Item | Issue | Why Deferred |
|------|-------|-------------|
| **Marketplace/mystable page lag** | Both pages use `force-dynamic` — every visit calls Google Sheets API before returning HTML. Homepage is static so it loads instantly; click to `/marketplace` and Vercel runs `readInventoryList()` live. | Performance fix, not styling. Options: add `revalidate = 60` (ISR) for 60-second cache + background regen, or keep `force-dynamic` but add loading skeleton. Separate task. |
| **Homepage narrative restructure** | Current homepage is 6 content sections + 4 bg-image dividers — reads like a brochure, not a journey toward ownership. User said "very factorial, not how I become an owner." | UX/content decision, not styling. The design system gives you the components to build it; the homepage restructure is about what goes where and what story the page tells. Needs its own planning session with the user driving content decisions. |