import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { cache } from "./cache";
import { 
  insertApplicationSchema, 
  insertPreparationSessionSchema, 
  insertInterviewSchema, 
  insertAssessmentSchema,
  insertReminderSchema,
  insertTopicSchema 
} from "@shared/schema";
import { z } from "zod";
import { validateDatabaseInput, asyncHandler, requestLogger } from "./middleware";
import compression from "compression";
import { eq, and, inArray, sql, desc, count, or } from "drizzle-orm";
import { db } from "./db";
import { applications, topics, preparationSessions } from '../shared/schema';
import { spawn } from 'child_process';
import path from 'path';
import { requireAuth, getCurrentUserId } from './supabase-auth';

const numericIdParam = z.object({
  id: z.preprocess(
    (val) => parseInt(z.string().parse(val), 10),
    z.number().positive("ID must be a positive number")
  ),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Enable compression
  app.use(compression());

  // Company logo API endpoint
  app.get("/api/company-logo/:company", async (req: Request, res: Response) => {
    try {
      const companyName = decodeURIComponent(req.params.company);
      if (!companyName || companyName.trim() === '') {
        return res.status(400).json({ error: 'Company name is required' });
      }

      // Cache key for logo data
      const cacheKey = cache.generateKey('logo', companyName.toLowerCase());
      const cached = await cache.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      // Execute Python logo service
      const pythonScript = path.join(process.cwd(), 'server', 'logo-service.py');
      const pythonProcess = spawn('python3', [pythonScript, companyName]);
      
      let output = '';
      let error = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      pythonProcess.on('close', async (code) => {
        if (code === 0 && output) {
          try {
            const result = JSON.parse(output.trim());
            // Cache for 24 hours
            await cache.set(cacheKey, result, 86400);
            res.json(result);
          } catch (parseError) {
            res.status(500).json({ error: 'Failed to parse logo data' });
          }
        } else {
          // Fallback to initials
          const initials = companyName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
          const colors = ['3B82F6', '10B981', '8B5CF6', 'F59E0B', 'EF4444', '6366F1'];
          const colorIndex = companyName.length % colors.length;
          const fallback = {
            url: `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${colors[colorIndex]}&color=fff&size=128&rounded=true&bold=true`,
            source: 'initials',
            initials
          };
          await cache.set(cacheKey, fallback, 86400);
          res.json(fallback);
        }
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        pythonProcess.kill();
        const initials = companyName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
        const fallback = {
          url: `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=6366F1&color=fff&size=128&rounded=true&bold=true`,
          source: 'timeout',
          initials
        };
        res.json(fallback);
      }, 10000);

    } catch (error) {
      console.error('Logo API error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  function getStatusForStage(stage: string, currentStatus: string): string {
    if (["HR Round", "HM Round", "Panel", "Case Study"].includes(stage)) return "In Progress";
    if (stage === "Rejected") return "Rejected";
    if (stage === "Offer") return "Offer";
    return currentStatus;
  }

  // Company logo endpoint with caching
  app.get('/api/logo/:companyName', async (req: Request, res: Response) => {
    try {
      const { CompanyLogoService } = await import('./logo-cache')
      const companyName = decodeURIComponent(req.params.companyName)
      const logoData = await CompanyLogoService.getCompanyLogo(companyName)
      
      res.set('Cache-Control', 'public, max-age=86400') // 24 hours
      res.json(logoData)
    } catch (error) {
      console.error('Logo service error:', error)
      res.status(500).json({ error: 'Failed to get logo' })
    }
  })

  // Applications endpoints
  app.get("/api/applications", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      const page = Math.max(0, parseInt(req.query.page as string) || 0);
      const limit = Math.min(10000, Math.max(1, parseInt(req.query.limit as string) || 50));
      const interviewing = req.query.interviewing === "true";
      const search = req.query.search as string | undefined;

      // Generate cache key based on query parameters
      const cacheKey = cache.generateKey('applications', userId.toString(), page.toString(), limit.toString(), interviewing ? '1' : '0', search || '');
      
      // Try to get from cache first
      const cached = await cache.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const interviewStages = ["HR Round", "HM Round", "Panel", "Case Study"];

      const whereConditions = [
        eq(applications.userId, userId),
        interviewing ? eq(applications.jobStatus, "Active") : undefined,
        interviewing ? inArray(applications.applicationStage, interviewStages) : undefined,
        typeof search === "string" && search.trim() !== ""
          ? or(
              sql`${applications.companyName} ILIKE '%' || ${search} || '%'`,
              sql`${applications.roleTitle} ILIKE '%' || ${search} || '%'`
            )
          : undefined
      ].filter(Boolean);

      const whereClause = and(...whereConditions);

      const [totalCountResult] = await db
        .select({ count: count() })
        .from(applications)
        .where(whereClause);

      const apps = await db
        .select()
        .from(applications)
        .where(whereClause)
        .orderBy(desc(applications.createdAt))
        .limit(limit)
        .offset(page * limit);

      const result = { totalCount: totalCountResult.count, applications: apps };
      
      // Cache the result for 5 minutes (300 seconds)
      await cache.set(cacheKey, result, 300);
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.post("/api/applications", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      // Remove id field if it exists to prevent conflicts
      const { id, ...bodyData } = req.body;
      
      let data = {
        ...bodyData,
        userId,
        dateApplied: bodyData.dateApplied || new Date().toISOString().split('T')[0]
      };
      
      // Auto-populate "No Callback" stage for Applied status with blank stage
      if (data.jobStatus === "Applied" && (!data.applicationStage || data.applicationStage.trim() === "")) {
        data.applicationStage = "No Callback";
      }
      
      // Auto-sync jobStatus with applicationStage
      if (data.applicationStage) {
        data.jobStatus = getStatusForStage(data.applicationStage, data.jobStatus || "Applied");
      }
      
      const parsed = insertApplicationSchema.safeParse(data);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid application data", errors: parsed.error.errors });
      }
      const validatedData = parsed.data;
      const application = await storage.createApplication(validatedData);
      
      // Invalidate applications cache for this user
      await cache.invalidatePattern(`applications:${userId}:*`);
      
      res.status(201).json(application);
    } catch (error: unknown) {
      console.error("Error creating application:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid application data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create application", error: error instanceof Error ? error.message : "Unknown error" });
      }
    }
  });

  app.put("/api/applications/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Forbidden" });
      }

      const validation = numericIdParam.safeParse(req.params);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid application ID", details: validation.error.flatten() });
      }
      const applicationId = validation.data.id;
      
      // Ownership check
      const existingApplication = await storage.getApplication(applicationId.toString());
      if (!existingApplication || existingApplication.userId !== userId) {
        return res.status(403).json({ error: "Forbidden: You do not own this resource" });
      }

      let dataToUpdate = { ...req.body };
      if ('id' in dataToUpdate) {
        delete dataToUpdate.id;
      }
      
      // Auto-sync jobStatus with applicationStage
      if (dataToUpdate.applicationStage) {
        dataToUpdate.jobStatus = getStatusForStage(dataToUpdate.applicationStage, dataToUpdate.jobStatus || "Applied");
      }
      
      // Validate and update
      const validatedUpdateData = insertApplicationSchema.partial().parse(dataToUpdate);
      const updatedApplication = await storage.updateApplication(applicationId.toString(), validatedUpdateData);
      
      // Invalidate relevant cache
      await cache.invalidatePattern(`applications:${userId}:*`);
      
      res.json(updatedApplication);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update application" });
    }
  });

  app.delete("/api/applications/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Forbidden" });
      }

      const validation = numericIdParam.safeParse(req.params);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid application ID", details: validation.error.flatten() });
      }
      const applicationId = validation.data.id;

      // Ownership check
      const existingApplication = await storage.getApplication(applicationId.toString());
      if (!existingApplication || existingApplication.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      await storage.deleteApplication(applicationId.toString());
      
      // Invalidate cache
      await cache.invalidatePattern(`applications:${userId}:*`);

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete application" });
    }
  });

  // Preparation sessions endpoints
  app.get("/api/preparation-sessions", requireAuth, asyncHandler(async (req, res) => {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const topicFilter = req.query.topic as string | undefined;

    const whereClauses = [eq(preparationSessions.userId, userId)];
    if (topicFilter) {
      const topicId = parseInt(topicFilter, 10);
      if (!isNaN(topicId)) {
        whereClauses.push(eq(preparationSessions.topicId, topicId));
      }
    }

    const sessions = await db.select()
      .from(preparationSessions)
      .where(and(...whereClauses))
      .orderBy(desc(preparationSessions.date));
      
    res.json(sessions);
  }));

  app.get("/api/preparation-sessions/by-date", requireAuth, async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate and endDate are required" });
    }

    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      const sessions = await storage.getPreparationSessionsByDateRange(
        userId,
        startDate as string,
        endDate as string
      );
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to get sessions" });
    }
  });

  app.post("/api/preparation-sessions", requireAuth, validateDatabaseInput(insertPreparationSessionSchema), asyncHandler(async (req, res) => {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const parsed = insertPreparationSessionSchema.safeParse({ ...req.body, userId });

    if (!parsed.success) {
      res.status(400).json({ message: "Invalid session data", errors: parsed.error.flatten() });
      return;
    }
    
    const newSession = await storage.createPreparationSession(parsed.data);
    res.status(201).json(newSession);
  }));

  app.put("/api/preparation-sessions/:id", requireAuth, asyncHandler(async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const validation = numericIdParam.safeParse(req.params);
      if (!validation.success) {
        return res.status(400).json({ error: 'Invalid session ID', details: validation.error.flatten() });
      }
      const sessionId = validation.data.id;

      const updatedSession = await storage.updatePreparationSession(sessionId.toString(), req.body);
      res.json(updatedSession);
    } catch (error) {
      res.status(500).json({ message: "Failed to update preparation session" });
    }
  }));

  app.delete("/api/preparation-sessions/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const validation = numericIdParam.safeParse(req.params);
      if (!validation.success) {
        return res.status(400).json({ error: 'Invalid session ID', details: validation.error.flatten() });
      }
      const sessionId = validation.data.id;

      await storage.deletePreparationSession(sessionId.toString());
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete preparation session" });
    }
  });

  // Topics endpoints
  app.get("/api/topics", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      const userTopics = await db
        .select()
        .from(topics)
        .where(eq(topics.userId, userId))
        .orderBy(desc(topics.createdAt));
      res.json(userTopics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch topics" });
    }
  });

  app.post("/api/topics", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      const data = { ...req.body, userId };
      const parsed = insertTopicSchema.safeParse(data);

      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid topic data", errors: parsed.error.errors });
      }

      const [newTopic] = await db.insert(topics).values(parsed.data).returning();
      res.status(201).json(newTopic);
    } catch (error) {
      res.status(500).json({ message: "Failed to create topic" });
    }
  });

  app.delete("/api/topics/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const validation = numericIdParam.safeParse(req.params);
      if (!validation.success) {
        res.status(400).json({ error: "Invalid topic ID", details: validation.error.flatten() });
        return;
      }
      const topicId = validation.data.id;

      // Check if topic exists and belongs to user
      const [topic] = await db
        .select()
        .from(topics)
        .where(and(
          eq(topics.id, topicId),
          eq(topics.userId, userId)
        ));

      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }

      // Check if topic is being used in preparation sessions
      const usedInSessions = await db
      .select({ count: count() })
      .from(preparationSessions)
      .where(and(
        eq(preparationSessions.userId, userId),
        eq(preparationSessions.topicId, topicId)
      ));


      if (usedInSessions[0].count > 0) {
        return res.status(400).json({ 
          message: "Cannot delete topic that is being used in preparation sessions" 
        });
      }

      await db
        .delete(topics)
        .where(and(
          eq(topics.id, topicId),
          eq(topics.userId, userId)
        ));

      // Invalidate cache
      const cacheKey = cache.generateKey('topics', userId.toString());
      await cache.del(cacheKey);

      res.status(204).send();
    } catch (error) {
      console.error('Topic deletion error:', error);
      res.status(500).json({ message: "Failed to delete topic" });
    }
  });

  // Interviews endpoints
  app.get("/api/interviews", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      const interviews = await storage.getInterviews(userId, req.query);
      res.json(interviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch interviews" });
    }
  });

  app.post("/api/interviews", async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      const validatedData = insertInterviewSchema.parse({
        ...req.body,
        userId
      });
      
      const interview = await storage.createInterview(validatedData);
      res.status(201).json(interview);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid interview data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create interview" });
      }
    }
  });

  app.put("/api/interviews/:id", async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Forbidden" });
      }

      const validation = numericIdParam.safeParse(req.params);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid interview ID", details: validation.error.flatten() });
      }
      const interviewId = validation.data.id;

      const data = { ...req.body, userId };

      // Ownership check
      const existingInterview = await storage.getInterview(interviewId.toString());
      if (!existingInterview || existingInterview.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const updatedInterview = await storage.updateInterview(interviewId.toString(), data);
      
      // Invalidate relevant caches
      if (updatedInterview) {
        await cache.invalidatePattern(`applications:${userId}:*`);
        await cache.invalidatePattern(`interviews:${userId}:*`);
      }

      res.json(updatedInterview);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid interview data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update interview" });
      }
    }
  });

  app.delete("/api/interviews/:id", async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Forbidden" });
      }

      const validation = numericIdParam.safeParse(req.params);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid interview ID", details: validation.error.flatten() });
      }
      const interviewId = validation.data.id;

      // Ownership check
      const existingInterview = await storage.getInterview(interviewId.toString());
      if (!existingInterview || existingInterview.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      await storage.deleteInterview(interviewId.toString());

      // Invalidate relevant caches
      await cache.invalidatePattern(`applications:${userId}:*`);
      await cache.invalidatePattern(`interviews:${userId}:*`);

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete interview" });
    }
  });

  // Assessments endpoints
  app.get("/api/assessments", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      const assessments = await storage.getAssessments(userId);
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assessments" });
    }
  });

  app.post("/api/assessments", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      // Parse the request body using the main insertion schema.
      // insertAssessmentSchema should define the expected shape of an assessment from the client.
      const parsedBody = insertAssessmentSchema.parse(req.body);

      // Construct the final payload for creation, ensuring the authenticated userId is used.
      // This overrides any userId that might have been in req.body and parsed by the schema,
      // or adds it if the schema doesn't include userId.
      const payloadForCreate = {
        ...parsedBody,
        userId // This is the non-null userId from getCurrentUserId & check
      };
      
      const assessment = await storage.createAssessment(payloadForCreate);
      res.status(201).json(assessment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid assessment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create assessment" });
      }
    }
  });

  app.put("/api/assessments/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Forbidden" });
      }

      const validation = numericIdParam.safeParse(req.params);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid assessment ID", details: validation.error.flatten() });
      }
      const assessmentId = validation.data.id;

      // Ownership check
      const existingAssessment = await storage.getAssessment(assessmentId.toString());
      if (!existingAssessment || existingAssessment.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const assessment = await storage.updateAssessment(assessmentId.toString(), { ...req.body, userId });
      res.json(assessment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid assessment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update assessment" });
      }
    }
  });

  app.delete("/api/assessments/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Forbidden" });
      }

      const validation = numericIdParam.safeParse(req.params);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid assessment ID", details: validation.error.flatten() });
      }
      const assessmentId = validation.data.id;

      // Ownership check
      const existingAssessment = await storage.getAssessment(assessmentId.toString());
      if (!existingAssessment || existingAssessment.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      await storage.deleteAssessment(assessmentId.toString());
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete assessment" });
    }
  });

  // Dashboard analytics endpoints
  app.get("/api/dashboard/stats", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/prep-time", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      const weeklyPrepTime = await storage.getWeeklyPrepTime(userId);
      res.json(weeklyPrepTime);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weekly prep time" });
    }
  });

  app.get("/api/dashboard/confidence-trends", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      const confidenceTrends = await storage.getConfidenceTrends(userId);
      res.json(confidenceTrends);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch confidence trends" });
    }
  });

  // User settings
  app.get("/api/user/settings", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      // This is a placeholder. You'd fetch user-specific settings from your DB.
      // Since we removed the custom users table, you might store settings in a
      // new 'user_settings' table linked by userId, or in Supabase's user_metadata.
      res.json({
        id: userId,
        // email: user.email, // Can't get this easily on server without another lookup
        notifications: true,
        theme: "light",
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user settings" });
    }
  });

  app.put("/api/user/settings", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      const settings = req.body;
      // Placeholder for updating user settings.
      console.log(`Updating settings for user ${userId}:`, settings);
      res.json({ message: "Settings updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user settings" });
    }
  });

  app.get("/api/preparation-sessions/summary", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const summary = await db
        .select({
          topic: preparationSessions.topicId,
          count: count(preparationSessions.id),
          latestDate: sql`MAX(${preparationSessions.date})`.as('latestDate'),
          avgConfidence: sql`AVG(${preparationSessions.confidenceScore})`.as('avgConfidence')
        })
        .from(preparationSessions)
        .where(eq(preparationSessions.userId, userId))
        .groupBy(preparationSessions.topicId)
        .orderBy(desc(sql`MAX(${preparationSessions.date})`));

      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Failed to get preparation summary" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}