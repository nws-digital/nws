'use client'

import Link from 'next/link'
import {formatDistanceToNow} from 'date-fns'
import {motion} from 'framer-motion'
import Avatar from '@/app/components/Avatar'

interface CommentaryArticle {
  _id: string
  title: string
  slug: {current: string}
  excerpt?: string
  contentPreview?: string
  date: string
  author?: {
    firstName: string
    lastName: string
    designation?: string
    picture?: any
    bio?: any
  }
}

interface CommentarySectionProps {
  articles: CommentaryArticle[]
}

export function CommentarySection({articles}: CommentarySectionProps) {
  if (!articles || articles.length === 0) {
    return null
  }

  const sectionVariants = {
    hidden: {opacity: 0},
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: {opacity: 0, y: 20},
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <motion.section
      className="py-8 bg-white"
      initial="hidden"
      whileInView="visible"
      viewport={{once: true, amount: 0.1}}
      variants={sectionVariants}
    >
      <div className="max-w-[1366px] mx-auto px-4 py-4">
        <motion.div className="mb-8" variants={itemVariants}>
          <h6 className="font-vollkorn-sc font-[600] text-[0.72rem] uppercase tracking-[0.15em] text-black whitespace-nowrap mb-2">Commentary</h6>
          <motion.div
            className="w-8 h-1.5 bg-red-600"
            initial={{width: 0}}
            animate={{width: '2rem'}}
            transition={{duration: 0.5, delay: 0.2}}
          />
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={sectionVariants}
        >
          {articles.slice(0, 3).map((article) => {
            const authorForAvatar = article.author
              ? {
                  firstName: article.author.firstName ?? null,
                  lastName: article.author.lastName ?? null,
                  designation: article.author.designation ?? null,
                  picture: article.author.picture,
                  bio: article.author.bio,
                }
              : null

            const timeAgo = formatDistanceToNow(new Date(article.date), {
              addSuffix: true,
            })

            return (
              <motion.div
                key={article._id}
                variants={itemVariants}
                className="group bg-white border-2 border-gray-200 rounded-lg flex flex-col"
                whileHover={{
                  y: -8,
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                }}
                transition={{type: 'spring', stiffness: 300}}
              >
                <Link
                  href={`/commentary/${article.slug.current}`}
                  className="flex flex-col h-full p-6"
                >
                  {/* Author Info */}
                  <div className="mb-4">
                    {authorForAvatar && <Avatar person={authorForAvatar} date={article.date} small />}
                  </div>

                  {/* Title */}
                  <h3 className="font-vollkorn font-[700] text-[1.15rem] tracking-[-0.01em] leading-[1.25] text-black mb-3 group-hover:text-red-600 transition-colors duration-300 line-clamp-2">
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="font-spectral-regular font-[400] text-[0.92rem] leading-[1.6] text-[#666660] text-sm line-clamp-4 mb-4 flex-1">
                    {article.excerpt || article.contentPreview || 'No preview available...'}
                    {((article.excerpt || article.contentPreview) as any) && '...'}
                  </p>

                  {/* Time ago at bottom */}
                  <p className="font-inconsolata-regular font-[400] text-[0.72rem] text-gray-400 mt-auto pt-4">{timeAgo}</p>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </motion.section>
  )
}

