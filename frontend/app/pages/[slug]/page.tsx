import type {Metadata, ResolvingMetadata} from 'next'
import {notFound} from 'next/navigation'
import {Suspense} from 'react'

import {Breadcrumb} from '@/app/components/Breadcrumb'
import PageBuilder from '@/app/components/PageBuilder'
import {sanityFetch} from '@/sanity/lib/live'
import {getPageQuery, pagesSlugs} from '@/sanity/lib/queries'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'

type Props = {
  params: Promise<{
    slug: string
  }>
}

/**
 * Revalidate the page every 5 minutes to get fresh content
 */
export const revalidate = 300

// Enable dynamic params in case a new page is published
export const dynamicParams = true

/**
 * Generate static params for all pages
 */
export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: pagesSlugs,
    perspective: 'published',
    stega: false,
  })
  
  console.log('[Page Route] Pages found in Sanity:', data)
  
  const params = (data || []).map((page: any) => ({
    slug: page.slug,
  }))
  
  console.log('[Page Route] Generated static params:', params)
  
  return params
}

/**
 * Generate metadata for the page.
 */
export async function generateMetadata(props: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params
  const pageResponse = await sanityFetch({
    query: getPageQuery,
    params: {slug: params.slug},
    stega: false,
  })
  const page = pageResponse.data

  const previousImages = (await parent).openGraph?.images || []

  return {
    title: page?.name || page?.heading,
    description: page?.subheading,
    openGraph: {
      images: previousImages,
    },
  } satisfies Metadata
}

export default async function Page(props: Props) {
  const params = await props.params
  
  console.log('[Page Route] Looking for page with slug:', params.slug)
  
  const {data: page} = await sanityFetch({
    query: getPageQuery,
    params: {slug: params.slug},
  })

  console.log('[Page Route] Found page:', page ? 'Yes' : 'No', page)

  if (!page) {
    console.log('[Page Route] Page not found for slug:', params.slug)
    return notFound()
  }

  return (
    <>
      <div className="pt-20">
        <div className="max-w-[1366px] mx-auto px-4 py-8">
          {/* Breadcrumb Navigation */}
          <Breadcrumb
            items={[
              {label: 'Home', href: '/'},
              {label: page.name || page.heading || 'Page'},
            ]}
          />

          {/* Page Header */}
          <div className="max-w-4xl mx-auto text-center mb-8">
            {page.heading && (
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                {page.heading}
              </h1>
            )}
            {page.subheading && (
              <p className="text-lg text-gray-600">
                {page.subheading}
              </p>
            )}
          </div>

          {/* Page Builder Content */}
          <div className="w-full">
            <PageBuilder page={page} />
          </div>
        </div>
      </div>
    </>
  )
}
