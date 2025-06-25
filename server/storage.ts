import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { 
  applications, 
  preparationSessions, 
  interviews, 
  assessments,
  reminders,
  streaks,
  dailyGoals,
  dailyActivities,
  achievements,
  type Application,
  type InsertApplication,
  type PreparationSession,
  type InsertPreparationSession,
  type Interview,
  type InsertInterview,
  type Assessment,
  type InsertAssessment,
  type Reminder,
  type InsertReminder
} from "@shared/schema";

// Define status types locally
type ApplicationStatus = string;
type InterviewStage = string;
type InterviewStatus = string;
import { db } from './db';
import { eq, desc, asc, and, gte, lte, count, sql, ne, isNotNull } from 'drizzle-orm';
import { cache } from "./cache";

// Define types for the storage interface
type PaginationOptions = {
  page?: number;
  limit?: number;
  status?: ApplicationStatus;
  fromDate?: Date;
  toDate?: Date;
};

// Export the storage interface (removed user operations)
export interface IStorage {
  // Applications
  getApplications(userId: string, options?: PaginationOptions): Promise<{ totalCount: number; applications: Application[] }>;
  getApplication(id: string): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: string, application: Partial<InsertApplication>): Promise<Application>;
  deleteApplication(id: string): Promise<void>;
  
  // Preparation Sessions
  getPreparationSessions(userId: string): Promise<PreparationSession[]>;
  getPreparationSessionsByDateRange(userId: string, startDate: string, endDate: string): Promise<PreparationSession[]>;
  createPreparationSession(session: InsertPreparationSession): Promise<PreparationSession>;
  updatePreparationSession(id: string, session: Partial<InsertPreparationSession>): Promise<PreparationSession>;
  deletePreparationSession(id: string): Promise<void>;
  
  // Interviews
  getInterviews(userId: string, filters?: { status?: InterviewStatus; stage?: InterviewStage }): Promise<Interview[]>;
  getInterview(id: string): Promise<Interview | undefined>;
  createInterview(interview: InsertInterview): Promise<Interview>;
  updateInterview(id: string, interview: Partial<InsertInterview>): Promise<Interview>;
  deleteInterview(id: string): Promise<void>;
  
  // Assessments
  getAssessments(userId: string): Promise<Assessment[]>;
  getAssessment(id: string): Promise<Assessment | undefined>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  updateAssessment(id: string, assessment: Partial<InsertAssessment>): Promise<Assessment>;
  deleteAssessment(id: string): Promise<void>;
  
  // Reminders
  getReminders(userId: string, filters?: { completed?: boolean; fromDate?: Date; toDate?: Date }): Promise<Reminder[]>;
  createReminder(reminder: Omit<InsertReminder, 'id' | 'createdAt'>): Promise<Reminder>;
  updateReminder(id: string, reminder: Partial<Omit<InsertReminder, 'id' | 'userId' | 'createdAt'>>): Promise<Reminder>;
  deleteReminder(id: string): Promise<void>;
  
  // Analytics
  getDashboardStats(userId: string): Promise<{
    totalApplications: number;
    activeInterviews: number;
    prepStreak: number;
    successRate: number;
  }>;
  getWeeklyPrepTime(userId: string): Promise<{ date: string; hours: number }[]>;
  getConfidenceTrends(userId: string): Promise<{ topic: string; score: number }[]>;

  // Gamification - Streaks
  getStreak(userId: string): Promise<any>;
  updateStreak(userId: string, data: any): Promise<any>;
  
  // Gamification - Daily Goals
  getDailyGoals(userId: string): Promise<any[]>;
  createDailyGoal(goal: any): Promise<any>;
  updateDailyGoal(id: string, goal: any): Promise<any>;
  deleteDailyGoal(id: string): Promise<void>;
  
  // Gamification - Daily Activities
  getDailyActivities(userId: string, date?: string): Promise<any[]>;
  createDailyActivity(activity: any): Promise<any>;
  updateDailyActivity(id: string, activity: any): Promise<any>;
  
  // Gamification - Achievements
  getAchievements(userId: string): Promise<any[]>;
  createAchievement(achievement: any): Promise<any>;
  checkAndUnlockAchievements(userId: string): Promise<any[]>;
}

