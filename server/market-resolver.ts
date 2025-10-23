import { dbStorage as storage } from "./db-storage";
import { socialMediaClient } from "./social-api-client";
import { xApiClient } from "./x-api-client";
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

  private async resolveMarket(market: Market & { kol?: Kol }): Promise<MarketResolution | null> {
    try {
      if (!market.id) {
        console.error(`Invalid market data for resolution: missing market ID`);
        return null;
      }

      if (!market.title) {
        console.error(`Market ${market.id} has no title - cannot determine outcome`);
        return null;
      }

      const marketType = market.marketType || 'standard';
      console.log(`Resolving ${marketType} market: ${market.title}`);

      let outcome: "yes" | "no";
      let reason: string;

      if (marketType === 'rank_flippening' || marketType === 'profit_streak' || marketType === 'follower_growth' || 
          marketType === 'sol_gain_flippening' || marketType === 'usd_gain_flippening' || marketType === 'winrate_flippening' ||
          marketType === 'top_rank_maintain' || marketType === 'streak_continuation' || marketType === 'rank_improvement') {
        const metadata = await storage.getMarketMetadata(market.id);
        if (!metadata) {
          console.error(`Market ${market.id} metadata not found for special market type`);
          return null;
        }

        if (marketType === 'rank_flippening') {
          const result = await this.resolveRankFlippeningMarket(metadata);
          outcome = result.outcome;
          reason = result.reason;
        } else if (marketType === 'profit_streak') {
          const result = await this.resolveProfitStreakMarket(metadata);
          outcome = result.outcome;
          reason = result.reason;
        } else if (marketType === 'follower_growth') {
          const result = await this.resolveFollowerGrowthMarket(metadata);
          outcome = result.outcome;
          reason = result.reason;
        } else if (marketType === 'sol_gain_flippening') {
          const result = await this.resolveSolGainFlippeningMarket(metadata);
          outcome = result.outcome;
          reason = result.reason;
        } else if (marketType === 'usd_gain_flippening') {
          const result = await this.resolveUsdGainFlippeningMarket(metadata);
          outcome = result.outcome;
          reason = result.reason;
        } else if (marketType === 'winrate_flippening') {
          const result = await this.resolveWinRateFlippeningMarket(metadata);
          outcome = result.outcome;
          reason = result.reason;
        } else if (marketType === 'top_rank_maintain') {
          const result = await this.resolveTopRankMaintainMarket(metadata);
          outcome = result.outcome;
          reason = result.reason;
        } else if (marketType === 'streak_continuation') {
          const result = await this.resolveStreakContinuationMarket(metadata);
          outcome = result.outcome;
          reason = result.reason;
        } else {
          const result = await this.resolveRankImprovementMarket(metadata);
          outcome = result.outcome;
          reason = result.reason;
        }
      } else if (marketType === 'kolscan') {
        if (!market.kol || !market.kol.id) {
          console.error(`Invalid market data for resolution:`, { marketId: market.id });
          return null;
        }

        const freshKol = await storage.getKol(market.kol.id);
        if (!freshKol) {
          console.error(`KOL ${market.kol.id} not found`);
          return null;
        }

        const latestMetrics = {
          followers: freshKol.followers,
          engagementRate: parseFloat(freshKol.engagementRate),
          trending: freshKol.trending || false,
        };
        
        outcome = this.determineOutcome(market, freshKol, latestMetrics);
        reason = this.generateReason(market, freshKol, latestMetrics, outcome);
      } else {
        if (!market.kol || !market.kol.id) {
          console.error(`Invalid market data for resolution:`, { marketId: market.id });
          return null;
        }

        let latestMetrics;
        try {
          latestMetrics = await socialMediaClient.fetchKolMetrics(market.kol);
        } catch (error) {
          console.error(`Failed to fetch metrics for KOL ${market.kol.name} (market ${market.id}):`, error);
          return null;
        }

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
        
        outcome = this.determineOutcome(market, market.kol, latestMetrics);
        reason = this.generateReason(market, market.kol, latestMetrics, outcome);
      }

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
    
    if (kol.scrapedFromKolscan) {
      const kolscanOutcome = this.determineKolscanOutcome(market, kol, title);
      if (kolscanOutcome !== null) {
        return kolscanOutcome;
      }
    }
    
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

  private determineKolscanOutcome(market: Market, kol: Kol, title: string): "yes" | "no" | null {
    if (title.includes("sol") && (title.includes("gain") || title.includes("profit"))) {
      if (!kol.kolscanSolGain) {
        console.warn(`No SOL gain data for ${kol.name}, cannot resolve`);
        return null;
      }
      
      const solGainMatch = kol.kolscanSolGain.match(/([+-]?[\d,]+\.?\d*)/);
      if (!solGainMatch) {
        console.warn(`Cannot parse SOL gain: ${kol.kolscanSolGain}`);
        return null;
      }
      
      const currentSolGain = parseFloat(solGainMatch[1].replace(/,/g, ''));
      const targetMatch = title.match(/([+-]?[\d,]+\.?\d*)\s*sol/i);
      
      if (!targetMatch) {
        console.warn(`Cannot extract target SOL from title: ${title}`);
        return null;
      }
      
      const targetSol = parseFloat(targetMatch[1].replace(/,/g, ''));
      console.log(`  📊 ${kol.name} SOL gain: ${currentSolGain} vs target: ${targetSol}`);
      return currentSolGain >= targetSol ? "yes" : "no";
    }
    
    if (title.includes("win") && (title.includes("rate") || title.includes("ratio"))) {
      if (!kol.kolscanWins || !kol.kolscanLosses) {
        console.warn(`No win/loss data for ${kol.name}, cannot resolve`);
        return null;
      }
      
      const totalTrades = kol.kolscanWins + kol.kolscanLosses;
      const winRate = totalTrades > 0 ? kol.kolscanWins / totalTrades : 0;
      const targetMatch = title.match(/([\d.]+)%/);
      
      if (!targetMatch) {
        console.warn(`Cannot extract target win rate from title: ${title}`);
        return null;
      }
      
      const targetRate = parseFloat(targetMatch[1]) / 100;
      console.log(`  📊 ${kol.name} win rate: ${(winRate * 100).toFixed(1)}% vs target: ${(targetRate * 100).toFixed(1)}%`);
      return winRate >= targetRate ? "yes" : "no";
    }
    
    if (title.includes("rank") || title.includes("top")) {
      if (!kol.kolscanRank) {
        console.warn(`No rank data for ${kol.name}, cannot resolve`);
        return null;
      }
      
      const rankMatch = kol.kolscanRank.match(/(\d+)/);
      if (!rankMatch) {
        console.warn(`Cannot parse rank: ${kol.kolscanRank}`);
        return null;
      }
      
      const currentRank = parseInt(rankMatch[1], 10);
      const targetMatch = title.match(/top\s+(\d+)/i) || title.match(/rank\s+(\d+)/i) || title.match(/#(\d+)/);
      
      if (!targetMatch) {
        console.warn(`Cannot extract target rank from title: ${title}`);
        return null;
      }
      
      const targetRank = parseInt(targetMatch[1], 10);
      console.log(`  📊 ${kol.name} rank: ${currentRank} vs target: ${targetRank}`);
      return currentRank <= targetRank ? "yes" : "no";
    }
    
    return null;
  }

  private generateReason(
    market: Market,
    kol: Kol,
    currentMetrics: { followers: number; engagementRate: number; trending: boolean },
    outcome: "yes" | "no"
  ): string {
    if (kol.scrapedFromKolscan) {
      const kolscanReason = this.generateKolscanReason(market, kol, outcome);
      if (kolscanReason) {
        return kolscanReason;
      }
    }
    
    const followerChange = currentMetrics.followers - kol.followers;
    const engagementChange = currentMetrics.engagementRate - parseFloat(kol.engagementRate);

    return `Market resolved ${outcome.toUpperCase()}. ${kol.name} currently has ${currentMetrics.followers.toLocaleString()} followers (${followerChange > 0 ? '+' : ''}${followerChange.toLocaleString()}) with ${currentMetrics.engagementRate}% engagement rate (${engagementChange > 0 ? '+' : ''}${engagementChange.toFixed(2)}%).`;
  }

  private generateKolscanReason(market: Market, kol: Kol, outcome: "yes" | "no"): string | null {
    const title = market.title.toLowerCase();
    
    if (title.includes("sol") && (title.includes("gain") || title.includes("profit"))) {
      if (!kol.kolscanSolGain) return null;
      return `Market resolved ${outcome.toUpperCase()}. ${kol.name} has ${kol.kolscanSolGain} SOL gain on kolscan.io (Rank: ${kol.kolscanRank || 'N/A'}, W/L: ${kol.kolscanWins || 0}/${kol.kolscanLosses || 0}).`;
    }
    
    if (title.includes("win") && (title.includes("rate") || title.includes("ratio"))) {
      if (!kol.kolscanWins || !kol.kolscanLosses) return null;
      const totalTrades = kol.kolscanWins + kol.kolscanLosses;
      const winRate = totalTrades > 0 ? ((kol.kolscanWins / totalTrades) * 100).toFixed(1) : '0.0';
      return `Market resolved ${outcome.toUpperCase()}. ${kol.name} has a ${winRate}% win rate (${kol.kolscanWins} wins, ${kol.kolscanLosses} losses) on kolscan.io.`;
    }
    
    if (title.includes("rank") || title.includes("top")) {
      if (!kol.kolscanRank) return null;
      return `Market resolved ${outcome.toUpperCase()}. ${kol.name} is currently ranked ${kol.kolscanRank} on kolscan.io (SOL gain: ${kol.kolscanSolGain || 'N/A'}).`;
    }
    
    return null;
  }

  private async resolveRankFlippeningMarket(metadata: any): Promise<{ outcome: "yes" | "no"; reason: string }> {
    const latestKols = await storage.getLatestScrapedKols(20);
    
    const kolAData = latestKols.find(k => k.username === metadata.kolA);
    const kolBData = latestKols.find(k => k.username === metadata.kolB);
    
    if (!kolAData || !kolBData) {
      console.warn(`Missing KOL data for rank flippening market`);
      return {
        outcome: "no",
        reason: `Market could not be resolved - missing latest leaderboard data for ${!kolAData ? metadata.kolA : metadata.kolB}`
      };
    }
    
    const rankA = parseInt(kolAData.rank.replace(/[^\d]/g, '')) || 999;
    const rankB = parseInt(kolBData.rank.replace(/[^\d]/g, '')) || 999;
    
    const outcome = rankA < rankB ? "yes" : "no";
    const reason = `${metadata.kolA} is now rank #${rankA} vs ${metadata.kolB} at rank #${rankB}. Previously: ${metadata.kolA} was #${metadata.currentRankA}, ${metadata.kolB} was #${metadata.currentRankB}`;
    
    return { outcome, reason };
  }

  private async resolveProfitStreakMarket(metadata: any): Promise<{ outcome: "yes" | "no"; reason: string }> {
    const latestKols = await storage.getLatestScrapedKols(20);
    
    const kolData = latestKols.find(k => k.username === metadata.kolA);
    
    if (!kolData || !kolData.usdGain) {
      console.warn(`Missing KOL data for profit streak market`);
      return {
        outcome: "no",
        reason: `Market could not be resolved - missing latest USD gain data for ${metadata.kolA}`
      };
    }
    
    const hasPositiveGain = kolData.usdGain.includes('+') && kolData.usdGain.includes('$');
    const outcome = hasPositiveGain ? "yes" : "no";
    const reason = `${metadata.kolA} current USD gain: ${kolData.usdGain}. Previously: ${metadata.currentUsd}`;
    
    return { outcome, reason };
  }

  private async resolveFollowerGrowthMarket(metadata: any): Promise<{ outcome: "yes" | "no"; reason: string }> {
    if (!metadata.xHandle || !metadata.currentFollowers || !metadata.threshold) {
      console.warn(`Missing metadata for follower growth market`);
      return {
        outcome: "no",
        reason: `Market could not be resolved - incomplete metadata`
      };
    }
    
    const currentFollowers = await xApiClient.getFollowerCount(metadata.xHandle);
    
    if (currentFollowers === null) {
      console.warn(`Could not fetch current follower count for @${metadata.xHandle}`);
      const cached = await storage.getFollowerCache(metadata.xHandle);
      if (cached) {
        const growth = cached.followers - metadata.currentFollowers;
        const outcome = growth >= metadata.threshold ? "yes" : "no";
        const reason = `@${metadata.xHandle} follower growth: ${growth.toLocaleString()} (using cached data from ${new Date(cached.cachedAt).toLocaleDateString()}). Target was ${metadata.threshold.toLocaleString()}.`;
        return { outcome, reason };
      }
      
      return {
        outcome: "no",
        reason: `Market could not be resolved - X API unavailable and no cached data`
      };
    }
    
    const growth = currentFollowers - metadata.currentFollowers;
    const outcome = growth >= metadata.threshold ? "yes" : "no";
    const reason = `@${metadata.xHandle} went from ${metadata.currentFollowers.toLocaleString()} to ${currentFollowers.toLocaleString()} followers (${growth > 0 ? '+' : ''}${growth.toLocaleString()}). Target was ${metadata.threshold.toLocaleString()}.`;
    
    return { outcome, reason };
  }

  private parseSolGain(solGainStr: string | null | undefined): number {
    if (!solGainStr) return 0;
    const cleaned = solGainStr.replace(/[^0-9.+-]/g, '');
    const match = cleaned.match(/[+-]?[\d,.]+/);
    if (!match) return 0;
    const numStr = match[0].replace(/,/g, '');
    return parseFloat(numStr) || 0;
  }

  private parseUsdGain(usdGainStr: string | null | undefined): number {
    if (!usdGainStr) return 0;
    const cleaned = usdGainStr.replace(/[^0-9.+-]/g, '');
    const match = cleaned.match(/[+-]?[\d,.]+/);
    if (!match) return 0;
    const numStr = match[0].replace(/,/g, '');
    return parseFloat(numStr) || 0;
  }

  private parseWinRate(winsLossesStr: string | null | undefined): number {
    if (!winsLossesStr) return 0;
    const match = winsLossesStr.match(/^(\d+)\/(\d+)$/);
    if (!match) return 0;
    const wins = parseInt(match[1], 10);
    const losses = parseInt(match[2], 10);
    const total = wins + losses;
    return total > 0 ? wins / total : 0;
  }

  private async resolveSolGainFlippeningMarket(metadata: any): Promise<{ outcome: "yes" | "no"; reason: string }> {
    const latestKols = await storage.getLatestScrapedKols(20);
    
    const kolAData = latestKols.find(k => k.username === metadata.kolA);
    const kolBData = latestKols.find(k => k.username === metadata.kolB);
    
    if (!kolAData || !kolBData) {
      console.warn(`Missing KOL data for SOL gain flippening market`);
      return {
        outcome: "no",
        reason: `Market could not be resolved - missing latest leaderboard data for ${!kolAData ? metadata.kolA : metadata.kolB}`
      };
    }
    
    const solGainA = this.parseSolGain(kolAData.solGain);
    const solGainB = this.parseSolGain(kolBData.solGain);
    
    const outcome = solGainA > solGainB ? "yes" : "no";
    const reason = `${metadata.kolA} has ${kolAData.solGain || '0'} SOL gain vs ${metadata.kolB} with ${kolBData.solGain || '0'} SOL gain. Previously: ${metadata.kolA} had ${metadata.currentSolA || '0'}, ${metadata.kolB} had ${metadata.currentSolB || '0'}`;
    
    return { outcome, reason };
  }

  private async resolveUsdGainFlippeningMarket(metadata: any): Promise<{ outcome: "yes" | "no"; reason: string }> {
    const latestKols = await storage.getLatestScrapedKols(20);
    
    const kolAData = latestKols.find(k => k.username === metadata.kolA);
    const kolBData = latestKols.find(k => k.username === metadata.kolB);
    
    if (!kolAData || !kolBData) {
      console.warn(`Missing KOL data for USD gain flippening market`);
      return {
        outcome: "no",
        reason: `Market could not be resolved - missing latest leaderboard data for ${!kolAData ? metadata.kolA : metadata.kolB}`
      };
    }
    
    const usdGainA = this.parseUsdGain(kolAData.usdGain);
    const usdGainB = this.parseUsdGain(kolBData.usdGain);
    
    const outcome = usdGainA > usdGainB ? "yes" : "no";
    const reason = `${metadata.kolA} has ${kolAData.usdGain || '$0'} USD gain vs ${metadata.kolB} with ${kolBData.usdGain || '$0'} USD gain. Previously: ${metadata.kolA} had ${metadata.currentUsdA || '$0'}, ${metadata.kolB} had ${metadata.currentUsdB || '$0'}`;
    
    return { outcome, reason };
  }

  private async resolveWinRateFlippeningMarket(metadata: any): Promise<{ outcome: "yes" | "no"; reason: string }> {
    const latestKols = await storage.getLatestScrapedKols(20);
    
    const kolAData = latestKols.find(k => k.username === metadata.kolA);
    const kolBData = latestKols.find(k => k.username === metadata.kolB);
    
    if (!kolAData || !kolBData) {
      console.warn(`Missing KOL data for win rate flippening market`);
      return {
        outcome: "no",
        reason: `Market could not be resolved - missing latest leaderboard data for ${!kolAData ? metadata.kolA : metadata.kolB}`
      };
    }
    
    const winRateA = this.parseWinRate(kolAData.winsLosses);
    const winRateB = this.parseWinRate(kolBData.winsLosses);
    
    const outcome = winRateA > winRateB ? "yes" : "no";
    const reason = `${metadata.kolA} has ${(winRateA * 100).toFixed(1)}% win rate (${kolAData.winsLosses || '0/0'}) vs ${metadata.kolB} with ${(winRateB * 100).toFixed(1)}% win rate (${kolBData.winsLosses || '0/0'}). Previously: ${metadata.kolA} had ${metadata.currentWinsLossesA || '0/0'}, ${metadata.kolB} had ${metadata.currentWinsLossesB || '0/0'}`;
    
    return { outcome, reason };
  }

  private async resolveTopRankMaintainMarket(metadata: any): Promise<{ outcome: "yes" | "no"; reason: string }> {
    const latestKols = await storage.getLatestScrapedKols(20);
    const kolData = latestKols.find(k => k.username === metadata.kolA);
    
    if (!kolData) {
      console.warn(`Missing KOL data for top rank maintain market`);
      return {
        outcome: "no",
        reason: `Market could not be resolved - missing latest leaderboard data for ${metadata.kolA}`
      };
    }
    
    const currentRank = parseInt(kolData.rank);
    const threshold = metadata.threshold || 10;
    const outcome = currentRank <= threshold ? "yes" : "no";
    const reason = `${metadata.kolA} is now ranked #${kolData.rank}. ${outcome === 'yes' ? `Maintained position in top ${threshold}` : `Dropped below top ${threshold}`}. Previously ranked #${metadata.currentRankA}`;
    
    return { outcome, reason };
  }

  private async resolveStreakContinuationMarket(metadata: any): Promise<{ outcome: "yes" | "no"; reason: string }> {
    const latestKols = await storage.getLatestScrapedKols(20);
    const kolData = latestKols.find(k => k.username === metadata.kolA);
    
    if (!kolData) {
      console.warn(`Missing KOL data for streak continuation market`);
      return {
        outcome: "no",
        reason: `Market could not be resolved - missing latest leaderboard data for ${metadata.kolA}`
      };
    }
    
    const previousWinRate = this.parseWinRate(metadata.currentWinsLossesA);
    const currentWinRate = this.parseWinRate(kolData.winsLosses);
    
    const outcome = currentWinRate > previousWinRate ? "yes" : "no";
    const reason = `${metadata.kolA} ${outcome === 'yes' ? 'improved' : 'did not improve'} their win rate. Current: ${kolData.winsLosses || '0/0'} (${(currentWinRate * 100).toFixed(1)}%), Previous: ${metadata.currentWinsLossesA || '0/0'} (${(previousWinRate * 100).toFixed(1)}%)`;
    
    return { outcome, reason };
  }

  private async resolveRankImprovementMarket(metadata: any): Promise<{ outcome: "yes" | "no"; reason: string }> {
    const latestKols = await storage.getLatestScrapedKols(20);
    const kolData = latestKols.find(k => k.username === metadata.kolA);
    
    if (!kolData) {
      console.warn(`Missing KOL data for rank improvement market`);
      return {
        outcome: "no",
        reason: `Market could not be resolved - missing latest leaderboard data for ${metadata.kolA}`
      };
    }
    
    const currentRank = parseInt(kolData.rank);
    const targetRank = metadata.threshold || 1;
    const outcome = currentRank <= targetRank ? "yes" : "no";
    const reason = `${metadata.kolA} is now ranked #${kolData.rank}. ${outcome === 'yes' ? `Reached target of #${targetRank} or better` : `Did not reach #${targetRank}`}. Previously ranked #${metadata.currentRankA}`;
    
    return { outcome, reason };
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

  async resolveAllMarkets(): Promise<MarketResolution[]> {
    if (this.isResolving) {
      console.log("Resolution already in progress, skipping...");
      return [];
    }

    this.isResolving = true;
    console.log("Force resolving ALL unresolved markets...");

    let successCount = 0;
    let failureCount = 0;
    const resolutions: MarketResolution[] = [];

    try {
      let markets;
      try {
        markets = await storage.getAllMarketsWithKols();
      } catch (error) {
        console.error("Critical error: Failed to fetch markets from storage:", error);
        return [];
      }

      for (const market of markets) {
        try {
          if (market.isLive && market.outcome === "pending") {
            console.log(`Force resolving market: ${market.title} (${market.id})`);
            
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
        }
      }

      console.log(`Force resolution completed: ${successCount} successful, ${failureCount} failed`);
      return resolutions;
    } catch (error) {
      console.error("Unexpected error in force resolution:", error);
      return [];
    } finally {
      this.isResolving = false;
    }
  }
}

export const marketResolver = new MarketResolver();
