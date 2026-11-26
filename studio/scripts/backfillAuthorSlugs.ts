/**
 * One-off backfill: generates a unique slug for every existing `person`
 * document that doesn't have one yet (the `slug` field was added after
 * these authors were created, as part of the /author/[slug] URL migration).
 *
 * Run with: npx sanity exec scripts/backfillAuthorSlugs.ts --with-user-token
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-01-01'})

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function run() {
  const authorsMissingSlug = await client.fetch<Array<{_id: string; firstName?: string; lastName?: string}>>(
    `*[_type == "person" && !defined(slug.current)]{_id, firstName, lastName}`
  )

  if (authorsMissingSlug.length === 0) {
    console.log('No person documents are missing a slug.')
    return
  }

  const existingSlugs = new Set(
    await client.fetch<string[]>(`*[_type == "person" && defined(slug.current)].slug.current`)
  )

  const tx = client.transaction()

  for (const author of authorsMissingSlug) {
    const base = slugify(`${author.firstName ?? ''} ${author.lastName ?? ''}`.trim()) || author._id
    let candidate = base
    let suffix = 2
    while (existingSlugs.has(candidate)) {
      candidate = `${base}-${suffix}`
      suffix += 1
    }
    existingSlugs.add(candidate)

    console.log(`${author._id} -> ${candidate}`)
    tx.patch(author._id, (p) => p.set({slug: {_type: 'slug', current: candidate}}))
  }

  await tx.commit()
  console.log(`Backfilled ${authorsMissingSlug.length} author slug(s).`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
