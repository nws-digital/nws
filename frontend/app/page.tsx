import {Suspense} from 'react'
import Link from 'next/link'
import {PortableText} from '@portabletext/react'

import {AllPosts} from '@/app/components/Posts'
import GetStartedCode from '@/app/components/GetStartedCode'
import SideBySideIcons from '@/app/components/SideBySideIcons'
import {NewsTicker} from '@/app/components/NewsTicker'
import {FeaturedCarousel} from '@/app/components/FeaturedCarousel'
import {FeaturedPlaceholder} from '@/app/components/FeaturedPlaceholder'
import {CommentarySection} from '@/app/components/CommentarySection'
import {LatestArticles} from '@/app/components/LatestArticles'
import {settingsQuery, featuredArticlesQuery, commentaryArticlesQuery, latestArticlesQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'

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
        {/* Featured Carousel Section with News Ticker Overlay */}
        <div className="relative w-full">
          {/* Carousel - Full width */}
          <div className="w-full h-[600px]">
            {featuredList.length > 0 ? (
              <FeaturedCarousel articles={featuredList} />
            ) : (
              <FeaturedPlaceholder />
            )}
          </div>

          {/* News Ticker - Overlaid on featured article right side (desktop only) */}
          <div className="hidden lg:block absolute inset-0 pointer-events-none">
            <div className="max-w-[1366px] mx-auto px-4 h-full relative">
              <div className="absolute top-6 bottom-6 right-4 w-96 pointer-events-auto">
                <Suspense fallback={<div className="bg-white rounded-lg shadow-lg h-[500px] w-full animate-pulse" />}>
                  <NewsTicker />
                </Suspense>
              </div>
            </div>
          </div>
        </div>

        {/* News Ticker - Below featured article on mobile */}
        <div className="lg:hidden max-w-[1366px] mx-auto px-4 mt-8">
          <div className="h-[500px]">
            <Suspense fallback={<div className="bg-white rounded-lg shadow-lg h-full w-full animate-pulse" />}>
              <NewsTicker />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Latest Articles Section */}
      <LatestArticles articles={latestArticles || []} />

      {/* Separator */}
      <div className="bg-gray-50 pt-12">
        <div className="max-w-[1366px] mx-auto px-4">
          <div className="border-t border-gray-200" />
        </div>
      </div>

      {/* Commentary Section */}
      <CommentarySection articles={commentaryArticles || []} />

      {/* <div className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-[1366px] mx-auto px-4">
          <aside className="py-12 sm:py-20"> */}
            {/* <Suspense>{await AllPosts()}</Suspense> */}
          {/* </aside>
        </div>
      </div> */}
    </>
  )
}
