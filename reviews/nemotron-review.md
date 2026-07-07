# 1. Architecture Assessment

Key architectural decisions in job spec:
- Hybrid static/dynamic: SSOT JSON at build time, Google Sheets API at runtime
- Detail page: Server component (SSG) for left column, client component for right column (ActionPanel) with blur overlay
- Auth: Firebase Auth with custom claims for KYC state
- Google Sheets as "database" via service account
- Stripe webhook enhanced with PDF generation pipeline
- MyStable: migrating from static JSON to dynamic Sheets reads

Potential issues:
- Google Sheets as primary transactional store - rate limits, consistency, 
no transactions
- Detail page architecture: server component with client wrapper - hydration mismatch risk
- PDF generation in webhook - timeout risk, bundle size
- No proper database - Sheets is not a database
- Auth context on server component? The detail page is SSG server component, but ActionPanel is client. The left column is fully public SEO c
content. This seems sound but need to check: the PRD says "Details page is 
fully crawlable by search engines" and "Right column action panel blurred/hidden for guest". The job spec approach (A) extracts right column 
to client component. This preserves SSG for left column. Good.

Dependency graph: Component 4 (Sheets lib) first, then others. Sensible.

Risks:
- Sheets API rate limits (500 requests/100 project/100 seconds per user) - 
marketplace grid reads inventory on every page load? Job spec says "Invento
"Inventory reads cached with 60s TTL". But on Vercel serverless, each invocation is separate. Need edge caching or SWR on client.
- PDF generation with pdf-lib in serverless: cold start, memory, timeout (1
(10s on Hobby, 60s on Pro). Job spec acknowledges and suggests separate function. Good.
- Google Drive upload: service account needs Drive scope, folder permissions.
- Firebase custom claims for KYC: claims refresh requires token refresh (1h
(1hr expiry). The auth context uses onIdTokenChanged - but that only fires 
on token refresh or sign-in. The KYC processing screen calls /api/kyc/statu
/api/kyc/status which syncs Stripe->Firebase claims. But the client won't s
see new claims until token refresh. The job spec says "auth context exposes kycStatus reactively via onIdTokenChanged" - but onIdTokenChanged d
doesn't fire when custom claims change on backend. Need to force token refresh (user.getIdToken(true)). This is a known Firebase issue.

## 2. Security Review

Authentication: Firebase Auth (email/password + Google). Good.
Authorization: Custom claims for KYC status, role, isAdmin. But custom claims are not real-time. The webhook writes to Sheets but doesn't verify K
KYC status again? The purchase flow checks KYC on client side before allowing purchase. But server-side validation needed in webhook.

KYC handling: Stripe Identity. Session created server-side. Callback verifies. Status check syncs to Firebase claims. Good.

Stripe webhooks: Need signature verification. Job spec doesn't mention but 
should be in create-session/webhook routes.

PDF generation: Uses pdf-lib to append audit page. Uploads to Google Drive 
with "view-only, anyone with link" - this is a risk! Signed legal documents with PII (name, IP, signature) accessible via link. Should be restricted to specific service account or signed URLs with expiry. "Anyone 
with link" is too permissive for financial/legal docs.

Google Drive/Sheets credentials: Service account JSON in env var. Risk if l
leaked. Should use secret manager. But for v1, env var is common.

Email sending: SMTP credentials in env. PII in emails (name, horse, shares)
shares). TLS required.

PII flows: User email, name, KYC data (ID document), financial data (shares
(shares, price). Stripe handles payment data. Sheets stores holdings with e
email, shares, price, PDF links. Communications sheet stores email history.
history. Need encryption at rest? Sheets doesn't encrypt. Google Workspace 
has encryption but not per-cell.

Financial data: Stripe checkout metadata includes user_id, hlt_id, shares, 
microchip. Webhook writes purchase_price_total_nzd. This is financial record.

Vulnerabilities:
1. Drive links "anyone with link" for signed PDFs - high risk
2. No server-side KYC verification in webhook - user could bypass client check
3. Custom claims staleness - KYC status may be outdated on client
4. Sheets as DB - no audit trail, no transactions, race conditions on shares_sold
5. Attribution stored in localStorage - can be cleared, not reliable for audit
6. No rate limiting on API routes (KYC, checkout, leads)
7. No input validation on lead forms, purchase amounts

## 3. Implementation Feasibility

Components well-scoped? Mostly yes. But:
- Component 4 (Google Sheets lib) is foundational but complex: need service account setup, API enablement, sheet ID, tab names, column mapping.
mapping. Error handling, retries, caching.
- Component 5 (Webhook enhancement) is high complexity: PDF generation, Drive upload, email, Sheets writes - all in one flow. Job spec suggests splitting. Good.
- Component 1 (Detail page blur): Need to handle hydration mismatch. Server renders full action panel for SEO? No - server renders left column o
only? Job spec says "left column stays server-rendered for SEO. Right column hydrates client-side." But the current page.tsx is a server component rendering both columns. Extracting right column to client component means the server component renders a client component. That's fine. But the server component must not render the action panel content for SEO? Actually PRD says "Right column (action panel) — blurred/hidden for guest". For SEO, Googlebot should see the content? Probably not - the a
action panel has CTAs, pricing, not narrative content. So server rendering 
a placeholder or blurred version is fine. But the job spec says "SEO impact: None. Left column remains server-rendered and fully crawlable. Right column hydrates client-side." This implies the right column is NOT server-rendered. That means the server component renders a client component with no fallback? That would cause layout shift. Need a suspense 
fallback or server-rendered blurred version.

- Component 2 (KYC processing screen): Depends on Sheets write for leads. S
Simple.
- Component 3 (Attribution): Simple but localStorage only - not reliable for server-side attribution. Should also set cookie.
- Component 6 (MyStable expansions): Switching from static to dynamic. Need API routes with auth. Client-side fetch with loading states. Feasible.
Feasible.
- Component 7 (sync_inventory.py): Optional, low priority.

Libraries: pdf-lib, googleapis, firebase-admin, stripe, nodemailer. All appropriate.

Harder than described:
- PDF generation + Drive upload reliability
- Sheets API rate limit handling in production
- Firebase custom claims propagation delay
- Hydration mismatch on detail page
- Webhook idempotency and retry logic

Effort estimates (relative):
- Component 4 (Sheets lib): 3-5 days (setup, types, read/write, caching, tests)
- Component 1 (Detail blur): 2-3 days (component extraction, auth integration, SEO testing)
- Component 3 (Attribution): 1-2 days
- Component 2 (KYC screen): 2-3 days (UI, API integration, lead form)
- Component 5 (Webhook+PDF): 5-8 days (PDF generation, Drive, email, error 
handling, splitting)
- Component 6 (MyStable): 3-5 days (API routes, UI tabs, client fetch, filtering)
- Component 7: 1 day

## 4. Gap Analysis

Missing from job spec relative to PRD:
1. **Waitlist flow**: PRD says "Fully Subscribed" badge shows "Join Waitlist" CTA. Job spec doesn't mention waitlist implementation. Leads sheet exists but no UI for waitlist.
2. **Register Interest for Coming Soon**: PRD says Coming Soon cards have "
"Register Interest" CTA. Not in job spec.
3. **Investment Terms Modal**: Job spec says it exists, but PRD specifies m
modal content: price per share, total lease %, lease period, start date, investor return %, total shares/available, "No Capital Calls" note. Job spec doesn't confirm all fields.
4. **Purchase flow steps**: PRD details 5 steps. Job spec says PurchaseFlow.tsx exists. But does it have scroll-to-bottom T&C checkbox? PDS/SA in scrollable modals? Job spec doesn't confirm.
5. **Confirmation page**: "You're now an owner" + what happens next + link 
to MyStable. Job spec says exists.
6. **MyStable OnboardingFlow**: 3-step tracker. Job spec says exists.
7. **Stable Logs & Feed**: PRD says "Stable Logs & Feed content" is out of 
scope Phase 1, but job spec shows MyStable has "stable logs feed (mock)". C
Contradiction.
8. **Documents section in MyStable**: PRD says "Documents section in MyStable" is not built. Job spec Component 6 adds it. Good.
9. **Investor Inbox**: PRD says "Investor Inbox / communications tab" not b
built. Job spec Component 6 adds it. Good.
10. **Welcome email template**: Not built. Job spec includes in webhook enhancement.
11. **Admin notification**: PRD says "Welcome email template + admin notification" not built. Job spec only mentions welcome email.
12. **Gallery images**: Only mock placeholders. Not in job spec tasks.
13. **PDS/SA for First Gear + I Stole A Manolo**: Placeholders needed. Not 
in job spec.
14. **Stripe secret key in Vercel**: Not deployed. Job spec lists in env vars.
15. **Back navigation**: PRD wants prominent "← Back to Marketplace" link. 
Job spec Component 1 includes it.
16. **KYC fallback lead capture**: Job spec Component 2 includes "Register 
for Manual Assistance" writing to Leads sheet.
17. **Attribution engine**: New in addendum, not in PRD. Job spec includes.
includes.
18. **Google Sheets schema**: Job spec defines 4 tabs. PRD mentions Inventory, Holdings, Leads, Communications. Good.
19. **Trainer display**: PRD says Copper Belt Lodge hidden. Job spec doesn'
doesn't mention but existing code handles.
20. **Horse registration tiers**: PRD has 3 tiers. Job spec DetailTabs.tsx 
handles breeding/performance URLs.

Contradictions:
- PRD: "No Database Middleware: Google Sheets serves as the secure system o
of record for v1." Job spec builds direct Sheets API client. Consistent.
- PRD: "MyStable reads from holdings.json (static)". Job spec Component 6 m
migrates to Sheets. This is an enhancement from addendum.
- PRD: "Out of Scope: Stable Logs & Feed content". Job spec audit says MyStable shows "stable logs feed (mock)". This is a discrepancy - either remove mock or clarify.

Open questions not answered:
1. **Waitlist implementation**: How does waitlist work? Lead form? Notification when shares available?
2. **Register Interest for Coming Soon**: Same as waitlist?
3. **Shares_sold concurrency**: Multiple simultaneous purchases - how to prevent overselling? Sheets has no transactions. Need locking mechanism or 
accept oversell risk.
4. **PDF generation failure handling**: If Drive upload fails, holding recorded but no PDF. Manual process?
5. **Email delivery failure**: Retry? Logging?
6. **KYC processing screen polling**: "Check Status Again" button - manual 
only? Auto-poll?
7. **Attribution persistence**: localStorage only? What if user clears cache? Cookie backup?
8. **MyStable data freshness**: Client-side fetch on mount? SWR? Revalidation?
9. **Google Drive folder permissions**: Who can access? Service account only? Signed URLs?
10. **Stripe webhook idempotency**: Duplicate events handling?
11. **Error boundaries**: For Sheets API failures in MyStable?
12. **Testing strategy**: Unit, integration, e2e?

Edge cases not covered:
- User buys shares, KYC verified, but webhook fails before PDF generation
- User refreshes KYC processing screen - multiple status checks
- Stripe Identity session expires
- Google Sheets API quota exceeded
- PDF generation timeout
- User with multiple holdings - MyStable filter by horse
- Unregistered horse registration later - slug change? URL redirect?
- Trainer/stable changes - sync pipeline updates
- Investor email change - how to update holdings/communications?

## 5. Recommendations

Prioritized actions:
1. **Critical**: Implement server-side KYC verification in purchase flow/webhook (security)
2. **Critical**: Fix Drive PDF sharing permissions - use restricted access 
or signed URLs (security)
3. **Critical**: Add concurrency control for shares_sold (oversell prevention) - maybe use Firebase Realtime Database for inventory counters o
only, or implement optimistic locking with Sheets
4. **High**: Split webhook PDF processing into separate function (reliabili
(reliability)
5. **High**: Implement waitlist and register interest flows (PRD requirement)
6. **High**: Add proper error handling, retries, logging for Sheets API (ob
(observability)
7. **High**: Fix Firebase custom claims propagation - force token refresh a
after KYC sync (correctness)
8. **Medium**: Detail page hydration strategy - provide server-rendered blurred fallback for ActionPanel (UX/SEO)
9. **Medium**: Attribution - add cookie backup, server-side read in webhook (data integrity)
10. **Medium**: MyStable migration to dynamic data with loading states and 
error boundaries (UX)
11. **Medium**: Add rate limiting to API routes (security)
12. **Low**: Gallery images, placeholder PDFs (content)
13. **Low**: Admin notification email (ops)
14. **Low**: sync_inventory.py enhancement (SEO)
15. **Ongoing**: Monitoring, alerting for Sheets API quota, webhook failures

Also: Document the Google Sheets schema (column names, types) in the repo. 
Define webhook idempotency keys. Add integration tests for purchase flow.

Now I'll structure the review.
...done thinking.

# Technical Architecture Review: Evolution Stables Marketplace & MyStable

---

## 1. Architecture Assessment

### Component Architecture Soundness

**Strengths:**
- **Hybrid static/dynamic split is correct**: Structural data (pedigrees, b
bios, registry) baked at build via `sync_inventory.py` → SEO-friendly, fast, cacheable. Transactional data (inventory counts, holdings, leads, communications) via Google Sheets API at runtime → avoids database middleware per PRD.
- **Detail page architecture (Option A)** is the right call: Left column stays a Server Component (SSG/ISR) for full SEO crawlability; right column 
extracted to `ActionPanel.tsx` (Client Component) for auth-aware blur/overlay. This preserves the PRD's "public details page, gated action p
panel" requirement without sacrificing static generation.
- **Dependency graph is logical**: Google Sheets client (Component 4) as foundation → Attribution (3) and Detail Blur (1) in parallel → KYC Screen (
(2) depends on Sheets writes → Webhook Enhancement (5) depends on Attribution + Sheets → MyStable Expansions (6) depends on Sheets reads. Build order is sensible.

**Architectural Risks & Anti-Patterns:**

| Risk | Severity | Details |
|------|----------|---------|
| **Google Sheets as transactional store** | High | No transactions, row-level locking, or atomic increments. Concurrent purchases can oversell 
shares (`shares_sold` race condition). Rate limits (500 req/100s/user) will bite under load. No audit trail. |
| **Firebase custom claims staleness** | High | `/api/kyc/status` syncs Stripe→Firebase claims, but client only sees new claims after ID token refresh (1hr expiry or manual `getIdToken(true)`). KYC processing screen's 
"Check Status Again" will show stale `kycStatus` unless auth context forces refresh. |
| **PDF generation in Vercel serverless** | High | `pdf-lib` + Drive upload + email in a single webhook handler risks timeout (10s Hobby / 60s P
Pro), cold-start bundle bloat, and memory pressure. Job spec acknowledges b
but mitigation (split function) is not yet implemented. |
| **Hydration mismatch on detail page** | Medium | Server component renders left column only; `ActionPanel` client component mounts with no server-rendered fallback → layout shift/flash. Need a blurred placeholder r
rendered server-side or `Suspense` fallback. |
| **No idempotency on Stripe webhook** | Medium | Duplicate `checkout.sessi
`checkout.session.completed` events will create duplicate holdings, PDFs, e
emails. Must implement idempotency keys (Stripe event ID + deduplication table). |
| **LocalStorage-only attribution** | Medium | `evo_attribution` in localStorage is fragile (cleared by user, private mode, cross-device). No s
server-side cookie backup. Webhook reads UTM from Stripe metadata (client→s
(client→server), but if client fails to send, attribution lost. |

### Data Flow Correctness

- **Static sync**: `sync_inventory.py` → `src/data/*.json` → build-time pages. ✅ Correct.
- **Dynamic reads**: `readInventory()` with 60s TTL cache. ⚠️ Vercel serverless has no in-memory cache across invocations. Need edge cache (Verc
(Vercel KV/Redis) or client-side SWR with `revalidate: 60`.
- **Dynamic writes**: Direct Sheets API append. ✅ Correct for v1, but needs retry/backoff and circuit breaker.

---

## 2. Security Review

### Authentication & Authorization
- **Firebase Auth (Email + Google)**: Standard, secure. ✅
- **Custom claims for KYC/role**: Acceptable for v1, but **claims propagation delay** (see Architecture) is an authorization bypass risk. User could hit `/purchase` before claims refresh.
- **Missing**: Server-side authorization guard in `/api/checkout/create-ses
`/api/checkout/create-session` and webhook. Client-side KYC check is insufficient; must re-verify on server.

### KYC Handling (Stripe Identity)
- **Flow**: Create session → callback → status sync → claims. ✅ Correct pattern.
- **Gap**: No server-side verification in purchase webhook. A malicious actor could skip KYC and call checkout directly.
- **PII**: Stripe Identity handles ID docs; only verification result (name,
(name, session ID, timestamp) stored in claims/Sheets. ✅ Minimized.

### Stripe Webhooks
- **Signature verification**: Not explicitly mentioned in job spec. **Must*
**Must** verify `stripe-signature` header in webhook handler.
- **Idempotency**: Missing. Use `event.id` deduplication (store in Sheets "
"Webhook Events" tab or Vercel KV).

### PDF Generation & Google Drive
- **Critical vulnerability**: `"view-only, anyone with link"` sharing on signed PDFs containing **full legal name, IP, signature timestamp, shares, 
price**. This is financial/legal PII exposed via guessable links.
  - **Mitigation**: Restrict to service account + generate **signed URLs with 1hr expiry** for MyStable display. Never use "anyone with link".
- **Drive folder structure**: Nested `/{horse_slug}/{purchase_id}/` recommended. Ensure service account has `drive.file` scope only (not full D
Drive).

### Google Sheets Credentials
- **Service account JSON in env var**: Standard for v1. Rotate keys quarterly. Consider Secret Manager for production.
- **Sheets as PII store**: Holdings (email, shares, price, PDF links), Communications (email, body), Leads (email, KYC failure). No encryption at 
rest beyond Google's default. Acceptable for v1 with access logging.

### Email Sending
- **SMTP credentials in env**: Use nodemailer with TLS. ✅
- **PII in emails**: Welcome email attaches signed PDFs → **do not attach P
PDFs**; send secure MyStable links instead. Attachments leak PII to email p
providers/logs.

### Financial Data Flows
- Stripe metadata: `user_id, hlt_id, shares, microchip, utm_*`. ✅ No raw c
card data.
- Webhook writes `purchase_price_total_nzd` to Sheets. ✅
- **Gap**: No validation that `shares_to_buy <= shares_available` at webhook time (race condition).

---

## 3. Implementation Feasibility

### Component Scoping & Library Choices

| Component | Feasibility | Library Fit | Hidden Complexity |
|-----------|-------------|-------------|-------------------|
| **4. Google Sheets Client** | High | `googleapis` (official) | Service account setup, column mapping, retry logic, TTL caching without in-memory s
store |
| **1. Detail Page Blur** | High | Next.js Client Components | Hydration fallback, SEO verification (Googlebot sees blurred panel?) |
| **3. Attribution Engine** | High | Custom + `js-cookie` | Cross-device, p
private mode, server-side read in webhook |
| **2. KYC Processing Screen** | Medium | Existing `/api/kyc/status` | Force token refresh (`user.getIdToken(true)`) after status sync; polling vs manual |
| **5. Webhook + PDF Pipeline** | **Low** | `pdf-lib`, `googleapis` (Drive)
(Drive), `nodemailer` | **Bundle size**, cold start, timeout, partial failure recovery, idempotency |
| **6. MyStable Expansions** | Medium | Client fetch + API routes | Auth-required API routes, loading/error states, filter UX |
| **7. sync_inventory.py Enhancement** | Low | Python + `googleapis` | Merge logic, build-time Sheets read (slows build) |

### Items Harder Than Described

1. **PDF Generation Reliability** (Component 5)
   - `pdf-lib` adds ~2MB to bundle. Vercel cold start + PDF parse/flatten →
→ **likely exceeds 10s Hobby limit**.
   - **Fix**: Move to dedicated serverless function (max 60s Pro) or Cloud 
Run job triggered via queue (e.g., Vercel KV + cron).

2. **Sheets Concurrency Control** (Component 4 + 5)
   - `shares_sold` increment is read-modify-write. No `SELECT FOR UPDATE`.
   - **Fix**: Use Firebase Realtime Database **only for inventory counters*
counters** (atomic increments) while keeping Sheets as system of record. Or implement optimistic locking with `ETag`/`If-Match` on Sheets API (not s
supported natively → need Apps Script lock).

3. **Firebase Claims Propagation** (Component 1, 2, 5)
   - `onIdTokenChanged` **does not fire** when backend updates custom claims.
   - **Fix**: After `/api/kyc/status` returns `verified`, call `await user.
user.getIdToken(true)` in client before redirect.

4. **Detail Page Hydration** (Component 1)
   - Server renders left column only. Client mounts `ActionPanel` → layout 
shift.
   - **Fix**: Server-render a blurred `<div class="blur-md" aria-hidden="true">` placeholder with same dimensions; client hydrates over it.

### Relative Effort Estimates (Engineering Weeks)

| Component | Estimate | Notes |
|-----------|----------|-------|
| 4. Sheets Client | 1.0 wk | Foundation; invest in types, retries, caching abstraction |
| 1. Detail Blur | 0.5 wk | UI + auth integration + SEO test |
| 3. Attribution | 0.3 wk | Client + cookie + webhook integration |
| 2. KYC Screen | 0.5 wk | Token refresh logic, lead form, UTM pass-through |
| 5. Webhook + PDF | **2.0 wk** | Split functions, Drive signed URLs, email, idempotency, error handling |
| 6. MyStable Expansions | 1.0 wk | API routes, client tabs, filtering, empty/error states |
| 7. Sync Enhancement | 0.2 wk | Optional, low ROI |
| **Total** | **~5.5 wk** | Sequential critical path: 4 → (1,3) → 2 → 5 → 6
6 |

---

## 4. Gap Analysis

### Missing from Job Spec vs. PRD

| PRD Requirement | Job Spec Status | Gap |
|-----------------|-----------------|-----|
| **Waitlist flow** ("Join Waitlist" on Fully Subscribed) | ❌ Not mentioned | Leads sheet exists but no UI, no notification trigger |
| **Register Interest** (Coming Soon badge CTA) | ❌ Not mentioned | Same a
as waitlist — lead capture form needed |
| **Investment Terms Modal fields** | ✅ Exists | Spec doesn't confirm all 
7 fields (price, lease %, period, start date, return %, shares avail, "No C
Capital Calls") |
| **Purchase Step 3: Scroll-to-bottom T&C** | ❌ Unverified | `PurchaseFlow
`PurchaseFlow.tsx` exists but no confirmation of PDS/SA modal + scroll detection + dual checkbox |
| **Confirmation page content** | ❌ Unverified | "What happens next" + MyStable link |
| **Stable Logs & Feed** | ⚠️ Mock only | PRD: "Out of Scope Phase 1" but c
codebase has mock feed. **Decision needed**: remove or scope. |
| **Gallery images (3-4/horse)** | ❌ Not in tasks | Content gap, not code 
|
| **PDS/SA placeholders for First Gear, I Stole A Manolo** | ❌ Not in tasks | Content gap |
| **Admin notification on purchase** | ❌ Not in webhook | PRD lists "welco
"welcome email + admin notification" |

### Contradictions

1. **MyStable data source**: PRD says "reads from `holdings.json` (static)"
(static)". Job Spec Component 6 migrates to Sheets reads. **Resolution**: A
Addendum overrides PRD — dynamic is correct for v1. Update PRD or note deviation.
2. **Stable Logs**: PRD "Out of Scope" vs codebase mock. **Resolution**: Remove mock feed until scoped.

### Unanswered Open Questions

| Question | Impact |
|----------|--------|
| **Waitlist/Register Interest UX & data model** | Blocks "Fully Subscribed" and "Coming Soon" CTAs |
| **Concurrency control for `shares_sold`** | Oversell risk — legal/financial exposure |
| **PDF generation failure fallback** | Holdings recorded but no PDF → manual remediation process? |
| **Signed URL expiry for Drive PDFs** | Security vs UX (MyStable links break after 1hr?) |
| **KYC processing: auto-poll vs manual button** | UX decision; auto-poll n
needs `setInterval` + token refresh |
| **Attribution persistence strategy** | localStorage + cookie? Server-side session? |
| **MyStable data freshness: SWR vs on-demand** | Performance vs accuracy t
tradeoff |
| **Stripe webhook idempotency key storage** | Sheets tab vs Vercel KV vs i
in-memory (lost) |
| **Error boundary for Sheets API failure in MyStable** | Graceful degradation spec missing |

### Edge Cases Not Covered

- **Unregistered horse → registered**: Slug change? 301 redirect? `breeding
`breeding_url`/`performance_profile_url` appear.
- **Trainer/stable rename**: Sync pipeline updates JSON but existing holdings/communications reference old names.
- **Investor email change**: No mechanism to update Holdings/Communications sheets.
- **Partial purchase** (Stripe success, webhook fails before PDF): Holding 
in Sheets, no PDF, no email → reconciliation job needed.
- **Stripe Identity session expiry** (24hr): User starts KYC, abandons, returns next day → new session needed.

---

## 5. Recommendations

### Prioritized Action List

#### 🔴 Critical (Do First — Security & Correctness)

1. **Server-side KYC verification in checkout/webhook**
   - Add `requireKYCVerified(userId)` guard in `/api/checkout/create-sessio
`/api/checkout/create-session` and webhook before processing.
   - Use Firebase Admin SDK to fetch latest claims (bypasses client staleness).

2. **Restrict Google Drive PDF access**
   - Upload with `drive.file` scope. Generate **signed URLs (1hr expiry)** 
for MyStable display. Never use "anyone with link".
   - Store only `fileId` in Sheets; construct signed URL at read time.

3. **Implement shares_sold concurrency control**
   - **Option A (recommended)**: Firebase Realtime Database counter at `/in
`/inventory/{hltId}/shares_sold` with atomic `increment()`. Webhook validates `shares_to_buy <= (total - current)` before commit.
   - **Option B**: Google Apps Script lock + Sheets write (slower, but keeps single store).

4. **Add Stripe webhook idempotency**
   - Store processed `event.id` in Sheets "Webhook_Log" tab or Vercel KV (T
(TTL 30d). Reject duplicates early.

5. **Force Firebase token refresh after KYC sync**
   - In `/api/kyc/status`, after setting custom claims, return `{"tokenRefr
`{"tokenRefreshRequired": true}`.
   - Client: `if (data.tokenRefreshRequired) await user.getIdToken(true);`.
user.getIdToken(true);`.

#### 🟠 High (Do Next — Reliability & PRD Completeness)

6. **Split webhook PDF processing into separate function**
   - Webhook: write holding record (minimal fields) + enqueue job (Vercel K
KV queue + cron, or Cloud Run Pub/Sub).
   - Worker: PDF generation → Drive upload (signed URLs) → Sheets update (P
(PDF links) → email → Communications log.
   - Fail-safe: Dead-letter queue + alerting.

7. **Implement Waitlist & Register Interest flows**
   - Shared lead form component → writes to Leads sheet with `action_type: 
'waitlist' | 'register_interest'`, `horse_slug`, UTM.
   - Admin notification on new lead (extend webhook email logic).

8. **Add rate limiting to public API routes**
   - `/api/kyc/create-session`, `/api/checkout/create-session`, lead forms 
→ 10 req/min/IP (Vercel Edge Middleware or `rate-limiter-flexible` with KV)
KV).

9. **Detail page hydration fallback**
   - Server-render blurred placeholder for `ActionPanel` with identical dimensions.
   - `ActionPanel` uses `useEffect` to mount real content; `suppressHydrati
`suppressHydrationWarning` on wrapper.

#### 🟡 Medium (Polish & Robustness)

10. **Attribution: cookie backup + server read**
    - Set `evo_attribution` cookie (1yr, Secure, SameSite=Lax) alongside localStorage.
    - Webhook reads from Stripe metadata (client→server) **and** cookie (vi
(via `checkout.session.client_reference_id` lookup).

11. **MyStable dynamic migration with SWR**
    - `/api/holdings` and `/api/communications` (auth-required, server-side Sheets read).
    - Client: `useSWR('/api/holdings', { revalidateOnFocus: false, dedupingInterval: 30000 })`.
    - Error boundary: "Data temporarily unavailable — showing last known state" + retry button.

12. **Purchase flow Step 3 verification**
    - Audit `PurchaseForm.tsx`: PDS/SA modals, scroll detection (`onScroll`
(`onScroll` + `scrollTop + clientHeight >= scrollHeight`), dual checkbox state, disabled "Continue" until both checked.

13. **KYC processing screen: auto-poll with backoff**
    - Poll `/api/kyc/status` every 10s (max 5×) → on `verified` redirect → 
else show manual button.
    - Each poll forces token refresh.

#### 🟢 Low (Content & Ops)

14. **Content gaps**: Gallery images, placeholder PDFs for 2 horses.
15. **Admin notification email** (separate from welcome email).
16. **`sync_inventory.py` enhancement** (build-time `shares_sold` merge) — 
only if SEO preview of % subscribed is critical.
17. **Remove Stable Logs mock feed** (per PRD out-of-scope) or scope for Phase 1.

---

### Architectural Decision Records (ADRs) Needed

| Decision | Options | Recommendation |
|----------|---------|----------------|
| **Inventory concurrency** | Firebase RTDB counter / Sheets Apps Script lock / Accept oversell | Firebase RTDB counter (atomic, separate from Sheets) |
| **PDF processing** | Inline webhook / Vercel Queue + Cron / Cloud Run Job | Vercel KV queue + cron (stays in Vercel ecosystem) |
| **Drive PDF access** | Anyone with link / Service account only + signed U
URLs / Signed URLs only | Signed URLs (1hr) generated at MyStable read time |
| **Attribution persistence** | localStorage only / Cookie only / Both | Both (cookie for server, localStorage for client) |
| **MyStable data freshness** | SSR / ISR 60s / Client SWR 30s | Client SWR (snappy initial load, near-realtime) |

---

### Final Note

The job spec is **well-structured and honest about gaps**. The hybrid architecture is appropriate for v1 constraints. The three highest-leverage 
fixes are: **(1) concurrency control for shares**, **(2) Drive PDF security**, and **(3) webhook idempotency + split PDF pipeline**. Address t
these before building new features. The KYC token refresh bug will bite every user — fix it in the auth context now.