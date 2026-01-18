'use client'

import {useState} from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {formatDistanceToNow} from 'date-fns'
import {urlForImage} from '@/sanity/lib/utils'
import {loadMoreCommentaryArticles} from '@/app/actions/articles'
import {Breadcrumb} from '@/app/components/Breadcrumb'

interface CommentaryArticle {
  _id: string
  title: string
  slug: {current: string}
  excerpt?: string
  contentPreview?: string
  date: string
  author?: {
    firstName: string
    lastName: string
    designation?: string
    picture?: any
  }
}

interface CommentaryArticlesListProps {
  initialArticles: CommentaryArticle[]
  totalCount: number
}

export function CommentaryArticlesList({initialArticles, totalCount}: CommentaryArticlesListProps) {
  const [articles, setArticles] = useState<CommentaryArticle[]>(initialArticles)
  const [loading, setLoading] = useState(false)
  const [offset, setOffset] = useState(12)

  const hasMore = articles.length < totalCount

  const loadMore = async () => {
    setLoading(true)
    try {
      const newArticles = await loadMoreCommentaryArticles(offset, offset + 12)
      
      setArticles([...articles, ...newArticles])
      setOffset(offset + 12)
    } catch (error) {
      console.error('Error loading more articles:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumb 
        items={[
          {label: 'Home', href: '/'},
          {label: 'Commentary'},
        ]}
      />

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {articles.map((article) => {
          const authorName = article.author 
            ? `${article.author.firstName} ${article.author.lastName}`
            : 'Anonymous'
          
          const timeAgo = formatDistanceToNow(new Date(article.date), {
            addSuffix: true,
          })

          return (
            <Link
              key={article._id}
              href={`/commentary/${article.slug.current}`}
              className="group flex flex-col bg-white border-2 border-gray-200 rounded-lg p-6 hover:shadow-xl transition-all duration-300 hover:border-red-600"
            >
              {/* Author Info */}
              <div className="flex items-center gap-3 mb-4">
                {article.author?.picture ? (
                  <Image
                    src={urlForImage(article.author.picture)
                      .width(48)
                      .height(48)
                      .fit('crop')
                      .url()}
                    alt={authorName}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-600 font-semibold text-lg">
                      {authorName.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-black">{authorName}</p>
                  <p className="text-xs text-gray-500">
                    {article.author?.designation || 'Contributor'}
                  </p>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-black mb-3 group-hover:text-red-600 transition-colors line-clamp-2">
                {article.title}
              </h3>

              {/* Excerpt */}
              <p className="text-gray-600 text-sm line-clamp-4 mb-4">
                {article.excerpt || article.contentPreview || 'No preview available...'}
                {(article.excerpt || article.contentPreview) && '...'}
              </p>

              {/* Time ago at bottom */}
              <p className="text-xs text-gray-400 mt-auto">
                {timeAgo}
              </p>
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
          <p className="text-xl">No commentary articles found yet.</p>
        </div>
      )}
    </div>
  )
}
