import {defineQuery} from 'next-sanity'

export const rssArticlesByTopicQuery = defineQuery(`
  *[_type == "rssArticle" && topic == $topic] | order(pubDate desc) [0...20] {
    _id,
    title,
    link,
    description,
    pubDate,
    source,
    topic
  }
`)

export const allRssArticlesQuery = defineQuery(`
  *[_type == "rssArticle"] | order(pubDate desc) [0...40] {
    _id,
    title,
    link,
    description,
    pubDate,
    source,
    topic
  }
`)
