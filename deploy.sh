#!/bin/bash
# One-command deploy to GitHub Pages
# Usage: bash deploy.sh

set -e
GITHUB_TOKEN="${GITHUB_TOKEN:-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}"
cd "$(dirname "$0")"

# Sync index.html with main file
cp "Report Agent · Essay.html" index.html

git config commit.gpgsign false
git remote set-url origin "https://${GITHUB_TOKEN}@github.com/Lvvvvvvvvvvvvvvvvv/atlas-essay.git"

git add "Report Agent · Essay.html" index.html
git diff --cached --quiet && echo "Nothing changed, skip." && exit 0

git commit -m "Update: $(date '+%Y-%m-%d %H:%M')"
git push origin main

echo ""
echo "✓ Deployed! Preview in ~30s:"
echo "  https://lvvvvvvvvvvvvvvvvv.github.io/atlas-essay/"
