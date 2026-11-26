'use client'

import {useState} from 'react'
import {Image} from 'next-sanity/image'

import {urlForImage} from '@/sanity/lib/utils'
import DateComponent from '@/app/components/Date'
import {AuthorBioDialog} from './AuthorBioDialog'

type Props = {
  person: {
    _id?: string | null
    slug?: string | null
    firstName: string | null
    lastName: string | null
    designation?: string | null
    picture?: any
    bio?: any
  }
  coAuthor?: {
    _id?: string | null
    slug?: string | null
    firstName: string | null
    lastName: string | null
    designation?: string | null
    picture?: any
    bio?: any
  } | null
  date?: string
  small?: boolean
  interactive?: boolean
  showDesignation?: boolean
}

export default function Avatar({
  person,
  coAuthor,
  date,
  small = false,
  interactive = true,
  showDesignation = false,
}: Props) {
  const {firstName, lastName, designation, picture, bio} = person
  const [showBio, setShowBio] = useState(false)
  const [showCoAuthorBio, setShowCoAuthorBio] = useState(false)
  const hasBio = interactive && bio && Array.isArray(bio) && bio.length > 0
  const coAuthorHasBio = interactive && coAuthor?.bio && Array.isArray(coAuthor.bio) && coAuthor.bio.length > 0

  const hasCoAuthorPicture = Boolean(coAuthor?.picture?.asset?._ref)
  const avatarSize = small ? 'h-12 w-12' : 'h-16 w-16'
  const overlapOffset = small ? 'left-7' : 'left-10'
  // Stack width = overlap offset + one avatar's width, so the container's own box
  // actually spans the second (overflowing) avatar instead of just the first one.
  const stackWidth = small ? 'w-[4.75rem]' : 'w-[6.5rem]'

  return (
    <>
      <div className="flex items-center">
        {picture?.asset?._ref || hasCoAuthorPicture ? (
          <div
            className={`relative flex-shrink-0 ${small ? 'h-12' : 'h-16'} ${
              hasCoAuthorPicture ? `${stackWidth} ${small ? 'mr-3' : 'mr-4'}` : `${avatarSize} ${small ? 'mr-3' : 'mr-4'}`
            }`}
          >
            {picture?.asset?._ref && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (hasBio) setShowBio(true)
                }}
                disabled={!hasBio}
                className={`absolute left-0 top-0 ${avatarSize} rounded-full ring-2 ring-white ${
                  hasCoAuthorPicture ? 'z-10' : ''
                } ${
                  hasBio
                    ? 'cursor-pointer hover:z-20 hover:ring-red-500 transition-all duration-200 hover:scale-105'
                    : ''
                }`}
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
            )}
            {hasCoAuthorPicture && coAuthor && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (coAuthorHasBio) setShowCoAuthorBio(true)
                }}
                disabled={!coAuthorHasBio}
                className={`absolute top-0 ${overlapOffset} ${avatarSize} z-20 rounded-full ring-2 ring-white ${
                  coAuthorHasBio
                    ? 'cursor-pointer hover:z-30 hover:ring-red-500 transition-all duration-200 hover:scale-105'
                    : ''
                }`}
                aria-label={
                  coAuthorHasBio
                    ? `View ${coAuthor.firstName} ${coAuthor.lastName}'s bio`
                    : undefined
                }
              >
                <Image
                  alt={coAuthor.picture?.alt || ''}
                  className="h-full w-full rounded-full object-cover"
                  height={small ? 56 : 72}
                  width={small ? 56 : 72}
                  src={
                    urlForImage(coAuthor.picture)
                      ?.height(small ? 112 : 144)
                      .width(small ? 112 : 144)
                      .fit('crop')
                      .url() as string
                  }
                />
              </button>
            )}
          </div>
        ) : (
          <div className="mr-1"></div>
        )}
        <div className="flex flex-col">
          {firstName && lastName && (
            <div className={`font-semibold ${small ? 'text-sm' : 'text-base'}`}>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (hasBio) setShowBio(true)
                }}
                disabled={!hasBio}
                className={`${
                  hasBio ? 'hover:text-red-600 cursor-pointer transition-colors duration-200' : ''
                }`}
                aria-label={hasBio ? `View ${firstName} ${lastName}'s bio` : undefined}
              >
                {firstName} {lastName}
              </button>
              {coAuthor?.firstName && coAuthor?.lastName && (
                <>
                  {' '}
                  <span className="font-normal text-gray-500">and</span>{' '}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (coAuthorHasBio) setShowCoAuthorBio(true)
                    }}
                    disabled={!coAuthorHasBio}
                    className={`${
                      coAuthorHasBio
                        ? 'hover:text-red-600 cursor-pointer transition-colors duration-200'
                        : ''
                    }`}
                    aria-label={
                      coAuthorHasBio
                        ? `View ${coAuthor.firstName} ${coAuthor.lastName}'s bio`
                        : undefined
                    }
                  >
                    {coAuthor.firstName} {coAuthor.lastName}
                  </button>
                </>
              )}
            </div>
          )}
          {showDesignation && designation && (
            <div className={`text-gray-500 ${small ? 'text-xs' : 'text-sm'}`}>{designation}</div>
          )}
          {date && (
            <div className={`text-gray-500 ${small ? 'text-xs' : 'text-sm'}`}>
              <DateComponent dateString={date} />
            </div>
          )}
        </div>
      </div>

      {hasBio && (
        <AuthorBioDialog isOpen={showBio} onClose={() => setShowBio(false)} person={person} authorSlug={person.slug ?? undefined} />
      )}

      {coAuthorHasBio && coAuthor && (
        <AuthorBioDialog
          isOpen={showCoAuthorBio}
          onClose={() => setShowCoAuthorBio(false)}
          person={coAuthor}
          authorSlug={coAuthor.slug ?? undefined}
        />
      )}
    </>
  )
}
