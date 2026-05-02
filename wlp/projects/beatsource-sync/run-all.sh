#!/bin/bash
# Runs Beatport sync one genre at a time to avoid timeout
# Each genre run: ~2min | Total: ~18min

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG="$SCRIPT_DIR/logs/run-all-$(date +%Y-%m-%d).log"
mkdir -p "$SCRIPT_DIR/logs"

echo "[$(date)] Starting Beatport full sync" | tee -a "$LOG"

GENRES=("African" "Country" "DJ Edits" "Hip-Hop" "Latin" "Pop" "R&B" "Rock")

for GENRE in "${GENRES[@]}"; do
    echo "[$(date)] Processing: $GENRE" | tee -a "$LOG"
    node "$SCRIPT_DIR/sync.js" "$GENRE" 2>&1 | tee -a "$LOG"
    echo "[$(date)] Done: $GENRE" | tee -a "$LOG"
    sleep 5
done

echo "[$(date)] All genres complete!" | tee -a "$LOG"
