/**
 * One-off migration: renames the `category` value stored on existing
 * `article` documents so it matches the new short slugs used in the
 * codebase (world-exclusive -> world, india-exclusive -> india,
 * osint-exclusive -> osint). `commentary` is untouched.
 *
 * Run this ONCE after deploying the code changes that renamed the
 * category values in studio/src/schemaTypes/documents/article.ts.
 *
 * Usage:
 *   SANITY_PROJECT_ID=xxxx \
 *   SANITY_DATASET=production \
 *   SANITY_WRITE_TOKEN=sk... \
 *   node scripts/migrate-category-slugs.mjs
 *
 * Add --dry-run to preview the changes without writing anything:
 *   node scripts/migrate-category-slugs.mjs --dry-run
 *
 * The write token needs "Editor" (or higher) permissions. Create one at
 * https://www.sanity.io/manage -> your project -> API -> Tokens.
 */

import {createClient} from '@sanity/client'

const RENAME_MAP = {
  'world-exclusive': 'world',
  'india-exclusive': 'india',
  'osint-exclusive': 'osint',
}

const dryRun = process.argv.includes('--dry-run')

const projectId = process.env.SANITY_PROJECT_ID
const dataset = process.env.SANITY_DATASET || 'production'
const token = process.env.SANITY_WRITE_TOKEN

if (!projectId || !token) {
  console.error(
    'Missing SANITY_PROJECT_ID and/or SANITY_WRITE_TOKEN environment variables.',
  )
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

async function run() {
  const oldValues = Object.keys(RENAME_MAP)
  const query = `*[_type == "article" && category in $oldValues]{_id, category}`
  const docs = await client.fetch(query, {oldValues})

  if (docs.length === 0) {
    console.log('No articles found with an old category value. Nothing to do.')
    return
  }

  console.log(`Found ${docs.length} article(s) to update:`)
  for (const doc of docs) {
    console.log(`  ${doc._id}: ${doc.category} -> ${RENAME_MAP[doc.category]}`)
  }

  if (dryRun) {
    console.log('\nDry run only — no changes written. Re-run without --dry-run to apply.')
    return
  }

  const transaction = client.transaction()
  for (const doc of docs) {
    transaction.patch(doc._id, {set: {category: RENAME_MAP[doc.category]}})
  }
  const result = await transaction.commit()
  console.log(`\nDone. Updated ${docs.length} document(s).`)
  return result
}

run().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
