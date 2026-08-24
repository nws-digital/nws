import {absoluteUrl, urlEntry, urlsetXml, xmlResponse} from '@/lib/sitemap'

export const revalidate = 3600

// Category hub/listing pages -- distinct from individual article URLs, which
// live in the per-category *-news-sitemap.xml files.
const SECTION_SLUGS = ['world', 'india', 'osint', 'commentary']

export async function GET() {
  const entries = SECTION_SLUGS.map((slug) => urlEntry({loc: absoluteUrl(`/${slug}`)}))
  return xmlResponse(urlsetXml(entries))
}
