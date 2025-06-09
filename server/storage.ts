import { randomUUID } from 'crypto';
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
import { eq, desc, asc, and, gte, lte, count, sql, inArray } from "drizzle-orm";
import { cache } from "./cache";

// All IDs are strings (UUIDs)
type ID = string;

export interface IStorage {
  // Users
  getUsers(): Promise<User[]>;
  getUser(id: ID): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: ID, updates: Partial<InsertUser>): Promise<User>;
  
  // Applications
  getApplications(userId: ID, page?: number, limit?: number): Promise<{ totalCount: number; applications: Application[] }>;
  getApplication(id: ID): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: ID, application: Partial<InsertApplication>): Promise<Application>;
  deleteApplication(id: ID): Promise<void>;
  
  // Preparation Sessions
  getPreparationSessions(userId: ID): Promise<PreparationSession[]>;
  getPreparationSessionsByDateRange(userId: ID, startDate: string, endDate: string): Promise<PreparationSession[]>;
  createPreparationSession(session: InsertPreparationSession): Promise<PreparationSession>;
  updatePreparationSession(id: ID, session: Partial<InsertPreparationSession>): Promise<PreparationSession>;
  deletePreparationSession(id: ID): Promise<void>;
  
  // Interviews
  getInterviews(userId: ID): Promise<(Interview & { application: Application })[]>;
  getInterview(id: ID): Promise<Interview | undefined>;
  createInterview(interview: InsertInterview): Promise<Interview>;
  updateInterview(id: ID, interview: Partial<InsertInterview>): Promise<Interview>;
  deleteInterview(id: ID): Promise<void>;
  
  // Assessments
  getAssessments(userId: ID): Promise<(Assessment & { interview: Interview & { application: Application } })[]>;
  getAssessment(id: ID): Promise<Assessment | undefined>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  updateAssessment(id: ID, assessment: Partial<InsertAssessment>): Promise<Assessment>;
  deleteAssessment(id: ID): Promise<void>;
  
  // Reminders
  getReminders(userId: ID): Promise<Reminder[]>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: ID, reminder: Partial<InsertReminder>): Promise<Reminder>;
  deleteReminder(id: ID): Promise<void>;
  
  // Analytics
  getDashboardStats(userId: ID): Promise<{
    totalApplications: number;
    activeInterviews: number;
    prepStreak: number;
    successRate: number;
  }>;
  getWeeklyPrepTime(userId: ID): Promise<{ date: string; hours: number }[]>;
  getConfidenceTrends(userId: ID): Promise<{ topic: string; score: number }[]>;
}

