import {notFound} from 'next/navigation'
import {CategoryArticlesList} from '@/app/components/CategoryArticlesList'
import {CommentaryArticlesList} from '@/app/components/CommentaryArticlesList'
import {categoryArticlesQuery, categoryArticlesCountQuery, commentaryArticlesPageQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'

const validCategories = [
  'world-exclusive',
  'india-exclusive',
  'issot-exclusive',
  'commentary',
]

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
  const {category} = await params

  // Validate category
  if (!validCategories.includes(category)) {
    notFound()
  }

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
