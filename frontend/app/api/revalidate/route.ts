import {revalidatePath, revalidateTag} from 'next/cache'
import {type NextRequest, NextResponse} from 'next/server'
import {parseBody} from 'next-sanity/webhook'

export async function POST(req: NextRequest) {
  try {
    const {body, isValidSignature} = await parseBody<{
      _type: string
      slug?: {current?: string}
      category?: string
    }>(req, process.env.SANITY_REVALIDATE_SECRET)

    // Verify the webhook signature
    if (!isValidSignature) {
      return new Response('Invalid signature', {status: 401})
    }

    if (!body?._type) {
      return new Response('Bad Request', {status: 400})
    }

    // Revalidate based on document type
    switch (body._type) {
      case 'post':
      case 'article':
        // Revalidate the specific article page
        if (body.slug?.current) {
          revalidatePath(`/posts/${body.slug.current}`)
          if (body.category) {
            revalidatePath(`/${body.category}/${body.slug.current}`)
          }
        }
        // Revalidate homepage and category pages
        revalidatePath('/')
        if (body.category) {
          revalidatePath(`/${body.category}`)
          revalidatePath(`/category/${body.category}`)
        }
        break

      case 'page':
        if (body.slug?.current) {
          revalidatePath(`/${body.slug.current}`)
        }
        break

      case 'settings':
        // Revalidate all pages when settings change
        revalidatePath('/', 'layout')
        break

      default:
        // For any other document type, revalidate homepage
        revalidatePath('/')
    }

    return NextResponse.json({
      status: 200,
      revalidated: true,
      now: Date.now(),
    })
  } catch (err: any) {
    console.error(err)
    return new Response(err.message, {status: 500})
  }
}
