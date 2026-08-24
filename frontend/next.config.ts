import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  env: {
    // Matches the behavior of `sanity dev` which sets styled-components to use the fastest way of inserting CSS rules in both dev and production. It's default behavior is to disable it in dev mode.
    SC_DISABLE_SPEEDY: 'false',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  async redirects() {
    // Category URLs were shortened (world-exclusive -> world, etc). Redirect
    // old, already-indexed/shared links to the new short URLs.
    const renamedCategories: Array<[string, string]> = [
      ['world-exclusive', 'world'],
      ['india-exclusive', 'india'],
      ['osint-exclusive', 'osint'],
    ]

    const categoryRedirects = renamedCategories.flatMap(([from, to]) => [
      {
        source: `/${from}`,
        destination: `/${to}`,
        permanent: true,
      },
      {
        source: `/${from}/:slug`,
        destination: `/${to}/:slug`,
        permanent: true,
      },
    ])

    // Static pages live at /pages/<slug>, not at the bare root path.
    const staticPageSlugs = ['about', 'contact', 'privacy', 'terms']
    const staticPageRedirects = staticPageSlugs.map((slug) => ({
      source: `/${slug}`,
      destination: `/pages/${slug}`,
      permanent: true,
    }))

    return [
      ...categoryRedirects,
      ...staticPageRedirects,
      // The sitemap is now a sitemap-index at /index-sitemap.xml; keep the
      // old /sitemap.xml URL working during the crawler/Search Console migration.
      {
        source: '/sitemap.xml',
        destination: '/index-sitemap.xml',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *;",
          },
        ],
      },
    ]
  },
}

export default nextConfig
