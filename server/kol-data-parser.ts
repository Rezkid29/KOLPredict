import type { InsertScrapedKol } from '@shared/schema';

export interface RawKOLData {
  rank: string;
  username: string;
  xHandle: string | null;
  winsLosses: string | null;
  solGain: string | null;
  usdGain: string | null;
}

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

  static parseRawKOLDataBatch(rawData: RawKOLData[]): InsertScrapedKol[] {
    return rawData.map(raw => this.parseRawKOLData(raw));
  }
}
