import { dbStorage as storage } from "./db-storage";
import { socialMediaClient } from "./social-api-client";
import type { Kol } from "@shared/schema";

export class MetricsUpdater {
  private updateInterval: NodeJS.Timeout | null = null;
  private isUpdating = false;

  async updateAllKolMetrics(): Promise<void> {
    if (this.isUpdating) {
      console.log("Metrics update already in progress, skipping...");
      return;
    }

    this.isUpdating = true;
    console.log("Starting KOL metrics update...");

    try {
      const kols = await storage.getAllKols();
      
      for (const kol of kols) {
        try {
          await this.updateKolMetrics(kol);
        } catch (error) {
          console.error(`Error updating metrics for ${kol.name}:`, error);
        }
      }

      console.log(`Updated metrics for ${kols.length} KOLs`);
    } catch (error) {
      console.error("Error in metrics update:", error);
    } finally {
      this.isUpdating = false;
    }
  }

  async updateKolMetrics(kol: Kol): Promise<void> {
    const metrics = await socialMediaClient.fetchKolMetrics(kol);
    
    const hasChanged = 
      kol.followers !== metrics.followers ||
      parseFloat(kol.engagementRate) !== metrics.engagementRate ||
      kol.trending !== metrics.trending;

    if (hasChanged) {
      await storage.updateKol(kol.id, {
        followers: metrics.followers,
        engagementRate: metrics.engagementRate.toString(),
        trending: metrics.trending,
        trendingPercent: metrics.trendingPercent?.toString() || null,
      });

      await storage.createKolMetricsHistory({
        kolId: kol.id,
        followers: metrics.followers,
        engagementRate: metrics.engagementRate.toString(),
        trending: metrics.trending,
        trendingPercent: metrics.trendingPercent?.toString() || null,
      });

      console.log(`Updated ${kol.name}: ${kol.followers} -> ${metrics.followers} followers, ${kol.engagementRate}% -> ${metrics.engagementRate}% engagement`);
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
