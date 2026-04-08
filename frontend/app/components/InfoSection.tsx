import {type PortableTextBlock} from 'next-sanity'

import PortableText from '@/app/components/PortableText'
import {InfoSection} from '@/sanity.types'

type InfoProps = {
  block: InfoSection
  index: number
}

export default function CTA({block}: InfoProps) {
  return (
    <div className="max-w-[1366px] mx-auto px-4 my-12">
      <div className="w-full">
        {block?.heading && (
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold">{block.heading}</h2>
        )}
        {block?.subheading && (
          <span className="block mt-3 mb-6 text-base uppercase font-light text-gray-900/70">
            {block.subheading}
          </span>
        )}
        <div className="mt-4">
          {block?.content?.length && (
            <PortableText className="" value={block.content as PortableTextBlock[]} />
          )}
        </div>
      </div>
    </div>
  )
}
