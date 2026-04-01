'use client'

import {useState, useRef, useEffect} from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {formatDistanceToNow} from 'date-fns'
import {motion, AnimatePresence} from 'framer-motion'
import {urlForImage} from '@/sanity/lib/utils'
import {cleanCategorySlug} from '@/sanity/lib/cleanCategorySlug'

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

  // Debug: log category and slug for each article
  if (typeof window !== 'undefined') {
    // Only log on client
    articles.forEach((article, idx) => {
      // eslint-disable-next-line no-console
      console.log(`[LatestArticles] Article #${idx}:`, {
        category: article.category,
        slug: article.slug?.current,
        title: article.title,
        _id: article._id,
      })
    })
  }

  // Limit to 6 articles, filtering out those without valid slugs
  const displayArticles = articles.filter(article => article.slug?.current).slice(0, 6)

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
    return null;
  }

  const sectionVariants = {
    hidden: {opacity: 0},
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: {opacity: 0, y: 20},
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <motion.section
      className="pt-16 bg-gray-50"
      initial="hidden"
      whileInView="visible"
      viewport={{once: true, amount: 0.1}}
      variants={sectionVariants}
    >
      <div className="max-w-[1366px] mx-auto px-4">
        <motion.div className="flex justify-between items-center mb-8" variants={itemVariants}>
          <div>
            <h6 className="text-2xl font-bold text-black whitespace-nowrap mb-2">Latest</h6>
            <motion.div
              className="w-8 h-1.5 bg-red-600"
              initial={{width: 0}}
              animate={{width: '2rem'}}
              transition={{duration: 0.5, delay: 0.2}}
            />
          </div>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-red-600"
            >
              View All
              <motion.svg
                className={`w-4 h-4`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{rotate: isOpen ? 180 : 0}}
                transition={{duration: 0.3}}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </motion.svg>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20"
                  initial={{opacity: 0, y: -10}}
                  animate={{opacity: 1, y: 0}}
                  exit={{opacity: 0, y: -10, transition: {duration: 0.2}}}
                >
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={sectionVariants}
        >
          {displayArticles.map((article) => {
            const timeAgo = formatDistanceToNow(new Date(article.date), {
              addSuffix: true,
            })

            const categoryLabel = article.category
              ? categoryLabels[article.category] || article.category
              : ''

            const coverBuilder = article.coverImage ? urlForImage(article.coverImage) : null
            const coverImageUrl = coverBuilder?.width(600).height(400).fit('crop').url()

            return (
              <motion.div
                key={article._id}
                variants={itemVariants}
                className="group bg-white rounded-lg overflow-hidden border border-gray-200 flex flex-col"
                whileHover={{
                  y: -8,
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                }}
                transition={{type: 'spring', stiffness: 300}}
              >
                <Link
                  href={`/${article.category ? cleanCategorySlug(article.category) : 'posts'}/${article.slug.current}`}
                  className="flex flex-col h-full"
                >
                  {/* Cover Image */}
                  {coverImageUrl ? (
                    <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
                      <Image
                        src={coverImageUrl}
                        alt={article.title || 'Article image'}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No image</span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-6">
                    <h3 className="text-lg font-bold text-black mb-3 group-hover:text-red-600 transition-colors duration-300 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
                      {article.excerpt || article.contentPreview || 'No preview available...'}
                      {((article.excerpt || article.contentPreview) as any) && '...'}
                    </p>
                    <div className="flex items-center justify-between text-xs mt-4 pt-4 border-t border-gray-100">
                      <span className="text-gray-400">{timeAgo}</span>
                      {categoryLabel && (
                        <span className="text-red-600 font-semibold uppercase">
                          {categoryLabel}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </motion.section>
  )
}
