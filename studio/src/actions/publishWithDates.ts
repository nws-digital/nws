import {useEffect, useState} from 'react'
import {useDocumentOperation, useClient} from 'sanity'
import type {DocumentActionComponent} from 'sanity'

// Helper function to generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars except hyphens
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '')             // Trim - from end of text
}

export const publishWithDates: DocumentActionComponent = (props) => {
  const {patch, publish} = useDocumentOperation(props.id, props.type)
  const client = useClient({apiVersion: '2023-05-03'})
  const [isPublishing, setIsPublishing] = useState(false)

  useEffect(() => {
    // If publishing is complete
    if (isPublishing && !props.draft) {
      setIsPublishing(false)
    }
  }, [isPublishing, props.draft])

  // Validate required fields
  const draft = props.draft || props.published
  const title = (draft?.title as string) || ''
  const category = (draft?.category as string) || ''
  const author = draft?.author as any
  const coverImage = draft?.coverImage as any
  const coverImageAlt = coverImage?.alt as string

  // Check for missing required fields
  const missingFields: string[] = []
  if (!title.trim()) missingFields.push('Title')
  if (!category) missingFields.push('Category')
  if (!author?._ref) missingFields.push('Author')
  if (coverImage?.asset && !coverImageAlt) missingFields.push('Cover Image Alt Text')

  const hasRequiredFields = missingFields.length === 0
  const isDisabled = !!publish.disabled || !hasRequiredFields

  return {
    disabled: isDisabled,
    label: isPublishing ? 'Publishing...' : 'Publish',
    title: !hasRequiredFields 
      ? `Missing required fields: ${missingFields.join(', ')}` 
      : undefined,
    onHandle: async () => {
      // Double-check validation before publishing
      if (!hasRequiredFields) {
        return
      }

      setIsPublishing(true)

      const now = new Date().toISOString()
      const patches: any[] = []
      
      // Check if this is the first publish (no date exists)
      const isFirstPublish = !props.published?.date

      if (isFirstPublish) {
        // First publish: set both dates
        patches.push({set: {date: now}})
        patches.push({set: {lastPublishedDate: now}})
      } else {
        // Re-publish: only update lastPublishedDate
        patches.push({set: {lastPublishedDate: now}})
      }

      // Generate slug if it doesn't exist
      const currentSlug = (props.published?.slug as any)?.current || (props.draft?.slug as any)?.current
      
      if (!currentSlug && title) {
        let baseSlug = generateSlug(title)
        let slug = baseSlug
        let attempts = 0
        
        // Check for uniqueness and append counter if needed
        while (attempts < 100) {
          const existing = await client.fetch(
            `count(*[_type == "article" && slug.current == $slug && _id != $id])`,
            {slug, id: props.id}
          )
          
          if (existing === 0) {
            break
          }
          
          attempts++
          slug = `${baseSlug}-${attempts}`
        }
        
        patches.push({set: {slug: {_type: 'slug', current: slug}}})
      }

      // Apply all patches
      if (patches.length > 0) {
        patch.execute(patches)
      }

      // Wait a bit for the patches to be applied
      setTimeout(() => {
        publish.execute()
      }, 200)
    },
  }
}
