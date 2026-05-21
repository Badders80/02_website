# API Handshake — Frontend ↔ Backend

**Version:** 1.0  
**Last Updated:** 2026-05-19

---

## Overview

This document defines how the frontend (`02_website/`) connects to the backend (`01_evolution/`).

**Architecture:**
```
Frontend (Vercel) → HTTP API Calls → Backend (GCP Cloud Functions)
```

---

## Backend Endpoints

### SSOT API
**Base URL:** `https://australia-southeast1-evolution-engine.cloudfunctions.net/ssot`

| Endpoint | Method | Frontend Use | Response |
|----------|--------|--------------|----------|
| `/horses` | GET | Browse horses | `Horse[]` |
| `/horses/{microchip}` | GET | Horse detail page | `Horse` |
| `/owners` | POST | Create owner (admin) | `Owner` |
| `/hlts` | POST | Create HLT (admin) | `HLT` |
| `/docs/generate` | POST | Generate PDF docs | `{ pdf_url }` |

### Assets API
**Base URL:** `https://australia-southeast1-evolution-engine.cloudfunctions.net/assets`

| Endpoint | Method | Frontend Use | Response |
|----------|--------|--------------|----------|
| `/upload` | POST | Upload horse images | `{ asset_id, gcs_url }` |
| `/retrieve` | GET | Get horse images | `Asset[]` |
| `/delete` | DELETE | Remove asset | `{ success }` |

### KYC API
**Base URL:** `https://australia-southeast1-evolution-engine.cloudfunctions.net/kyc`

| Endpoint | Method | Frontend Use | Response |
|----------|--------|--------------|----------|
| `/create-session` | POST | Start KYC verification | `{ session_url }` |
| `/webhook` | POST | Stripe webhook (backend only) | `{ status }` |

---

## Frontend Integration

### Environment Variables

```env
# Backend API base URL
NEXT_PUBLIC_API_BASE=https://australia-southeast1-evolution-engine.cloudfunctions.net

# Stripe (public key only)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Firebase (client config)
NEXT_PUBLIC_FIREBASE_CONFIG={"apiKey":"...","authDomain":"...","projectId":"evolution-engine",...}
```

### API Client

```typescript
// src/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

async function apiCall(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}

export async function getHorses() {
  return apiCall('/ssot/horses');
}

export async function getHorseByMicrochip(microchip: string) {
  return apiCall(`/ssot/horses/${microchip}`);
}

export async function createKYCSession(userId: string) {
  const { session_url } = await apiCall('/kyc/create-session', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
  window.location.href = session_url; // Redirect to Stripe
}
```

---

## Authentication Flow

### Firebase Auth

```typescript
// Frontend: Login
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const user = await signInWithEmailAndPassword(auth, email, password);
const idToken = await user.getIdToken();

// Send token to backend for verification
await fetch(`${API_BASE}/auth/verify`, {
  headers: { 'Authorization': `Bearer ${idToken}` },
});
```

```python
# Backend: Verify token
import firebase_admin
from firebase_admin import auth

def verify_token(request):
    id_token = request.headers.get('Authorization').split('Bearer ')[1]
    decoded = auth.verify_id_token(id_token)
    return jsonify({'user_id': decoded['uid']})
```

---

## Stripe Identity Flow

```typescript
// Frontend: Create KYC session
const { session_url } = await createKYCSession(userId);
window.location.href = session_url; // Redirect to Stripe

// After verification, Stripe redirects back to:
// /auth/verify?session_id=...
```

```python
# Backend: Create session
import stripe

stripe.api_key = os.environ['STRIPE_SECRET_KEY']

session = stripe.identity.VerificationSession.create(
    type='document',
    metadata={'user_id': user_id},
)

return jsonify({'session_url': session.url})
```

---

## Error Handling

### Frontend

```typescript
try {
  const horses = await getHorses();
} catch (error) {
  if (error.message.includes('401')) {
    // Redirect to login
    router.push('/auth/login');
  } else if (error.message.includes('403')) {
    // Show permission error
    showToast('Access denied');
  } else {
    // Generic error
    showToast('Something went wrong');
  }
}
```

### Backend

```python
from flask import jsonify

def handle(request):
    try:
        # Business logic
        return jsonify(result)
    except ValidationError as e:
        return jsonify({'error': str(e)}), 400
    except AuthError as e:
        return jsonify({'error': 'Unauthorized'}), 401
    except Exception as e:
        return jsonify({'error': 'Internal error'}), 500
```

---

## Rate Limiting

**Backend limits:**
- 100 requests/minute per IP (SSOT API)
- 10 requests/minute per IP (Assets API)
- 5 requests/minute per IP (KYC API)

**Frontend caching:**
```typescript
// Cache horse list for 5 minutes
const horses = await getHorses();
localStorage.setItem('horses', JSON.stringify({
  data: horses,
  timestamp: Date.now(),
}));

// Check cache before API call
const cached = localStorage.getItem('horses');
if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
  return JSON.parse(cached).data;
}
```

---

## Related

- **[01_evolution/api/README.md](../01_evolution/api/README.md)** — Backend API docs
- **[src/lib/api.ts](src/lib/api.ts)** — Frontend API client (to create)
- **[GAME_PLAN.md](GAME_PLAN.md)** — Build plan
