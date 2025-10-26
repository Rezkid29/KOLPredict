import { dbStorage as storage } from "./db-storage";
import type { User, Achievement } from "@shared/schema";

export interface AchievementRequirement {
  type: "total_bets" | "total_wins" | "total_profit" | "win_streak" | "total_volume" | "followers";
  threshold: number;
}

export class AchievementChecker {
  async checkAndAwardAchievements(userId: string): Promise<void> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        console.error(`User ${userId} not found for achievement checking`);
        return;
      }

      const allAchievements = await storage.getAchievements();
      const userAchievements = await storage.getUserAchievements(userId);
      const earnedAchievementIds = new Set(userAchievements.map(ua => ua.achievementId));

      for (const achievement of allAchievements) {
        // Skip if user already has this achievement
        if (earnedAchievementIds.has(achievement.id)) {
          continue;
        }

        // Check if user meets the requirement
        if (await this.meetsRequirement(user, achievement)) {
          await this.awardAchievement(userId, achievement);
        }
      }
    } catch (error) {
      console.error(`Error checking achievements for user ${userId}:`, error);
    }
  }

  private async meetsRequirement(user: User, achievement: Achievement): Promise<boolean> {
    try {
      const requirement: AchievementRequirement = JSON.parse(achievement.requirement);

      switch (requirement.type) {
        case "total_bets":
          return user.totalBets >= requirement.threshold;
        
        case "total_wins":
          return user.totalWins >= requirement.threshold;
        
        case "total_profit":
          return parseFloat(user.totalProfit) >= requirement.threshold;
        
        case "win_streak":
          // Check if user has a win streak
          return await this.hasWinStreak(user.id, requirement.threshold);
        
        case "total_volume":
          // Check total betting volume
          return await this.getTotalVolume(user.id) >= requirement.threshold;
        
        case "followers":
          // Check follower count
          const profile = await storage.getUserProfile(user.id);
          return profile ? profile.followersCount >= requirement.threshold : false;
        
        default:
          return false;
      }
    } catch (error) {
      console.error(`Error checking requirement for achievement ${achievement.id}:`, error);
      return false;
    }
  }

  private async hasWinStreak(userId: string, streakLength: number): Promise<boolean> {
    try {
      const bets = await storage.getUserBets(userId);
      const settledBets = bets.filter(b => b.status === "won" || b.status === "lost");
      
      let currentStreak = 0;
      for (const bet of settledBets) {
        if (bet.status === "won") {
          currentStreak++;
          if (currentStreak >= streakLength) {
            return true;
          }
        } else {
          currentStreak = 0;
        }
      }
      
      return false;
    } catch (error) {
      console.error(`Error checking win streak for user ${userId}:`, error);
      return false;
    }
  }

  private async getTotalVolume(userId: string): Promise<number> {
    try {
      const bets = await storage.getUserBets(userId);
      return bets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0);
    } catch (error) {
      console.error(`Error calculating total volume for user ${userId}:`, error);
      return 0;
    }
  }

  private async awardAchievement(userId: string, achievement: Achievement): Promise<void> {
    try {
      await storage.awardAchievement(userId, achievement.id);
      
      // Create notification
      await storage.createNotification({
        userId,
        type: "achievement_earned",
        title: "Achievement Unlocked!",
        message: `You earned the "${achievement.name}" achievement: ${achievement.description}`,
        data: JSON.stringify({ achievementId: achievement.id }),
      });

      console.log(`✅ Awarded achievement "${achievement.name}" to user ${userId}`);
    } catch (error) {
      console.error(`Error awarding achievement ${achievement.id} to user ${userId}:`, error);
    }
  }
}

export const achievementChecker = new AchievementChecker();
