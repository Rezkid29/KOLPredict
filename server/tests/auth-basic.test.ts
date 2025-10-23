import { describe, it, expect, beforeAll } from "vitest";

describe("Username and Guest Authentication", () => {
  const API_BASE = "http://localhost:5000";
  const testUsername = `testuser_${Date.now()}`;

  describe("AUTH-USER-001: Register New User", () => {
    it("should register a new user with valid username", async () => {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: testUsername }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty("userId");
      expect(data).toHaveProperty("username", testUsername);
      expect(data).toHaveProperty("balance");
      expect(data.balance).toBe(1000); // Starting balance
    });

    it("should reject username shorter than 3 characters", async () => {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "ab" }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.message).toMatch(/at least 3 characters/i);
    });

    it("should reject duplicate username", async () => {
      // Try to register the same username again
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: testUsername }),
      });

      expect(response.status).toBe(409);
      const data = await response.json();
      expect(data.message).toMatch(/already exists/i);
    });

    it("should reject empty username", async () => {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "" }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe("AUTH-USER-002: Login", () => {
    it("should login with existing username", async () => {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: testUsername }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty("userId");
      expect(data.username).toBe(testUsername);
    });

    it("should reject non-existent username", async () => {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "nonexistentuser999" }),
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.message).toMatch(/not found/i);
    });
  });

  describe("AUTH-GUEST-001: Guest Authentication", () => {
    it("should create guest account with unique username", async () => {
      const response = await fetch(`${API_BASE}/api/auth/guest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty("userId");
      expect(data).toHaveProperty("username");
      expect(data.username).toMatch(/^Guest_\d+$/);
      expect(data.balance).toBe(1000);
      expect(data.isGuest).toBe(true);
    });

    it("should create unique guest usernames for multiple requests", async () => {
      const responses = await Promise.all([
        fetch(`${API_BASE}/api/auth/guest`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }),
        fetch(`${API_BASE}/api/auth/guest`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }),
      ]);

      const data = await Promise.all(responses.map((r) => r.json()));
      expect(data[0].username).not.toBe(data[1].username);
    });
  });
});
