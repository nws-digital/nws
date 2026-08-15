'use client'

/**
 * This component uses Portable Text to render a post body.
 *
 * You can learn more about Portable Text on:
 * https://www.sanity.io/docs/block-content
 * https://github.com/portabletext/react-portabletext
 * https://portabletext.org/
 *
 */

import {PortableText, type PortableTextComponents, type PortableTextBlock} from 'next-sanity'
import {Image} from 'next-sanity/image'
import {urlForImage, getContainedImageDimensions} from '@/sanity/lib/utils'
import TweetEmbed from '@/app/components/TweetEmbed'
import ResolvedLink from '@/app/components/ResolvedLink'

// Body images are scaled down (never cropped, never upscaled) to fit within
// this box on whichever axis is the tighter constraint - full width when the
// image is wide/normal, full height with blank space on the sides when it's
// tall. Sources already smaller than the box keep their natural size.
const MAX_BODY_IMAGE_WIDTH = 600
const MAX_BODY_IMAGE_HEIGHT = 600

export default function CustomPortableText({
  className,
  value,
}: {
  className?: string
  value: PortableTextBlock[]
}) {
  const components: PortableTextComponents = {
    block: {
      h1: ({children, value}) => (
        // Add an anchor to the h1
        <h1 className="group relative">
          {children}
          <a
            href={`#${value?._key}`}
            className="absolute left-0 top-0 bottom-0 -ml-6 flex items-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </a>
        </h1>
      ),
      h2: ({children, value}) => {
        // Add an anchor to the h2
        return (
          <h2 className="group relative">
            {children}
            <a
              href={`#${value?._key}`}
              className="absolute left-0 top-0 bottom-0 -ml-6 flex items-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </a>
          </h2>
        )
      },
    },
    marks: {
      link: ({children, value: link}) => {
        return <ResolvedLink link={link}>{children}</ResolvedLink>
      },
    },
    types: {
      image: ({value}) => {
        if (!value?.asset?._ref) {
          return null
        }
        // No cropping: the image is scaled down (never up) to fit within a
        // MAX_BODY_IMAGE_WIDTH x MAX_BODY_IMAGE_HEIGHT box on whichever axis
        // is the tighter fit - full width for a normal/wide photo, full
        // height with blank space on the sides for a tall one. A source
        // already smaller than the box in both dimensions renders at its
        // natural size instead of being stretched up to fill it.
        //
        // Uses next-sanity's Image (not plain next/image) so every srcset
        // candidate is generated live by Sanity's CDN loader, matching
        // CoverImage.tsx - it requests exactly the resolution each viewport
        // needs and never upscales past what the source actually has, which
        // is what a plain next/image resizing from one static pre-baked URL
        // could not guarantee (that previously blurred larger renders).
        const dims = getContainedImageDimensions(value, MAX_BODY_IMAGE_WIDTH, MAX_BODY_IMAGE_HEIGHT)
        const imageUrl = urlForImage(value)?.url()
        if (!imageUrl || !dims) {
          return null
        }
        return (
          <figure className="my-8">
            <div className="flex justify-center bg-gray-50 rounded-lg overflow-hidden">
              <Image
                src={imageUrl}
                alt={value.alt || 'Article image'}
                width={dims.width}
                height={dims.height}
                sizes={`(max-width: 768px) 100vw, ${dims.width}px`}
                className="rounded-lg"
                // width:auto/height:auto (e.g. via Tailwind's w-auto/h-auto)
                // only holds until the image decodes - once real pixel data
                // arrives, browsers size a plain <img> to ITS OWN natural
                // resolution and ignore the width/height attributes, which
                // silently shrank every image down to its raw source pixel
                // count. An explicit aspect-ratio isn't overridden that way,
                // so it's what actually keeps the contain-fit box.
                style={{
                  width: dims.width,
                  height: 'auto',
                  maxWidth: '100%',
                  maxHeight: MAX_BODY_IMAGE_HEIGHT,
                  // Tailwind Typography's `.prose img` default adds 2em of
                  // vertical margin on every image, stacking with the
                  // figure's own my-8 spacing and pushing the image away
                  // from this box's edges (the "space on all sides" look).
                  margin: 0,
                  aspectRatio: `${dims.width} / ${dims.height}`,
                }}
              />
            </div>
            {value.caption && (
                <figcaption className="mt-2 text-md text-gray-500">
                {value.caption}
                </figcaption>
            )}
          </figure>
        )
      },
      embed: ({value}) => {
        if (!value?.url || !value?.type) return null
        if (value.type === 'youtube') {
          // Extract YouTube video ID
          const match = value.url.match(/(?:youtu.be\/|youtube.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/)
          const videoId = match ? match[1] : null
          if (!videoId) return null
          return (
            <div className="my-8 max-w-full overflow-hidden">
              <div className="relative w-full aspect-video max-w-full">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video embed"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full rounded-lg"
                />
              </div>
            </div>
          )
        }
        if (value.type === 'twitter') {
          // Use react-tweet for X/Twitter embeds
          // Extract tweet ID from URL
          const match = value.url.match(/(?:twitter|x)\.com\/.+\/status\/(\d+)/)
          const tweetId = match ? match[1] : null
          if (!tweetId) return null
          return (
            <div className="my-8 max-w-full overflow-hidden flex justify-center">
              <div className="w-full max-w-xl">
                <TweetEmbed id={tweetId} />
              </div>
            </div>
          )
        }
        // Generic iframe embed
        if (value.type === 'iframe') {
          return (
            <div className="my-8 max-w-full overflow-hidden">
              <div className="relative w-full aspect-video max-w-full">
                <iframe
                  src={value.url}
                  title="Embedded content"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full rounded-lg"
                />
              </div>
            </div>
          )
        }
        return null
      },
    },
  }

  return (
    <div className={['prose prose-a:text-brand max-w-none text-left overflow-hidden', className].filter(Boolean).join(' ')}>
      <PortableText components={components} value={value} />
    </div>
  )
}
