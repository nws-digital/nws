'use server'

import {sanityFetch} from '@/sanity/lib/live'
import {mostReadByIdsQuery, mostReadFallbackQuery} from '@/sanity/lib/queries'
import {supabase} from '@/lib/supabase'

// Trailing window for the ranking. 7 days rather than the more common
// "last 24 hours" convention -- a stricter 24h window risks a sparse or
// near-empty panel on quieter days/hours, which matters more for a site
// still building up traffic than the freshness a shorter window buys.
// Tunable here without any DB migration (p_days is an RPC argument).
const MOST_READ_WINDOW_DAYS = 7
const PANEL_SIZE = 15
// Ask Supabase for more ranked ids than we need in case some no longer
// resolve in Sanity (unpublished/deleted since they were viewed).
const RANKED_BUFFER = 20

export type MostReadArticle = {
  _id: string
  title: string
  slug: {current: string}
  category?: string
  coverImage?: any
}

export async function getMostReadArticles(): Promise<MostReadArticle[]> {
  const {data: ranked, error} = await supabase.rpc('get_most_read_article_ids', {
    p_days: MOST_READ_WINDOW_DAYS,
    p_limit: RANKED_BUFFER,
  })

  if (error) {
    console.error('Error fetching most read article ids:', error)
  }

  const rankedIds = ((ranked as {article_id: string; view_count: number}[] | null) || []).map(
    (row) => row.article_id,
  )

  const [{data: rankedDocs}, {data: fallbackDocs}] = await Promise.all([
    rankedIds.length > 0
      ? sanityFetch({query: mostReadByIdsQuery, params: {ids: rankedIds}})
      : Promise.resolve({data: [] as MostReadArticle[]}),
    sanityFetch({query: mostReadFallbackQuery}),
  ])

  // GROQ's `_id in $ids` does not preserve array order -- re-sort by the
  // Supabase view-count ranking explicitly.
  const byId = new Map(((rankedDocs as MostReadArticle[] | null) || []).map((doc) => [doc._id, doc]))
  const rankedResolved = rankedIds
    .map((id) => byId.get(id))
    .filter((doc): doc is MostReadArticle => Boolean(doc))

  const usedIds = new Set(rankedResolved.map((doc) => doc._id))
  const backfill = ((fallbackDocs as MostReadArticle[] | null) || []).filter(
    (doc) => !usedIds.has(doc._id),
  )

  return [...rankedResolved, ...backfill].slice(0, PANEL_SIZE)
}
