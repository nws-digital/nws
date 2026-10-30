'use server'

import {sanityFetch} from '@/sanity/lib/live'
import {handpickedArticlesQuery} from '@/sanity/lib/queries'

const PANEL_SIZE = 15

export type HandpickedArticle = {
  _id: string
  title: string
  slug: {current: string}
  category?: string
  excerpt?: string | null
  date?: string
  coverImage?: any
}

export async function getHandpickedArticles(): Promise<HandpickedArticle[]> {
  const {data} = await sanityFetch({query: handpickedArticlesQuery})
  return ((data as HandpickedArticle[] | null) || []).slice(0, PANEL_SIZE)
}
