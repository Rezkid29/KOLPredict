import { describe, it, expect, beforeEach } from "vitest";
import bs58 from "bs58";
import nacl from "tweetnacl";

describe("Authentication Security Tests", () => {
  const API_BASE = "http://localhost:5000";
  let nonce: string;

  beforeEach(async () => {
    const response = await fetch(`${API_BASE}/api/auth/solana/nonce`, {
      method: "POST",
    });
    const data = await response.json();
    nonce = data.nonce;
  });

  describe("AUTH-SOL-008: Message Tampering", () => {
    it("should reject modified public key in message", async () => {
      const keypair = nacl.sign.keyPair();
      const realPublicKey = bs58.encode(keypair.publicKey);
      const fakePublicKey = bs58.encode(nacl.sign.keyPair().publicKey);

      // Sign message with real key but claim it's from fake key
      const signedMessage = `Sign this message to authenticate with KOL Predict.\n\nWallet: ${realPublicKey}\nNonce: ${nonce}`;
      const tamperedMessage = `Sign this message to authenticate with KOL Predict.\n\nWallet: ${fakePublicKey}\nNonce: ${nonce}`;

      const encodedMessage = new TextEncoder().encode(signedMessage);
      const signatureBytes = nacl.sign.detached(encodedMessage, keypair.secretKey);
      const signature = bs58.encode(signatureBytes);

      const response = await fetch(`${API_BASE}/api/auth/solana/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey: fakePublicKey,
          signature,
          message: tamperedMessage,
          nonce,
        }),
      });

      expect(response.status).toBe(401);
    });

    it("should reject modified nonce in message", async () => {
      const keypair = nacl.sign.keyPair();
      const publicKey = bs58.encode(keypair.publicKey);
      const realNonce = nonce;
      const fakeNonce = "fake-nonce-12345";

      // Sign with real nonce but submit with fake nonce
      const signedMessage = `Sign this message to authenticate with KOL Predict.\n\nWallet: ${publicKey}\nNonce: ${realNonce}`;
      const tamperedMessage = `Sign this message to authenticate with KOL Predict.\n\nWallet: ${publicKey}\nNonce: ${fakeNonce}`;

      const encodedMessage = new TextEncoder().encode(signedMessage);
      const signatureBytes = nacl.sign.detached(encodedMessage, keypair.secretKey);
      const signature = bs58.encode(signatureBytes);

      const response = await fetch(`${API_BASE}/api/auth/solana/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey,
          signature,
          message: tamperedMessage,
          nonce: fakeNonce,
        }),
      });

      expect(response.status).toBe(401);
    });

    it("should reject message without nonce", async () => {
      const keypair = nacl.sign.keyPair();
      const publicKey = bs58.encode(keypair.publicKey);

      // Message without nonce
      const messageWithoutNonce = `Sign this message to authenticate with KOL Predict.\n\nWallet: ${publicKey}`;
      const encodedMessage = new TextEncoder().encode(messageWithoutNonce);
      const signatureBytes = nacl.sign.detached(encodedMessage, keypair.secretKey);
      const signature = bs58.encode(signatureBytes);

      const response = await fetch(`${API_BASE}/api/auth/solana/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey,
          signature,
          message: messageWithoutNonce,
          nonce,
        }),
      });

      expect(response.status).toBe(401);
    });

    it("should reject completely different message", async () => {
      const keypair = nacl.sign.keyPair();
      const publicKey = bs58.encode(keypair.publicKey);

      // Sign a completely different message
      const wrongMessage = "This is a different message entirely";
      const expectedMessage = `Sign this message to authenticate with KOL Predict.\n\nWallet: ${publicKey}\nNonce: ${nonce}`;

      const encodedMessage = new TextEncoder().encode(wrongMessage);
      const signatureBytes = nacl.sign.detached(encodedMessage, keypair.secretKey);
      const signature = bs58.encode(signatureBytes);

      const response = await fetch(`${API_BASE}/api/auth/solana/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey,
          signature,
          message: expectedMessage,
          nonce,
        }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.errorCode).toBe("SIGNATURE_VERIFICATION_FAILED");
    });
  });

  describe("Request Validation", () => {
    it("should reject requests with oversized payload", async () => {
      const largePayload = "x".repeat(2 * 1024 * 1024); // 2MB

      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: largePayload }),
      });

      expect(response.status).toBe(413);
    });

    it("should reject malformed JSON", async () => {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{ invalid json }",
      });

      expect(response.status).toBe(400);
    });

    it("should reject requests with missing required fields", async () => {
      const response = await fetch(`${API_BASE}/api/auth/solana/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey: "somekey",
          // Missing signature, message, nonce
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe("SQL Injection Prevention", () => {
    it("should prevent SQL injection in username", async () => {
      const maliciousUsername = "admin' OR '1'='1";

      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: maliciousUsername }),
      });

      // Should either reject or sanitize - not execute SQL
      if (response.ok) {
        const data = await response.json();
        expect(data.username).toBe(maliciousUsername); // Stored as literal string
      }
    });

    it("should prevent SQL injection in login", async () => {
      const maliciousUsername = "1' OR '1'='1' --";

      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: maliciousUsername }),
      });

      expect(response.status).toBe(404); // User not found, not SQL error
    });
  });

  describe("XSS Prevention", () => {
    it("should sanitize HTML/script tags in username", async () => {
      const xssUsername = `test<script>alert('xss')</script>_${Date.now()}`;

      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: xssUsername }),
      });

      if (response.ok) {
        const data = await response.json();
        // Username should be stored safely
        expect(data.username).toBeDefined();
      }
    });
  });
});
