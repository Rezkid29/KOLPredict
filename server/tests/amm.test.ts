import { describe, it, expect } from "vitest";

describe("AMM (Automated Market Maker) Boundary Tests", () => {
  const API_BASE = "http://localhost:5000";

  describe("AMM-001: Pool Depletion Prevention", () => {
    it("should prevent draining pool to near-zero", async () => {
      // Create test user
      const userResponse = await fetch(`${API_BASE}/api/auth/guest`, {
        method: "POST",
      });
      const userData = await userResponse.json();
      const userId = userData.userId;

      // Get a market
      const marketsResponse = await fetch(`${API_BASE}/api/markets`);
      const markets = await marketsResponse.json();
      const market = markets.find((m: any) => m.isLive && !m.resolved);

      if (!market) return;

      // Try to buy an amount that would exceed MAX_TRADE_PERCENTAGE (40% of pool)
      // With $20,000 total pool, max trade is 40% = $8,000
      const largeAmount = 9000; // Exceeds 40% limit, should be rejected

      const response = await fetch(`${API_BASE}/api/bets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          marketId: market.id,
          position: "YES",
          amount: largeAmount,
        }),
      });

      // Should be rejected with 400 error for exceeding trade size limit
      expect(response.status).toBe(400);
      if (!response.ok) {
        const error = await response.json();
        expect(error.message).toContain("Trade size too large");
      }
    });
  });

  describe("AMM-002: Division by Zero Prevention", () => {
    it("should handle edge case calculations safely", async () => {
      // Test that the system doesn't crash with extreme values
      const userResponse = await fetch(`${API_BASE}/api/auth/guest`, {
        method: "POST",
      });
      const userData = await userResponse.json();

      const marketsResponse = await fetch(`${API_BASE}/api/markets`);
      const markets = await marketsResponse.json();
      const market = markets.find((m: any) => m.isLive);

      if (!market) return;

      // Place a very small bet
      const response = await fetch(`${API_BASE}/api/bets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userData.userId,
          marketId: market.id,
          position: "YES",
          amount: 0.01, // Minimum amount
        }),
      });

      // Should either succeed or return proper error, not crash
      expect([200, 400]).toContain(response.status);
    });
  });

  describe("AMM-003: Negative Result Prevention", () => {
    it("should never return negative shares", async () => {
      const userResponse = await fetch(`${API_BASE}/api/auth/guest`, {
        method: "POST",
      });
      const userData = await userResponse.json();

      const marketsResponse = await fetch(`${API_BASE}/api/markets`);
      const markets = await marketsResponse.json();
      const market = markets.find((m: any) => m.isLive);

      if (!market) return;

      const response = await fetch(`${API_BASE}/api/bets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userData.userId,
          marketId: market.id,
          position: "YES",
          amount: 50,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        expect(data.shares).toBeGreaterThan(0);
      }
    });
  });

  describe("AMM-004: Price Impact Validation", () => {
    it("should have significant price impact for large orders", async () => {
      const userResponse = await fetch(`${API_BASE}/api/auth/guest`, {
        method: "POST",
      });
      const userData = await userResponse.json();

      const marketsResponse = await fetch(`${API_BASE}/api/markets`);
      const markets = await marketsResponse.json();
      const market = markets.find((m: any) => m.isLive);

      if (!market) return;

      const beforePrice = market.yesPrice;

      // Place a large bet
      const response = await fetch(`${API_BASE}/api/bets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userData.userId,
          marketId: market.id,
          position: "YES",
          amount: 100,
        }),
      });

      if (response.ok) {
        const afterMarket = await fetch(`${API_BASE}/api/markets/${market.id}`);
        const afterData = await afterMarket.json();
        const afterPrice = afterData.yesPrice;

        // Price should have moved
        expect(Math.abs(afterPrice - beforePrice)).toBeGreaterThan(0);
      }
    });

    it("should have minimal price impact for small orders", async () => {
      const userResponse = await fetch(`${API_BASE}/api/auth/guest`, {
        method: "POST",
      });
      const userData = await userResponse.json();

      const marketsResponse = await fetch(`${API_BASE}/api/markets`);
      const markets = await marketsResponse.json();
      const market = markets.find((m: any) => m.isLive);

      if (!market) return;

      const beforePrice = market.yesPrice;

      // Place a small bet (10 out of 20,000 total pool = 0.05%)
      const response = await fetch(`${API_BASE}/api/bets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userData.userId,
          marketId: market.id,
          position: "YES",
          amount: 10,
        }),
      });

      if (response.ok) {
        const afterMarket = await fetch(`${API_BASE}/api/markets/${market.id}`);
        const afterData = await afterMarket.json();
        const afterPrice = afterData.yesPrice;

        // With $20,000 pools, $10 trade should have very minimal impact (<0.5%)
        expect(Math.abs(afterPrice - beforePrice)).toBeLessThan(0.005);
      }
    });
  });

  describe("AMM-007: Extreme Pool Ratios", () => {
    it("should handle extreme pool ratios correctly", async () => {
      // Get markets and find one with extreme ratios if any
      const marketsResponse = await fetch(`${API_BASE}/api/markets`);
      const markets = await marketsResponse.json();

      for (const market of markets) {
        const ratio = market.yesPool / market.noPool;
        
        // Check if ratio is extreme (>10 or <0.1)
        if (ratio > 10 || ratio < 0.1) {
          // Verify prices are still calculated correctly
          expect(market.yesPrice).toBeGreaterThan(0);
          expect(market.yesPrice).toBeLessThan(1);
          expect(market.noPrice).toBeGreaterThan(0);
          expect(market.noPrice).toBeLessThan(1);
          
          // Prices should roughly sum to 1
          expect(Math.abs((market.yesPrice + market.noPrice) - 1)).toBeLessThan(0.01);
        }
      }
    });
  });

  describe("AMM-008: Price Impact Cap Enforcement", () => {
    it("should reject trades that exceed 25% price impact", async () => {
      const loginRes = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "testuser", password: "password" }),
      });
      const cookies = loginRes.headers.get("set-cookie");

      // Get a market with balanced pools
      const marketsResponse = await fetch(`${API_BASE}/api/markets`);
      const markets = await marketsResponse.json();
      const balancedMarket = markets.find((m: any) => {
        const ratio = m.yesPool / m.noPool;
        return ratio > 0.8 && ratio < 1.2; // Balanced pools
      });

      if (balancedMarket) {
        // Calculate trade size that would cause >25% price impact
        // With constant product: k = yesPool * noPool
        // newYesPool = yesPool + tradeAmount
        // newNoPool = k / newYesPool
        // newPrice = newYesPool / (newYesPool + newNoPool)
        // For 25% price impact from 0.5 to 0.625:
        // We need a very large trade relative to pool size
        const totalPool = balancedMarket.yesPool + balancedMarket.noPool;
        const largeTradeAmount = totalPool * 0.35; // 35% of total pool

        const betRes = await fetch(`${API_BASE}/api/bets`, {
          method: "POST",
          headers: { "Content-Type": "application/json", cookie: cookies || "" },
          body: JSON.stringify({
            marketId: balancedMarket.id,
            position: "YES",
            amount: largeTradeAmount,
            slippageTolerance: 0.50, // Even with high slippage tolerance
          }),
        });

        // Should be rejected due to price impact cap
        expect(betRes.status).toBe(400);
        const errorData = await betRes.json();
        expect(errorData.message).toContain("price impact");
      }
    });

    it("should accept trades below 25% price impact", async () => {
      const loginRes = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "testuser", password: "password" }),
      });
      const cookies = loginRes.headers.get("set-cookie");

      const marketsResponse = await fetch(`${API_BASE}/api/markets`);
      const markets = await marketsResponse.json();
      const market = markets[0];

      // Small trade that won't exceed 25% price impact
      const smallTradeAmount = 500; // $500 on $20,000 pool

      const betRes = await fetch(`${API_BASE}/api/bets`, {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookies || "" },
        body: JSON.stringify({
          marketId: market.id,
          position: "YES",
          amount: smallTradeAmount,
        }),
      });

      // Should succeed
      expect(betRes.ok).toBe(true);
    });
  });

  describe("AMM-009: Preview Endpoint", () => {
    it("should provide accurate price impact preview", async () => {
      const loginRes = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "testuser", password: "password" }),
      });
      const cookies = loginRes.headers.get("set-cookie");

      const marketsResponse = await fetch(`${API_BASE}/api/markets`);
      const markets = await marketsResponse.json();
      const market = markets[0];

      // Preview a trade
      const tradeAmount = 1000;
      const previewRes = await fetch(`${API_BASE}/api/bets/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookies || "" },
        body: JSON.stringify({
          marketId: market.id,
          position: "YES",
          amount: tradeAmount,
          action: "buy",
        }),
      });

      expect(previewRes.ok).toBe(true);
      const preview = await previewRes.json();

      // Verify preview structure
      expect(preview).toHaveProperty("currentPrice");
      expect(preview).toHaveProperty("newPrice");
      expect(preview).toHaveProperty("priceImpact");
      expect(preview).toHaveProperty("priceImpactPercent");
      expect(preview).toHaveProperty("estimatedShares");
      expect(preview).toHaveProperty("platformFee");
      expect(preview).toHaveProperty("warnings");
      expect(preview).toHaveProperty("poolState");

      // Price impact should be reasonable for $1000 trade on $20,000 pool
      expect(preview.priceImpact).toBeGreaterThan(0);
      expect(preview.priceImpact).toBeLessThan(0.25); // Below 25% cap
    });

    it("should warn about trades that would exceed limits", async () => {
      const loginRes = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "testuser", password: "password" }),
      });
      const cookies = loginRes.headers.get("set-cookie");

      const marketsResponse = await fetch(`${API_BASE}/api/markets`);
      const markets = await marketsResponse.json();
      const market = markets[0];

      // Preview a large trade that would exceed limits
      const totalPool = market.yesPool + market.noPool;
      const largeTradeAmount = totalPool * 0.35;

      const previewRes = await fetch(`${API_BASE}/api/bets/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookies || "" },
        body: JSON.stringify({
          marketId: market.id,
          position: "YES",
          amount: largeTradeAmount,
          action: "buy",
        }),
      });

      expect(previewRes.ok).toBe(true);
      const preview = await previewRes.json();

      // Should have error warnings
      expect(preview.warnings.length).toBeGreaterThan(0);
      const errorWarnings = preview.warnings.filter((w: any) => w.severity === "error");
      expect(errorWarnings.length).toBeGreaterThan(0);
    });

    it("should respect custom slippage tolerance in preview", async () => {
      const loginRes = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "testuser", password: "password" }),
      });
      const cookies = loginRes.headers.get("set-cookie");

      const marketsResponse = await fetch(`${API_BASE}/api/markets`);
      const markets = await marketsResponse.json();
      const market = markets[0];

      // Trade size that would cause ~12% price impact
      const totalPool = market.yesPool + market.noPool;
      const mediumTradeAmount = totalPool * 0.08;

      // Preview with default slippage (10%) - should warn
      const previewDefault = await fetch(`${API_BASE}/api/bets/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookies || "" },
        body: JSON.stringify({
          marketId: market.id,
          position: "YES",
          amount: mediumTradeAmount,
          action: "buy",
        }),
      });

      const defaultResult = await previewDefault.json();
      
      // Preview with high slippage tolerance (20%) - should not warn
      const previewHighTolerance = await fetch(`${API_BASE}/api/bets/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookies || "" },
        body: JSON.stringify({
          marketId: market.id,
          position: "YES",
          amount: mediumTradeAmount,
          action: "buy",
          slippageTolerance: 0.20,
        }),
      });

      const highToleranceResult = await previewHighTolerance.json();

      // Both previews should succeed
      expect(previewDefault.ok).toBe(true);
      expect(previewHighTolerance.ok).toBe(true);

      // Results should use the respective tolerances in warnings
      // With custom tolerance, fewer/different warnings expected
      if (defaultResult.warnings.length > 0 && highToleranceResult.warnings.length > 0) {
        const defaultSlippageWarnings = defaultResult.warnings.filter((w: any) => 
          w.message.includes("slippage tolerance")
        );
        const highToleranceSlippageWarnings = highToleranceResult.warnings.filter((w: any) => 
          w.message.includes("slippage tolerance")
        );
        
        // Verify different tolerance values are mentioned
        if (defaultSlippageWarnings.length > 0) {
          expect(defaultSlippageWarnings[0].message).toContain("10");
        }
        if (highToleranceSlippageWarnings.length > 0) {
          expect(highToleranceSlippageWarnings[0].message).toContain("20");
        }
      }
    });

    it("should handle edge cases for slippage tolerance (null, empty, NaN)", async () => {
      const loginRes = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "testuser", password: "password" }),
      });
      const cookies = loginRes.headers.get("set-cookie");

      const marketsResponse = await fetch(`${API_BASE}/api/markets`);
      const markets = await marketsResponse.json();
      const market = markets[0];

      const tradeAmount = 1000;

      // Test with empty string - should default to 10%
      const previewEmpty = await fetch(`${API_BASE}/api/bets/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookies || "" },
        body: JSON.stringify({
          marketId: market.id,
          position: "YES",
          amount: tradeAmount,
          action: "buy",
          slippageTolerance: "",
        }),
      });
      expect(previewEmpty.ok).toBe(true);
      const emptyResult = await previewEmpty.json();
      expect(emptyResult).toHaveProperty("priceImpact");

      // Test with null - should default to 10%
      const previewNull = await fetch(`${API_BASE}/api/bets/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookies || "" },
        body: JSON.stringify({
          marketId: market.id,
          position: "YES",
          amount: tradeAmount,
          action: "buy",
          slippageTolerance: null,
        }),
      });
      expect(previewNull.ok).toBe(true);
      const nullResult = await previewNull.json();
      expect(nullResult).toHaveProperty("priceImpact");

      // Test without slippageTolerance field - should default to 10%
      const previewUndefined = await fetch(`${API_BASE}/api/bets/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookies || "" },
        body: JSON.stringify({
          marketId: market.id,
          position: "YES",
          amount: tradeAmount,
          action: "buy",
        }),
      });
      expect(previewUndefined.ok).toBe(true);
      const undefinedResult = await previewUndefined.json();
      expect(undefinedResult).toHaveProperty("priceImpact");

      // All should produce the same result (using default 10% tolerance)
      expect(emptyResult.priceImpact).toBeCloseTo(nullResult.priceImpact, 5);
      expect(nullResult.priceImpact).toBeCloseTo(undefinedResult.priceImpact, 5);
    });
  });
});
