import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { 
  applications, 
  preparationSessions, 
  interviews, 
  assessments,
  reminders,
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
        applications: userApplications
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
      .where(eq(applications.id, id))
      .limit(1);
    return application;
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    try {
      const applicationWithId = {
        ...application,
        id: randomUUID()
      };
      
      const [newApplication] = await db
        .insert(applications)
        .values(applicationWithId)
        .returning();
      
      // Invalidate cache for this user's applications
      await cache.invalidatePattern(`applications:${application.userId}:*`);
      
      return newApplication;
    } catch (error) {
      console.error('Error in createApplication:', error);
      throw new Error('Failed to create application');
    }
  }

  async updateApplication(id: string, application: Partial<InsertApplication>): Promise<Application> {
    const [updatedApplication] = await db
      .update(applications)
      .set({ ...application, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    
    // Invalidate cache for this user's applications
    await cache.invalidatePattern(`applications:${updatedApplication.userId}:*`);
    
    return updatedApplication;
  }

  async deleteApplication(id: string): Promise<void> {
    await db.delete(applications).where(eq(applications.id, id));
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
      .orderBy(asc(preparationSessions.date));
  }

  async createPreparationSession(session: InsertPreparationSession): Promise<PreparationSession> {
    const sessionWithId = {
      ...session,
      id: randomUUID()
    };
    
    const [newSession] = await db
      .insert(preparationSessions)
      .values(sessionWithId)
      .returning();
    return newSession;
  }

  async updatePreparationSession(id: string, session: Partial<InsertPreparationSession>): Promise<PreparationSession> {
    const [updatedSession] = await db
      .update(preparationSessions)
      .set(session)
      .where(eq(preparationSessions.id, id))
      .returning();
    return updatedSession;
  }

  async deletePreparationSession(id: string): Promise<void> {
    await db.delete(preparationSessions).where(eq(preparationSessions.id, id));
  }

  // Interviews
  async getInterview(id: string): Promise<Interview | undefined> {
    const [interview] = await db
      .select()
      .from(interviews)
      .where(eq(interviews.id, id))
      .limit(1);
    return interview;
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
    const whereClause = and(
      eq(interviews.userId, userId),
      filters.status ? eq(interviews.status, filters.status) : undefined,
      filters.stage ? eq(interviews.interviewStage, filters.stage) : undefined,
      filters.fromDate ? gte(interviews.interviewDate, filters.fromDate) : undefined,
      filters.toDate ? lte(interviews.interviewDate, filters.toDate) : undefined
    );

    return await db
      .select()
      .from(interviews)
      .where(whereClause)
      .orderBy(desc(interviews.interviewDate));
  }

  async createInterview(interview: InsertInterview): Promise<Interview> {
    const interviewWithId = {
      ...interview,
      id: randomUUID()
    };
    
    const [newInterview] = await db
      .insert(interviews)
      .values(interviewWithId)
      .returning();
    return newInterview;
  }

  async updateInterview(id: string, interview: Partial<InsertInterview>): Promise<Interview> {
    const [updatedInterview] = await db
      .update(interviews)
      .set({ ...interview, updatedAt: new Date() })
      .where(eq(interviews.id, id))
      .returning();
    return updatedInterview;
  }

  async deleteInterview(id: string): Promise<void> {
    await db.delete(interviews).where(eq(interviews.id, id));
  }

  // Assessments
  async getAssessment(id: string): Promise<Assessment | undefined> {
    const [assessment] = await db
      .select()
      .from(assessments)
      .where(eq(assessments.id, id))
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
    const assessmentWithId = {
      ...assessment,
      id: randomUUID()
    };
    
    const [newAssessment] = await db
      .insert(assessments)
      .values(assessmentWithId)
      .returning();
    return newAssessment;
  }

  async updateAssessment(id: string, assessment: Partial<InsertAssessment>): Promise<Assessment> {
    const [updatedAssessment] = await db
      .update(assessments)
      .set(assessment)
      .where(eq(assessments.id, id))
      .returning();
    return updatedAssessment;
  }

  async deleteAssessment(id: string): Promise<void> {
    await db.delete(assessments).where(eq(assessments.id, id));
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
    const whereClause = and(
      eq(reminders.userId, userId),
      filters.completed !== undefined ? eq(reminders.completed, filters.completed) : undefined,
      filters.fromDate ? gte(reminders.dueDate, filters.fromDate) : undefined,
      filters.toDate ? lte(reminders.dueDate, filters.toDate) : undefined
    );

    return await db
      .select()
      .from(reminders)
      .where(whereClause)
      .orderBy(asc(reminders.dueDate));
  }

  async createReminder(reminder: Omit<InsertReminder, 'id' | 'createdAt'>): Promise<Reminder> {
    const newReminder = {
      ...reminder,
      id: randomUUID(),
      createdAt: new Date()
    };
    
    const [createdReminder] = await db
      .insert(reminders)
      .values(newReminder)
      .returning();
    return createdReminder;
  }

  async updateReminder(id: string, reminder: Partial<Omit<InsertReminder, 'id' | 'userId' | 'createdAt'>>): Promise<Reminder> {
    const [updatedReminder] = await db
      .update(reminders)
      .set(reminder)
      .where(eq(reminders.id, id))
      .returning();
    return updatedReminder;
  }

  async deleteReminder(id: string): Promise<void> {
    await db.delete(reminders).where(eq(reminders.id, id));
  }

  // Analytics
  async getDashboardStats(userId: string): Promise<{
    totalApplications: number;
    activeInterviews: number;
    prepStreak: number;
    successRate: number;
  }> {
    try {
      // Get total applications count
      const [{ count: totalApplications }] = await db
        .select({ count: count(applications.id) })
        .from(applications)
        .where(eq(applications.userId, userId));

      // Get active interviews count
      const [{ count: activeInterviews }] = await db
        .select({ count: count(interviews.id) })
        .from(interviews)
        .where(and(
          eq(interviews.userId, userId),
          ne(interviews.status, 'Completed'),
          ne(interviews.status, 'Cancelled')
        ));

      // Calculate prep streak (consecutive days with preparation sessions in the last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const prepSessions = await db
        .select({ date: preparationSessions.date })
        .from(preparationSessions)
        .where(and(
          eq(preparationSessions.userId, userId),
          gte(preparationSessions.date, thirtyDaysAgo.toISOString().split('T')[0])
        ))
        .orderBy(desc(preparationSessions.date));

      // Calculate streak
      let prepStreak = 0;
      const uniqueDates = [...new Set(prepSessions.map(s => s.date))].sort().reverse();
      const today = new Date().toISOString().split('T')[0];
      
      for (let i = 0; i < uniqueDates.length; i++) {
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);
        const expectedDateStr = expectedDate.toISOString().split('T')[0];
        
        if (uniqueDates[i] === expectedDateStr) {
          prepStreak++;
        } else {
          break;
        }
      }

      // Calculate success rate (offers / total applications)
      const [{ count: totalOffers }] = await db
        .select({ count: count(applications.id) })
        .from(applications)
        .where(and(
          eq(applications.userId, userId),
          eq(applications.jobStatus, 'Offer')
        ));

      const successRate = totalApplications > 0 ? Math.round((totalOffers / totalApplications) * 100) : 0;

      return {
        totalApplications,
        activeInterviews,
        prepStreak,
        successRate
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return {
        totalApplications: 0,
        activeInterviews: 0,
        prepStreak: 0,
        successRate: 0
      };
    }
  }

  async getWeeklyPrepTime(userId: string): Promise<{ date: string; hours: number }[]> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const sessions = await db
        .select({
          date: preparationSessions.date,
          score: preparationSessions.confidenceScore
        })
        .from(preparationSessions)
        .where(and(
          eq(preparationSessions.userId, userId),
          gte(preparationSessions.date, sevenDaysAgo.toISOString().split('T')[0])
        ))
        .orderBy(asc(preparationSessions.date));

      // Group by date and calculate estimated hours (assuming each session is ~1-2 hours)
      const dailyHours: { [key: string]: number } = {};
      
      sessions.forEach(session => {
        const date = session.date;
        if (!dailyHours[date]) {
          dailyHours[date] = 0;
        }
        dailyHours[date] += 1.5; // Assume 1.5 hours per session
      });

      // Fill in missing days with 0 hours
      const result: { date: string; hours: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        result.push({
          date: dateStr,
          hours: dailyHours[dateStr] || 0
        });
      }

      return result;
    } catch (error) {
      console.error('Error getting weekly prep time:', error);
      return [];
    }
  }

  async getConfidenceTrends(userId: string): Promise<{ topic: string; score: number }[]> {
    try {
      // Use preparationSessions since it has the topic and confidenceScore fields
      const sessions = await db
        .select({
          topic: preparationSessions.topic,
          score: preparationSessions.confidenceScore
        })
        .from(preparationSessions)
        .where(and(
          eq(preparationSessions.userId, userId),
          isNotNull(preparationSessions.confidenceScore)
        ))
        .orderBy(desc(preparationSessions.date))
        .limit(10);

      // Group by topic and get average score
      const topicScores: { [key: string]: number[] } = {};
      
      sessions.forEach(session => {
        if (session.score !== null) {
          if (!topicScores[session.topic]) {
            topicScores[session.topic] = [];
          }
          topicScores[session.topic].push(session.score);
        }
      });

      // Calculate average scores
      return Object.entries(topicScores).map(([topic, scores]) => ({
        topic,
        score: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      }));
    } catch (error) {
      console.error('Error getting confidence trends:', error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();
