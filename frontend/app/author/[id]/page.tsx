import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {PortableText} from '@portabletext/react'
import {formatDistanceToNow} from 'date-fns'
import {sanityFetch} from '@/sanity/lib/live'
import {authorByIdQuery, authorArticlesQuery} from '@/sanity/lib/queries'
import {urlForImage} from '@/sanity/lib/utils'
import {cleanCategorySlug} from '@/sanity/lib/cleanCategorySlug'

type Props = {
  params: Promise<{id: string}>
}

export const revalidate = 300
export const dynamicParams = true

const categoryLabels: Record<string, string> = {
  'world-exclusive': 'World',
  'india-exclusive': 'India',
  'osint-exclusive': 'OSINT',
  'commentary': 'Commentary',
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const {id} = await props.params
  const {data: author} = await sanityFetch({query: authorByIdQuery, params: {id}, stega: false})
  if (!author) return {}
  return {
    title: `${author.firstName} ${author.lastName} — NWS`,
    description: `Articles by ${author.firstName} ${author.lastName}${author.designation ? `, ${author.designation}` : ''}`,
  }
}

export default async function AuthorPage(props: Props) {
  const {id} = await props.params

  const [{data: author}, {data: articles}] = await Promise.all([
    sanityFetch({query: authorByIdQuery, params: {id}}),
    sanityFetch({query: authorArticlesQuery, params: {id}}),
  ])

  if (!author) return notFound()

  const pictureUrl = author.picture?.asset?._ref
    ? urlForImage(author.picture)?.width(320).height(320).fit('crop').url()
    : null

  const hasBio = !!(author.bio as any)?.length

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-[1366px] mx-auto px-4 py-12">

        {/* Author profile header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-4">
            {pictureUrl && (
              <div className="flex-shrink-0">
                <Image
                  src={pictureUrl}
                  alt={`${author.firstName} ${author.lastName}`}
                  width={120}
                  height={120}
                  className="rounded-full object-cover border-4 border-gray-100 shadow"
                />
              </div>
            )}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {author.firstName} {author.lastName}
              </h1>
              {author.designation && (
                <p className="text-red-600 font-semibold text-sm uppercase tracking-wide">
                  {author.designation}
                </p>
              )}
            </div>
          </div>
          {hasBio && (
            <div className="prose prose-gray max-w-none text-sm">
              <PortableText value={author.bio as any} />
            </div>
          )}
        </div>

        {/* Articles section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-black">
              Articles by {author.firstName}
            </h2>
            <div className="h-1 w-8 bg-red-600 rounded" />
          </div>

          {(!articles || articles.length === 0) ? (
            <p className="text-gray-500 text-center py-16">No articles published yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(articles as any[]).map((article) => {
                const coverBuilder = article.coverImage ? urlForImage(article.coverImage) : null
                const coverImageUrl = coverBuilder?.width(600).height(400).fit('crop').url()
                const categorySlug = article.category ? cleanCategorySlug(article.category) : 'posts'
                const categoryLabel = article.category ? (categoryLabels[article.category] || article.category) : ''
                const timeAgo = article.date
                  ? formatDistanceToNow(new Date(article.date), {addSuffix: true})
                  : ''

                return (
                  <Link
                    key={article._id}
                    href={`/${categorySlug}/${article.slug?.current}`}
                    className="group bg-white rounded-lg overflow-hidden border border-gray-200 flex flex-col hover:-translate-y-1 transition-transform duration-200 shadow-sm hover:shadow-md"
                  >
                    {/* Cover Image */}
                    {coverImageUrl ? (
                      <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
                        <Image
                          src={coverImageUrl}
                          alt={article.title || 'Article image'}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No image</span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex flex-col flex-1 p-5">
                      <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-1">
                        {article.excerpt || article.contentPreview || ''}
                      </p>
                      <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-100">
                        <span className="text-gray-400">{timeAgo}</span>
                        {categoryLabel && (
                          <span className="text-red-600 font-semibold uppercase tracking-wide">
                            {categoryLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
