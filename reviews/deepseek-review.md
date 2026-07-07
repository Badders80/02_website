# Architecture & Implementation Review

## 1. Architecture Assessment

### Overall Technical Approach
- **Next.js (App Router) + Firebase Auth + Stripe + Google Sheets + Google Drive + pdf-lib + nodemailer** is a pragmatic stack for a v1 marketplace with low transaction volume.
- The **hybrid static/dynamic data model** is sound: structural data (pedigrees, stories) is baked at build time from SSOT JSON, while transactional data (inventory, holdings, communications) is fetched at runtime from Google Sheets. This preserves SEO and performance for content pages while keeping operational data live.
- Using **Google Sheets as the system of record** is acceptable for v1 as explicitly stated in the PRD, but it introduces eventual consistency, lack of transactions, and no concurrency control. The job spec acknowledges this risk and proposes caching + static fallback, which is appropriate.

### Component Structure & Separation of Concerns
- **Detail page blur overlay** (Component 1): Extracting the right column into a client `ActionPanel.tsx` is the correct pattern. The left column remains a server component for SEO; the right column hydrates client-side. This avoids converting the entire page to a client component.
- **Google Sheets client library** (Component 4): Centralising all Sheets read/write operations in `src/lib/google-sheets.ts` is good separation. The job spec’s proposed functions cover the needed operations.
- **Webhook enhancement** (Component 5): The suggestion to split PDF generation into a separate serverless function is architecturally wise to avoid webhook timeouts.
- **MyStable expansions** (Component 6): Client-side fetching from new API routes that read from Sheets keeps the initial page load fast (static shell) while showing real-time data. This hybrid approach is appropriate.

### Anti-patterns & Scalability Concerns
- **Google Sheets as a database** is the primary anti-pattern. It lacks row-level locking, transactions, and has rate limits. For v1 with <100 transactions/day this is manageable, but the team must plan a migration path to a proper database for v2.
- **No concurrency control on inventory updates**: The webhook must atomically increment `shares_sold` in the Inventory sheet. Without a transaction, two simultaneous purchases could both read the same `shares_sold` and overwrite each other, leading to overselling. The job spec does not address this.
- **PDF generation in serverless functions**: `pdf-lib` can work, but cold starts and memory limits (Vercel Hobby: 10s timeout, 1 GB memory) may cause failures. The job spec’s mitigation (separate function, try/catch) is necessary but not sufficient; a queue-based approach or external service would be more robust.
- **MyStable dynamic data**: Switching from static JSON to runtime Sheets API is a significant shift. The job spec’s hybrid approach (static fallback) is good, but the API routes must be designed to handle Sheets API downtime gracefully.

## 2. Security Review

### Authentication & Authorization
- **Firebase Auth** with custom claims for KYC status is correctly implemented. The auth context provides reactive `kycStatus`.
- **KYC flow**: Stripe Identity integration is secure. The processing screen (Component 2) correctly calls `/api/kyc/status` to sync status.
- **Missing auth gating on purchase page**: The job spec does not mention adding authentication and KYC verification to the `/marketplace/[slug]/purchase` route. Currently, the page may be directly accessible. This must be enforced: unauthenticated users should be redirected to login; unverified users to KYC flow.
- **API route authorization**: The new API routes (`/api/communications`, `/api/holdings`) must verify the Firebase ID token on the server and filter data by the authenticated user’s email. The job spec does not detail this, but it is critical.

### Data Exposure Risks
- **Guest blur overlay (Component 1)**: The job spec proposes rendering the full action panel content with a CSS blur filter and overlay. This leaves sensitive data (investment terms, price, share counts) in the DOM, visible via browser dev tools. The PRD states the panel should be “Blurred/Hidden for Guest”. A CSS blur is not “hidden”. This is a **data exposure vulnerability**. **Recommendation**: The `ActionPanel` client component should conditionally render the actual content only when `user` is authenticated. When unauthenticated, it should render a placeholder (blurred decorative element) with the sign-in CTA, but no real data. This aligns with “Hidden” and eliminates the risk.

