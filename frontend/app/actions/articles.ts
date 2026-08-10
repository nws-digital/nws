'use server'

import {sanityFetch} from '@/sanity/lib/live'
import {categoryArticlesQuery, commentaryArticlesPageQuery} from '@/sanity/lib/queries'

export async function loadMoreArticles(category: string, offset: number, limit: number) {
  const {data} = await sanityFetch({
    query: categoryArticlesQuery,
    params: {
      category,
      offset,
      limit,
    },
  })

  return data || []
}

export async function loadMoreCommentaryArticles(offset: number, limit: number) {
  const {data} = await sanityFetch({
    query: commentaryArticlesPageQuery,
    params: {
      offset,
      limit,
    },
  })

  return data || []
}
