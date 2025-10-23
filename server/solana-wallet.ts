import { Connection, Keypair, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL, sendAndConfirmTransaction } from "@solana/web3.js";
import bs58 from "bs58";

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const HOT_WALLET_PRIVATE_KEY = process.env.SOLANA_HOT_WALLET_PRIVATE_KEY;
const NETWORK = process.env.SOLANA_NETWORK || "devnet";

export class SolanaWalletService {
  private connection: Connection;
  private hotWallet: Keypair | null = null;

  constructor() {
    this.connection = new Connection(SOLANA_RPC_URL, "confirmed");
    this.initializeHotWallet();
  }

  private initializeHotWallet() {
    if (!HOT_WALLET_PRIVATE_KEY) {
      console.warn("⚠️  SOLANA_HOT_WALLET_PRIVATE_KEY not set - generating temporary hot wallet for testing");
      this.hotWallet = Keypair.generate();
      console.log(`🔑 Temporary hot wallet public key: ${this.hotWallet.publicKey.toBase58()}`);
      console.log(`🔑 Temporary hot wallet private key (save this!): ${bs58.encode(this.hotWallet.secretKey)}`);
      return;
    }

    try {
      const secretKey = bs58.decode(HOT_WALLET_PRIVATE_KEY);
      this.hotWallet = Keypair.fromSecretKey(secretKey);
      console.log(`✅ Hot wallet initialized: ${this.hotWallet.publicKey.toBase58()} (${NETWORK})`);
    } catch (error) {
      console.error("❌ Failed to initialize hot wallet:", error);
      throw new Error("Invalid SOLANA_HOT_WALLET_PRIVATE_KEY");
    }
  }

  getHotWalletAddress(): string {
    if (!this.hotWallet) {
      throw new Error("Hot wallet not initialized");
    }
    return this.hotWallet.publicKey.toBase58();
  }

  generateDepositAddress(userId: string, index: number = 0): PublicKey {
    if (!this.hotWallet) {
      throw new Error("Hot wallet not initialized");
    }

    const seeds = [
      Buffer.from("deposit"),
      Buffer.from(userId),
      Buffer.from([index]),
    ];

    const [depositAddress] = PublicKey.findProgramAddressSync(
      seeds,
      SystemProgram.programId
    );

    return depositAddress;
  }

  async getBalance(address: string): Promise<number> {
    try {
      const publicKey = new PublicKey(address);
      const balance = await this.connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error("Error getting balance:", error);
      return 0;
    }
  }

  async transferSOL(toAddress: string, amountSOL: number): Promise<string> {
    if (!this.hotWallet) {
      throw new Error("Hot wallet not initialized");
    }

    try {
      const toPubkey = new PublicKey(toAddress);
      const lamports = Math.floor(amountSOL * LAMPORTS_PER_SOL);

      const hotWalletBalance = await this.connection.getBalance(this.hotWallet.publicKey);
      if (hotWalletBalance < lamports) {
        throw new Error(`Insufficient hot wallet balance. Required: ${amountSOL} SOL, Available: ${hotWalletBalance / LAMPORTS_PER_SOL} SOL`);
      }

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: this.hotWallet.publicKey,
          toPubkey,
          lamports,
        })
      );

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.hotWallet],
        { commitment: "confirmed" }
      );

      console.log(`✅ Transfer successful: ${amountSOL} SOL to ${toAddress}`);
      console.log(`   Signature: ${signature}`);

      return signature;
    } catch (error: any) {
      console.error("❌ Transfer failed:", error);
      throw new Error(`Transfer failed: ${error.message}`);
    }
  }

  async getTransaction(signature: string) {
    try {
      const tx = await this.connection.getParsedTransaction(signature, "confirmed");
      return tx;
    } catch (error) {
      console.error("Error getting transaction:", error);
      return null;
    }
  }

  async getConfirmations(signature: string): Promise<number> {
    try {
      const status = await this.connection.getSignatureStatus(signature);
      return status.value?.confirmations || 0;
    } catch (error) {
      console.error("Error getting confirmations:", error);
      return 0;
    }
  }

  isValidAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  getConnection(): Connection {
    return this.connection;
  }

  convertLamportsToSOL(lamports: number): number {
    return lamports / LAMPORTS_PER_SOL;
  }

  convertSOLToLamports(sol: number): number {
    return Math.floor(sol * LAMPORTS_PER_SOL);
  }
}

export const solanaWallet = new SolanaWalletService();
