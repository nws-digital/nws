import createImageUrlBuilder from '@sanity/image-url'
import {dataset, projectId, studioUrl} from '@/sanity/lib/api'
import {createDataAttribute, CreateDataAttributeProps} from 'next-sanity'
import {getImageDimensions} from '@sanity/asset-utils'
import {categoryToUrlSlug} from '@/sanity/lib/cleanCategorySlug'

const imageBuilder = createImageUrlBuilder({
  projectId: projectId || '',
  dataset: dataset || '',
})

export const urlForImage = (source: any) => {
  // Ensure that source image contains a valid reference
  if (!source?.asset?._ref) {
    return undefined
  }

  const imageRef = source?.asset?._ref
  const crop = source.crop

  // get the image's og dimensions
  const {width, height} = getImageDimensions(imageRef)

  if (Boolean(crop)) {
    // compute the cropped image's area
    const croppedWidth = Math.floor(width * (1 - (crop.right + crop.left)))

    const croppedHeight = Math.floor(height * (1 - (crop.top + crop.bottom)))

    // compute the cropped image's position
    const left = Math.floor(width * crop.left)
    const top = Math.floor(height * crop.top)

    // gather into a url
    return imageBuilder?.image(source).rect(left, top, croppedWidth, croppedHeight).auto('format')
  }

  return imageBuilder?.image(source).auto('format')
}

/**
 * Returns the image's displayed width/height after the editor's saved crop
 * (or the full asset size if uncropped) - i.e. the actual aspect ratio that
 * should be preserved when rendering without any further forced cropping.
 */
export const getImageDisplayDimensions = (source: any) => {
  if (!source?.asset?._ref) {
    return undefined
  }

  const {width, height} = getImageDimensions(source.asset._ref)
  const crop = source.crop

  if (!crop) {
    return {width, height}
  }

  return {
    width: Math.floor(width * (1 - (crop.right + crop.left))),
    height: Math.floor(height * (1 - (crop.top + crop.bottom))),
  }
}

/**
 * Scales the image's cropped aspect ratio DOWN to fit within a
 * maxWidth x maxHeight box on whichever axis is the tighter constraint,
 * without cropping - i.e. `object-fit: contain` math, capped at 1x. Sources
 * already smaller than the box in both dimensions are left at their natural
 * size (never upscaled).
 */
export const getContainedImageDimensions = (source: any, maxWidth: number, maxHeight: number) => {
  const natural = getImageDisplayDimensions(source)
  if (!natural || !natural.width || !natural.height) {
    return undefined
  }

  const scale = Math.min(1, maxWidth / natural.width, maxHeight / natural.height)

  return {
    width: Math.round(natural.width * scale),
    height: Math.round(natural.height * scale),
  }
}

export function resolveOpenGraphImage(image: any, width = 1200, height = 630) {
  if (!image) return
  const imageRef = image?.asset?._ref as string | undefined
  if (!imageRef) return

  // Reject SVG files explicitly (check reference level)
  if (imageRef.includes('-svg') || imageRef.includes('.svg')) return

  const refMatch = imageRef.match(/-(\d+)x(\d+)-([a-zA-Z0-9]+)$/)
  if (refMatch) {
    const refWidth = Number(refMatch[1])
    const refHeight = Number(refMatch[2])
    const refFormat = refMatch[3]?.toLowerCase()

    if (refFormat === 'svg') return
    if (Number.isFinite(refWidth) && Number.isFinite(refHeight) && (refWidth < 300 || refHeight < 300)) {
      return
    }
  }

  const url = urlForImage(image)?.width(1200).height(630).fit('crop').url()
  if (!url) return

  if (url.toLowerCase().includes('.svg')) return

  return {url, alt: image?.alt as string, width, height}
}

// The shape of a `link` object after the GROQ `linkReference` projection has
// resolved `page`/`article` references (see sanity/lib/queries.ts) - not the
// raw schema type, which only has unresolved reference objects.
type ResolvedLinkValue = {
  _type?: 'link'
  linkType?: 'href' | 'page' | 'article'
  href?: string | null
  openInNewTab?: boolean
  page?: string | null
  article?: {slug: string | null; category: string | null} | null
}

// Depending on the type of link, we need to resolve the corresponding page, article, or URL. Otherwise return null.
export function linkResolver(link: ResolvedLinkValue | undefined | null) {
  if (!link) return null

  // If linkType is not set but href is, lets set linkType to "href".  This comes into play when pasting links into the portable text editor because a link type is not assumed.
  const linkType = link.linkType || (link.href ? 'href' : undefined)

  switch (linkType) {
    case 'href':
      return link.href || null
    case 'page':
      return link.page ? `/pages/${link.page}` : null
    case 'article':
      return link.article?.slug && link.article?.category
        ? `/${categoryToUrlSlug(link.article.category)}/${link.article.slug}`
        : null
    default:
      return null
  }
}

// Sanity's `slug` and `date` fields are optional at the schema level, but
// every published article gets both via the studio's publish action (see
// publishWithDates). Filter out the theoretical unpublished-shape case so
// components can rely on a real slug/date instead of widening every prop
// type to allow null.
export function withDefinedSlug<T extends {slug: {current: string} | null; date?: string | null}>(
  items: T[]
): (T & {slug: {current: string}; date: string})[] {
  return items.filter(
    (item): item is T & {slug: {current: string}; date: string} => !!item.slug?.current && !!item.date
  )
}

type DataAttributeConfig = CreateDataAttributeProps &
  Required<Pick<CreateDataAttributeProps, 'id' | 'type' | 'path'>>

export function dataAttr(config: DataAttributeConfig) {
  return createDataAttribute({
    projectId,
    dataset,
    baseUrl: studioUrl,
  }).combine(config)
}
