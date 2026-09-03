import {absoluteUrl, sitemapIndexXml, xmlResponse} from '@/lib/sitemap'

export const revalidate = 300

const CHILD_SITEMAPS = [
  'static-sitemap.xml',
  'world-news-sitemap.xml',
  'india-news-sitemap.xml',
  'osint-news-sitemap.xml',
  'commentary-sitemap.xml',
  'author-sitemap.xml',
  'news-sitemap.xml',
]

export async function GET() {
  const xml = sitemapIndexXml(CHILD_SITEMAPS.map((name) => ({loc: absoluteUrl(`/${name}`)})))
  return xmlResponse(xml)
}
