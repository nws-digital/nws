// Utility to sanitize category slugs for URLs
// Removes invisible Unicode chars and trims whitespace
const INVISIBLE_CHARS_REGEX = new RegExp(
  '[​-‍﻿‪-‮⁠-⁯ ]',
  'g'
)

export function cleanCategorySlug(slug: string): string {
  return slug.replace(INVISIBLE_CHARS_REGEX, '').trim()
}

// Sanity's `category` field values (unchanged) mapped to the short slug shown in URLs.
// Changing this only affects routing/links -- it never touches the CMS schema or stored data.
export const CATEGORY_TO_URL_SLUG: Record<string, string> = {
  'world-exclusive': 'world',
  'india-exclusive': 'india',
  'osint-exclusive': 'osint',
  'commentary': 'commentary',
}

export const URL_SLUG_TO_CATEGORY: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_TO_URL_SLUG).map(([category, slug]) => [slug, category])
)

// Use when building a link to an article/category page from Sanity's `category` value.
export function categoryToUrlSlug(category: string): string {
  const cleaned = cleanCategorySlug(category)
  return CATEGORY_TO_URL_SLUG[cleaned] || cleaned
}

// Use when reading the `[category]` route param to look up the underlying Sanity category value.
export function urlSlugToCategory(slug: string): string | undefined {
  return URL_SLUG_TO_CATEGORY[cleanCategorySlug(slug)]
}
