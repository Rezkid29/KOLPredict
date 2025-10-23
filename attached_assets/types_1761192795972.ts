export interface KOLData {
  rank: string;
  username: string;
  xHandle: string;
  winsLosses: string;
  solGain: string;
  usdGain: string;
}

export interface Market {
  id: string;
  question: string;
  resolution: string;
  endTime: string;
  requiresXApi: boolean;
  currentValue?: string;
  type: string;
}

export interface FollowerCache {
  [xHandle: string]: {
    followers: number;
    cachedAt: string;
  };
}

export interface MarketCacheData {
  type: string;
  kol?: string;
  kolA?: string;
  kolB?: string;
  xHandle?: string;
  currentFollowers?: number;
  currentRankA?: string;
  currentRankB?: string;
  currentUsd?: string;
  threshold?: number;
  timeframeDays?: number;
  createdAt: string;
}
