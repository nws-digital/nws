import {useEffect, useState} from 'react'
import {useDocumentOperation} from 'sanity'
import type {DocumentActionComponent} from 'sanity'

export const publishWithDates: DocumentActionComponent = (props) => {
  const {patch, publish} = useDocumentOperation(props.id, props.type)
  const [isPublishing, setIsPublishing] = useState(false)

  useEffect(() => {
    // If publishing is complete
    if (isPublishing && !props.draft) {
      setIsPublishing(false)
    }
  }, [isPublishing, props.draft])

  return {
    disabled: !!publish.disabled,
    label: isPublishing ? 'Publishing...' : 'Publish',
    onHandle: async () => {
      setIsPublishing(true)

      const now = new Date().toISOString()
      
      // Check if this is the first publish (no date exists)
      const isFirstPublish = !props.published?.date

      if (isFirstPublish) {
        // First publish: set both dates
        patch.execute([
          {set: {date: now}},
          {set: {lastPublishedDate: now}}
        ])
      } else {
        // Re-publish: only update lastPublishedDate
        patch.execute([
          {set: {lastPublishedDate: now}}
        ])
      }

      // Wait a bit for the patch to be applied
      setTimeout(() => {
        publish.execute()
      }, 100)
    },
  }
}
