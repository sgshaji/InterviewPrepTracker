import { pgTable, uuid, text, timestamp, integer, boolean, date, serial } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Reference to Supabase auth.users table for foreign key relationships
// This table is managed by Supabase and exists in the auth schema
export const authUsers = pgTable('auth.users', {
  id: uuid('id').primaryKey(),
  email: text('email'),
});

// Zod schema for the User, ensuring the ID is treated as a UUID string.
export const userSchema = createSelectSchema(authUsers, {
  id: z.string().uuid("Invalid UUID for user ID"),
});
export const insertUserSchema = createInsertSchema(authUsers, {
  id: z.string().uuid("Invalid UUID for user ID"),
});

// APPLICATION TRACKING
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  dateApplied: date("date_applied").notNull(),
  companyName: text("company_name").notNull(),
  roleTitle: text("role_title").notNull(),
  roleUrl: text("role_url"),
  jobStatus: text("job_status").notNull().default("Applied"),
  applicationStage: text("application_stage").notNull().default("In Review"),
  resumeVersion: text("resume_version"),
  modeOfApplication: text("mode_of_application"),
  followUpDate: date("follow_up_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// INTERVIEWS
export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  applicationId: integer("application_id").notNull().references(() => applications.id, { onDelete: 'cascade' }),
  interviewStage: text("interview_stage").notNull(),
  interviewDate: timestamp("interview_date"),
  status: text("status").notNull().default("Scheduled"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// PREPARATION
export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const preparationSessions = pgTable("preparation_sessions", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  topicId: integer("topic_id").notNull().references(() => topics.id, { onDelete: 'cascade' }),
  date: date("date").notNull(),
  resourceLink: text("resource_link"),
  confidenceScore: integer("confidence_score"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ASSESSMENTS & REMINDERS
export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  interviewId: integer("interview_id").notNull().references(() => interviews.id, { onDelete: 'cascade' }),
  score: integer("score"),
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
  userId: uuid("user_id").notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date").notNull(),
  completed: boolean("completed").default(false),
  relatedId: text("related_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// STREAKS & GAMIFICATION SYSTEM
export const streaks = pgTable("streaks", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActivityDate: date("last_activity_date"),
  totalPoints: integer("total_points").notNull().default(0),
  level: integer("level").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// DAILY GOALS
export const dailyGoals = pgTable("daily_goals", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  goalType: text("goal_type").notNull(), // 'applications', 'behavioral_prep', 'technical_prep', 'system_design', 'coding_practice'
  targetCount: integer("target_count").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// DAILY ACTIVITIES
export const dailyActivities = pgTable("daily_activities", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  activityDate: date("activity_date").notNull(),
  goalType: text("goal_type").notNull(),
  completedCount: integer("completed_count").notNull().default(0),
  targetCount: integer("target_count").notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  pointsEarned: integer("points_earned").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ACHIEVEMENTS
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  achievementType: text("achievement_type").notNull(), // 'first_application', 'week_streak', 'month_streak', 'level_up', etc.
  title: text("title").notNull(),
  description: text("description"),
  pointsAwarded: integer("points_awarded").notNull().default(0),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
});


// --- ZOD SCHEMAS ---

// Base schemas for validation, aligning with PG types
const numberIdSchema = {
  id: z.number(),
};

const foreignKeysSchema = {
  userId: z.string().uuid("Invalid user UUID"),
  applicationId: z.number().optional(),
  interviewId: z.number().optional(),
  topicId: z.number().optional(),
};

// Application Schemas
export const applicationSchema = createSelectSchema(applications, {
  ...numberIdSchema,
  userId: foreignKeysSchema.userId,
  dateApplied: z.string(),
  followUpDate: z.string().nullable(),
  createdAt: z.string(),      // ✅ override default z.date()
  updatedAt: z.string(),      // ✅ override default z.date()
});

export const insertApplicationSchema = createInsertSchema(applications, {
  userId: foreignKeysSchema.userId,
  dateApplied: z.string(),
  followUpDate: z.string().nullable().optional(),
  companyName: z.string().min(1, "Company name is required"),
  roleTitle: z.string().min(1, "Role title is required"),
}).omit({ id: true, createdAt: true, updatedAt: true });
export const updateApplicationSchema = insertApplicationSchema.partial();

// Interview Schemas
export const interviewSchema = createSelectSchema(interviews, {
  ...numberIdSchema,
  userId: foreignKeysSchema.userId,
  applicationId: z.number(),
  interviewDate: z.preprocess((val) => (val ? new Date(val as string).toISOString() : null), z.string().nullable()),
});
export const insertInterviewSchema = createInsertSchema(interviews, {
  userId: foreignKeysSchema.userId,
  applicationId: z.number(),
}).omit({ id: true, createdAt: true, updatedAt: true });
export const updateInterviewSchema = insertInterviewSchema.partial();

// Topic Schemas
export const topicSchema = createSelectSchema(topics, { 
  ...numberIdSchema,
  userId: foreignKeysSchema.userId 
});
export const insertTopicSchema = createInsertSchema(topics, {
  userId: foreignKeysSchema.userId,
  name: z.string().min(1, "Topic name is required").max(100),
}).omit({ id: true, createdAt: true, updatedAt: true });
export const updateTopicSchema = insertTopicSchema.partial();

// Preparation Session Schemas
export const preparationSessionSchema = createSelectSchema(preparationSessions, {
  ...numberIdSchema,
  userId: foreignKeysSchema.userId,
  topicId: z.number(),
  date: z.string(),
});
export const insertPreparationSessionSchema = createInsertSchema(preparationSessions, {
  userId: foreignKeysSchema.userId,
  topicId: z.number(),
  date: z.string(),
}).omit({ id: true, createdAt: true });
export const updatePreparationSessionSchema = insertPreparationSessionSchema.partial();

// Assessment Schemas
export const assessmentSchema = createSelectSchema(assessments, {
  ...numberIdSchema,
  userId: foreignKeysSchema.userId,
  interviewId: z.number(),
});
export const insertAssessmentSchema = createInsertSchema(assessments, {
  userId: foreignKeysSchema.userId,
  interviewId: z.number(),
}).omit({ id: true, createdAt: true });
export const updateAssessmentSchema = insertAssessmentSchema.partial();

// Reminder Schemas
export const reminderSchema = createSelectSchema(reminders, {
  ...numberIdSchema,
  userId: foreignKeysSchema.userId,
  dueDate: z.string(),
});
export const insertReminderSchema = createInsertSchema(reminders, {
  userId: foreignKeysSchema.userId,
  dueDate: z.string(),
}).omit({ id: true, createdAt: true });
export const updateReminderSchema = insertReminderSchema.partial();

// Streak Schemas
export const streakSchema = createSelectSchema(streaks, {
  ...numberIdSchema,
  userId: foreignKeysSchema.userId,
  lastActivityDate: z.string().nullable(),
});
export const insertStreakSchema = createInsertSchema(streaks, {
  userId: foreignKeysSchema.userId,
}).omit({ id: true, createdAt: true, updatedAt: true });
export const updateStreakSchema = insertStreakSchema.partial();

// Daily Goal Schemas
export const dailyGoalSchema = createSelectSchema(dailyGoals, {
  ...numberIdSchema,
  userId: foreignKeysSchema.userId,
});
export const insertDailyGoalSchema = createInsertSchema(dailyGoals, {
  userId: foreignKeysSchema.userId,
  goalType: z.enum(['applications', 'behavioral_prep', 'technical_prep', 'system_design', 'coding_practice']),
}).omit({ id: true, createdAt: true, updatedAt: true });
export const updateDailyGoalSchema = insertDailyGoalSchema.partial();

// Daily Activity Schemas
export const dailyActivitySchema = createSelectSchema(dailyActivities, {
  ...numberIdSchema,
  userId: foreignKeysSchema.userId,
  activityDate: z.string(),
});
export const insertDailyActivitySchema = createInsertSchema(dailyActivities, {
  userId: foreignKeysSchema.userId,
  activityDate: z.string(),
  goalType: z.enum(['applications', 'behavioral_prep', 'technical_prep', 'system_design', 'coding_practice']),
}).omit({ id: true, createdAt: true, updatedAt: true });
export const updateDailyActivitySchema = insertDailyActivitySchema.partial();

// Achievement Schemas
export const achievementSchema = createSelectSchema(achievements, {
  ...numberIdSchema,
  userId: foreignKeysSchema.userId,
  unlockedAt: z.string(),
});
export const insertAchievementSchema = createInsertSchema(achievements, {
  userId: foreignKeysSchema.userId,
}).omit({ id: true, unlockedAt: true });


// --- RELATIONS ---

export const authUsersRelations = relations(authUsers, ({ many }) => ({
  applications: many(applications),
  interviews: many(interviews),
  topics: many(topics),
  preparationSessions: many(preparationSessions),
  assessments: many(assessments),
  reminders: many(reminders),
}));

export const applicationsRelations = relations(applications, ({ one, many }) => ({
  user: one(authUsers, { fields: [applications.userId], references: [authUsers.id] }),
  interviews: many(interviews),
}));

export const interviewsRelations = relations(interviews, ({ one, many }) => ({
  user: one(authUsers, { fields: [interviews.userId], references: [authUsers.id] }),
  application: one(applications, { fields: [interviews.applicationId], references: [applications.id] }),
  assessments: many(assessments),
}));

export const topicsRelations = relations(topics, ({ one, many }) => ({
  user: one(authUsers, { fields: [topics.userId], references: [authUsers.id] }),
  preparationSessions: many(preparationSessions),
}));

export const preparationSessionsRelations = relations(preparationSessions, ({ one }) => ({
  user: one(authUsers, { fields: [preparationSessions.userId], references: [authUsers.id] }),
  topic: one(topics, { fields: [preparationSessions.topicId], references: [topics.id] }),
}));

export const assessmentsRelations = relations(assessments, ({ one }) => ({
  user: one(authUsers, { fields: [assessments.userId], references: [authUsers.id] }),
  interview: one(interviews, { fields: [assessments.interviewId], references: [interviews.id] }),
}));

export const remindersRelations = relations(reminders, ({ one }) => ({
  user: one(authUsers, { fields: [reminders.userId], references: [authUsers.id] }),
}));


// --- TYPES ---

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Application = z.infer<typeof applicationSchema>;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

export type Interview = z.infer<typeof interviewSchema>;
export type InsertInterview = z.infer<typeof insertInterviewSchema>;

export type Topic = z.infer<typeof topicSchema>;
export type InsertTopic = z.infer<typeof insertTopicSchema>;

export type PreparationSession = z.infer<typeof preparationSessionSchema>;
export type InsertPreparationSession = z.infer<typeof insertPreparationSessionSchema>;

export type Assessment = z.infer<typeof assessmentSchema>;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;

export type Reminder = z.infer<typeof reminderSchema>;
export type InsertReminder = z.infer<typeof insertReminderSchema>;

// Custom user type including potential metadata fields for client-side use
export type AppUser = User & {
  username?: string;
  fullName?: string;
  avatar?: string;
  role?: string;
  subscriptionStatus?: string;
};
