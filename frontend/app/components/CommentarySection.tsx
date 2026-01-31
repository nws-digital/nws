'use client'

import Link from 'next/link'
import Image from 'next/image'
import {formatDistanceToNow} from 'date-fns'
import {urlForImage} from '@/sanity/lib/utils'
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
    bio?: any
  }
}

interface CommentarySectionProps {
  articles: CommentaryArticle[]
}

export function CommentarySection({articles}: CommentarySectionProps) {
  if (!articles || articles.length === 0) {
    return null
  }

  return (
    <section className="py-8 bg-white">
      <div className="max-w-[1366px] mx-auto px-4">
        {/* Section Heading with Red Line */}
        <div className="mb-8">
          <h6 className="text-2xl font-bold text-black whitespace-nowrap mb-2">Commentary</h6>
          <div className="w-8 h-1.5 bg-red-600"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.slice(0, 3).map((article) => {
            const authorForAvatar = article.author
              ? {
                  firstName: article.author.firstName ?? null,
                  lastName: article.author.lastName ?? null,
                  designation: article.author.designation ?? null,
                  picture: article.author.picture,
                  bio: article.author.bio,
                }
              : null

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
                <div className="mb-4">
                  {authorForAvatar && (
                    <Avatar person={authorForAvatar} date={article.date} small />
                  )}
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
      </div>
    </section>
  )
}
