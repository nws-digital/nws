// Shared helpers for the hand-written XML sitemap route handlers under
// frontend/app/*-sitemap.xml/route.ts. Google ignores <priority>/<changefreq>,
// so none of the builders here emit them.

import {sanityFetch} from '@/sanity/lib/live'
import {sitemapArticlesByCategoryQuery} from '@/sanity/lib/queries'
import {categoryToUrlSlug} from '@/sanity/lib/cleanCategorySlug'

export function getBaseUrl(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (configured) {
    const normalized = configured.startsWith('http') ? configured : `https://${configured}`
    try {
      return new URL(normalized)
    } catch {
      return new URL('https://example.com')
    }
  }

  return process.env.NODE_ENV === 'development' ? new URL('http://localhost:3000') : new URL('https://example.com')
}

export function absoluteUrl(path: string): string {
  return new URL(path, getBaseUrl()).toString()
}

export function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;')
}

function toIsoString(value: string | null | undefined): string {
  const date = value ? new Date(value) : new Date()
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

export function urlEntry({loc, lastmod}: {loc: string; lastmod?: string | null}): string {
  return `  <url>\n    <loc>${xmlEscape(loc)}</loc>\n    <lastmod>${toIsoString(lastmod)}</lastmod>\n  </url>`
}

export function newsUrlEntry({
  loc,
  title,
  publicationDate,
  publicationName = 'NWS',
  language = 'en',
}: {
  loc: string
  title: string
  publicationDate: string
  publicationName?: string
  language?: string
}): string {
  return [
    '  <url>',
    `    <loc>${xmlEscape(loc)}</loc>`,
    '    <news:news>',
    '      <news:publication>',
    `        <news:name>${xmlEscape(publicationName)}</news:name>`,
    `        <news:language>${xmlEscape(language)}</news:language>`,
    '      </news:publication>',
    `      <news:publication_date>${toIsoString(publicationDate)}</news:publication_date>`,
    `      <news:title>${xmlEscape(title)}</news:title>`,
    '    </news:news>',
    '  </url>',
  ].join('\n')
}

export function urlsetXml(entries: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>`
}

export function newsUrlsetXml(entries: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n${entries.join('\n')}\n</urlset>`
}

export function sitemapIndexXml(sitemaps: Array<{loc: string; lastmod?: string | null}>): string {
  const entries = sitemaps
    .map(
      ({loc, lastmod}) =>
        `  <sitemap>\n    <loc>${xmlEscape(loc)}</loc>\n    <lastmod>${toIsoString(lastmod)}</lastmod>\n  </sitemap>`
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>`
}

// Shared by the four per-category article sitemap route handlers -- only the
// Sanity category value differs between them.
export async function buildCategoryArticleSitemapXml(sanityCategory: string): Promise<string> {
  const {data} = await sanityFetch({query: sitemapArticlesByCategoryQuery, params: {category: sanityCategory}})
  const urlSlug = categoryToUrlSlug(sanityCategory)
  const entries = (data || []).map((article) =>
    urlEntry({loc: absoluteUrl(`/${urlSlug}/${article.slug}`), lastmod: article.lastmod})
  )
  return urlsetXml(entries)
}

export function xmlResponse(body: string): Response {
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
    },
  })
}
