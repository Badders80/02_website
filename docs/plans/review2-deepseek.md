## VERDICT: NEEDS REVISION The plan is architecturally sound and the v1 fixes are genuinely good (shad (shadcn installs, status aliases, Button accent, LogoCarousel img fix, sand
sandbox deletion, reduced-motion). But there are two **build-breaking token token gaps**, one **component-library mismatch** that invalidates Task 8's 
customisation steps, and one **false accessibility claim**. These need targ targeted fixes before execution.

---

### Critical Issues 
**1. `accent` / `accent-hover` are never added to tailwind.config.ts — yet the plan uses them everywhere.**
- Task 7.5 Button accent variant: `bg-accent text-pure-white hover:bg-accen hover:bg-accent-hover border border-accent/30`
- Task 7 Badge accent variant: `bg-accent/10 text-accent border border-acce border-accent/30`
- Task 8 Tabs active state: `border-accent text-accent`
- Tasks 11–14 sweep: `text-[#d4a964] → text-accent`
- DESIGN.md: "Use `text-accent` for all gold instances" The current config maps `gold: var(--brand-gold)` and `gold-hover: var(--br
var(--brand-gold-hover)` but **not** `accent`. Every `text-accent`, `bg-acc `bg-accent`, `border-accent/30`, `hover:bg-accent-hover` in the plan would 
generate **zero CSS**. The sweep would replace working `text-[#d4a964]` wit with dead classes. **Fix:** add `accent: "var(--brand-gold)"` and `accent-h
`accent-hover: "var(--brand-gold-hover)"` in Task 2 (so it precedes 7.5 and and the sweeps).

**2. The shadcn semantic tokens (`primary`, `card`, `input`, `secondary`, `
`destructive`, `popover`, etc.) are not mapped in tailwind.config.ts.**
- Current button.tsx default variant: `bg-primary text-primary-foreground` 
— `primary` is **not** a color key in the config. The button is currently r rendering with **no background** for default/outline/secondary variants. Th
This is a pre-existing bug the plan doesn't fix.
- Task 7 installs shadcn Card/Badge/Input/Select — these generate `bg-card`
`bg-card`, `text-card-foreground`, `border-input`, `bg-secondary`, `text-de `text-destructive-foreground`, `bg-popover` — **none exist** in the config.
config. Installed components will be visually broken (no card fill, no inpu input border, etc.).
- The plan's "customise to reference Evo tokens" steps (7.2–7.4) only patch patch a few variants; the default shadcn variants still reference missing k
keys.
- **Fix:** add a full shadcn semantic block to the config in Task 2 (or a n new Task 2.5): `primary: "var(--color-heading)"`, `primary-foreground: "#03
"#030303"`, `card: "var(--color-surface)"`, `card-foreground: "var(--color-
"var(--color-foreground)"`, `input: "var(--color-border)"`, `secondary`, `s `secondary-foreground`, `destructive: "#ef4444"`, `destructive-foreground`,
`destructive-foreground`, `popover`, `popover-foreground`. These should pre precede Task 7.

**3. `base-nova` style uses Base UI (MUI), not Radix — Task 8's customisati customisation steps assume Radix structure.**
- The existing button imports `@base-ui/react/button` — confirmed.
- Base UI Dialog uses `Dialog.Root/Trigger/Portal/Backdrop/Popup/Title/Desc `Dialog.Root/Trigger/Portal/Backdrop/Popup/Title/Description/Close` — **no 
`DialogOverlay`, `DialogContent`, `DialogHeader`, `DialogFooter`**.
- Base UI Tabs uses `Tabs.Root/List/Tab/Panel` — **no `TabsTrigger`, no `Ta `TabsList`** in the Radix sense.
- Task 8 Step 2 ("modify DialogOverlay: bg-black/45") and Step 3 ("modify T TabsTrigger active state") reference components that won't exist in the gen
generated file. The CLI may still export shadcn-named wrappers (`DialogOver (`DialogOverlay` etc.) — but the structure and class locations are unpredic
unpredictable. **Fix:** add a step after each install to `cat` the generate generated file and adapt the token swaps to the actual structure. Do not as
assume Radix names.
- Also, Task 8's claim "shadcn Dialog + Tabs include Radix a11y" is **false
**false** for this style — it's Base UI a11y (which is fine, but the claim is wrong).

---

### Remaining Gaps 
**4. TypeWriter reduced-motion claim is wrong (Task 16.5 Step 2 note).**
- The `prefers-reduced-motion` media query only affects CSS animations/tran animations/transitions. The TypeWriter's typing/deleting is driven by **JS 
timeouts** — it will still type char-by-char for reduced-motion users. The note says "already covered" — it is not. **Fix:** add a `useReducedMotion()
`useReducedMotion()` check (or matchMedia) to skip straight to full word di display for reduced-motion users. Minor but worth correcting the claim.

**5. `focus-visible:ring-3` doesn't exist in Tailwind v3.**
- Standard ring widths are 0/1/2/4/8. `ring-3` generates nothing → focus ri ring invisible (pre-existing, but the plan's Task 8 adds `ring-accent` with
without a valid width). Use `focus-visible:ring-2` or the bare `ring` (defa (default 3px).

**6. `rounded-[min(var(--radius-md),10px)]` — `--radius-md` is never define defined as a CSS var.**
- The config's `borderRadius.md: 12px` is a Tailwind class, not a CSS varia variable. `var(--radius-md)` is undefined → invalid `min()` → radius droppe
dropped. Pre-existing in button.tsx; plan doesn't touch it.

**7. Sweep mapping `text-white/60 → text-frost` is a visual change, not a t token swap.**
- `rgba(255,255,255,0.6)` is warm-white; `#c9d3ee` is cool blue-tinted. Thi This shifts the appearance of secondary text across marketplace/mystable. I
If intended (per DESIGN.md cool-tone roles), fine — but the plan should say say it's an intentional restyle, not just "tokenise".

**8. LogoCarousel `width` attribute is dead.**
- `width={logo.width ?? logoHeight * 3}` sets the HTML attribute, but `styl `style={{ width: "auto" }}` overrides it. Harmless but sloppy — the attribu
attribute should be dropped or the style should use the width.

**9. Dialog overlay uses `bg-black/45` (Task 8)** — contradicts the plan's own "Don't: Hardcode bg-black" rule. Minor; the overlay dim is a deliberate
deliberate exception and should be documented as such in DESIGN.md.

**10. No verification step for partner logo files.** The plan assumes `/ima `/images/partners/*.png|jpg|webp` exist. Add a quick `ls` check in Task 16 
before replacing the grid.

---

### What was fixed well since v1 
- **shadcn install instead of hand-rolled primitives** — correct call, with with a good principle ("custom only where shadcn lacks the component").
- **Status colour aliases (`success`/`warning`/`error`)** — correct shortha shorthand for Badge variants; the `-bg/-text/-border` suffixes alone wouldn
wouldn't support `bg-success/10`.
- **Button accent variant added** — right shape, just missing the config ma mapping (Issue 1).
- **`prefers-reduced-motion` media query** — correctly added (though the Ty TypeWriter coverage claim is wrong).
- **TypeWriter cycling state machine** — logic is sound: type→hold→delete→a type→hold→delete→advance, all deps in the effect array, no stale closures, 
timeout cleanup on unmount. The 50ms "holding" phase is harmless.
- **LogoCarousel plain `<img>`** — the correct fix for the `fill`+`!relativ `fill`+`!relative` contradiction. The `-50%` translate on a doubled array i
is the right seamless-loop pattern. Keyframe properly added to globals.css.
globals.css.
- **Sandbox deletion instead of sweep** — correct scope decisio decision; `isSandbox` prop cleanup included.
- **Neutral decision matrix + WCAG contrast table in DESIGN.md** — excellen excellent, with the "cool neutrals for UI chrome only" rule clearly stated.
stated.
- **Task 22.5 added for remaining live pages** — closes the gap wher where sandbox sweep left orphan pages.
- **Execution order for 7.5/16.5** — 7.5 correctly precedes 19.5 (login res reskin); 16.5 correctly placed after the homepage work. No dependency confl
conflicts *except* the accent config gap (Issue 1).

---

**Bottom line:** The plan needs a revision pass to (a) add `accent`/`accent `accent`/`accent-hover` and the full shadcn semantic colour block to tailwi
tailwind.config.ts before Task 7, (b) rework Task 8's customisation steps t to match Base UI's actual generated structure, and (c) correct the TypeWrit
TypeWriter reduced-motion note. Those three fixes unblock everything else.