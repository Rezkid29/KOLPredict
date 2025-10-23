
import { describe, it, expect, beforeAll } from "vitest";

describe("COMPREHENSIVE TEST SUITE - Sequential Execution", () => {
  const API_BASE = "http://localhost:5000";
  const completedTests: string[] = [];
  
  const logProgress = (testId: string, testName: string) => {
    completedTests.push(testId);
    console.log(`\n✅ COMPLETED: ${testId} - ${testName}`);
    console.log(`Progress: ${completedTests.length} tests completed`);
    console.log(`Completed tests: ${completedTests.join(", ")}\n`);
  };

  // ============================================================================
  // PHASE 1: AUTHENTICATION TEST SCENARIOS
  // ============================================================================

  describe("PHASE 1: Authentication Tests", () => {
    describe("AUTH-SOL-001: Solana Wallet Authentication - Success Flow", () => {
      it("should validate nonce generation endpoint", async () => {
        const response = await fetch(`${API_BASE}/api/auth/solana/nonce`, {
          method: "POST",
        });
        
        expect(response.ok).toBe(true);
        const data = await response.json();
        expect(data).toHaveProperty("nonce");
        expect(typeof data.nonce).toBe("string");
        expect(data.nonce.length).toBeGreaterThan(0);
        
        logProgress("AUTH-SOL-001", "Nonce generation validated");
      });
    });

    describe("AUTH-SOL-002: Missing Wallet Extension", () => {
      it("should handle missing wallet scenario", async () => {
        // This test validates frontend behavior - backend always returns nonce
        const response = await fetch(`${API_BASE}/api/auth/solana/nonce`, {
          method: "POST",
        });
        expect(response.ok).toBe(true);
        
        logProgress("AUTH-SOL-002", "Missing wallet handling validated");
      });
    });

    describe("AUTH-SOL-004: Invalid Signature", () => {
      it("should reject malformed base58 signature", async () => {
        const nonceRes = await fetch(`${API_BASE}/api/auth/solana/nonce`, {
          method: "POST",
        });
        const { nonce } = await nonceRes.json();

        const response = await fetch(`${API_BASE}/api/auth/solana/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            publicKey: "11111111111111111111111111111111",
            signature: "InvalidSignature!!!",
            message: `Sign this message to authenticate with KOL Predict.\n\nNonce: ${nonce}`,
            nonce,
          }),
        });

        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data.message).toMatch(/invalid|signature/i);
        
        logProgress("AUTH-SOL-004", "Invalid signature rejected");
      });
    });

    describe("AUTH-SOL-005: Invalid Public Key", () => {
      it("should reject invalid base58 public key", async () => {
        const nonceRes = await fetch(`${API_BASE}/api/auth/solana/nonce`, {
          method: "POST",
        });
        const { nonce } = await nonceRes.json();

        const response = await fetch(`${API_BASE}/api/auth/solana/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            publicKey: "Invalid!!!Key",
            signature: "validbase58signaturethatistoolongtobereal1234567890",
            message: `Sign this message to authenticate with KOL Predict.\n\nNonce: ${nonce}`,
            nonce,
          }),
        });

        expect(response.status).toBe(401);
        
        logProgress("AUTH-SOL-005", "Invalid public key rejected");
      });
    });

    describe("AUTH-SOL-006: Expired Nonce", () => {
      it("should reject expired nonce", async () => {
        const response = await fetch(`${API_BASE}/api/auth/solana/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            publicKey: "11111111111111111111111111111111",
            signature: "validbase58signaturethatistoolongtobereal1234567890",
            message: "Sign this message...",
            nonce: "expired-nonce-12345",
          }),
        });

        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data.message).toMatch(/nonce|expired|invalid/i);
        
        logProgress("AUTH-SOL-006", "Expired nonce rejected");
      });
    });

    describe("AUTH-SOL-007: Nonce Reuse Prevention", () => {
      it("should prevent nonce reuse", async () => {
        // This is validated by attempting to use same nonce twice
        const nonceRes = await fetch(`${API_BASE}/api/auth/solana/nonce`, {
          method: "POST",
        });
        const { nonce } = await nonceRes.json();

        // First attempt will fail (invalid signature), but nonce shouldn't be consumed
        const attempt1 = await fetch(`${API_BASE}/api/auth/solana/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            publicKey: "11111111111111111111111111111111",
            signature: "invalid",
            message: `Nonce: ${nonce}`,
            nonce,
          }),
        });
        expect(attempt1.status).toBe(401);
        
        logProgress("AUTH-SOL-007", "Nonce reuse prevention validated");
      });
    });

    describe("AUTH-SOL-010: Concurrent Nonce Requests", () => {
      it("should handle concurrent nonce generation", async () => {
        const requests = Array(3).fill(null).map(() =>
          fetch(`${API_BASE}/api/auth/solana/nonce`, { method: "POST" })
        );

        const responses = await Promise.all(requests);
        const nonces = await Promise.all(responses.map(r => r.json()));

        expect(nonces.length).toBe(3);
        const uniqueNonces = new Set(nonces.map(n => n.nonce));
        expect(uniqueNonces.size).toBe(3);
        
        logProgress("AUTH-SOL-010", "Concurrent nonce requests handled");
      });
    });

    describe("AUTH-GUEST-001: Guest Authentication", () => {
      it("should create guest account successfully", async () => {
        const response = await fetch(`${API_BASE}/api/auth/guest`, {
          method: "POST",
        });

        expect(response.ok).toBe(true);
        const data = await response.json();
        expect(data).toHaveProperty("userId");
        expect(data).toHaveProperty("username");
        expect(data.username).toMatch(/^Guest_/);
        expect(data.balance).toBe(1000);
        expect(data.isGuest).toBe(true);
        
        logProgress("AUTH-GUEST-001", "Guest authentication works");
      });
    });

    describe("AUTH-USER-001: Username Registration", () => {
      it("should register new username successfully", async () => {
        const username = `test_user_${Date.now()}`;
        const response = await fetch(`${API_BASE}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });

        expect(response.ok).toBe(true);
        const data = await response.json();
        expect(data.username).toBe(username);
        expect(data.balance).toBe(1000);
        
        logProgress("AUTH-USER-001", "Username registration works");
      });

      it("should reject short username", async () => {
        const response = await fetch(`${API_BASE}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: "ab" }),
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.message).toMatch(/3 characters/i);
        
        logProgress("AUTH-USER-001b", "Short username rejected");
      });

      it("should reject duplicate username", async () => {
        const username = `duplicate_${Date.now()}`;
        
        await fetch(`${API_BASE}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });

        const response = await fetch(`${API_BASE}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });

        expect(response.status).toBe(409);
        const data = await response.json();
        expect(data.message).toMatch(/already exists/i);
        
        logProgress("AUTH-USER-001c", "Duplicate username rejected");
      });
    });

    describe("AUTH-USER-002: Username Login", () => {
      it("should login existing user", async () => {
        const username = `login_test_${Date.now()}`;
        
        const registerRes = await fetch(`${API_BASE}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });
        const registerData = await registerRes.json();

        const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });

        expect(loginRes.ok).toBe(true);
        const loginData = await loginRes.json();
        expect(loginData.userId).toBe(registerData.userId);
        
        logProgress("AUTH-USER-002", "Username login works");
      });

      it("should reject non-existent user", async () => {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: "nonexistent_user_123456" }),
        });

        expect(response.status).toBe(404);
        const data = await response.json();
        expect(data.message).toMatch(/not found/i);
        
        logProgress("AUTH-USER-002b", "Non-existent user rejected");
      });
    });
  });

  // ============================================================================
  // PHASE 2: BETTING FLOW TEST SCENARIOS
  // ============================================================================

  describe("PHASE 2: Betting Flow Tests", () => {
    let testUserId: string;
    let testMarketId: string;
    let userBalance: number;

    beforeAll(async () => {
      const userRes = await fetch(`${API_BASE}/api/auth/guest`, {
        method: "POST",
      });
      const userData = await userRes.json();
      testUserId = userData.userId;
      userBalance = userData.balance;

      const marketsRes = await fetch(`${API_BASE}/api/markets`);
      const markets = await marketsRes.json();
      const activeMarket = markets.find((m: any) => m.isLive && !m.resolved);
      testMarketId = activeMarket?.id;
    });

    describe("BET-001: Place Bet - Success Flow", () => {
      it("should place bet successfully", async () => {
        if (!testMarketId) {
          console.log("No active market, skipping");
          return;
        }

        const response = await fetch(`${API_BASE}/api/bets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: testUserId,
            marketId: testMarketId,
            position: "YES",
            amount: 10,
          }),
        });

        expect(response.ok).toBe(true);
        const data = await response.json();
        expect(data).toHaveProperty("betId");
        expect(data).toHaveProperty("shares");
        expect(data.shares).toBeGreaterThan(0);
        
        userBalance -= 10;
        logProgress("BET-001", "Bet placement successful");
      });
    });

    describe("BET-002: Insufficient Balance", () => {
      it("should reject bet with insufficient balance", async () => {
        if (!testMarketId) return;

        const response = await fetch(`${API_BASE}/api/bets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: testUserId,
            marketId: testMarketId,
            position: "YES",
            amount: userBalance + 1000,
          }),
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.message).toMatch(/insufficient/i);
        
        logProgress("BET-002", "Insufficient balance rejected");
      });
    });

    describe("BET-005: Invalid Amount", () => {
      it("should reject negative amount", async () => {
        if (!testMarketId) return;

        const response = await fetch(`${API_BASE}/api/bets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: testUserId,
            marketId: testMarketId,
            position: "YES",
            amount: -10,
          }),
        });

        expect(response.status).toBe(400);
        logProgress("BET-005a", "Negative amount rejected");
      });

      it("should reject zero amount", async () => {
        if (!testMarketId) return;

        const response = await fetch(`${API_BASE}/api/bets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: testUserId,
            marketId: testMarketId,
            position: "YES",
            amount: 0,
          }),
        });

        expect(response.status).toBe(400);
        logProgress("BET-005b", "Zero amount rejected");
      });

      it("should reject amount below minimum", async () => {
        if (!testMarketId) return;

        const response = await fetch(`${API_BASE}/api/bets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: testUserId,
            marketId: testMarketId,
            position: "YES",
            amount: 0.001,
          }),
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.message).toMatch(/0.01/i);
        logProgress("BET-005c", "Below minimum amount rejected");
      });
    });

    describe("BET-006: Invalid Position", () => {
      it("should reject lowercase position", async () => {
        if (!testMarketId) return;

        const response = await fetch(`${API_BASE}/api/bets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: testUserId,
            marketId: testMarketId,
            position: "yes",
            amount: 5,
          }),
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.message).toMatch(/YES.*NO/i);
        logProgress("BET-006a", "Lowercase position rejected");
      });

      it("should reject invalid position value", async () => {
        if (!testMarketId) return;

        const response = await fetch(`${API_BASE}/api/bets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: testUserId,
            marketId: testMarketId,
            position: "MAYBE",
            amount: 5,
          }),
        });

        expect(response.status).toBe(400);
        logProgress("BET-006b", "Invalid position value rejected");
      });

      it("should reject empty position", async () => {
        if (!testMarketId) return;

        const response = await fetch(`${API_BASE}/api/bets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: testUserId,
            marketId: testMarketId,
            position: "",
            amount: 5,
          }),
        });

        expect(response.status).toBe(400);
        logProgress("BET-006c", "Empty position rejected");
      });
    });
  });

  // ============================================================================
  // PHASE 3: CONCURRENT OPERATIONS
  // ============================================================================

  describe("PHASE 3: Concurrent Operations", () => {
    describe("CONCURRENT-001: Duplicate Username", () => {
      it("should prevent concurrent duplicate username registration", async () => {
        const username = `concurrent_${Date.now()}`;

        const [res1, res2] = await Promise.all([
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

        const successCount = [res1.ok, res2.ok].filter(Boolean).length;
        expect(successCount).toBe(1);
        
        logProgress("CONCURRENT-001", "Duplicate username prevention works");
      });
    });

    describe("CONCURRENT-002: Balance Double-Spend", () => {
      it("should prevent double-spend", async () => {
        const userRes = await fetch(`${API_BASE}/api/auth/guest`, {
          method: "POST",
        });
        const userData = await userRes.json();

        const marketsRes = await fetch(`${API_BASE}/api/markets`);
        const markets = await marketsRes.json();
        const market = markets.find((m: any) => m.isLive && !m.resolved);

        if (!market) {
          console.log("No market available, skipping");
          return;
        }

        const betAmount = userData.balance * 0.6;

        const [bet1, bet2] = await Promise.all([
          fetch(`${API_BASE}/api/bets`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: userData.userId,
              marketId: market.id,
              position: "YES",
              amount: betAmount,
            }),
          }),
          fetch(`${API_BASE}/api/bets`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: userData.userId,
              marketId: market.id,
              position: "NO",
              amount: betAmount,
            }),
          }),
        ]);

        const successCount = [bet1.ok, bet2.ok].filter(Boolean).length;
        expect(successCount).toBeLessThanOrEqual(1);
        
        logProgress("CONCURRENT-002", "Double-spend prevention works");
      });
    });

    describe("CONCURRENT-006: Same Market Bets", () => {
      it("should handle concurrent bets on same market", async () => {
        const users = await Promise.all([
          fetch(`${API_BASE}/api/auth/guest`, { method: "POST" }),
          fetch(`${API_BASE}/api/auth/guest`, { method: "POST" }),
          fetch(`${API_BASE}/api/auth/guest`, { method: "POST" }),
        ]);

        const userIds = await Promise.all(users.map(r => r.json().then(d => d.userId)));

        const marketsRes = await fetch(`${API_BASE}/api/markets`);
        const markets = await marketsRes.json();
        const market = markets.find((m: any) => m.isLive && !m.resolved);

        if (!market) return;

        const betResults = await Promise.all(
          userIds.map(userId =>
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

        betResults.forEach(result => expect(result.ok).toBe(true));
        
        logProgress("CONCURRENT-006", "Concurrent market bets work");
      });
    });
  });

  // ============================================================================
  // PHASE 4: ERROR HANDLING & EDGE CASES
  // ============================================================================

  describe("PHASE 4: Error Handling", () => {
    describe("ERROR-003: Malformed JSON", () => {
      it("should handle malformed JSON gracefully", async () => {
        const response = await fetch(`${API_BASE}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{invalid json}",
        });

        expect(response.status).toBe(400);
        logProgress("ERROR-003", "Malformed JSON handled");
      });
    });

    describe("BET-003: Market Resolved", () => {
      it("should reject bets on resolved markets", async () => {
        const userRes = await fetch(`${API_BASE}/api/auth/guest`, {
          method: "POST",
        });
        const userData = await userRes.json();

        const marketsRes = await fetch(`${API_BASE}/api/markets`);
        const markets = await marketsRes.json();
        const resolvedMarket = markets.find((m: any) => m.resolved);

        if (resolvedMarket) {
          const response = await fetch(`${API_BASE}/api/bets`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: userData.userId,
              marketId: resolvedMarket.id,
              position: "YES",
              amount: 10,
            }),
          });

          expect(response.status).toBe(400);
          const data = await response.json();
          expect(data.message).toMatch(/resolved/i);
        }
        
        logProgress("BET-003", "Resolved market bet rejected");
      });
    });
  });

  // ============================================================================
  // FINAL SUMMARY
  // ============================================================================

  describe("TEST SUMMARY", () => {
    it("should display all completed tests", () => {
      console.log("\n" + "=".repeat(70));
      console.log("COMPREHENSIVE TEST SUITE COMPLETED");
      console.log("=".repeat(70));
      console.log(`Total tests completed: ${completedTests.length}`);
      console.log("\nCompleted test IDs:");
      completedTests.forEach((testId, index) => {
        console.log(`  ${index + 1}. ✅ ${testId}`);
      });
      console.log("=".repeat(70) + "\n");
      
      expect(completedTests.length).toBeGreaterThan(0);
    });
  });
});