// Initialize Supabase admin client for server-side operations
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
);

export class DatabaseStorage implements IStorage {
  // Applications
  async getApplications(userId: string, options: PaginationOptions = {}): Promise<{ totalCount: number; applications: Application[] }> {
    try {
      const { page = 1, limit = 10, status, fromDate, toDate } = options;
      const offset = (page - 1) * limit;
      
      // Build where conditions
      const whereConditions = [eq(applications.userId, userId)];
      
      if (status) {
        whereConditions.push(eq(applications.jobStatus, status));
      }
      if (fromDate) {
        whereConditions.push(gte(applications.dateApplied, fromDate.toISOString().split('T')[0]));
      }
      if (toDate) {
        whereConditions.push(lte(applications.dateApplied, toDate.toISOString().split('T')[0]));
      }
      
      const whereClause = and(...whereConditions);
      
      // Get total count
      const [{ count: totalCount }] = await db
        .select({ count: count(applications.id) })
        .from(applications)
        .where(whereClause);
      
      // Get paginated applications
      const userApplications = await db
        .select()
        .from(applications)
        .where(whereClause)
        .orderBy(desc(applications.dateApplied))
        .limit(limit)
        .offset(offset);
      
      return {
        totalCount,
        applications: userApplications.map(app => ({
          ...app,
          createdAt: app.createdAt.toISOString(),
          updatedAt: app.updatedAt.toISOString()
        }))
      };
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  }

  async getApplication(id: string): Promise<Application | undefined> {
    const [application] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, parseInt(id)))
      .limit(1);
    
    if (!application) return undefined;
    