### Stripe Webhook Security
- Webhook signature verification using `STRIPE_CHECKOUT_WEBHOOK_SECRET` is standard and should already be in place.
- The webhook will have access to Google service account credentials for Sheets and Drive. These must be stored in server-only environment variables (not `NEXT_PUBLIC_*`). The job spec correctly lists `GOOGLE_SERVICE_ACCOUNT_KEY` as a new env var.
- **Missing rate limiting**: The webhook endpoint and other API routes should implement rate limiting to prevent abuse. Next.js API routes do not include this by default.

### Google Service Account Scope
- The service account will need **Google Sheets API** (read/write) and **Google Drive API** (upload, create permissions) scopes. If using Gmail API, additional scopes are required, but the job spec recommends nodemailer/SMTP instead, which avoids this.
- The service account key must be treated as a secret; it should never be exposed to the client. The job spec’s `GOOGLE_SERVICE_ACCOUNT_KEY` env var is server-side only, which is correct.

### Missing Security Controls
- **CSRF protection**: Not mentioned, but Next.js API routes are same-origin by default and Firebase tokens are sent via `Authorization` header, mitigating CSRF.
- **Input validation**: The webhook and API routes must validate incoming data (e.g., `shares_to_buy` within available range). The job spec does not address this.
- **Content Security Policy (CSP)**: Not discussed, but should be considered for production.

## 3. Implementation Feasibility

### Component-by-Component Assessment

| Component | Feasibility | Risk | Notes |
|-----------|-------------|------|-------|
| 1. Detail page blur overlay | High | Low | Straightforward extraction to client component. Must be implemented with conditional rendering (no data exposure). |
| 2. KYC processing screen | High | Low | New page, uses existing API. Lead capture depends on Component 4. |
| 3. Attribution engine | High | Low | Simple client-side utility. Optional for Stage 1. |
| 4. Google Sheets client lib | Medium | Medium | Requires clear sheet schema, service account setup, and handling of rate limits. Foundation for many other components. |
| 5. Webhook enhancement (PDF pipeline) | Low-Medium | High | PDF generation in serverless is the highest-risk item. Cold starts, timeouts, and `pdf-lib` bundle size are concerns. Must be decoupled from the webhook. |
| 6. MyStable expansions | Medium | Medium | New API routes with auth, client-side fetching. Depends on Component 4. |
| 7. sync_inventory.py enhancement | Low | Low | Optional, low priority. |

### Highest-Risk Items
1. **PDF generation pipeline** – Vercel serverless limits (10s timeout on Hobby, 60s on Pro) may be insufficient for PDF processing, especially on cold starts. The job spec’s mitigation (separate function) is necessary but still risky.
2. **Google Sheets client library** – If the sheet schema is not well-defined or the service account permissions are misconfigured, all dependent components stall.
3. **Concurrent purchase handling** – Without atomic inventory updates, overselling is possible. This is a business-critical risk.

### Simplest Path to a Working Stage 1
- **Defer full PDF generation**: For Stage 1, the webhook can record the holding, send a welcome email (without signed PDFs), and update the Inventory sheet. Signed PDFs can be generated manually or via a simple script post-purchase. This unblocks the entire flow while the PDF pipeline is built separately.
- **Use the existing Google Apps Script web app bridge** for writes initially, and build the direct Sheets API client in parallel. This reduces dependency risk.
- **Skip the attribution engine** for Stage 1; it is not in the PRD.
- **Implement the blur overlay with conditional rendering** (no data exposure) from the start.

### Vercel Serverless Limits & Cold Starts
- **Function timeout**: 10s (Hobby) / 60s (Pro). PDF generation with `pdf-lib` on a cold start may exceed 10s. Pro plan or a dedicated worker (e.g., Cloud Run) may be needed.
- **Memory**: 1 GB (Hobby) / 3 GB (Pro). `pdf-lib` is memory-efficient, but large PDFs could be an issue.
- **Cold starts**: The `googleapis` and `pdf-lib` packages are large; cold starts will be slow. Use `@googleapis/sheets` and `@googleapis/drive` individually to reduce bundle size. Consider edge functions for lightweight tasks.

