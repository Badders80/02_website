# Deployment Notes — evolutionstables.nz

## Production Wiring (verified 2026-06-22)

| Item | Value |
|---|---|
| Vercel project | `evolution-3-0` (`prj_xxztNQporsqCJxd35MgrbaN7gqtB`) |
| Domain | `www.evolutionstables.nz` |
| GitHub repo | `Badders80/02_website` (repoId `1245368827`) |
| Production branch | `main` |
| Auto-deploy | `gitProviderOptions.createDeployments: enabled` |

## Manual Deploy (if auto-deploy ever fails)

```bash
TOKEN="<vercel-token>"
curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  "https://api.vercel.com/v13/deployments?projectId=prj_xxztNQporsqCJxd35MgrbaN7gqtB" \
  -d '{"gitSource":{"type":"github","repoId":1245368827,"ref":"main"},"target":"production","name":"evolution-3-0"}'
```

## Staging Project (separate, do not confuse with production)

| Item | Value |
|---|---|
| Vercel project | `evolution.2.0` (`prj_rE0ARGLzEG8F7aih8iUWqGE4YyeL`) |
| URL | `02website-pearl.vercel.app` |
| GitHub repo | `Badders80/02_website` (same repo, different project) |

## Legacy (do not use)

- `Badders80/Evolution-3.1` — old repo, no longer linked to production. The project metadata previously pointed here but actual deploys came from `02_website`.
