'use client'

import {useEffect, useRef, useState, useCallback} from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {urlForImage} from '@/sanity/lib/utils'
import {categoryToUrlSlug} from '@/sanity/lib/cleanCategorySlug'

interface FeaturedArticle {
  _id: string
  title: string
  slug: {current: string}
  excerpt?: string
  date: string
  category?: string
  author?: {
    firstName: string
    lastName: string
  }
  coverImage?: {
    asset: any
    alt?: string
  }
}

interface FeaturedCarouselProps {
  articles: FeaturedArticle[]
}

const INTERVAL_MS = 6000
const SWIPE_THRESHOLD_PX = 45

function ArrowButton({direction, label, onClick}: {direction: 'left' | 'right'; label: string; onClick: () => void}) {
  const isLeft = direction === 'left'
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`absolute top-0 z-10 hidden h-[420px] w-8 items-center justify-center bg-black/30 p-1 opacity-0 transition hover:bg-black/50 focus-visible:bg-black/50 focus-visible:outline-none group-hover/hero:opacity-100 group-focus-visible/hero:opacity-100 group-has-[:focus-visible]/hero:opacity-100 tablet:flex ${
        isLeft ? 'left-0 rounded-l-2xl' : 'right-0 rounded-r-2xl'
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/design/icon-chevron-left.svg"
        alt=""
        width={24}
        height={24}
        className={isLeft ? '' : 'rotate-180'}
      />
    </button>
  )
}

export function FeaturedCarousel({articles}: FeaturedCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [keyboardFocused, setKeyboardFocused] = useState(false)
  const paused = hovered || keyboardFocused
  const touchStartX = useRef<number | null>(null)
  const count = articles?.length ?? 0

  const showStory = useCallback(
    (index: number) => {
      if (count === 0) return
      setCurrent(((index % count) + count) % count)
    },
    [count],
  )

  // Auto-advance, paused while the reader hovers or focuses the carousel.
  // Depending on `current` restarts the countdown after any manual navigation.
  useEffect(() => {
    if (count < 2 || paused) return
    const timer = setTimeout(() => setCurrent((prev) => (prev + 1) % count), INTERVAL_MS)
    return () => clearTimeout(timer)
  }, [count, current, paused])

  if (!articles || count === 0) return null

  const article = articles[current]
  const imageUrl = article.coverImage
    ? urlForImage(article.coverImage)?.width(1200).height(800).url()
    : null
  const href = `/${categoryToUrlSlug(article.category || '')}/${article.slug.current}`

  return (
    <article
      className="group/hero relative flex min-w-0 touch-pan-y flex-col self-center rounded-2xl outline-none transition-transform duration-200 select-none hover:-translate-y-1 focus-visible:-translate-y-1 has-[:focus-visible]:-translate-y-1"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured news"
      tabIndex={0}
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') setHovered(true)
      }}
      onPointerLeave={() => setHovered(false)}
      onFocus={(e) => setKeyboardFocused(e.target.matches(':focus-visible'))}
      onBlur={() => setKeyboardFocused(false)}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return
        const distance = e.changedTouches[0].clientX - touchStartX.current
        touchStartX.current = null
        if (Math.abs(distance) >= SWIPE_THRESHOLD_PX) showStory(current + (distance < 0 ? 1 : -1))
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          showStory(current - 1)
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault()
          showStory(current + 1)
        }
      }}
    >
      <Link href={href} draggable={false} className="block" key={article._id}>
        <div className="relative h-[420px] animate-[hero-slide-in_280ms_cubic-bezier(0.2,0.8,0.2,1)] overflow-hidden rounded-2xl bg-[#eee] transition-shadow duration-200 group-hover/hero:shadow-[0_14px_35px_rgb(0_0_0/8%)] group-focus-visible/hero:shadow-[0_14px_35px_rgb(0_0_0/8%)] group-has-[:focus-visible]/hero:shadow-[0_14px_35px_rgb(0_0_0/8%)] max-tablet:h-[clamp(260px,68vw,420px)] max-phone:h-[56vw] max-phone:min-h-[210px]">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={article.coverImage?.alt || article.title}
              fill
              priority={current === 0}
              draggable={false}
              sizes="(max-width: 1100px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover/hero:scale-[1.035] group-focus-visible/hero:scale-[1.035] group-has-[:focus-visible]/hero:scale-[1.035]"
            />
          )}
        </div>
        <div className="animate-[hero-slide-in_280ms_cubic-bezier(0.2,0.8,0.2,1)] pt-5 pb-3">
          <h1 className="mb-2.5 text-[clamp(24px,2vw,32px)] leading-[1.2] font-bold max-tablet:text-[clamp(25px,7vw,32px)] max-phone:text-2xl">
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="line-clamp-3 text-base leading-[1.45] max-phone:text-[15px]">{article.excerpt}</p>
          )}
        </div>
      </Link>

      {count > 1 && (
        <>
          <ArrowButton direction="left" label="Show previous featured story" onClick={() => showStory(current - 1)} />
          <ArrowButton direction="right" label="Show next featured story" onClick={() => showStory(current + 1)} />
          <div
            className="flex min-h-7 items-center justify-center gap-0.5 pt-2.5"
            aria-label={`Featured story ${current + 1} of ${count}`}
          >
            {articles.map((item, i) => (
              <button
                key={item._id}
                type="button"
                aria-label={`Show featured story ${i + 1}: ${item.title}`}
                aria-pressed={i === current}
                onClick={() => showStory(i)}
                className="group/dot grid size-6 place-items-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1a1a1a]"
              >
                <span
                  className={`block rounded-full border border-[#666] transition-all duration-200 ${
                    i === current
                      ? 'h-2 w-6 bg-[#666]'
                      : 'size-2 bg-transparent group-hover/dot:size-3.5 group-focus-visible/dot:size-3.5'
                  }`}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </article>
  )
}
