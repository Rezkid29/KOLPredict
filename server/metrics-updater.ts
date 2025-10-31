import { dbStorage as storage } from "./db-storage";
import { socialMediaClient } from "./social-api-client";
import { KOLScraperV2 } from "./kol-scraper-v2";
import { KOLDataParser } from "./kol-data-parser";
import { logResolutionEvent } from "./logger";
import type { Kol, ScrapedKol, InsertScrapedKol } from "@shared/schema";

export class MetricsUpdater {
  private updateInterval: NodeJS.Timeout | null = null;
  private isUpdating = false;
  private consecutiveFailures = 0;
  private readonly MAX_CONSECUTIVE_FAILURES = 5;
  private readonly RETRY_DELAY_MS = 5000;

  private normalizeIdentifier(value?: string | null): string | null {
    if (!value) return null;
    return value.replace(/^@/, "").trim().toLowerCase();
  }

  private buildLeaderboardMap(rows: ScrapedKol[]): Map<string, ScrapedKol> {
    const map = new Map<string, ScrapedKol>();
    for (const row of rows) {
      const usernameKey = this.normalizeIdentifier(row.username);
      if (usernameKey) {
        map.set(usernameKey, row);
      }

      if (row.xHandle) {
        const handleKey = this.normalizeIdentifier(row.xHandle);
        if (handleKey) {
          map.set(handleKey, row);
        }
      }
    }
    return map;
  }

  private findLeaderboardEntry(map: Map<string, ScrapedKol>, kol: Kol): ScrapedKol | undefined {
    const handleKey = this.normalizeIdentifier(kol.handle);
    if (handleKey) {
      const hit = map.get(handleKey);
      if (hit) return hit;
    }

    const nameKey = this.normalizeIdentifier(kol.name);
    if (nameKey) {
      const hit = map.get(nameKey);
      if (hit) return hit;
    }

    return undefined;
  }

  private async fetchLatestLeaderboard(limit: number = 100): Promise<{
    map: Map<string, ScrapedKol>;
    sample: string[];
    rowCount: number;
  }> {
    const scraper = new KOLScraperV2();
    try {
      await scraper.init();
      const rawEntries = await scraper.scrapeLeaderboard();
      const timestamp = new Date();

      const parsed: InsertScrapedKol[] = rawEntries.slice(0, limit).map((entry) => {
        const normalized = KOLDataParser.parseRawKOLData(entry.summary);
        return {
          ...normalized,
          scrapedAt: timestamp,
        };
      });

      if (parsed.length === 0) {
        return { map: new Map(), sample: [], rowCount: 0 };
      }

      const inserted = await storage.createScrapedKols(parsed);
      const map = this.buildLeaderboardMap(inserted);
      const sample = inserted
        .slice(0, Math.min(10, inserted.length))
        .map((row) => row.username);

      return { map, sample, rowCount: inserted.length };
    } finally {
      await scraper
        .close()
        .catch((error) => console.warn("Failed to close KOL scraper:", error));
    }
  }

