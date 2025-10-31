import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../db-storage", () => {
  return {
    dbStorage: {
      enqueueManualReview: vi.fn().mockResolvedValue(undefined),
    },
  };
});

import { MarketResolver } from "../market-resolver";
import * as Logger from "../logger";
import { dbStorage as storage } from "../db-storage";

// Helpers
function mkScraped(username: string, rank = 10) {
  return {
    id: "",
    rank,
    username,
    xHandle: null,
    wins: null,
    losses: null,
    solGain: null,
    usdGain: null,
    pnl1d: null,
    pnl7d: null,
    pnl30d: null,
    winRate1d: null,
    winRate7d: null,
    winRate30d: null,
    totalTrades1d: null,
    totalTrades7d: null,
    totalTrades30d: null,
    profileUrl: null,
    scrapedAt: new Date(),
  } as any;
}

describe("MarketResolver paired-market behaviors", () => {
  let resolver: MarketResolver;
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    resolver = new MarketResolver();
    logSpy = vi.spyOn(Logger, "logResolutionEvent").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("normalizes names and applies single-KOL auto-win", async () => {
    vi.spyOn(resolver as any, "findKolDataForPair").mockResolvedValue({
      kolAData: mkScraped("john doe", 5),
      kolBData: undefined,
      rowCount: 1,
      retryCount: 0,
      scrapedSample: ["john doe"],
    });

    const result = await (resolver as any).resolveRankFlippeningMarket({
      kolA: "John Doe ",
      kolB: " jane doe",
      currentRankA: null,
      currentRankB: null,
    });

    expect(result).toBeTruthy();
    expect(result.reason).toMatch(/present in latest leaderboard/);
    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: "AUTO_WIN_APPLIED" })
    );
  });

  it("uses metadata fallback rank compare when both missing", async () => {
    vi.spyOn(resolver as any, "findKolDataForPair").mockResolvedValue({
      kolAData: undefined,
      kolBData: undefined,
      rowCount: 0,
      retryCount: 1,
      scrapedSample: [],
    });

    await (resolver as any).resolveRankFlippeningMarket({
      kolA: "Alice",
      kolB: "Bob",
      currentRankA: 5,
      currentRankB: 12,
    });

    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: "FALLBACK_METADATA_APPLIED" })
    );
  });

  it("enqueues manual review when indeterminate", async () => {
    vi.spyOn(resolver as any, "findKolDataForPair").mockResolvedValue({
      kolAData: undefined,
      kolBData: undefined,
      rowCount: 0,
      retryCount: 1,
      scrapedSample: [],
    });
    const enqueueSpy = vi.spyOn(storage, "enqueueManualReview");

    await (resolver as any).resolveRankFlippeningMarket({
      kolA: "alpha",
      kolB: "beta",
      marketId: "m-123",
      currentRankA: undefined,
      currentRankB: undefined,
    });

    expect(enqueueSpy).toHaveBeenCalledWith(
      expect.objectContaining({ marketId: "m-123", marketType: "rank_flippening" })
    );
    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: "MISSING_KOL_DATA", decision: "manual_review" })
    );
  });

  it("triggers retry scrape path when first scrape misses and second hits", async () => {
    const freshSpy = vi
      .spyOn(resolver as any, "getFreshKolData")
      .mockResolvedValueOnce([mkScraped("missing")])
      .mockResolvedValueOnce([mkScraped("kol_a", 3), mkScraped("kol_b", 12)]);

    const result = await (resolver as any).resolveRankFlippeningMarket({
      kolA: "KOL_A",
      kolB: "KOL_B",
      currentRankA: null,
      currentRankB: null,
    });

    expect(result).toBeTruthy();
    expect(freshSpy).toHaveBeenCalledTimes(2);
    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: "SCRAPE_TRIGGERED" })
    );
    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: "SCRAPE_RETRY_RESULT" })
    );
  });
});
