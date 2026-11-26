// Shared, client-safe YouTube helpers.

// Keep in sync with YOUTUBE_ID_PATTERN in studio/src/schemaTypes/documents/video.ts
const YOUTUBE_ID_PATTERN =
  /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?(?:.*&)?v=))([\w-]{11})/

export const YOUTUBE_ID_FORMAT = /^[\w-]{11}$/

/** Extracts the 11-character video ID from any common YouTube link, or null. */
export function getYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null
  return url.match(YOUTUBE_ID_PATTERN)?.[1] ?? null
}

export function youtubeWatchUrl(id: string) {
  return `https://www.youtube.com/watch?v=${id}`
}

/** Privacy-enhanced embed URL (no tracking cookies until the viewer presses play). */
export function youtubeEmbedUrl(id: string, {autoplay = false}: {autoplay?: boolean} = {}) {
  const params = new URLSearchParams({rel: '0', playsinline: '1'})
  if (autoplay) params.set('autoplay', '1')
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`
}
