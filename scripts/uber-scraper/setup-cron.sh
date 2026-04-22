#!/bin/bash
# Sets up weekly Uber earnings scrape cron job
# Runs every Sunday at 11 PM MDT (= Monday 05:00 UTC)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PYTHON="/opt/computersetup/.pyenv/versions/3.11.6/bin/python3"
LOG_FILE="/home/ubuntu/logs/uber-scraper.log"

mkdir -p /home/ubuntu/logs

CRON_LINE="0 5 * * 1 cd $SCRIPT_DIR && $PYTHON uber-scraper.py >> $LOG_FILE 2>&1"

# Check if already installed
if crontab -l 2>/dev/null | grep -q "uber-scraper.py"; then
    echo "⚠️  Cron job already installed. Remove with: crontab -e"
    crontab -l | grep "uber-scraper"
else
    # Install
    (crontab -l 2>/dev/null; echo "$CRON_LINE") | crontab -
    echo "✅ Cron installed:"
    echo "   $CRON_LINE"
    echo ""
    echo "Runs: Every Monday 05:00 UTC (= Sunday 11 PM MDT)"
    echo "Logs: $LOG_FILE"
fi
