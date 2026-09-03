import {sanityFetch} from '@/sanity/lib/live'
import {newsSitemapQuery} from '@/sanity/lib/queries'
import {categoryToUrlSlug} from '@/sanity/lib/cleanCategorySlug'
import {absoluteUrl, newsUrlEntry, newsUrlsetXml, xmlResponse} from '@/lib/sitemap'

export const revalidate = 300

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000

export async function GET() {
  const since = new Date(Date.now() - TWO_DAYS_MS).toISOString()
  const {data} = await sanityFetch({query: newsSitemapQuery, params: {since}})

  const entries = (data || []).map((article) =>
    newsUrlEntry({
      loc: absoluteUrl(`/${categoryToUrlSlug(article.category)}/${article.slug}`),
      title: article.title,
      publicationDate: article.publicationDate,
    })
  )

  return xmlResponse(newsUrlsetXml(entries))
}
