'use client'

import {useState, useEffect, useRef, useMemo} from 'react'
import {createPortal} from 'react-dom'
import Link from 'next/link'
import Image from 'next/image'
import {formatDistanceToNow} from 'date-fns'
import {urlForImage} from '@/sanity/lib/utils'
import {searchArticles, getLatestArticles} from '@/app/actions/search'
import {categoryToUrlSlug} from '@/sanity/lib/cleanCategorySlug'
import {motion, AnimatePresence} from 'framer-motion'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

interface SearchResult {
  _id: string
  title: string
  slug: {current: string}
  excerpt?: string
  category: string
  date: string
  coverImage?: any
  author?: {firstName: string; lastName: string}
}

const categoryLabels: Record<string, string> = {
  'world-exclusive': 'World',
  'india-exclusive': 'India',
  'osint-exclusive': 'NWS Originals',
  'commentary': 'Commentary',
}

export default function SearchModal({isOpen, onClose}: SearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [latestArticles, setLatestArticles] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeRequestRef = useRef(0)
  const trimmedQuery = useMemo(() => searchTerm.trim(), [searchTerm])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch latest articles when modal opens
  useEffect(() => {
    const fetchLatestArticles = async () => {
      try {
        const articles = await getLatestArticles()
        setLatestArticles(articles)
      } catch (error) {
        console.error('Error fetching latest articles:', error)
      }
    }
    
    if (isOpen && latestArticles.length === 0) {
      fetchLatestArticles()
    }
  }, [isOpen, latestArticles.length])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const runSearch = async (query: string, requestId: number) => {
    try {
      const searchResults = await searchArticles(query)
      if (activeRequestRef.current === requestId) {
        setResults(searchResults)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      if (activeRequestRef.current === requestId) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }

    if (trimmedQuery.length < 2) {
      activeRequestRef.current += 1
      setLoading(false)
      setResults((prev) => (prev.length ? [] : prev))
      return
    }

    const requestId = ++activeRequestRef.current
    setLoading(true)

    debounceRef.current = setTimeout(() => {
      runSearch(trimmedQuery, requestId)
      debounceRef.current = null
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
        debounceRef.current = null
      }
    }
  }, [trimmedQuery])

  useEffect(() => {
    if (!isOpen) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
        debounceRef.current = null
      }
      activeRequestRef.current += 1
      setSearchTerm('')
      setResults([])
      setLoading(false)
    }
  }, [isOpen])

  const handleSearch = async () => {
    if (trimmedQuery.length < 2) return

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }

    const requestId = ++activeRequestRef.current
    setLoading(true)
    runSearch(trimmedQuery, requestId)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  if (!mounted) return null

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.3}}
            className="fixed inset-0 z-[60] bg-black/[0.52] backdrop-blur-[5px]"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[70] flex items-start justify-center px-6 pt-[min(18vh,160px)] max-phone:px-3 max-phone:pt-20">
            <motion.div
              initial={{opacity: 0, scale: 0.95, y: 20}}
              animate={{opacity: 1, scale: 1, y: 0}}
              exit={{opacity: 0, scale: 0.95, y: 20}}
              transition={{type: 'spring', duration: 0.3, bounce: 0.2}}
              className="bg-white rounded-2xl shadow-[0_30px_90px_rgb(0_0_0/25%)] w-full max-w-[720px] max-h-[90vh] overflow-hidden font-literata"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header + search field */}
              <div className="p-7 max-phone:p-5">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-[28px] font-bold text-[#1a1a1a]">Search NWS</h2>
                  <motion.button
                    whileHover={{rotate: 90}}
                    whileTap={{scale: 0.9}}
                    onClick={onClose}
                    className="grid size-9 place-items-center rounded-full p-1.5 transition-colors hover:bg-[#f2f2f2]"
                    aria-label="Close search"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/design/icon-close.svg" alt="" className="size-6" />
                  </motion.button>
                </div>

                <label htmlFor="site-search" className="mb-2 block text-sm text-[#666]">
                  Stories, topics and authors
                </label>
                <div className="flex items-center rounded-[10px] border border-[#b9b9b9] transition focus-within:border-[#1a1a1a] focus-within:shadow-[0_0_0_3px_rgb(0_0_0/8%)]">
                  <input
                    id="site-search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="What are you looking for?"
                    className="min-w-0 flex-1 bg-transparent px-[18px] py-[15px] text-black outline-none placeholder:text-[#666]"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSearch}
                    aria-label="Submit search"
                    className="grid size-[52px] place-items-center"
                  >
                    {loading ? (
                      <div className="animate-spin h-6 w-6 border-2 border-gray-600 border-t-transparent rounded-full" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src="/images/design/icon-search-lg.svg" alt="" className="size-7" />
                    )}
                  </button>
                </div>

                {/* Search Query Indicator */}
                {trimmedQuery.length >= 2 && (
                  <div className="mt-2 text-xs text-[#666]">
                    {results.length} result{results.length !== 1 ? 's' : ''} found
                  </div>
                )}
              </div>

              {/* Results */}
              <div className="overflow-y-auto max-h-[calc(90vh-280px)] border-t border-gray-200 p-6 empty:hidden">
            {/* Show "No results" only when there's a search query and no results */}
            {results.length === 0 && !loading && trimmedQuery.length >= 2 && (
              <div className="text-center py-8 text-gray-500">
                No results found for &ldquo;{searchTerm}&rdquo;
              </div>
            )}

            {/* Show latest articles by default when no search term */}
            {trimmedQuery.length === 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">
                  Recent News
                </h3>
                <div className="space-y-3">
                  {latestArticles.map((article) => {
                    const timeAgo = formatDistanceToNow(new Date(article.date), {
                      addSuffix: true,
                    })
                    const coverBuilder = article.coverImage ? urlForImage(article.coverImage) : null
                    const coverImageUrl = coverBuilder?.width(160).height(160).fit('crop').url()

                    return (
                      <Link
                        key={article._id}
                        href={`/${categoryToUrlSlug(article.category)}/${article.slug.current}`}
                        onClick={onClose}
                        className="flex gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                      >
                        {coverImageUrl && (
                          <div className="relative w-20 h-20 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
                            <Image
                              src={coverImageUrl}
                              alt={article.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-1.5">
                            {article.title}
                          </h3>
                          {article.excerpt && (
                            <p className="text-xs text-gray-600 line-clamp-2 mb-1.5">
                              {article.excerpt}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="px-2 py-0.5 bg-gray-100 rounded">
                              {categoryLabels[article.category] || article.category}
                            </span>
                            <span>{article.author?.firstName} {article.author?.lastName}</span>
                            <span>{timeAgo}</span>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Show search results when there's a search term */}
            {trimmedQuery.length >= 2 && (
              <div className="space-y-3">
                {results.map((result) => {
                  const timeAgo = formatDistanceToNow(new Date(result.date), {
                    addSuffix: true,
                  })
                  const coverBuilder = result.coverImage ? urlForImage(result.coverImage) : null
                  const coverImageUrl = coverBuilder?.width(160).height(160).fit('crop').url()

                  return (
                    <Link
                      key={result._id}
                      href={`/${categoryToUrlSlug(result.category)}/${result.slug.current}`}
                      onClick={onClose}
                      className="flex gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                    >
                      {coverImageUrl && (
                        <div className="relative w-20 h-20 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
                          <Image
                            src={coverImageUrl}
                            alt={result.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-1.5">
                          {result.title}
                        </h3>
                        {result.excerpt && (
                          <p className="text-xs text-gray-600 line-clamp-2 mb-1.5">
                            {result.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded">
                            {categoryLabels[result.category] || result.category}
                          </span>
                            <span>{result.author?.firstName} {result.author?.lastName}</span>
                          <span>{timeAgo}</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
}
