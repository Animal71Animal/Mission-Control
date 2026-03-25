# SST Injection (Single Source of Truth) — Reference

**Source:** OpenClaw Playlist Report Video #05  
**Status:** Not yet implemented — filed for future

---

## What It Is

SST Injection = Documents pre-loaded directly into context window (not "read" — the model just knows them).

> "Like uploading kung fu in The Matrix. Business plan, project structure, personal background all pre-loaded without consuming working context."

From Video #05's "Resonant OS" architecture.

---

## How It Works

**Traditional:** Agent reads files each session (consumes tokens, takes time)

**SST Injection:** Core documents injected at session initialization — agent "just knows" them

### Documents to Inject

| Document | Purpose |
|----------|---------|
| `ANIMAL.md` | Who we help, goals, current focus |
| `wlp/core/BUSINESS.md` | Business plan, revenue model, strategy |
| `wlp/core/PROJECTS.md` | Active projects, status, priorities |
| `wlp/core/PRINCIPLES.md` | Core values, decision frameworks |
| `wlp/core/CONTACTS.md` | Key people, relationships, context |

---

## Implementation Approach

### Option 1: agents.md Enhancement

Add SST section to `agents.md` that auto-loads:

```markdown
## Single Source of Truth

The following is pre-loaded context:

[Compressed business summary]
[Project status snapshot]
[Key relationships]
```

### Option 2: Session Initialization Hook

Custom script that runs at session start:

```bash
./scripts/sst-inject.sh
# Concatenates core docs → injects into context
```

### Option 3: Tier 0 Memory

New memory tier (below Tier 1) — always loaded, never counted:

```
memory/
├── tier-0-sst/          # Always injected
│   ├── business.md
│   ├── projects.md
│   └── principles.md
├── tier-1-core/         # Loaded every turn
├── tier-2-searchable/   # QMD indexed
└── tier-3-archive/      # On demand
```

---

## Benefits

1. **Faster session start** — No re-reading core docs
2. **Consistent context** — Agent always has full business context
3. **Lower token cost** — Injection vs. repeated reads
4. **Better decisions** — Agent operates from complete knowledge

---

## When to Implement

**Priority:** Medium

**Do this when:**
- Session startup feels slow
- Agent asks questions already answered in core docs
- Context window feels bloated from re-reading
- Multiple agents need same base knowledge

**Don't do this when:**
- Current system is working fine
- Core docs change frequently (maintenance burden)

---

## Related Concepts

- Video #05: Lossless compression + narrative tracker (implemented)
- Video #36: Three-tier memory architecture (implemented)
- Video #28: Markdown-first philosophy (implemented)

SST Injection = the "pre-load" layer above all of these.

---

## Future Skill: `sst-injection`

When implemented:

```yaml
name: sst-injection
description: Single Source of Truth injection for pre-loading core business context. Use when agent needs immediate knowledge of business plan, projects, and principles without reading files.
```

**Scripts:**
- `scripts/inject-sst.sh` — Inject core docs into context
- `scripts/update-sst.sh` — Refresh SST when core docs change
- `scripts/validate-sst.sh` — Check SST freshness

---

*Filed for future reference: 2026-03-24*
