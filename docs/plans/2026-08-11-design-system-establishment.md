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

### Task 1: Add supplementary neutral tokens to globals.css

**Objective:** Add the 4 Better Stack cool-neutral tokens as CSS variables alongside existing warm greyscale.

**Files:**
- Modify: `src/styles/globals.css` (lines 14-72, the `:root` block)

**Step 1: Add tokens to `:root`**

Insert after the existing `--color-border` line (line 23), before the Brand section:

```css
  /* Supplementary neutrals (Better Stack) — for text/border roles where cool tones read better */
  --muted-steel: #646e87;
  --steel-border: #939db8;
  --frost: #c9d3ee;
  --pure-white: #ffffff;
```

**Step 2: Verify build**

Run: `cd /home/evo/evo_01/02_website && npm run build`
Expected: 0 errors, build succeeds

**Step 3: Commit**

```bash
git add src/styles/globals.css
git commit -m "feat(tokens): add Better Stack supplementary neutral tokens"
```

---

### Task 2: Register supplementary tokens in Tailwind config

**Objective:** Map the 4 new CSS variables to Tailwind colour tokens so they can be used as `text-muted-steel`, `border-steel-border`, `text-frost`, `text-pure-white`.

**Files:**
- Modify: `src/tailwind.config.ts` (the `theme.extend.colors` block)

**Step 1: Add colour mappings**

Insert into the `colors` object, after the existing brand gold mappings:

```typescript
        // Supplementary neutrals (Better Stack)
        "muted-steel": "var(--muted-steel)",
        "steel-border": "var(--steel-border)",
        "frost": "var(--frost)",
        "pure-white": "var(--pure-white)",
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

### Task 6: Build Card primitive

**Objective:** Create a reusable Card component with variants (default, elevated, outline). This replaces 50+ inline card patterns.

**Files:**
- Create: `src/components/ui/card.tsx`

**Step 1: Write the component**

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const cardVariants = {
  default: "bg-surface-base border border-border",
  elevated: "bg-raised border border-border",
  outline: "bg-transparent border border-border",
  inset: "bg-canvas border border-border",
}

const cardSizes = {
  default: "p-6",
  compact: "p-4",
  spacious: "p-8 md:p-10",
  none: "",
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof cardVariants
  size?: keyof typeof cardSizes
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg transition-colors",
        cardVariants[variant],
        cardSizes[size],
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-heading text-lg font-medium leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-muted-foreground text-sm font-light", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
```

**Step 2: Verify build**

Run: `npm run build`
Expected: 0 errors

**Step 3: Commit**

```bash
git add src/components/ui/card.tsx
git commit -m "feat(ui): add Card primitive with variants"
```

---

### Task 7: Build Badge primitive

**Objective:** Create a reusable Badge component for status indicators, KYC badges, campaign badges. Replaces hand-coded rgba badges across the site.

**Files:**
- Create: `src/components/ui/badge.tsx`

**Step 1: Write the component**

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-white/[0.05] text-muted-foreground border border-border",
        accent: "bg-accent/10 text-accent border border-accent/30",
        success: "bg-success/10 text-success-text border border-success/30",
        warning: "bg-warning/10 text-warning-text border border-warning/30",
        destructive: "bg-error/10 text-error-text border border-error/30",
        outline: "bg-transparent text-muted-foreground border border-border",
      },
      size: {
        default: "text-xs px-2.5 py-0.5",
        sm: "text-[10px] px-2 py-0.5",
        lg: "text-sm px-3 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
```

**Step 2: Verify build**

Run: `npm run build`
Expected: 0 errors

**Step 3: Commit**

```bash
git add src/components/ui/badge.tsx
git commit -m "feat(ui): add Badge primitive with status variants"
```

---

### Task 8: Build Input primitive

**Objective:** Create reusable form input components (Input, Textarea, Select) that reference tokens. Replaces raw `<input>` with inline classes across the site.

**Files:**
- Create: `src/components/ui/input.tsx`
- Create: `src/components/ui/textarea.tsx`
- Create: `src/components/ui/select.tsx`

**Step 1: Write Input**

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-border bg-surface-base px-3 py-2",
        "text-sm text-heading placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "transition-colors",
        className
      )}
      {...props}
    />
  )
)
Input.displayName = "Input"

export { Input }
```

**Step 2: Write Textarea**

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[80px] w-full rounded-md border border-border bg-surface-base px-3 py-2",
      "text-sm text-heading placeholder:text-muted-foreground",
      "focus-visible:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "transition-colors",
      className
    )}
    {...props}
  />
))
Textarea.displayName = "Textarea"

export { Textarea }
```

**Step 3: Write Select**

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-md border border-border bg-surface-base px-3 py-2",
      "text-sm text-heading",
      "focus-visible:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "transition-colors",
      className
    )}
    {...props}
  >
    {children}
  </select>
))
Select.displayName = "Select"

export { Select }
```

**Step 4: Verify build**

Run: `npm run build`
Expected: 0 errors

**Step 5: Commit**

```bash
git add src/components/ui/input.tsx src/components/ui/textarea.tsx src/components/ui/select.tsx
git commit -m "feat(ui): add Input, Textarea, Select primitives"
```

---

### Task 9: Build Modal/Dialog primitive

**Objective:** Create a reusable modal component. Replaces ad-hoc `fixed inset-0 bg-black/45 backdrop-blur` patterns in InvestmentTermsModal, CtaLeadModal, mystable, and admin pages.

