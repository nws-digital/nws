import {supabase, type RssArticle} from '@/lib/supabase'
import Link from 'next/link'

async function getAllNews(): Promise<RssArticle[]> {
  const {data, error} = await supabase
    .from('rss_articles')
    .select('*')
    .order('pub_date', {ascending: false})
    .limit(100)

  if (error) {
    console.error('Error fetching news:', error)
    return []
  }
  
  // Shuffle the articles to mix nation and world news
  const shuffled = data ? [...data].sort(() => Math.random() - 0.5) : []
  return shuffled
}

export default async function NewsPage() {
  const articles = await getAllNews()

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <section className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-red-600 text-white px-6 py-4">
          <h2 className="text-2xl font-bold">📰 Breaking News</h2>
        </div>
        
        <div className="h-[600px] overflow-hidden relative">
          {/* Scrolling container */}
          <div className="animate-scroll">
            {articles.length > 0 ? (
              <>
                {articles.map((article) => (
                  <ArticleTitle key={article.id} article={article} />
                ))}
                {/* Duplicate articles for seamless loop */}
                {articles.map((article) => (
                  <ArticleTitle key={`dup-${article.id}`} article={article} />
                ))}
              </>
            ) : (
              <p className="text-gray-500 text-center py-8">No news available</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function ArticleTitle({article}: {article: RssArticle}) {
  // Calculate time ago
  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const pubDate = new Date(dateString)
    const diffMs = now.getTime() - pubDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  return (
    <Link
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block px-6 py-3 border-b border-gray-100 hover:bg-red-50 transition-colors group"
    >
      <div className="flex items-start gap-3">
        <div className="w-1 h-5 bg-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-base leading-relaxed group-hover:text-red-600 transition-colors">
            {article.title}
          </p>
        </div>
        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
          {getTimeAgo(article.pub_date)}
        </span>
      </div>
    </Link>
  )
}

// Revalidate every 5 minutes to show fresh content
export const revalidate = 300
