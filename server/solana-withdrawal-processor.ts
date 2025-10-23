import { solanaWallet } from "./solana-wallet";
import type { IStorage } from "./storage";

const DAILY_WITHDRAWAL_LIMIT_SOL = parseFloat(process.env.DAILY_WITHDRAWAL_LIMIT || "100");
const MIN_WITHDRAWAL_AMOUNT = 0.001; // 0.001 SOL minimum
const MAX_WITHDRAWAL_AMOUNT = 10; // 10 SOL maximum per withdrawal
const PROCESS_INTERVAL_MS = 30000; // Process every 30 seconds

export class SolanaWithdrawalProcessor {
  private storage: IStorage;
  private isProcessing: boolean = false;
  private processingInterval: NodeJS.Timeout | null = null;
  private broadcastCallback?: (data: any) => void;

  constructor(storage: IStorage, broadcastCallback?: (data: any) => void) {
    this.storage = storage;
    this.broadcastCallback = broadcastCallback;
  }

  async start() {
    if (this.isProcessing) {
      console.log("⚠️  Withdrawal processor already running");
      return;
    }

    this.isProcessing = true;
    console.log("💸 Starting Solana withdrawal processor...");
    
    this.processingInterval = setInterval(() => {
      this.processPendingWithdrawals();
    }, PROCESS_INTERVAL_MS);

    await this.processPendingWithdrawals();
  }

