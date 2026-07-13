# Investment Terms modal — UI baseline (greyscale glass)

**Date:** 2026-07-13  
**Source:** `src/components/marketplace/InvestmentTermsModal.tsx` @ `c5c3528` / follow-ups  
**Purpose:** Frozen styling reference while we iterate copy/hierarchy. Restore classes from here if experiments go sideways.

---

## Aesthetic

- **Black marketplace** page behind modal  
- **Greyscale glass:** white-on-black at low opacity, soft borders, heavy blur  
- **No gold** on terms modal (min-investment + Buy now are greyscale / white)  
- **Mint** (`#34D399`) only on investor return value  
- Light type, tight tracking on labels, large light numerals for money  

---

## Structure (content hierarchy — current)

1. Eyebrow + horse name  
2. Stacked terms (greyscale):  
   - **Price** — `$X NZD per month` + hint “Based on 1% investment”  
   - **Minimum investment** — `$Y NZD` + hint `0.25% unit`  
   - **Lease term** — `12 months starting 1 August 2026`  
   - **Syndicate stake available** — remaining % of horse (e.g. 4.75%) + “Based on total ownership”  
   - **Investor return** — `75% of gross stakes won` (mint)  
3. **Returns explained** + “Learn more about how returns work” → `/learn/returns` (TODO page)  
4. **Buy now** CTA (white) + legal line  

---

## Class tokens (copy-paste restore)

### Overlay
```
fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md px-4
```

### Modal panel (glass)
```
relative max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-8 space-y-6 shadow-[0_0_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]
```

### Close
```
absolute top-4 right-4 text-white/40 hover:text-white/80 transition text-xl
```

### Eyebrow
```
text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2
```

### Title
```
text-[22px] font-light text-white tracking-tight
```

### Hero grid
```
grid grid-cols-1 sm:grid-cols-2 gap-3
```

### Price card (greyscale glass)
```
rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 space-y-1
```
- Label: `text-[10px] uppercase tracking-[0.18em] text-white/40`  
- Amount: `text-[28px] font-light text-white tracking-tight leading-none`  
- NZD: `text-[13px] text-white/50 font-light ml-1`  
- Subline: `text-[11px] font-light text-white/45 leading-snug pt-1`  

### Minimum investment card (greyscale glass — same as Price)
```
rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 space-y-1
```
- Label: `text-[10px] uppercase tracking-[0.18em] text-white/40`  
- Amount / NZD / subline: same as price card  

### Secondary block
```
space-y-4 text-[13px] font-light border-t border-white/[0.06] pt-5
```

### Term row
- Label: `text-white/40 shrink-0 max-w-[55%] leading-snug`  
- Value: `text-white font-medium text-right leading-snug`  
- Divider: `border-b border-white/[0.06] pb-3.5` (omit on last)  

### Investor return value
```
text-[#34D399] font-medium
```

### Footnote
```
text-[11px] font-light text-white/35 leading-relaxed
```

### Primary CTA (greyscale — same family as open trigger)
```
w-full text-center py-3.5 rounded-full text-[12px] font-medium uppercase tracking-[0.15em] bg-white text-black hover:bg-white/90 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
```
Label: **Buy now** (renders as BUY NOW via uppercase)

### Open trigger (page column)
```
w-full text-center py-3.5 rounded-full text-[12px] font-medium uppercase tracking-[0.15em] bg-white text-black hover:bg-white/90 transition-all duration-300 active:scale-[0.98]
```
Label: **View Investment Terms**

### Legal under CTA
```
text-[10px] font-light leading-relaxed text-white/20 text-center
```

---

## Colour map

| Role | Token |
|------|--------|
| Surface glass | `bg-white/[0.03]` + `backdrop-blur-2xl` |
| Border glass | `border-white/10` or `border-white/[0.08]` |
| Body text | `text-white` light weights |
| Muted label | `text-white/40`–`text-white/30` |
| Subline | `text-white/45`–`text-white/50` |
| Gold accent | none in this modal |
| Return accent | `#34D399` |
| Scrim | `bg-black/60 backdrop-blur-md` |

---

## Content snapshot (Manolo example at freeze)

| Field | Example |
|--------|---------|
| Price | $75 NZD · / month per 1% of the horse |
| Min investment | $225 NZD · 1 unit · 0.25% · full 12-month term |
| Lease period | 12 months |
| Start | 1 Aug 2026 |
| Units | 19 / 20 |
| Return | 75% gross stakes won* |
| Syndicate stake | 5% of the horse |

Pricing rule (separate from UI): list NZD always **round up to nearest dollar** (`src/lib/pricing.ts` → `roundUpListPriceNzd`).

---

## Restore

1. Open this file + `InvestmentTermsModal.tsx`  
2. Re-apply class strings above if Tailwind was rewritten  
3. Prefer full greyscale glass; mint only for investor return  
