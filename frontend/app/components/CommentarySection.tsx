import Link from 'next/link'
import Avatar from '@/app/components/Avatar'
import {SectionTitle} from '@/app/components/SectionTitle'
import {formatTimeAgo} from '@/lib/timeAgo'

interface CommentaryAuthor {
  slug?: string | null
  firstName: string
  lastName: string
  designation?: string | null
  picture?: any
  bio?: any
}

interface CommentaryArticle {
  _id: string
  title: string
  slug: {current: string}
  excerpt?: string | null
  contentPreview?: string
  date: string
  author?: CommentaryAuthor
  coAuthor?: CommentaryAuthor | null
}

interface CommentarySectionProps {
  articles: CommentaryArticle[]
}

function toAvatarPerson(person: CommentaryAuthor) {
  return {
    slug: person.slug ?? null,
    firstName: person.firstName ?? null,
    lastName: person.lastName ?? null,
    designation: person.designation ?? null,
    picture: person.picture,
    bio: person.bio,
  }
}

export function CommentarySection({articles}: CommentarySectionProps) {
  if (!articles || articles.length === 0) {
    return null
  }

  return (
    <section id="commentary" className="flex scroll-mt-6 flex-col gap-4">
      <div className="flex items-center justify-between border-t border-[#d0d2d6] pt-6">
        <SectionTitle headingClassName="text-[#1a1a1a]">Commentary</SectionTitle>
        <Link
          href="/commentary"
          className="mt-2 self-start border-b border-transparent text-base transition-colors hover:border-[#ed1c24] hover:text-[#ed1c24]"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 max-tablet:grid-cols-1">
        {articles.slice(0, 3).map((article) => (
          <article
            key={article._id}
            className="group rounded-2xl border border-[#dfe1e4] bg-white transition duration-200 hover:-translate-y-1 hover:border-[#c6c8cb] hover:shadow-[0_14px_35px_rgb(0_0_0/8%)] focus-within:-translate-y-1 focus-within:border-[#c6c8cb] focus-within:shadow-[0_14px_35px_rgb(0_0_0/8%)]"
          >
            <Link
              href={`/commentary/${article.slug.current}`}
              className="flex min-h-[275px] flex-col gap-4 p-4"
            >
              {article.author && (
                <Avatar
                  person={toAvatarPerson(article.author)}
                  coAuthor={article.coAuthor ? toAvatarPerson(article.coAuthor) : null}
                  showDesignation
                />
              )}

              <div className="flex flex-1 flex-col gap-2 text-base">
                <h3 className="line-clamp-3 text-base leading-normal font-bold">{article.title}</h3>
                <p className="line-clamp-4 leading-normal">
                  {article.excerpt || article.contentPreview}
                </p>
              </div>

              <p className="text-sm text-[#666]">{formatTimeAgo(article.date, {long: true})}</p>
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
