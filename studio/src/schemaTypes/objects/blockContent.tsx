import {defineArrayMember, defineType, defineField} from 'sanity'
import {embed} from './embed'
import {urlForCroppedThumbnail} from '../../lib/imageUrl'

/**
 * This is the schema definition for the rich text fields used for
 * for this blog studio. When you import it in schemas.js it can be
 * reused in other parts of the studio with:
 *  {
 *    name: 'someName',
 *    title: 'Some title',
 *    type: 'blockContent'
 *  }
 *
 * Learn more: https://www.sanity.io/docs/block-content
 */
export const blockContent = defineType({
  title: 'Block Content',
  name: 'blockContent',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      marks: {
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              defineField({
                name: 'linkType',
                title: 'Link Type',
                type: 'string',
                initialValue: 'href',
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
                hidden: ({parent}) => parent?.linkType !== 'href' && parent?.linkType != null,
                validation: (Rule) =>
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
          },
        ],
      },
    }),
    // Add image support
    defineArrayMember({
      type: 'image',
      title: 'Image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Important for SEO and accessibility.',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'caption',
          type: 'string',
          title: 'Caption',
          description: 'Optional caption displayed below the image.',
        }),
      ],
      // Studio's default preview for this block shows the full original
      // asset, ignoring the saved crop. Render the thumbnail ourselves via
      // @sanity/image-url, which does apply crop/hotspot, so the editor
      // matches what actually gets rendered on the frontend.
      preview: {
        select: {
          asset: 'asset',
          crop: 'crop',
          hotspot: 'hotspot',
          alt: 'alt',
          caption: 'caption',
        },
        prepare({asset, crop, hotspot, alt, caption}) {
          const url = asset ? urlForCroppedThumbnail({asset, crop, hotspot}) : undefined
          return {
            title: caption || alt || 'Image',
            media: url ? <img src={url} alt={alt || ''} /> : undefined,
          }
        },
      },
    }),
    // Add embed support
    defineArrayMember({
      type: 'embed',
      title: 'Embed',
    }),
  ],
})
