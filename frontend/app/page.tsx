import Link from 'next/link'
import {PortableText} from '@portabletext/react'

import GetStartedCode from '@/app/components/GetStartedCode'
import SideBySideIcons from '@/app/components/SideBySideIcons'
import {MostReadPanel} from '@/app/components/MostReadPanel'
import {FeaturedCarousel} from '@/app/components/FeaturedCarousel'
import {FeaturedPlaceholder} from '@/app/components/FeaturedPlaceholder'
import {CommentarySection} from '@/app/components/CommentarySection'
import {LatestArticles} from '@/app/components/LatestArticles'
import {settingsQuery, featuredArticlesQuery, commentaryArticlesQuery, latestArticlesQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'
import {withDefinedSlug} from '@/sanity/lib/utils'
import {getMostReadArticles} from '@/app/actions/mostRead'

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

  const mostReadArticles = await getMostReadArticles()

  return (
    <>
      <div className="w-full pt-20">
        {/* Hero: Featured Carousel + Most Read panel, side by side on
            desktop, stacked on mobile */}
        <div className="max-w-[1366px] mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-1">
            <div className="w-full h-[320px] sm:h-[420px] lg:h-[600px] lg:flex-1">
              {featuredList.length > 0 ? (
                <FeaturedCarousel articles={featuredList} />
              ) : (
                <FeaturedPlaceholder />
              )}
            </div>
            <div className="w-full h-[500px] lg:h-[600px] lg:w-[410px] lg:shrink-0">
              <MostReadPanel articles={mostReadArticles} />
            </div>
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
