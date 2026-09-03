import Link from 'next/link'
import {Image} from 'next-sanity/image'
import {PortableText} from '@portabletext/react'
import {urlForImage} from '@/sanity/lib/utils'

type Person = {
  firstName: string | null
  lastName: string | null
  designation?: string | null
  picture?: any
  bio?: any
  slug?: string | null
}

type Props = {
  author: Person | null
  coAuthor?: Person | null
}

function AuthorCard({person, label}: {person: Person; label: string}) {
  const hasBio = Array.isArray(person.bio) && person.bio.length > 0
  const imageUrl = person.picture?.asset?._ref
    ? urlForImage(person.picture)?.height(160).width(160).fit('crop').url()
    : null

  return (
    <div className="relative">
      <span className="absolute -top-3 left-4 rounded bg-black px-3 py-1 text-xs font-semibold text-white">
        {label}
      </span>
      <div className="flex gap-4 rounded-lg bg-gray-50 p-6 pt-8">
        {imageUrl && (
          <div className="flex-shrink-0">
            <Image
              alt={person.picture?.alt || ''}
              className="h-16 w-16 rounded-full object-cover"
              height={128}
              width={128}
              src={imageUrl}
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-gray-900">
            {person.firstName} {person.lastName}
          </h3>
          {hasBio && (
            <div className="mt-1 text-sm leading-relaxed text-gray-700">
              <PortableText value={person.bio} />
            </div>
          )}
          {person.slug && (
            <Link
              href={`/author/${person.slug}`}
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-gray-700 transition-colors hover:text-red-600"
            >
              Know More
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ArticleAuthors({author, coAuthor}: Props) {
  if (!author?.firstName || !author?.lastName) return null

  return (
    <div className="mt-12 border-t border-dashed border-gray-300 pt-8">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Authors</h2>
      <div className="space-y-6">
        <AuthorCard person={author} label="Author" />
        {coAuthor?.firstName && coAuthor?.lastName && (
          <AuthorCard person={coAuthor} label="Co-Author" />
        )}
      </div>
    </div>
  )
}
