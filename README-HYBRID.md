# RSS News Website - Hybrid Architecture

This project uses a **hybrid architecture** with **Sanity CMS** for author content and **Supabase PostgreSQL** for high-volume RSS articles.

## 🏗️ Architecture

```
┌─────────────────────┐
│  Author Content     │
│  (Articles, Pages)  │ → Sanity CMS (Studio UI)
└─────────────────────┘
          ↓
    Sanity API (~5k reads/month)
          ↓
┌─────────────────────┐
│  Next.js Frontend   │
└─────────────────────┘
          ↓
┌─────────────────────┐
│  RSS Articles       │
│  (Nation, World)    │ → Supabase PostgreSQL (unlimited reads)
└─────────────────────┘
          ↑
    Python Scraper
```

## 📁 Project Structure

```
nws/
├── frontend/          # Next.js frontend application
│   ├── app/
│   │   └── news/      # RSS news page (fetches from Supabase)
│   ├── lib/
│   │   └── supabase.ts # Supabase client
│   └── sanity/        # Sanity queries and client
├── studio/            # Sanity Studio CMS
├── scraper/           # Python RSS scraper
│   ├── main.py        # Scraper script
│   ├── requirements.txt
│   └── .env           # Supabase credentials
└── supabase-setup.sql # Database schema
```

## 🚀 Setup

### 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **anon key** from Settings → API
3. Run the SQL setup script in Supabase SQL Editor:
   ```bash
   # Copy contents of supabase-setup.sql and run in Supabase SQL Editor
   ```

### 2. Scraper Setup

```bash
# Run the setup script
chmod +x setup-scraper.sh
./setup-scraper.sh

# Create .env file
cd scraper
cp .env.example .env
# Edit .env and add your Supabase credentials
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Add Supabase package
npm install @supabase/supabase-js

# Create .env.local file
cp .env.example .env.local
# Edit .env.local and add your Supabase credentials

# Run development server
npm run dev
```

### 4. Studio Setup

```bash
cd studio

# Install dependencies
npm install

# Run development server
npm run dev
```

## 🎯 Usage

### Run the Scraper

```bash
# From project root
./run-scraper.sh

# Or manually
cd scraper
source .venv/bin/activate
python3 main.py
```

### View the Website

- **Frontend**: http://localhost:3000
- **News Page**: http://localhost:3000/news
- **Studio**: http://localhost:3333

## 📊 Data Flow

### RSS Articles (Supabase)
1. **Scraper** fetches RSS feeds every 15 minutes
2. Articles saved to **Supabase** `rss_articles` table
3. **Frontend** queries Supabase directly (unlimited reads)
4. Articles auto-delete after 24 hours

### Author Content (Sanity)
1. Content created in **Sanity Studio**
2. **Frontend** queries Sanity API
3. Low volume = within free tier limits

## 🔧 Environment Variables

### Frontend (.env.local)
```env
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=01seu5c9
NEXT_PUBLIC_SANITY_DATASET=nws
SANITY_API_READ_TOKEN=your-token

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Scraper (.env)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

## 📈 Scaling

Both services are on **free tiers**:

- **Sanity Free**: 100k API requests/month (low author content usage)
- **Supabase Free**: Unlimited API requests (high RSS article usage)

This architecture keeps costs at **$0/month** while handling significant traffic! 🎉

## 🔄 Automated Scraping

To run the scraper automatically, set up a cron job or GitHub Actions:

### GitHub Actions (Recommended)
See `.github/workflows/scraper.yml` for automated scraping every 15 minutes.

### Cron Job (Alternative)
```bash
crontab -e

# Add this line to run every 15 minutes
*/15 * * * * cd /path/to/nws && ./run-scraper.sh
```

## 🐛 Troubleshooting

### Scraper Issues
```bash
# Check if dependencies are installed
cd scraper
source .venv/bin/activate
pip list

# Test Supabase connection
python3 -c "from supabase import create_client; print('✅ Supabase OK')"
```

### Frontend Issues
```bash
# Check if Supabase package is installed
cd frontend
npm list @supabase/supabase-js

# Test environment variables
npm run dev
# Check browser console for errors
```

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Sanity Documentation](https://www.sanity.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
