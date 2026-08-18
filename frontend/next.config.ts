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

    return renamedCategories.flatMap(([from, to]) => [
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
