
import type { InsertScrapedKol } from '@shared/schema';

export interface RawKOLData {
  rank: string;
  username: string;
  xHandle: string | null;
  winsLosses: string | null;
  solGain: string | null;
  usdGain: string | null;
}

export interface KOLHolding {
  tokenName: string;
  tokenSymbol: string;
  valueUsd: string | null;
  amount: string | null;
}

export interface KOLTrade {
  type: 'buy' | 'sell';
  tokenName: string;
  amount: string | null;
  valueUsd: string | null;
  timestamp: string | null;
}

export interface KOLDetailedData {
  pnl1d?: string | null;
  pnl7d: string | null;
  pnl30d: string | null;
  totalTrades: string | null;
  winRatePercent: string | null;
  holdings: KOLHolding[];
  tradeHistory: KOLTrade[];
}

export type FullKOLData = RawKOLData & KOLDetailedData & { profileUrl?: string };

export class KOLDataParser {
  static parseRank(rankStr: string): number {
    const match = rankStr.replace(/[^\d]/g, '');
    return match ? parseInt(match, 10) : 999;
  }

  static parseWinsLosses(winsLossesStr: string | null): { wins: number | null; losses: number | null } {
    if (!winsLossesStr) return { wins: null, losses: null };
    const match = winsLossesStr.match(/^(\d+)\/(\d+)$/);
    if (!match) return { wins: null, losses: null };
    return {
      wins: parseInt(match[1], 10),
      losses: parseInt(match[2], 10),
    };
  }

  static parseSolGain(solGainStr: string | null): string | null {
    if (!solGainStr) return null;
    const cleaned = solGainStr.replace(/[^0-9.+-]/g, '');
    const match = cleaned.match(/[+-]?[\d,.]+/);
    if (!match) return null;
    return match[0].replace(/,/g, '');
  }

  static parseUsdGain(usdGainStr: string | null): string | null {
    if (!usdGainStr) return null;
    const cleaned = usdGainStr.replace(/[^0-9.+-]/g, '');
    const match = cleaned.match(/[+-]?[\d,.]+/);
    if (!match) return null;
    return match[0].replace(/,/g, '');
  }

  static parseDecimalValue(valueStr: string | null): string | null {
    if (!valueStr) return null;
    const cleaned = valueStr.replace(/[^0-9.+-]/g, '');
    const match = cleaned.match(/[+-]?[\d,.]+/);
    if (!match) return null;
    return match[0].replace(/,/g, '');
  }

  static parseIntValue(valueStr: string | null): number | null {
    if (!valueStr) return null;
    const cleaned = valueStr.replace(/[^\d]/g, '');
    const parsed = parseInt(cleaned, 10);
    return isNaN(parsed) ? null : parsed;
  }

  static normalizeUsername(username: string): string {
    return username.toLowerCase().trim();
  }

  static parseRawKOLData(raw: RawKOLData): InsertScrapedKol {
    const { wins, losses } = this.parseWinsLosses(raw.winsLosses);
    return {
      rank: this.parseRank(raw.rank),
      username: this.normalizeUsername(raw.username),
      xHandle: raw.xHandle || null,
      wins,
      losses,
      solGain: this.parseSolGain(raw.solGain),
      usdGain: this.parseUsdGain(raw.usdGain),
    };
  }

  static parseFullKOLData(raw: FullKOLData): InsertScrapedKol {
    const { wins, losses } = this.parseWinsLosses(raw.winsLosses);
    
    return {
      rank: this.parseRank(raw.rank),
      username: this.normalizeUsername(raw.username),
      xHandle: raw.xHandle || null,
      wins,
      losses,
      solGain: this.parseSolGain(raw.solGain),
      usdGain: this.parseUsdGain(raw.usdGain),
      // New detailed fields
      pnl7d: this.parseDecimalValue(raw.pnl7d),
      pnl30d: this.parseDecimalValue(raw.pnl30d),
      totalTrades: this.parseIntValue(raw.totalTrades),
      winRatePercent: this.parseDecimalValue(raw.winRatePercent),
      holdings: raw.holdings && raw.holdings.length > 0 ? JSON.stringify(raw.holdings) : null,
      tradeHistory: raw.tradeHistory && raw.tradeHistory.length > 0 ? JSON.stringify(raw.tradeHistory) : null,
      profileUrl: raw.profileUrl || null,
    };
  }

  static parseRawKOLDataBatch(rawData: RawKOLData[]): InsertScrapedKol[] {
    return rawData.map(raw => this.parseRawKOLData(raw));
  }

  static parseFullKOLDataBatch(rawData: FullKOLData[]): InsertScrapedKol[] {
    return rawData.map(raw => this.parseFullKOLData(raw));
  }
}
