-- ================================================
-- Supabase Database Setup for Article View Tracking
-- ================================================
-- Run this in your Supabase SQL Editor
-- (Dashboard → SQL Editor → New Query)
--
-- Powers the homepage "Most Read" panel. Records one row per
-- (article, visitor, day) so a single visitor can only inflate an
-- article's count once per day, then ranks articles by view count
-- over a rolling window (see get_most_read_article_ids).
--
-- All access goes through the two RPC functions below, not direct
-- table access -- RLS is enabled with zero policies, so nothing (not
-- even authenticated users) can SELECT/INSERT/UPDATE/DELETE this
-- table directly via PostgREST. SECURITY DEFINER lets the functions
-- bypass RLS while keeping what callers can do narrowly scoped to
-- "record one deduped view" and "read the current ranking."

CREATE TABLE IF NOT EXISTS article_views (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  article_id TEXT NOT NULL,
  visitor_id UUID NOT NULL,
  viewed_on DATE NOT NULL DEFAULT (timezone('utc', now()))::date,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_view_per_day UNIQUE (article_id, visitor_id, viewed_on)
);

CREATE INDEX IF NOT EXISTS idx_article_views_window ON article_views (viewed_on, article_id);

ALTER TABLE article_views ENABLE ROW LEVEL SECURITY;

-- Record a single deduped view. Silently no-ops on invalid input or a
-- repeat view from the same visitor on the same day.
CREATE OR REPLACE FUNCTION record_article_view(p_article_id TEXT, p_visitor_id UUID)
RETURNS void AS $$
BEGIN
  IF p_article_id IS NULL OR length(p_article_id) = 0 OR length(p_article_id) > 200 THEN
    RETURN;
  END IF;

  INSERT INTO article_views (article_id, visitor_id, viewed_on)
  VALUES (p_article_id, p_visitor_id, (timezone('utc', now()))::date)
  ON CONFLICT (article_id, visitor_id, viewed_on) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION record_article_view(TEXT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION record_article_view(TEXT, UUID) TO anon;

-- Top N article ids by view count over the trailing p_days days.
-- p_days is passed in per-call (not hardcoded) so the ranking window
-- (e.g. 7 days vs 24 hours) can be tuned from the app without a migration.
CREATE OR REPLACE FUNCTION get_most_read_article_ids(p_days INT, p_limit INT)
RETURNS TABLE(article_id TEXT, view_count BIGINT) AS $$
  SELECT article_id, count(*) AS view_count
  FROM article_views
  WHERE viewed_on >= (timezone('utc', now()))::date - (p_days - 1)
  GROUP BY article_id
  ORDER BY view_count DESC
  LIMIT p_limit;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

REVOKE ALL ON FUNCTION get_most_read_article_ids(INT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_most_read_article_ids(INT, INT) TO anon;

-- Storage hygiene only -- the ranking query above already filters by
-- viewed_on, so old rows are just inert storage, not a correctness
-- issue. Not wired up to a cron job yet; run manually or schedule
-- later (mirroring the delete_old_rss_articles() GitHub Actions cron
-- in supabase-setup.sql) if row count becomes a concern.
CREATE OR REPLACE FUNCTION delete_old_article_views()
RETURNS TABLE(deleted_count INTEGER) AS $$
DECLARE
  count INTEGER;
BEGIN
  DELETE FROM article_views WHERE viewed_on < (timezone('utc', now()))::date - 35;
  GET DIAGNOSTICS count = ROW_COUNT;
  RETURN QUERY SELECT count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the setup
SELECT 'Setup complete! article_views table and RPCs created.' AS status;
