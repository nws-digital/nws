import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {VideoGallery} from '@/app/components/VideoGallery'
import {loadVideos} from '@/app/actions/videos'

export const metadata: Metadata = {
  title: 'Videos',
  description: 'Documentaries and video reports from NWS.',
}

// Refresh periodically so newly added videos show up without a deploy.
export const revalidate = 300

const PAGE_SIZE = 12

export default async function VideosPage() {
  const {videos, total} = await loadVideos('', 0, PAGE_SIZE)
  // Hidden until editors publish the first video (the nav links are hidden too)
  if (total === 0) notFound()

  return (
    <div className="min-h-screen bg-white">
      <VideoGallery initialVideos={videos} initialTotal={total} pageSize={PAGE_SIZE} />
    </div>
  )
}
