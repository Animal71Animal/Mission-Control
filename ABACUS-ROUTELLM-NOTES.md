# Abacus RouteLLM Integration Notes

**Last updated:** 2026-05-02

## API Endpoint
```
POST https://routellm.abacus.ai/v1/chat/completions
```

## Auth Header
```
Authorization: Bearer <API_KEY>
```

## API Key Location
- **Container:** `~/.openclaw/openclaw.json` → `models.providers.abacus.apiKey`
- **Vercel env:** `ABACUSAI_API_KEY`

## Model Names (NO `abacus/` prefix)
Use these exact model IDs with RouteLLM:

| Model | ID |
|---|---|
| Kimi K2.6 | `kimi-k2.6` |
| Claude Sonnet 4.6 | `claude-sonnet-4-6` |
| Claude Opus 4.6 | `claude-opus-4-6` |
| Claude Haiku 4.5 | `claude-haiku-4-5` |
| Gemini 3 Flash | `gemini-3-flash-preview` |
| MiniMax M2.7 | `m2.7` |
| GPT-4o | `gpt-4o-2024-11-20` |
| GPT-4o Mini | `gpt-4o-mini` |
| GPT-5 | `gpt-5` |
| GPT-5 Nano | `gpt-5-nano` |

## Common Mistake
❌ Wrong: `model: "abacus/kimi-k2.6"`
✅ Correct: `model: "kimi-k2.6"`

## Test Command
```bash
curl -s -X POST "https://routellm.abacus.ai/v1/chat/completions" \
  -H "Authorization: Bearer $ABACUSAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"kimi-k2.6","messages":[{"role":"user","content":"Hello"}]}'
```

## List All Models
```bash
curl -s "https://routellm.abacus.ai/v1/models" \
  -H "Authorization: Bearer $ABACUSAI_API_KEY"
```
