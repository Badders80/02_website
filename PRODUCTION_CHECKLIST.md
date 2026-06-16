# 🚀 Production Go-Live Checklist

**Date**: 2026-06-16  
**Status**: Ready for Credential Setup

---

## ✅ What's Been Completed

### 1. **Stripe KYC Frontend** ✅
- ✅ Verify page created: `/mystable/verify/page.tsx`
- ✅ KYC buttons added to marketplace detail pages
- ✅ Working "Start Identity Verification" flow
- ✅ Redirects to Stripe Identity verification page

### 2. **SEO Implementation** ✅
- ✅ StructuredData component (Organization + Website schema)
- ✅ FAQStructuredData component (FAQ schema)
- ✅ OpenGraph image generation (branded social shares)
- ✅ Web Manifest (PWA support)
- ✅ Enhanced sitemap.xml (all routes + priorities)
- ✅ robots.txt (protects /api, /auth, /mystable, /admin)
- ✅ Enhanced metadata (keywords: RWA, blockchain, tokenized)
- ✅ Structured data rendered in layout.tsx

### 3. **Environment Configuration** ✅
- ✅ `.env.local` updated with production structure
- ✅ Mock bypasses flagged for removal
- ✅ Placeholders for all required credentials

---

## 🔧 Credentials Needed (90 min setup)

### 1. **Google OAuth** (15 min)
**Get from**: [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

```bash
ENABLE_GOOGLE_AUTH=true
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
```

**Redirect URI to add**:
```
https://www.evolutionstables.nz/api/auth/callback/google
```

---

### 2. **Stripe Live Keys** (25 min)
**Get from**: [Stripe Dashboard → API Keys](https://dashboard.stripe.com/apikeys)

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Enable Stripe Identity**:
1. Go to [Stripe Identity](https://dashboard.stripe.com/identity)
2. Click "Enable Identity"
3. Complete business verification

**Create Webhook**:
1. Go to **Developers → Webhooks**
2. Add endpoint: `https://www.evolutionstables.nz/api/kyc/callback`
3. Events: `identity.verification_session.*`
4. Copy signing secret → `STRIPE_WEBHOOK_SECRET`

---

### 3. **Google Sheets Webhook** (10 min)
**Sheet**: https://docs.google.com/spreadsheets/d/1r1tLSTKIrcjxfn6NPGIfnmmj9GGebKXat8EZXMTHEyk

**Steps**:
1. Open Google Sheet
2. Extensions → Apps Script
3. Paste this code:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  
  sheet.appendRow([
    new Date(),
    data.email || '',
    data.name || '',
    data.source || 'website',
    data.kyc_status || 'pending'
  ]);\n\n  return ContentService\n    .createTextOutput(JSON.stringify({ success: true }))\n    .setMimeType(ContentService.MimeType.JSON);\n}
```

4. Deploy → New deployment → Web app
5. Execute as: **Me**
6. Who has access: **Anyone**
7. Copy Web app URL → `GOOGLE_SHEETS_WEB_APP_URL`

---

### 4. **NextAuth Secret** (2 min)
**Generate**:
```bash
openssl rand -base64 32
```

Add to Vercel:
```bash
NEXTAUTH_SECRET=<generated-secret>
NEXTAUTH_URL=https://www.evolutionstables.nz
```

---

## 📋 Vercel Setup

### Add Environment Variables

Go to Vercel → `evolution-3-0` → Settings → Environment Variables:

```bash
# Auth
NEXTAUTH_URL=https://www.evolutionstables.nz
NEXTAUTH_SECRET=<from-openssl>

# Google OAuth
ENABLE_GOOGLE_AUTH=true
GOOGLE_CLIENT_ID=<from-google>
GOOGLE_CLIENT_SECRET=<from-google>

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_<from-stripe>
STRIPE_SECRET_KEY=sk_live_<from-stripe>
STRIPE_WEBHOOK_SECRET=whsec_<from-stripe>

# Google Sheets
GOOGLE_SHEETS_WEB_APP_URL=<from-apps-script>

# Remove mock bypasses (set to false or delete)
NEXT_PUBLIC_BYPASS_AUTH_KYC=false
NEXT_PUBLIC_BYPASS_STRIPE=false
NEXT_PUBLIC_MOCK_ROLE=
NEXT_PUBLIC_MOCK_KYC=
```

---

## 🧪 Testing Checklist

### Before Deploy
- [ ] All credentials added to Vercel
- [ ] Mock bypasses removed/disabled
- [ ] Stripe Identity enabled
- [ ] Webhook configured

### After Deploy
- [ ] Homepage loads correctly
- [ ] Marketplace pages load
- [ ] "Verify Identity (KYC)" button appears on horse details
- [ ] Click KYC button → redirects to Stripe
- [ ] Complete verification → returns to site
- [ ] Check database: `users.kyc_status = 'verified'`
- [ ] Test application form → check Google Sheets
- [ ] Test Google OAuth sign-in

---

## 📊 Files Changed

### New Files Created
- `src/app/mystable/verify/page.tsx` — KYC verification page
- `src/components/seo/StructuredData.tsx` — Organization schema
- `src/components/seo/FAQStructuredData.tsx` — FAQ schema
- `src/app/opengraph-image.tsx` — Dynamic OG image
- `src/app/manifest.ts` — PWA manifest

### Files Updated
- `src/app/layout.tsx` — Added structured data + enhanced metadata
- `src/app/sitemap.ts` — Added all routes + priorities
- `src/app/robots.ts` — Added disallow rules
- `src/app/marketplace/[id]/page.tsx` — Added KYC button
- `.env.local` — Production structure

---

## 🎯 Next Steps

1. **Get credentials** (Google, Stripe, Sheets) — 50 min
2. **Add to Vercel** — 10 min
3. **Remove mock bypasses** — 2 min
4. **Deploy** — 5 min (auto-deploy on push)
5. **Test flow** — 20 min

**Total time**: ~90 minutes

---

## 🚨 Before You Deploy

**CRITICAL**: Remove these mock bypasses!

```bash
# In .env.local or Vercel env vars
NEXT_PUBLIC_BYPASS_AUTH_KYC=false  # Was: true
NEXT_PUBLIC_BYPASS_STRIPE=false    # Was: true
NEXT_PUBLIC_MOCK_ROLE=             # Was: admin
NEXT_PUBLIC_MOCK_KYC=              # Was: verified
```

If you don't remove these, the site will:
- ❌ Skip authentication
- ❌ Skip KYC verification
- ❌ Mock all Stripe calls
- ❌ Show admin access to everyone

---

## 📞 Support

**Build successful?** Run `npm run build` to verify compilation.

**SEO working?** Check page source for `<script type="application/ld+json">`.

**KYC flow?** Test with Stripe test mode first.

**Questions?** Check the comprehensive guides in `/home/evo/evo_01/_sandbox/Evolution-3.1/`

---

**Last Updated**: 2026-06-16  
**Status**: Ready for Credential Setup ✅
