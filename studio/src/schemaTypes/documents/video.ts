import {PlayIcon} from '@sanity/icons'
import {format, parseISO} from 'date-fns'
import {defineField, defineType} from 'sanity'

// Keep in sync with getYouTubeId() in frontend/lib/youtube.ts
const YOUTUBE_ID_PATTERN =
  /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?(?:.*&)?v=))([\w-]{11})/

export const VIDEO_CATEGORIES = [
  {title: 'Documentary', value: 'documentary'},
  {title: 'World', value: 'world'},
  {title: 'India', value: 'india'},
]

/**
 * A YouTube video listed on the /videos page. Clicking a card plays the video
 * in a popup on the site; nothing is uploaded to Sanity except an optional
 * custom thumbnail.
 */
export const video = defineType({
  name: 'video',
  title: 'Video',
  icon: PlayIcon,
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'youtubeUrl',
      title: 'YouTube URL',
      type: 'url',
      description: 'Paste the link from YouTube (watch, youtu.be or Shorts links all work).',
      validation: (rule) =>
        rule.required().custom((url) => {
          if (!url) return true
          return YOUTUBE_ID_PATTERN.test(url) || 'This does not look like a YouTube video link'
        }),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {list: VIDEO_CATEGORIES, layout: 'radio'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'thumbnail',
      title: 'Custom Thumbnail',
      type: 'image',
      description:
        "Optional. Leave empty to use the thumbnail from YouTube. Upload one if YouTube's thumbnail crops badly (for example a vertical Short).",
      options: {hotspot: true},
    }),
  ],
  // No date field: like articles, editors never set dates. Videos are listed
  // newest first by Sanity's automatic _createdAt timestamp.
  orderings: [
    {
      title: 'Added, newest first',
      name: 'createdAtDesc',
      by: [{field: '_createdAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category',
      createdAt: '_createdAt',
      media: 'thumbnail',
    },
    prepare({title, category, createdAt, media}) {
      const label = VIDEO_CATEGORIES.find((c) => c.value === category)?.title
      const date = createdAt ? format(parseISO(createdAt), 'LLL d, yyyy') : null
      return {
        title,
        media,
        subtitle: [label, date].filter(Boolean).join(' · '),
      }
    },
  },
})
