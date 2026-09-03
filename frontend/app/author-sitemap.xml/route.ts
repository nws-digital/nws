import {sanityFetch} from '@/sanity/lib/live'
import {sitemapAuthorsQuery} from '@/sanity/lib/queries'
import {absoluteUrl, urlEntry, urlsetXml, xmlResponse} from '@/lib/sitemap'

export const revalidate = 300

export async function GET() {
  const {data} = await sanityFetch({query: sitemapAuthorsQuery})

  const entries = (data || []).map((author) =>
    urlEntry({loc: absoluteUrl(`/author/${author.slug}`), lastmod: author._updatedAt})
  )

  return xmlResponse(urlsetXml(entries))
}
