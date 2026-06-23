import {useState} from 'react'
import {EyeOpenIcon} from '@sanity/icons'
import {useDocumentOperation} from 'sanity'
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

export const previewAction: DocumentActionComponent = (props) => {
  const router = useRouter()
  const {patch} = useDocumentOperation(props.id, props.type)
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
        // Draft has no slug yet — write one so the Presentation Tool can find it
        slug = generateSlug(title)
        setIsPreparing(true)
        patch.execute([{set: {slug: {_type: 'slug', current: slug}}}])
        // Wait for the write to propagate to Sanity before the Presentation
        // Tool's iframe tries to fetch the article
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setIsPreparing(false)
      }

      router.navigateUrl({
        path: `/presentation?preview=${encodeURIComponent(`/${category}/${slug}`)}`,
      })
    },
  }
}
