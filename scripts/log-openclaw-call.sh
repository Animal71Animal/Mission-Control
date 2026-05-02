#!/bin/bash
# Log an OpenClaw model call to Mission Control cost tracker
# Usage: log-openclaw-call.sh <model> <input_tokens> <output_tokens> [prompt_preview]
# Example: log-openclaw-call.sh "abacus/kimi-k2.6" 1500 800 "Update dashboard"

MODEL="$1"
INPUT_TOKENS="$2"
OUTPUT_TOKENS="$3"
PROMPT="${4:-""}"

if [ -z "$MODEL" ] || [ -z "$INPUT_TOKENS" ] || [ -z "$OUTPUT_TOKENS" ]; then
  echo "Usage: $0 <model> <input_tokens> <output_tokens> [prompt_preview]"
  echo "Example: $0 abacus/kimi-k2.6 1500 800 \"Update dashboard\""
  exit 1
fi

MC_URL="https://mission-control-cyan-omega.vercel.app"

curl -s -X POST "${MC_URL}/api/log-model" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"$MODEL\",
    \"input_tokens\": $INPUT_TOKENS,
    \"output_tokens\": $OUTPUT_TOKENS,
    \"prompt\": \"$PROMPT\"
  }" | jq .
