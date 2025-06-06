import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { cache } from "./cache";
import { 
  insertApplicationSchema, 
  insertPreparationSessionSchema, 
  insertInterviewSchema, 
  insertAssessmentSchema,
  insertReminderSchema 
} from "@shared/schema";
import { z } from "zod";
import { validateDatabaseInput, asyncHandler, requestLogger } from "./middleware";
import compression from "compression";
import { eq, and, inArray, sql, desc, count, or } from "drizzle-orm";
import { db } from "./db";
import { applications } from '../shared/schema';
import { spawn } from 'child_process';
import path from 'path';

export async function registerRoutes(app: Express): Promise<Server> {
  // Enable compression
  app.use(compression());

  // Mock user ID for demo purposes - in real app would come from authentication
  const getCurrentUserId = () => 1;

  // Company logo API endpoint
  app.get("/api/company-logo/:company", async (req, res) => {
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
  app.get('/api/logo/:companyName', async (req, res) => {
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
  app.get("/api/applications", async (req, res) => {
    try {
      const userId = getCurrentUserId();
      const page = Math.max(0, parseInt(req.query.page as string) || 0);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
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

  app.post("/api/applications", async (req, res) => {
    try {
      const userId = getCurrentUserId();
      
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

  app.put("/api/applications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      let data = { ...req.body };
      
      // Auto-populate "No Callback" stage for Applied status with blank stage
      if (data.jobStatus === "Applied" && (!data.applicationStage || data.applicationStage.trim() === "")) {
        data.applicationStage = "No Callback";
      }
      
      // Auto-sync jobStatus with applicationStage
      if (data.applicationStage) {
        data.jobStatus = getStatusForStage(data.applicationStage, data.jobStatus || "Applied");
      }
      
      const validatedData = insertApplicationSchema.partial().parse(data);
      const application = await storage.updateApplication(id, validatedData);
      
      // Invalidate applications cache for this user
      const userId = getCurrentUserId();
      await cache.invalidatePattern(`applications:${userId}:*`);
      
      res.json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid application data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update application" });
      }
    }
  });

  app.delete("/api/applications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteApplication(id);
      
      // Invalidate applications cache for this user
      const userId = getCurrentUserId();
      await cache.invalidatePattern(`applications:${userId}:*`);
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete application" });
    }
  });

  // Preparation sessions endpoints
  app.get("/api/preparation-sessions", async (req, res) => {
    try {
      const userId = getCurrentUserId();
      const sessions = await storage.getPreparationSessions(userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch preparation sessions" });
    }
  });

  app.post("/api/preparation-sessions", async (req, res) => {
    try {
      const userId = getCurrentUserId();
      const validatedData = insertPreparationSessionSchema.parse({
        ...req.body,
        userId,
        date: req.body.date || new Date().toISOString().split('T')[0]
      });
      
      const session = await storage.createPreparationSession(validatedData);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid preparation session data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create preparation session" });
      }
    }
  });

  app.put("/api/preparation-sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPreparationSessionSchema.partial().parse(req.body);
      
      const session = await storage.updatePreparationSession(id, validatedData);
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid preparation session data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update preparation session" });
      }
    }
  });

  app.delete("/api/preparation-sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePreparationSession(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete preparation session" });
    }
  });

  // Interviews endpoints
  app.get("/api/interviews", async (req, res) => {
    try {
      const userId = getCurrentUserId();
      const interviews = await storage.getInterviews(userId);
      res.json(interviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch interviews" });
    }
  });

  app.post("/api/interviews", async (req, res) => {
    try {
      const userId = getCurrentUserId();
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

  app.put("/api/interviews/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertInterviewSchema.partial().parse(req.body);
      
      const interview = await storage.updateInterview(id, validatedData);
      res.json(interview);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid interview data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update interview" });
      }
    }
  });

  app.delete("/api/interviews/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteInterview(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete interview" });
    }
  });

  // Assessments endpoints
  app.get("/api/assessments", async (req, res) => {
    try {
      const userId = getCurrentUserId();
      const assessments = await storage.getAssessments(userId);
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assessments" });
    }
  });

  app.post("/api/assessments", async (req, res) => {
    try {
      const userId = getCurrentUserId();
      const validatedData = insertAssessmentSchema.parse({
        ...req.body,
        userId
      });
      
      const assessment = await storage.createAssessment(validatedData);
      res.status(201).json(assessment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid assessment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create assessment" });
      }
    }
  });

  app.put("/api/assessments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertAssessmentSchema.partial().parse(req.body);
      
      const assessment = await storage.updateAssessment(id, validatedData);
      res.json(assessment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid assessment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update assessment" });
      }
    }
  });

  app.delete("/api/assessments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAssessment(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete assessment" });
    }
  });

  // Dashboard analytics endpoints
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const userId = getCurrentUserId();
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/prep-time", async (req, res) => {
    try {
      const userId = getCurrentUserId();
      const prepTime = await storage.getWeeklyPrepTime(userId);
      res.json(prepTime);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch prep time data" });
    }
  });

  app.get("/api/dashboard/confidence-trends", async (req, res) => {
    try {
      const userId = getCurrentUserId();
      const confidenceTrends = await storage.getConfidenceTrends(userId);
      res.json(confidenceTrends);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch confidence trends" });
    }
  });

  // Reminders endpoints
  app.get("/api/reminders", async (req, res) => {
    try {
      const userId = getCurrentUserId();
      const reminders = await storage.getReminders(userId);
      res.json(reminders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reminders" });
    }
  });

  app.post("/api/reminders", async (req, res) => {
    try {
      const userId = getCurrentUserId();
      const validatedData = insertReminderSchema.parse({
        ...req.body,
        userId
      });
      
      const reminder = await storage.createReminder(validatedData);
      res.status(201).json(reminder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid reminder data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create reminder" });
      }
    }
  });

  // Email notification endpoints
  app.post("/api/email-settings", async (req, res) => {
    try {
      const { 
        email, 
        enableDailyReminders, 
        enableCongratulations, 
        reminderTimes, 
        reminderTemplate, 
        congratsTemplate 
      } = req.body;
      
      const settings = {
        userId: getCurrentUserId(),
        email,
        enableDailyReminders,
        enableCongratulations,
        reminderTimes,
        reminderTemplate,
        congratsTemplate,
        createdAt: new Date().toISOString()
      };
      
      // Save to notification scheduler
      const { saveEmailSettings } = await import('./notification-scheduler');
      saveEmailSettings(getCurrentUserId(), req.body);
      
      console.log('✅ Email settings saved for user:', getCurrentUserId());
      res.json({ success: true, settings });
    } catch (error) {
      console.error("Error saving email settings:", error);
      res.status(500).json({ success: false, error: "Failed to save email settings" });
    }
  });

  // Test email endpoint
  app.post("/api/test-email", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ success: false, error: "Email is required" });
      }

      const { sendEmail } = await import('./email-service');
      const success = await sendEmail({
        to: email,
        from: 'noreply@yourapp.com',
        subject: '🧪 Test Email from Interview Prep Dashboard',
        text: `Hello!\n\nThis is a test email from your Interview Preparation Dashboard.\n\nIf you're receiving this, your email notifications are working perfectly!\n\nBest regards,\nInterview Prep Team`,
        html: `
          <h2>🧪 Test Email Success!</h2>
          <p>Hello!</p>
          <p>This is a test email from your <strong>Interview Preparation Dashboard</strong>.</p>
          <p>If you're receiving this, your email notifications are working perfectly!</p>
          <br>
          <p>Best regards,<br>
          <strong>Interview Prep Team</strong></p>
        `
      });

      res.json({ success });
    } catch (error) {
      console.error("Test email error:", error);
      res.status(500).json({ success: false, error: "Failed to send email" });
    }
  });

  app.post("/api/check-prep-reminders", async (req, res) => {
    try {
      const { sendPrepReminder, checkMissedPreparation } = await import('./email-service');
      
      const userId = getCurrentUserId();
      const sessions = await storage.getPreparationSessions(userId);
      const user = await storage.getUser(userId);
      
      // Get today's date
      const today = new Date().toISOString().split('T')[0];
      
      // Default prep topics (in real app, these would be user-configurable)
      const prepTopics = ["Behavioral", "Product Thinking", "Analytical Thinking", "Product Portfolio"];
      
      // Check for missing preparation
      const missingCategories = checkMissedPreparation(sessions, prepTopics, today);
      
      if (missingCategories.length > 0) {
        // In a real app, you'd get these from stored user settings
        const defaultEmailSettings = {
          email: req.body.email || 'user@example.com',
          template: req.body.template || `Subject: Missing Preparation Entry for {date}

Hi {userName},

We noticed you haven't filled in your preparation log for today, {date}. Here's what's missing:

{missingCategories}

Take 5 minutes to reflect and fill in your prep log to stay consistent.

You've got this!
– Interview Prep Tracker`
        };
        
        const success = await sendPrepReminder({
          userName: user?.username || 'there',
          email: defaultEmailSettings.email,
          date: today,
          missingCategories,
          template: defaultEmailSettings.template
        });
        
        res.json({ 
          success, 
          missingCategories, 
          message: success ? 'Reminder email sent successfully' : 'Failed to send reminder email'
        });
      } else {
        res.json({ 
          success: true, 
          missingCategories: [], 
          message: 'All preparation categories completed for today' 
        });
      }
    } catch (error) {
      console.error("Error checking prep reminders:", error);
      res.status(500).json({ error: "Failed to check prep reminders" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
