# Ownership Application System

**Version:** 1.0  
**Last Updated:** 2026-06-12  
**Status:** 🟡 In Development

---

## Overview

This document describes the ownership application system for Evolution Stables — a simple email notification system that allows users to apply for racehorse ownership stakes without requiring immediate payment or KYC verification.

---

## Architecture

```
User Flow:
  Marketplace Page → "Apply for Ownership" Button → Application Form → Email Notification → Admin Review

Backend:
  Frontend (Vercel) → Next.js API Routes → Cloud Functions → Firestore → Email Notification
```

---

## Components

### 1. Frontend Components

#### ApplyForm Component
- **Location:** `src/components/marketplace/ApplyForm.tsx`
- **Purpose:** Simple application form for ownership stakes
- **Features:**
  - Name, email, units requested, optional message
  - No KYC or payment required
  - Success feedback with confirmation message

#### Marketplace Detail Pages
- **Location:** `src/app/marketplace/[id]/page.tsx`
- **Location:** `src/app/marketplace-sandbox/[id]/page.tsx`
- **Features:**
  - Shows both "Acquire Stake" (payment) and "Apply for Ownership" (simple application)
  - Both forms available on same page

### 2. Backend Components

#### Cloud Functions

**Applications API**
- **Location:** `api/applications/main.py`
- **Routes:**
  - `POST /applications/submit` — Submit new application
  - `GET /applications/list` — List all applications (admin only)

**Submit Handler**
- **Location:** `api/applications/routes/submit.py`
- **Features:**
  - Creates application record in Firestore
  - Sends email notification to admin
  - Returns application ID and status

**List Handler**
- **Location:** `api/applications/routes/list_applications.py`
- **Features:**
  - Admin-only endpoint
  - Returns all applications ordered by creation date

#### Next.js API Routes

**Submit Route**
- **Location:** `src/app/api/applications/submit/route.ts`
- **Purpose:** Proxies application submissions to Cloud Functions

**List Route**
- **Location:** `src/app/api/applications/list/route.ts`
- **Purpose:** Proxies application listing to Cloud Functions

### 3. Admin Dashboard

**Applications Page**
- **Location:** `src/app/admin/applications/page.tsx`
- **Features:**
  - Lists all applications with status
  - Shows applicant details, units requested, message
  - Admin-only access (requires admin role + KYC verified)

---

## Data Model

### Firestore: `applications` Collection

```typescript
interface Application {
  id: string;              // Auto-generated document ID
  user_id: string;         // Firebase user ID
  hlt_id: string;          // HLT/Campaign ID
  email: string;           // Applicant email
  name: string;            // Applicant name
  units_requested: number; // Number of units desired
  message: string;         // Optional message
  status: "pending" | "reviewed" | "approved" | "rejected";
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

---

## Email Notification System

### Current Implementation

**Status:** 🟡 Placeholder (logs to console)

The system currently logs email content to the console. To implement actual email sending, you can choose from:

1. **Gmail API** (using existing `email-ingest` infrastructure)
2. **SendGrid** (third-party email service)
3. **Firebase Functions email trigger**
4. **Simple SMTP** (if Gmail SMTP is configured)

### Implementation Options

#### Option 1: Gmail API (Recommended for now)
- Use existing `email-ingest/gmail_client.py` as reference
- Requires domain-wide delegation setup
- No additional costs

#### Option 2: SendGrid
- Reliable, scalable email service
- Free tier available (35k emails/month)
- Requires API key configuration

#### Option 3: Firebase Functions Email Trigger
- Built-in email triggers
- Limited to 100 emails/day on free tier

---

## Deployment Steps

### 1. Deploy Cloud Functions

```bash
cd api/applications
gcloud functions deploy applications \
  --runtime python311 \
  --trigger-http \
  --region australia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars="ALLOWED_ORIGINS=https://evolution.2.0.vercel.app,https://02website-pearl.vercel.app"
```

### 2. Deploy Next.js API Routes

No additional deployment needed — Next.js handles this automatically.

### 3. Configure Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_API_BASE=https://australia-southeast1-evolution-engine.cloudfunctions.net
ADMIN_EMAIL=admin@evolutionstables.nz
```

---

## Testing

### Test Application Flow

1. Visit marketplace page: `http://localhost:3000/marketplace`
2. Click on any campaign
3. Scroll to "Apply for Ownership" section
4. Fill in form (name, email, units, message)
5. Submit application
6. Check admin dashboard: `http://localhost:3000/admin/applications`

### Verify Email Notification

Check Cloud Functions logs for email content:

```bash
gcloud functions logs read applications --limit 50
```

---

## Future Enhancements

### Phase 2: Email Implementation
- [ ] Implement actual email sending (Gmail API or SendGrid)
- [ ] Add email template with branding
- [ ] Configure email sender address

### Phase 3: Admin Actions
- [ ] Add "Approve" / "Reject" buttons in admin dashboard
- [ ] Update application status in Firestore
- [ ] Send status update email to applicant

### Phase 4: Payment Integration
- [ ] Link approved applications to Stripe Checkout
- [ ] Create payment links for approved applications
- [ ] Track payment status per application

### Phase 5: Ledger Integration
- [ ] Create ledger entries for approved applications
- [ ] Track ownership percentages
- [ ] Generate ownership certificates

---

## Related Documents

- **[HANDSHAKE.md](../HANDSHAKE.md)** — API handshake between frontend and backend
- **[01_evolution/HANDSHAKE.md](../../01_evolution/HANDSHAKE.md)** — Backend API documentation
- **[BLOCKERS.md](../BLOCKERS.md)** — Current blockers and handoff points
- **[docs/PROGRESS.md](../docs/PROGRESS.md)** — Build progress tracker

---

## Support

For questions or issues, check:
- Cloud Functions logs: `gcloud functions logs read applications`
- Firestore console: https://console.firebase.google.com/project/evolution-engine/firestore
- Vercel logs: https://vercel.com/dashboard/logs
