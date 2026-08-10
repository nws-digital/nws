import {defineField, defineType} from 'sanity'
import {LinkIcon} from '@sanity/icons'

/**
 * Link schema object. This link object lets the user first select the type of link and then
 * then enter the URL, page reference, or article reference - depending on the type selected.
 * Learn more: https://www.sanity.io/docs/object-type
 */

export const link = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'linkType',
      title: 'Link Type',
      type: 'string',
      initialValue: 'url',
      options: {
        list: [
          {title: 'URL', value: 'href'},
          {title: 'Page', value: 'page'},
          {title: 'Article', value: 'article'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'href',
      title: 'URL',
      type: 'url',
      hidden: ({parent}) => parent?.linkType !== 'href',
      validation: (Rule) =>
        // Custom validation to ensure URL is provided if the link type is 'href'
        Rule.custom((value, context: any) => {
          if (context.parent?.linkType === 'href' && !value) {
            return 'URL is required when Link Type is URL'
          }
          return true
        }),
    }),
    defineField({
      name: 'page',
      title: 'Page',
      type: 'reference',
      to: [{type: 'page'}],
      hidden: ({parent}) => parent?.linkType !== 'page',
      validation: (Rule) =>
        // Custom validation to ensure page reference is provided if the link type is 'page'
        Rule.custom((value, context: any) => {
          if (context.parent?.linkType === 'page' && !value) {
            return 'Page reference is required when Link Type is Page'
          }
          return true
        }),
    }),
    defineField({
      name: 'article',
      title: 'Article',
      type: 'reference',
      to: [{type: 'article'}],
      hidden: ({parent}) => parent?.linkType !== 'article',
      validation: (Rule) =>
        // Custom validation to ensure article reference is provided if the link type is 'article'
        Rule.custom((value, context: any) => {
          if (context.parent?.linkType === 'article' && !value) {
            return 'Article reference is required when Link Type is Article'
          }
          return true
        }),
    }),
    defineField({
      name: 'openInNewTab',
      title: 'Open in new tab',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})
