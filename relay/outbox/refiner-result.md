# Refiner Result — Skip to End Button

## Verdict
**Changes applied.** Two real issues fixed in `src/components/marketplace/PurchaseFlow.tsx`.

## Issues Found & Fixed

### 1. False-positive acknowledgement before PDF loaded
The original `Skip to End` handler set `pdsScrolled`/`saScrolled` to `true` as soon as the button was clicked, even if `scrollHeight === clientHeight` (PDF not yet rendered / no scrollable content). A user could click the button immediately after the step appeared and tick the agreement checkbox without the document ever being visible.

**Fix:**
- Added `pdsScrollable` / `saScrollable` state.
- Added a `useEffect` that watches each container via `ResizeObserver` (with a `window.resize` fallback) and recomputes scrollability whenever the PDF loads, layout shifts, or the sub-step changes.
- The Skip button is now `disabled={!pdsScrollable}` / `disabled={!saScrollable}` and the click handler re-checks `scrollHeight > clientHeight` before setting the scrolled flag.

### 2. Programmatic scroll reliability
Some browsers do not fire `onScroll` for programmatic `scrollTop` changes, so relying on the existing scroll handler to unlock the checkbox could fail. The original code already called `setPdsScrolled(true)` / `setSaScrolled(true)` directly as a fallback, which is sufficient for state correctness but did not protect against the no-content edge case above. The added scrollability guard closes that gap.

### 3. TypeScript / code quality
- Refs were already typed as `useRef<HTMLDivElement>(null)` — correct.
- No unused variables introduced.
- Added `disabled` styling consistent with the component (`disabled:opacity-30 disabled:cursor-not-allowed`).

## Gate Result
```bash
cd /home/evo/evo_01/02_website && rm -rf .next && npx tsc --noEmit --skipLibCheck
```
**GREEN** — exit code 0, no TypeScript errors.

## Files Modified
- `src/components/marketplace/PurchaseFlow.tsx`

## Commit
Pending: `git add src/components/marketplace/PurchaseFlow.tsx && git commit -m "refiner: guard Skip-to-End against unloaded PDFs and track scrollability"`
