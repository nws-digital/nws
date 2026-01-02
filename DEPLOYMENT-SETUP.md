# Deployment Setup Guide

## 🎯 Overview

Your deployment is configured with two complete environments:
- **Staging**: For testing before production
- **Production**: Live environment for users

---

## 📋 Prerequisites Checklist

✅ Sanity staging dataset created
✅ Supabase nws-staging project created  
✅ Supabase nws-production project created
⏳ Studio config files created
⏳ GitHub Actions workflows created
⏳ Staging branch created

---

## 🔧 Step 1: Setup Supabase Databases

### For both nws-staging and nws-production:

1. Go to Supabase SQL Editor
2. Run the SQL from `supabase-setup.sql`:

```sql
-- This creates the rss_articles table with all necessary indexes and policies
```

3. Get your credentials:
   - **URL**: Project Settings → API → Project URL
   - **Anon Key**: Project Settings → API → anon public
   - **Service Key**: Project Settings → API → service_role (secret!)

---

## 🔑 Step 2: Get API Tokens

### Sanity Auth Token

```bash
cd studio
npx sanity debug --secrets
```

Copy the token that starts with `sk...`

### Vercel Token

1. Go to https://vercel.com/account/tokens
2. Create new token: "GitHub Actions Deploy"
3. Copy the token

---

## 🔐 Step 3: Add GitHub Secrets

Go to: `https://github.com/nws-digital/nws/settings/secrets/actions`

Add these secrets:

```
SANITY_AUTH_TOKEN=sk...
VERCEL_TOKEN=...

STAGING_SUPABASE_URL=https://...supabase.co
STAGING_SUPABASE_SERVICE_KEY=eyJ...

PROD_SUPABASE_URL=https://qtussqndgqhiyfgvokek.supabase.co
PROD_SUPABASE_SERVICE_KEY=eyJ...
```

---

## 🚀 Step 4: Deploy Studio

### Deploy Staging Studio:

```bash
cd studio
npm run deploy:staging
```

When prompted for hostname, enter: `nws-staging`

### Deploy Production Studio:

```bash
npm run deploy:production
```

When prompted for hostname, enter: `nws`

**Result:**
- Staging: https://nws-staging.sanity.studio
- Production: https://nws.sanity.studio

---

## 🌐 Step 5: Setup Vercel

### Link Frontend to Vercel:

```bash
cd frontend
vercel
```

Follow prompts to create project.

### Add Environment Variables in Vercel Dashboard:

Go to: https://vercel.com/dashboard → Select nws project → Settings → Environment Variables

**For Preview/Development (Staging):**
```
NEXT_PUBLIC_SANITY_PROJECT_ID=01seu5c9
NEXT_PUBLIC_SANITY_DATASET=staging
NEXT_PUBLIC_SANITY_API_VERSION=2025-01-02
NEXT_PUBLIC_SANITY_STUDIO_URL=https://nws-staging.sanity.studio
SANITY_API_READ_TOKEN=(get from Sanity dashboard)

NEXT_PUBLIC_SUPABASE_URL=(staging URL)
NEXT_PUBLIC_SUPABASE_ANON_KEY=(staging anon key)
```

**For Production:**
```
NEXT_PUBLIC_SANITY_PROJECT_ID=01seu5c9
NEXT_PUBLIC_SANITY_DATASET=nws
NEXT_PUBLIC_SANITY_API_VERSION=2025-01-02
NEXT_PUBLIC_SANITY_STUDIO_URL=https://nws.sanity.studio
SANITY_API_READ_TOKEN=(get from Sanity dashboard)

NEXT_PUBLIC_SUPABASE_URL=https://qtussqndgqhiyfgvokek.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=(production anon key)
```

### Configure Git Branches:

In Vercel Dashboard:
- Settings → Git
- **Production Branch**: `main`
- Save

---

## 🔄 Step 6: Push Branches to GitHub

```bash
# Push staging branch
git checkout staging
git add .
git commit -m "feat: setup staging environment"
git push -u origin staging

# Push main branch
git checkout main
git merge staging
git push -u origin main
```

This will trigger the first automated deployment! 🎉

---

## 📊 Step 7: Verify Everything Works

### Check Staging:

1. **Studio**: https://nws-staging.sanity.studio
2. **Frontend**: https://nws-staging.vercel.app (or your Vercel preview URL)
3. **Scraper**: Check GitHub Actions → "RSS Scraper (Staging)"

### Check Production:

1. **Studio**: https://nws.sanity.studio
2. **Frontend**: https://nws.vercel.app
3. **Scraper**: Check GitHub Actions → "RSS Scraper (Production)"

---

## 🎯 Daily Workflow

### Making Changes:

```bash
# 1. Create feature branch from staging
git checkout staging
git pull origin staging
git checkout -b feature/my-new-feature

# 2. Make changes, test locally
cd studio
npm run dev:staging  # Test with staging data

cd frontend
npm run dev

# 3. Commit and push
git add .
git commit -m "feat: add new feature"
git push origin feature/my-new-feature

# 4. Create PR to staging on GitHub
# Merge PR → auto-deploys to staging

# 5. Test in staging environment
# Visit https://nws-staging.vercel.app

# 6. If all good, merge staging to main
git checkout main
git merge staging
git push origin main
# → Auto-deploys to production!
```

---

## 🛠️ Manual Commands

### Deploy Studio Manually:

```bash
cd studio

# Staging
npm run deploy:staging

# Production
npm run deploy:production
```

### Deploy Frontend Manually:

```bash
cd frontend

# Staging
vercel

# Production
vercel --prod
```

### Run Scraper Manually:

```bash
cd scraper
source .venv/bin/activate

# Staging
export SUPABASE_URL="<staging-url>"
export SUPABASE_SERVICE_KEY="<staging-key>"
python main.py

# Production
export SUPABASE_URL="https://qtussqndgqhiyfgvokek.supabase.co"
export SUPABASE_SERVICE_KEY="<production-key>"
python main.py
```

---

## 🔍 Monitoring

### GitHub Actions:

Check: https://github.com/nws-digital/nws/actions

- Scrapers run automatically (every 30 min staging, 15 min production)
- Deployments trigger on git push

### Supabase Dashboard:

- **Staging**: Check article count, recent inserts
- **Production**: Monitor database size, API usage

### Vercel Dashboard:

- Check deployment status
- View build logs
- Monitor bandwidth usage

---

## 🚨 Troubleshooting

### Studio deployment fails:

```bash
# Re-authenticate
npx sanity login

# Try deploying again
npm run deploy:staging
```

### Frontend build fails:

- Check environment variables in Vercel
- Ensure Supabase URLs are correct
- Check build logs in Vercel dashboard

### Scraper fails:

- Check GitHub Actions logs
- Verify Supabase credentials in GitHub Secrets
- Test locally with correct environment variables

---

## 📈 What's Next?

1. ✅ Setup complete
2. Add custom domain in Vercel (e.g., nws.com)
3. Setup monitoring/alerting (e.g., Sentry)
4. Configure content webhooks for instant revalidation
5. Add more RSS feeds as needed

---

## 🎉 You're All Set!

Your news website now has:
- ✅ Automated deployments
- ✅ Staging environment for testing
- ✅ Production environment for users
- ✅ Automated RSS scraping
- ✅ Git-based workflow

**Push to staging → Test → Merge to main → Goes live!** 🚀
