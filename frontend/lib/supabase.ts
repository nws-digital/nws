import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definition for RSS articles
export type RssArticle = {
  id: string
  title: string
  link: string
  description: string | null
  pub_date: string
  source: string | null
  topic: 'nation' | 'world'
  created_at: string
}
