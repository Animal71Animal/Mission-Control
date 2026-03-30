# Mission Control v2 — Database Setup

## Overview

Mission Control v2 uses **Turso** (libsql/SQLite) as its database backend.  
All data that was previously in JSON files is now stored in a real SQL database.

---

## One-Time Setup

### 1. Install Turso CLI

```bash
curl -sSfL https://get.tur.so/install.sh | bash
source ~/.bashrc   # or restart terminal
```

### 2. Login to Turso

```bash
turso auth login
```

### 3. Create the database

```bash
turso db create mission-control
```

### 4. Get credentials

```bash
# Database URL
turso db show mission-control --url

# Create auth token
turso db tokens create mission-control
```

### 5. Update `.env.local`

```env
TURSO_DATABASE_URL=libsql://mission-control-yourname.turso.io
TURSO_AUTH_TOKEN=eyJhbGci...your-token-here
```

### 6. Initialize the database schema

```bash
npm run db:init
```

### 7. Migrate existing JSON data

```bash
npm run db:migrate
```

### 8. Add credentials to Vercel

```bash
vercel env add TURSO_DATABASE_URL production
vercel env add TURSO_AUTH_TOKEN production
```

Then redeploy:

```bash
vercel --prod
```

---

## Local Development

For local dev without a Turso account, use a local SQLite file:

```env
TURSO_DATABASE_URL=file:./local.db
TURSO_AUTH_TOKEN=
```

Then run `npm run db:init` to create the schema locally.

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `tasks` | ANIMAL + PriScylla shared tasks |
| `personal_tasks` | Private personal to-dos |
| `srb_nights` | SRB nightly tip sessions |
| `srb_entries` | Per-dancer tip entries per night |
| `tesla_sessions` | Tesla charging history |
| `artist_assets` | Artist asset tracking |

---

## API Routes

All routes use `export const dynamic = 'force-dynamic'` and are fully async.

| Route | Methods |
|-------|---------|
| `/api/tasks` | GET, POST, PATCH, DELETE |
| `/api/tasks/[id]` | GET, PUT, DELETE |
| `/api/personal-tasks` | GET, POST, PATCH, DELETE |
| `/api/srb-tips` | GET, POST, DELETE |
| `/api/tesla` | GET, POST, PATCH, DELETE |
| `/api/artist-assets` | GET, POST, PATCH, DELETE |