  async updateAllKolMetrics(): Promise<void> {
    if (this.isUpdating) {
      console.log("Metrics update already in progress, skipping...");
      return;
    }

    this.isUpdating = true;
    console.log("Starting KOL metrics update...");

    let successCount = 0;
    let failureCount = 0;

    let leaderboardMap = new Map<string, ScrapedKol>();
    let scrapeSummaryLogged = false;

    try {
      try {
        const fetched = await this.fetchLatestLeaderboard();
        leaderboardMap = fetched.map;
        if (fetched.rowCount > 0) {
          logResolutionEvent({
            type: "FETCH_SCRAPE_SUMMARY",
            rowCount: fetched.rowCount,
            scrapedUsernamesSample: fetched.sample,
            scrapeAgeHours: 0,
          });
          scrapeSummaryLogged = true;
        }
      } catch (scrapeError) {
        console.error("Failed to scrape latest leaderboard data:", scrapeError);
      }

      if (!scrapeSummaryLogged) {
        try {
          const fallbackRows = await storage.getLatestScrapedKols(100);
          leaderboardMap = this.buildLeaderboardMap(fallbackRows);
          if (fallbackRows.length > 0) {
            const sample = fallbackRows
              .slice(0, Math.min(10, fallbackRows.length))
              .map((row) => row.username);
            const newest = fallbackRows.reduce((acc, row) =>
              row.scrapedAt > acc.scrapedAt ? row : acc,
            fallbackRows[0]);
            const ageMs = Date.now() - newest.scrapedAt.getTime();
            const ageHours = Math.round((ageMs / 36e5) * 10) / 10;
            logResolutionEvent({
              type: "FETCH_SCRAPE_SUMMARY",
              rowCount: fallbackRows.length,
              scrapedUsernamesSample: sample,
              scrapeAgeHours: ageHours,
            });
            scrapeSummaryLogged = true;
          }
        } catch (fallbackError) {
          console.error("Failed to load fallback leaderboard data:", fallbackError);
        }
      }

      let kols: Kol[];
      try {
        kols = await storage.getAllKols();
      } catch (error) {
        console.error("Critical error: Failed to fetch KOLs from storage:", error);
        this.consecutiveFailures++;
        if (this.consecutiveFailures >= this.MAX_CONSECUTIVE_FAILURES) {
          console.error(`ALERT: Metrics updater has failed ${this.consecutiveFailures} times consecutively. Manual intervention may be required.`);
        }
        return;
      }

      if (kols.length === 0) {
        console.warn("No KOLs found to update");
        return;
      }
      
      for (const kol of kols) {
        try {
          await this.updateKolMetrics(kol, leaderboardMap);
          successCount++;
        } catch (error) {
          failureCount++;
          console.error(`Error updating metrics for ${kol.name} (${kol.id}):`, error);
          // Continue with other KOLs even if one fails
        }
      }

      console.log(`Metrics update completed: ${successCount} successful, ${failureCount} failed out of ${kols.length} KOLs`);
      
      // Reset consecutive failures on successful run
      if (failureCount < kols.length) {
        this.consecutiveFailures = 0;
      } else {
        this.consecutiveFailures++;
      }

      if (this.consecutiveFailures >= this.MAX_CONSECUTIVE_FAILURES) {
        console.error(`ALERT: Metrics updater has failed ${this.consecutiveFailures} times consecutively. Stopping automatic updates.`);
        this.stopAutoUpdate();
      }
    } catch (error) {
      console.error("Unexpected error in metrics update:", error);
      this.consecutiveFailures++;
    } finally {
      this.isUpdating = false;
    }
  }

