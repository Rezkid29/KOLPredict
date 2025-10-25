
#!/usr/bin/env python3
"""
X/Twitter follower scraper using snscrape Python API
Scrapes follower counts and basic profile data without requiring API credentials
"""

import json
import sys
from datetime import datetime

try:
    import snscrape.modules.twitter as sntwitter
except ImportError:
    print("Error: snscrape not installed. Run: pip install snscrape", file=sys.stderr)
    sys.exit(1)

def get_user_info(username):
    """
    Get user information including follower count using snscrape
    
    Args:
        username: Twitter/X handle (without @)
    
    Returns:
        dict with user data or None if failed
    """
    # Remove @ if present
    clean_username = username.replace('@', '')
    
    try:
        # Use snscrape's User scraper
        user_scraper = sntwitter.TwitterUserScraper(clean_username)
        user = user_scraper.entity
        
        if user:
            user_data = {
                'username': user.username,
                'name': user.displayname or user.username,
                'followers': user.followersCount,
                'following': user.friendsCount,
                'tweets': user.statusesCount,
                'bio': user.renderedDescription or '',
                'verified': user.verified,
                'scraped_at': datetime.now().isoformat()
            }
            return user_data
        else:
            return None
            
    except Exception as e:
        print(f"Error scraping @{clean_username}: {str(e)}", file=sys.stderr)
        return None

def scrape_multiple_users(usernames):
    """
    Scrape follower data for multiple users
    
    Args:
        usernames: List of Twitter/X handles
    
    Returns:
        List of user data dictionaries
    """
    results = []
    
    for username in usernames:
        print(f"Scraping @{username}...", file=sys.stderr)
        user_data = get_user_info(username)
        
        if user_data:
            results.append(user_data)
            print(f"✓ @{username}: {user_data['followers']:,} followers", file=sys.stderr)
        else:
            print(f"✗ Failed to scrape @{username}", file=sys.stderr)
    
    return results

def main():
    """
    Main function - can be called from command line or imported
    """
    if len(sys.argv) < 2:
        print("Usage: python twint_follower_scraper.py <username1> [username2] ...", file=sys.stderr)
        print("Or: python twint_follower_scraper.py --json <username1> [username2] ...", file=sys.stderr)
        sys.exit(1)
    
    # Check if JSON output is requested
    json_output = False
    usernames = sys.argv[1:]
    
    if '--json' in usernames:
        json_output = True
        usernames.remove('--json')
    
    # Scrape all users
    results = scrape_multiple_users(usernames)
    
    # Output results
    if json_output:
        print(json.dumps(results, indent=2))
    else:
        print("\n=== Scraping Results ===", file=sys.stderr)
        for user in results:
            print(f"\n@{user['username']} ({user['name']})", file=sys.stderr)
            print(f"  Followers: {user['followers']:,}", file=sys.stderr)
            print(f"  Following: {user['following']:,}", file=sys.stderr)
            print(f"  Tweets: {user['tweets']:,}", file=sys.stderr)
            print(f"  Verified: {user['verified']}", file=sys.stderr)

if __name__ == '__main__':
    main()
