import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertApplicationSchema, 
  insertPreparationSessionSchema, 
  insertInterviewSchema, 
  insertAssessmentSchema,
  insertReminderSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Mock user ID for demo purposes - in real app would come from authentication
  const getCurrentUserId = () => 1;

  // Applications endpoints
  app.get("/api/applications", async (req, res) => {
    try {
      const userId = getCurrentUserId();
      const applications = await storage.getApplications(userId);
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.post("/api/applications", async (req, res) => {
    try {
      const userId = getCurrentUserId();
      const validatedData = insertApplicationSchema.parse({
        ...req.body,
        userId,
        dateApplied: req.body.dateApplied || new Date().toISOString().split('T')[0]
      });
      
      const application = await storage.createApplication(validatedData);
      res.status(201).json(application);
    } catch (error) {
      console.error("Error creating application:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid application data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create application", error: error.message });
      }
    }
  });

  app.put("/api/applications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertApplicationSchema.partial().parse(req.body);
      
      const application = await storage.updateApplication(id, validatedData);
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
      const { email, enableAlerts, missedDaysThreshold, reminderTime } = req.body;
      
      const settings = {
        userId: getCurrentUserId(),
        email,
        enableAlerts,
        missedDaysThreshold,
        reminderTime,
        createdAt: new Date().toISOString()
      };
      
      console.log('Email settings saved:', settings);
      res.json({ success: true, settings });
    } catch (error) {
      console.error("Error saving email settings:", error);
      res.status(500).json({ error: "Failed to save email settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
