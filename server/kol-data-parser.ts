import type { InsertScrapedKol } from '@shared/schema';

export interface RawKOLData {
  rank: string;
  username: string;
  xHandle: string | null;
  winsLosses: string | null;
  solGain: string | null;
  usdGain: string | null;
}

export interface KOLDetailedData {
  pnl1d: string | null;
  pnl7d: string | null;
  pnl30d: string | null;
  winRate1d: string | null;
  winRate7d: string | null;
  winRate30d: string | null;
  totalTrades1d: string | null;
  totalTrades7d: string | null;
  totalTrades30d: string | null;
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

  static parseDecimalValue(valueStr: string | null | undefined): number | null {
    if (!valueStr) return null;
    // Handle case where valueStr might not be a string
    if (typeof valueStr !== 'string') {
      if (typeof valueStr === 'number') return valueStr;
      return null;
    }
    const cleanedStr = valueStr.replace(/,/g, '').replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleanedStr);
    return isNaN(parsed) ? null : parsed;
  }

  static parseIntValue(valueStr: string | null | undefined): number | null {
    if (!valueStr) return null;
    // Handle case where valueStr might not be a string
    if (typeof valueStr !== 'string') {
      if (typeof valueStr === 'number') return Math.floor(valueStr);
      return null;
    }
    const cleanedStr = valueStr.replace(/,/g, '').replace(/[^\d.-]/g, '');
    const parsed = parseInt(cleanedStr, 10);
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

    const toDecimalString = (val: number | null): string | null => {
      return val !== null ? val.toString() : null;
    };

    return {
      rank: this.parseRank(raw.rank),
      username: this.normalizeUsername(raw.username),
      xHandle: raw.xHandle || null,
      wins,
      losses,
      solGain: this.parseSolGain(raw.solGain),
      usdGain: this.parseUsdGain(raw.usdGain),
      // PnL for each timeframe
      pnl1d: toDecimalString(this.parseDecimalValue(raw.pnl1d)),
      pnl7d: toDecimalString(this.parseDecimalValue(raw.pnl7d)),
      pnl30d: toDecimalString(this.parseDecimalValue(raw.pnl30d)),
      // Win Rate for each timeframe
      winRate1d: toDecimalString(this.parseDecimalValue(raw.winRate1d)),
      winRate7d: toDecimalString(this.parseDecimalValue(raw.winRate7d)),
      winRate30d: toDecimalString(this.parseDecimalValue(raw.winRate30d)),
      // Total Trades for each timeframe
      totalTrades1d: this.parseIntValue(raw.totalTrades1d),
      totalTrades7d: this.parseIntValue(raw.totalTrades7d),
      totalTrades30d: this.parseIntValue(raw.totalTrades30d),
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