**Files:**
- Create: `src/components/ui/modal.tsx`

**Step 1: Write the component**

```tsx
"use client";

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
  /** Size variant */
  size?: "sm" | "md" | "lg" | "xl"
  /** Close on backdrop click. Default true */
  closeOnBackdrop?: boolean
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
}

export function Modal({
  open,
  onClose,
  children,
  className,
  size = "md",
  closeOnBackdrop = true,
}: ModalProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onClose])

  if (!mounted || !open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[6px]" />

      {/* Content */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative z-10 w-full mx-4 rounded-lg border border-border bg-surface-base shadow-lg",
          "animate-fade-in",
          sizeClasses[size],
          className
        )}
      >
        {children}
      </div>
    </div>,
    document.body
  )
}

// Optional: Header/Body/Footer sub-components for structured modals
function ModalHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("border-b border-border p-6", className)}>
      {children}
    </div>
  )
}

function ModalBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("p-6", className)}>
      {children}
    </div>
  )
}

function ModalFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex items-center justify-end gap-3 border-t border-border p-6", className)}>
      {children}
    </div>
  )
}

export { ModalHeader, ModalBody, ModalFooter }
```

**Step 2: Verify build**

Run: `npm run build`
Expected: 0 errors

**Step 3: Commit**

```bash
git add src/components/ui/modal.tsx
git commit -m "feat(ui): add Modal primitive with portal, backdrop, sizes"
```

---

### Task 10: Build Tabs primitive

**Objective:** Create a reusable Tabs component. Replaces the custom tab implementation in DetailTabs.

**Files:**
- Create: `src/components/ui/tabs.tsx`

**Step 1: Write the component**

```tsx
"use client";

import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsContextValue {
  value: string
  setValue: (v: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function useTabs() {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error("Tabs components must be used within <Tabs>")
  return ctx
}

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className,
}: {
  defaultValue?: string
  value?: string
  onValueChange?: (v: string) => void
  children: React.ReactNode
  className?: string
}) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "")
  const value = controlledValue ?? uncontrolled
  const setValue = (v: string) => {
    setUncontrolled(v)
    onValueChange?.(v)
  }

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "flex border-b border-border overflow-x-auto scrollbar-none",
        className
      )}
    >
      {children}
    </div>
  )
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const { value: activeValue, setValue } = useTabs()
  const isActive = activeValue === value

  return (
    <button
      type="button"
      onClick={() => setValue(value)}
      className={cn(
        "px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px",
        isActive
          ? "border-accent text-accent"
          : "border-transparent text-muted-foreground hover:text-frost",
        className
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const { value: activeValue } = useTabs()
  if (activeValue !== value) return null

  return (
    <div className={cn("pt-6", className)}>
      {children}
    </div>
  )
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: 0 errors

**Step 3: Commit**

```bash
git add src/components/ui/tabs.tsx
git commit -m "feat(ui): add Tabs primitive"
```

---

### Task 11: Tokenise GlowPillButton

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

### Task 12: Tokenise ComingSoonOverlay

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

### Task 13: Apply dot-grid + tonal layering to marketplace detail page

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

### Task 14: Apply tonal layering to marketplace listing page

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

### Task 15: Apply tonal layering to mystable page

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

### Task 16: Tokenise marketplace composite components

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

### Task 17: Build scrolling partner logo carousel component

**Objective:** Create a reusable scrolling logo carousel with edge-fade mask, monochrome treatment, and smooth animation. Replaces the static `AS FEATURED IN` grid in PressShowcaseSection.

**Files:**
- Create: `src/components/ui/LogoCarousel.tsx`

**Step 1: Write the component**

```tsx
"use client";

import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export interface LogoItem {
  name: string
  src: string
  alt?: string
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

      {/* Scrolling track */}
      <div
        className="flex items-center gap-12 whitespace-nowrap"
        style={{
          animation: `logo-scroll ${speed}s linear infinite`,
        }}
      >
        {loopLogos.map((logo, index) => (
          <div
            key={`${logo.name}-${index}`}
            className="relative shrink-0 opacity-60 grayscale transition-opacity duration-300 hover:opacity-90"
            style={{ height: logoHeight }}
          >
            <Image
              src={logo.src}
              alt={logo.alt ?? logo.name}
              fill
              style={{ objectFit: "contain" }}
              className="!relative !h-full !w-auto"
            />
          </div>
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

### Task 18: Integrate LogoCarousel into homepage

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

## Phase 5: Codify Evo-Specifics

### Task 19: Create CampaignStatus badge component from Badge primitive

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

### Task 20: Create KYC badge component from Badge primitive

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

### Task 21: Regenerate brand-guidelines page from DESIGN.md

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

## Phase 6: Sweep (Incremental)

### Task 22: Sweep NavBar and Footer

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

### Task 23: Sweep homepage

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

### Task 24: Sweep remaining pages

**Objective:** Tokenise remaining pages — FAQ, privacy, terms, sandbox pages.

**Files:**
- `src/app/faq/page.tsx`
- `src/app/privacy/page.tsx`
- `src/app/sandbox/stables/page.tsx`
- `src/app/sandbox/marketplace/page.tsx`
- `src/app/sandbox/marketplace/[id]/page.tsx`
- `src/app/sandbox/mystable/page.tsx`
- Any other files with ad-hoc values

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

### Task 25: Final audit — zero ad-hoc values

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