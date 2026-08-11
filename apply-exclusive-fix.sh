#!/bin/bash
set -e

files=(
  "studio/src/schemaTypes/documents/article.ts"
  "frontend/lib/constants.ts"
  "frontend/app/components/CategoryArticlesList.tsx"
  "frontend/app/components/FeaturedCarousel.tsx"
  "frontend/app/components/LatestArticlesSidebar.tsx"
  "frontend/app/components/Footer.tsx"
  "frontend/app/components/HeaderClient.tsx"
  "frontend/app/components/SearchModal.tsx"
  "frontend/app/components/Header.tsx"
  "frontend/app/components/LatestArticles.tsx"
  "frontend/app/components/FeaturedArticle.tsx"
  "frontend/app/components/SideMenu.tsx"
  "frontend/app/posts/[slug]/page.tsx"
  "frontend/app/[category]/[slug]/page.tsx"
  "frontend/app/[category]/page.tsx"
  "frontend/app/author/[id]/page.tsx"
)

echo "Applying slug rename to $(pwd) ..."
for f in "${files[@]}"; do
  if [ -f "$f" ]; then
    sed -i.bak "s/world-exclusive/world/g; s/india-exclusive/india/g; s/osint-exclusive/osint/g" "$f"
    rm -f "$f.bak"
    echo "  updated: $f"
  else
    echo "  SKIPPED (not found, check path): $f"
  fi
done

echo ""
echo "Done. Run 'git diff --stat' to review, then 'git status' to see changed files."
echo "NOTE: next.config.ts redirects and scripts/migrate-category-slugs.mjs were NOT touched by this script - add those manually (see chat)."
