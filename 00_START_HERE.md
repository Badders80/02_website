# START HERE — 02_website

**Do not explore the tree first.** For “what’s next” / status / continue work:

## Required reads (only these two first)

1. [`relay/continue.md`](relay/continue.md)  
2. [`../docs/next-session-notes.md`](../docs/next-session-notes.md)  

Then answer or execute **Next action**.

## After that (only if needed)

| File | When |
|------|------|
| `relay/2026-07-13-payment-e2e-manolo.md` | Running the payment trial |
| `docs/BUILD_SUMMARY.md` | Architecture / rules |
| `docs/PROGRESS.md` | Diary history |

## Do not open for boot

- `GAME_PLAN.md` (stale Phase 0 plan)  
- June `docs/SESSION_BRIEF_*` / WIF docs  
- Parent `evo_01/` listing unless cross-vertical  
- Chat history as SSOT  

## Secrets (locked)

- Local: **`.env.local` only** · Prod: **Vercel only**  
- Never scatter `.env.production*` / vercel pulls at root → use `.secrets/archive/`  
- Check: `just secrets-check` · Details: `.secrets/README.md` · AGENTS law 8

## End of session

Say: **update the end of session notes**  
→ overwrite `relay/continue.md` + patch `../docs/next-session-notes.md`
