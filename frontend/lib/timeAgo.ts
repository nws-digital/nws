const MINUTE = 60
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

function plural(value: number, unit: string) {
  return `${value} ${unit}${value === 1 ? '' : 's'} ago`
}

/**
 * Relative time as used in the home page design: "15 hrs ago" (short) or
 * "2 hours ago" (long, used on commentary cards).
 */
export function formatTimeAgo(date: string | Date, {long = false}: {long?: boolean} = {}): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 1000))

  if (seconds < MINUTE) return 'Just now'
  if (seconds < HOUR) return plural(Math.floor(seconds / MINUTE), long ? 'minute' : 'min')
  if (seconds < DAY) return plural(Math.floor(seconds / HOUR), long ? 'hour' : 'hr')
  if (seconds < 30 * DAY) return plural(Math.floor(seconds / DAY), 'day')
  if (seconds < 365 * DAY) return plural(Math.floor(seconds / (30 * DAY)), 'month')
  return plural(Math.floor(seconds / (365 * DAY)), 'year')
}
