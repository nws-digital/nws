# RSS News Scraper

Simple RSS scraper that fetches NATION and WORLD news from Google News and saves to Sanity CMS.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Fill in your Sanity credentials in `.env`:
- `SANITY_PROJECT_ID`: Your Sanity project ID (found in `studio/sanity.config.ts`)
- `SANITY_DATASET`: Your dataset name (usually "production")
- `SANITY_API_TOKEN`: Create a token with write permissions at https://sanity.io/manage

## Usage

Run the scraper manually:
```bash
python main.py
```

## Automated Execution

To run this every 15 minutes, you can use:

### Option 1: Cron (Linux/Mac)
```bash
*/15 * * * * cd /path/to/nws/scraper && python main.py
```

### Option 2: GitHub Actions
See `.github/workflows/rss-scraper.yml` for automated cloud execution

## How it Works

1. Fetches RSS feeds from Google News for NATION and WORLD topics
2. Parses article data (title, link, description, pubDate, source)
3. Saves each article to Sanity as `rssArticle` document type
4. Logs progress and errors

## RSS Feed URLs

- **NATION**: US national news
- **WORLD**: International news

Both feeds are from Google News RSS (en-US, United States region).
