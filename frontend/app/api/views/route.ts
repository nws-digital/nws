import {type NextRequest} from 'next/server'
import {supabase} from '@/lib/supabase'

// Minimal, low-maintenance bot filtering -- there's no other bot/rate-limit
// infra in this app to lean on, and this endpoint only feeds a "most read"
// ranking widget, not anything security-critical.
const BOT_UA_SUBSTRINGS = [
  'bot',
  'spider',
  'crawl',
  'slurp',
  'mediapartners',
  'facebookexternalhit',
  'whatsapp',
  'telegrambot',
  'bingpreview',
  'headlesschrome',
  'phantomjs',
  'python-requests',
  'curl/',
  'wget/',
  'axios/',
  'go-http-client',
]

function isLikelyBot(userAgent: string) {
  const lower = userAgent.toLowerCase()
  return BOT_UA_SUBSTRINGS.some((substring) => lower.includes(substring))
}

// Sanity document ids: letters, digits, dots, dashes and underscores. Draft ids are rejected.
const ARTICLE_ID_RE = /^(?!drafts\.)[\w.-]{1,200}$/

export async function POST(req: NextRequest) {
  try {
    // Only the live production site records views. Staging/preview deployments
    // and local dev may share this database, so they must never write to it.
    if (process.env.VERCEL_ENV !== 'production') {
      return new Response(null, {status: 204})
    }

    const userAgent = req.headers.get('user-agent') || ''
    if (isLikelyBot(userAgent)) {
      return new Response(null, {status: 204})
    }

    const body = await req.json().catch(() => null)
    const articleId = typeof body?.articleId === 'string' ? body.articleId : ''

    if (!ARTICLE_ID_RE.test(articleId)) {
      return new Response('Bad Request', {status: 400})
    }

    const {error} = await supabase.rpc('record_article_view', {
      p_article_id: articleId,
    })

    if (error) {
      console.error('Error recording article view:', error)
      return new Response(null, {status: 500})
    }

    return new Response(null, {status: 204})
  } catch (err: any) {
    console.error(err)
    return new Response(err.message, {status: 500})
  }
}
