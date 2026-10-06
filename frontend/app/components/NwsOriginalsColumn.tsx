import {CompactCard, type CompactCardArticle} from '@/app/components/CompactCard'
import {SectionTitle} from '@/app/components/SectionTitle'

export function NwsOriginalsColumn({articles}: {articles: CompactCardArticle[]}) {
  if (!articles || articles.length === 0) return null

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <SectionTitle>NWS Originals</SectionTitle>
      <div className="flex flex-col gap-6 max-tablet:grid max-tablet:grid-cols-2 max-tablet:gap-4 max-phone:flex max-phone:flex-col">
        {articles.map((article) => (
          <CompactCard key={article._id} article={article} />
        ))}
      </div>
    </div>
  )
}
