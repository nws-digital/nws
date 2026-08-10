import {person} from './documents/person'
import {page} from './documents/page'
import {article} from './documents/article'
import {callToAction} from './objects/callToAction'
import {infoSection} from './objects/infoSection'
import {settings} from './singletons/settings'
import {promptConfig} from './singletons/promptConfig'
import {link} from './objects/link'
import {blockContent} from './objects/blockContent'
import {embed} from './objects/embed'

// Export an array of all the schema types.  This is used in the Sanity Studio configuration. https://www.sanity.io/docs/schema-types

export const schemaTypes = [
  // Singletons
  settings,
  promptConfig,
  // Documents
  page,
  article,
  person,
  // Objects
  blockContent,
  embed,
  infoSection,
  callToAction,
  link,
]
