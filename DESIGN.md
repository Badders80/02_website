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