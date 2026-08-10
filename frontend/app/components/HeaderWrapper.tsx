import {sanityFetch} from '@/sanity/lib/live'
import {defineQuery} from 'next-sanity'
import HeaderClient from './HeaderClient'

const sideMenuArticlesQuery = defineQuery(`
  *[_type == "article" && category != "commentary"] | order(date desc)[0...3] {
    _id,
    title,
    slug,
    date,
    category,
    coverImage
  }
`)

export default async function Header() {
  const {data: latestArticles} = await sanityFetch({
    query: sideMenuArticlesQuery,
  })

  return <HeaderClient latestArticles={latestArticles || []} />
}
