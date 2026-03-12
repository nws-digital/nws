export default function DateComponent({dateString}: {dateString: string | undefined}) {
  if (!dateString) {
    return null
  }

  const date = new Date(dateString)
  
  // Format date in IST
  const istFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  
  // Format and remove "at" if present
  const formattedDate = istFormatter.format(date).replace(' at ', ' ')
  
  return (
    <time dateTime={dateString} className="">
      {formattedDate} IST
    </time>
  )
}
