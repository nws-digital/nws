-- ================================================
-- Supabase Database Setup for Article View Tracking
-- ================================================
-- Run this in your Supabase SQL Editor
-- (Dashboard → SQL Editor → New Query)
--
-- Powers the homepage "Most Read" panel. Keeps ONE row per
-- (article, day) with a running view count, so the table's size depends
-- on the number of articles x days kept -- NOT on traffic.
--
-- Safe to re-run. Staging and production can share this table: Sanity
-- article _ids differ between the two datasets, and only production
-- records views (see frontend/app/api/views/route.ts).
--
-- All access goes through the RPC functions below, not direct table
-- access -- RLS is enabled with zero policies, so nothing can
-- SELECT/INSERT/UPDATE/DELETE this table directly via PostgREST.

CREATE TABLE IF NOT EXISTS article_daily_views (
  article_id TEXT NOT NULL,
  viewed_on DATE NOT NULL DEFAULT (timezone('utc', now()))::date,
  view_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (article_id, viewed_on)
);

ALTER TABLE article_daily_views ENABLE ROW LEVEL SECURITY;

-- One-time carry-over of existing data from the old per-visitor table
-- (only runs if that table still exists).
DO $$
BEGIN
  IF to_regclass('public.article_views') IS NOT NULL THEN
    INSERT INTO article_daily_views (article_id, viewed_on, view_count)
    SELECT article_id, viewed_on, count(*)
    FROM article_views
    GROUP BY article_id, viewed_on
    ON CONFLICT (article_id, viewed_on) DO NOTHING;
  END IF;
END $$;

-- Add one view for an article today. Silently no-ops on invalid input.
CREATE OR REPLACE FUNCTION record_article_view(p_article_id TEXT)
RETURNS void AS $$
BEGIN
  IF p_article_id IS NULL OR length(p_article_id) = 0 OR length(p_article_id) > 200 THEN
    RETURN;
  END IF;

  INSERT INTO article_daily_views (article_id, viewed_on, view_count)
  VALUES (p_article_id, (timezone('utc', now()))::date, 1)
  ON CONFLICT (article_id, viewed_on)
  DO UPDATE SET view_count = article_daily_views.view_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION record_article_view(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION record_article_view(TEXT) TO anon;

-- Top N article ids by view count over the trailing p_days days.
-- p_days is passed in per-call (not hardcoded) so the ranking window
-- (e.g. 7 days vs 24 hours) can be tuned from the app without a migration.
CREATE OR REPLACE FUNCTION get_most_read_article_ids(p_days INT, p_limit INT)
RETURNS TABLE(article_id TEXT, view_count BIGINT) AS $$
  SELECT article_id, sum(view_count)::BIGINT AS view_count
  FROM article_daily_views
  WHERE viewed_on >= (timezone('utc', now()))::date - (p_days - 1)
  GROUP BY article_id
  ORDER BY view_count DESC
  LIMIT p_limit;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

REVOKE ALL ON FUNCTION get_most_read_article_ids(INT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_most_read_article_ids(INT, INT) TO anon;

-- Keep the table small: the ranking only reads the last 7 days, so keep 8.
-- (Dropped first: an older version with a different return type may exist.)
DROP FUNCTION IF EXISTS delete_old_article_views();

CREATE OR REPLACE FUNCTION delete_old_article_views()
RETURNS void AS $$
  DELETE FROM article_daily_views
  WHERE viewed_on < (timezone('utc', now()))::date - 8;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION delete_old_article_views() FROM PUBLIC;

-- Run the cleanup every day at 03:15 UTC with pg_cron.
-- If this fails, enable the extension first: Dashboard → Database → Extensions → pg_cron.
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('delete-old-article-views', '15 3 * * *', $$SELECT delete_old_article_views()$$);

-- ------------------------------------------------
-- STEP 2 -- run ONLY after the new frontend is deployed everywhere
-- (production, and staging if it shares this database):
-- removes the old per-visitor table and its function.
-- ------------------------------------------------
-- DROP FUNCTION IF EXISTS record_article_view(TEXT, UUID);
-- DROP TABLE IF EXISTS article_views;

SELECT 'Setup complete! article_daily_views table and RPCs created.' AS status;
