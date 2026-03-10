import Link from 'next/link'
import {Image} from 'next-sanity/image'
import {urlForImage} from '@/sanity/lib/utils'
import {formatDistanceToNow} from 'date-fns'
import {sidebarArticlesQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'

interface LatestArticlesSidebarProps {
  currentArticleId?: string
}

interface SidebarArticle {
  _id: string
  title: string
  slug: {
    current: string
  }
  excerpt?: string
  date: string
  category: string
  coverImage?: any
  author?: {
    firstName: string
    lastName: string
    designation?: string
    picture?: any
    bio?: any
  }
}

export async function LatestArticlesSidebar({currentArticleId}: LatestArticlesSidebarProps) {
  const {data: articles} = await sanityFetch({
    query: sidebarArticlesQuery,
    params: {
      excludeId: currentArticleId || '',
    },
  })

  // Show all 12 articles
  const sidebarArticles = (articles as SidebarArticle[] | null) || []

  if (sidebarArticles.length === 0) {
    return <p className="text-gray-500 text-sm">No articles available</p>
  }

  return (
    <div className="space-y-4">
      {sidebarArticles.map((article) => {
        const coverBuilder = article.coverImage ? urlForImage(article.coverImage) : null
        const coverImageUrl = coverBuilder?.width(80).height(80).fit('crop').url()
        const timeAgo = formatDistanceToNow(new Date(article.date), {addSuffix: true})

        return (
          <Link
            key={article._id}
            href={`/${article.category}/${article.slug.current}`}
            className="group flex gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
          >
            {/* Square Image - Left */}
            {coverImageUrl && (
              <div className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden">
                <Image
                  src={coverImageUrl}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}

            {/* Details - Right */}
            <div className="flex-1 min-w-0">
              {/* Title */}
              <h4 className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                {article.title}
              </h4>

              {/* Time ago and Category */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {/* <span>{timeAgo}</span> */}
                {/* <br /> */}
                <span className="block h-1" />
                {article.category && (
                  <>
                    <span>•</span>
                    <span className="text-blue-600 font-medium">{article.category}</span>
                  </>
                )}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
