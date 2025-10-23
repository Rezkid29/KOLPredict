import { describe, it, expect, beforeAll, afterAll } from "vitest";

describe("Betting Flow Tests", () => {
  const API_BASE = "http://localhost:5000";
  let userId: string;
  let marketId: string;
  let userBalance: number;

  beforeAll(async () => {
    // Create a test user
    const userResponse = await fetch(`${API_BASE}/api/auth/guest`, {
      method: "POST",
    });
    const userData = await userResponse.json();
    userId = userData.userId;
    userBalance = userData.balance;

    // Get an active market
    const marketsResponse = await fetch(`${API_BASE}/api/markets`);
    const markets = await marketsResponse.json();
    const activeMarket = markets.find((m: any) => m.isLive && !m.resolved);
    marketId = activeMarket?.id;
  });

  describe("BET-001: Place Bet - Success Flow", () => {
    it("should successfully place a bet on an active market", async () => {
      if (!marketId) {
        console.warn("No active market available, skipping test");
        return;
      }

      const betAmount = 10;
      const response = await fetch(`${API_BASE}/api/bets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          marketId,
          position: "YES",
          amount: betAmount,
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty("betId");
      expect(data).toHaveProperty("shares");
      expect(data.shares).toBeGreaterThan(0);

      // Verify balance decreased
      const userResponse = await fetch(`${API_BASE}/api/users/${userId}`);
      const user = await userResponse.json();
      expect(user.balance).toBe(userBalance - betAmount);
      userBalance = user.balance;
    });

    it("should update market pools after bet", async () => {
      if (!marketId) return;

      const beforeResponse = await fetch(`${API_BASE}/api/markets/${marketId}`);
      const beforeMarket = await beforeResponse.json();
      const beforeYesPool = beforeMarket.yesPool;

      const betAmount = 5;
      await fetch(`${API_BASE}/api/bets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          marketId,
          position: "YES",
          amount: betAmount,
        }),
      });

      const afterResponse = await fetch(`${API_BASE}/api/markets/${marketId}`);
      const afterMarket = await afterResponse.json();

      expect(afterMarket.yesPool).toBeGreaterThan(beforeYesPool);
      userBalance -= betAmount;
    });
  });

  describe("BET-002: Place Bet - Insufficient Balance", () => {
    it("should reject bet with insufficient balance", async () => {
      if (!marketId) return;

      const response = await fetch(`${API_BASE}/api/bets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          marketId,
          position: "YES",
          amount: userBalance + 1000, // More than available
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.message).toMatch(/insufficient balance/i);
    });
  });

  describe("BET-005: Place Bet - Invalid Amount", () => {
    it("should reject negative amount", async () => {
      if (!marketId) return;

      const response = await fetch(`${API_BASE}/api/bets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          marketId,
          position: "YES",
          amount: -10,
        }),
      });

      expect(response.status).toBe(400);
    });

    it("should reject zero amount", async () => {
      if (!marketId) return;

      const response = await fetch(`${API_BASE}/api/bets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          marketId,
          position: "YES",
          amount: 0,
        }),
      });

      expect(response.status).toBe(400);
    });

    it("should reject amount below minimum", async () => {
      if (!marketId) return;

      const response = await fetch(`${API_BASE}/api/bets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          marketId,
          position: "YES",
          amount: 0.001,
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.message).toMatch(/at least 0.01/i);
    });

    it("should reject non-numeric amount", async () => {
      if (!marketId) return;

      const response = await fetch(`${API_BASE}/api/bets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          marketId,
          position: "YES",
          amount: "abc",
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe("BET-006: Place Bet - Invalid Position", () => {
    it("should reject lowercase position", async () => {
      if (!marketId) return;

      const response = await fetch(`${API_BASE}/api/bets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          marketId,
          position: "yes",
          amount: 5,
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.message).toMatch(/must be.*YES.*NO/i);
    });

    it("should reject invalid position value", async () => {
      if (!marketId) return;

      const response = await fetch(`${API_BASE}/api/bets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          marketId,
          position: "MAYBE",
          amount: 5,
        }),
      });

      expect(response.status).toBe(400);
    });

    it("should reject empty position", async () => {
      if (!marketId) return;

      const response = await fetch(`${API_BASE}/api/bets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          marketId,
          position: "",
          amount: 5,
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe("Multiple Bets", () => {
    it("should handle multiple consecutive bets", async () => {
      if (!marketId) return;

      const bets = [
        { position: "YES", amount: 2 },
        { position: "NO", amount: 3 },
        { position: "YES", amount: 1 },
      ];

      for (const bet of bets) {
        const response = await fetch(`${API_BASE}/api/bets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            marketId,
            ...bet,
          }),
        });

        expect(response.ok).toBe(true);
      }
    });
  });
});
