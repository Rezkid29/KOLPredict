import { dbStorage as storage } from "./db-storage";
import { socialMediaClient } from "./social-api-client";
import type { Market, Bet, Kol } from "@shared/schema";

export interface MarketResolution {
  marketId: string;
  outcome: "yes" | "no";
  reason: string;
  settledBets: number;
}

export class MarketResolver {
  private resolutionInterval: NodeJS.Timeout | null = null;
  private isResolving = false;
  private consecutiveFailures = 0;
  private readonly MAX_CONSECUTIVE_FAILURES = 5;

  async resolveExpiredMarkets(): Promise<MarketResolution[]> {
    if (this.isResolving) {
      console.log("Resolution already in progress, skipping...");
      return [];
    }

    this.isResolving = true;
    console.log("Checking for expired markets...");

    let successCount = 0;
    let failureCount = 0;
    const resolutions: MarketResolution[] = [];

    try {
      let markets;
      try {
        markets = await storage.getAllMarketsWithKols();
      } catch (error) {
        console.error("Critical error: Failed to fetch markets from storage:", error);
        this.consecutiveFailures++;
        if (this.consecutiveFailures >= this.MAX_CONSECUTIVE_FAILURES) {
          console.error(`ALERT: Market resolver has failed ${this.consecutiveFailures} times consecutively. Manual intervention may be required.`);
        }
        return [];
      }

      const now = new Date();

      for (const market of markets) {
        try {
          // Validate market data
          if (!market.resolvesAt) {
            console.warn(`Market ${market.id} has no resolution date, skipping`);
            continue;
          }

          const resolvesAt = new Date(market.resolvesAt);
          
          // Check if date is valid
          if (isNaN(resolvesAt.getTime())) {
            console.error(`Market ${market.id} has invalid resolution date: ${market.resolvesAt}`);
            continue;
          }
          
          if (market.isLive && market.outcome === "pending" && resolvesAt <= now) {
            console.log(`Resolving market: ${market.title} (${market.id})`);
            
            const resolution = await this.resolveMarket(market);
            if (resolution) {
              resolutions.push(resolution);
              successCount++;
            } else {
              failureCount++;
            }
          }
        } catch (error) {
          failureCount++;
          console.error(`Error resolving market ${market.id}:`, error);
          // Continue with other markets even if one fails
        }
      }

      if (resolutions.length > 0) {
        console.log(`Market resolution completed: ${successCount} successful, ${failureCount} failed`);
        this.consecutiveFailures = 0;
      } else {
        console.log("No markets ready for resolution");
      }

      if (failureCount > 0 && successCount === 0 && markets.length > 0) {
        this.consecutiveFailures++;
      } else {
        this.consecutiveFailures = 0;
      }

      if (this.consecutiveFailures >= this.MAX_CONSECUTIVE_FAILURES) {
        console.error(`ALERT: Market resolver has failed ${this.consecutiveFailures} times consecutively. Stopping automatic resolution.`);
        this.stopAutoResolution();
      }

      return resolutions;
    } catch (error) {
      console.error("Unexpected error in market resolution:", error);
      this.consecutiveFailures++;
      return [];
    } finally {
      this.isResolving = false;
    }
  }

  private async resolveMarket(market: Market & { kol: Kol }): Promise<MarketResolution | null> {
    try {
      // Validate market and KOL data
      if (!market.id || !market.kol || !market.kol.id) {
        console.error(`Invalid market data for resolution:`, { marketId: market.id, kolId: market.kol?.id });
        return null;
      }

      if (!market.title) {
        console.error(`Market ${market.id} has no title - cannot determine outcome`);
        return null;
      }

      let latestMetrics;
      try {
        latestMetrics = await socialMediaClient.fetchKolMetrics(market.kol);
      } catch (error) {
        console.error(`Failed to fetch metrics for KOL ${market.kol.name} (market ${market.id}):`, error);
        return null;
      }

      // Validate metrics before using them
      if (!latestMetrics) {
        console.error(`No metrics returned for KOL ${market.kol.name}`);
        return null;
      }

      if (typeof latestMetrics.followers !== 'number' || typeof latestMetrics.engagementRate !== 'number') {
        console.error(`Invalid metrics data for KOL ${market.kol.name}:`, latestMetrics);
        return null;
      }

      if (isNaN(latestMetrics.followers) || !isFinite(latestMetrics.followers)) {
        console.error(`Invalid follower count for KOL ${market.kol.name}: ${latestMetrics.followers}`);
        return null;
      }

      if (isNaN(latestMetrics.engagementRate) || !isFinite(latestMetrics.engagementRate)) {
        console.error(`Invalid engagement rate for KOL ${market.kol.name}: ${latestMetrics.engagementRate}`);
        return null;
      }
      
      const outcome = this.determineOutcome(market, market.kol, latestMetrics);
      const reason = this.generateReason(market, market.kol, latestMetrics, outcome);

      try {
        await storage.updateMarket(market.id, {
          outcome: outcome,
          isLive: false,
        });
      } catch (error) {
        console.error(`Failed to update market ${market.id} outcome:`, error);
        return null;
      }

      let settledBets = 0;
      try {
        settledBets = await this.settleBets(market.id, outcome);
      } catch (error) {
        console.error(`Failed to settle bets for market ${market.id}:`, error);
        // Market is marked as resolved but bets failed to settle
        // Log the error but still return the resolution
      }

      return {
        marketId: market.id,
        outcome,
        reason,
        settledBets,
      };
    } catch (error) {
      console.error(`Unexpected error resolving market ${market.id}:`, error);
      return null;
    }
  }

