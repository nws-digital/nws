'use client'

import {useEffect, useRef} from 'react'
import {PortableText} from '@portabletext/react'
import {Image} from 'next-sanity/image'
import {urlForImage} from '@/sanity/lib/utils'

type Props = {
  isOpen: boolean
  onClose: () => void
  person: {
    firstName: string | null
    lastName: string | null
    designation?: string | null
    picture?: any
    bio?: any
  }
}

export function AuthorBioDialog({isOpen, onClose, person}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [isOpen])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleClick = (e: MouseEvent) => {
      const rect = dialog.getBoundingClientRect()
      const isInDialog =
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width

      if (!isInDialog) {
        e.preventDefault()
        e.stopPropagation()
        onClose()
      }
    }

    dialog.addEventListener('click', handleClick)
    return () => dialog.removeEventListener('click', handleClick)
  }, [onClose])

  if (!person.bio) return null

  return (
    <dialog
      ref={dialogRef}
      className="backdrop:bg-black/40 backdrop:backdrop-blur-[2px] p-0 m-auto rounded-lg shadow-2xl max-w-2xl w-full border-0"
      onClose={onClose}
    >
      <div className="bg-white rounded-lg overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-gray-100 to-gray-50 p-6 border-b border-gray-200">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onClose()
            }}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close dialog"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="flex items-center gap-4">
            {person.picture?.asset?._ref && (
              <div className="flex-shrink-0">
                <Image
                  alt={person.picture?.alt || ''}
                  className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-lg"
                  height={160}
                  width={160}
                  src={
                    urlForImage(person.picture)
                      ?.height(160)
                      .width(160)
                      .fit('crop')
                      .url() as string
                  }
                />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {person.firstName} {person.lastName}
              </h2>
              {person.designation && (
                <p className="text-sm text-gray-600 mt-1">{person.designation}</p>
              )}
            </div>
          </div>
        </div>

        {/* Bio Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="prose prose-gray max-w-none">
            <PortableText value={person.bio} />
          </div>
        </div>
      </div>
    </dialog>
  )
}
