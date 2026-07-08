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
  'world-exclusive': 'World',
  'india-exclusive': 'India',
  'osint-exclusive': 'OSINT',
  'commentary': 'Commentary',
}

const INTERVAL_MS = 6000

export function FeaturedCarousel({articles}: FeaturedCarouselProps) {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % articles.length)
    }, INTERVAL_MS)
  }, [articles.length])

  const goTo = useCallback((index: number) => {
    setCurrent(index)
    startTimer()
  }, [startTimer])

  useEffect(() => {
    startTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [startTimer])

  if (!articles || articles.length === 0) return null

  return (
    <div className="relative w-full h-[600px] overflow-hidden">
      {/* Slides */}
      {articles.map((article, i) => {
        const imageUrl = article.coverImage
          ? urlForImage(article.coverImage)?.width(1400).height(600).url()
          : null

        return (
          <div
            key={article._id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{opacity: i === current ? 1 : 0, pointerEvents: i === current ? 'auto' : 'none'}}
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

              {/* Content */}
              <div className="absolute left-0 right-0 bottom-10 p-4 sm:p-2 text-white">
                <div className="max-w-[1366px] mx-auto px-4">
                  <div className="lg:pr-[420px]">
                    {article.category && (
                      <div className="inline-flex items-center bg-red-600 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold mb-2 sm:mb-3">
                        {categoryLabels[article.category] || article.category}
                      </div>
                    )}
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 leading-tight group-hover:text-red-400 transition-colors drop-shadow-lg">
                      {article.title}
                    </h2>
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

      {/* Dots */}
      {articles.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 lg:pr-[384px]">
          {articles.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
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
