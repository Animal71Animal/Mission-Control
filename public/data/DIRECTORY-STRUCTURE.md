# WLP Directory Structure

**Last Updated:** 2026-03-24

## Quick Navigation

| Need To... | Go To |
|------------|-------|
| Read/write daily notes | `memory/YYYY-MM-DD.md` |
| Check long-term memory | `wlp/core/MEMORY.md` |
| View tasks | `wlp/ops/tasks.json` |
| Use a skill | `wlp/skills/[skill-name]/SKILL.md` |
| Find reference material | `wlp/data/` |
| View project notes | `WLP-Vault/01-Projects/` |
| Check daily reports | `wlp/ops/daily-reports/` |

---

## Directory Tree

```
/home/ubuntu/
├── memory/
│   ├── 2026-03-24.md              # Today's session notes
│   ├── narrative.md               # Running narrative (auto-generated)
│   └── ...                        # Daily notes
│
├── wlp/
│   ├── core/                      # Identity, long-term memory
│   │   ├── ANIMAL.md              # Who we help, current focus
│   │   ├── MEMORY.md              # Long-term lessons, skills inventory
│   │   ├── SOUL.md                # Who I am (PriScylla)
│   │   ├── AGENTS.md              # Agent conventions
│   │   └── IDENTITY.md            # My identity
│   │
│   ├── skills/                    # Active skills
│   │   ├── autonomous-employee/   # 2 AM + 6 AM autonomous modes
│   │   ├── narrative-tracker/     # Session compression + dream cycle
│   │   └── obsidian-wlp/          # Obsidian vault integration
│   │
│   ├── ops/                       # Operations
│   │   ├── tasks.json             # Open tasks + completed
│   │   ├── daily-reports/         # Autonomous employee outputs
│   │   └── calendar.json          # Events
│   │
│   ├── data/                      # Reference files (future skills)
│   │   ├── hunter-healer-alpha-models.md
│   │   ├── figma-mcp-reference.md
│   │   ├── sst-injection-reference.md
│   │   ├── upwork-miner-reference.md
│   │   └── work-for-hire-miner-reference.md
│   │
│   ├── projects/                  # Active project files
│   ├── archive/                   # Old files
│   └── logs/                      # Autonomous execution logs
│
├── WLP-Vault/                     # Obsidian vault (sync to Mac)
│   ├── 00-Inbox/                  # Quick capture
│   ├── 01-Projects/               # Active projects
│   ├── 02-Areas/                  # Ongoing responsibilities
│   ├── 03-Resources/              # Reference material
│   ├── 04-Archive/                # Completed work
│   ├── 99-Daily/                  # Daily notes (auto-populated)
│   └── README.md                  # Vault guide
│
├── HEARTBEAT.md                   # Scheduled task definitions
├── TOOLS.md                       # Environment-specific notes
├── USER.md                        # About Eric
└── BOOTSTRAP.md                   # Startup checklist
```

---

## Naming Conventions

| Type | Format | Example |
|------|--------|---------|
| Daily notes | `YYYY-MM-DD.md` | `2026-03-24.md` |
| Skills | `[name]/SKILL.md` | `autonomous-employee/SKILL.md` |
| Scripts | `scripts/[name].sh` | `scripts/run-morning-tasks.sh` |
| Reference | `[topic]-reference.md` | `figma-mcp-reference.md` |
| Reports | `YYYY-MM-DD-[type].md` | `2026-03-24-morning.md` |

---

## Color Code (for agents)

- 🟢 **Active** — Currently in use, check regularly
- 🟡 **Standby** — Ready to use when needed
- 🔴 **Archive** — Old, reference only
- ⚪ **Future** — Not yet implemented

---

*This file lives at: `/home/ubuntu/wlp/data/DIRECTORY-STRUCTURE.md`*
