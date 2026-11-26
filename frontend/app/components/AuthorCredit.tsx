import {urlForImage} from '@/sanity/lib/utils'

// Shared "author credit" strip used on every NWS Originals card:
//   [avatar] By <Name>, <Country>
// and, when a story has a co-author, both people side by side with
// overlapping avatars:
//   [avatar][avatar] By <Name 1>, <Country 1> & <Name 2>, <Country 2>
//
// Rendered only for category === 'osint-exclusive' (displayed as "NWS Originals").

export interface AuthorCreditPerson {
  firstName?: string
  lastName?: string
  country?: string
  picture?: any
}

interface AuthorCreditProps {
  author?: AuthorCreditPerson | null
  coAuthor?: AuthorCreditPerson | null
  category?: string
  /** Avatar diameter in px. Defaults to 20 (compact cards); use 28+ on bigger cards. */
  avatarSize?: number
  className?: string
}

function fullName(p?: AuthorCreditPerson | null): string | null {
  if (!p?.firstName || !p?.lastName) return null
  return `${p.firstName} ${p.lastName}`
}

/** True when there's at least one named author/co-author to credit on this NWS Original. */
export function hasAuthorCredit(
  author?: AuthorCreditPerson | null,
  coAuthor?: AuthorCreditPerson | null,
  category?: string
): boolean {
  if (category !== 'osint-exclusive') return false
  return Boolean(fullName(author) || fullName(coAuthor))
}

function avatarUrl(p: AuthorCreditPerson, size: number): string | null {
  if (!p.picture) return null
  return urlForImage(p.picture)?.width(size * 2).height(size * 2).fit('crop').url() || null
}

export function AuthorCredit({
  author,
  coAuthor,
  category,
  avatarSize = 20,
  className = '',
}: AuthorCreditProps) {
  // Only NWS Originals stories carry a byline credit.
  if (category !== 'osint-exclusive') return null

  const people = [
    author && fullName(author) ? {...author, name: fullName(author)!} : null,
    coAuthor && fullName(coAuthor) ? {...coAuthor, name: fullName(coAuthor)!} : null,
  ].filter((p): p is AuthorCreditPerson & {name: string} => p !== null)

  if (people.length === 0) return null

  return (
    <div className={`flex items-center gap-1.5 min-w-0 ${className}`}>
      {/* Avatar(s) -- stacked/overlapping when there's a co-author */}
      <div className="flex flex-shrink-0 -space-x-2">
        {people.map((p, i) => {
          const url = avatarUrl(p, avatarSize)
          return url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={url}
              alt={p.name}
              width={avatarSize}
              height={avatarSize}
              className="rounded-full border border-white object-cover ring-1 ring-gray-100"
              style={{width: avatarSize, height: avatarSize}}
            />
          ) : (
            <div
              key={i}
              className="flex items-center justify-center rounded-full border border-white bg-gray-200 text-gray-500 ring-1 ring-gray-100"
              style={{width: avatarSize, height: avatarSize, fontSize: avatarSize * 0.4}}
            >
              {p.name.charAt(0)}
            </div>
          )
        })}
      </div>

      {/* Name(s) + country, in "pic, name, country" reading order */}
      <span className="truncate text-inherit">
        By{' '}
        {people.map((p, i) => (
          <span key={i}>
            {p.name}
            {p.country ? `, ${p.country}` : ''}
            {i < people.length - 1 ? ' & ' : ''}
          </span>
        ))}
      </span>
    </div>
  )
}
