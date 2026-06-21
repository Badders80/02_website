# Vercel OIDC Setup Guide

**Date:** 2026-06-11  
**Project:** Evolution Stables Website  
**Vercel Project Name:** `evolution` (or `evolution-2-0`)

---

## Current Status

✅ **What's Deployed:**
- Cloud Functions (ssot v13, assets v5, kyc v9) with Firebase Auth
- Cloud Run proxy (`evolution-api-proxy`)
- WIF pool (`vercel-pool`) + OIDC provider (`vercel-oidc`)
- Service Account with invoker roles on all 3 CFs
- Vercel frontend (`evolution.2.0`) — live with proxy routes
- Apply to Own button — creates KYC session ✅

🔴 **Blocker:** Vercel OIDC not enabled

---

## Manual Steps (30 seconds total)

### Step 1: Enable Vercel OIDC (20 seconds)

1. Go to **https://vercel.com/dashboard**
2. Log in with `baddeley0@gmail.com`
3. Find your project (should be named **"evolution"** or **"evolution-2-0"**)
4. Click on the project to open it
5. Click **Settings** tab
6. Click **Security** in the left sidebar
7. Scroll down to **OpenID Connect**
8. Toggle **Enable** to ON
9. Click **Save** (if there's a save button)

### Step 2: Redeploy Vercel (10 seconds)

1. In the project dashboard, click **Deployments** tab
2. Click the **three dots** on the latest deployment
3. Click **Redeploy**
   - OR: Make a small change (like adding a space to README.md) and commit
   - OR: Click **"Trigger deployment"** if available

### Step 3: Test Handshake Page (30 seconds)

1. Wait 1-2 minutes for the redeployment to complete
2. Visit: `https://evolution.2.0.vercel.app/handshake`
3. Verify all **7 checks are green**
4. If all green, the auth chain is working: Vercel → WIF → GCP → Cloud Functions

---

## What This Fixes

When Vercel OIDC is enabled:
- Vercel can exchange JWT tokens with GCP
- Workload Identity Federation works
- Cloud Functions receive valid Firebase Auth tokens
- All 7 handshake endpoints return 200 OK

---

## Troubleshooting

### If handshake shows < 7 green:

1. **Check Vercel OIDC is enabled:**
   - Vercel Dashboard → Project → Settings → Security → OpenID Connect
   - Should show "Enabled"

2. **Check WIF configuration:**
   - GCP Console → IAM & Admin → Workload Identity Federation
   - Pool: `vercel-pool`
   - Provider: `vercel-oidc`

3. **Check Service Account roles:**
   - GCP Console → IAM → `website-api@evolution-engine.iam.gserviceaccount.com`
   - Should have `roles/cloudfunctions.invoker` on all 3 CFs

4. **Check Cloud Functions:**
   - GCP Console → Cloud Functions
   - Verify all 3 are deployed: `ssot`, `assets`, `kyc`
   - Check logs for any errors

---

## Next Steps After Handshake is Green

1. **Test Apply to Own → KYC flow**
   - Go to marketplace sandbox
   - Click "Apply to Own" on a horse
   - Verify KYC session creation works end-to-end

2. **Continue Sprint One**
   - Horse Media Console (admin panel)
   - Data sync between Cloud Functions and frontend

---

## Quick Reference

| Component | Status |
|-----------|--------|
| Cloud Functions | ✅ Deployed |
| Cloud Run proxy | ✅ SERVING |
| WIF pool | ✅ Configured |
| Service Account | ✅ Set up |
| Vercel frontend | ✅ Live |
| **Vercel OIDC** | **🔴 Enable now** |
| **Handshake page** | **🟡 Waiting for OIDC** |

---

**Status:** Ready to enable (just need dashboard access)  
**Time required:** 30 seconds  
**Impact:** Full auth chain activation
