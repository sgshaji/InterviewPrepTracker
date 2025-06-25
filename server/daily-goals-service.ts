import { db } from './db';
import { dailyGoals, dailyActivities, streaks, preparationSessions, topics } from '../shared/schema';
import { eq, and, gte, lte, count, desc } from 'drizzle-orm';
import { sendDailyGoalReminder, sendStreakBreakNotification } from './daily-goals-email';

export interface DailyGoal {
  id: number;
  goal_name: string;
  target_count: number;
  completed_count: number;
  is_complete: boolean;
}

export interface UserGoalData {
  userId: string;
  email: string;
  userName: string;
  currentStreak: number;
  goals: DailyGoal[];
  date: string;
  timezone: string;
}

export class DailyGoalsService {
  // Create a new daily goal for a user
  static async createGoal(userId: string, goalName: string, targetCount: number = 1): Promise<number> {
    const [goal] = await db.insert(dailyGoals).values({
      userId: userId,
      goalType: goalName,
      targetCount: targetCount,
      isActive: true
    }).returning({ id: dailyGoals.id });
    
    return goal.id;
  }

  // Get all active goals for a user
  static async getUserGoals(userId: string): Promise<any[]> {
    return await db.select().from(dailyGoals)
      .where(and(
        eq(dailyGoals.userId, userId),
        eq(dailyGoals.isActive, true)
      ));
  }

  // Get daily progress for a specific date
  static async getDailyProgress(userId: string, date: string): Promise<DailyGoal[]> {
    const goals = await this.getUserGoals(userId);
    const progress = await db.select().from(dailyActivities)
      .where(and(
        eq(dailyActivities.userId, userId),
        eq(dailyActivities.activityDate, date)
      ));

    return goals.map(goal => {
      const goalProgress = progress.find(p => p.goalType === goal.goalType);
      return {
        id: goal.id,
        goal_name: goal.goalType,
        target_count: goal.targetCount,
        completed_count: goalProgress?.completedCount || 0,
        is_complete: goalProgress?.isCompleted || false
      };
    });
  }

  // Update progress for a specific goal on a specific date
  static async updateGoalProgress(userId: string, goalId: number, date: string, completedCount: number): Promise<void> {
    const isComplete = completedCount >= (await this.getGoalTargetCount(goalId));
    
    await db.insert(dailyActivities).values({
      userId: userId,
      goalType: (await this.getGoalType(goalId)),
      activityDate: date,
      completedCount: completedCount,
      targetCount: await this.getGoalTargetCount(goalId),
      isCompleted: isComplete
    }).onConflictDoUpdate({
      target: [dailyActivities.userId, dailyActivities.activityDate, dailyActivities.goalType],
      set: {
        completedCount: completedCount,
        isCompleted: isComplete
      }
    });
  }

  // Calculate progress based on preparation sessions
  static async calculateProgressFromPrepSessions(userId: string, date: string): Promise<void> {
    const goals = await this.getUserGoals(userId);
    
    for (const goal of goals) {
      // Get topic name for this goal
      const topicName = goal.goalType;
      
      // Count preparation sessions for this goal on this date
      const sessions = await db.select({
        id: preparationSessions.id,
        topicId: preparationSessions.topicId,
        notes: preparationSessions.notes,
        topicName: topics.name
      }).from(preparationSessions)
      .innerJoin(topics, eq(preparationSessions.topicId, topics.id))
      .where(and(
        eq(preparationSessions.userId, userId),
        eq(preparationSessions.date, date)
      ));

      // Simple keyword matching (can be enhanced with LLM later)
      const matchingSessions = sessions.filter(session => {
        return session.topicName.toLowerCase().includes(topicName.toLowerCase()) ||
               topicName.toLowerCase().includes(session.topicName.toLowerCase());
      });

      await this.updateGoalProgress(userId, goal.id, date, matchingSessions.length);
    }
  }

  // Check if all goals are completed for a date
  static async areAllGoalsCompleted(userId: string, date: string): Promise<boolean> {
    const progress = await this.getDailyProgress(userId, date);
    return progress.length > 0 && progress.every(goal => goal.is_complete);
  }

