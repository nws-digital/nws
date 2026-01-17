'use client'

import {useState} from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {formatDistanceToNow} from 'date-fns'
import {urlForImage} from '@/sanity/lib/utils'
import {loadMoreArticles} from '@/app/actions/articles'
import {Breadcrumb} from '@/app/components/Breadcrumb'

interface Article {
  _id: string
  title: string
  slug: {current: string}
  excerpt?: string
  contentPreview?: string
  date: string
  category?: string
  coverImage?: any
}

interface CategoryArticlesListProps {
  initialArticles: Article[]
  category: string
  totalCount: number
}

const categoryLabels: Record<string, string> = {
  'world-exclusive': 'World Exclusive',
  'india-exclusive': 'India Exclusive',
  'issot-exclusive': 'ISSOT Exclusive',
  'commentary': 'Commentary',
}

export function CategoryArticlesList({initialArticles, category, totalCount}: CategoryArticlesListProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles)
  const [loading, setLoading] = useState(false)
  const [offset, setOffset] = useState(12)

  const hasMore = articles.length < totalCount

  const loadMore = async () => {
    setLoading(true)
    try {
      const newArticles = await loadMoreArticles(category, offset, offset + 12)
      
      setArticles([...articles, ...newArticles])
      setOffset(offset + 12)
    } catch (error) {
      console.error('Error loading more articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const categoryLabel = categoryLabels[category] || category

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumb 
        items={[
          {label: 'Home', href: '/'},
          {label: categoryLabel},
        ]}
      />

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {articles.map((article) => {
          const timeAgo = formatDistanceToNow(new Date(article.date), {
            addSuffix: true,
          })

          return (
            <Link
              key={article._id}
              href={`/posts/${article.slug.current}`}
              className="group flex flex-col bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-red-600"
            >
              {/* Cover Image */}
              {article.coverImage ? (
                <div className="relative w-full h-48 bg-gray-200">
                  <Image
                    src={urlForImage(article.coverImage)
                      .width(600)
                      .height(400)
                      .fit('crop')
                      .url()}
                    alt={article.title}
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

                {/* Time at bottom */}
                <div className="flex items-center justify-between text-xs mt-auto pt-4 border-t border-gray-100">
                  <span className="text-gray-400">{timeAgo}</span>
                  <span className="text-red-600 font-semibold uppercase">
                    {categoryLabel}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* No more articles message */}
      {!hasMore && articles.length > 0 && (
        <div className="text-center text-gray-500 text-sm">
          No more articles to load
        </div>
      )}

      {/* No articles at all */}
      {articles.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          <p className="text-xl">No articles found in this category yet.</p>
        </div>
      )}
    </div>
  )
}
