#!/bin/bash
# Auto-sync script for Mission Control data changes
# Usage: ./scripts/sync-data.sh "commit message"

set -e

COMMIT_MSG="${1:-Data sync $(date '+%Y-%m-%d %H:%M')}"

echo "🔄 Syncing Mission Control data..."

# Add data files
git add public/data/*.json

# Check if there are changes
if git diff --cached --quiet; then
    echo "✓ No changes to sync"
    exit 0
fi

# Commit
git commit -m "$COMMIT_MSG"
echo "✓ Committed: $COMMIT_MSG"

# Push
git push origin master
echo "✓ Pushed to remote"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
npx vercel --prod --yes

echo "✅ Sync complete!"
