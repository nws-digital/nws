import {DocumentTextIcon} from '@sanity/icons'
import {format, parseISO} from 'date-fns'
import {defineField, defineType} from 'sanity'

/**
 * Article schema.  Define and edit the fields for the 'article' content type.
 * Learn more: https://www.sanity.io/docs/schema-types
 */

export const article = defineType({
  name: 'article',
  title: 'Article',
  icon: DocumentTextIcon,
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Auto-generated from title when article is published',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'featured',
      title: 'Feature as Banner Article',
      type: 'boolean',
      description: 'Display this article as the banner on homepage',
      initialValue: false,
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'World Exclusive', value: 'world-exclusive'},
          {title: 'India Exclusive', value: 'india-exclusive'},
          {title: 'OSINT Exclusive', value: 'osint-exclusive'},
          {title: 'Commentary', value: 'commentary'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'blockContent',
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
        aiAssist: {
          imageDescriptionField: 'alt',
        },
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Important for SEO and accessibility.',
          validation: (rule) => {
            // Custom validation to ensure alt text is provided if the image is present. https://www.sanity.io/docs/validation
            return rule.custom((alt, context) => {
              if ((context.document?.coverImage as any)?.asset?._ref && !alt) {
                return 'Required'
              }
              return true
            })
          },
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
          description: 'Optional caption displayed below the cover image.',
        },
      ],
    }),
    defineField({
      name: 'date',
      title: 'Published Date',
      type: 'datetime',
      description: 'Automatically set when article is first published',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'lastPublishedDate',
      title: 'Last Published Date',
      type: 'datetime',
      description: 'Automatically updated each time article is published',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{type: 'person'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'coAuthor',
      title: 'Co-Author',
      type: 'reference',
      to: [{type: 'person'}],
      description: 'Optional co-author for this article',
    }),
  ],
  // List preview configuration. https://www.sanity.io/docs/previews-list-views
  preview: {
    select: {
      title: 'title',
      authorFirstName: 'author.firstName',
      authorLastName: 'author.lastName',
      coAuthorFirstName: 'coAuthor.firstName',
      coAuthorLastName: 'coAuthor.lastName',
      date: 'date',
      media: 'coverImage',
      featured: 'featured',
      category: 'category',
    },
    prepare({title, media, authorFirstName, authorLastName, coAuthorFirstName, coAuthorLastName, date, featured, category}) {
      const categoryLabel = category ? category.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : ''
      
      let authorText = ''
      if (authorFirstName && authorLastName) {
        authorText = `by ${authorFirstName} ${authorLastName}`
        if (coAuthorFirstName && coAuthorLastName) {
          authorText += ` & ${coAuthorFirstName} ${coAuthorLastName}`
        }
      }
      
      const subtitles = [
        featured && '⭐ Featured',
        categoryLabel,
        authorText,
        date && `on ${format(parseISO(date), 'LLL d, yyyy')}`,
      ].filter(Boolean)

      return {title, media, subtitle: subtitles.join(' ')}
    },
  },
})

