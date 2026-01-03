import {Suspense} from 'react'
import Link from 'next/link'
import {PortableText} from '@portabletext/react'

import {AllPosts} from '@/app/components/Posts'
import GetStartedCode from '@/app/components/GetStartedCode'
import SideBySideIcons from '@/app/components/SideBySideIcons'
import {NewsTicker} from '@/app/components/NewsTicker'
import {FeaturedArticle} from '@/app/components/FeaturedArticle'
import {FeaturedPlaceholder} from '@/app/components/FeaturedPlaceholder'
import {settingsQuery, featuredArticleQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'

export default async function Page() {
  const {data: settings} = await sanityFetch({
    query: settingsQuery,
  })

  const {data: featuredArticle} = await sanityFetch({
    query: featuredArticleQuery,
  })

  return (
    <>
      <div className="relative w-full pt-20">
        {/* Featured Article - Full width */}
        <div className="w-full">
          {featuredArticle ? (
            <FeaturedArticle article={featuredArticle} />
          ) : (
            <FeaturedPlaceholder />
          )}
        </div>

        {/* News Ticker - Overlaid on top right */}
        <aside className="hidden lg:block absolute top-20 bottom-0 right-8 w-96 z-10 py-6">
          <Suspense fallback={<div className="bg-white rounded-lg shadow-lg h-full w-full animate-pulse" />}>
            <NewsTicker />
          </Suspense>
        </aside>

        {/* News Ticker - Below on mobile */}
        <div className="lg:hidden container mx-auto px-4 mt-8">
          <Suspense fallback={<div className="bg-white rounded-lg shadow-lg h-[600px] animate-pulse" />}>
            <NewsTicker />
          </Suspense>
        </div>
      </div>
      <div className="border-t border-gray-100 bg-gray-50">
        <div className="container">
          <aside className="py-12 sm:py-20">
            <Suspense>{await AllPosts()}</Suspense>
          </aside>
        </div>
      </div>
    </>
  )
}
