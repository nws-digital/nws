// Server-only: turns Sanity video documents into the card data the /videos
// page renders (thumbnail and card shape).

import {unstable_cache} from 'next/cache'
import {sanityFetch} from '@/sanity/lib/live'
import {videosCountQuery} from '@/sanity/lib/queries'
import {urlForImage} from '@/sanity/lib/utils'
import {getYouTubeId} from '@/lib/youtube'
import {isVideoCategory, type VideoCategory} from '@/lib/constants'

export interface VideoItem {
  _id: string
  title: string
  youtubeId: string
  category: VideoCategory | null
  publishedAt: string | null
  thumbnailUrl: string
  /** Width / height of the card thumbnail. */
  aspect: number
  /** YouTube's 4:3 fallback thumbnail, which has black bars above and below the picture. */
  letterboxed: boolean
}

interface SanityVideo {
  _id: string
  title: string | null
  youtubeUrl: string | null
  category: string | null
  publishedAt: string | null
  thumbnail?: unknown
  thumbnailAspect?: number | null
}

// Card shapes for the masonry grid, taken from the thumbnail heights in the
// design (324px wide cards, 240–390px tall).
const CARD_ASPECTS = [0.83, 1.25, 0.9, 1.12, 1.3, 1.0, 0.86, 1.2]
const MIN_ASPECT = 0.8
const MAX_ASPECT = 1.35
const THUMB_WIDTH = 648 // 2x the 324px desktop card

const clampAspect = (aspect: number) => Math.min(MAX_ASPECT, Math.max(MIN_ASPECT, aspect))

// Stable per video, so a card keeps its shape across renders and filters.
function cardAspectFor(youtubeId: string) {
  let hash = 0
  for (const char of youtubeId) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return CARD_ASPECTS[hash % CARD_ASPECTS.length]
}

// Not every video has a 1280px thumbnail, and the smaller ones are 4:3 with
// black bars, so check once a day which one exists.
const hasMaxresThumbnail = unstable_cache(
  async (youtubeId: string) => {
    try {
      const res = await fetch(`https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`, {
        method: 'HEAD',
      })
      return res.ok
    } catch {
      return false
    }
  },
  ['youtube-maxres-thumbnail'],
  {revalidate: 60 * 60 * 24},
)

export async function toVideoItems(docs: SanityVideo[] | null | undefined): Promise<VideoItem[]> {
  const withIds = (docs ?? []).flatMap((doc) => {
    const youtubeId = getYouTubeId(doc.youtubeUrl)
    return youtubeId ? [{doc, youtubeId}] : []
  })

  const maxres = await Promise.all(
    withIds.map(({doc, youtubeId}) => (doc.thumbnail ? true : hasMaxresThumbnail(youtubeId))),
  )

  return withIds.map(({doc, youtubeId}, i) => {
    const custom = urlForImage(doc.thumbnail)
    const aspect = custom && doc.thumbnailAspect ? clampAspect(doc.thumbnailAspect) : cardAspectFor(youtubeId)
    const thumbnailUrl = custom
      ? custom.width(THUMB_WIDTH).height(Math.round(THUMB_WIDTH / aspect)).fit('crop').auto('format').url()
      : `https://i.ytimg.com/vi/${youtubeId}/${maxres[i] ? 'maxresdefault' : 'hqdefault'}.jpg`

    return {
      _id: doc._id,
      title: doc.title || 'Untitled video',
      youtubeId,
      category: isVideoCategory(doc.category) ? doc.category : null,
      publishedAt: doc.publishedAt,
      thumbnailUrl,
      aspect,
      letterboxed: !custom && !maxres[i],
    }
  })
}

/**
 * Whether any video is published. The Videos nav links, the /videos page and
 * its sitemap entry stay hidden until editors add the first one.
 */
export async function hasVideos() {
  const {data: total} = await sanityFetch({query: videosCountQuery, params: {category: ''}})
  return (total || 0) > 0
}
