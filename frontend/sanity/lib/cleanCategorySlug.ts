// Utility to sanitize category slugs for URLs
// Removes invisible Unicode chars and trims whitespace
export function cleanCategorySlug(slug: string): string {
  return slug.replace(/[\u200B-\u200D\uFEFF\u202A-\u202E\u2060-\u206F\u00A0]/g, '').trim()
}
