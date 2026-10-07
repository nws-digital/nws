import {MostReadPanel} from '@/app/components/MostReadPanel'
import {NwsOriginalsColumn} from '@/app/components/NwsOriginalsColumn'
import {FeaturedCarousel} from '@/app/components/FeaturedCarousel'
import {FeaturedPlaceholder} from '@/app/components/FeaturedPlaceholder'
import {CommentarySection} from '@/app/components/CommentarySection'
import {LatestArticles} from '@/app/components/LatestArticles'
import {
  featuredArticlesQuery,
  commentaryArticlesQuery,
  latestByCategoryQuery,
  originalsArticlesQuery,
} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'
import {withDefinedSlug} from '@/sanity/lib/utils'
import {getMostReadArticles} from '@/app/actions/mostRead'

export default async function Page() {
  const {data: featuredArticles} = await sanityFetch({
    query: featuredArticlesQuery,
  })

  const featuredList = (featuredArticles as any[]) || []
  const topFeaturedId = featuredList[0]?._id ?? ''

  const [
    {data: originalsArticles},
    {data: commentaryArticles},
    {data: worldArticles},
    {data: indiaArticles},
    mostReadArticles,
  ] = await Promise.all([
    sanityFetch({query: originalsArticlesQuery}),
    sanityFetch({query: commentaryArticlesQuery}),
    sanityFetch({
      query: latestByCategoryQuery,
      params: {category: 'world-exclusive', excludeId: topFeaturedId},
    }),
    sanityFetch({
      query: latestByCategoryQuery,
      params: {category: 'india-exclusive', excludeId: topFeaturedId},
    }),
    getMostReadArticles(),
  ])

  const originals = withDefinedSlug(originalsArticles || [])
  const hasOriginals = originals.length > 0

  return (
    <div className="font-literata">
      {/* Hero: NWS Originals | Featured carousel | Most Read */}
      <section id="nws-originals" className="border-b border-[#d0d0d0] pt-6 pb-8">
        <div
          className={`shell grid gap-6 max-tablet:flex max-tablet:flex-col ${
            hasOriginals
              ? 'grid-cols-[minmax(240px,1fr)_minmax(440px,2fr)_minmax(240px,1fr)] max-wide:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)]'
              : 'grid-cols-[minmax(440px,2fr)_minmax(240px,1fr)] max-wide:grid-cols-1'
          }`}
        >
          <NwsOriginalsColumn articles={originals} />

          <div className="min-w-0 self-center max-tablet:order-first max-tablet:self-auto">
            {featuredList.length > 0 ? (
              <FeaturedCarousel articles={featuredList} />
            ) : (
              <FeaturedPlaceholder />
            )}
          </div>

          <MostReadPanel articles={mostReadArticles} />
        </div>
      </section>

      <div className="shell flex flex-col gap-6 py-6">
        <LatestArticles
          worldArticles={withDefinedSlug(worldArticles || [])}
          indiaArticles={withDefinedSlug(indiaArticles || [])}
        />
        <CommentarySection articles={withDefinedSlug(commentaryArticles || [])} />
      </div>
    </div>
  )
}
