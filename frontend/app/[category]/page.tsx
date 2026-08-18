import {notFound} from 'next/navigation'
import {CategoryArticlesList} from '@/app/components/CategoryArticlesList'
import {CommentaryArticlesList} from '@/app/components/CommentaryArticlesList'
import {categoryArticlesQuery, categoryArticlesCountQuery, commentaryArticlesPageQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'
import {urlSlugToCategory} from '@/sanity/lib/cleanCategorySlug'
import {withDefinedSlug} from '@/sanity/lib/utils'

// URL segment values (short form) -- the underlying Sanity `category` field is unchanged.
const validCategorySlugs = ['world', 'india', 'osint', 'commentary']

interface CategoryPageProps {
  params: Promise<{
    category: string
  }>
}

export async function generateStaticParams() {
  return validCategorySlugs.map((category) => ({
    category,
  }))
}

export default async function CategoryPage({params}: CategoryPageProps) {
  const {category: categorySlug} = await params

  // Validate category and resolve the short URL slug back to the Sanity category value
  if (!validCategorySlugs.includes(categorySlug)) {
    notFound()
  }
  const category = urlSlugToCategory(categorySlug)!

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
          initialArticles={withDefinedSlug(articles || [])}
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
        initialArticles={withDefinedSlug(articles || [])}
        category={category}
        categorySlug={categorySlug}
        totalCount={totalCount || 0}
      />
    </div>
  )
}
