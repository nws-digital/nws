import Image from 'next/image'
import Link from 'next/link'
import {urlForImage} from '@/sanity/lib/utils'
import {categoryToUrlSlug} from '@/sanity/lib/cleanCategorySlug'
import {CATEGORY_LABELS} from '@/lib/constants'
import {formatTimeAgo} from '@/lib/timeAgo'
import {SectionTitle} from '@/app/components/SectionTitle'

interface LatestArticle {
  _id: string
  title: string
  slug: {current: string}
  excerpt?: string | null
  contentPreview?: string
  date: string
  category?: string
  coverImage?: any
}

interface LatestArticlesProps {
  worldArticles: LatestArticle[]
  indiaArticles: LatestArticle[]
}

function StoryCard({article}: {article: LatestArticle}) {
  const imageUrl = article.coverImage
    ? urlForImage(article.coverImage)?.width(800).height(500).fit('crop').url()
    : null
  const categoryLabel = article.category ? CATEGORY_LABELS[article.category] || article.category : ''
  const description = article.excerpt || article.contentPreview

  return (
    <article className="group overflow-hidden rounded-2xl border border-[#dfe1e4] bg-white transition duration-200 hover:-translate-y-1 hover:border-[#c6c8cb] hover:shadow-[0_14px_35px_rgb(0_0_0/8%)] focus-within:-translate-y-1 focus-within:border-[#c6c8cb] focus-within:shadow-[0_14px_35px_rgb(0_0_0/8%)]">
      <Link
        href={`/${categoryToUrlSlug(article.category || '')}/${article.slug.current}`}
        className="flex h-full min-h-[392px] flex-col max-wide:min-h-[430px] max-tablet:min-h-0"
      >
        <div className="relative min-h-[190px] flex-1 overflow-hidden bg-[#eee] max-tablet:h-[clamp(210px,56vw,330px)] max-tablet:flex-none">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={article.title}
              fill
              sizes="(max-width: 780px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"
            />
          )}
        </div>
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-2 text-base">
            <h3 className="line-clamp-3 text-base leading-normal font-bold">{article.title}</h3>
            {description && <p className="line-clamp-3 leading-normal">{description}</p>}
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap text-sm text-[#666]">
            <span>{formatTimeAgo(article.date)}</span>
            {categoryLabel && (
              <>
                <span className="text-[#d0d2d6]">|</span>
                <span>{categoryLabel}</span>
              </>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}

function StorySection({
  id,
  title,
  href,
  articles,
}: {
  id: string
  title: string
  href: string
  articles: LatestArticle[]
}) {
  const stories = articles.filter((article) => article.slug?.current).slice(0, 3)
  if (stories.length === 0) return null

  return (
    <section id={id} className="flex scroll-mt-6 flex-col gap-4">
      <div className="flex items-center justify-between py-2">
        <h3 className="text-2xl font-bold text-[#666] max-phone:text-[22px]">{title}</h3>
        <Link
          href={href}
          className="border-b border-transparent text-base transition-colors hover:border-[#ed1c24] hover:text-[#ed1c24]"
        >
          View All
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-4 max-tablet:grid-cols-1">
        {stories.map((article) => (
          <StoryCard key={article._id} article={article} />
        ))}
      </div>
    </section>
  )
}

export function LatestArticles({worldArticles, indiaArticles}: LatestArticlesProps) {
  if (!worldArticles?.length && !indiaArticles?.length) return null

  return (
    <>
      <SectionTitle className="scroll-mt-6" headingClassName="text-2xl text-[#1a1a1a]">
        Latest
      </SectionTitle>
      <StorySection id="world" title="World" href="/world" articles={worldArticles || []} />
      <StorySection id="india" title="India" href="/india" articles={indiaArticles || []} />
    </>
  )
}
