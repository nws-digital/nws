import type {Metadata} from 'next'
import {CategoryArticlesList} from '@/app/components/CategoryArticlesList'
import {handpickedArticlesPageQuery, handpickedArticlesCountQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'
import {withDefinedSlug} from '@/sanity/lib/utils'

export const metadata: Metadata = {
  title: 'Hand-Picked',
}

// Refresh periodically so newly hand-picked articles show up without a deploy.
export const revalidate = 300

export default async function HandpickedPage() {
  const [{data: articles}, {data: totalCount}] = await Promise.all([
    sanityFetch({query: handpickedArticlesPageQuery, params: {offset: 0, limit: 12}}),
    sanityFetch({query: handpickedArticlesCountQuery}),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <CategoryArticlesList
        initialArticles={withDefinedSlug(articles || [])}
        handpicked
        totalCount={totalCount || 0}
      />
    </div>
  )
}
