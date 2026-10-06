import {CompactCard} from '@/app/components/CompactCard'
import {SectionTitle} from '@/app/components/SectionTitle'
import type {MostReadArticle} from '@/app/actions/mostRead'

const VISIBLE_COUNT = 2

export function MostReadPanel({articles}: {articles: MostReadArticle[]}) {
  if (!articles || articles.length === 0) return null

  return (
    <div className="flex min-w-0 flex-col gap-6 wide:col-auto max-wide:col-span-full">
      <SectionTitle>Most Read</SectionTitle>
      <div className="flex flex-col gap-6 max-wide:grid max-wide:grid-cols-2 max-wide:gap-4 max-phone:flex max-phone:flex-col">
        {articles.slice(0, VISIBLE_COUNT).map((article) => (
          <CompactCard key={article._id} article={article} />
        ))}
      </div>
    </div>
  )
}
