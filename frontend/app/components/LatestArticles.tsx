'use client'

import {useState, useRef, useEffect} from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {formatDistanceToNow} from 'date-fns'
import {urlForImage} from '@/sanity/lib/utils'

interface LatestArticle {
  _id: string
  title: string
  slug: {current: string}
  excerpt?: string
  contentPreview?: string
  date: string
  category?: string
  coverImage?: any
}

interface LatestArticlesProps {
  articles: LatestArticle[]
}

const categoryLabels: Record<string, string> = {
  'world-exclusive': 'World Exclusive',
  'india-exclusive': 'India Exclusive',
  'osint-exclusive': 'OSINT Exclusive',
  'commentary': 'Commentary',
}

export function LatestArticles({articles}: LatestArticlesProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Limit to 6 articles
  const displayArticles = articles.slice(0, 6)

  const dropdownOptions = [
    {label: 'World Exclusive', href: '/world-exclusive'},
    {label: 'India Exclusive', href: '/india-exclusive'},
    {label: 'OSINT Exclusive', href: '/osint-exclusive'},
  ]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownRef])

  if (!articles || articles.length === 0) {
    return null
  }

  return (
    <section className="pt-16 bg-gray-50">
      <div className="max-w-[1366px] mx-auto px-4">
        {/* Section Heading with Dropdown */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h6 className="text-2xl font-bold text-black whitespace-nowrap mb-2">Latest</h6>
            <div className="w-8 h-1.5 bg-red-600"></div>
          </div>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-red-600"
            >
              View All
              <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                <div className="py-1">
                  {dropdownOptions.map((option) => (
                    <Link
                      key={option.href}
                      href={option.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600"
                      onClick={() => setIsOpen(false)}
                    >
                      {option.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayArticles.map((article) => {
            const timeAgo = formatDistanceToNow(new Date(article.date), {
              addSuffix: true,
            })
            
            const categoryLabel = article.category 
              ? categoryLabels[article.category] || article.category
              : ''
            
            const coverBuilder = article.coverImage ? urlForImage(article.coverImage) : null
            const coverImageUrl = coverBuilder
              ?.width(600)
              .height(400)
              .fit('crop')
              .url()

            return (
              <Link
                key={article._id}
                href={`/${article.category}/${article.slug.current}`}
                className="group flex flex-col bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-red-600"
              >
                {/* Cover Image */}
                {coverImageUrl ? (
                  <div className="relative w-full h-48 bg-gray-200">
                    <Image
                      src={coverImageUrl}
                      alt={article.title || 'Article image'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No image</span>
                  </div>
                )}

                {/* Content */}
                <div className="flex flex-col flex-1 p-6">
                  {/* Headline */}
                  <h3 className="text-lg font-bold text-black mb-3 group-hover:text-red-600 transition-colors line-clamp-2">
                    {article.title}
                  </h3>

                  {/* Summary/Excerpt */}
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {article.excerpt || article.contentPreview || 'No preview available...'}
                    {(article.excerpt || article.contentPreview) && '...'}
                  </p>

                  {/* Time and Category at bottom */}
                  <div className="flex items-center justify-between text-xs mt-auto pt-4 border-t border-gray-100">
                    <span className="text-gray-400">{timeAgo}</span>
                    {categoryLabel && (
                      <span className="text-red-600 font-semibold uppercase">
                        {categoryLabel}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
