import { describe, it, expect, beforeAll } from "vitest";
import bs58 from "bs58";

describe("Wallet Operations Tests", () => {
  const API_BASE = "http://localhost:5000";
  let userId: string;

  beforeAll(async () => {
    const userResponse = await fetch(`${API_BASE}/api/auth/guest`, {
      method: "POST",
    });
    const userData = await userResponse.json();
    userId = userData.userId;
  });

  describe("WALLET-001: Solana Deposit Address Generation", () => {
    it("should generate unique deposit address for user", async () => {
      const response = await fetch(`${API_BASE}/api/users/${userId}`);
      expect(response.ok).toBe(true);

      const userData = await response.json();
      expect(userData).toHaveProperty("solanaDepositAddress");
      expect(userData.solanaDepositAddress).toBeTruthy();

      // Verify it's a valid Solana address format
      try {
        const decoded = bs58.decode(userData.solanaDepositAddress);
        expect(decoded.length).toBe(32);
      } catch (error) {
        throw new Error("Invalid Solana address format");
      }
    });

    it("should return same deposit address on multiple requests", async () => {
      const response1 = await fetch(`${API_BASE}/api/users/${userId}`);
      const data1 = await response1.json();

      const response2 = await fetch(`${API_BASE}/api/users/${userId}`);
      const data2 = await response2.json();

      expect(data1.solanaDepositAddress).toBe(data2.solanaDepositAddress);
    });
  });

  describe("WALLET-002: Deposit History", () => {
    it("should retrieve user deposit history", async () => {
      const response = await fetch(`${API_BASE}/api/users/${userId}/deposits`);
      expect(response.ok).toBe(true);

      const deposits = await response.json();
      expect(Array.isArray(deposits)).toBe(true);
    });

    it("should show deposit status correctly", async () => {
      const response = await fetch(`${API_BASE}/api/users/${userId}/deposits`);
      const deposits = await response.json();

      deposits.forEach((deposit: any) => {
        expect(deposit).toHaveProperty("status");
        expect(["pending", "confirmed", "failed"]).toContain(deposit.status);
        expect(deposit).toHaveProperty("amount");
        expect(deposit).toHaveProperty("createdAt");
      });
    });
  });

  describe("WALLET-003: Withdrawal Requests", () => {
    it("should reject withdrawal with insufficient balance", async () => {
      // Get user's current Solana balance
      const userResponse = await fetch(`${API_BASE}/api/users/${userId}`);
      const userData = await userResponse.json();
      const solanaBalance = userData.solanaBalance || 0;

      const response = await fetch(`${API_BASE}/api/withdrawals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          address: bs58.encode(new Uint8Array(32).fill(1)),
          amount: solanaBalance + 1, // More than available
        }),
      });

      expect(response.ok).toBe(false);
      if (!response.ok) {
        const errorData = await response.json();
        expect(errorData.message).toMatch(/insufficient/i);
      }
    });

    it("should reject invalid withdrawal address", async () => {
      const response = await fetch(`${API_BASE}/api/withdrawals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          address: "invalid-address-123",
          amount: 0.1,
        }),
      });

      expect(response.ok).toBe(false);
      if (!response.ok) {
        const errorData = await response.json();
        expect(errorData.message).toMatch(/invalid.*address/i);
      }
    });

    it("should reject withdrawal with negative amount", async () => {
      const response = await fetch(`${API_BASE}/api/withdrawals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          address: bs58.encode(new Uint8Array(32).fill(1)),
          amount: -1,
        }),
      });

      expect(response.ok).toBe(false);
    });
  });

  describe("WALLET-004: Withdrawal History", () => {
    it("should retrieve user withdrawal history", async () => {
      const response = await fetch(`${API_BASE}/api/users/${userId}/withdrawals`);
      expect(response.ok).toBe(true);

      const withdrawals = await response.json();
      expect(Array.isArray(withdrawals)).toBe(true);
    });

    it("should show withdrawal status correctly", async () => {
      const response = await fetch(`${API_BASE}/api/users/${userId}/withdrawals`);
      const withdrawals = await response.json();

      withdrawals.forEach((withdrawal: any) => {
        expect(withdrawal).toHaveProperty("status");
        expect(["pending", "confirmed", "failed"]).toContain(withdrawal.status);
        expect(withdrawal).toHaveProperty("amount");
        expect(withdrawal).toHaveProperty("toAddress");
        expect(withdrawal).toHaveProperty("createdAt");
      });
    });
  });

  describe("Balance Management", () => {
    it("should maintain separate PTS and SOL balances", async () => {
      const response = await fetch(`${API_BASE}/api/users/${userId}`);
      const userData = await response.json();

      expect(userData).toHaveProperty("balance"); // PTS balance
      expect(userData).toHaveProperty("solanaBalance"); // SOL balance
      expect(typeof userData.balance).toBe("number");
      expect(typeof userData.solanaBalance).toBe("number");
    });

    it("should not allow negative balances", async () => {
      const response = await fetch(`${API_BASE}/api/users/${userId}`);
      const userData = await response.json();

      expect(userData.balance).toBeGreaterThanOrEqual(0);
      expect(userData.solanaBalance).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Address Validation", () => {
    it("should validate Solana address format", () => {
      const validAddresses = [
        "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK",
        "7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV",
      ];

      validAddresses.forEach((addr) => {
        try {
          const decoded = bs58.decode(addr);
          expect(decoded.length).toBe(32);
        } catch (error) {
          throw new Error(`Valid address ${addr} failed validation`);
        }
      });
    });

    it("should reject invalid Solana addresses", () => {
      const invalidAddresses = [
        "invalid",
        "123",
        "0x1234567890abcdef",
        "",
      ];

      invalidAddresses.forEach((addr) => {
        if (addr) {
          expect(() => bs58.decode(addr)).toThrow();
        }
      });
    });
  });

  describe("Transaction History", () => {
    it("should return chronological transaction history", async () => {
      const depositsResponse = await fetch(
        `${API_BASE}/api/users/${userId}/deposits`
      );
      const deposits = await depositsResponse.json();

      if (deposits.length > 1) {
        // Check they're ordered by date
        for (let i = 1; i < deposits.length; i++) {
          const prev = new Date(deposits[i - 1].createdAt);
          const curr = new Date(deposits[i].createdAt);
          expect(prev.getTime()).toBeGreaterThanOrEqual(curr.getTime());
        }
      }
    });
  });
});
