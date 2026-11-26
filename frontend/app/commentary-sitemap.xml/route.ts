import {buildCategoryArticleSitemapXml, xmlResponse} from '@/lib/sitemap'

export const revalidate = 300

export async function GET() {
  return xmlResponse(await buildCategoryArticleSitemapXml('commentary'))
}
