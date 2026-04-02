'use client'

import {useState} from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {formatDistanceToNow} from 'date-fns'
import {motion} from 'framer-motion'
import {urlForImage} from '@/sanity/lib/utils'
import {loadMoreCommentaryArticles} from '@/app/actions/articles'
import {Breadcrumb} from '@/app/components/Breadcrumb'
import Avatar from '@/app/components/Avatar'

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

export function CommentaryArticlesList({
  initialArticles,
  totalCount,
}: CommentaryArticlesListProps) {
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
    <div className="max-w-[1366px] mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={[{label: 'Home', href: '/'}, {label: 'Commentary'}]} />

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {articles.map((article) => {
          const authorForAvatar = article.author
            ? {
                firstName: article.author.firstName ?? null,
                lastName: article.author.lastName ?? null,
                designation: article.author.designation ?? null,
                picture: article.author.picture,
                bio: (article.author as any).bio,
              }
            : null

          const timeAgo = formatDistanceToNow(new Date(article.date), {
            addSuffix: true,
          })

          return (
            <motion.div
              key={article._id}
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{once: true, amount: 0.2}}
              className="h-full"
              whileHover={{
                y: -8,
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              }}
              transition={{type: 'spring', stiffness: 300}}
            >
              <Link
                href={`/commentary/${article.slug.current}`}
                className="group flex flex-col bg-white border-2 border-gray-200 rounded-lg p-6 h-full transition-all duration-300"
              >
                {/* Author Info */}
                <div className="mb-4">
                  {authorForAvatar && <Avatar person={authorForAvatar} date={article.date} small />}
                </div>

                {/* Title */}
                <h3 className="font-vollkorn font-[700] text-[1.15rem] tracking-[-0.01em] leading-[1.25] text-black mb-3 group-hover:text-red-600 transition-colors line-clamp-2">
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p className="font-spectral-regular font-[400] text-[0.92rem] leading-[1.6] text-[#666660] text-sm line-clamp-4 mb-4">
                  {article.excerpt || article.contentPreview || 'No preview available...'}
                  {(article.excerpt || article.contentPreview) && '...'}
                </p>

                {/* Time ago at bottom */}
                <p className="font-inconsolata-regular font-[400] text-[0.72rem] text-gray-400 mt-auto">{timeAgo}</p>
              </Link>
            </motion.div>
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
        <div className="text-center text-gray-500 text-sm">No more articles to load</div>
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
