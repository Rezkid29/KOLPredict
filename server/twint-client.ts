
import { spawn } from 'child_process';
import { dbStorage } from './db-storage';

export interface TwintUserData {
  username: string;
  name: string;
  followers: number;
  following: number;
  tweets: number;
  bio: string;
  verified: boolean;
  scraped_at: string;
}

export class TwintClient {
  private pythonPath: string;
  private scriptPath: string;

  constructor() {
    this.pythonPath = 'python3';
    this.scriptPath = 'server/twint_follower_scraper.py';
  }

  async getFollowerCount(xHandle: string): Promise<number | null> {
    const cleanHandle = xHandle.replace('@', '');

    // Check cache first (24h validity)
    const cached = await dbStorage.getFollowerCache(cleanHandle);
    if (cached) {
      const cacheAge = new Date().getTime() - new Date(cached.cachedAt).getTime();
      const hoursOld = cacheAge / (1000 * 60 * 60);

      if (hoursOld < 24) {
        console.log(`  💾 Cache hit: @${cleanHandle} has ${cached.followers.toLocaleString()} followers (${hoursOld.toFixed(1)}h ago)`);
        return cached.followers;
      }
    }

    // Scrape using Twint
    try {
      const userData = await this.scrapeUser(cleanHandle);
      
      if (userData) {
        // Update cache
        await dbStorage.upsertFollowerCache({
          xHandle: cleanHandle,
          followers: userData.followers,
        });

        console.log(`  🐦 Twint scrape: @${cleanHandle} has ${userData.followers.toLocaleString()} followers`);
        return userData.followers;
      }
      
      return null;
    } catch (error) {
      console.error(`  ❌ Failed to scrape @${cleanHandle} with Twint:`, error);
      return null;
    }
  }

  async scrapeUser(username: string): Promise<TwintUserData | null> {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(this.pythonPath, [
        this.scriptPath,
        '--json',
        username
      ]);

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Twint scraper exited with code ${code}: ${stderr}`));
          return;
        }

        try {
          const results: TwintUserData[] = JSON.parse(stdout);
          resolve(results.length > 0 ? results[0] : null);
        } catch (error) {
          reject(new Error(`Failed to parse Twint output: ${error}`));
        }
      });
    });
  }

  async scrapeMultipleUsers(usernames: string[]): Promise<TwintUserData[]> {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(this.pythonPath, [
        this.scriptPath,
        '--json',
        ...usernames.map(u => u.replace('@', ''))
      ]);

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Twint scraper exited with code ${code}: ${stderr}`));
          return;
        }

        try {
          const results: TwintUserData[] = JSON.parse(stdout);
          resolve(results);
        } catch (error) {
          reject(new Error(`Failed to parse Twint output: ${error}`));
        }
      });
    });
  }
}

export const twintClient = new TwintClient();
