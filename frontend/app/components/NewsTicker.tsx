'use client'

import {supabase, type RssArticle} from '@/lib/supabase'
import {useEffect, useState} from 'react'
import {motion} from 'framer-motion'
import Link from 'next/link'

async function getAllNews(): Promise<RssArticle[]> {
  const {data, error} = await supabase
    .from('rss_articles')
    .select('*')
    .order('pub_date', {ascending: false})
    .limit(10)

  if (error) {
    console.error('Error fetching news:', error)
    return []
  }

  return data || []
}

// Calculate time ago
const getTimeAgo = (dateString: string) => {
  const now = new Date()
  const pubDate = new Date(dateString)
  const diffMs = now.getTime() - pubDate.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffMs / 86400000)
  return `${diffDays}d ago`
}

export function NewsTicker() {
  const [breakingNews, setBreakingNews] = useState<RssArticle[]>([])

  useEffect(() => {
    getAllNews().then(setBreakingNews)
  }, [])

  return (
    <motion.div
      initial={{opacity: 0, x: 50}}
      animate={{opacity: 1, x: 0}}
      transition={{delay: 0.5}}
      className="w-full flex flex-col shrink-0 h-full"
    >
      <div className="bg-red-600 rounded-t-3xl px-6 py-3">
        <h2 className="text-white text-2xl font-semibold">Breaking</h2>
      </div>
      <div className="bg-black/80 backdrop-blur rounded-b-3xl overflow-hidden flex-1">
        <div className="animate-scroll">
          {[...breakingNews, ...breakingNews].map((news, index) => (
            <Link
              href={news.link}
              target="_blank"
              rel="noopener noreferrer"
              key={news.id + '-' + index}
              className="block"
            >
              <div className="px-6 py-3 cursor-pointer transition-colors hover:bg-white/10">
                <h3 className="text-sm font-semibold mb-2 text-white">
                  {news.generated_title}
                </h3>
                <p className="text-[#d0d2d6] text-xs">{getTimeAgo(news.pub_date)}</p>
              </div>
              {index < breakingNews.length * 2 - 1 && <div className="h-px bg-[#666666]" />}
            </Link>
          ))}
        </div>
        {breakingNews.length === 0 && (
          <p className="text-gray-400 text-center py-8">Loading news...</p>
        )}
      </div>
    </motion.div>
  )
}

