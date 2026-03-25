# Hunter Alpha & Healer Alpha — Free Models Reference

**Source:** OpenClaw Playlist Report Video #08  
**Status:** Free API via OpenRouter (as of 2026-03-16)

---

## Model Comparison

| Model | Speed | Context | Type | Best For |
|-------|-------|---------|------|----------|
| **Hunter Alpha** | Slower | 1M tokens | Text, reasoning | Deep analysis, long docs, complex reasoning |
| **Healer Alpha** | Faster | 1M tokens | Multimodal | Quick responses, images, audio, video |

**Identity:** Anonymous/stealth models. Speculated to be GPT-5 variants or early GPT-5.5 releases.

---

## OpenClaw Integration

```bash
# Get API key from OpenRouter
# Add to OpenClaw model config:

[models.hunter-alpha]
provider = "openrouter"
model_id = "openrouter/hunter-alpha"
api_key = "${OPENROUTER_API_KEY}"

[models.healer-alpha]
provider = "openrouter"
model_id = "openrouter/healer-alpha"
api_key = "${OPENROUTER_API_KEY}"
```

---

## The Alpha Stack (Cost-Zero Workflow)

From Video #08 — stack all three for free AI workflows:

1. **Healer Alpha** → Fast, multimodal tasks (quick responses, image analysis)
2. **Hunter Alpha** → Deep reasoning and long-context tasks
3. **Nvidia Nemotron 3 Super** → Specialized analytical work

All free APIs → zero token cost for entire workflow.

---

## Use Cases

| Task | Model | Why |
|------|-------|-----|
| Quick image description | Healer Alpha | Fast + multimodal |
| 100-page document analysis | Hunter Alpha | 1M context + reasoning |
| Code review | Hunter Alpha | Deep analysis |
| Video content analysis | Healer Alpha | Native video input |
| Brainstorming sessions | Healer Alpha | Fast iteration |
| Research synthesis | Hunter Alpha | Long context retention |

---

## Warnings

- **Stealth models** — May be claimed/removed by OpenRouter without notice
- **Rate limits** — Free tier has limits; monitor usage
- **Identity unknown** — No official support or documentation
- **Performance varies** — Being free, reliability not guaranteed

---

## Related

- Video #07: OpenClaw 3.11 update (introduced these models)
- Video #08: Full comparison and Alpha Stack framework
- Video #41: Cost optimization (using free models to reduce bills)

---

*Added to reference: 2026-03-24*
