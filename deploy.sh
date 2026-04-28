#!/bin/bash
# Mission Control auto-deploy script
# Usage: ./deploy.sh

set -e

echo "🚀 Deploying Mission Control to Vercel..."
npx vercel@latest deploy --prod --yes

echo "✅ Deployment complete!"
echo "🌐 Live at: https://mission-control-cyan-omega.vercel.app"
