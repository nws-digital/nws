'use server'

import {sanityFetch} from '@/sanity/lib/live'
import {defineQuery} from 'next-sanity'

const searchArticlesQuery = defineQuery(`
  *[_type == "article" && (
    title match $searchTerm + "*" ||
    excerpt match $searchTerm + "*" ||
    pt::text(content) match $searchTerm + "*"
  )] | order(_score desc, date desc) [0...10] {
    _id,
    title,
    slug,
    excerpt,
    category,
    date,
    coverImage,
    "author": author->{firstName, lastName}
  }
`)

export async function searchArticles(searchTerm: string) {
  if (!searchTerm || searchTerm.trim().length < 2) {
    return []
  }

  const {data} = await sanityFetch({
    query: searchArticlesQuery,
    params: {searchTerm: searchTerm.trim()},
  })

  return data || []
}