## 4. Gap Analysis

### PRD Requirements Missing or Under-specified in Job Spec

| PRD Requirement | Job Spec Coverage | Gap |
|-----------------|-------------------|-----|
| **Inventory Sheet update on purchase** | Webhook enhancement (Component 5) only appends to Holdings, Communications, and uploads PDFs. No mention of updating `shares_sold` in Inventory. | **Critical gap.** The marketplace will show stale subscription percentages, and the purchase flow will not reflect real-time availability. |
| **Purchase flow uses live inventory data** | The job spec does not modify the existing purchase flow to fetch `shares_available` from Google Sheets at runtime. The current flow likely reads static `hlts.json`. | **Gap.** The PRD states “Live shares sold, listing status, active prices (runtime fetch)”. The purchase page must use dynamic data to prevent overselling. |
| **Auth/KYC gating on purchase page** | Not mentioned. | **Gap.** The purchase page must be protected: unauthenticated → login, unverified → KYC flow. |
| **Guest action panel “Hidden”** | Job spec implements CSS blur overlay, which still renders data in DOM. | **Security gap.** Data exposure risk. Should conditionally render content only for authenticated users. |
| **Welcome email + admin notification** | Job spec includes welcome email in webhook enhancement. Admin notification is not explicitly mentioned. | Minor gap. The PRD lists “Welcome email template + admin notification” as not built. The job spec should include an admin notification (e.g., email to operations) on new purchase. |
| **Documents section in MyStable** | Covered in Component 6. | OK. |
| **Investor Inbox** | Covered in Component 6. | OK. |
| **KYC processing screen with fallback lead capture** | Covered in Component 2. | OK. |
| **Back navigation link** | Job spec mentions adding a prominent `← Back to Marketplace` link. | OK. |

### Job Spec Additions Beyond PRD (Scope Creep)
- **Attribution engine (Component 3)**: UTM/ref capture is not mentioned in the PRD. It is an add-on from the addendum. This is **optional scope** and should not block Stage 1.
- **Two-stage build strategy (wireframes → polish)**: This is a project management approach, not a product requirement. It does not introduce scope creep but may affect timeline expectations.
- **sync_inventory.py enhancement (Component 7)**: Optional, not required by PRD.

### Contradictions Between Job Spec and PRD
- **Blur overlay implementation**: The job spec’s CSS blur approach contradicts the PRD’s “Hidden” if interpreted as not accessible. The PRD says “Blurred/Hidden for Guest”, which could mean either, but the safer interpretation is to not expose data. The job spec should align with the more secure interpretation.
- **Webhook flow**: The job spec’s webhook does not update the Inventory sheet, but the PRD’s data flow shows the Inventory Sheet as the source of live shares sold. This is a direct contradiction of the intended architecture.

## 5. Recommendations

### Prioritized Recommendations

1. **Critical: Add Inventory update to webhook and dynamic inventory to purchase flow**
 - The webhook must atomically increment `shares_sold` in the Inventory sheet after a successful purchase.
 - The purchase flow (`/marketplace/[slug]/purchase`) must fetch `shares_available` from the Google Sheets API (via `readInventory()`) at runtime, not from static JSON.
 - Implement a simple concurrency control: use a version number or optimistic locking, or accept the risk for v1 with a note to monitor.

2. **High: Fix data exposure in guest blur overlay**
 - Modify `ActionPanel.tsx` to conditionally render the action panel content only when `user` is authenticated. When unauthenticated, show a blurred placeholder with the sign-in CTA, but no real data. This eliminates the DOM data leak.

