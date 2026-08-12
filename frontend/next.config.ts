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
    return [
      { source: '/world-exclusive', destination: '/world', permanent: true },
      { source: '/world-exclusive/:slug', destination: '/world/:slug', permanent: true },
      { source: '/india-exclusive', destination: '/india', permanent: true },
      { source: '/india-exclusive/:slug', destination: '/india/:slug', permanent: true },
      { source: '/osint-exclusive', destination: '/osint', permanent: true },
      { source: '/osint-exclusive/:slug', destination: '/osint/:slug', permanent: true },
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
