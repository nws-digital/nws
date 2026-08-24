import {UserIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * Person schema.  Define and edit the fields for the 'person' content type.
 * Learn more: https://www.sanity.io/docs/schema-types
 */

export const person = defineType({
  name: 'person',
  title: 'Author',
  icon: UserIcon,
  type: 'document',
  fields: [
    defineField({
      name: 'firstName',
      title: 'First Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'lastName',
      title: 'Last Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Used to build this author\'s public profile URL (/author/<slug>).',
      options: {
        source: (doc) => `${(doc as {firstName?: string}).firstName ?? ''} ${(doc as {lastName?: string}).lastName ?? ''}`.trim(),
        maxLength: 96,
      },
      validation: (rule) =>
        rule
          .required()
          .custom(async (slug, context) => {
            if (!slug?.current) return true
            const {document, getClient} = context
            const client = getClient({apiVersion: '2024-01-01'})
            const id = document?._id.replace(/^drafts\./, '')
            const isUnique = await client.fetch(
              `!defined(*[_type == "person" && !(_id in [$draft, $published]) && slug.current == $slug][0]._id)`,
              {draft: `drafts.${id}`, published: id, slug: slug.current}
            )
            return isUnique || 'Another author already uses this slug — pick a different one.'
          }),
    }),
    defineField({
      name: 'designation',
      title: 'Designation',
      type: 'string',
      description: 'Job title or role (e.g., Senior Editor, Columnist, Correspondent)',
      placeholder: 'e.g., Senior Editor',
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'array',
      of: [{type: 'block'}],
      description: 'About the author, their experience, and background',
      validation: (rule) => rule.max(3000),
    }),
    defineField({
      name: 'picture',
      title: 'Picture',
      type: 'image',
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Important for SEO and accessibility.',
          validation: (rule) => {
            // Custom validation to ensure alt text is provided if the image is present. https://www.sanity.io/docs/validation
            return rule.custom((alt, context) => {
              if ((context.document?.picture as any)?.asset?._ref && !alt) {
                return 'Required'
              }
              return true
            })
          },
        }),
      ],
      options: {
        hotspot: true,
        aiAssist: {
          imageDescriptionField: 'alt',
        },
      },
      validation: (rule) => rule.required(),
    }),
  ],
  // List preview configuration. https://www.sanity.io/docs/previews-list-views
  preview: {
    select: {
      firstName: 'firstName',
      lastName: 'lastName',
      designation: 'designation',
      picture: 'picture',
    },
    prepare(selection) {
      return {
        title: `${selection.firstName} ${selection.lastName}`,
        subtitle: selection.designation || 'Person',
        media: selection.picture,
      }
    },
  },
})
