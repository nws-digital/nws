import {useEffect, useMemo, useState} from 'react'
import {Box, Button, Card, Flex, Heading, Stack, Text, TextInput, Spinner} from '@sanity/ui'
import {TrashIcon} from '@sanity/icons'

type Row = {
  id: string
  generated_title: string | null
}

const SUPABASE_URL = process.env.SANITY_STUDIO_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.SANITY_STUDIO_SUPABASE_ANON_KEY!
const TABLE = 'rss_articles'

function headers(extra?: Record<string, string>) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    ...extra,
  }
}

export default function SupabaseTitlesTool() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Record<string, string>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [creating, setCreating] = useState(false)

  const endpoint = useMemo(() => `${SUPABASE_URL}/rest/v1/${TABLE}`, [])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `${endpoint}?select=id,generated_title&order=created_at.desc.nullslast`,
        {headers: headers()},
      )
      if (!res.ok) throw new Error(await res.text())
      setRows(await res.json())
    } catch (e: any) {
      setError(e.message || 'Failed to load rows')
    } finally {
      setLoading(false)
    }
  }

  async function updateTitle(id: string) {
    const value = editing[id]?.trim()
    if (value === undefined || value === null) return
    setError(null)
    try {
      const res = await fetch(`${endpoint}?id=eq.${id}`, {
        method: 'PATCH',
        headers: headers({Prefer: 'return=representation'}),
        body: JSON.stringify({generated_title: value || null}),
      })
      if (!res.ok) {
        throw new Error(await res.text())
      }
      setEditing((prev) => {
        const next = {...prev}
        delete next[id]
        return next
      })
      await load()
    } catch (e: any) {
      setError(e.message || 'Failed to update title')
    }
  }

  async function deleteArticle(id: string) {
    if (!confirm('Are you sure you want to delete this article?')) return
    setError(null)
    try {
      const res = await fetch(`${endpoint}?id=eq.${id}`, {
        method: 'DELETE',
        headers: headers(),
      })
      if (!res.ok) {
        throw new Error(await res.text())
      }
      await load()
    } catch (e: any) {
      setError(e.message || 'Failed to delete article')
    }
  }

  async function createTitle() {
    if (!newTitle.trim()) {
      setError('Title is required')
      return
    }
    setCreating(true)
    setError(null)
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: headers({Prefer: 'return=representation'}),
        body: JSON.stringify({
          title: newTitle.trim(),
          generated_title: newTitle.trim(),
          link: `https://placeholder.com/${Date.now()}`,
          topic: 'nation',
        }),
      })
      if (!res.ok) {
        throw new Error(await res.text())
      }
      setNewTitle('')
      await load()
    } catch (e: any) {
      setError(e.message || 'Failed to create title')
    } finally {
      setCreating(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filteredRows = searchTerm
    ? rows.filter((row) => row.generated_title?.toLowerCase().includes(searchTerm.toLowerCase()))
    : rows

  return (
    <Box padding={4}>
      <Stack space={4}>
        <Heading size={2}>Generated Titles</Heading>

        {/* Create New Title */}
        <Card padding={3} radius={2} border tone="primary">
          <Stack space={2}>
            <Text size={1} weight="semibold">Create New Title</Text>
            <TextInput
              value={newTitle}
              onChange={(e) => {
                const target = e.currentTarget || e.target
                setNewTitle(target?.value || '')
              }}
              placeholder="Enter a new title..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newTitle.trim()) {
                  createTitle()
                }
              }}
            />
            <Button
              text={creating ? 'Creating...' : 'Create'}
              tone="positive"
              onClick={createTitle}
              disabled={creating || !newTitle.trim()}
            />
          </Stack>
        </Card>

        {/* Search */}
        <Card padding={3} radius={2} border>
          <Flex gap={2}>
            <TextInput
              value={searchTerm}
              onChange={(e) => {
                const target = e.currentTarget || e.target
                setSearchTerm(target?.value || '')
              }}
              placeholder="Search titles..."
              style={{flex: 1}}
            />
            <Button text="Refresh" mode="ghost" onClick={load} disabled={loading} />
          </Flex>
        </Card>

        {loading && (
          <Flex justify="center" padding={4}>
            <Spinner />
          </Flex>
        )}

        {error && (
          <Card padding={3} radius={2} tone="critical">
            <Text size={1}>{error}</Text>
          </Card>
        )}

        <Text size={1} muted>
          Showing {filteredRows.length} of {rows.length} articles
        </Text>

        {/* Articles List */}
        <Stack space={3}>
          {filteredRows.map((row) => (
            <Card key={row.id} padding={3} radius={2} border>
              <Stack space={2}>
                <TextInput
                  value={editing[row.id] ?? row.generated_title ?? ''}
                  onChange={(e) => {
                    const target = e.currentTarget || e.target
                    const value = target?.value || ''
                    setEditing((prev) => ({...prev, [row.id]: value}))
                  }}
                  fontSize={2}
                />
                <Flex gap={2}>
                  {editing[row.id] !== undefined && editing[row.id] !== row.generated_title && (
                    <Button text="Save" tone="positive" onClick={() => updateTitle(row.id)} />
                  )}
                  <Button
                    text="Delete"
                    tone="critical"
                    icon={TrashIcon}
                    onClick={() => deleteArticle(row.id)}
                  />
                </Flex>
              </Stack>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Box>
  )
}
