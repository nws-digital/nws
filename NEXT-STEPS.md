# 🚀 Quick Start - Next Steps

## ✅ What's Done

- ✅ Sanity staging dataset created
- ✅ Supabase nws-staging project created
- ✅ Supabase nws-production project created
- ✅ Studio config files created (staging & production)
- ✅ GitHub Actions workflows created
- ✅ Staging branch created and committed

---

## 📝 What You Need to Do Next

### 1️⃣ Setup Supabase Databases (5 minutes)

Run the SQL from `supabase-setup.sql` in BOTH projects:

**Staging:** https://supabase.com/dashboard/project/nws-staging/sql/new
**Production:** https://supabase.com/dashboard/project/nws-production/sql/new

Then collect these credentials:

```bash
# STAGING
STAGING_SUPABASE_URL=https://...supabase.co
STAGING_SUPABASE_ANON_KEY=eyJ...
STAGING_SUPABASE_SERVICE_KEY=eyJ...

# PRODUCTION  
PROD_SUPABASE_URL=https://qtussqndgqhiyfgvokek.supabase.co
PROD_SUPABASE_ANON_KEY=eyJ...
PROD_SUPABASE_SERVICE_KEY=eyJ...
```

---

### 2️⃣ Get API Tokens (3 minutes)

**Sanity Token:**
```bash
cd studio
npx sanity debug --secrets
# Copy the token starting with sk...
```

**Vercel Token:**
1. Visit: https://vercel.com/account/tokens
2. Create token: "GitHub Actions"
3. Copy it

---

### 3️⃣ Add GitHub Secrets (3 minutes)

Visit: https://github.com/nws-digital/nws/settings/secrets/actions

Add these 6 secrets:
```
SANITY_AUTH_TOKEN
VERCEL_TOKEN
STAGING_SUPABASE_URL
STAGING_SUPABASE_SERVICE_KEY
PROD_SUPABASE_URL
PROD_SUPABASE_SERVICE_KEY
```

---

### 4️⃣ Deploy Studios (5 minutes)

```bash
cd studio

# Deploy staging
npm run deploy:staging
# Hostname: nws-staging

# Deploy production  
npm run deploy:production
# Hostname: nws
```

**URLs:**
- Staging: https://nws-staging.sanity.studio
- Production: https://nws.sanity.studio

---

### 5️⃣ Setup Vercel (10 minutes)

```bash
cd frontend
npm install -g vercel
vercel
```

Then in Vercel Dashboard:
1. Add environment variables (staging + production)
2. Settings → Git → Production Branch: `main`

**Get Sanity Read Token:** https://sanity.io/manage/personal/tokens

---

### 6️⃣ Push to GitHub (2 minutes)

```bash
# Push staging branch
git push -u origin staging

# Merge to main and push
git checkout main
git merge staging
git push -u origin main
```

This triggers the first deployment! 🎉

---

## 🎯 Total Time: ~30 minutes

Follow the detailed guide in: **DEPLOYMENT-SETUP.md**

---

## 🆘 Quick Commands

```bash
# Local development
cd studio && npm run dev:staging
cd frontend && npm run dev

# Manual deploy
cd studio && npm run deploy:staging
cd frontend && vercel

# Check status
# GitHub Actions: https://github.com/nws-digital/nws/actions
# Vercel: https://vercel.com/dashboard
```

---

## 📞 Need Help?

Check **DEPLOYMENT-SETUP.md** for:
- Detailed step-by-step instructions
- Troubleshooting guide
- Daily workflow examples
- Monitoring tips

**You got this! 💪**
