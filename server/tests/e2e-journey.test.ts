import { describe, it, expect } from "vitest";

describe("End-to-End User Journey Tests", () => {
  const API_BASE = "http://localhost:5000";

  describe("Complete User Journey - Guest User", () => {
    it("should complete full journey from signup to betting", async () => {
      // Step 1: Guest signup
      const signupResponse = await fetch(`${API_BASE}/api/auth/guest`, {
        method: "POST",
      });
      expect(signupResponse.ok).toBe(true);

      const user = await signupResponse.json();
      expect(user).toHaveProperty("userId");
      expect(user).toHaveProperty("username");
      expect(user.balance).toBe(1000);
      expect(user.isGuest).toBe(true);

      const { userId, balance: initialBalance } = user;

      // Step 2: Browse markets
      const marketsResponse = await fetch(`${API_BASE}/api/markets`);
      expect(marketsResponse.ok).toBe(true);

      const markets = await marketsResponse.json();
      expect(Array.isArray(markets)).toBe(true);
      expect(markets.length).toBeGreaterThan(0);

      // Step 3: Select a market
      const activeMarket = markets.find((m: any) => m.isLive && !m.resolved);
      expect(activeMarket).toBeDefined();

      const marketId = activeMarket.id;

      // Step 4: Place first bet
      const bet1Amount = 50;
      const bet1Response = await fetch(`${API_BASE}/api/bets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          marketId,
          position: "YES",
          amount: bet1Amount,
        }),
      });

      expect(bet1Response.ok).toBe(true);
      const bet1Data = await bet1Response.json();
      expect(bet1Data).toHaveProperty("betId");
      expect(bet1Data).toHaveProperty("shares");
      expect(bet1Data.shares).toBeGreaterThan(0);

      // Step 5: Check updated balance
      const userResponse1 = await fetch(`${API_BASE}/api/users/${userId}`);
      const updatedUser1 = await userResponse1.json();
      expect(updatedUser1.balance).toBe(initialBalance - bet1Amount);

      // Step 6: Place opposite bet
      const bet2Amount = 30;
      const bet2Response = await fetch(`${API_BASE}/api/bets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          marketId,
          position: "NO",
          amount: bet2Amount,
        }),
      });

      expect(bet2Response.ok).toBe(true);

      // Step 7: Check portfolio
      const portfolioResponse = await fetch(`${API_BASE}/api/users/${userId}/bets`);
      expect(portfolioResponse.ok).toBe(true);

      const bets = await portfolioResponse.json();
      expect(Array.isArray(bets)).toBe(true);
      expect(bets.length).toBeGreaterThanOrEqual(2);

      // Step 8: View leaderboard
      const leaderboardResponse = await fetch(`${API_BASE}/api/leaderboard`);
      expect(leaderboardResponse.ok).toBe(true);

      const leaderboard = await leaderboardResponse.json();
      expect(Array.isArray(leaderboard)).toBe(true);

      // Step 9: Check final balance
      const finalUserResponse = await fetch(`${API_BASE}/api/users/${userId}`);
      const finalUser = await finalUserResponse.json();
      expect(finalUser.balance).toBe(
        initialBalance - bet1Amount - bet2Amount
      );
    });
  });

  describe("Complete User Journey - Username User", () => {
    it("should complete full journey with username registration", async () => {
      const username = `e2e_test_${Date.now()}`;

      // Step 1: Register
      const registerResponse = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      expect(registerResponse.ok).toBe(true);
      const user = await registerResponse.json();
      expect(user.username).toBe(username);

      const { userId, balance: initialBalance } = user;

      // Step 2: Logout (simulated)
      // In real app, would clear localStorage

      // Step 3: Login again
      const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      expect(loginResponse.ok).toBe(true);
      const loginData = await loginResponse.json();
      expect(loginData.userId).toBe(userId);

      // Step 4: Place bet
      const marketsResponse = await fetch(`${API_BASE}/api/markets`);
      const markets = await marketsResponse.json();
      const market = markets.find((m: any) => m.isLive && !m.resolved);

      if (market) {
        const betResponse = await fetch(`${API_BASE}/api/bets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            marketId: market.id,
            position: "YES",
            amount: 25,
          }),
        });

        expect(betResponse.ok).toBe(true);
      }
    });
  });

  describe("Error Recovery Journey", () => {
    it("should handle errors gracefully and allow recovery", async () => {
      // Step 1: Create user
      const userResponse = await fetch(`${API_BASE}/api/auth/guest`, {
        method: "POST",
      });
      const user = await userResponse.json();
      const { userId } = user;

      // Step 2: Try invalid bet (should fail)
      const invalidBetResponse = await fetch(`${API_BASE}/api/bets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          marketId: "invalid-market-id",
          position: "YES",
          amount: 10,
        }),
      });

      expect(invalidBetResponse.ok).toBe(false);

      // Step 3: Balance should be unchanged
      const userCheck1 = await fetch(`${API_BASE}/api/users/${userId}`);
      const userData1 = await userCheck1.json();
      expect(userData1.balance).toBe(1000);

      // Step 4: Try valid bet (should succeed)
      const marketsResponse = await fetch(`${API_BASE}/api/markets`);
      const markets = await marketsResponse.json();
      const market = markets.find((m: any) => m.isLive);

      if (market) {
        const validBetResponse = await fetch(`${API_BASE}/api/bets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            marketId: market.id,
            position: "YES",
            amount: 10,
          }),
        });

        expect(validBetResponse.ok).toBe(true);

        // Step 5: Balance should now be reduced
        const userCheck2 = await fetch(`${API_BASE}/api/users/${userId}`);
        const userData2 = await userCheck2.json();
        expect(userData2.balance).toBe(990);
      }
    });
  });

  describe("Multiple Markets Journey", () => {
    it("should handle betting across multiple markets", async () => {
      const userResponse = await fetch(`${API_BASE}/api/auth/guest`, {
        method: "POST",
      });
      const user = await userResponse.json();
      const { userId } = user;

      const marketsResponse = await fetch(`${API_BASE}/api/markets`);
      const markets = await marketsResponse.json();
      const activeMarkets = markets.filter((m: any) => m.isLive && !m.resolved);

      if (activeMarkets.length < 2) {
        console.warn("Not enough active markets for test");
        return;
      }

      // Bet on multiple markets
      const bets = await Promise.all(
        activeMarkets.slice(0, 3).map((market: any) =>
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
        )
      );

      // All bets should succeed
      bets.forEach((bet) => {
        expect(bet.ok).toBe(true);
      });

      // Check portfolio shows all bets
      const portfolioResponse = await fetch(`${API_BASE}/api/users/${userId}/bets`);
      const portfolio = await portfolioResponse.json();
      expect(portfolio.length).toBeGreaterThanOrEqual(3);
    });
  });
});
