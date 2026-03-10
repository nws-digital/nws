import type {Metadata, ResolvingMetadata} from 'next'
import {notFound} from 'next/navigation'
import {type PortableTextBlock} from 'next-sanity'
import {Suspense} from 'react'
import Avatar from '@/app/components/Avatar'
import CoverImage from '@/app/components/CoverImage'
import PortableText from '@/app/components/PortableText'
import {Breadcrumb} from '@/app/components/Breadcrumb'
import {LatestArticlesSidebar} from '@/app/components/LatestArticlesSidebar'
import {ArticleDates} from '@/app/components/ArticleDates'
import {ShareArticle} from '@/app/components/ShareArticle'
import {sanityFetch} from '@/sanity/lib/live'
import {postQuery, allPostsQuery} from '@/sanity/lib/queries'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'

type Props = {
  params: Promise<{
    category: string
    slug: string
  }>
}

type ArticleAuthor = {
  firstName?: string | null
  lastName?: string | null
  designation?: string | null
  picture?: any
  bio?: any
}

type ArticlePost = {
  _id?: string
  _updatedAt?: string
  title?: string
  slug?: string
  excerpt?: string
  coverImage?: any
  date?: string
  lastPublishedDate?: string
  category?: string
  content?: PortableTextBlock[]
  author?: ArticleAuthor | null
}

const validCategories = [
  'world-exclusive',
  'india-exclusive',
  'osint-exclusive',
  'commentary',
]

const categoryLabels: Record<string, string> = {
  'world-exclusive': 'World Exclusive',
  'india-exclusive': 'India Exclusive',
  'osint-exclusive': 'OSINT Exclusive',
  'commentary': 'Commentary',
}

/**
 * Revalidate the page every 5 minutes to get fresh content
 */
export const revalidate = 300

// Enable dynamic params in case a new article is published
export const dynamicParams = true

/**
 * Generate static params for all articles
 */
export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: allPostsQuery,
    perspective: 'published',
    stega: false,
  })
  
  const params = (data || [])
    .filter((post: any) => post.category && validCategories.includes(post.category))
    .map((post: any) => ({
      category: post.category,
      slug: post.slug,
    }))
  
  return params
}

/**
 * Generate metadata for the page.
 */
export async function generateMetadata(props: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params
  const postResponse = await sanityFetch({
    query: postQuery,
    params: {slug: params.slug},
    stega: false,
  })
  const post = postResponse.data as ArticlePost | null
  const previousImages = (await parent).openGraph?.images || []
  const ogImage = resolveOpenGraphImage(post?.coverImage)

  return {
    authors:
      post?.author?.firstName && post?.author?.lastName
        ? [{name: `${post.author.firstName ?? ''} ${post.author.lastName ?? ''}`.trim()}]
        : [],
    title: post?.title,
    description: post?.excerpt,
    openGraph: {
      images: ogImage ? [ogImage, ...previousImages] : previousImages,
    },
  } satisfies Metadata
}

export default async function ArticlePage(props: Props) {
  const params = await props.params
  
  // Validate category
  if (!validCategories.includes(params.category)) {
    notFound()
  }

  const [{data: postResponse}] = await Promise.all([
    sanityFetch({query: postQuery, params: {slug: params.slug}}),
  ])
  const post = postResponse as ArticlePost | null

  if (!post?._id) {
    console.log('Article not found for slug:', params.slug)
    return notFound()
  }

  // Normalize and compare categories (trim whitespace and invisible characters)
  const normalizedPostCategory = post.category?.trim().replace(/[\u200B-\u200D\uFEFF]/g, '')
  const normalizedParamsCategory = params.category.trim()
  
  if (normalizedPostCategory !== normalizedParamsCategory) {
    console.log('Category mismatch:', {
      urlCategory: params.category,
      articleCategory: post.category,
      normalizedArticleCategory: normalizedPostCategory,
      slug: params.slug
    })
    notFound()
  }

  const categoryLabel = categoryLabels[params.category] || params.category

  const authorForAvatar = post.author
    ? {
        firstName: post.author.firstName ?? null,
        lastName: post.author.lastName ?? null,
        designation: post.author.designation ?? null,
        picture: post.author.picture,
        bio: post.author.bio,
      }
    : null

  // Format slug for display (remove hyphens, capitalize)
  const articleSlug =
    post.slug?.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Article'

  return (
    <>
      <div className="pt-20">
        <div className="max-w-[1366px] mx-auto px-4 py-8">
          {/* Breadcrumb Navigation */}
          <Breadcrumb
            items={[
              {label: 'Home', href: '/'},
              {
                label: categoryLabel,
                href: `/${params.category}`,
              },
              {label: articleSlug},
            ]}
          />

          {/* Grid Layout: Article (3/4) + Sidebar (1/4) */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Article - 3/4 width */}
            <div className="lg:col-span-3">
              <div className="pb-2 mb-2 border-b border-gray-100">
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-black sm:text-2xl lg:text-3xl">
                    {post.title}
                  </h2>
                </div>
                <div className="flex items-center justify-between gap-4 mt-3">
                  {/* Author - Left Side */}
                  {authorForAvatar?.firstName && authorForAvatar?.lastName && (
                    <Avatar person={authorForAvatar} small />
                  )}
                  {/* Share Button - Right Side */}
                  <ShareArticle 
                    title={post.title || 'Article'} 
                    url={`/${params.category}/${params.slug}`}
                  />
                </div>
              </div>
              <article className="gap-1 grid w-full">
                <div className="">{post?.coverImage && <CoverImage image={post.coverImage} priority />}</div>
                {post.content?.length && (
                  <PortableText className="" value={post.content as PortableTextBlock[]} />
                )}
              </article>

              <div className="flex flex-col gap-3 mt-3 top-8 pt-8">
                  {post.date && (
                    <ArticleDates 
                      date={post.date} 
                      lastPublishedDate={post.lastPublishedDate}
                    />
                  )}
                </div>
            </div>

            {/* Vertical Divider + Sidebar - 1/4 width (Desktop only) */}
            <aside className="hidden lg:block lg:col-span-1 border-l border-gray-200 pl-8">
              <div className="sticky top-24">
                <h3 className="text-lg font-bold mb-4">Latest Articles</h3>
                <LatestArticlesSidebar currentArticleId={post._id} />
              </div>
            </aside>
          </div>

          {/* Mobile Latest Articles - Below article content */}
          <div className="lg:hidden mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-bold mb-6">Latest Articles</h3>
            <LatestArticlesSidebar currentArticleId={post._id} />
          </div>
        </div>
      </div>
    </>
  )
}