  // Update user streak
  static async updateUserStreak(userId: string, date: string): Promise<void> {
    const allGoalsCompleted = await this.areAllGoalsCompleted(userId, date);
    const [existingStreak] = await db.select().from(streaks)
      .where(eq(streaks.userId, userId));

    if (allGoalsCompleted) {
      if (existingStreak) {
        const lastCompleted = existingStreak.lastActivityDate;
        const currentDate = new Date(date);
        const lastDate = lastCompleted ? new Date(lastCompleted) : null;
        
        let newStreak = existingStreak.currentStreak;
        if (!lastDate || this.isConsecutiveDay(lastDate, currentDate)) {
          newStreak++;
        } else {
          newStreak = 1; // Reset streak if not consecutive
        }

        await db.update(streaks).set({
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, existingStreak.longestStreak),
          lastActivityDate: date,
          totalPoints: existingStreak.totalPoints + 10, // Award points for completing goals
          updatedAt: new Date()
        }).where(eq(streaks.userId, userId));
      } else {
        await db.insert(streaks).values({
          userId: userId,
          currentStreak: 1,
          longestStreak: 1,
          lastActivityDate: date,
          totalPoints: 10
        });
      }
    } else {
      // Streak broken - reset to 0
      if (existingStreak) {
        await db.update(streaks).set({
          currentStreak: 0,
          updatedAt: new Date()
        }).where(eq(streaks.userId, userId));
      }
    }
  }

  // Check if two dates are consecutive
  private static isConsecutiveDay(date1: Date, date2: Date): boolean {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  }

  // Get user streak information
  static async getUserStreak(userId: string): Promise<any> {
    const [streak] = await db.select().from(streaks)
      .where(eq(streaks.userId, userId));
    
    return streak || {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      totalPoints: 0
    };
  }

  // Send daily goal reminders (placeholder - implement notification logic)
  static async sendDailyReminders(): Promise<void> {
    // This would need to be implemented with a proper notification system
    // For MVP, we'll use a simple approach
    console.log('Sending daily reminders...');
    
    // Get all users with active goals
    const users = await db.select({
      userId: dailyGoals.userId
    }).from(dailyGoals)
    .where(eq(dailyGoals.isActive, true))
    .groupBy(dailyGoals.userId);

    const today = new Date().toISOString().split('T')[0];

    for (const user of users) {
      try {
        const progress = await this.getDailyProgress(user.userId, today);
        const streak = await this.getUserStreak(user.userId);
        
        // For MVP, we'll just log the reminder
        console.log(`Reminder for user ${user.userId}:`, {
          streak: streak.currentStreak,
          goals: progress,
          date: today
        });

        // TODO: Implement actual email sending
        // await sendDailyGoalReminder(userData);
      } catch (error) {
        console.error(`Error sending reminder to user ${user.userId}:`, error);
      }
    }
  }

  // Send streak break notifications (placeholder)
  static async sendStreakBreakNotifications(): Promise<void> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const users = await db.select({
      userId: dailyGoals.userId
    }).from(dailyGoals)
    .where(eq(dailyGoals.isActive, true))
    .groupBy(dailyGoals.userId);

    for (const user of users) {
      try {
        const wasCompletedYesterday = await this.areAllGoalsCompleted(user.userId, yesterdayStr);
        const streak = await this.getUserStreak(user.userId);

        // If yesterday wasn't completed and user had a streak, log break notification
        if (!wasCompletedYesterday && streak.currentStreak === 0 && streak.lastActivityDate) {
          console.log(`Streak broken for user ${user.userId} on ${yesterdayStr}`);
          
          // TODO: Implement actual email sending
          // await sendStreakBreakNotification(userData);
        }
      } catch (error) {
        console.error(`Error sending streak break notification to user ${user.userId}:`, error);
      }
    }
  }

  // Helper methods
  private static async getGoalTargetCount(goalId: number): Promise<number> {
    const [goal] = await db.select({ targetCount: dailyGoals.targetCount })
      .from(dailyGoals)
      .where(eq(dailyGoals.id, goalId));
    
    return goal?.targetCount || 1;
  }

  private static async getGoalType(goalId: number): Promise<string> {
    const [goal] = await db.select({ goalType: dailyGoals.goalType })
      .from(dailyGoals)
      .where(eq(dailyGoals.id, goalId));
    
    return goal?.goalType || '';
  }
} 