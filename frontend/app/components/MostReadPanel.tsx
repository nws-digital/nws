'use client'

import {useRef} from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {urlForImage} from '@/sanity/lib/utils'
import {categoryToUrlSlug} from '@/sanity/lib/cleanCategorySlug'
import type {MostReadArticle} from '@/app/actions/mostRead'

interface MostReadPanelProps {
  articles: MostReadArticle[]
}

export function MostReadPanel({articles}: MostReadPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isPausedByLongPress = useRef(false)

  if (!articles || articles.length === 0) return null

  // Mirrors the old "Just In" ticker's long-press-to-pause behavior on touch
  // devices, where hover-to-pause (handled by .animate-scroll:hover in
  // globals.css) isn't available.
  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.style.animationPlayState = 'paused'
        isPausedByLongPress.current = true
      }
    }, 500)
  }

  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
    if (isPausedByLongPress.current && scrollRef.current) {
      scrollRef.current.style.animationPlayState = 'running'
      isPausedByLongPress.current = false
    }
  }

  const canScroll = articles.length > 1

  return (
    <div className="w-full h-full bg-black flex flex-col overflow-hidden">
      <div className="shrink-0 bg-red-600 px-6 py-3">
        <h2 className="text-white text-2xl font-bold">Most Read</h2>
      </div>
      <div className="relative flex-1 min-h-0 overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black via-black/90 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black via-black/90 to-transparent z-10" />
        <div
          ref={scrollRef}
          className={`${canScroll ? 'animate-scroll' : ''} p-4 flex flex-col gap-4 select-none`}
          style={{WebkitTouchCallout: 'none'} as React.CSSProperties}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          {(canScroll ? [...articles, ...articles] : articles).map((article, index) => {
            const coverBuilder = article.coverImage ? urlForImage(article.coverImage) : null
            const imageUrl = coverBuilder?.width(86).height(72).fit('crop').url()

            return (
              <Link
                key={`${article._id}-${index}`}
                href={`/${categoryToUrlSlug(article.category || '')}/${article.slug.current}`}
                className="group flex items-start gap-2.5"
              >
                {imageUrl ? (
                  <div className="relative w-[86px] h-[72px] shrink-0 rounded-lg overflow-hidden bg-gray-800">
                    <Image
                      src={imageUrl}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="w-[86px] h-[72px] shrink-0 rounded-lg bg-gray-800" />
                )}
                <p className="flex-1 text-white text-sm font-bold leading-snug group-hover:text-red-400 transition-colors line-clamp-3">
                  {article.title}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
