import Link from 'next/link'
import {PortableText} from '@portabletext/react'

import GetStartedCode from '@/app/components/GetStartedCode'
import SideBySideIcons from '@/app/components/SideBySideIcons'
import {FeaturedCarousel} from '@/app/components/FeaturedCarousel'
import {FeaturedPlaceholder} from '@/app/components/FeaturedPlaceholder'
import {CommentarySection} from '@/app/components/CommentarySection'
import {LatestArticles} from '@/app/components/LatestArticles'
import {settingsQuery, featuredArticlesQuery, commentaryArticlesQuery, latestArticlesQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'
import {withDefinedSlug} from '@/sanity/lib/utils'

export default async function Page() {
  const {data: settings} = await sanityFetch({
    query: settingsQuery,
  })

  const {data: featuredArticles} = await sanityFetch({
    query: featuredArticlesQuery,
  })

  const {data: commentaryArticles} = await sanityFetch({
    query: commentaryArticlesQuery,
  })

  const featuredList = (featuredArticles as any[]) || []
  const topFeaturedId = featuredList[0]?._id ?? ''

  const {data: latestArticles} = await sanityFetch({
    query: latestArticlesQuery,
    params: {
      excludeId: topFeaturedId,
    },
  })

  return (
    <>
      <div className="w-full pt-20">
        {/* Featured Carousel Section */}
        <div className="relative w-full">
          {/* Carousel - Full width */}
          <div className="w-full h-[600px]">
            {featuredList.length > 0 ? (
              <FeaturedCarousel articles={featuredList} />
            ) : (
              <FeaturedPlaceholder />
            )}
          </div>
        </div>
      </div>

      {/* Latest Articles Section */}
      <LatestArticles articles={withDefinedSlug(latestArticles || [])} />

      {/* Separator */}
      <div className="bg-gray-50 pt-12">
        <div className="max-w-[1366px] mx-auto px-4">
          <div className="border-t border-gray-200" />
        </div>
      </div>

      {/* Commentary Section */}
      <CommentarySection articles={withDefinedSlug(commentaryArticles || [])} />
    </>
  )
}
