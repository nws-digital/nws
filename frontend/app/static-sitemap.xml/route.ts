import {sanityFetch} from '@/sanity/lib/live'
import {sitemapPagesQuery} from '@/sanity/lib/queries'
import {absoluteUrl, urlEntry, urlsetXml, xmlResponse} from '@/lib/sitemap'
import {hasVideos} from '@/lib/videos'

export const revalidate = 300

export async function GET() {
  const [{data}, showVideos] = await Promise.all([sanityFetch({query: sitemapPagesQuery}), hasVideos()])

  const entries = [
    urlEntry({loc: absoluteUrl('/')}),
    urlEntry({loc: absoluteUrl('/hand-picked')}),
    ...(showVideos ? [urlEntry({loc: absoluteUrl('/videos')})] : []),
    ...(data || []).map((page) => urlEntry({loc: absoluteUrl(`/pages/${page.slug}`), lastmod: page._updatedAt})),
  ]

  return xmlResponse(urlsetXml(entries))
}
