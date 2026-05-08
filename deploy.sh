#!/bin/bash
# =============================================================================
# Mission Control Deploy Script
# =============================================================================
# Usage: ./deploy.sh [--skip-push]
# =============================================================================

set -e
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
OK="${GREEN}✅${NC}"; ERR="${RED}❌${NC}"; WARN="${YELLOW}⚠️${NC}"

SECRETS_FILE="/home/ubuntu/wlp/secrets/tokens.env"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 Mission Control Deploy"
echo "================================"

# ── Load tokens ───────────────────────────────────────
if [ -f "$SECRETS_FILE" ]; then
  source "$SECRETS_FILE"
fi

# ── Validate Vercel token ─────────────────────────────
if [ -z "$VERCEL_TOKEN" ]; then
  echo -e "${ERR} No VERCEL_TOKEN found."
  echo "  Fix: fill in /home/ubuntu/wlp/secrets/tokens.env"
  echo "  Then run: bash /home/ubuntu/wlp/scripts/setup-tokens.sh"
  exit 1
fi

VC_CHECK=$(curl -sf -H "Authorization: Bearer $VERCEL_TOKEN" "https://api.vercel.com/v2/user" 2>/dev/null | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('user',{}).get('email','INVALID'))" 2>/dev/null || echo "INVALID")
if [ "$VC_CHECK" = "INVALID" ]; then
  echo -e "${ERR} Vercel token is expired or invalid."
  echo "  Fix: get a new token at https://vercel.com/account/tokens"
  echo "  Then update /home/ubuntu/wlp/secrets/tokens.env"
  echo "  Then run: bash /home/ubuntu/wlp/scripts/setup-tokens.sh"
  exit 1
fi
echo -e "${OK} Vercel token valid — $VC_CHECK"

# ── Ensure Vercel CLI is auth'd ───────────────────────
mkdir -p ~/.local/share/com.vercel.cli
echo "{\"token\":\"${VERCEL_TOKEN}\"}" > ~/.local/share/com.vercel.cli/auth.json

# ── Commit pending changes if any ─────────────────────
cd "$PROJECT_DIR"
PENDING=$(git status --short | wc -l | tr -d ' ')
if [ "$PENDING" -gt 0 ] && [ "$1" != "--skip-push" ]; then
  if [ -n "$GITHUB_TOKEN" ]; then
    GH_USER=$(curl -sf -H "Authorization: token $GITHUB_TOKEN" "https://api.github.com/user" | python3 -c "import json,sys; print(json.load(sys.stdin).get('login',''))" 2>/dev/null)
    git remote set-url origin "https://${GH_USER}:${GITHUB_TOKEN}@github.com/Animal71Animal/Mission-Control.git"
    git add -A
    git commit -m "chore: pre-deploy sync $(date +%Y-%m-%d)"
    git push origin main
    echo -e "${OK} $PENDING files committed and pushed"
  else
    echo -e "${WARN} Skipping git push (no GITHUB_TOKEN)"
  fi
fi

# ── Deploy to Vercel ──────────────────────────────────
echo ""
echo "Deploying to Vercel..."
VERCEL_TOKEN="$VERCEL_TOKEN" \
VERCEL_ORG_ID="$VERCEL_ORG_ID" \
VERCEL_PROJECT_ID="$VERCEL_PROJECT_ID" \
  npx vercel@latest deploy --prod --yes --token "$VERCEL_TOKEN"

echo ""
echo -e "${OK} Deployment complete!"
echo "🌐 https://mission-control-cyan-omega.vercel.app"
