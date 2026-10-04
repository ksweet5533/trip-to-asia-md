#!/usr/bin/env bash
# Builds the static site and publishes it to the gh-pages branch, which
# GitHub Pages serves at https://ksweet5533.github.io/trip-to-asia-md/
set -euo pipefail
cd "$(dirname "$0")/.."
REPO_URL=$(git remote get-url origin)
NEXT_PUBLIC_BASE_PATH=/trip-to-asia-md npm run build
touch out/.nojekyll
cd out
rm -rf .git
git init -q -b gh-pages
git add -A
git -c user.name="deploy" -c user.email="deploy@local" commit -qm "Deploy $(date -u +%Y-%m-%dT%H:%MZ)"
git push -f "$REPO_URL" gh-pages:gh-pages
rm -rf .git
echo "Published."
