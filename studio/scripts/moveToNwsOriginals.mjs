/**
 * One-off migration: moves every article that is NOT written by a "Desk"
 * author (NWS Desk, NWS North America Desk, NWS Asia Desk, ...) into the
 * NWS Originals category (stored value `osint-exclusive`).
 *
 * Rules
 *  - Author's name contains the word "Desk"  -> left exactly where it is
 *  - Commentary articles                     -> left alone (own section)
 *  - Everything else (incl. no author)       -> category = osint-exclusive
 *  - Drafts are patched too, so publishing a pending draft doesn't undo the move
 *
 * Plain Node script (no `sanity` CLI / esbuild needed). DRY RUN by default:
 * prints what would change and writes nothing.
 *
 * Environment
 *   SANITY_STUDIO_DATASET  staging (default) | production
 *   SANITY_TOKEN           API token. A read-only token is enough for the dry run;
 *                          a token with Editor access is needed to write.
 *                          (Dry run falls back to SANITY_API_READ_TOKEN from frontend/.env.local)
 *   MIGRATE_WRITE=1        actually write the changes
 *
 * Usage (from the studio/ folder)
 *   npm run move-to-nws-originals                                   # staging dry run
 *   SANITY_TOKEN=... MIGRATE_WRITE=1 npm run move-to-nws-originals  # staging write
 *   SANITY_STUDIO_DATASET=production npm run move-to-nws-originals  # production dry run
 *   SANITY_STUDIO_DATASET=production SANITY_TOKEN=... MIGRATE_WRITE=1 npm run move-to-nws-originals
 */
import fs from 'node:fs'
import {createClient} from '@sanity/client'

const PROJECT_ID = process.env.SANITY_STUDIO_PROJECT_ID || '01seu5c9'
const DATASET = process.env.SANITY_STUDIO_DATASET || 'staging'
const TARGET_CATEGORY = 'osint-exclusive'
const write = process.env.MIGRATE_WRITE === '1'

function readFrontendReadToken() {
  try {
    const env = fs.readFileSync(new URL('../../frontend/.env.local', import.meta.url), 'utf8')
    const line = env.split('\n').find((l) => l.startsWith('SANITY_API_READ_TOKEN='))
    return line?.slice(line.indexOf('=') + 1).trim().replace(/^"|"$/g, '')
  } catch {
    return undefined
  }
}

const token = process.env.SANITY_TOKEN || (write ? undefined : readFrontendReadToken())
if (!token) {
  console.error(
    write
      ? 'Writing needs SANITY_TOKEN (a token with Editor access).'
      : 'No token found. Set SANITY_TOKEN, or keep SANITY_API_READ_TOKEN in frontend/.env.local.',
  )
  process.exit(1)
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
  perspective: 'raw', // include drafts
})

const nameOf = (author) =>
  author ? `${author.firstName ?? ''} ${author.lastName ?? ''}`.replace(/\s+/g, ' ').trim() : ''
const isDesk = (author) => /\bdesk\b/i.test(nameOf(author))

async function run() {
  console.log(
    `Project ${PROJECT_ID} / dataset "${DATASET}" -- ${write ? 'WRITE MODE' : 'dry run (nothing will be written)'}\n`,
  )

  const rows = await client.fetch(
    `*[_type == "article"]{_id, title, category, "author": author->{firstName, lastName}}`,
  )

  const toMove = rows.filter(
    (r) => r.category !== TARGET_CATEGORY && r.category !== 'commentary' && !isDesk(r.author),
  )

  const summary = {}
  for (const r of toMove) {
    const who = nameOf(r.author) || '(no author)'
    const key = `${who}  [${r.category} -> ${TARGET_CATEGORY}]`
    summary[key] = (summary[key] ?? 0) + 1
    console.log(`${r._id.startsWith('drafts.') ? 'draft ' : 'pub   '} ${r._id}  ${r.title ?? ''}`)
  }

  console.log('\nSummary (documents, drafts counted separately):')
  Object.entries(summary)
    .sort()
    .forEach(([k, n]) => console.log(`  ${String(n).padStart(3)}  ${k}`))
  console.log(`\n${toMove.length} of ${rows.length} article documents would move.`)

  if (!write) {
    console.log('\nDry run only. Re-run with MIGRATE_WRITE=1 (and SANITY_TOKEN) to apply.')
    return
  }
  if (toMove.length === 0) return

  const tx = client.transaction()
  toMove.forEach((r) => tx.patch(r._id, (p) => p.set({category: TARGET_CATEGORY})))
  await tx.commit()
  console.log('Done.')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
