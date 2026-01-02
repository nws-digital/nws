-- ================================================
-- Supabase Database Setup for RSS Articles
-- ================================================
-- Run this in your Supabase SQL Editor
-- (Dashboard → SQL Editor → New Query)

-- Create RSS Articles table
CREATE TABLE
IF NOT EXISTS rss_articles
(
  id UUID DEFAULT gen_random_uuid
() PRIMARY KEY,
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  description TEXT,
  pub_date TIMESTAMPTZ,
  source TEXT,
  topic TEXT NOT NULL CHECK
(topic IN
('nation', 'world')),
  created_at TIMESTAMPTZ DEFAULT NOW
(),
  
  -- Ensure unique links (prevents duplicates)
  CONSTRAINT unique_link UNIQUE
(link)
);

-- Create indexes for fast queries
CREATE INDEX
IF NOT EXISTS idx_topic ON rss_articles
(topic);
CREATE INDEX
IF NOT EXISTS idx_pub_date ON rss_articles
(pub_date DESC);
CREATE INDEX
IF NOT EXISTS idx_created_at ON rss_articles
(created_at);

-- Enable Row Level Security
ALTER TABLE rss_articles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY
IF EXISTS "Allow public read access" ON rss_articles;
DROP POLICY
IF EXISTS "Allow service role to insert" ON rss_articles;
DROP POLICY
IF EXISTS "Allow service role to delete" ON rss_articles;

-- Allow public read access (anyone can read articles)
CREATE POLICY "Allow public read access"
  ON rss_articles FOR
SELECT
    TO public
  USING
(true);

-- Allow service role to insert (for scraper)
CREATE POLICY "Allow service role to insert"
  ON rss_articles FOR
INSERT
  TO service_role
  WITH CHECK (
true);

-- Allow service role to delete (for cleanup)
CREATE POLICY "Allow service role to delete"
  ON rss_articles FOR
DELETE
  TO service_role
  USING (true);

-- Function to auto-delete articles older than 24 hours
CREATE OR REPLACE FUNCTION delete_old_rss_articles
()
RETURNS TABLE
(deleted_count INTEGER) AS $$
DECLARE
  count INTEGER;
BEGIN
    DELETE FROM rss_articles
  WHERE created_at < NOW() - INTERVAL
    '24 hours';

GET DIAGNOSTICS count = ROW_COUNT;

RETURN QUERY
SELECT count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the setup
SELECT 'Setup complete! Table and policies created.' AS status;
