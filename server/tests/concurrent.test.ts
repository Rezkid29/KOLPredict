import { describe, it, expect } from "vitest";

describe("Concurrent Operations Tests", () => {
  const API_BASE = "http://localhost:5000";

  describe("CONCURRENT-001: Concurrent User Creation", () => {
    it("should prevent duplicate username registration", async () => {
      const username = `concurrent_test_${Date.now()}`;

      // Attempt to register same username twice simultaneously
      const [response1, response2] = await Promise.all([
        fetch(`${API_BASE}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        }),
        fetch(`${API_BASE}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        }),
      ]);

      const results = [response1.ok, response2.ok];
      const successCount = results.filter((r) => r).length;

      // Only one should succeed
      expect(successCount).toBe(1);

      // The failed one should have proper error
      const failedResponse = response1.ok ? response2 : response1;
      expect(failedResponse.status).toBe(409);
      const errorData = await failedResponse.json();
      expect(errorData.message).toMatch(/already exists/i);
    });
  });

  describe("CONCURRENT-002: Concurrent Bets with Balance Check", () => {
    it("should prevent double-spend of user balance", async () => {
      // Create user with specific balance
      const userResponse = await fetch(`${API_BASE}/api/auth/guest`, {
        method: "POST",
      });
      const userData = await userResponse.json();
      const userId = userData.userId;
      const initialBalance = userData.balance;

      // Get a market
      const marketsResponse = await fetch(`${API_BASE}/api/markets`);
      const markets = await marketsResponse.json();
      const market = markets.find((m: any) => m.isLive && !m.resolved);

      if (!market) {
        console.warn("No active market, skipping test");
        return;
      }

      // Try to place two bets that would exceed balance
      const betAmount = initialBalance * 0.6; // Each bet is 60% of balance

      const [bet1, bet2] = await Promise.all([
        fetch(`${API_BASE}/api/bets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            marketId: market.id,
            position: "YES",
            amount: betAmount,
          }),
        }),
        fetch(`${API_BASE}/api/bets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            marketId: market.id,
            position: "NO",
            amount: betAmount,
          }),
        }),
      ]);

      // One should succeed, one should fail
      const successCount = [bet1.ok, bet2.ok].filter((r) => r).length;

      // At most one should succeed, or both might fail if racing
      expect(successCount).toBeLessThanOrEqual(1);

      // Verify final balance is consistent
      const finalUser = await fetch(`${API_BASE}/api/users/${userId}`);
      const finalData = await finalUser.json();

      if (successCount === 1) {
        // Balance should be reduced by exactly one bet amount
        expect(finalData.balance).toBeCloseTo(initialBalance - betAmount, 2);
      }
    });
  });

  describe("CONCURRENT-006: Concurrent Bets on Same Market", () => {
    it("should handle multiple simultaneous bets on same market", async () => {
      // Create multiple users
      const users = await Promise.all([
        fetch(`${API_BASE}/api/auth/guest`, { method: "POST" }),
        fetch(`${API_BASE}/api/auth/guest`, { method: "POST" }),
        fetch(`${API_BASE}/api/auth/guest`, { method: "POST" }),
      ]);

      const userIds = await Promise.all(
        users.map(async (r) => {
          const data = await r.json();
          return data.userId;
        })
      );

      // Get a market
      const marketsResponse = await fetch(`${API_BASE}/api/markets`);
      const markets = await marketsResponse.json();
      const market = markets.find((m: any) => m.isLive && !m.resolved);

      if (!market) return;

      const beforeMarket = await fetch(`${API_BASE}/api/markets/${market.id}`);
      const beforeData = await beforeMarket.json();

      // All users bet on same market simultaneously
      const betPromises = userIds.map((userId) =>
        fetch(`${API_BASE}/api/bets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            marketId: market.id,
            position: Math.random() > 0.5 ? "YES" : "NO",
            amount: 10,
          }),
        })
      );

      const betResults = await Promise.all(betPromises);

      // All should succeed
      betResults.forEach((result) => {
        expect(result.ok).toBe(true);
      });

      // Verify market state is consistent
      const afterMarket = await fetch(`${API_BASE}/api/markets/${market.id}`);
      const afterData = await afterMarket.json();

      // Total pool should have increased
      const beforeTotal = beforeData.yesPool + beforeData.noPool;
      const afterTotal = afterData.yesPool + afterData.noPool;
      expect(afterTotal).toBeGreaterThan(beforeTotal);
    });
  });

  describe("Concurrent Nonce Requests", () => {
    it("should handle concurrent nonce generation safely", async () => {
      const nonceRequests = Array(10)
        .fill(null)
        .map(() =>
          fetch(`${API_BASE}/api/auth/solana/nonce`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          })
        );

      const responses = await Promise.all(nonceRequests);

      // All should succeed (within rate limit)
      const successful = responses.filter((r) => r.ok);
      expect(successful.length).toBeGreaterThan(0);

      // Get nonces from successful responses
      const nonces = await Promise.all(
        successful.map(async (r) => {
          const data = await r.json();
          return data.nonce;
        })
      );

      // All nonces should be unique
      const uniqueNonces = new Set(nonces);
      expect(uniqueNonces.size).toBe(nonces.length);
    });
  });
});
