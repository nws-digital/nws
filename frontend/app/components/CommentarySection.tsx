import Link from 'next/link'
import Image from 'next/image'
import {formatDistanceToNow} from 'date-fns'
import {urlForImage} from '@/sanity/lib/utils'

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

interface CommentarySectionProps {
  articles: CommentaryArticle[]
}

export function CommentarySection({articles}: CommentarySectionProps) {
  if (!articles || articles.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Heading with Red Line */}
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-3xl font-bold text-black whitespace-nowrap">COMMENTARY</h2>
          <div className="flex-1 h-1 bg-red-600"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.slice(0, 3).map((article) => {
            const authorName = article.author 
              ? `${article.author.firstName} ${article.author.lastName}`
              : 'Anonymous'
            
            const timeAgo = formatDistanceToNow(new Date(article.date), {
              addSuffix: true,
            })

            return (
              <Link
                key={article._id}
                href={`/posts/${article.slug.current}`}
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
      </div>
    </section>
  )
}
