#!/bin/bash
# OpenClaw post-response hook — logs model calls to Mission Control
# Add to OpenClaw config or run after each session
#
# Usage: Set as post-response hook or call manually:
#   ./openclaw-post-response.sh "abacus/kimi-k2.6" 1500 800 "prompt text"

MODEL="${OPENCLAW_MODEL:-$1}"
INPUT_TOKENS="${OPENCLAW_INPUT_TOKENS:-$2}"
OUTPUT_TOKENS="${OPENCLAW_OUTPUT_TOKENS:-$3}"
PROMPT="${OPENCLAW_PROMPT:-$4}"

MC_URL="https://mission-control-cyan-omega.vercel.app"

# Only log if we have the required fields
if [ -n "$MODEL" ] && [ -n "$INPUT_TOKENS" ] && [ -n "$OUTPUT_TOKENS" ]; then
  curl -s -X POST "${MC_URL}/api/log-model" \
    -H "Content-Type: application/json" \
    -d "{
      \"model\": \"$MODEL\",
      \"input_tokens\": $INPUT_TOKENS,
      \"output_tokens\": $OUTPUT_TOKENS,
      \"prompt\": \"$PROMPT\"
    }" > /dev/null 2>&1 &
fi
