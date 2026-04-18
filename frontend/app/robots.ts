import {MetadataRoute} from 'next'

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

  return process.env.NODE_ENV === 'development'
    ? new URL('http://localhost:3000')
    : new URL('https://example.com')
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl()
  const sitemap = new URL('/sitemap.xml', baseUrl).toString()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap,
    host: baseUrl.host,
  }
}
