import { existsSync, readFileSync, writeFileSync } from 'fs';
import { FollowerCache } from './types.js';

export class RateLimitTracker {
  private lookups: Date[] = [];
  private readonly maxLookups = 3;
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes

  canMakeLookup(): boolean {
    const now = new Date();
    this.lookups = this.lookups.filter(time =>
      now.getTime() - time.getTime() < this.windowMs
    );
    return this.lookups.length < this.maxLookups;
  }

  recordLookup(): void {
    this.lookups.push(new Date());
    const remaining = this.maxLookups - this.lookups.length;
    console.log(`📊 Rate Limit: ${remaining} user lookups remaining in this window`);
  }

  getRemainingLookups(): number {
    this.canMakeLookup(); // Clean up expired lookups
    return this.maxLookups - this.lookups.length;
  }
}

export function loadFollowerCache(): FollowerCache {
  const cacheFile = 'kol_follower_cache.json';
  if (existsSync(cacheFile)) {
    const data = JSON.parse(readFileSync(cacheFile, 'utf-8'));
    console.log(`📋 Loaded follower cache for ${Object.keys(data).length} KOLs`);
    return data;
  }
  return {};
}

export function saveFollowerCache(cache: FollowerCache): void {
  const cacheFile = 'kol_follower_cache.json';
  writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
}

export function cacheMarketData(marketId: string, data: any): void {
  const cacheFile = `market_cache_${marketId}.json`;
  writeFileSync(cacheFile, JSON.stringify(data, null, 2));
}

export function sampleKOLs<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!;
}
