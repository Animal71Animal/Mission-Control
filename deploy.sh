#!/bin/bash
# deploy.sh — commit, push, and deploy Mission Control
# Usage: ./deploy.sh "optional commit message"

set -e

cd /home/ubuntu/wlp/projects/mission-control

MSG="${1:-Auto-deploy: $(date '+%Y-%m-%d %H:%M MDT')}"

echo "📦 Staging changes..."
git add -A

# Only commit if there are changes
if git diff --cached --quiet; then
  echo "✅ Nothing new to commit — deploying current HEAD"
else
  echo "💾 Committing: $MSG"
  git commit -m "$MSG"
  echo "⬆️  Pushing to GitHub..."
  git push origin main
fi

echo "🚀 Deploying to Vercel..."
npx vercel@latest deploy --prod --yes

echo ""
echo "✅ Done — https://mission-control-cyan-omega.vercel.app"
