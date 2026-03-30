# Mission Control v2 — Database Notes

## Current Setup (Local / Dev)

Uses **`better-sqlite3`** with a local SQLite file at `./mission-control.db`.

- Config: `DATABASE_URL=file:./mission-control.db` in `.env.local`
- Init schema: `npm run db:init`
- Import JSON data: `npm run db:migrate`
- No auth tokens or cloud accounts needed

## ⚠️ Production Limitation

**Local SQLite does NOT work on Vercel** (ephemeral filesystem — db resets on every deploy/request).

### Options for production:

| Option | Effort | Cost | Notes |
|--------|--------|------|-------|
| **Vercel Postgres (Neon)** | Medium | Free tier available | Add `@vercel/postgres` driver, update `lib/db.ts` |
| **Turso** | Low | Free tier available | Re-enable `@libsql/client` with a working auth token |
| **VPS / self-hosted** | Low | ~$5-10/mo | SQLite file persists, current setup works as-is |
| **Keep JSON files** | None | Free | Lose write/CRUD features, but read-only views still work |

### Recommended path:
For quick production deployment → **Vercel Postgres** (already installed as `@vercel/postgres`).
For simplest long-term → **VPS** (DigitalOcean, Hetzner, etc.) where SQLite persists.

## Data Migration

Source JSON files are in `public/data/`:
- `tasks.json` → `tasks` table (29 rows)
- `personal-tasks.json` → `personal_tasks` table (empty)
- `tesla-charging.json` → `tesla_sessions` table (45 rows)
- `srb-tips-data.json` → `srb_nights` + `srb_entries` tables (43 nights, 440 entries)
- Artist assets → seeded from hardcoded list (16 rows)