  stop() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    this.isProcessing = false;
    console.log("🛑 Solana withdrawal processor stopped");
  }

  private async processPendingWithdrawals() {
    try {
      const pendingWithdrawals = await this.storage.getPendingWithdrawals();
      
      for (const withdrawal of pendingWithdrawals) {
        await this.processWithdrawal(withdrawal);
      }
    } catch (error) {
      console.error("Error processing pending withdrawals:", error);
    }
  }

  private async processWithdrawal(withdrawal: any) {
    try {
      const user = await this.storage.getUser(withdrawal.userId);
      if (!user) {
        await this.storage.updateWithdrawalStatus(
          withdrawal.id,
          "failed",
          undefined,
          "User not found"
        );
        return;
      }

      const amount = parseFloat(withdrawal.amount);
      const userBalance = parseFloat(user.solanaBalance);

      if (userBalance < amount) {
        await this.storage.updateWithdrawalStatus(
          withdrawal.id,
          "failed",
          undefined,
          "Insufficient balance"
        );
        console.log(`❌ Withdrawal ${withdrawal.id} failed: Insufficient balance`);
        return;
      }

      console.log(`💸 Processing withdrawal: ${amount} SOL to ${withdrawal.destinationAddress}`);
      console.log(`   User balance: ${userBalance} SOL`);

      const signature = await solanaWallet.transferSOL(
        withdrawal.destinationAddress,
        amount
      );

      const newBalance = (userBalance - amount).toFixed(9);
      await this.storage.updateUserSolanaBalance(withdrawal.userId, newBalance);
      
      await this.storage.updateWithdrawalStatus(
        withdrawal.id,
        "completed",
        signature,
        undefined
      );

      console.log(`✅ Withdrawal completed: ${amount} SOL`);
      console.log(`   Signature: ${signature}`);
      console.log(`   New user balance: ${newBalance} SOL`);
      
      // Broadcast withdrawal completion via WebSocket
      if (this.broadcastCallback) {
        this.broadcastCallback({
          type: 'WITHDRAWAL_COMPLETED',
          withdrawal: {
            id: withdrawal.id,
            userId: withdrawal.userId,
            amount: withdrawal.amount,
            destinationAddress: withdrawal.destinationAddress,
            signature,
            status: 'completed'
          },
          newBalance
        });
      }
    } catch (error: any) {
      console.error(`❌ Error processing withdrawal ${withdrawal.id}:`, error);
      
      await this.storage.updateWithdrawalStatus(
        withdrawal.id,
        "failed",
        undefined,
        error.message || "Unknown error"
      );
      
      // Broadcast withdrawal failure via WebSocket
      if (this.broadcastCallback) {
        this.broadcastCallback({
          type: 'WITHDRAWAL_FAILED',
          withdrawal: {
            id: withdrawal.id,
            userId: withdrawal.userId,
            amount: withdrawal.amount,
            destinationAddress: withdrawal.destinationAddress,
            status: 'failed',
            error: error.message || "Unknown error"
          }
        });
      }
    }
  }

  async requestWithdrawal(userId: string, destinationAddress: string, amount: number): Promise<any> {
    if (!solanaWallet.isValidAddress(destinationAddress)) {
      throw new Error("Invalid Solana address");
    }

    if (amount < MIN_WITHDRAWAL_AMOUNT) {
      throw new Error(`Minimum withdrawal amount is ${MIN_WITHDRAWAL_AMOUNT} SOL`);
    }

    if (amount > MAX_WITHDRAWAL_AMOUNT) {
      throw new Error(`Maximum withdrawal amount is ${MAX_WITHDRAWAL_AMOUNT} SOL per transaction`);
    }

    const user = await this.storage.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const userBalance = parseFloat(user.solanaBalance);
    if (userBalance < amount) {
      throw new Error(`Insufficient balance. Available: ${userBalance} SOL`);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const recentWithdrawals = await this.storage.getUserWithdrawals(userId, 100);
    const todayWithdrawals = recentWithdrawals.filter(w => {
      const wDate = new Date(w.createdAt);
      wDate.setHours(0, 0, 0, 0);
      return wDate.getTime() === today.getTime() && w.status !== "failed";
    });

    const todayTotal = todayWithdrawals.reduce(
      (sum, w) => sum + parseFloat(w.amount),
      0
    );

    if (todayTotal + amount > DAILY_WITHDRAWAL_LIMIT_SOL) {
      throw new Error(
        `Daily withdrawal limit exceeded. Limit: ${DAILY_WITHDRAWAL_LIMIT_SOL} SOL, ` +
        `Used today: ${todayTotal.toFixed(3)} SOL, ` +
        `Remaining: ${(DAILY_WITHDRAWAL_LIMIT_SOL - todayTotal).toFixed(3)} SOL`
      );
    }

    const withdrawal = await this.storage.createWithdrawal({
      userId,
      destinationAddress,
      amount: amount.toFixed(9),
    });

    console.log(`📝 Withdrawal request created: ${amount} SOL for user ${userId}`);
    console.log(`   Destination: ${destinationAddress}`);
    console.log(`   Request ID: ${withdrawal.id}`);

    setImmediate(() => {
      this.processWithdrawal(withdrawal);
    });

    return withdrawal;
  }

  async getWithdrawalLimits(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const recentWithdrawals = await this.storage.getUserWithdrawals(userId, 100);
    const todayWithdrawals = recentWithdrawals.filter(w => {
      const wDate = new Date(w.createdAt);
      wDate.setHours(0, 0, 0, 0);
      return wDate.getTime() === today.getTime() && w.status !== "failed";
    });

    const todayTotal = todayWithdrawals.reduce(
      (sum, w) => sum + parseFloat(w.amount),
      0
    );

    return {
      dailyLimit: DAILY_WITHDRAWAL_LIMIT_SOL,
      usedToday: todayTotal,
      remainingToday: DAILY_WITHDRAWAL_LIMIT_SOL - todayTotal,
      minWithdrawal: MIN_WITHDRAWAL_AMOUNT,
      maxWithdrawal: MAX_WITHDRAWAL_AMOUNT,
    };
  }
}

export function createWithdrawalProcessor(storage: IStorage, broadcastCallback?: (data: any) => void): SolanaWithdrawalProcessor {
  return new SolanaWithdrawalProcessor(storage, broadcastCallback);
}
