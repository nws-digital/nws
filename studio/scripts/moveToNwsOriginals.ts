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
 * DRY RUN by default -- prints what would change and writes nothing.
 *
 *   # staging (default dataset)
 *   npx sanity exec scripts/moveToNwsOriginals.ts --with-user-token
 *   MIGRATE_WRITE=1 npx sanity exec scripts/moveToNwsOriginals.ts --with-user-token
 *
 *   # production
 *   SANITY_STUDIO_DATASET=production npx sanity exec scripts/moveToNwsOriginals.ts --with-user-token
 *   SANITY_STUDIO_DATASET=production MIGRATE_WRITE=1 npx sanity exec scripts/moveToNwsOriginals.ts --with-user-token
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-01-01'})
const TARGET_CATEGORY = 'osint-exclusive'
const write = process.env.MIGRATE_WRITE === '1'

type Row = {
  _id: string
  title?: string
  category?: string
  author?: {firstName?: string; lastName?: string} | null
}

const isDesk = (author: Row['author']) =>
  /\bdesk\b/i.test(`${author?.firstName ?? ''} ${author?.lastName ?? ''}`)

async function run() {
  const {projectId, dataset} = client.config()
  console.log(`Project ${projectId} / dataset "${dataset}" -- ${write ? 'WRITE MODE' : 'dry run (nothing will be written)'}\n`)

  const rows = await client.fetch<Row[]>(
    `*[_type == "article"]{_id, title, category, "author": author->{firstName, lastName}}`
  )

  const toMove = rows.filter(
    (r) => r.category !== TARGET_CATEGORY && r.category !== 'commentary' && !isDesk(r.author)
  )

  const summary: Record<string, number> = {}
  for (const r of toMove) {
    const who = r.author ? `${r.author.firstName ?? ''} ${r.author.lastName ?? ''}`.trim() : '(no author)'
    const key = `${who}  [${r.category} -> ${TARGET_CATEGORY}]`
    summary[key] = (summary[key] ?? 0) + 1
    console.log(`${r._id.startsWith('drafts.') ? 'draft ' : 'pub   '} ${r._id}  ${r.title ?? ''}`)
  }

  console.log('\nSummary (documents, drafts counted separately):')
  Object.entries(summary).sort().forEach(([k, n]) => console.log(`  ${String(n).padStart(3)}  ${k}`))
  console.log(`\n${toMove.length} of ${rows.length} article documents would move.`)

  if (!write || toMove.length === 0) return

  const tx = client.transaction()
  toMove.forEach((r) => tx.patch(r._id, (p) => p.set({category: TARGET_CATEGORY})))
  await tx.commit()
  console.log('Done.')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
