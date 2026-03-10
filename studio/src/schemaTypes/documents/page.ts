import {defineField, defineType} from 'sanity'
import {DocumentIcon} from '@sanity/icons'

/**
 * Page schema.  Define and edit the fields for the 'page' content type.
 * Learn more: https://www.sanity.io/docs/schema-types
 */

export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Only lowercase letters, numbers, and hyphens are allowed.',
      options: {
        source: 'name',
        maxLength: 96,
        slugify: (input) => 
          input
            .toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars except hyphens
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, ''),            // Trim - from end of text
      },
      validation: (Rule) => Rule.required().custom((slug) => {
        if (!slug?.current) {
          return 'Slug is required'
        }
        // Validate that the slug only contains allowed characters
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.current)) {
          return 'Slug can only contain lowercase letters, numbers, and hyphens. No spaces or special characters allowed.'
        }
        return true
      }),
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'string',
    }),
    defineField({
      name: 'pageBuilder',
      title: 'Page builder',
      type: 'array',
      of: [{type: 'callToAction'}, {type: 'infoSection'}],
      options: {
        insertMenu: {
          // Configure the "Add Item" menu to display a thumbnail preview of the content type. https://www.sanity.io/docs/array-type#efb1fe03459d
          views: [
            {
              name: 'grid',
              previewImageUrl: (schemaTypeName) =>
                `/static/page-builder-thumbnails/${schemaTypeName}.webp`,
            },
          ],
        },
      },
    }),
  ],
})
