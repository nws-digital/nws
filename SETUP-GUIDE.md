# 🚀 Quick Setup Guide - Hybrid Architecture

Follow these steps to get your news website running with Supabase + Sanity.

---

## ✅ Step 1: Create Supabase Project

1. Go to **[supabase.com](https://supabase.com)** → Sign up/Login
2. Click **"New Project"**
3. Choose:
   - Organization: Your organization
   - Name: `nws` (or your preferred name)
   - Database Password: **Save this password!**
   - Region: Choose closest to you
4. Wait ~2 minutes for project to be created

---

## ✅ Step 2: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy the entire contents of [`supabase-setup.sql`](supabase-setup.sql)
4. Paste into the SQL editor
5. Click **"Run"** (or press Cmd/Ctrl + Enter)
6. You should see: `Setup complete! Table and policies created.`

---

## ✅ Step 3: Get Supabase Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:

   ```
   Project URL: https://xxxxxxxxxxxxx.supabase.co
   anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (this is a secret!)
   ```

⚠️ **IMPORTANT**: Keep the `service_role` key **SECRET** - it has full database access!

---

## ✅ Step 4: Set Up Python Scraper

```bash
cd /Users/charan/Documents/projects/nws

# Run the setup script
./setup-scraper.sh

# Create .env file
cd scraper
cp .env.example .env
nano .env  # or use your preferred editor
```

**Fill in your `.env` file:**
```env
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  (service_role key)
```

Save and exit (Ctrl+X, then Y, then Enter in nano)

---

## ✅ Step 5: Test the Scraper

```bash
# From project root
./run-scraper.sh
```

**Expected output:**
```
🚀 RSS News Scraper (Supabase)
📊 Supabase URL: https://xxxxxxxxxxxxx.supabase.co
⏰ Timestamp: 2026-01-02 14:30:00

📰 Fetching NATION news...
✅ Saved: Breaking news headline...
✅ Saved: Another news article...
📊 NATION: Saved 15, Skipped 0, Errors 0

📰 Fetching WORLD news...
✅ Saved: International news...
📊 WORLD: Saved 15, Skipped 0, Errors 0

🗑️  Deleting articles older than 24 hours...
✅ Deleted 0 old articles

✅ Scraping complete!
```

---

## ✅ Step 6: Set Up Frontend

```bash
cd /Users/charan/Documents/projects/nws/frontend

# Install Supabase package
npm install @supabase/supabase-js

# Create .env.local file
cp .env.example .env.local
nano .env.local  # or use your preferred editor
```

**Fill in your `.env.local` file:**
```env
# Sanity (already configured)
NEXT_PUBLIC_SANITY_PROJECT_ID="01seu5c9"
NEXT_PUBLIC_SANITY_DATASET="nws"
NEXT_PUBLIC_SANITY_API_VERSION="2025-01-02"
NEXT_PUBLIC_SANITY_STUDIO_URL="http://localhost:3333"
SANITY_API_READ_TOKEN="sknzAdVjOs9LcXxjI8icf3jAExOUJiGQMoWgAX0w8VqMbAwscbtKnNBxCSFpz61gKhUlQTdO2nl0S41uW8o1W1HAHdvKUwS1NVKdWy83aVTk83uE0A0oBBfv8KMJ8PECqIwPkjqZzhpsJZHfCE0W6WQRySJyDytZWac5TfHSjRywp8NRGqZT"

# Supabase (add these)
NEXT_PUBLIC_SUPABASE_URL="https://xxxxxxxxxxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  (anon public key)
```

⚠️ Use the **anon public** key here, NOT the service_role key!

---

## ✅ Step 7: Run the Frontend

```bash
cd /Users/charan/Documents/projects/nws/frontend
npm run dev
```

Visit:
- **Homepage**: http://localhost:3000
- **News Page**: http://localhost:3000/news

You should see the RSS articles fetched from Supabase! 🎉

---

## ✅ Step 8: Verify in Supabase

1. Go to **Table Editor** in Supabase dashboard
2. Click on **`rss_articles`** table
3. You should see ~30 articles (15 nation + 15 world)

---

## 🔄 Running the Scraper Regularly

### Option 1: Manual (for testing)
```bash
./run-scraper.sh
```

### Option 2: Cron Job (automated)
```bash
crontab -e

# Add this line to run every 15 minutes:
*/15 * * * * cd /Users/charan/Documents/projects/nws && ./run-scraper.sh >> /tmp/scraper.log 2>&1
```

### Option 3: GitHub Actions (recommended for production)
Already set up in `.github/workflows/scraper.yml` - just add secrets to GitHub.

---

## 🎯 Quick Commands Reference

```bash
# Run scraper
./run-scraper.sh

# Run frontend
cd frontend && npm run dev

# Run studio
cd studio && npm run dev

# View scraper logs (if using cron)
tail -f /tmp/scraper.log

# Check Supabase data
# Go to supabase.com → Your Project → Table Editor → rss_articles
```

---

## 🐛 Troubleshooting

### "Module not found: supabase"
```bash
cd scraper
source .venv/bin/activate
pip install supabase
```

### "Error: Missing environment variable NEXT_PUBLIC_SUPABASE_URL"
- Check that `.env.local` exists in `frontend/`
- Verify the variable names match exactly

### No articles showing on /news page
1. Check if scraper ran successfully: `./run-scraper.sh`
2. Verify data in Supabase Table Editor
3. Check browser console for errors (F12)

### Articles are duplicated
- Scraper uses UNIQUE constraint on `link` field - duplicates are automatically prevented
- If you see duplicates, check if the links are actually different

---

## ✅ Done!

Your hybrid architecture is now set up:
- ✅ Sanity CMS for author content
- ✅ Supabase for RSS articles (unlimited reads!)
- ✅ Python scraper fetching news
- ✅ Next.js frontend displaying everything

**Both free tiers = $0/month!** 🎉
