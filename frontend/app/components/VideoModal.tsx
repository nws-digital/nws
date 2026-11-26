'use client'

import {useEffect, useRef} from 'react'
import {AnimatePresence, motion} from 'framer-motion'
import type {VideoItem} from '@/lib/videos'
import {youtubeEmbedUrl, youtubeWatchUrl} from '@/lib/youtube'
import {videoMeta} from '@/app/components/VideoCard'

interface VideoModalProps {
  video: VideoItem | null
  onClose: () => void
}

// Interim popup until the design mockup is ready: dark backdrop, centred
// 16:9 player that starts playing, title + "Watch on YouTube" underneath
// (the fallback for videos whose owner has disabled embedding).
export function VideoModal({video, onClose}: VideoModalProps) {
  const closeButton = useRef<HTMLButtonElement>(null)

  // Lock page scroll, close on Escape, and move focus in (and back out on close)
  useEffect(() => {
    if (!video) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      // Keep Tab inside the popup (close button and the YouTube link)
      if (e.key === 'Tab') {
        const dialog = closeButton.current?.closest('[role="dialog"]')
        const focusable = dialog?.querySelectorAll<HTMLElement>('button, a[href], iframe')
        if (!focusable?.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      previouslyFocused?.focus?.({preventScroll: true})
    }
  }, [video, onClose])

  const meta = video ? videoMeta(video) : ''

  return (
    <AnimatePresence>
      {video && (
        <motion.div
          key="video-modal"
          role="dialog"
          aria-modal="true"
          aria-label={video.title}
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          transition={{duration: 0.2}}
          className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-black/85 p-4 font-literata tablet:p-8"
          onClick={onClose}
        >
          <motion.div
            initial={{opacity: 0, scale: 0.96, y: 12}}
            animate={{opacity: 1, scale: 1, y: 0}}
            exit={{opacity: 0, scale: 0.98}}
            transition={{duration: 0.28, ease: [0.22, 1, 0.36, 1]}}
            className="w-full max-w-[min(1100px,calc((100dvh-11rem)*16/9))]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex justify-end">
              <button
                ref={closeButton}
                type="button"
                aria-label="Close video"
                onClick={onClose}
                className="grid size-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-[0_24px_80px_rgb(0_0_0/50%)]">
              <iframe
                key={video.youtubeId}
                src={youtubeEmbedUrl(video.youtubeId, {autoplay: true})}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="absolute inset-0 size-full border-0"
              />
            </div>

            <div className="mt-4 flex items-start justify-between gap-6 text-white max-phone:flex-col max-phone:gap-2">
              <div className="flex min-w-0 flex-col gap-1">
                <h2 className="m-0 text-base leading-snug font-medium tablet:text-lg">{video.title}</h2>
                {meta && <p className="m-0 text-xs whitespace-pre text-white/60">{meta}</p>}
              </div>
              <a
                href={youtubeWatchUrl(video.youtubeId)}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-sm text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                Watch on YouTube ↗
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
