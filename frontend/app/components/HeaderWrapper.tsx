import {sanityFetch} from '@/sanity/lib/live'
import {defineQuery} from 'next-sanity'
import HeaderClient from './HeaderClient'
import {hasVideos} from '@/lib/videos'

const sideMenuArticlesQuery = defineQuery(`
  *[_type == "article" && category != "commentary"] | order(date desc)[0...5] {
    _id,
    title,
    slug,
    date,
    category,
    coverImage
  }
`)

export default async function Header() {
  const [{data: latestArticles}, showVideos] = await Promise.all([
    sanityFetch({query: sideMenuArticlesQuery}),
    hasVideos(),
  ])

  return <HeaderClient latestArticles={latestArticles || []} showVideos={showVideos} />
}
