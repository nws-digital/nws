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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(req: NextRequest) {
  try {
    const userAgent = req.headers.get('user-agent') || ''
    if (isLikelyBot(userAgent)) {
      return new Response(null, {status: 204})
    }

    const body = await req.json().catch(() => null)
    const articleId = typeof body?.articleId === 'string' ? body.articleId : ''
    const visitorId = typeof body?.visitorId === 'string' ? body.visitorId : ''

    if (!articleId || articleId.length > 200 || !UUID_RE.test(visitorId)) {
      return new Response('Bad Request', {status: 400})
    }

    const {error} = await supabase.rpc('record_article_view', {
      p_article_id: articleId,
      p_visitor_id: visitorId,
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
