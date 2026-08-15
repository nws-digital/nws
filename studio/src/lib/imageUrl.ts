import imageUrlBuilder from '@sanity/image-url'
import type {Image} from 'sanity'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || '01seu5c9'
const dataset = process.env.SANITY_STUDIO_DATASET || 'staging'

const builder = imageUrlBuilder({projectId, dataset})

/**
 * Builds a thumbnail URL that respects a saved crop/hotspot, for use in
 * Studio previews (e.g. Portable Text block previews) where Sanity's
 * default preview media doesn't apply crop automatically.
 *
 * Only constrains width - passing both width and height would make
 * @sanity/image-url lock an aspect ratio and re-crop the already-cropped
 * rect to fit it, over-cropping the image. Leaving height unset lets the
 * output follow the crop rect's own aspect ratio.
 */
export function urlForCroppedThumbnail(source?: Image, width = 400) {
  if (!source?.asset?._ref) return undefined
  return builder.image(source).width(width).auto('format').url()
}
