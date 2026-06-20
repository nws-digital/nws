'use client'

import { useEffect, useRef } from 'react'
import Script from 'next/script'

export default function TweetEmbed({ id }: { id: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const twttr = (window as any).twttr
    if (twttr?.widgets) {
      twttr.widgets.load(ref.current)
    }
  }, [id])

  return (
    <>
      <div ref={ref} className="flex justify-center">
        <blockquote className="twitter-tweet">
          <a href={`https://x.com/i/status/${id}`} />
        </blockquote>
      </div>
      <Script
        src="https://platform.x.com/widgets.js"
        strategy="lazyOnload"
        onLoad={() => {
          const twttr = (window as any).twttr
          if (ref.current && twttr?.widgets) {
            twttr.widgets.load(ref.current)
          }
        }}
      />
    </>
  )
}