    return {
      ...application,
      createdAt: application.createdAt.toISOString(),
      updatedAt: application.updatedAt.toISOString()
    };
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    try {
      const [newApplication] = await db
        .insert(applications)
        .values(application)
        .returning();
      
      // Invalidate cache for this user's applications
      await cache.invalidatePattern(`applications:${application.userId}:*`);
      
      return {
        ...newApplication,
        createdAt: newApplication.createdAt.toISOString(),
        updatedAt: newApplication.updatedAt.toISOString()
      };
    } catch (error) {
      console.error('Error in createApplication:', error);
      throw new Error('Failed to create application');
    }
  }

  async updateApplication(id: string, application: Partial<InsertApplication>): Promise<Application> {
    const [updatedApplication] = await db
      .update(applications)
      .set(application)
      .where(eq(applications.id, parseInt(id)))
      .returning();
    
    return {
      ...updatedApplication,
      createdAt: updatedApplication.createdAt.toISOString(),
      updatedAt: updatedApplication.updatedAt.toISOString()
    };
  }

  async deleteApplication(id: string): Promise<void> {
    await db.delete(applications).where(eq(applications.id, parseInt(id)));
  }

  // Preparation Sessions
  async getPreparationSessions(userId: string): Promise<PreparationSession[]> {
    return await db
      .select()
      .from(preparationSessions)
      .where(eq(preparationSessions.userId, userId))
      .orderBy(desc(preparationSessions.date));
  }

  async getPreparationSessionsByDateRange(userId: string, startDate: string, endDate: string): Promise<PreparationSession[]> {
    return await db
      .select()
      .from(preparationSessions)
      .where(
        and(
          eq(preparationSessions.userId, userId),
          gte(preparationSessions.date, startDate),
          lte(preparationSessions.date, endDate)
        )
      )
      .orderBy(desc(preparationSessions.date));
  }

  async createPreparationSession(session: InsertPreparationSession): Promise<PreparationSession> {
    const [newSession] = await db
      .insert(preparationSessions)
      .values(session)
      .returning();
    
    return newSession;
  }

  async updatePreparationSession(id: string, session: Partial<InsertPreparationSession>): Promise<PreparationSession> {
    const [updatedSession] = await db
      .update(preparationSessions)
      .set(session)
      .where(eq(preparationSessions.id, parseInt(id)))
      .returning();
    
    return updatedSession;
  }

  async deletePreparationSession(id: string): Promise<void> {
    await db.delete(preparationSessions).where(eq(preparationSessions.id, parseInt(id)));
  }

  // Interviews
  async getInterview(id: string): Promise<Interview | undefined> {
    const [interview] = await db
      .select()
      .from(interviews)
      .where(eq(interviews.id, parseInt(id)))
      .limit(1);
    
    if (!interview) return undefined;
    
    return {
      ...interview,
      interviewDate: interview.interviewDate?.toISOString() || null,
      createdAt: interview.createdAt.toISOString(),
      updatedAt: interview.updatedAt.toISOString()
    };
  }

  async getInterviews(
    userId: string, 
    filters: {
      status?: InterviewStatus;
      stage?: InterviewStage;
      fromDate?: Date;
      toDate?: Date;
    } = {}
  ): Promise<Interview[]> {
    const whereConditions = [eq(interviews.userId, userId)];
    
    if (filters.status) {
      whereConditions.push(eq(interviews.status, filters.status));
    }
    if (filters.stage) {
      whereConditions.push(eq(interviews.interviewStage, filters.stage));
    }
    if (filters.fromDate) {
      whereConditions.push(gte(interviews.interviewDate, filters.fromDate));
    }
    if (filters.toDate) {
      whereConditions.push(lte(interviews.interviewDate, filters.toDate));
    }
    
    const interviewsList = await db
      .select()
      .from(interviews)
      .where(and(...whereConditions))
      .orderBy(desc(interviews.interviewDate));
    
    return interviewsList.map(interview => ({
      ...interview,
      interviewDate: interview.interviewDate?.toISOString() || null,
      createdAt: interview.createdAt.toISOString(),
      updatedAt: interview.updatedAt.toISOString()
    }));
  }

  async createInterview(interview: InsertInterview): Promise<Interview> {
    const [newInterview] = await db
      .insert(interviews)
      .values(interview)
      .returning();
    
    return {
      ...newInterview,
      interviewDate: newInterview.interviewDate?.toISOString() || null,
      createdAt: newInterview.createdAt.toISOString(),
      updatedAt: newInterview.updatedAt.toISOString()
    };
  }

  async updateInterview(id: string, interview: Partial<InsertInterview>): Promise<Interview> {
    const [updatedInterview] = await db
      .update(interviews)
      .set(interview)
      .where(eq(interviews.id, parseInt(id)))
      .returning();
    
    return {
      ...updatedInterview,
      interviewDate: updatedInterview.interviewDate?.toISOString() || null,
      createdAt: updatedInterview.createdAt.toISOString(),
      updatedAt: updatedInterview.updatedAt.toISOString()
    };
  }

  async deleteInterview(id: string): Promise<void> {
    await db.delete(interviews).where(eq(interviews.id, parseInt(id)));
  }

  // Assessments
  async getAssessment(id: string): Promise<Assessment | undefined> {
    const [assessment] = await db
      .select()
      .from(assessments)
      .where(eq(assessments.id, parseInt(id)))
      .limit(1);
    
    return assessment;
  }

  async getAssessments(userId: string): Promise<Assessment[]> {
    return await db
      .select()
      .from(assessments)
      .where(eq(assessments.userId, userId))
      .orderBy(desc(assessments.createdAt));
  }

  async createAssessment(assessment: InsertAssessment): Promise<Assessment> {
    const [newAssessment] = await db
      .insert(assessments)
      .values(assessment)
      .returning();
    
    return newAssessment;
  }

  async updateAssessment(id: string, assessment: Partial<InsertAssessment>): Promise<Assessment> {
    const [updatedAssessment] = await db
      .update(assessments)
      .set(assessment)
      .where(eq(assessments.id, parseInt(id)))
      .returning();
    
    return updatedAssessment;
  }

  async deleteAssessment(id: string): Promise<void> {
    await db.delete(assessments).where(eq(assessments.id, parseInt(id)));
  }

  // Reminders
  async getReminders(
    userId: string, 
    filters: {
      completed?: boolean;
      fromDate?: Date;
      toDate?: Date;
    } = {}
  ): Promise<Reminder[]> {
    const whereConditions = [eq(reminders.userId, userId)];
    
    if (filters.completed !== undefined) {
      whereConditions.push(eq(reminders.completed, filters.completed));
    }
    if (filters.fromDate) {
      whereConditions.push(gte(reminders.dueDate, filters.fromDate));
    }
    if (filters.toDate) {
      whereConditions.push(lte(reminders.dueDate, filters.toDate));
    }
    
    const remindersList = await db
      .select()
      .from(reminders)
      .where(and(...whereConditions))
      .orderBy(asc(reminders.dueDate));
    
    return remindersList.map(reminder => ({
      ...reminder,
      dueDate: reminder.dueDate.toISOString(),
      createdAt: reminder.createdAt.toISOString()
    }));
  }

  async createReminder(reminder: Omit<InsertReminder, 'id' | 'createdAt'>): Promise<Reminder> {
    const [createdReminder] = await db
      .insert(reminders)
      .values(reminder)
      .returning();
    
    return {
      ...createdReminder,
      dueDate: createdReminder.dueDate.toISOString(),
      createdAt: createdReminder.createdAt.toISOString()
    };
  }

  async updateReminder(id: string, reminder: Partial<Omit<InsertReminder, 'id' | 'userId' | 'createdAt'>>): Promise<Reminder> {
    const [updatedReminder] = await db
      .update(reminders)
      .set(reminder)
      .where(eq(reminders.id, parseInt(id)))
      .returning();
    
    return {
      ...updatedReminder,
      dueDate: updatedReminder.dueDate.toISOString(),
      createdAt: updatedReminder.createdAt.toISOString()
    };
  }

  async deleteReminder(id: string): Promise<void> {
    await db.delete(reminders).where(eq(reminders.id, parseInt(id)));
  }

  // Analytics
  async getDashboardStats(userId: string): Promise<{
    totalApplications: number;
    activeInterviews: number;
    prepStreak: number;
    successRate: number;
  }> {
    try {
      // Get total applications
      const [{ count: totalApplications }] = await db
        .select({ count: count(applications.id) })
        .from(applications)
        .where(eq(applications.userId, userId));

      // Get active interviews (status not 'Completed' or 'Cancelled')
      const [{ count: activeInterviews }] = await db
        .select({ count: count(interviews.id) })
        .from(interviews)
        .where(
          and(
            eq(interviews.userId, userId),
            ne(interviews.status, 'Completed'),
            ne(interviews.status, 'Cancelled')
          )
        );

      // Get current streak
      const [streakData] = await db
        .select()
        .from(streaks)
        .where(eq(streaks.userId, userId))
        .limit(1);

      const prepStreak = streakData?.currentStreak || 0;

      // Calculate success rate (interviews with status 'Completed' / total interviews)
      const [{ count: completedInterviews }] = await db
        .select({ count: count(interviews.id) })
        .from(interviews)
        .where(
          and(
            eq(interviews.userId, userId),
            eq(interviews.status, 'Completed')
          )
        );

      const [{ count: totalInterviews }] = await db
        .select({ count: count(interviews.id) })
        .from(interviews)
        .where(eq(interviews.userId, userId));

      const successRate = totalInterviews > 0 ? (completedInterviews / totalInterviews) * 100 : 0;

      return {
        totalApplications,
        activeInterviews,
        prepStreak,
        successRate: Math.round(successRate)
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalApplications: 0,
        activeInterviews: 0,
        prepStreak: 0,
        successRate: 0
      };
    }
  }

  async getWeeklyPrepTime(userId: string): Promise<{ date: string; hours: number }[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const sessions = await db
      .select({
        date: preparationSessions.date,
        confidenceScore: preparationSessions.confidenceScore
      })
      .from(preparationSessions)
      .where(
        and(
          eq(preparationSessions.userId, userId),
          gte(preparationSessions.date, startDate.toISOString().split('T')[0]),
          lte(preparationSessions.date, endDate.toISOString().split('T')[0])
        )
      );

    // Group by date and calculate estimated hours (assuming 30 minutes per session)
    const dailyHours: { [key: string]: number } = {};
    sessions.forEach(session => {
      const date = session.date;
      dailyHours[date] = (dailyHours[date] || 0) + 0.5; // 30 minutes per session
    });

    return Object.entries(dailyHours).map(([date, hours]) => ({
      date,
      hours: Math.round(hours * 10) / 10
    }));
  }

  async getConfidenceTrends(userId: string): Promise<{ topic: string; score: number }[]> {
    const sessions = await db
      .select({
        topicId: preparationSessions.topicId,
        confidenceScore: preparationSessions.confidenceScore
      })
      .from(preparationSessions)
      .where(
        and(
          eq(preparationSessions.userId, userId),
          isNotNull(preparationSessions.confidenceScore)
        )
      )
      .orderBy(desc(preparationSessions.createdAt))
      .limit(50);

    // Group by topic and calculate average confidence
    const topicScores: { [key: number]: number[] } = {};
    sessions.forEach(session => {
      if (session.confidenceScore !== null) {
        if (!topicScores[session.topicId]) {
          topicScores[session.topicId] = [];
        }
        topicScores[session.topicId].push(session.confidenceScore);
      }
    });

    return Object.entries(topicScores).map(([topicId, scores]) => ({
      topic: `Topic ${topicId}`,
      score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    }));
  }

  // Gamification - Streaks
  async getStreak(userId: string) {
    const [streak] = await db
      .select()
      .from(streaks)
      .where(eq(streaks.userId, userId))
      .limit(1);

    if (!streak) {
      // Create default streak record
      const [newStreak] = await db
        .insert(streaks)
        .values({
          userId,
          currentStreak: 0,
          longestStreak: 0,
          totalPoints: 0,
          level: 1
        })
        .returning();
      
      return newStreak;
    }

    return streak;
  }

  async updateStreak(userId: string, data: any) {
    const [updatedStreak] = await db
      .update(streaks)
      .set(data)
      .where(eq(streaks.userId, userId))
      .returning();

    return updatedStreak;
  }

  // Gamification - Daily Goals
  async getDailyGoals(userId: string) {
    return await db
      .select()
      .from(dailyGoals)
      .where(eq(dailyGoals.userId, userId))
      .orderBy(desc(dailyGoals.createdAt));
  }

  async createDailyGoal(goal: any) {
    const [newGoal] = await db
      .insert(dailyGoals)
      .values(goal)
      .returning();

    return newGoal;
  }

  async updateDailyGoal(id: string, goal: any) {
    const [updatedGoal] = await db
      .update(dailyGoals)
      .set(goal)
      .where(eq(dailyGoals.id, parseInt(id)))
      .returning();

    return updatedGoal;
  }

  async deleteDailyGoal(id: string) {
    await db.delete(dailyGoals).where(eq(dailyGoals.id, parseInt(id)));
  }

  // Gamification - Daily Activities
  async getDailyActivities(userId: string, date?: string) {
    const whereConditions = [eq(dailyActivities.userId, userId)];
    
    if (date) {
      whereConditions.push(eq(dailyActivities.activityDate, date));
    }

    return await db
      .select()
      .from(dailyActivities)
      .where(and(...whereConditions))
      .orderBy(desc(dailyActivities.activityDate));
  }

  async createDailyActivity(activity: any) {
    const [newActivity] = await db
      .insert(dailyActivities)
      .values(activity)
      .returning();

    return newActivity;
  }

  async updateDailyActivity(id: string, activity: any) {
    const [updatedActivity] = await db
      .update(dailyActivities)
      .set(activity)
      .where(eq(dailyActivities.id, parseInt(id)))
      .returning();

    return updatedActivity;
  }

  // Gamification - Achievements
  async getAchievements(userId: string) {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(desc(achievements.unlockedAt));
  }

  async createAchievement(achievement: any) {
    const [newAchievement] = await db
      .insert(achievements)
      .values(achievement)
      .returning();

    return newAchievement;
  }

  async checkAndUnlockAchievements(userId: string) {
    // This is a placeholder implementation
    // In a real implementation, you would check various conditions
    // and unlock achievements based on user progress
    return [];
  }
}

// Export a singleton instance
export const storage = new DatabaseStorage();

// Export gamification tables for API routes
export { streaks, dailyGoals, dailyActivities, achievements };
