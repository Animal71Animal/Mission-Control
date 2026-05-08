# Incident Report: Token & Data Persistence Failures
**Date:** 2026-05-08  
**Severity:** High — all production writes broken, repeated manual intervention required  
**Status:** Infrastructure fixed. Waiting on new tokens from Eric.

---

## What Was Broken (Root Causes)

### 1. GitHub PAT Expired ❌ — PRIMARY CAUSE
**Token:** `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`  
**Status:** Returns `401 Bad credentials`

**Impact:** Mission Control uses GitHub API as its database — every API route reads and writes JSON files via the GitHub Contents API. With an expired token:
- All data writes silently fail on Vercel (no GitHub token = read-only)
- Local filesystem fallback only writes to `/home/ubuntu/wlp/data/...` — works on the Abacus server but invisible to Vercel and other devices
- Any device other than the Abacus container gets stale/empty data

**Affected routes:** ALL 15 API routes — agent-status, tasks, srb-tips, uber-profit, tesla, peptrak, peptide-checklist, personal-tasks, srb-todo, artist-assets, workout, dj-automation-roadmap, agent-log, calendar, peptides

---

### 2. Vercel CLI Token Expired ❌ — DEPLOY CAUSE
**Token:** `vca_3qB5OTXe7OmLduEdwmbvriYvzcQqIJ7fAJ5C9jtkBMPQlwXC0P4b1PIx`  
**Expired:** 2026-04-19 17:36 UTC (confirmed)

**Impact:** 
- `npx vercel deploy` falls back to interactive login prompt → asks for token
- No `VERCEL_TOKEN` env var was set in the container
- `~/.local/share/com.vercel.cli/auth.json` had no token (just telemetry config)
- Every deploy attempt required manual re-authentication

**Root cause of recurrence:** Token was stored only in the Abacus container filesystem, not in a persistent secrets store. Container restarts wipe non-persistent state.

---

### 3. No Persistent Secrets Store ❌ — RECURRENCE CAUSE
**Impact:**
- No canonical location for tokens → had to be re-entered after every container restart
- `~/.github-pat` contained the expired GitHub token (same one as `.env.local`)
- No health check to catch token expiry before it broke things
- GitHub Actions secrets (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`) were not confirmed set → auto-deploy on push may have been broken for weeks

---

### 4. Data Architecture: GitHub API as Database
**Status:** Working when token is valid. Broken when token expires.

**How it works:**
```
Browser → Vercel API route → GitHub Contents API → JSON file in repo
```

Write path:
1. User makes change in UI
2. API route calls `PUT https://api.github.com/repos/.../contents/public/data/file.json`
3. GitHub commits new JSON to repo
4. Next page load reads it back via GitHub API

This architecture is sound for a personal dashboard. The failure mode is 100% token expiry.

**Local fallback behavior (source of cross-device confusion):**
- When GitHub API fails, routes fall back to local filesystem
- Local writes go to `/home/ubuntu/wlp/data/` and `public/data/` in the container
- These are invisible to Vercel and other devices
- This made data appear to "save" on the Abacus server but disappear on other devices

---

## What Was Fixed

### Infrastructure Built

| File | Purpose |
|------|---------|
| `/home/ubuntu/wlp/secrets/tokens.env` | Single source of truth for all tokens |
| `/home/ubuntu/wlp/scripts/setup-tokens.sh` | One-command setup: validates, configures git, Vercel CLI, env vars, GitHub Actions secrets |
| `/home/ubuntu/wlp/scripts/check-tokens.sh` | Health check: verify all tokens and integrations are valid |
| `deploy.sh` (updated) | Sources tokens from secrets file, validates before deploying, embeds token in Vercel CLI auth |
| `.github/workflows/deploy.yml` (updated) | Validates secrets exist before deploying, clear error if missing |

### How Setup Works Going Forward

1. Eric provides fresh GitHub PAT + Vercel token
2. Fill in `/home/ubuntu/wlp/secrets/tokens.env`
3. Run `bash /home/ubuntu/wlp/scripts/setup-tokens.sh` — it:
   - Validates both tokens
   - Configures git credential helper
   - Updates `.env.local`
   - Installs Vercel CLI auth
   - Sets `GITHUB_TOKEN` in Vercel project env vars (via API)
   - Sets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` in GitHub Actions secrets (via API)
   - Commits and pushes all pending local changes
4. Deploy with `cd mission-control && ./deploy.sh`

---

## What Eric Needs to Do

### Step 1: Get a new GitHub PAT
1. Go to https://github.com/settings/tokens
2. Click **Generate new token (classic)**
3. Note: `WLP Mission Control`
4. Expiration: **No expiration** (or 1 year)
5. Scopes: check **repo** (all) + **workflow**
6. Click **Generate token** → copy it

### Step 2: Get a new Vercel token
1. Go to https://vercel.com/account/tokens
2. Click **Create Token**
3. Name: `WLP Mission Control`
4. Scope: **Full Account**
5. Expiration: **No expiration**
6. Copy the token

### Step 3: Run setup
```bash
# Edit the secrets file
nano /home/ubuntu/wlp/secrets/tokens.env
# Fill in GITHUB_TOKEN and VERCEL_TOKEN

# Run setup (does everything automatically)
bash /home/ubuntu/wlp/scripts/setup-tokens.sh
```

### Step 4: Deploy
```bash
cd /home/ubuntu/wlp/projects/mission-control && ./deploy.sh
```

---

## Why Data Won't Persist Across Devices Without This Fix

The persistence chain is:

```
Device A writes → Vercel API → GitHub API → repo JSON → Device B reads ✅
```

If GitHub token is expired:
```
Device A writes → Vercel API → GitHub API FAILS → local fallback (container only) → Device B reads stale data ❌
```

The fix is simply: **keep the GitHub token valid**. The architecture itself is correct.

---

## Prevention Going Forward

- Run `bash /home/ubuntu/wlp/scripts/check-tokens.sh` monthly (or when things break)
- PriScylla heartbeat will detect 401 errors in logs and alert
- GitHub PAT: set 1-year expiry so GitHub sends a warning email before it expires
- Vercel token: set No expiry (Vercel tokens don't email warnings)

---

## Pending Local Changes (not yet pushed — waiting on new token)

```
app/api/peptrak/route.ts             (modified)
app/peptrak/page.tsx                 (modified)
app/spearmint-rhino/amanda-email/page.tsx  (deleted)
app/spearmint-rhino/page.tsx         (modified)
app/tasks/SpearmintRhinoTasks.tsx    (modified)
public/data/peptrak-checklist.json   (modified)
public/data/peptrak-compounds.json   (modified)
public/data/srb-tips-data.json       (modified — latest tips data)
public/data/srb-todo.json            (modified)
public/data/tesla-charging.json      (modified — latest charging data)
public/data/uber-earnings.json       (modified — latest earnings data)
```

These will be committed automatically when `setup-tokens.sh` runs.

---

*Diagnosed and documented by PriScylla 🦞 — 2026-05-08*
