import {useState} from 'react'
import {EyeOpenIcon} from '@sanity/icons'
import {useClient, useDocumentOperation} from 'sanity'
import {useRouter} from 'sanity/router'
import type {DocumentActionComponent} from 'sanity'

const generateSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const previewAction: DocumentActionComponent = (props) => {
  const router = useRouter()
  const {patch} = useDocumentOperation(props.id, props.type)
  const client = useClient({apiVersion: '2023-05-03'})
  const [isPreparing, setIsPreparing] = useState(false)

  const draft = props.draft || props.published
  const title = draft?.title as string | undefined
  const category = draft?.category as string | undefined
  const existingSlug = (draft?.slug as any)?.current as string | undefined

  if (!title || !category) return null

  return {
    label: isPreparing ? 'Preparing…' : 'Preview',
    icon: EyeOpenIcon,
    disabled: isPreparing,
    onHandle: async () => {
      let slug = existingSlug

      if (!slug) {
        slug = generateSlug(title)
        setIsPreparing(true)
        patch.execute([{set: {slug: {_type: 'slug', current: slug}}}])

        // Poll for the draft's slug to become queryable instead of a fixed
        // delay, so the Presentation Tool iframe doesn't try to fetch the
        // article before the write has propagated (was a fixed 1.5s wait
        // before, which was both unreliable and needlessly slow).
        const draftId = props.id.startsWith('drafts.') ? props.id : `drafts.${props.id}`
        for (let attempt = 0; attempt < 10; attempt++) {
          const found = await client.fetch(`count(*[_id == $draftId && slug.current == $slug])`, {
            draftId,
            slug,
          })
          if (found > 0) break
          await wait(300)
        }

        setIsPreparing(false)
      }

      router.navigateUrl({
        path: `/presentation?preview=${encodeURIComponent(`/${category}/${slug}`)}`,
      })
    },
  }
}
