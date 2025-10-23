import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import bs58 from "bs58";
import nacl from "tweetnacl";

describe("Solana Wallet Authentication", () => {
  const API_BASE = "http://localhost:5000";
  let nonce: string;

  beforeEach(async () => {
    // Request a fresh nonce for each test
    const response = await fetch(`${API_BASE}/api/auth/solana/nonce`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    nonce = data.nonce;
  });

  describe("AUTH-SOL-001: Successful Solana Wallet Authentication", () => {
    it("should successfully authenticate with valid wallet signature", async () => {
      // Generate a test keypair
      const keypair = nacl.sign.keyPair();
      const publicKey = bs58.encode(keypair.publicKey);

      // Create and sign the message
      const message = `Sign this message to authenticate with KOL Predict.\n\nWallet: ${publicKey}\nNonce: ${nonce}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signatureBytes = nacl.sign.detached(encodedMessage, keypair.secretKey);
      const signature = bs58.encode(signatureBytes);

      // Verify the signature
      const response = await fetch(`${API_BASE}/api/auth/solana/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey,
          signature,
          message,
          nonce,
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty("userId");
      expect(data).toHaveProperty("username");
      expect(data.username).toMatch(/^sol_[a-z0-9]{8}$/);
    });

    it("should return existing user on second authentication", async () => {
      const keypair = nacl.sign.keyPair();
      const publicKey = bs58.encode(keypair.publicKey);
      const message = `Sign this message to authenticate with KOL Predict.\n\nWallet: ${publicKey}\nNonce: ${nonce}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signatureBytes = nacl.sign.detached(encodedMessage, keypair.secretKey);
      const signature = bs58.encode(signatureBytes);

      // First authentication
      const firstResponse = await fetch(`${API_BASE}/api/auth/solana/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicKey, signature, message, nonce }),
      });

      const firstData = await firstResponse.json();
      const firstUserId = firstData.userId;

      // Get new nonce for second auth
      const nonceResponse = await fetch(`${API_BASE}/api/auth/solana/nonce`, {
        method: "POST",
      });
      const nonceData = await nonceResponse.json();
      const newNonce = nonceData.nonce;

      // Second authentication with same wallet
      const message2 = `Sign this message to authenticate with KOL Predict.\n\nWallet: ${publicKey}\nNonce: ${newNonce}`;
      const encodedMessage2 = new TextEncoder().encode(message2);
      const signatureBytes2 = nacl.sign.detached(encodedMessage2, keypair.secretKey);
      const signature2 = bs58.encode(signatureBytes2);

      const secondResponse = await fetch(`${API_BASE}/api/auth/solana/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey,
          signature: signature2,
          message: message2,
          nonce: newNonce,
        }),
      });

      const secondData = await secondResponse.json();
      expect(secondData.userId).toBe(firstUserId);
    });
  });

  describe("AUTH-SOL-004: Invalid Signature", () => {
    it("should reject malformed base58 signature", async () => {
      const keypair = nacl.sign.keyPair();
      const publicKey = bs58.encode(keypair.publicKey);
      const message = `Sign this message to authenticate with KOL Predict.\n\nWallet: ${publicKey}\nNonce: ${nonce}`;

      const response = await fetch(`${API_BASE}/api/auth/solana/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey,
          signature: "InvalidSignature!!!",
          message,
          nonce,
        }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.errorCode).toBe("INVALID_BASE58_SIGNATURE");
    });

    it("should reject signature with wrong length", async () => {
      const keypair = nacl.sign.keyPair();
      const publicKey = bs58.encode(keypair.publicKey);
      const message = `Sign this message to authenticate with KOL Predict.\n\nWallet: ${publicKey}\nNonce: ${nonce}`;

      // Create a signature that's too short
      const shortSignature = bs58.encode(new Uint8Array(32)); // 32 bytes instead of 64

      const response = await fetch(`${API_BASE}/api/auth/solana/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey,
          signature: shortSignature,
          message,
          nonce,
        }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.errorCode).toBe("INVALID_SIGNATURE_LENGTH");
    });

    it("should reject valid format but wrong signature", async () => {
      const keypair = nacl.sign.keyPair();
      const wrongKeypair = nacl.sign.keyPair();
      const publicKey = bs58.encode(keypair.publicKey);
      const message = `Sign this message to authenticate with KOL Predict.\n\nWallet: ${publicKey}\nNonce: ${nonce}`;

      // Sign with wrong key
      const encodedMessage = new TextEncoder().encode(message);
      const wrongSignature = nacl.sign.detached(encodedMessage, wrongKeypair.secretKey);
      const signature = bs58.encode(wrongSignature);

      const response = await fetch(`${API_BASE}/api/auth/solana/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey,
          signature,
          message,
          nonce,
        }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.errorCode).toBe("SIGNATURE_VERIFICATION_FAILED");
    });
  });

  describe("AUTH-SOL-005: Invalid Public Key", () => {
    it("should reject invalid base58 public key", async () => {
      const response = await fetch(`${API_BASE}/api/auth/solana/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey: "InvalidKey!!!",
          signature: "SomeSignature",
          message: "Some message",
          nonce,
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.errorCode).toBe("INVALID_BASE58_PUBLIC_KEY");
    });

    it("should reject public key with whitespace", async () => {
      const keypair = nacl.sign.keyPair();
      const publicKey = "  " + bs58.encode(keypair.publicKey) + "  ";

      const response = await fetch(`${API_BASE}/api/auth/solana/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey,
          signature: "SomeSignature",
          message: "Some message",
          nonce,
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.errorCode).toBe("INVALID_PUBLIC_KEY_FORMAT");
    });
  });

  describe("AUTH-SOL-006: Expired Nonce", () => {
    it("should reject expired nonce", async () => {
      const keypair = nacl.sign.keyPair();
      const publicKey = bs58.encode(keypair.publicKey);
      
      // Use an old/fake nonce that doesn't exist
      const expiredNonce = "expired-nonce-123";
      const message = `Sign this message to authenticate with KOL Predict.\n\nWallet: ${publicKey}\nNonce: ${expiredNonce}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signatureBytes = nacl.sign.detached(encodedMessage, keypair.secretKey);
      const signature = bs58.encode(signatureBytes);

      const response = await fetch(`${API_BASE}/api/auth/solana/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey,
          signature,
          message,
          nonce: expiredNonce,
        }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.errorCode).toMatch(/NONCE_EXPIRED|INVALID_NONCE/);
    });
  });

  describe("AUTH-SOL-007: Nonce Reuse Prevention", () => {
    it("should reject reused nonce", async () => {
      const keypair = nacl.sign.keyPair();
      const publicKey = bs58.encode(keypair.publicKey);
      const message = `Sign this message to authenticate with KOL Predict.\n\nWallet: ${publicKey}\nNonce: ${nonce}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signatureBytes = nacl.sign.detached(encodedMessage, keypair.secretKey);
      const signature = bs58.encode(signatureBytes);

      // First use of nonce - should succeed
      const firstResponse = await fetch(`${API_BASE}/api/auth/solana/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicKey, signature, message, nonce }),
      });

      expect(firstResponse.status).toBe(200);

      // Second use of same nonce - should fail
      const secondResponse = await fetch(`${API_BASE}/api/auth/solana/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicKey, signature, message, nonce }),
      });

      expect(secondResponse.status).toBe(401);
      const data = await secondResponse.json();
      expect(data.errorCode).toBe("INVALID_NONCE");
    });
  });

  describe("AUTH-SOL-009: Rate Limiting", () => {
    it("should enforce rate limiting on nonce requests", async () => {
      const responses: Response[] = [];

      // Make 6 consecutive requests
      for (let i = 0; i < 6; i++) {
        const response = await fetch(`${API_BASE}/api/auth/solana/nonce`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        responses.push(response);
      }

      // First 5 should succeed
      for (let i = 0; i < 5; i++) {
        expect(responses[i].status).toBe(200);
      }

      // 6th should be rate limited
      expect(responses[5].status).toBe(429);
    });
  });

  describe("AUTH-SOL-010: Concurrent Nonce Requests", () => {
    it("should generate unique nonces for concurrent requests", async () => {
      const requests = Array(3)
        .fill(null)
        .map(() =>
          fetch(`${API_BASE}/api/auth/solana/nonce`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          })
        );

      const responses = await Promise.all(requests);
      const nonces = await Promise.all(responses.map((r) => r.json()));

      // All should be unique
      const nonceValues = nonces.map((n) => n.nonce);
      const uniqueNonces = new Set(nonceValues);
      expect(uniqueNonces.size).toBe(3);
    });
  });
});
