# Figma MCP Integration — Reference

**Source:** OpenClaw Playlist Report Video #31  
**Status:** Available via Composio MCP or direct Figma API

---

## What It Does

Figma MCP (Model Context Protocol) connects OpenClaw to Figma designs, enabling:

- **Read design context** — Extract specs, colors, typography from Figma files
- **Generate code from designs** — Auto-generate React/HTML from Figma components
- **Workflow mapping** — Visualize automation workflows before building
- **Architecture diagrams** — Auto-generate diagrams during conversations
- **Design-to-code handoff** — Bridge design and development

---

## Integration Options

### Option 1: Composio MCP (Easiest)

Composio hosts a managed MCP server with 500+ app integrations.

**Endpoint:** `https://connect.composio.dev/mcp`

**Setup:**
1. Get Figma API token from Figma settings
2. Connect via Composio dashboard
3. MCP tools register directly in OpenClaw

### Option 2: Direct Figma MCP Server

Figma's official MCP server (requires self-hosting or direct integration).

**Docs:** https://help.figma.com/hc/en-us/articles/32132100833559

---

## Use Cases for WLP

| Project | Figma MCP Application |
|---------|----------------------|
| **DJ Automation App** | Map UI/UX before coding; generate component specs |
| **AI Artist Branding** | Consistent visual assets across Spotify, TikTok, Instagram |
| **Mission Control** | Dashboard wireframes → React components |
| **Workflow Documentation** | Auto-generate architecture diagrams from discussions |
| **Live PA Setup** | Visual signal flow diagrams |

---

## Video #31 Example

From the playlist report — the creator used Figma MCP for:

> "Using Figma or Mermaid diagrams to visualize automation workflows before building them"

Pattern: Discuss workflow → Agent generates Figma diagram → Review visually → Build with clarity

---

## Setup Requirements

- Figma account (free tier works)
- Figma API token
- OpenClaw with MCP support
- (Optional) Composio account for managed MCP

---

## Related Skills

- `obsidian-wlp` — Store generated diagrams in vault
- `autonomous-employee` — Auto-generate workflows during 2 AM creative mode

---

## Future Implementation

When ready to implement:

1. Create `wlp/skills/figma-mcp/` skill
2. Add Figma API token to environment
3. Configure MCP endpoint in OpenClaw
4. Test with simple workflow diagram

---

*Filed for future reference: 2026-03-24*
