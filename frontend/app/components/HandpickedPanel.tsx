import Link from 'next/link'
import {CompactCard} from '@/app/components/CompactCard'
import {SectionTitle} from '@/app/components/SectionTitle'
import {moreLinkClass} from '@/app/components/MoreLink'
import type {HandpickedArticle} from '@/app/actions/handpicked'

const VISIBLE_COUNT = 2

export function HandpickedPanel({
  articles,
  excludeIds = [],
}: {
  articles: HandpickedArticle[]
  excludeIds?: string[]
}) {
  // Skip articles already shown elsewhere in the hero; /hand-picked lists them all
  const excluded = new Set(excludeIds)
  const visible = (articles || []).filter((article) => !excluded.has(article._id)).slice(0, VISIBLE_COUNT)
  if (visible.length === 0) return null

  return (
    <div className="flex min-w-0 flex-col gap-6 wide:col-auto max-wide:col-span-full">
      <div className="flex w-full items-start justify-between">
        <SectionTitle>Hand-Picked</SectionTitle>
        <Link href="/hand-picked" className={moreLinkClass}>
          More
        </Link>
      </div>
      <div className="flex flex-col gap-6 max-wide:grid max-wide:grid-cols-2 max-wide:gap-4 max-phone:flex max-phone:flex-col">
        {visible.map((article) => (
          <CompactCard key={article._id} article={article} />
        ))}
      </div>
    </div>
  )
}
