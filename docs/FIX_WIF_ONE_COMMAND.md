# 🔧 Single Solution: Fix GCP WIF for Vercel OIDC

**Problem:** Handshake 0/7 failing, KYC returns 403  
**Root Cause:** GCP Workload Identity Provider not configured for Vercel's OIDC issuer  
**Solution:** Update WIF provider to trust Vercel OIDC

---

## 🎯 One Command to Fix

Run this in your terminal:

```bash
gcloud iam workload-identity-pools providers create-oidc vercel-oidc \
  --location="global" \
  --workload-identity-pool="vercel-pool" \
  --attribute-mapping="google.subject=assertion.sub,attribute.aud=assertion.aud" \
  --issuer-uri="https://oidc.vercel.com/baddeley0-2132s-projects" \
  --project="evolution-engine"
```

If provider already exists, delete and recreate:

```bash
# Delete old provider
gcloud iam workload-identity-pools providers delete vercel-oidc \
  --location="global" \
  --workload-identity-pool="vercel-pool" \
  --project="evolution-engine" \
  --quiet

# Create new provider with correct issuer
gcloud iam workload-identity-pools providers create-oidc vercel-oidc \
  --location="global" \
  --workload-identity-pool="vercel-pool" \
  --attribute-mapping="google.subject=assertion.sub,attribute.aud=assertion.aud" \
  --issuer-uri="https://oidc.vercel.com/baddeley0-2132s-projects" \
  --project="evolution-engine"
```

---

## 🚀 Then Redeploy to Vercel

```bash
cd /home/evo/evo_01/02_website
git commit --allow-empty -m "chore: redeploy after WIF fix"
git push origin 22May
```

Wait 3-5 minutes for deployment to complete.

---

## ✅ Verify It Worked

1. Visit: https://www.evolutionstables.nz/handshake
2. Should show: **7 OK, 0 FAIL** (all green)
3. Test KYC: Login → MyStable → "Start Verification" → Should redirect to Stripe

---

## 📋 What This Fixes

- ✅ Vercel can exchange OIDC token for GCP access token
- ✅ GCP issues identity token for `website-api@` service account
- ✅ Cloud Functions accept requests from Vercel
- ✅ All 7 handshake endpoints return 200 OK
- ✅ KYC flow works end-to-end

---

**One command. One redeploy. Done.**
