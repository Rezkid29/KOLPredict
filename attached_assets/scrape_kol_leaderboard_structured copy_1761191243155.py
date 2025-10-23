#!/usr/bin/env python3
"""
Standalone KOL Leaderboard Scraper
Scrapes KOL leaderboard from kolscan.io/leaderboard with precise fields:
Rank, Username, X Handle, Wins/Losses, SOL Gain, USD Gain
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import pandas as pd
from datetime import datetime
import time
import re


def scrape_kol_leaderboard_structured():
    """
    Scrape KOL leaderboard with precise fields:
    Rank, Username, X Handle, Wins/Losses, SOL Gain, USD Gain
    This function is designed to be robust against layout changes by parsing text blocks in order.
    """
    # Browser options (stealth) similar to the original working setup
    options = Options()
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    options.add_argument("--disable-extensions")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")

    try:
        driver = webdriver.Chrome(options=options)
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    except Exception as e:
        print(f"Error initializing WebDriver: {e}")
        return

    try:
        driver.get("https://kolscan.io/leaderboard")
        WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        WebDriverWait(driver, 20).until(
            lambda d: "KOL Leaderboard" in d.page_source or len(d.find_elements(By.TAG_NAME, "body")) > 0
        )
        # Nudge dynamic content
        time.sleep(4)
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(1.5)
        driver.execute_script("window.scrollTo(0, 0);")
        time.sleep(1)

        body_text = driver.find_element(By.TAG_NAME, "body").text
        lines = [ln.strip() for ln in body_text.split("\n") if ln.strip()]

        # Debug: Print sample of the body text to see what data is available
        print("Sample body text (first 50 lines):")
        for i, line in enumerate(lines[:50]):
            print(f"{i+1}: '{line}'")
        print("\n" + "="*50 + "\n")

        # Parse the entire leaderboard sequentially
        entries = []
        i = 0

        # Find leaderboard section start
        leaderboard_start = -1
        for idx, line in enumerate(lines):
            if 'KOL Leaderboard' in line:
                leaderboard_start = idx + 1
                break

        if leaderboard_start == -1:
            leaderboard_start = 0

        i = leaderboard_start
        rank_counter = 1  # Start with rank 1

        while i < len(lines) - 6 and len(entries) < 20:
            # Look for the pattern: username, xhandle, wins, /, losses, sol, usd
            # The rank is implicit based on position

            # Skip navigation and find next username
            while i < len(lines) and (any(skip in lines[i] for skip in ['Daily', 'Weekly', 'Monthly', 'Leaderboard']) or
                                     lines[i].isdigit() or len(lines[i]) < 2):
                i += 1

            if i >= len(lines) - 6:
                break

            # Check if this looks like a username (not SOL/USD format)
            potential_username = lines[i]
            if (len(potential_username) > 1 and len(potential_username) < 50 and
                not ('+' in potential_username and 'Sol' in potential_username) and
                not ('$' in potential_username and '(' in potential_username) and
                not potential_username.isdigit()):

                entry = {
                    'rank': str(rank_counter),
                    'trophy': (rank_counter == 1),
                    'kol': potential_username,
                    'xHandle': '',
                    'winsLosses': '',
                    'solGain': '',
                    'usdGain': ''
                }

                # Try to get X handle (next field should be short alphanumeric)
                i += 1
                if i < len(lines) and re.match(r'^[A-Za-z0-9]{4,8}$', lines[i]):
                    entry['xHandle'] = lines[i]
                    i += 1

                # Try to get wins/losses (wins number, /, losses number)
                if (i < len(lines) - 2 and
                    lines[i].isdigit() and
                    lines[i + 1] == '/' and
                    lines[i + 2].isdigit()):
                    entry['winsLosses'] = f"{lines[i]}/{lines[i + 2]}"
                    i += 3
                else:
                    # Skip any remaining numbers or separators
                    while i < len(lines) and (lines[i].isdigit() or lines[i] == '/'):
                        i += 1

                # Try to get SOL gain
                if i < len(lines) and '+' in lines[i] and 'Sol' in lines[i]:
                    entry['solGain'] = lines[i]
                    i += 1

                # Try to get USD gain
                if i < len(lines) and '$' in lines[i] and '(' in lines[i] and ')' in lines[i]:
                    entry['usdGain'] = lines[i]
                    i += 1

                print(f"Entry found: Rank={entry['rank']}, KOL={entry['kol']}, XHandle={entry.get('xHandle', 'N/A')}, WinsLosses={entry.get('winsLosses', 'N/A')}, SOL={entry.get('solGain', 'N/A')}, USD={entry.get('usdGain', 'N/A')}")
                entries.append(entry)
                rank_counter += 1

            else:
                i += 1

        # Convert to the expected format
        leaderboard_data = []
        for entry in entries:
            rank_display = '🏆 1' if entry['trophy'] else entry['rank']
            leaderboard_data.append({
                'Rank': rank_display,
                'Username': entry['kol'],
                'X Handle': entry.get('xHandle', ''),
                'Wins/Losses': entry.get('winsLosses', ''),
                'SOL Gain': entry.get('solGain', ''),
                'USD Gain': entry.get('usdGain', '')
            })

        # Save to CSV
        if leaderboard_data:
            timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
            filename = f"kol_leaderboard_{timestamp}.csv"
            df = pd.DataFrame(leaderboard_data)
            df.to_csv(filename, index=False)
            print(f"\nSuccessfully scraped {len(df)} rows.")
            print(f"Data saved to {filename}")
        else:
            print("No structured entries were found.")

    except Exception as e:
        print(f"Error in structured scrape: {e}")
    finally:
        try:
            driver.quit()
        except Exception:
            pass


if __name__ == "__main__":
    scrape_kol_leaderboard_structured()
