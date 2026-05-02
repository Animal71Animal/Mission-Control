#!/bin/bash
# Log a model call to Mission Control cost tracker
# Usage: ./log-model-call.sh <model> <tier> <input_tokens> <output_tokens> [prompt_preview]

MODEL="$1"
TIER="$2"
INPUT_TOKENS="$3"
OUTPUT_TOKENS="$4"
PROMPT="${5:-""}"

if [ -z "$MODEL" ] || [ -z "$TIER" ] || [ -z "$INPUT_TOKENS" ] || [ -z "$OUTPUT_TOKENS" ]; then
  echo "Usage: $0 <model> <tier> <input_tokens> <output_tokens> [prompt_preview]"
  echo "Example: $0 minimax-m2.7 standard 1500 800 \"Update dashboard\""
  exit 1
fi

MC_URL="https://mission-control-cyan-omega.vercel.app"

curl -s -X POST "${MC_URL}/api/log-model" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"$MODEL\",
    \"tier\": \"$TIER\",
    \"input_tokens\": $INPUT_TOKENS,
    \"output_tokens\": $OUTPUT_TOKENS,
    \"prompt\": \"$PROMPT\"
  }" | jq .
