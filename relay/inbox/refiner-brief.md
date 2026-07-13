# RELAY Refiner Brief — Skip to End Button

## Task
Add "Skip to End" shortcut buttons to both the PDS (sub-step 3.1) and SA (sub-step 3.2) e-sign review containers in `PurchaseFlow.tsx`. The button scrolls the PDF embed container to the bottom and fires the same `hasScrolled` state that unlocks the agreement checkbox.

## Author
- Model: GLM-5.2 (Zhipu)
- Commit: `2af2b80` on branch `relay/skip-to-end-button`
- Gate: `rm -rf .next && npx tsc --noEmit --skipLibCheck` — GREEN (exit 0)

## Files Changed
Only one file matters for this review:
- `src/components/marketplace/PurchaseFlow.tsx` (+41 lines)

The commit also included binary assets (images, PDFs) and a seed script — these are pre-existing untracked files that got swept up by `git add -A`. **Ignore them.** Review only the PurchaseFlow.tsx diff.

## The Diff
```diff
diff --git a/src/components/marketplace/PurchaseFlow.tsx b/src/components/marketplace/PurchaseFlow.tsx
index 260c2f3..3177410 100644
--- a/src/components/marketplace/PurchaseFlow.tsx
+++ b/src/components/marketplace/PurchaseFlow.tsx
@@ -1,6 +1,6 @@
 "use client";
 
-import { useState, useEffect } from "react";
+import { useState, useEffect, useRef } from "react";
 import { useAuth } from "@/lib/auth-context";
 import { useRouter } from "next/navigation";
 import { NavBar } from "@/components/NavBar";
@@ -43,6 +43,9 @@ export default function PurchasePage(props: PurchasePageProps) {
   const [inventory, setInventory] = useState<LiveInventory | null>(null);
   const [inventoryLoading, setInventoryLoading] = useState(true);
 
+  const pdsScrollRef = useRef<HTMLDivElement>(null);
+  const saScrollRef = useRef<HTMLDivElement>(null);
+
   const signatureName = user?.displayName || user?.email?.split("@")[0] || "Verified Investor";
 
   // Redirect to login if not authenticated or verification page if unverified
@@ -326,6 +329,7 @@ export default function PurchasePage(props: PurchasePageProps) {
 
                     {props.hasPds ? (
                       <div
+                        ref={pdsScrollRef}
                         onScroll={(e) => {
                           const target = e.currentTarget;
                           if (target.scrollHeight - target.scrollTop - target.clientHeight < 50) {
@@ -342,6 +346,23 @@ export default function PurchasePage(props: PurchasePageProps) {
                       </div>
                     )}
 
+                    {/* Skip to End shortcut */}
+                    {props.hasPds && !pdsScrolled && (
+                      <button
+                        type="button"
+                        onClick={() => {
+                          const el = pdsScrollRef.current;
+                          if (el) {
+                            el.scrollTop = el.scrollHeight;
+                            setPdsScrolled(true);
+                          }
+                        }}
+                        className="text-[10px] uppercase tracking-wider text-white/40 hover:text-white/70 transition py-1"
+                      >
+                        Skip to End ↓
+                      </button>
+                    )}
+
                     {/* Pre-populated Signature block */}
                     <div className="space-y-2.5 pt-2 border-t border-white/[0.04]">
                       <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40">
@@ -413,6 +434,7 @@ export default function PurchasePage(props: PurchasePageProps) {
 
                     {props.hasSa ? (
                       <div
+                        ref={saScrollRef}
                         onScroll={(e) => {
                           const target = e.currentTarget;
                           if (target.scrollHeight - target.scrollTop - target.clientHeight < 50) {
@@ -429,6 +451,23 @@ export default function PurchasePage(props: PurchasePageProps) {
                       </div>
                     )}
 
+                    {/* Skip to End shortcut */}
+                    {props.hasSa && !saScrolled && (
+                      <button
+                        type="button"
+                        onClick={() => {
+                          const el = saScrollRef.current;
+                          if (el) {
+                            el.scrollTop = el.scrollHeight;
+                            setSaScrolled(true);
+                          }
+                        }}
+                        className="text-[10px] uppercase tracking-wider text-white/40 hover:text-white/70 transition py-1"
+                      >
+                        Skip to End ↓
+                      </button>
+                    )}
+
                     {/* Pre-populated Signature block */}
                     <div className="space-y-2.5 pt-2 border-t border-white/[0.04]">
                       <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40">
```

## Context — How the scroll acknowledgement works
The existing scroll handler in both containers:
```tsx
onScroll={(e) => {
  const target = e.currentTarget;
  if (target.scrollHeight - target.scrollTop - target.clientHeight < 50) {
    setPdsScrolled(true); // or setSaScrolled(true)
  }
}}
```
When the user scrolls within 50px of the bottom, `pdsScrolled`/`saScrolled` becomes `true`, which unlocks the agreement checkbox (`disabled={!pdsScrolled}`).

The Skip to End button programmatically scrolls to the bottom and sets the state directly. This is the same UX pattern as the scroll handler — just faster.

## What to Review
1. **Correctness**: Does `el.scrollTop = el.scrollHeight` reliably trigger the onScroll handler? Some browsers don't fire onScroll for programmatic scrollTop changes. If not, the direct `setPdsScrolled(true)` / `setSaScrolled(true)` call is the fallback — is that sufficient?
2. **Edge cases**: What happens if the PDF embed hasn't loaded yet and `scrollHeight` equals `clientHeight` (no scrollable content)? The button would set scrolled=true without the user seeing the document.
3. **UX**: Should the button disappear after clicking (it does — `!pdsScrolled` guard)? Is the styling consistent with the component's design language?
4. **TypeScript**: Are the refs typed correctly? Any unused vars?

## Gate Command
```bash
cd /home/evo/evo_01/02_website && rm -rf .next && npx tsc --noEmit --skipLibCheck
```
Must exit 0.

## Output Format
Output SEARCH/REPLACE blocks for any changes you recommend. If the code is clean and no changes needed, say "NO CHANGES" and explain why. Apply changes directly to the file if you have terminal access, then run the gate.