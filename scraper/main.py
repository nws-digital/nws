#!/usr/bin/env python3
"""
RSS News Scraper for NATION and WORLD topics (India)
Fetches news from Google News RSS feeds and saves to Supabase
Uses async httpx for better performance
"""

import os
import asyncio
from datetime import datetime
from typing import List, Dict, Any
import httpx
import xmltodict
from supabase import create_client, Client
from dotenv import load_dotenv
from anthropic import Anthropic

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_KEY')
)

# Initialize Claude client
anthropic_client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

# Google News RSS feed URLs (India-based)
RSS_FEEDS = {
    'nation': 'https://news.google.com/rss/topics/CAAqJQgKIh9DQkFTRVFvSUwyMHZNRE55YXpBU0JXVnVMVWRDS0FBUAE?hl=en-IN&gl=IN&ceid=IN:en',
    'world': 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtVnVHZ0pKVGlnQVAB?hl=en-IN&gl=IN&ceid=IN:en'
}


async def fetch_rss_feed(url: str) -> Dict[str, Any]:
    """
    Fetch RSS feed using httpx and parse with xmltodict
    
    Args:
        url: RSS feed URL
        
    Returns:
        Parsed RSS feed as dictionary
    """
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(url)
            response.raise_for_status()
        
        # Parse RSS XML to JSON/dict
        rss_data = xmltodict.parse(response.text)
        return rss_data
        
    except httpx.TimeoutException:
        print(f"⏱️  Timeout fetching RSS feed")
        return {}
    except httpx.HTTPError as e:
        print(f"❌ HTTP error: {e}")
        return {}
    except Exception as e:
        print(f"❌ Error fetching RSS feed: {e}")
        return {}


def parse_article(item: Dict[str, Any]) -> Dict[str, Any]:
    """
    Parse article data from RSS item
    
    Args:
        item: RSS item dictionary
        
    Returns:
        Cleaned article data
    """
    # Handle both dict and string for source
    source = 'Google News'
    if 'source' in item:
        source_data = item['source']
        if isinstance(source_data, dict):
            source = source_data.get('#text', source_data.get('title', 'Google News'))
        elif isinstance(source_data, str):
            source = source_data
    
    return {
        'title': item.get('title', 'No Title'),
        'link': item.get('link', ''),
        'description': item.get('description', ''),
        'pub_date': item.get('pubDate', datetime.now().isoformat()),
        'source': source,
    }


def count_links_in_description(description: str) -> int:
    """
    Count the number of links in the description field
    
    Args:
        description: HTML description string
        
    Returns:
        Number of links found
    """
    if not description:
        return 0
    
    # Count occurrences of <a href= which indicates a link
    return description.lower().count('<a href=')


async def generate_unique_title_with_gemini(original_title: str, link: str, description: str) -> str:
    """
    Generate a unique professional title using Claude AI
    
    Args:
        original_title: Original article title
        link: Article link
        description: Article description with similar article links
        
    Returns:
        New professionally crafted title
    """
    try:
        prompt = f"""You are a professional journalist. Based on the following article information, create a unique, self-explanatory news headline that tells the complete story.

Original Title: {original_title}
Article Link: {link}
Description (with similar articles): {description[:800]}

Requirements:
1. Make it COMPLETELY SELF-EXPLANATORY - readers should understand the full story from just the title
2. Include WHO, WHAT, WHERE, and WHY/WHEN if relevant
3. Be specific with names, places, and numbers
4. Keep it under 150 characters but prioritize clarity over brevity
5. Use active voice and present tense
6. Sound professional and journalistic, not clickbait
7. Return ONLY the headline, nothing else

New Headline:"""

        response = await asyncio.to_thread(
            anthropic_client.messages.create,
            model="claude-sonnet-4-20250514",
            max_tokens=200,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )
        
        new_title = response.content[0].text.strip()
        
        # Remove quotes if present
        if new_title.startswith('"') and new_title.endswith('"'):
            new_title = new_title[1:-1]
        if new_title.startswith("'") and new_title.endswith("'"):
            new_title = new_title[1:-1]
        
        # Limit to 200 characters
        if len(new_title) > 200:
            new_title = new_title[:197] + "..."
            
        return new_title
        
    except Exception as e:
        print(f"⚠️  Claude API error: {str(e)[:100]}")
        return original_title  # Fallback to original title


