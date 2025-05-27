import { pgTable, text, serial, integer, boolean, timestamp, date, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),a
  name: text("name").notNull(),
  role: text("role"),
  isAdmin: boolean("is_admin").notNull().default(false),
  subscriptionStatus: text("subscription_status").notNull().default("inactive"), // inactive, active, canceled
  stripeCustomerId: text("stripe_customer_id"),
  subscriptionId: text("subscription_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  dateApplied: date("date_applied").notNull(),
  companyName: text("company_name").notNull(),
  roleTitle: text("role_title").notNull(),
  roleUrl: text("role_url"),
  jobStatus: text("job_status").notNull().default("Applied"), // Applied, In Progress, Rejected, Offer
  applicationStage: text("application_stage").notNull().default("In Review"), // In Review, HR Round, HM Round, Case Study, Panel, Offer, Rejected
  resumeVersion: text("resume_version"),
  modeOfApplication: text("mode_of_application"), // LinkedIn, Site, Referral
  followUpDate: date("follow_up_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const preparationSessions = pgTable("preparation_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  topic: text("topic").notNull(), // Behavioral, Product Thinking, Analytical Thinking, Product Portfolio
  resourceLink: text("resource_link"),
  confidenceScore: integer("confidence_score"), // 1-5
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  applicationId: integer("application_id").notNull().references(() => applications.id),
  interviewStage: text("interview_stage").notNull(), // HR Round, HM Round, Panel, Case Study, etc.
  interviewDate: timestamp("interview_date"),
  status: text("status").notNull().default("Scheduled"), // Scheduled, Completed, Cancelled
  prepResources: text("prep_resources"),
  assignedTasks: text("assigned_tasks"),
  feedbackNotes: text("feedback_notes"),
  interviewScore: integer("interview_score"), // 1-5
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  interviewId: integer("interview_id").notNull().references(() => interviews.id),
  score: integer("score"), // 1-5
  difficultyLevel: text("difficulty_level"),
  whatWentWell: text("what_went_well"),
  whatFellShort: text("what_fell_short"),
  questionsAsked: text("questions_asked"),
  yourQuestions: text("your_questions"),
  followUpNeeded: boolean("follow_up_needed").default(false),
  timeToNextRound: text("time_to_next_round"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // follow-up, prep, assessment
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date").notNull(),
  completed: boolean("completed").default(false),
  relatedId: integer("related_id"), // Can reference applications, interviews, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  applications: many(applications),
  preparationSessions: many(preparationSessions),
  interviews: many(interviews),
  assessments: many(assessments),
  reminders: many(reminders),
}));

export const applicationsRelations = relations(applications, ({ one, many }) => ({
  user: one(users, { fields: [applications.userId], references: [users.id] }),
  interviews: many(interviews),
}));

export const preparationSessionsRelations = relations(preparationSessions, ({ one }) => ({
  user: one(users, { fields: [preparationSessions.userId], references: [users.id] }),
}));

export const interviewsRelations = relations(interviews, ({ one, many }) => ({
  user: one(users, { fields: [interviews.userId], references: [users.id] }),
  application: one(applications, { fields: [interviews.applicationId], references: [applications.id] }),
  assessments: many(assessments),
}));

export const assessmentsRelations = relations(assessments, ({ one }) => ({
  user: one(users, { fields: [assessments.userId], references: [users.id] }),
  interview: one(interviews, { fields: [assessments.interviewId], references: [interviews.id] }),
}));

export const remindersRelations = relations(reminders, ({ one }) => ({
  user: one(users, { fields: [reminders.userId], references: [users.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  isAdmin: true,
  stripeCustomerId: true,
  subscriptionId: true,
}).extend({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPreparationSessionSchema = createInsertSchema(preparationSessions).omit({
  id: true,
  createdAt: true,
});

export const insertInterviewSchema = createInsertSchema(interviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssessmentSchema = createInsertSchema(assessments).omit({
  id: true,
  createdAt: true,
});

export const insertReminderSchema = createInsertSchema(reminders).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

export type PreparationSession = typeof preparationSessions.$inferSelect;
export type InsertPreparationSession = z.infer<typeof insertPreparationSessionSchema>;

export type Interview = typeof interviews.$inferSelect;
export type InsertInterview = z.infer<typeof insertInterviewSchema>;

export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;

export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = z.infer<typeof insertReminderSchema>;
