import {defineType, defineField} from 'sanity'

export const embed = defineType({
  name: 'embed',
  title: 'Embed',
  type: 'object',
  fields: [
    defineField({
      name: 'type',
      title: 'Embed Type',
      type: 'string',
      options: {
        list: [
          {title: 'YouTube Video', value: 'youtube'},
          {title: 'X / Twitter Post', value: 'twitter'},
          {title: 'Other (iframe)', value: 'iframe'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'Embed URL',
      type: 'url',
      validation: (Rule) => Rule.required(),
      description: 'Paste the full YouTube/Twitter URL or iframe src',
    }),
  ],
  preview: {
    select: {
      type: 'type',
      url: 'url',
    },
    prepare({type, url}) {
      let title = 'Embed'
      if (type === 'youtube') title = 'YouTube Video'
      else if (type === 'twitter') title = 'X / Twitter Post'
      else if (type === 'iframe') title = 'Other Embed'
      return {
        title,
        subtitle: url,
      }
    },
  },
})