async def fetch_and_save_articles(topic: str, feed_url: str):
    """
    Fetch RSS feed and save articles to Supabase
    
    Args:
        topic: Topic name (nation or world)
        feed_url: RSS feed URL
    """
    print(f"\n📰 Fetching {topic.upper()} news...")
    
    # Fetch RSS feed
    rss_data = await fetch_rss_feed(feed_url)
    print(f"🔗 Fetched {len(rss_data.get('rss', {}).get('channel', {}).get('item', []))} articles for {topic}")
    
    if not rss_data:
        print(f"⚠️  No data fetched for {topic}")
        return
    
    # Extract items from RSS feed
    try:
        channel = rss_data.get('rss', {}).get('channel', {})
        items = channel.get('item', [])
        
        # Ensure items is a list (single item returns dict)
        if isinstance(items, dict):
            items = [items]
        
        if not items:
            print(f"⚠️  No articles found for {topic}")
            return
        
        saved_count = 0
        skipped_count = 0
        error_count = 0
        filtered_count = 0  # Articles filtered out due to insufficient links
        target_count = 10  # Target number of articles to insert
        
        # Process articles until we insert 10 new ones or run out of articles
        for item in items:
            # Stop if we've successfully inserted 10 articles
            if saved_count >= target_count:
                break
            
            # Check if description has 3 or more links
            description = item.get('description', '')
            link_count = count_links_in_description(description)
            
            if link_count < 3:
                print(f"⚠️  Filtered (only {link_count} links): {item.get('title', '')[:50]}...")
                filtered_count += 1
                continue
                
            try:
                # Parse article data
                article_data = parse_article(item)
                article_data['topic'] = topic
                
                # Insert into Supabase
                result = supabase.table('rss_articles').insert(article_data).execute()
                
                # Get the inserted article ID
                inserted_article = result.data[0] if result.data else None
                
                if inserted_article:
                    article_id = inserted_article.get('id')
                    print(f"✅ Saved ({link_count} sources): {article_data['title'][:60]}...")
                    
                    # Generate unique title with Claude
                    print(f"🤖 Generating unique title with Claude...")
                    new_title = await generate_unique_title_with_gemini(
                        article_data['title'],
                        article_data['link'],
                        article_data['description']
                    )
                    
                    # Update article with generated title
                    if new_title != article_data['title']:
                        supabase.table('rss_articles').update({
                            'generated_title': new_title
                        }).eq('id', article_id).execute()
                        print(f"✨ Generated title: {new_title[:60]}...")
                    else:
                        print(f"ℹ️  Kept original title")
                    
                    saved_count += 1
                
            except Exception as e:
                error_msg = str(e).lower()
                if 'duplicate key' in error_msg or 'unique constraint' in error_msg:
                    print(f"⏭️  Skipped (exists): {item.get('title', '')[:50]}...")
                    skipped_count += 1
                else:
                    print(f"❌ Error: {str(e)[:100]}")
                    error_count += 1
        
        if saved_count == 0 and skipped_count > 0:
            print(f"ℹ️  All articles already exist in database for {topic.upper()}")
        
        print(f"📊 {topic.upper()}: Saved {saved_count}, Skipped {skipped_count}, Filtered {filtered_count}, Errors {error_count}")
        
    except Exception as e:
        print(f"❌ Error parsing {topic} feed: {e}")


def delete_old_articles():
    """Delete articles older than 24 hours"""
    print("\n🗑️  Deleting articles older than 24 hours...")
    
    try:
        result = supabase.rpc('delete_old_rss_articles').execute()
        deleted_count = result.data[0].get('deleted_count', 0) if result.data else 0
        print(f"✅ Deleted {deleted_count} old articles")
    except Exception as e:
        print(f"❌ Error deleting old articles: {str(e)}")


async def main():
    """Main async function"""
    print("=" * 60)
    print("🚀 RSS News Scraper (Supabase + httpx)")
    print("=" * 60)
    print(f"📊 Supabase URL: {os.getenv('SUPABASE_URL')}")
    print(f"🇮🇳 Region: India (IN)")
    print(f"⏰ Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Fetch articles for all topics in parallel
    tasks = [
        fetch_and_save_articles(topic, url)
        for topic, url in RSS_FEEDS.items()
    ]
    await asyncio.gather(*tasks)
    
    # Delete old articles
    delete_old_articles()
    
    print("\n" + "=" * 60)
    print("✅ Scraping complete!")
    print("=" * 60)


if __name__ == '__main__':
    asyncio.run(main())
