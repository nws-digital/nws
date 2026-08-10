import {MetadataRoute} from 'next'
import {sanityFetch} from '@/sanity/lib/live'
import {sitemapData} from '@/sanity/lib/queries'

function getBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (configured) {
    const normalized = configured.startsWith('http') ? configured : `https://${configured}`
    try {
      return new URL(normalized)
    } catch {
      return new URL('https://example.com')
    }
  }

  return process.env.NODE_ENV === 'development' ? new URL('http://localhost:3000') : new URL('https://example.com')
}

/**
 * This file creates a sitemap (sitemap.xml) for the application. Learn more about sitemaps in Next.js here: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 * Be sure to update the `changeFrequency` and `priority` values to match your application's content.
 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const allPostsAndPages = await sanityFetch({
    query: sitemapData,
  })
  const baseUrl = getBaseUrl()
  const sitemap: MetadataRoute.Sitemap = []

  // Include the most important static routes to help discovery.
  const staticRoutes = ['/']
  for (const route of staticRoutes) {
    sitemap.push({
      url: new URL(route, baseUrl).toString(),
      lastModified: new Date(),
      priority: route === '/' ? 1 : 0.8,
      changeFrequency: route === '/' ? 'daily' : 'hourly',
    })
  }

  if (allPostsAndPages != null && allPostsAndPages.data.length != 0) {
    let priority: number
    let changeFrequency:
      | 'monthly'
      | 'always'
      | 'hourly'
      | 'daily'
      | 'weekly'
      | 'yearly'
      | 'never'
      | undefined
    let url: string

    for (const p of allPostsAndPages.data as Array<{_type: string; slug: string; _updatedAt: string}>) {
      switch (p._type) {
        case 'page':
          priority = 0.8
          changeFrequency = 'monthly'
          url = new URL(`/${p.slug}`, baseUrl).toString()
          break
        case 'article':
          priority = 0.7
          changeFrequency = 'daily'
          url = new URL(`/posts/${p.slug}`, baseUrl).toString()
          break
        default:
          continue
      }
      sitemap.push({
        lastModified: p._updatedAt || new Date(),
        priority,
        changeFrequency,
        url,
      })
    }
  }

  return sitemap
}
