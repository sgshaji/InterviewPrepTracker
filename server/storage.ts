import { 
  users, 
  applications, 
  preparationSessions, 
  interviews, 
  assessments, 
  reminders,
  type User, 
  type InsertUser,
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
import { db } from "./db";
import { eq, desc, asc, and, gte, lte, count, sql } from "drizzle-orm";
import { cache } from "./cache";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Applications
  getApplications(userId: number): Promise<Application[]>;
  getApplication(id: number): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: number, application: Partial<InsertApplication>): Promise<Application>;
  deleteApplication(id: number): Promise<void>;
  
  // Preparation Sessions
  getPreparationSessions(userId: number): Promise<PreparationSession[]>;
  getPreparationSessionsByDateRange(userId: number, startDate: string, endDate: string): Promise<PreparationSession[]>;
  createPreparationSession(session: InsertPreparationSession): Promise<PreparationSession>;
  updatePreparationSession(id: number, session: Partial<InsertPreparationSession>): Promise<PreparationSession>;
  deletePreparationSession(id: number): Promise<void>;
  
  // Interviews
  getInterviews(userId: number): Promise<(Interview & { application: Application })[]>;
  getInterview(id: number): Promise<Interview | undefined>;
  createInterview(interview: InsertInterview): Promise<Interview>;
  updateInterview(id: number, interview: Partial<InsertInterview>): Promise<Interview>;
  deleteInterview(id: number): Promise<void>;
  
  // Assessments
  getAssessments(userId: number): Promise<(Assessment & { interview: Interview & { application: Application } })[]>;
  getAssessment(id: number): Promise<Assessment | undefined>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  updateAssessment(id: number, assessment: Partial<InsertAssessment>): Promise<Assessment>;
  deleteAssessment(id: number): Promise<void>;
  
  // Reminders
  getReminders(userId: number): Promise<Reminder[]>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: number, reminder: Partial<InsertReminder>): Promise<Reminder>;
  deleteReminder(id: number): Promise<void>;
  
  // Analytics
  getDashboardStats(userId: number): Promise<{
    totalApplications: number;
    activeInterviews: number;
    prepStreak: number;
    successRate: number;
  }>;
  getWeeklyPrepTime(userId: number): Promise<{ date: string; hours: number }[]>;
  getConfidenceTrends(userId: number): Promise<{ topic: string; score: number }[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Applications
  async getApplications(userId: number): Promise<Application[]> {
    return await db
      .select()
      .from(applications)
      .where(eq(applications.userId, userId))
      .orderBy(desc(applications.dateApplied));
  }

  async getApplication(id: number): Promise<Application | undefined> {
    const [application] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, id));
    return application || undefined;
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const [newApplication] = await db
      .insert(applications)
      .values(application)
      .returning();
    return newApplication;
  }

  async updateApplication(id: number, application: Partial<InsertApplication>): Promise<Application> {
    const [updatedApplication] = await db
      .update(applications)
      .set({ ...application, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    return updatedApplication;
  }

  async deleteApplication(id: number): Promise<void> {
    await db.delete(applications).where(eq(applications.id, id));
  }

  // Preparation Sessions
  async getPreparationSessions(userId: number): Promise<PreparationSession[]> {
    return await db
      .select()
      .from(preparationSessions)
      .where(eq(preparationSessions.userId, userId))
      .orderBy(desc(preparationSessions.date));
  }

  async getPreparationSessionsByDateRange(userId: number, startDate: string, endDate: string): Promise<PreparationSession[]> {
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
    const [newSession] = await db
      .insert(preparationSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async updatePreparationSession(id: number, session: Partial<InsertPreparationSession>): Promise<PreparationSession> {
    const [updatedSession] = await db
      .update(preparationSessions)
      .set(session)
      .where(eq(preparationSessions.id, id))
      .returning();
    return updatedSession;
  }

  async deletePreparationSession(id: number): Promise<void> {
    await db.delete(preparationSessions).where(eq(preparationSessions.id, id));
  }

  // Interviews
  async getInterviews(userId: number): Promise<(Interview & { application: Application })[]> {
    return await db
      .select()
      .from(interviews)
      .innerJoin(applications, eq(interviews.applicationId, applications.id))
      .where(eq(interviews.userId, userId))
      .orderBy(desc(interviews.interviewDate));
  }

  async getInterview(id: number): Promise<Interview | undefined> {
    const [interview] = await db
      .select()
      .from(interviews)
      .where(eq(interviews.id, id));
    return interview || undefined;
  }

  async createInterview(interview: InsertInterview): Promise<Interview> {
    const [newInterview] = await db
      .insert(interviews)
      .values(interview)
      .returning();
    return newInterview;
  }

  async updateInterview(id: number, interview: Partial<InsertInterview>): Promise<Interview> {
    const [updatedInterview] = await db
      .update(interviews)
      .set({ ...interview, updatedAt: new Date() })
      .where(eq(interviews.id, id))
      .returning();
    return updatedInterview;
  }

  async deleteInterview(id: number): Promise<void> {
    await db.delete(interviews).where(eq(interviews.id, id));
  }

  // Assessments
  async getAssessments(userId: number): Promise<(Assessment & { interview: Interview & { application: Application } })[]> {
    return await db
      .select()
      .from(assessments)
      .innerJoin(interviews, eq(assessments.interviewId, interviews.id))
      .innerJoin(applications, eq(interviews.applicationId, applications.id))
      .where(eq(assessments.userId, userId))
      .orderBy(desc(assessments.createdAt));
  }

  async getAssessment(id: number): Promise<Assessment | undefined> {
    const [assessment] = await db
      .select()
      .from(assessments)
      .where(eq(assessments.id, id));
    return assessment || undefined;
  }

  async createAssessment(assessment: InsertAssessment): Promise<Assessment> {
    const [newAssessment] = await db
      .insert(assessments)
      .values(assessment)
      .returning();
    return newAssessment;
  }

  async updateAssessment(id: number, assessment: Partial<InsertAssessment>): Promise<Assessment> {
    const [updatedAssessment] = await db
      .update(assessments)
      .set(assessment)
      .where(eq(assessments.id, id))
      .returning();
    return updatedAssessment;
  }

  async deleteAssessment(id: number): Promise<void> {
    await db.delete(assessments).where(eq(assessments.id, id));
  }

  // Reminders
  async getReminders(userId: number): Promise<Reminder[]> {
    return await db
      .select()
      .from(reminders)
      .where(and(eq(reminders.userId, userId), eq(reminders.completed, false)))
      .orderBy(asc(reminders.dueDate));
  }

  async createReminder(reminder: InsertReminder): Promise<Reminder> {
    const [newReminder] = await db
      .insert(reminders)
      .values(reminder)
      .returning();
    return newReminder;
  }

  async updateReminder(id: number, reminder: Partial<InsertReminder>): Promise<Reminder> {
    const [updatedReminder] = await db
      .update(reminders)
      .set(reminder)
      .where(eq(reminders.id, id))
      .returning();
    return updatedReminder;
  }

  async deleteReminder(id: number): Promise<void> {
    await db.delete(reminders).where(eq(reminders.id, id));
  }

  // Analytics
  async getDashboardStats(userId: number): Promise<{
    totalApplications: number;
    activeInterviews: number;
    prepStreak: number;
    successRate: number;
  }> {
    const [totalApplicationsResult] = await db
      .select({ count: count() })
      .from(applications)
      .where(eq(applications.userId, userId));

    const [activeInterviewsResult] = await db
      .select({ count: count() })
      .from(interviews)
      .where(and(
        eq(interviews.userId, userId),
        eq(interviews.status, "Scheduled")
      ));

    const [offersResult] = await db
      .select({ count: count() })
      .from(applications)
      .where(and(
        eq(applications.userId, userId),
        eq(applications.jobStatus, "Offer")
      ));

    // Calculate prep streak (simplified - would need more complex logic for actual streak)
    const recentSessions = await db
      .select()
      .from(preparationSessions)
      .where(eq(preparationSessions.userId, userId))
      .orderBy(desc(preparationSessions.date))
      .limit(30);

    let prepStreak = 0;
    const today = new Date();
    for (const session of recentSessions) {
      const sessionDate = new Date(session.date);
      const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff === prepStreak) {
        prepStreak++;
      } else {
        break;
      }
    }

    const successRate = totalApplicationsResult.count > 0 
      ? Math.round((offersResult.count / totalApplicationsResult.count) * 100)
      : 0;

    return {
      totalApplications: totalApplicationsResult.count,
      activeInterviews: activeInterviewsResult.count,
      prepStreak,
      successRate,
    };
  }

  async getWeeklyPrepTime(userId: number): Promise<{ date: string; hours: number }[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const sessions = await db
      .select()
      .from(preparationSessions)
      .where(and(
        eq(preparationSessions.userId, userId),
        gte(preparationSessions.date, sevenDaysAgo.toISOString().split('T')[0])
      ))
      .orderBy(asc(preparationSessions.date));

    // Group by date and sum hours (assuming 1 hour per session for simplicity)
    const dailyHours: { [key: string]: number } = {};
    
    sessions.forEach(session => {
      const date = session.date;
      dailyHours[date] = (dailyHours[date] || 0) + 1;
    });

    // Fill in missing days with 0 hours
    const result = [];
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
  }

  async getConfidenceTrends(userId: number): Promise<{ topic: string; score: number }[]> {
    const result = await db
      .select({
        topic: preparationSessions.topic,
        avgScore: sql<number>`AVG(${preparationSessions.confidenceScore})::float`
      })
      .from(preparationSessions)
      .where(and(
        eq(preparationSessions.userId, userId),
        sql`${preparationSessions.confidenceScore} IS NOT NULL`
      ))
      .groupBy(preparationSessions.topic);

    return result.map(r => ({
      topic: r.topic,
      score: Math.round(r.avgScore * 10) / 10
    }));
  }
}

export const storage = new DatabaseStorage();
