import Link from 'next/link'

import {sanityFetch} from '@/sanity/lib/live'
import {morePostsQuery, allPostsQuery} from '@/sanity/lib/queries'
import {Post as PostType, AllPostsQueryResult} from '@/sanity.types'
import DateComponent from '@/app/components/Date'
import OnBoarding from '@/app/components/Onboarding'
import Avatar from '@/app/components/Avatar'
import {createDataAttribute} from 'next-sanity'

const Post = ({post}: {post: AllPostsQueryResult[number]}) => {
  const {_id, title, slug, excerpt, date, author} = post

  const attr = createDataAttribute({
    id: _id,
    type: 'post',
    path: 'title',
  })

  const authorForAvatar =
    author && typeof author === 'object' && 'firstName' in author && 'lastName' in author
      ? {
          firstName: (author as any).firstName ?? null,
          lastName: (author as any).lastName ?? null,
          picture: 'picture' in author ? (author as any).picture : undefined,
        }
      : null

  const coAuthor = (post as any).coAuthor
  const coAuthorForAvatar =
    coAuthor && typeof coAuthor === 'object' && 'firstName' in coAuthor && 'lastName' in coAuthor
      ? {
          firstName: (coAuthor as any).firstName ?? null,
          lastName: (coAuthor as any).lastName ?? null,
          picture: 'picture' in coAuthor ? (coAuthor as any).picture : undefined,
        }
      : null

  return (
    <article
      data-sanity={attr()}
      key={_id}
      className="border border-gray-200 rounded-sm p-6 bg-gray-50 flex flex-col justify-between transition-colors hover:bg-white relative"
    >
      <Link className="hover:text-brand underline transition-colors" href={`/posts/${slug}`}>
        <span className="absolute inset-0 z-10" />
      </Link>
      <div>
        <h3 className="text-2xl font-bold mb-4 leading-tight">{title}</h3>

        <p className="line-clamp-3 text-sm leading-6 text-gray-600 max-w-[70ch]">{excerpt}</p>
      </div>
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
        {authorForAvatar?.firstName && authorForAvatar?.lastName && (
          <div className="flex items-center">
            <Avatar person={authorForAvatar} coAuthor={coAuthorForAvatar} small={true} />
          </div>
        )}
        <time className="text-gray-500 text-xs font-mono" dateTime={date}>
          <DateComponent dateString={date} />
        </time>
      </div>
    </article>
  )
}

const Posts = ({
  children,
  heading,
  subHeading,
}: {
  children: React.ReactNode
  heading?: string
  subHeading?: string
}) => (
  <div>
    {heading && (
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
        {heading}
      </h2>
    )}
    {subHeading && <p className="mt-2 text-lg leading-8 text-gray-600">{subHeading}</p>}
    <div className="pt-6 space-y-6">{children}</div>
  </div>
)

export const MorePosts = async ({skip, limit}: {skip: string; limit: number}) => {
  const {data} = await sanityFetch({
    query: morePostsQuery,
    params: {skip, limit},
  })

  if (!data || data.length === 0) {
    return null
  }

  const posts = data as AllPostsQueryResult

  return (
    <Posts heading={`Recent Posts (${posts?.length})`}>
      {posts?.map((post) => (
        <Post key={(post as any)._id} post={post} />
      ))}
    </Posts>
  )
}

export const AllPosts = async () => {
  const {data} = await sanityFetch({query: allPostsQuery})

  if (!data || data.length === 0) {
    return <OnBoarding />
  }

  const posts = data as AllPostsQueryResult

  return (
    <Posts
      heading="Recent Posts"
      subHeading={`${posts.length === 1 ? 'This blog post is' : `These ${posts.length} blog posts are`} populated from your Sanity Studio.`}
    >
      {posts.map((post) => (
        <Post key={(post as any)._id} post={post} />
      ))}
    </Posts>
  )
}
