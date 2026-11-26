'use server'

import {sanityFetch} from '@/sanity/lib/live'
import {recentVideosQuery, videosCountQuery, videosPageQuery} from '@/sanity/lib/queries'
import {isVideoCategory} from '@/lib/constants'
import {getYouTubeId, YOUTUBE_ID_FORMAT} from '@/lib/youtube'
import {toVideoItems, type VideoItem} from '@/lib/videos'

const MAX_PAGE_SIZE = 24

export async function loadVideos(
  category: string,
  offset: number,
  limit: number,
): Promise<{videos: VideoItem[]; total: number}> {
  const safeCategory = isVideoCategory(category) ? category : ''
  const start = Math.max(0, Math.floor(offset) || 0)
  const end = Math.min(start + MAX_PAGE_SIZE, Math.max(start, Math.floor(limit) || 0))

  const [{data: docs}, {data: total}] = await Promise.all([
    sanityFetch({query: videosPageQuery, params: {category: safeCategory, offset: start, limit: end}}),
    sanityFetch({query: videosCountQuery, params: {category: safeCategory}}),
  ])

  return {videos: await toVideoItems(docs), total: total || 0}
}

/**
 * Looks up a video for a shared /videos?v=<youtubeId> link. Only videos that
 * exist in the CMS are returned, so the page can't be made to play an
 * arbitrary YouTube video under the NWS name.
 */
export async function getVideoByYoutubeId(youtubeId: string): Promise<VideoItem | null> {
  if (!YOUTUBE_ID_FORMAT.test(youtubeId)) return null

  const {data: docs} = await sanityFetch({query: recentVideosQuery})
  const match = (docs || []).find((doc) => getYouTubeId(doc.youtubeUrl) === youtubeId)
  if (!match) return null

  const [video] = await toVideoItems([match])
  return video ?? null
}
