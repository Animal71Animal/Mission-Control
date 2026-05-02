# Backlog: Custom Model Router Proxy for OpenClaw

**Status:** Shelved — idea captured for future implementation
**Created:** 2026-05-02

## Problem
OpenClaw uses Abacus RouteLLM's native routing. We built a keyword-based model router in MC (`/api/route-model`) that selects models based on prompt content, but OpenClaw doesn't use it.

## Current Routing (Abacus Native)
- Abacus decides model based on their internal logic
- No visibility into routing decisions
- No custom keyword matching

## Desired Routing (Our Router)
| Tier | Model | Triggers |
|---|---|---|
| Simple | gpt-5-nano | Default, greetings, simple queries |
| Standard | minimax-m2.7 | MC tasks, coding, data updates (28 keywords) |
| Creative | kimi-k2.6 | Images, art, design (11 keywords) |
| Complex | claude-opus-4.7 | Legal, investor, contracts (11 keywords) |

## Implementation Plan

### Architecture
```
OpenClaw → Proxy (localhost:3001) → Abacus RouteLLM
                ↓
         Calls /api/route-model
         to select model
         then forwards request
```

### Steps
1. **Build proxy server** — Node.js/Express that mimics OpenAI-compatible API
2. **Intercept requests** — Read prompt from incoming chat completion request
3. **Route selection** — Call MC's `/api/route-model` or replicate logic locally
4. **Forward to Abacus** — Send request to real Abacus with chosen model
5. **Stream response** — Return Abacus response to OpenClaw
6. **Update OpenClaw config** — Point `baseUrl` to proxy instead of Abacus

### OpenClaw Config Change
```json
{
  "models": {
    "providers": {
      "abacus": {
        "baseUrl": "http://localhost:3001",
        "apiKey": "dummy"
      }
    }
  }
}
```

### Effort Estimate
- Proxy server: 2-3 hours
- Testing: 1-2 hours
- Deployment: 1 hour
- **Total: ~4-6 hours**

## Trigger for Implementation
- Switch away from Abacus RouteLLM
- Need cost control / model selection transparency
- Abacus routing proves insufficient for WLP use cases

## Notes
- Keep `/api/route-model` maintained in MC
- Document proxy setup in TOOLS.md
- Consider persistent process (systemd/PM2) for proxy
