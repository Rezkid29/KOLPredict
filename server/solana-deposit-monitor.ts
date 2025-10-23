import { PublicKey } from "@solana/web3.js";
import { solanaWallet } from "./solana-wallet";
import type { IStorage } from "./storage";

const REQUIRED_CONFIRMATIONS = 1;
const CHECK_INTERVAL_MS = 15000; // Check every 15 seconds

export class SolanaDepositMonitor {
  private storage: IStorage;
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private processedSignatures: Set<string> = new Set();

  constructor(storage: IStorage) {
    this.storage = storage;
  }

  async start() {
    if (this.isMonitoring) {
      console.log("⚠️  Deposit monitor already running");
      return;
    }

    this.isMonitoring = true;
    console.log("🔍 Starting Solana deposit monitor...");
    
    this.monitoringInterval = setInterval(() => {
      this.checkPendingDeposits();
    }, CHECK_INTERVAL_MS);

    await this.checkPendingDeposits();
  }

  stop() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log("🛑 Solana deposit monitor stopped");
  }

  private async checkPendingDeposits() {
    try {
      const pendingDeposits = await this.storage.getPendingDeposits();
      
      for (const deposit of pendingDeposits) {
        if (this.processedSignatures.has(deposit.signature)) {
          continue;
        }

        await this.verifyAndProcessDeposit(deposit);
      }
    } catch (error) {
      console.error("Error checking pending deposits:", error);
    }
  }

  private async verifyAndProcessDeposit(deposit: any) {
    try {
      const tx = await solanaWallet.getTransaction(deposit.signature);
      
      if (!tx) {
        if (this.isDepositExpired(deposit.createdAt)) {
          await this.storage.updateDepositStatus(deposit.id, "failed", 0);
          console.log(`❌ Deposit ${deposit.id} expired (signature not found)`);
        }
        return;
      }

      if (tx.meta?.err) {
        await this.storage.updateDepositStatus(deposit.id, "failed", 0);
        console.log(`❌ Deposit ${deposit.id} failed on-chain`);
        return;
      }

      const confirmations = await solanaWallet.getConfirmations(deposit.signature);
      
      if (confirmations >= REQUIRED_CONFIRMATIONS) {
        const user = await this.storage.getUser(deposit.userId);
        if (!user) {
          console.error(`User ${deposit.userId} not found for deposit ${deposit.id}`);
          return;
        }

        const newBalance = (parseFloat(user.solanaBalance) + parseFloat(deposit.amount)).toFixed(9);
        
        await this.storage.updateUserSolanaBalance(deposit.userId, newBalance);
        await this.storage.updateDepositStatus(deposit.id, "confirmed", confirmations);
        
        this.processedSignatures.add(deposit.signature);
        
        console.log(`✅ Deposit confirmed: ${deposit.amount} SOL for user ${deposit.userId}`);
        console.log(`   Signature: ${deposit.signature}`);
        console.log(`   New balance: ${newBalance} SOL`);
      } else {
        await this.storage.updateDepositStatus(deposit.id, "pending", confirmations);
        console.log(`⏳ Deposit ${deposit.id} has ${confirmations}/${REQUIRED_CONFIRMATIONS} confirmations`);
      }
    } catch (error) {
      console.error(`Error processing deposit ${deposit.id}:`, error);
    }
  }

  private isDepositExpired(createdAt: Date): boolean {
    const MAX_AGE_HOURS = 24;
    const age = Date.now() - new Date(createdAt).getTime();
    return age > MAX_AGE_HOURS * 60 * 60 * 1000;
  }

  async recordManualDeposit(userId: string, signature: string, depositAddress: string) {
    try {
      const tx = await solanaWallet.getTransaction(signature);
      
      if (!tx || tx.meta?.err) {
        throw new Error("Invalid or failed transaction");
      }

      const postBalances = tx.meta?.postBalances || [];
      const preBalances = tx.meta?.preBalances || [];
      
      if (postBalances.length === 0 || preBalances.length === 0) {
        throw new Error("Unable to determine deposit amount");
      }

      const lamportsReceived = postBalances[1] - preBalances[1];
      
      if (lamportsReceived <= 0) {
        throw new Error("No SOL received in this transaction");
      }

      const amountSOL = solanaWallet.convertLamportsToSOL(lamportsReceived);

      const deposit = await this.storage.createDeposit({
        userId,
        signature,
        amount: amountSOL.toFixed(9),
        depositAddress,
      });

      console.log(`📝 Manual deposit recorded: ${amountSOL} SOL for user ${userId}`);
      
      await this.verifyAndProcessDeposit(deposit);

      return deposit;
    } catch (error: any) {
      console.error("Error recording manual deposit:", error);
      throw new Error(`Failed to record deposit: ${error.message}`);
    }
  }
}

export function createDepositMonitor(storage: IStorage): SolanaDepositMonitor {
  return new SolanaDepositMonitor(storage);
}