3. **High: Add auth/KYC gating to purchase page**
 - In `/marketplace/[slug]/purchase/page.tsx`, check authentication and `kycStatus`. Redirect unauthenticated users to login with `redirect` param; redirect unverified users to KYC flow or processing screen.

4. **High: Define Google Sheets schema before development**
 - Document the exact column names, order, and data types for Inventory, Holdings, Leads, and Communications sheets. Confirm the sheet ID. This is a prerequisite for Component 4.

5. **Medium: Simplify PDF generation for Stage 1**
 - Defer full `pdf-lib` stamping. Instead, the webhook records the holding, sends a welcome email (without attachments), and updates Inventory. Signed PDFs can be generated manually or via a separate script post-purchase. This unblocks the critical path and reduces risk.
 - If PDFs are absolutely required for Stage 1, use a lightweight approach: generate a simple text-based signature page (HTML to PDF via a microservice) or use a third-party API like Docuseal.

6. **Medium: Implement Google Sheets client library with fallback**
 - Build `src/lib/google-sheets.ts` with the functions listed in the job spec, plus `updateInventorySharesSold(horseSlug, newTotal)`.
 - Use the `googleapis` package (individual sub-packages to reduce bundle size).
 - Implement caching for reads (60s TTL) and static JSON fallback if the API is unavailable.

7. **Medium: Secure all new API routes**
 - In `/api/communications` and `/api/holdings`, verify the Firebase ID token from the `Authorization` header, extract the user’s email, and filter data accordingly. Return 401 if invalid.

8. **Low: Defer attribution engine**
 - The attribution engine is not in the PRD. Move it to a post-Stage 1 enhancement.

9. **Low: Add rate limiting and input validation**
 - Apply rate limiting to the webhook and public API routes. Validate `shares_to_buy` against available inventory in the checkout session creation.

### Minimum Viable Implementation Order for Stage 1

1. **Define Google Sheets schema** and set up service account with necessary scopes.
2. **Build Google Sheets client library** (`src/lib/google-sheets.ts`) with read/write functions, including `updateInventorySharesSold`.
3. **Modify purchase flow** to fetch live inventory from Sheets and enforce auth/KYC gating.
4. **Implement detail page blur overlay** with secure conditional rendering (no data exposure).
5. **Implement KYC processing screen** with lead capture (depends on Sheets lib).
6. **Enhance webhook** to update Inventory, record holding, and send welcome email (without PDFs).
7. **Build MyStable expansions** (Investor Inbox, Documents) with dynamic data from Sheets.
8. **Add PDF generation** as a separate serverless function (post-Stage 1 or parallel track).
9. **Attribution engine** (optional, post-Stage 1).

### Alternatives to Reduce Risk or Complexity
- **For PDF generation**: Use a third-party service like **Docuseal** or **PandaDoc API** to handle e-signatures and PDF stamping, avoiding serverless PDF processing entirely.
- **For email**: Use a transactional email service (SendGrid, Postmark) instead of nodemailer/SMTP to simplify delivery and avoid Gmail API complexity.
- **For Google Sheets concurrency**: Accept the risk for v1 and implement a simple “last write wins” approach, with a manual reconciliation process. Document the limitation.

### Open Questions to Resolve Before Development
1. **What is the exact Google Sheets schema** (column names, order) for all four tabs?
2. **What is the Google Drive folder ID** and the desired folder structure for signed PDFs?
3. **Which email service will be used** (SMTP provider, SendGrid, etc.)? Are credentials available?
4. **Will the service account have domain-wide delegation** if Gmail API is needed, or will we use SMTP?
5. **How will concurrent purchases be handled**? Is a simple “last write wins” acceptable for v1, or do we need a locking mechanism?
6. **Is the attribution engine a Stage 1 requirement**? (PRD does not mention it; recommend deferring.)
7. **What is the fallback behavior** if Google Sheets API is unreachable? (Static JSON fallback already considered, but needs explicit error handling in UI.)
8. **What Vercel plan** will be used? Pro is recommended for longer function timeouts and higher memory if PDF generation is kept in-serverless.