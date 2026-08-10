import {defineField, defineType} from 'sanity'
import {CogIcon} from '@sanity/icons'

export const promptConfig = defineType({
  name: 'promptConfig',
  title: 'Prompt Configuration',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'prompt',
      title: 'System Prompt',
      type: 'text',
      readOnly: true,
      initialValue: `You are a professional journalist. Based on the following article information, create a unique, self-explanatory news headline that tells the complete story.

Requirements:
1. Make it COMPLETELY SELF-EXPLANATORY - readers should understand the full story from just the title
2. Include WHO, WHAT, WHERE, and WHY/WHEN if relevant
3. Be specific with names, places, and numbers
4. Keep it under 150 characters but prioritize clarity over brevity
5. Use active voice and present tense
6. Sound professional and journalistic, not clickbait
7. Return ONLY the headline, nothing else`,
      description:
        'The system prompt for generating article titles. This cannot be edited from the UI.',
    }),
    defineField({
      name: 'instructions',
      title: 'Instructions',
      type: 'text',
      description:
        'Add or edit instructions for generating article titles. These will be appended to the system prompt.',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Prompt Configuration',
      }
    },
  },
})