export class DatabaseStorage implements IStorage {
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUser(id: ID): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user;
  }

  async updateUser(id: ID, updates: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      throw new Error(`User with ID ${id} not found`);
    }

    // Invalidate relevant caches
    try {
      await Promise.all([
        cache.del(cache.generateKey('user', id)),
        cache.del(cache.generateKey('user:email', updatedUser.email)),
        cache.del(cache.generateKey('user:username', updatedUser.username))
      ]);
    } catch (error) {
      console.error('Error updating user cache:', error);
      // Continue even if cache update fails
    }

    return updatedUser;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const userWithId = {
      ...insertUser,
      id: randomUUID()
    };
    
    const [newUser] = await db
      .insert(users)
      .values(userWithId)
      .returning();
    return newUser;
  }

  // Applications
  async getApplications(userId: ID, page = 1, limit = 10): Promise<{ totalCount: number; applications: Application[] }> {
    const startTime = Date.now();
    const cacheKey = `user:${userId}:applications:${page}:${limit}`;
    
    // Try to get from cache first
    const cached = await cache.get<{ totalCount: number; applications: Application[] }>(cacheKey);
    if (cached) {
      console.log(`Cache hit for applications (${cacheKey}), took ${Date.now() - startTime}ms`);
      return cached;
    }
    
    // If not in cache, fetch from database
    const dbStart = Date.now();

    // Use single query with window function for better performance
    const result = await db
      .select({
        id: applications.id,
        userId: applications.userId,
        dateApplied: applications.dateApplied,
        companyName: applications.companyName,
        roleTitle: applications.roleTitle,
        roleUrl: applications.roleUrl,
        jobStatus: applications.jobStatus,
        applicationStage: applications.applicationStage,
        resumeVersion: applications.resumeVersion,
        modeOfApplication: applications.modeOfApplication,
        followUpDate: applications.followUpDate,
        createdAt: applications.createdAt,
        updatedAt: applications.updatedAt,
        totalCount: sql<number>`count(*) over()`.as('total_count')
      })
      .from(applications)
      .where(eq(applications.userId, userId))
      .orderBy(desc(applications.dateApplied), desc(applications.createdAt))
      .limit(limit)
      .offset(page * limit);
    
    console.log(`DB query took ${Date.now() - dbStart}ms, total: ${Date.now() - startTime}ms`);
    
    // Extract totalCount from first row and clean up applications data
    const totalCount = result.length > 0 ? Number(result[0].totalCount) : 0;
    const applicationsList = result.map(({ totalCount: _, ...app }) => ({
      ...app,
      // Ensure dates are properly typed
      dateApplied: app.dateApplied ? new Date(app.dateApplied).toISOString().split('T')[0] : null,
      followUpDate: app.followUpDate ? new Date(app.followUpDate).toISOString().split('T')[0] : null,
      createdAt: app.createdAt instanceof Date ? app.createdAt : new Date(app.createdAt as string),
      updatedAt: app.updatedAt instanceof Date ? app.updatedAt : new Date(app.updatedAt as string)
    }));
    
    const response = { totalCount, applications: applicationsList as Application[] };
    
    // Cache for 5 minutes
    await cache.set(cacheKey, response, 300);
    return response;
  }

  async getApplication(id: ID): Promise<Application | undefined> {
    const [application] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, id));
    return application || undefined;
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    // Generate a new UUID for the application
    const applicationWithId = {
      ...application,
      id: randomUUID()
    };

    const [newApplication] = await db
      .insert(applications)
      .values(applicationWithId)
      .returning();
    
    try {
      // Invalidate user's applications cache
      await Promise.all([
        cache.del(cache.generateKey('applications', application.userId)),
        cache.del(cache.generateKey('dashboard:stats', application.userId))
      ]);
      
      return newApplication;
    } catch (error) {
      console.error('Error in createApplication:', error);
      throw new Error('Failed to create application');
    }
  }

  async updateApplication(id: ID, application: Partial<InsertApplication>): Promise<Application> {
    const [updatedApplication] = await db
      .update(applications)
      .set({ ...application, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    
    // Invalidate cache for this user's applications
    await cache.invalidatePattern(`applications:${updatedApplication.userId}:*`);
    
    return updatedApplication;
  }

  async deleteApplication(id: ID): Promise<void> {
    await db.delete(applications).where(eq(applications.id, id));
  }

  // Preparation Sessions
  async getPreparationSessions(userId: ID): Promise<PreparationSession[]> {
    return await db
      .select()
      .from(preparationSessions)
      .where(eq(preparationSessions.userId, userId))
      .orderBy(desc(preparationSessions.date));
  }

  async getPreparationSessionsByDateRange(userId: ID, startDate: string, endDate: string): Promise<PreparationSession[]> {
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

  async updatePreparationSession(id: ID, session: Partial<InsertPreparationSession>): Promise<PreparationSession> {
    const [updatedSession] = await db
      .update(preparationSessions)
      .set(session)
      .where(eq(preparationSessions.id, id))
      .returning();
    return updatedSession;
  }

  async deletePreparationSession(id: ID): Promise<void> {
    await db.delete(preparationSessions).where(eq(preparationSessions.id, id));
  }

  // Interviews
  async getInterviews(userId: ID): Promise<(Interview & { application: Application })[]> {
    const results = await db
      .select({
        interview: interviews,
        application: applications
      })
      .from(interviews)
      .innerJoin(applications, eq(interviews.applicationId, applications.id))
      .where(eq(interviews.userId, userId))
      .orderBy(desc(interviews.interviewDate));
    
    return results.map(row => ({
      ...row.interview,
      application: row.application
    }));
  }

  async getInterview(id: ID): Promise<Interview | undefined> {
    const [interview] = await db
      .select()
      .from(interviews)
      .where(eq(interviews.id, id));
    return interview || undefined;
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

  async updateInterview(id: ID, interview: Partial<InsertInterview>): Promise<Interview> {
    const [updatedInterview] = await db
      .update(interviews)
      .set({ ...interview, updatedAt: new Date() })
      .where(eq(interviews.id, id))
      .returning();
    return updatedInterview;
  }

  async deleteInterview(id: ID): Promise<void> {
    await db.delete(interviews).where(eq(interviews.id, id));
  }

  // Assessments
  async getAssessments(userId: ID): Promise<(Assessment & { interview: Interview & { application: Application } })[]> {
    const results = await db
      .select({
        assessment: assessments,
        interview: interviews,
        application: applications
      })
      .from(assessments)
      .innerJoin(interviews, eq(assessments.interviewId, interviews.id))
      .innerJoin(applications, eq(interviews.applicationId, applications.id))
      .where(eq(assessments.userId, userId))
      .orderBy(desc(assessments.createdAt));
    
    return results.map(row => ({
      ...row.assessment,
      interview: {
        ...row.interview,
        application: row.application
      }
    }));
  }

  async getAssessment(id: ID): Promise<Assessment | undefined> {
    const [assessment] = await db
      .select()
      .from(assessments)
      .where(eq(assessments.id, id));
    return assessment || undefined;
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

  async updateAssessment(id: ID, assessment: Partial<InsertAssessment>): Promise<Assessment> {
    const [updatedAssessment] = await db
      .update(assessments)
      .set(assessment)
      .where(eq(assessments.id, id))
      .returning();
    return updatedAssessment;
  }

  async deleteAssessment(id: ID): Promise<void> {
    await db.delete(assessments).where(eq(assessments.id, id));
  }

  // Reminders
  async getReminders(userId: ID): Promise<Reminder[]> {
    return await db
      .select()
      .from(reminders)
      .where(and(eq(reminders.userId, userId), eq(reminders.completed, false)))
      .orderBy(asc(reminders.dueDate));
  }

  async createReminder(reminder: InsertReminder): Promise<Reminder> {
    const reminderWithId = {
      ...reminder,
      id: randomUUID()
    };
    
    const [newReminder] = await db
      .insert(reminders)
      .values(reminderWithId)
      .returning();
    return newReminder;
  }

  async updateReminder(id: ID, reminder: Partial<InsertReminder>): Promise<Reminder> {
    const [updatedReminder] = await db
      .update(reminders)
      .set(reminder)
      .where(eq(reminders.id, id))
      .returning();
    return updatedReminder;
  }

  async deleteReminder(id: ID): Promise<void> {
    await db.delete(reminders).where(eq(reminders.id, id));
  }

  // Analytics
  async getDashboardStats(userId: ID): Promise<{
    totalApplications: number;
    activeInterviews: number;
    prepStreak: number;
    successRate: number;
  }> {
    const [totalApplicationsResult] = await db
      .select({ count: count() })
      .from(applications)
      .where(eq(applications.userId, userId));

    // Updated logic for activeInterviews
    const interviewStages = ["HR Round", "HM Round", "Panel", "Case Study"];
    const [activeInterviewsResult] = await db
      .select({ count: count() })
      .from(applications)
      .where(and(
        eq(applications.userId, userId),
        eq(applications.jobStatus, "Active"),
        inArray(applications.applicationStage, interviewStages)
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

  async getWeeklyPrepTime(userId: ID): Promise<{ date: string; hours: number }[]> {
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

  async getConfidenceTrends(userId: ID): Promise<{ topic: string; score: number }[]> {
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
