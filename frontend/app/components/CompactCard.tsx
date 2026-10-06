import Image from 'next/image'
import Link from 'next/link'
import {urlForImage} from '@/sanity/lib/utils'
import {categoryToUrlSlug} from '@/sanity/lib/cleanCategorySlug'
import {CATEGORY_LABELS} from '@/lib/constants'
import {formatTimeAgo} from '@/lib/timeAgo'

export interface CompactCardArticle {
  _id: string
  title: string
  slug: {current: string}
  category?: string
  date?: string
  coverImage?: any
}

// Small story card used in the "NWS Originals" and "Most Read" columns of the home hero
export function CompactCard({article}: {article: CompactCardArticle}) {
  const imageUrl = article.coverImage
    ? urlForImage(article.coverImage)?.width(600).height(400).fit('crop').url()
    : null
  const categoryLabel = article.category ? CATEGORY_LABELS[article.category] || article.category : ''

  return (
    <article className="group overflow-hidden rounded-2xl border border-[#dfe1e4] bg-white transition duration-200 hover:-translate-y-1 hover:border-[#c6c8cb] hover:shadow-[0_14px_35px_rgb(0_0_0/8%)] focus-within:-translate-y-1 focus-within:border-[#c6c8cb] focus-within:shadow-[0_14px_35px_rgb(0_0_0/8%)] max-phone:grid max-phone:grid-cols-[118px_minmax(0,1fr)]">
      <Link
        href={`/${categoryToUrlSlug(article.category || '')}/${article.slug.current}`}
        className="contents"
      >
        <div className="relative h-[150px] overflow-hidden bg-[#eee] max-tablet:h-[135px] max-phone:h-full max-phone:min-h-[140px]">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={article.title}
              fill
              sizes="(max-width: 520px) 118px, (max-width: 1100px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"
            />
          )}
        </div>
        <div className="flex flex-col gap-2 p-4 max-phone:justify-center max-phone:p-3.5">
          <h3 className="text-base font-bold leading-normal max-phone:text-sm">{article.title}</h3>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 whitespace-nowrap text-xs text-[#666] max-phone:gap-x-[5px]">
            {article.date && <span>{formatTimeAgo(article.date)}</span>}
            {article.date && categoryLabel && <span className="text-[#d0d2d6]">|</span>}
            {categoryLabel && <span>{categoryLabel}</span>}
          </div>
        </div>
      </Link>
    </article>
  )
}
