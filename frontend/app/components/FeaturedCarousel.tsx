'use client'

import {useEffect, useRef, useState, useCallback} from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {urlForImage} from '@/sanity/lib/utils'
import {cleanCategorySlug} from '@/sanity/lib/cleanCategorySlug'

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

const categoryLabels: Record<string, string> = {
  'world-exclusive': 'World Exclusive',
  'india-exclusive': 'India Exclusive',
  'osint-exclusive': 'OSINT Exclusive',
  'commentary': 'Commentary',
}

const INTERVAL_MS = 6000

export function FeaturedCarousel({articles}: FeaturedCarouselProps) {
  const [current, setCurrent] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isScrolling = useRef(false)

  const goTo = useCallback((index: number) => {
    const el = scrollRef.current
    if (!el) return
    isScrolling.current = true
    el.scrollTo({left: index * el.offsetWidth, behavior: 'smooth'})
    setCurrent(index)
    // Reset the flag after animation
    setTimeout(() => { isScrolling.current = false }, 600)
  }, [])

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrent(prev => {
        const next = (prev + 1) % articles.length
        const el = scrollRef.current
        if (el) {
          isScrolling.current = true
          el.scrollTo({left: next * el.offsetWidth, behavior: 'smooth'})
          setTimeout(() => { isScrolling.current = false }, 600)
        }
        return next
      })
    }, INTERVAL_MS)
  }, [articles.length])

  useEffect(() => {
    startTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [startTimer])

  // Sync current index when user manually swipes
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      if (isScrolling.current) return
      const idx = Math.round(el.scrollLeft / el.offsetWidth)
      if (idx !== current) {
        setCurrent(idx)
        startTimer() // restart timer after manual swipe
      }
    }
    el.addEventListener('scroll', onScroll, {passive: true})
    return () => el.removeEventListener('scroll', onScroll)
  }, [current, startTimer])

  if (!articles || articles.length === 0) return null

  return (
    <div className="relative w-full h-[600px] overflow-hidden">
      {/* Slides */}
      <div
        ref={scrollRef}
        className="flex h-full overflow-x-scroll snap-x snap-mandatory"
        style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
      >
        {articles.map((article, i) => {
          const imageUrl = article.coverImage
            ? urlForImage(article.coverImage)?.width(1400).height(600).url()
            : null

          return (
            <div
              key={article._id}
              className="snap-start shrink-0 w-full h-full relative"
            >
              <Link
                href={`/${cleanCategorySlug(article.category || '')}/${article.slug.current}`}
                className="group block w-full h-full relative overflow-hidden shadow-2xl"
              >
                {/* Image */}
                <div className="absolute inset-0 bg-gray-800">
                  {imageUrl ? (
                    <>
                      <Image
                        src={imageUrl}
                        alt={article.coverImage?.alt || article.title}
                        fill
                        className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                        priority={i === 0}
                        sizes="100vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent sm:from-black/75 sm:via-black/25" />
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-20 h-20 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content — shifted up from bottom with pb for dots */}
                <div className="absolute left-0 right-0 bottom-10 p-4 sm:p-2 text-white">
                  <div className="max-w-[1366px] mx-auto px-4">
                    <div className="lg:pr-[420px]">
                      {/* Category badge */}
                      {article.category && (
                        <div className="inline-flex items-center bg-red-600 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold mb-2 sm:mb-3">
                          {categoryLabels[article.category] || article.category}
                        </div>
                      )}

                      {/* Title */}
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 leading-tight group-hover:text-red-400 transition-colors drop-shadow-lg">
                        {article.title}
                      </h2>

                      {/* Excerpt */}
                      {article.excerpt && (
                        <p className="hidden sm:block text-sm md:text-base text-gray-200 line-clamp-2 md:line-clamp-3 max-w-3xl drop-shadow-md">
                          {article.excerpt}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )
        })}
      </div>

      {/* Dots */}
      {articles.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 lg:pr-[384px]">
          {articles.map((_, i) => (
            <button
              key={i}
              onClick={() => { goTo(i); startTimer() }}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? 'bg-white w-6'
                  : 'bg-white/50 w-2 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
