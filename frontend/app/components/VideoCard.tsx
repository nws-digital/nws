'use client'

import {useEffect, useRef, useState} from 'react'
import Image from 'next/image'
import {toast} from 'sonner'
import type {VideoItem} from '@/lib/videos'
import {formatTimeAgo} from '@/lib/timeAgo'
import {youtubeWatchUrl} from '@/lib/youtube'

export function videoMeta(video: VideoItem) {
  return video.publishedAt ? formatTimeAgo(video.publishedAt, {long: true}) : ''
}

export function videoShareUrl(youtubeId: string) {
  return `${window.location.origin}/videos?v=${youtubeId}`
}

/** The red YouTube-style play badge drawn over each thumbnail. */
export function PlayBadge({className = ''}: {className?: string}) {
  return (
    <svg viewBox="0 0 40 28" aria-hidden="true" className={className}>
      <path
        fill="#FF0033"
        d="M39.16 4.37A5.02 5.02 0 0 0 35.62.83C32.5 0 20 0 20 0S7.5 0 4.38.83A5.02 5.02 0 0 0 .84 4.37C0 7.5 0 14 0 14s0 6.5.84 9.63a5.02 5.02 0 0 0 3.54 3.54C7.5 28 20 28 20 28s12.5 0 15.62-.83a5.02 5.02 0 0 0 3.54-3.54C40 20.5 40 14 40 14s0-6.5-.84-9.63Z"
      />
      <path fill="#fff" d="m16 20 10.4-6L16 8v12Z" />
    </svg>
  )
}

interface VideoCardProps {
  video: VideoItem
  onPlay: (video: VideoItem) => void
  sizes: string
  priority?: boolean
}

export function VideoCard({video, onPlay, sizes, priority = false}: VideoCardProps) {
  const meta = videoMeta(video)

  return (
    <article className="group relative rounded-xl border border-[#dfe1e4] bg-white transition-shadow duration-200 hover:shadow-[0_10px_24px_rgb(0_0_0/8%)]">
      <div className="relative w-full overflow-hidden rounded-t-[11px] bg-[#f0f0ea]" style={{aspectRatio: video.aspect}}>
        <Image
          src={video.thumbnailUrl}
          alt=""
          fill
          sizes={sizes}
          priority={priority}
          className={`object-cover transition-transform duration-300 ${
            // Zoom past the black bars baked into YouTube's 4:3 fallback thumbnail
            video.letterboxed ? 'scale-[1.34] group-hover:scale-[1.4]' : 'group-hover:scale-105'
          }`}
        />
        <PlayBadge className="absolute top-1/2 left-1/2 h-7 w-10 -translate-x-1/2 -translate-y-1/2 drop-shadow transition-transform duration-200 group-hover:scale-110" />
      </div>

      <div className="flex flex-col gap-1.5 px-4 pt-3 pb-3">
        <div className="flex items-start gap-4">
          <h3 className="m-0 line-clamp-2 flex-1 text-sm leading-[1.4] font-medium text-[#20211f]">
            {/* Stretched over the whole card so clicking anywhere plays the video */}
            <button
              type="button"
              onClick={() => onPlay(video)}
              className="text-left transition-colors group-hover:text-[#ed1c24] after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:rounded-xl focus-visible:after:outline-2 focus-visible:after:outline-[#ed1c24]"
            >
              {video.title}
            </button>
          </h3>
          <VideoCardMenu video={video} />
        </div>
        {meta && <p className="m-0 text-[11px] whitespace-pre text-[#7b7d76]">{meta}</p>}
      </div>
    </article>
  )
}

function VideoCardMenu({video}: {video: VideoItem}) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const copyLink = async () => {
    setOpen(false)
    try {
      await navigator.clipboard.writeText(videoShareUrl(video.youtubeId))
      toast.success('Link copied')
    } catch {
      toast.error('Could not copy the link')
    }
  }

  const itemClass =
    'block w-full px-3 py-2 text-left text-[13px] text-[#20211f] transition-colors hover:bg-[#f0f0ea] focus-visible:bg-[#f0f0ea] focus-visible:outline-none'

  return (
    <div ref={root} className="relative z-10 -mr-1 shrink-0">
      <button
        type="button"
        aria-label={`More options for ${video.title}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="grid size-6 place-items-center rounded-full text-[#7b7d76] transition-colors hover:bg-[#f0f0ea] hover:text-[#20211f]"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4" fill="currentColor">
          <circle cx="3" cy="8" r="1.3" />
          <circle cx="8" cy="8" r="1.3" />
          <circle cx="13" cy="8" r="1.3" />
        </svg>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 mt-1 w-44 overflow-hidden rounded-lg border border-[#dfe1e4] bg-white py-1 shadow-[0_12px_28px_rgb(0_0_0/12%)]"
        >
          <button type="button" role="menuitem" onClick={copyLink} className={itemClass}>
            Copy link
          </button>
          <a
            role="menuitem"
            href={youtubeWatchUrl(video.youtubeId)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className={itemClass}
          >
            Watch on YouTube
          </a>
        </div>
      )}
    </div>
  )
}
