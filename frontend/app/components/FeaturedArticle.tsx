import Image from 'next/image'
import Link from 'next/link'
import {urlForImage} from '@/sanity/lib/utils'

interface FeaturedArticleProps {
  article: {
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
}

export function FeaturedArticle({article}: FeaturedArticleProps) {
  const imageUrl = article.coverImage
    ? urlForImage(article.coverImage)?.width(1200).height(600).url()
    : null

  const authorName = article.author
    ? `${article.author.firstName} ${article.author.lastName}`
    : null

  return (
    <Link 
      href={`/${article.category}/${article.slug.current}`}
      className="group block relative overflow-hidden shadow-2xl"
    >
      {/* Image */}
      <div className="relative aspect-[16/9] lg:aspect-[21/9] overflow-hidden bg-gray-800">
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={article.coverImage?.alt || article.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-20 h-20 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-12 text-white">
        <div className="max-w-3xl">
          {/* Featured badge */}
          <div className="inline-flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full text-xs font-semibold mb-4">
            <svg 
              className="w-4 h-4" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            FEATURED STORY
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 md:mb-4 leading-tight group-hover:text-red-400 transition-colors">
            {article.title}
          </h2>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-sm md:text-base lg:text-lg text-gray-200 mb-4 line-clamp-2 md:line-clamp-3">
              {article.excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs md:text-sm text-gray-300">
            {authorName && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                {authorName}
              </span>
            )}
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              {new Date(article.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          {/* Read more indicator */}
          <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white group-hover:text-red-400 transition-colors">
            Read Full Story
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}
