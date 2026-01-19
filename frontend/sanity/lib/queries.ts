import {defineQuery} from 'next-sanity'

export const settingsQuery = defineQuery(`*[_type == "settings"][0]`)

export const featuredArticleQuery = defineQuery(`
  *[_type == "article" && featured == true] | order(date desc)[0] {
    _id,
    title,
    slug,
    excerpt,
    date,
    category,
    "author": author->{firstName, lastName},
    coverImage
  }
`)

export const commentaryArticlesQuery = defineQuery(`
  *[_type == "article" && category == "commentary"] | order(date desc)[0...3] {
    _id,
    title,
    slug,
    excerpt,
    "contentPreview": array::join(string::split(pt::text(content), "")[0..200], ""),
    date,
    "author": author->{firstName, lastName, designation, picture}
  }
`)

export const latestArticlesQuery = defineQuery(`
  *[_type == "article" && category != "commentary"] | order(date desc)[0...6] {
    _id,
    title,
    slug,
    excerpt,
    "contentPreview": array::join(string::split(pt::text(content), "")[0..200], ""),
    date,
    category,
    coverImage
  }
`)

export const categoryArticlesQuery = defineQuery(`
  *[_type == "article" && category == $category] | order(date desc)[$offset...$limit] {
    _id,
    title,
    slug,
    excerpt,
    "contentPreview": array::join(string::split(pt::text(content), "")[0..200], ""),
    date,
    category,
    coverImage
  }
`)

export const categoryArticlesCountQuery = defineQuery(`
  count(*[_type == "article" && category == $category])
`)

export const commentaryArticlesPageQuery = defineQuery(`
  *[_type == "article" && category == "commentary"] | order(date desc)[$offset...$limit] {
    _id,
    title,
    slug,
    excerpt,
    "contentPreview": array::join(string::split(pt::text(content), "")[0..200], ""),
    date,
    "author": author->{firstName, lastName, designation, picture}
  }
`)

const postFields = /* groq */ `
  _id,
  "status": select(_originalId in path("drafts.**") => "draft", "published"),
  "title": coalesce(title, "Untitled"),
  "slug": slug.current,
  excerpt,
  coverImage,
  "date": coalesce(date, _updatedAt),
  "author": author->{firstName, lastName, picture},
  category,
`

const linkReference = /* groq */ `
  _type == "link" => {
    "page": page->slug.current,
    "article": article->slug.current
  }
`

const linkFields = /* groq */ `
  link {
      ...,
      ${linkReference}
      }
`

export const getPageQuery = defineQuery(`
  *[_type == 'page' && slug.current == $slug][0]{
    _id,
    _type,
    name,
    slug,
    heading,
    subheading,
    "pageBuilder": pageBuilder[]{
      ...,
      _type == "callToAction" => {
        ${linkFields},
      },
      _type == "infoSection" => {
        content[]{
          ...,
          markDefs[]{
            ...,
            ${linkReference}
          }
        }
      },
    },
  }
`)

export const sitemapData = defineQuery(`
  *[_type == "page" || _type == "article" && defined(slug.current)] | order(_type asc) {
    "slug": slug.current,
    _type,
    _updatedAt,
  }
`)

export const allPostsQuery = defineQuery(`
  *[_type == "article" && defined(slug.current)] | order(date desc, _updatedAt desc) {
    ${postFields}
  }
`)

export const morePostsQuery = defineQuery(`
  *[_type == "article" && _id != $skip && defined(slug.current)] | order(date desc, _updatedAt desc) [0...$limit] {
    ${postFields}
  }
`)

export const postQuery = defineQuery(`
  *[_type == "article" && slug.current == $slug] [0] {
    content[]{
    ...,
    markDefs[]{
      ...,
      ${linkReference}
    }
  },
    ${postFields}
  }
`)

export const postPagesSlugs = defineQuery(`
  *[_type == "article" && defined(slug.current)]
  {"slug": slug.current}
`)

export const pagesSlugs = defineQuery(`
  *[_type == "page" && defined(slug.current)]
  {"slug": slug.current}
`)
