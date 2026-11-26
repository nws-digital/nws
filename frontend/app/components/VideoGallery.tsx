'use client'

import {useCallback, useEffect, useRef, useState} from 'react'
import {Breadcrumb} from '@/app/components/Breadcrumb'
import {VideoCard} from '@/app/components/VideoCard'
import {VideoModal} from '@/app/components/VideoModal'
import {getVideoByYoutubeId, loadVideos} from '@/app/actions/videos'
import {VIDEO_CATEGORIES, type VideoCategory} from '@/lib/constants'
import {YOUTUBE_ID_FORMAT} from '@/lib/youtube'
import type {VideoItem} from '@/lib/videos'

interface VideoGalleryProps {
  initialVideos: VideoItem[]
  initialTotal: number
  pageSize: number
}

// Column count per breakpoint (matches --breakpoint-phone/tablet/wide in globals.css)
const LAYOUTS = [
  {columns: 1, className: 'flex phone:hidden'},
  {columns: 2, className: 'hidden phone:flex tablet:hidden'},
  {columns: 3, className: 'hidden tablet:flex wide:hidden'},
  {columns: 4, className: 'hidden wide:flex'},
] as const

const CARD_SIZES = '(min-width: 1101px) 324px, (min-width: 781px) 33vw, (min-width: 521px) 50vw, 100vw'

// Title + meta block and the gap below a card, relative to the card width.
const CARD_TEXT_HEIGHT = 0.33

/**
 * Masonry: each card goes into the currently shortest column, so the reading
 * order stays left-to-right/newest-first and cards already on screen never
 * move when more are loaded.
 */
function toColumns(videos: VideoItem[], count: number) {
  const columns: VideoItem[][] = Array.from({length: count}, () => [])
  const heights = new Array(count).fill(0)
  for (const video of videos) {
    const shortest = heights.indexOf(Math.min(...heights))
    columns[shortest].push(video)
    heights[shortest] += 1 / video.aspect + CARD_TEXT_HEIGHT
  }
  return columns
}

function useColumnCount() {
  const [count, setCount] = useState<number | null>(null)
  useEffect(() => {
    const queries = ['(min-width: 1101px)', '(min-width: 781px)', '(min-width: 521px)'].map((q) =>
      window.matchMedia(q),
    )
    const update = () => setCount(queries[0].matches ? 4 : queries[1].matches ? 3 : queries[2].matches ? 2 : 1)
    update()
    queries.forEach((q) => q.addEventListener('change', update))
    return () => queries.forEach((q) => q.removeEventListener('change', update))
  }, [])
  return count
}

function setVideoParam(youtubeId: string | null, mode: 'push' | 'replace') {
  const url = new URL(window.location.href)
  if (youtubeId) url.searchParams.set('v', youtubeId)
  else url.searchParams.delete('v')
  const method = mode === 'push' ? 'pushState' : 'replaceState'
  window.history[method](null, '', `${url.pathname}${url.search}${url.hash}`)
}

export function VideoGallery({initialVideos, initialTotal, pageSize}: VideoGalleryProps) {
  const [videos, setVideos] = useState(initialVideos)
  const [total, setTotal] = useState(initialTotal)
  const [category, setCategory] = useState<VideoCategory | ''>('')
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState<VideoItem | null>(null)
  const columnCount = useColumnCount()

  // Ignores responses from superseded requests (e.g. quick filter changes)
  const requestId = useRef(0)
  // Whether the open popup added a history entry (so closing should go back)
  const pushedHistory = useRef(false)
  const videosRef = useRef(videos)
  videosRef.current = videos

  const fetchVideos = async (nextCategory: VideoCategory | '', offset: number) => {
    const id = ++requestId.current
    setLoading(true)
    try {
      const result = await loadVideos(nextCategory, offset, offset + pageSize)
      if (id !== requestId.current) return
      setVideos((current) => (offset === 0 ? result.videos : [...current, ...result.videos]))
      setTotal(result.total)
    } catch (error) {
      console.error('Error loading videos:', error)
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }

  const selectCategory = (value: VideoCategory) => {
    // Clicking the active chip again clears the filter
    const next = category === value ? '' : value
    setCategory(next)
    fetchVideos(next, 0)
  }

  const openVideo = useCallback((video: VideoItem) => {
    setActive(video)
    setVideoParam(video.youtubeId, 'push')
    pushedHistory.current = true
  }, [])

  const closeVideo = useCallback(() => {
    setActive(null)
    if (pushedHistory.current) {
      pushedHistory.current = false
      window.history.back()
    } else {
      setVideoParam(null, 'replace')
    }
  }, [])

  // Open a shared /videos?v=<id> link, and keep the popup in step with the
  // browser's back/forward buttons.
  useEffect(() => {
    const syncFromUrl = async () => {
      const youtubeId = new URLSearchParams(window.location.search).get('v')
      if (!youtubeId || !YOUTUBE_ID_FORMAT.test(youtubeId)) {
        pushedHistory.current = false
        setActive(null)
        return
      }
      const video =
        videosRef.current.find((v) => v.youtubeId === youtubeId) ?? (await getVideoByYoutubeId(youtubeId))
      if (video) setActive(video)
      else setVideoParam(null, 'replace')
    }
    syncFromUrl()
    window.addEventListener('popstate', syncFromUrl)
    return () => window.removeEventListener('popstate', syncFromUrl)
  }, [])

  const hasMore = videos.length < total
  const layouts = columnCount ? LAYOUTS.filter((l) => l.columns === columnCount) : LAYOUTS

  return (
    <div className="shell py-6 font-literata">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Breadcrumb items={[{label: 'Home', href: '/'}, {label: 'Videos'}]} className="mb-0" />

        <div role="group" aria-label="Filter videos" className="flex flex-wrap items-center gap-2">
          {VIDEO_CATEGORIES.map(({value, label}) => {
            const isActive = category === value
            return (
              <button
                key={value}
                type="button"
                aria-pressed={isActive}
                onClick={() => selectCategory(value)}
                className={`rounded-full px-3 py-2 text-[13px] leading-none transition-colors ${
                  isActive ? 'bg-black text-white' : 'bg-[#f0f0ea] text-[#20211f] hover:bg-[#e4e4dc]'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <div aria-busy={loading} className={`transition-opacity ${loading && videos.length === 0 ? 'opacity-50' : ''}`}>
        {/* Before hydration every layout is rendered and CSS shows the one that
            fits the screen; afterwards only the active one is kept. */}
        {layouts.map(({columns, className}) => (
          <div key={columns} className={`${columnCount ? 'flex' : className} items-start gap-6`}>
            {toColumns(videos, columns).map((column, i) => (
              <div key={i} className="flex min-w-0 flex-1 flex-col gap-7">
                {column.map((video) => (
                  <VideoCard
                    key={video._id}
                    video={video}
                    onPlay={openVideo}
                    sizes={CARD_SIZES}
                    priority={videos.indexOf(video) < columns}
                  />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      {videos.length === 0 && !loading && (
        <p className="py-16 text-center text-[#7b7d76]">No videos here yet.</p>
      )}

      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => fetchVideos(category, videos.length)}
            disabled={loading}
            className="rounded-full bg-[#ed1c24] px-4 pt-1 pb-2 text-sm text-white transition-colors hover:bg-[#c8141b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Loading…' : 'Load More'}
          </button>
        </div>
      )}

      <VideoModal video={active} onClose={closeVideo} />
    </div>
  )
}
