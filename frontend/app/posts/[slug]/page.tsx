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
import {postPagesSlugs, postQuery} from '@/sanity/lib/queries'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'

type Props = {
  params: Promise<{slug: string}>
}

type PostAuthor = {
  firstName?: string | null
  lastName?: string | null
  designation?: string | null
  picture?: any
  bio?: any
}

type PostData = {
  _id?: string
  title?: string
  slug?: string
  excerpt?: string
  coverImage?: any
  date?: string
  category?: string
  content?: PortableTextBlock[]
  author?: PostAuthor | null
}

const categoryLabels: Record<string, string> = {
  'world-exclusive': 'World Exclusive',
  'india-exclusive': 'India Exclusive',
  'osint-exclusive': 'OSINT Exclusive',
  'commentary': 'Commentary',
}

/**
 * Generate the static params for the page.
 * Only pre-generate the 50 most recent articles.
 * Other articles will be generated on-demand (ISR).
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: postPagesSlugs,
    // Use the published perspective in generateStaticParams
    perspective: 'published',
    stega: false,
  })
  // Only pre-generate the first 50 articles
  return data.slice(0, 50)
}

/**
 * Revalidate the page every 5 minutes to get fresh content
 */
export const revalidate = 300

/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(props: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params
  const postResponse = await sanityFetch({
    query: postQuery,
    params,
    // Metadata should never contain stega
    stega: false,
  })
  const post = postResponse.data as PostData | null
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

export default async function PostPage(props: Props) {
  const params = await props.params
  const [{data: postResponse}] = await Promise.all([sanityFetch({query: postQuery, params})])
  const post = postResponse as PostData | null

  if (!post?._id) {
    return notFound()
  }

  const categoryLabel = post.category ? categoryLabels[post.category] || post.category : null

  // Format slug for display (remove hyphens, capitalize)
  const articleSlug = post.slug?.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Article'

  const authorForAvatar = post.author
    ? {
        firstName: post.author.firstName ?? null,
        lastName: post.author.lastName ?? null,
        picture: post.author.picture,
      }
    : null

  return (
    <>
      <div className="pt-20">
        <div className="container my-8 lg:my-12 grid gap-12">
          {/* Breadcrumb Navigation */}
          <Breadcrumb 
            items={[
              {label: 'Home', href: '/'},
              ...(categoryLabel && post.category ? [{
                label: categoryLabel, 
                href: `/category/${post.category}`
              }] : []),
              {label: articleSlug},
            ]}
          />
          
          <div>
            <div className="pb-6 grid gap-6 mb-6 border-b border-gray-100">
              <div className="max-w-3xl flex flex-col gap-6">
                <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-7xl">
                  {post.title}
                </h2>
              </div>
              <div className="max-w-3xl flex gap-4 items-center">
                {authorForAvatar?.firstName && authorForAvatar?.lastName && (
                  <Avatar person={authorForAvatar} date={post.date} />
                )}
              </div>
            </div>
            <article className="gap-6 grid max-w-4xl">
              <div className="">
                {post?.coverImage && <CoverImage image={post.coverImage} priority />}
              </div>
              {post.content?.length && (
                <PortableText className="max-w-2xl" value={post.content as PortableTextBlock[]} />
              )}
            </article>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-100 bg-gray-50">
        <div className="container py-12 lg:py-24 grid gap-12">
          <aside>
            <Suspense>{await MorePosts({skip: post._id, limit: 2})}</Suspense>
          </aside>
        </div>
      </div>
    </>
  )
}
