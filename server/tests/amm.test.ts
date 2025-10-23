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

      // Try to buy an amount that would drain the pool
      const largeAmount = 900; // Assuming this would drain the pool

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

      if (response.ok) {
        // If successful, verify pools didn't go too low
        const updatedMarket = await fetch(`${API_BASE}/api/markets/${market.id}`);
        const marketData = await updatedMarket.json();

        expect(marketData.yesPool).toBeGreaterThan(1);
        expect(marketData.noPool).toBeGreaterThan(1);
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

      // Place a tiny bet
      const response = await fetch(`${API_BASE}/api/bets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userData.userId,
          marketId: market.id,
          position: "YES",
          amount: 0.1,
        }),
      });

      if (response.ok) {
        const afterMarket = await fetch(`${API_BASE}/api/markets/${market.id}`);
        const afterData = await afterMarket.json();
        const afterPrice = afterData.yesPrice;

        // Price should have minimal change
        expect(Math.abs(afterPrice - beforePrice)).toBeLessThan(0.01);
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
});
