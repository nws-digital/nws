import {notFound} from 'next/navigation'
import {CategoryArticlesList} from '@/app/components/CategoryArticlesList'
import {CommentaryArticlesList} from '@/app/components/CommentaryArticlesList'
import {categoryArticlesQuery, categoryArticlesCountQuery, commentaryArticlesPageQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'
import {URL_SLUG_TO_CATEGORY} from '@/lib/constants'

// URL-facing slugs (what visitors see and what generateStaticParams builds)
const validCategories = Object.keys(URL_SLUG_TO_CATEGORY)

interface CategoryPageProps {
  params: Promise<{
    category: string
  }>
}

export async function generateStaticParams() {
  return validCategories.map((category) => ({
    category,
  }))
}

export default async function CategoryPage({params}: CategoryPageProps) {
  const {category: urlCategory} = await params

  // Validate the URL-facing slug
  if (!validCategories.includes(urlCategory)) {
    notFound()
  }

  // Translate back to the raw value stored in Sanity for querying
  const category = URL_SLUG_TO_CATEGORY[urlCategory]

  // Commentary page uses different query and component
  if (category === 'commentary') {
    const {data: articles} = await sanityFetch({
      query: commentaryArticlesPageQuery,
      params: {
        offset: 0,
        limit: 12,
      },
    })

    const {data: totalCount} = await sanityFetch({
      query: categoryArticlesCountQuery,
      params: {category},
    })

    return (
      <div className="pt-20 min-h-screen bg-gray-50">
        <CommentaryArticlesList
          initialArticles={articles || []}
          totalCount={totalCount || 0}
        />
      </div>
    )
  }

  // Other categories use regular article query
  const {data: articles} = await sanityFetch({
    query: categoryArticlesQuery,
    params: {
      category,
      offset: 0,
      limit: 12,
    },
  })

  const {data: totalCount} = await sanityFetch({
    query: categoryArticlesCountQuery,
    params: {category},
  })

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <CategoryArticlesList
        initialArticles={articles || []}
        category={category}
        totalCount={totalCount || 0}
      />
    </div>
  )
}
