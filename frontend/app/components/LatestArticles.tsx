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
  'issot-exclusive': 'ISSOT Exclusive',
  'commentary': 'Commentary',
}

export function LatestArticles({articles}: LatestArticlesProps) {
  if (!articles || articles.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Heading with Red Line */}
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-3xl font-bold text-black whitespace-nowrap">LATEST</h2>
          <div className="flex-1 h-1 bg-red-600"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => {
            const timeAgo = formatDistanceToNow(new Date(article.date), {
              addSuffix: true,
            })
            
            const categoryLabel = article.category 
              ? categoryLabels[article.category] || article.category
              : ''

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
