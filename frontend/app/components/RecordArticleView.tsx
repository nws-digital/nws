'use client'

import {useEffect} from 'react'

const VISITOR_COOKIE = 'nws_vid'
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

function getOrCreateVisitorId() {
  const match = document.cookie.match(new RegExp(`(?:^|; )${VISITOR_COOKIE}=([^;]*)`))
  if (match) return decodeURIComponent(match[1])

  const id = crypto.randomUUID()
  document.cookie = `${VISITOR_COOKIE}=${id}; path=/; max-age=${VISITOR_COOKIE_MAX_AGE}; samesite=lax`
  return id
}

/**
 * Fires a fire-and-forget "view recorded" beacon for the Most Read panel.
 * Deliberately a client component mounted inside the (statically
 * generated, ISR) article page -- recording this during server render
 * would fire on prerender/revalidation, not real visits.
 */
export function RecordArticleView({articleId}: {articleId: string}) {
  useEffect(() => {
    if (!articleId) return

    // Small delay so a bounce (closed tab immediately) doesn't count as a read.
    const timer = setTimeout(() => {
      try {
        const visitorId = getOrCreateVisitorId()
        fetch('/api/views', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({articleId, visitorId}),
          keepalive: true,
        }).catch(() => {})
      } catch {
        // Tracking failures should never be visible to the reader.
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [articleId])

  return null
}