  private determineOutcome(
    market: Market,
    kol: Kol,
    currentMetrics: { followers: number; engagementRate: number; trending: boolean }
  ): "yes" | "no" {
    const title = market.title.toLowerCase();
    
    if (title.includes("followers")) {
      const targetMatch = title.match(/(\d+)k?\s*followers/i);
      if (targetMatch) {
        const target = parseInt(targetMatch[1]) * (title.includes("k") ? 1000 : 1);
        return currentMetrics.followers >= target ? "yes" : "no";
      }
    }
    
    if (title.includes("engagement")) {
      const targetMatch = title.match(/(\d+(?:\.\d+)?)%/);
      if (targetMatch) {
        const target = parseFloat(targetMatch[1]);
        return currentMetrics.engagementRate >= target ? "yes" : "no";
      }
    }
    
    if (title.includes("trending")) {
      return currentMetrics.trending ? "yes" : "no";
    }
    
    if (title.includes("gain") && title.includes("followers")) {
      const targetMatch = title.match(/(\d+)k?\+?\s*followers/i);
      if (targetMatch) {
        const target = parseInt(targetMatch[1]) * (title.includes("k") ? 1000 : 1);
        const gained = currentMetrics.followers - kol.followers;
        return gained >= target ? "yes" : "no";
      }
    }

    const random = Math.random();
    return random > 0.5 ? "yes" : "no";
  }

  private generateReason(
    market: Market,
    kol: Kol,
    currentMetrics: { followers: number; engagementRate: number; trending: boolean },
    outcome: "yes" | "no"
  ): string {
    const followerChange = currentMetrics.followers - kol.followers;
    const engagementChange = currentMetrics.engagementRate - parseFloat(kol.engagementRate);

    return `Market resolved ${outcome.toUpperCase()}. ${kol.name} currently has ${currentMetrics.followers.toLocaleString()} followers (${followerChange > 0 ? '+' : ''}${followerChange.toLocaleString()}) with ${currentMetrics.engagementRate}% engagement rate (${engagementChange > 0 ? '+' : ''}${engagementChange.toFixed(2)}%).`;
  }

  private async settleBets(marketId: string, outcome: "yes" | "no"): Promise<number> {
    const allBets = await storage.getMarketBets(marketId);
    const pendingBets = allBets.filter(bet => bet.status === "pending");

    for (const bet of pendingBets) {
      // A bet wins if the shares were purchased (amount > 0) and match the outcome
      // If shares is negative or the position doesn't match outcome, it's a loss
      const shares = parseFloat(bet.shares);
      const won = shares > 0 && bet.position.toLowerCase() === outcome;
      const betAmount = parseFloat(bet.amount);
      
      let profit: number;
      let newStatus: string;
      
      if (won) {
        profit = betAmount * 1.5;
        newStatus = "won";
      } else {
        profit = -betAmount;
        newStatus = "lost";
      }

      await storage.updateBetStatus(bet.id, newStatus, profit.toFixed(2));

      const user = await storage.getUser(bet.userId);
      if (user) {
        const currentBalance = parseFloat(user.balance);
        const payout = won ? betAmount + profit : 0;
        const newBalance = (currentBalance + payout).toFixed(2);
        
        await storage.updateUserBalance(bet.userId, newBalance);

        const newTotalProfit = (parseFloat(user.totalProfit) + profit).toFixed(2);
        const newTotalWins = won ? user.totalWins + 1 : user.totalWins;
        await storage.updateUserStats(bet.userId, user.totalBets, newTotalWins, newTotalProfit);
      }
    }

    return pendingBets.length;
  }

  startAutoResolution(intervalMinutes: number = 5): void {
    if (this.resolutionInterval) {
      console.log("Auto-resolution already running");
      return;
    }

    console.log(`Starting auto-resolution every ${intervalMinutes} minutes`);
    
    this.resolveExpiredMarkets();
    
    this.resolutionInterval = setInterval(() => {
      this.resolveExpiredMarkets();
    }, intervalMinutes * 60 * 1000);
  }

  stopAutoResolution(): void {
    if (this.resolutionInterval) {
      clearInterval(this.resolutionInterval);
      this.resolutionInterval = null;
      console.log("Auto-resolution stopped");
    }
  }
}

export const marketResolver = new MarketResolver();
