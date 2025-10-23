import { dbStorage as storage } from "./db-storage";
import { socialMediaClient } from "./social-api-client";
import type { Kol } from "@shared/schema";

export class MetricsUpdater {
  private updateInterval: NodeJS.Timeout | null = null;
  private isUpdating = false;
  private consecutiveFailures = 0;
  private readonly MAX_CONSECUTIVE_FAILURES = 5;
  private readonly RETRY_DELAY_MS = 5000;

  async updateAllKolMetrics(): Promise<void> {
    if (this.isUpdating) {
      console.log("Metrics update already in progress, skipping...");
      return;
    }

    this.isUpdating = true;
    console.log("Starting KOL metrics update...");

    let successCount = 0;
    let failureCount = 0;

    try {
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
          await this.updateKolMetrics(kol);
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

  async updateKolMetrics(kol: Kol): Promise<void> {
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
    
    const hasChanged = 
      kol.followers !== metrics.followers ||
      parseFloat(kol.engagementRate) !== metrics.engagementRate ||
      kol.trending !== metrics.trending;

    if (hasChanged) {
      try {
        // Update KOL record
        await storage.updateKol(kol.id, {
          followers: metrics.followers,
          engagementRate: metrics.engagementRate.toString(),
          trending: metrics.trending,
          trendingPercent: metrics.trendingPercent?.toString() || null,
        });

        // Record metrics history
        await storage.createKolMetricsHistory({
          kolId: kol.id,
          followers: metrics.followers,
          engagementRate: metrics.engagementRate.toString(),
          trending: metrics.trending,
          trendingPercent: metrics.trendingPercent?.toString() || null,
        });

        console.log(`Updated ${kol.name}: ${kol.followers} -> ${metrics.followers} followers, ${kol.engagementRate}% -> ${metrics.engagementRate}% engagement`);
      } catch (error) {
        console.error(`Failed to save metrics for ${kol.name}:`, error);
        throw new Error(`Failed to save metrics to database: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      console.log(`No changes for ${kol.name}`);
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
