import {sanityFetch} from '@/sanity/lib/live'
import {sitemapPagesQuery} from '@/sanity/lib/queries'
import {absoluteUrl, urlEntry, urlsetXml, xmlResponse} from '@/lib/sitemap'

export const revalidate = 300

export async function GET() {
  const {data} = await sanityFetch({query: sitemapPagesQuery})

  const entries = [
    urlEntry({loc: absoluteUrl('/')}),
    ...(data || []).map((page) => urlEntry({loc: absoluteUrl(`/pages/${page.slug}`), lastmod: page._updatedAt})),
  ]

  return xmlResponse(urlsetXml(entries))
}
