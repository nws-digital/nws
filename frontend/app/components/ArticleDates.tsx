import {format, formatDistanceToNow, parseISO} from 'date-fns'

interface ArticleDatesProps {
  date: string
  lastPublishedDate?: string
  showRelative?: boolean
  className?: string
}

export function ArticleDates({
  date,
  lastPublishedDate,
  showRelative = false,
  className = '',
}: ArticleDatesProps) {
  const published = parseISO(date)
  const lastPublished = lastPublishedDate ? parseISO(lastPublishedDate) : null

  // Check if article was re-published (dates are different)
  const wasRepublished = lastPublished && date !== lastPublishedDate

  const formatDate = (dateObj: Date) => {
    return format(dateObj, 'MMMM d, yyyy \'at\' h:mm a')
  }

  const getRelativeTime = (dateObj: Date) => {
    return formatDistanceToNow(dateObj, {addSuffix: true})
  }

  return (
    <div className={`text-sm text-gray-600 ${className}`}>
      <div>
        <span className="font-medium italic">Published on </span>{' '}
        {showRelative ? (
          <time className="italic" dateTime={date} title={formatDate(published)}>
            {getRelativeTime(published)}
          </time>
        ) : (
          <time className="italic" dateTime={date}>{formatDate(published)}</time>
        )}
      </div>
      
      {wasRepublished && (
        <div className="mt-1">
          <span className="font-medium italic">Last Edited on</span>{' '}
          {showRelative ? (
            <time className="italic" dateTime={lastPublishedDate} title={formatDate(lastPublished!)}>
              {getRelativeTime(lastPublished!)}
            </time>
          ) : (
            <time className="italic" dateTime={lastPublishedDate}>{formatDate(lastPublished!)}</time>
          )}
        </div>
      )}
    </div>
  )
}
