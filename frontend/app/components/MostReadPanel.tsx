import {CompactCard} from '@/app/components/CompactCard'
import {SectionTitle} from '@/app/components/SectionTitle'
import {MostReadModal} from '@/app/components/MostReadModal'
import type {MostReadArticle} from '@/app/actions/mostRead'

const VISIBLE_COUNT = 2
const MODAL_COUNT = 10

export function MostReadPanel({articles}: {articles: MostReadArticle[]}) {
  if (!articles || articles.length === 0) return null

  return (
    <div className="flex min-w-0 flex-col gap-6 wide:col-auto max-wide:col-span-full">
      <div className="flex w-full items-start justify-between">
        <SectionTitle>Most Read</SectionTitle>
        <MostReadModal articles={articles.slice(0, MODAL_COUNT)} />
      </div>
      <div className="flex flex-col gap-6 max-wide:grid max-wide:grid-cols-2 max-wide:gap-4 max-phone:flex max-phone:flex-col">
        {articles.slice(0, VISIBLE_COUNT).map((article) => (
          <CompactCard key={article._id} article={article} />
        ))}
      </div>
    </div>
  )
}
