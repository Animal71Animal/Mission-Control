#!/bin/bash
# Install Uber scraper cron job
# Runs every Sunday at 11 PM MDT (= Monday 05:00 UTC)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
NODE_BIN="$(which node)"
CRON_CMD="0 5 * * 1 cd $SCRIPT_DIR && $NODE_BIN uber-scraper.js >> cron.log 2>&1"

# Check if already installed
if crontab -l 2>/dev/null | grep -q "uber-scraper"; then
  echo "⚠️  Cron job already installed:"
  crontab -l | grep uber-scraper
  echo ""
  read -p "Replace it? (y/N): " confirm
  if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo "Cancelled."
    exit 0
  fi
  # Remove old entry
  crontab -l | grep -v uber-scraper | crontab -
fi

# Add new entry
(crontab -l 2>/dev/null; echo "$CRON_CMD") | crontab -

echo "✅ Cron job installed:"
echo "   $CRON_CMD"
echo ""
echo "Schedule: Every Sunday 11 PM MDT (Monday 05:00 UTC)"
echo "Logs: $SCRIPT_DIR/cron.log"
echo ""
echo "To verify: crontab -l | grep uber"
echo "To test:   cd $SCRIPT_DIR && node uber-scraper.js --dry-run"
