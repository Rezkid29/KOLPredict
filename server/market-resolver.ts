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

  async resolveExpiredMarkets(): Promise<MarketResolution[]> {
    if (this.isResolving) {
      console.log("Resolution already in progress, skipping...");
      return [];
    }

    this.isResolving = true;
    console.log("Checking for expired markets...");

    try {
      const markets = await storage.getAllMarketsWithKols();
      const now = new Date();
      const resolutions: MarketResolution[] = [];

      for (const market of markets) {
        const resolvesAt = new Date(market.resolvesAt);
        
        if (market.isLive && market.outcome === "pending" && resolvesAt <= now) {
          console.log(`Resolving market: ${market.title}`);
          
          const resolution = await this.resolveMarket(market);
          if (resolution) {
            resolutions.push(resolution);
          }
        }
      }

      if (resolutions.length > 0) {
        console.log(`Resolved ${resolutions.length} markets`);
      } else {
        console.log("No markets ready for resolution");
      }

      return resolutions;
    } catch (error) {
      console.error("Error resolving markets:", error);
      return [];
    } finally {
      this.isResolving = false;
    }
  }

  private async resolveMarket(market: Market & { kol: Kol }): Promise<MarketResolution | null> {
    try {
      const latestMetrics = await socialMediaClient.fetchKolMetrics(market.kol);
      
      const outcome = this.determineOutcome(market, market.kol, latestMetrics);
      const reason = this.generateReason(market, market.kol, latestMetrics, outcome);

      await storage.updateMarket(market.id, {
        outcome: outcome,
        isLive: false,
      });

      const settledBets = await this.settleBets(market.id, outcome);

      return {
        marketId: market.id,
        outcome,
        reason,
        settledBets,
      };
    } catch (error) {
      console.error(`Error resolving market ${market.id}:`, error);
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
      const won = (bet.type === "buy" && outcome === "yes") || (bet.type === "sell" && outcome === "no");
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
