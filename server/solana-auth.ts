import nacl from "tweetnacl";
import bs58 from "bs58";

export interface SolanaAuthMessage {
  publicKey: string;
  signature: string;
  message: string;
}

export function verifySolanaSignature(
  publicKey: string,
  signature: string,
  message: string
): boolean {
  try {
    const publicKeyBytes = bs58.decode(publicKey);
    const signatureBytes = bs58.decode(signature);
    const messageBytes = new TextEncoder().encode(message);
    
    return nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );
  } catch (error) {
    console.error("Error verifying Solana signature:", error);
    return false;
  }
}

export function generateAuthMessage(publicKey: string): string {
  const timestamp = Date.now();
  return `Sign this message to authenticate with your Solana wallet.\n\nWallet: ${publicKey}\nTimestamp: ${timestamp}`;
}