  async updateKolMetrics(kol: Kol, leaderboardMap: Map<string, ScrapedKol>): Promise<void> {
    // Validate KOL data before processing
    if (!kol.id || !kol.name) {
      throw new Error(`Invalid KOL data: missing required fields`);
    }

    let metrics;
    try {
      metrics = await socialMediaClient.fetchKolMetrics(kol);
    } catch (error) {
      console.error(`Failed to fetch metrics for ${kol.name}:`, error);
      throw new Error(`Failed to fetch social media metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Validate metrics response
    if (!metrics || typeof metrics.followers !== 'number' || typeof metrics.engagementRate !== 'number') {
      console.error(`Invalid metrics received for ${kol.name}:`, metrics);
      throw new Error(`Invalid metrics data received from social media API`);
    }

    // Additional validation - check for reasonable values
    if (metrics.followers < 0 || metrics.followers > 1000000000) {
      console.warn(`Suspicious follower count for ${kol.name}: ${metrics.followers}`);
    }

    if (metrics.engagementRate < 0 || metrics.engagementRate > 100) {
      console.warn(`Suspicious engagement rate for ${kol.name}: ${metrics.engagementRate}%`);
    }

    if (isNaN(metrics.followers) || !isFinite(metrics.followers)) {
      throw new Error(`Invalid follower count (NaN or Infinite)`);
    }

    if (isNaN(metrics.engagementRate) || !isFinite(metrics.engagementRate)) {
      throw new Error(`Invalid engagement rate (NaN or Infinite)`);
    }
    
    const leaderboardEntry = this.findLeaderboardEntry(leaderboardMap, kol);

    const hasChanged = 
      kol.followers !== metrics.followers ||
      parseFloat(kol.engagementRate) !== metrics.engagementRate ||
      kol.trending !== metrics.trending;

    const hasLeaderboardChanges = leaderboardEntry ? (
      (kol.kolscanRank ?? null) !== (leaderboardEntry.rank !== null && leaderboardEntry.rank !== undefined ? leaderboardEntry.rank.toString() : null) ||
      (kol.kolscanWins ?? null) !== (leaderboardEntry.wins ?? null) ||
      (kol.kolscanLosses ?? null) !== (leaderboardEntry.losses ?? null) ||
      (kol.kolscanSolGain ?? null) !== (leaderboardEntry.solGain ?? null) ||
      (kol.kolscanUsdGain ?? null) !== (leaderboardEntry.usdGain ?? null) ||
      (kol.lastScrapedAt ? kol.lastScrapedAt.getTime() : null) !== (leaderboardEntry.scrapedAt ? leaderboardEntry.scrapedAt.getTime() : null) ||
      kol.scrapedFromKolscan !== true
    ) : false;

    try {
      // Always record metrics history for time-series analysis
      // This allows us to track trends even when values don't change
      await storage.createKolMetricsHistory({
        kolId: kol.id,
        followers: metrics.followers,
        engagementRate: metrics.engagementRate.toString(),
        trending: metrics.trending,
        trendingPercent: metrics.trendingPercent?.toString() || null,
        leaderboardRank: leaderboardEntry?.rank ?? null,
        leaderboardWins: leaderboardEntry?.wins ?? null,
        leaderboardLosses: leaderboardEntry?.losses ?? null,
        leaderboardSolGain: leaderboardEntry?.solGain ?? null,
        leaderboardUsdGain: leaderboardEntry?.usdGain ?? null,
      });

      // Only update KOL record if metrics have changed
      if (hasChanged || hasLeaderboardChanges) {
        const updates: Partial<Omit<Kol, 'id'>> = {
          followers: metrics.followers,
          engagementRate: metrics.engagementRate.toString(),
          trending: metrics.trending,
          trendingPercent: metrics.trendingPercent?.toString() || null,
        };

        if (leaderboardEntry) {
          updates.kolscanRank = leaderboardEntry.rank !== null && leaderboardEntry.rank !== undefined ? leaderboardEntry.rank.toString() : null;
          updates.kolscanWins = leaderboardEntry.wins ?? null;
          updates.kolscanLosses = leaderboardEntry.losses ?? null;
          updates.kolscanSolGain = leaderboardEntry.solGain ?? null;
          updates.kolscanUsdGain = leaderboardEntry.usdGain ?? null;
          updates.lastScrapedAt = leaderboardEntry.scrapedAt;
          updates.scrapedFromKolscan = true;
        } else if (!kol.scrapedFromKolscan) {
          updates.scrapedFromKolscan = kol.scrapedFromKolscan;
        }

        await storage.updateKol(kol.id, updates);

        console.log(`Updated ${kol.name}: ${kol.followers} -> ${metrics.followers} followers, ${kol.engagementRate}% -> ${metrics.engagementRate}% engagement`);
      } else {
        console.log(`Snapshot saved for ${kol.name} (no changes)`);
      }
    } catch (error) {
      console.error(`Failed to save metrics for ${kol.name}:`, error);
      throw new Error(`Failed to save metrics to database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  startAutoUpdate(intervalMinutes: number = 30): void {
    if (this.updateInterval) {
      console.log("Auto-update already running");
      return;
    }

    console.log(`Starting auto-update every ${intervalMinutes} minutes`);
    
    this.updateAllKolMetrics();
    
    this.updateInterval = setInterval(() => {
      this.updateAllKolMetrics();
    }, intervalMinutes * 60 * 1000);
  }

  stopAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log("Auto-update stopped");
    }
  }
}

export const metricsUpdater = new MetricsUpdater();
