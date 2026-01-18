import type {Metadata, ResolvingMetadata} from 'next'
import {notFound} from 'next/navigation'
import {type PortableTextBlock} from 'next-sanity'
import {Suspense} from 'react'

import Avatar from '@/app/components/Avatar'
import CoverImage from '@/app/components/CoverImage'
import {MorePosts} from '@/app/components/Posts'
import PortableText from '@/app/components/PortableText'
import {Breadcrumb} from '@/app/components/Breadcrumb'
import {sanityFetch} from '@/sanity/lib/live'
import {postQuery, allPostsQuery} from '@/sanity/lib/queries'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'

type Props = {
  params: Promise<{
    category: string
    slug: string
  }>
}

const validCategories = [
  'world-exclusive',
  'india-exclusive',
  'issot-exclusive',
  'commentary',
]

const categoryLabels: Record<string, string> = {
  'world-exclusive': 'World Exclusive',
  'india-exclusive': 'India Exclusive',
  'issot-exclusive': 'ISSOT Exclusive',
  'commentary': 'Commentary',
}

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
  
  return (data || [])
    .filter((post: any) => post.category && validCategories.includes(post.category))
    .map((post: any) => ({
      category: post.category,
      slug: post.slug,
    }))
}

/**
 * Generate metadata for the page.
 */
export async function generateMetadata(props: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params
  const {data: post} = await sanityFetch({
    query: postQuery,
    params: {slug: params.slug},
    stega: false,
  })
  const previousImages = (await parent).openGraph?.images || []
  const ogImage = resolveOpenGraphImage(post?.coverImage)

  return {
    authors:
      post?.author?.firstName && post?.author?.lastName
        ? [{name: `${post.author.firstName} ${post.author.lastName}`}]
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

  const [{data: post}] = await Promise.all([
    sanityFetch({query: postQuery, params: {slug: params.slug}}),
  ])

  if (!post?._id) {
    return notFound()
  }

  // Verify the article belongs to this category
  if (post.category !== params.category) {
    notFound()
  }

  const categoryLabel = categoryLabels[params.category] || params.category

  // Format slug for display (remove hyphens, capitalize)
  const articleSlug =
    post.slug?.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Article'

  return (
    <>
      <div className="pt-20">
        <div className="container px-4 py-8">
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

          <div>
            <div className="pb-2 mb-2 border-b border-gray-100">
              <div className="max-w-3xl flex flex-col gap-2">
                <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">
                  {post.title}
                </h2>
              </div>
              <div className="max-w-3xl flex gap-4 items-center mt-2">
                {post.author && post.author.firstName && post.author.lastName && (
                  <Avatar person={post.author} date={post.date} small />
                )}
              </div>
            </div>
            <article className="gap-1 grid max-w-4xl">
              <div className="">{post?.coverImage && <CoverImage image={post.coverImage} priority />}</div>
              {post.content?.length && (
                <PortableText className="max-w-2xl" value={post.content as PortableTextBlock[]} />
              )}
            </article>
          </div>
        </div>
      </div>
    </>
  )
}
