#!/usr/bin/env bash
# One-shot: create live checkout (+ ensure KYC) webhooks, push secrets to Vercel.
# Requires write-capable key: export STRIPE_API_KEY='sk_live_...'  (or rk_live with Webhooks Write)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -z "${STRIPE_API_KEY:-}" ]]; then
  if [[ -f "$ROOT/.env.stripe.write" ]]; then
    # shellcheck disable=SC1091
    set -a
    source "$ROOT/.env.stripe.write"
    set +a
  fi
fi

if [[ -z "${STRIPE_API_KEY:-}" ]]; then
  echo "ERROR: Set STRIPE_API_KEY first (sk_live_... or rk_live_... with Webhooks Write)"
  echo "  export STRIPE_API_KEY='sk_live_...'"
  echo "  # or: printf 'STRIPE_API_KEY=%s\\n' 'sk_live_...' > .env.stripe.write && chmod 600 .env.stripe.write"
  exit 1
fi

KEY="$STRIPE_API_KEY"
prefix="${KEY:0:8}"
if [[ "$prefix" != "sk_live_" && "$prefix" != "rk_live_" ]]; then
  echo "ERROR: Expected sk_live_ or rk_live_ key, got prefix=${prefix}..."
  exit 1
fi

echo "==> Proving key can write webhook endpoints..."
if ! stripe webhook_endpoints list --live --api-key "$KEY" >/tmp/stripe_we_list.json 2>/tmp/stripe_we_list.err; then
  cat /tmp/stripe_we_list.err
  exit 1
fi

CHECKOUT_URL="https://www.evolutionstables.nz/api/checkout/webhook"
KYC_URL="https://www.evolutionstables.nz/api/kyc/callback"

existing_checkout=$(python3 - <<'PY'
import json
d=json.load(open("/tmp/stripe_we_list.json"))
for e in d.get("data",[]):
    if e.get("url")=="https://www.evolutionstables.nz/api/checkout/webhook":
        print(e["id"]); break
PY
)

existing_kyc=$(python3 - <<'PY'
import json
d=json.load(open("/tmp/stripe_we_list.json"))
for e in d.get("data",[]):
    if e.get("url")=="https://www.evolutionstables.nz/api/kyc/callback":
        print(e["id"]); break
PY
)

echo "Existing checkout endpoint: ${existing_checkout:-NONE}"
echo "Existing KYC endpoint:      ${existing_kyc:-NONE}"

create_endpoint() {
  local url="$1"
  shift
  local events=("$@")
  local args=(webhook_endpoints create --live --api-key "$KEY" -d "url=$url")
  local e
  for e in "${events[@]}"; do
    args+=(-d "enabled_events[]=$e")
  done
  stripe "${args[@]}"
}

if [[ -z "$existing_checkout" ]]; then
  echo "==> Creating CHECKOUT webhook endpoint..."
  create_endpoint "$CHECKOUT_URL" \
    "checkout.session.completed" \
    "checkout.session.expired" \
    > /tmp/stripe_we_checkout.json
  checkout_id=$(python3 -c "import json; print(json.load(open('/tmp/stripe_we_checkout.json'))['id'])")
  checkout_secret=$(python3 -c "import json; print(json.load(open('/tmp/stripe_we_checkout.json')).get('secret') or '')")
  echo "Created checkout: $checkout_id"
else
  checkout_id="$existing_checkout"
  checkout_secret=""
  echo "==> Checkout endpoint already exists ($checkout_id)."
  echo "    Signing secret only returned at create time."
  echo "    If Vercel secret already matches, leave it; else roll secret in Dashboard or delete+recreate."
fi

if [[ -z "$existing_kyc" ]]; then
  echo "==> Creating KYC webhook endpoint..."
  create_endpoint "$KYC_URL" \
    "identity.verification_session.verified" \
    "identity.verification_session.requires_input" \
    "identity.verification_session.canceled" \
    "identity.verification_session.processing" \
    "identity.verification_session.created" \
    > /tmp/stripe_we_kyc.json
  kyc_id=$(python3 -c "import json; print(json.load(open('/tmp/stripe_we_kyc.json'))['id'])")
  kyc_secret=$(python3 -c "import json; print(json.load(open('/tmp/stripe_we_kyc.json')).get('secret') or '')")
  echo "Created KYC: $kyc_id"
else
  kyc_id="$existing_kyc"
  kyc_secret=""
  echo "==> KYC endpoint already exists ($kyc_id) — leave secret alone."
fi

set_vercel_secret() {
  local name="$1"
  local value="$2"
  if [[ -z "$value" ]]; then
    echo "SKIP vercel $name (no new secret)"
    return 0
  fi
  echo "==> Setting Vercel Production $name ..."
  # remove old then add (update may prompt interactively)
  vercel env rm "$name" production --yes 2>/dev/null || true
  printf '%s' "$value" | vercel env add "$name" production --sensitive 2>/dev/null \
    || printf '%s' "$value" | vercel env add "$name" production
  echo "Set $name (len=${#value})"
}

if [[ -n "${checkout_secret:-}" ]]; then
  set_vercel_secret STRIPE_CHECKOUT_WEBHOOK_SECRET "$checkout_secret"
  # also stash locally (gitignored)
  umask 077
  {
    echo "# generated $(date -Iseconds)"
    echo "STRIPE_CHECKOUT_WEBHOOK_SECRET=$checkout_secret"
    [[ -n "${kyc_secret:-}" ]] && echo "STRIPE_KYC_WEBHOOK_SECRET=$kyc_secret"
  } >> "$ROOT/.env.stripe.webhooks"
  chmod 600 "$ROOT/.env.stripe.webhooks"
fi

if [[ -n "${kyc_secret:-}" ]]; then
  set_vercel_secret STRIPE_KYC_WEBHOOK_SECRET "$kyc_secret"
fi

echo ""
echo "==> Final webhook list"
stripe webhook_endpoints list --live --api-key "$KEY" | python3 -c '
import sys,json
d=json.load(sys.stdin)
for e in d.get("data",[]):
    print(f"{e[\"id\"]}  {e[\"status\"]}  {e[\"url\"]}")
    print(f"  events: {e[\"enabled_events\"]}")
'

echo ""
echo "DONE."
echo "If a new checkout secret was set → redeploy production:"
echo "  cd $ROOT && vercel --prod"
echo "Then: curl -s https://www.evolutionstables.nz/api/diagnostics/payment-health | python3 -m json.tool"
echo ""
echo "Optional: resend last checkout.session.completed from Dashboard → Developers → Events"
