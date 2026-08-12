// Utility to sanitize category slugs for URLs
// Removes invisible Unicode chars, trims whitespace, and strips the
// "-exclusive" suffix so links render as /india/... instead of
// /india-exclusive/... The raw value in Sanity is left untouched -
// this only affects how the slug is displayed in generated URLs.
export function cleanCategorySlug(slug: string): string {
  const sanitized = slug.replace(/[\u200B-\u200D\uFEFF\u202A-\u202E\u2060-\u206F\u00A0]/g, '').trim()
  return sanitized.replace(/-exclusive$/, '')
}
