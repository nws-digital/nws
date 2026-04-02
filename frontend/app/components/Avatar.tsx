'use client'

import {useState} from 'react'
import {Image} from 'next-sanity/image'

import {urlForImage} from '@/sanity/lib/utils'
import DateComponent from '@/app/components/Date'
import {AuthorBioDialog} from './AuthorBioDialog'

type Props = {
  person: {
    firstName: string | null
    lastName: string | null
    designation?: string | null
    picture?: any
    bio?: any
  }
  date?: string
  small?: boolean
}

export default function Avatar({person, date, small = false}: Props) {
  const {firstName, lastName, designation, picture, bio} = person
  const [showBio, setShowBio] = useState(false)
  const hasBio = bio && Array.isArray(bio) && bio.length > 0

  return (
    <>
      <div className="flex items-center">
        {picture?.asset?._ref ? (
          <div className={`${small ? 'h-12 w-12 mr-3' : 'h-16 w-16 mr-4'}`}>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (hasBio) setShowBio(true)
              }}
              disabled={!hasBio}
              className={`h-full w-full ${
                hasBio
                  ? 'cursor-pointer hover:ring-2 hover:ring-red-500 hover:ring-offset-2 transition-all duration-200 hover:scale-105'
                  : ''
              } rounded-full`}
              aria-label={hasBio ? `View ${firstName} ${lastName}'s bio` : undefined}
            >
              <Image
                alt={picture?.alt || ''}
                className="h-full w-full rounded-full object-cover"
                height={small ? 56 : 72}
                width={small ? 56 : 72}
                src={
                  urlForImage(picture)
                    ?.height(small ? 112 : 144)
                    .width(small ? 112 : 144)
                    .fit('crop')
                    .url() as string
                }
              />
            </button>
          </div>
        ) : (
          <div className="mr-1"></div>
        )}
        <div className="flex flex-col">
          {firstName && lastName && (
            <div className="author-meta">
              {firstName} {lastName}
            </div>
          )}
          {date && (
            <div className="author-meta">
              <DateComponent dateString={date} />
            </div>
          )}
        </div>
      </div>

      {hasBio && (
        <AuthorBioDialog isOpen={showBio} onClose={() => setShowBio(false)} person={person} />
      )}
    </>
  )
}
