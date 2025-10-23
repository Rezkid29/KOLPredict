import nacl from "tweetnacl";
import bs58 from "bs58";

export interface SolanaAuthMessage {
  publicKey: string;
  signature: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  errorCode?: string;
}

const SOLANA_PUBLIC_KEY_LENGTH = 32;
const SOLANA_SIGNATURE_LENGTH = 64;

export function validateSolanaPublicKey(publicKey: string): ValidationResult {
  if (!publicKey || typeof publicKey !== 'string') {
    return {
      valid: false,
      error: "Public key is required and must be a string",
      errorCode: "INVALID_PUBLIC_KEY_TYPE"
    };
  }

  if (publicKey.trim() !== publicKey) {
    return {
      valid: false,
      error: "Public key cannot have leading or trailing whitespace",
      errorCode: "INVALID_PUBLIC_KEY_FORMAT"
    };
  }

  let decoded: Uint8Array;
  try {
    decoded = bs58.decode(publicKey);
  } catch (error) {
    return {
      valid: false,
      error: "Public key is not valid base58 format",
      errorCode: "INVALID_BASE58_PUBLIC_KEY"
    };
  }

  if (decoded.length !== SOLANA_PUBLIC_KEY_LENGTH) {
    return {
      valid: false,
      error: `Public key must be ${SOLANA_PUBLIC_KEY_LENGTH} bytes, got ${decoded.length}`,
      errorCode: "INVALID_PUBLIC_KEY_LENGTH"
    };
  }

  return { valid: true };
}

export function validateSolanaSignature(signature: string): ValidationResult {
  if (!signature || typeof signature !== 'string') {
    return {
      valid: false,
      error: "Signature is required and must be a string",
      errorCode: "INVALID_SIGNATURE_TYPE"
    };
  }

  if (signature.trim() !== signature) {
    return {
      valid: false,
      error: "Signature cannot have leading or trailing whitespace",
      errorCode: "INVALID_SIGNATURE_FORMAT"
    };
  }

  let decoded: Uint8Array;
  try {
    decoded = bs58.decode(signature);
  } catch (error) {
    return {
      valid: false,
      error: "Signature is not valid base58 format",
      errorCode: "INVALID_BASE58_SIGNATURE"
    };
  }

  if (decoded.length !== SOLANA_SIGNATURE_LENGTH) {
    return {
      valid: false,
      error: `Signature must be ${SOLANA_SIGNATURE_LENGTH} bytes, got ${decoded.length}`,
      errorCode: "INVALID_SIGNATURE_LENGTH"
    };
  }

  return { valid: true };
}

export function validateAuthMessage(
  message: string,
  publicKey: string,
  nonce: string
): ValidationResult {
  if (!message || typeof message !== 'string') {
    return {
      valid: false,
      error: "Message is required and must be a string",
      errorCode: "INVALID_MESSAGE_TYPE"
    };
  }

  if (message.length > 1000) {
    return {
      valid: false,
      error: "Message is too long (max 1000 characters)",
      errorCode: "MESSAGE_TOO_LONG"
    };
  }

  if (!message.includes(publicKey)) {
    return {
      valid: false,
      error: "Message must contain the public key",
      errorCode: "PUBLIC_KEY_MISMATCH"
    };
  }

  if (!message.includes(nonce)) {
    return {
      valid: false,
      error: "Message must contain the nonce",
      errorCode: "NONCE_MISMATCH"
    };
  }

  return { valid: true };
}

export interface SignatureVerificationResult {
  valid: boolean;
  error?: string;
  errorCode?: string;
}

export function verifySolanaSignature(
  publicKey: string,
  signature: string,
  message: string
): SignatureVerificationResult {
  const publicKeyValidation = validateSolanaPublicKey(publicKey);
  if (!publicKeyValidation.valid) {
    return {
      valid: false,
      error: publicKeyValidation.error,
      errorCode: publicKeyValidation.errorCode
    };
  }

  const signatureValidation = validateSolanaSignature(signature);
  if (!signatureValidation.valid) {
    return {
      valid: false,
      error: signatureValidation.error,
      errorCode: signatureValidation.errorCode
    };
  }

  try {
    const publicKeyBytes = bs58.decode(publicKey);
    const signatureBytes = bs58.decode(signature);
    const messageBytes = new TextEncoder().encode(message);
    
    const isValid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );

    if (!isValid) {
      return {
        valid: false,
        error: "Signature verification failed - signature does not match public key and message",
        errorCode: "SIGNATURE_VERIFICATION_FAILED"
      };
    }

    return { valid: true };
  } catch (error) {
    console.error("Error verifying Solana signature:", error);
    return {
      valid: false,
      error: `Cryptographic verification error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      errorCode: "CRYPTO_ERROR"
    };
  }
}

export function generateAuthMessage(publicKey: string, nonce: string): string {
  return `Sign this message to authenticate with KOL Predict.\n\nWallet: ${publicKey}\nNonce: ${nonce}`;
}
