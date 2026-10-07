'use client'

import {useEffect} from 'react'

const STORAGE_PREFIX = 'nws_viewed:'

function todayUtc() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Fires a fire-and-forget "view recorded" beacon for the Most Read panel,
 * at most once per article per browser per day (so refreshes don't inflate
 * the count).
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
        const key = `${STORAGE_PREFIX}${articleId}`
        const today = todayUtc()
        if (localStorage.getItem(key) === today) return

        fetch('/api/views', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({articleId}),
          keepalive: true,
        })
          .then((res) => {
            if (res.ok) localStorage.setItem(key, today)
          })
          .catch(() => {})
      } catch {
        // Tracking failures (or blocked storage) should never be visible to the reader.
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [articleId])

  return null
}
