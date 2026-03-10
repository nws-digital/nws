import {stegaClean} from '@sanity/client/stega'
import {Image} from 'next-sanity/image'
import {getImageDimensions} from '@sanity/asset-utils'
import {urlForImage} from '@/sanity/lib/utils'

interface CoverImageProps {
  image: any
  priority?: boolean
}

export default function CoverImage(props: CoverImageProps) {
  const {image: source, priority} = props
  const image = source?.asset?._ref ? (
    <Image
      className="object-cover"
      // className="object-cover rounded-lg"
      width={getImageDimensions(source).width}
      height={getImageDimensions(source).height}
      alt={stegaClean(source?.alt) || ''}
      src={urlForImage(source)?.url() as string}
      priority={priority}
    />
  ) : null

  const caption = source?.caption ? stegaClean(source.caption) : null

  return (
    <figure>
      <div className="relative">{image}</div>
      {caption && <figcaption className="mt-2 text-md text-gray-500 italic">{caption}</figcaption>}
    </figure>
  )
}
