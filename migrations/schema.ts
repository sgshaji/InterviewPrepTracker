import { pgTable, foreignKey, serial, date, text, timestamp, uuid, integer, boolean, unique } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const applications = pgTable("applications", {
	id: serial().primaryKey().notNull(),
	dateApplied: date("date_applied").notNull(),
	companyName: text("company_name").notNull(),
	roleTitle: text("role_title").notNull(),
	roleUrl: text("role_url"),
	jobStatus: text("job_status").default('Applied').notNull(),
	applicationStage: text("application_stage").default('In Review').notNull(),
	resumeVersion: text("resume_version"),
	modeOfApplication: text("mode_of_application"),
	followUpDate: date("follow_up_date"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	userId: uuid("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "applications_user_id_fkey"
		}),
]);

export const assessments = pgTable("assessments", {
	id: serial().primaryKey().notNull(),
	interviewId: integer("interview_id").notNull(),
	score: integer(),
	difficultyLevel: text("difficulty_level"),
	whatWentWell: text("what_went_well"),
	whatFellShort: text("what_fell_short"),
	questionsAsked: text("questions_asked"),
	yourQuestions: text("your_questions"),
	followUpNeeded: boolean("follow_up_needed").default(false),
	timeToNextRound: text("time_to_next_round"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	userId: uuid("user_id"),
}, (table) => [
	foreignKey({
			columns: [table.interviewId],
			foreignColumns: [interviews.id],
			name: "assessments_interview_id_interviews_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "assessments_user_id_fkey"
		}).onDelete("cascade"),
]);

export const interviews = pgTable("interviews", {
	id: serial().primaryKey().notNull(),
	applicationId: integer("application_id").notNull(),
	interviewStage: text("interview_stage").notNull(),
	interviewDate: timestamp("interview_date", { mode: 'string' }),
	status: text().default('Scheduled').notNull(),
	prepResources: text("prep_resources"),
	assignedTasks: text("assigned_tasks"),
	feedbackNotes: text("feedback_notes"),
	interviewScore: integer("interview_score"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	userId: uuid("user_id"),
}, (table) => [
	foreignKey({
			columns: [table.applicationId],
			foreignColumns: [applications.id],
			name: "interviews_application_id_applications_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "interviews_user_id_fkey"
		}).onDelete("cascade"),
]);

export const preparationSessions = pgTable("preparation_sessions", {
	id: serial().primaryKey().notNull(),
	date: date().notNull(),
	topic: text().notNull(),
	resourceLink: text("resource_link"),
	confidenceScore: integer("confidence_score"),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	userId: uuid("user_id"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "preparation_sessions_user_id_fkey"
		}).onDelete("cascade"),
]);

export const reminders = pgTable("reminders", {
	id: serial().primaryKey().notNull(),
	type: text().notNull(),
	title: text().notNull(),
	description: text(),
	dueDate: timestamp("due_date", { mode: 'string' }).notNull(),
	completed: boolean().default(false),
	relatedId: integer("related_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	userId: uuid("user_id"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "reminders_user_id_fkey"
		}).onDelete("cascade"),
]);

export const users = pgTable("users", {
	username: text().notNull(),
	password: text().notNull(),
	name: text().notNull(),
	role: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	email: text().notNull(),
	isAdmin: boolean("is_admin").default(false).notNull(),
	subscriptionStatus: text("subscription_status").default('inactive').notNull(),
	stripeCustomerId: text("stripe_customer_id"),
	subscriptionId: text("subscription_id"),
	id: uuid().primaryKey().notNull(),
}, (table) => [
	unique("users_username_unique").on(table.username),
	unique("users_email_unique").on(table.email),
]);

export const topics = pgTable("topics", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	newUserid: uuid("new_userid").notNull(),
	userId: uuid("user_id"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "topics_user_id_fkey"
		}).onDelete("cascade"),
]);

export const applicationsBackup = pgTable("applications_backup", {
	id: integer(),
	userId: integer("user_id"),
	dateApplied: date("date_applied"),
	companyName: text("company_name"),
	roleTitle: text("role_title"),
	roleUrl: text("role_url"),
	jobStatus: text("job_status"),
	applicationStage: text("application_stage"),
	resumeVersion: text("resume_version"),
	modeOfApplication: text("mode_of_application"),
	followUpDate: date("follow_up_date"),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const topicsBackup = pgTable("topics_backup", {
	id: integer(),
	userId: integer("user_id"),
	name: text(),
	createdAt: timestamp("created_at", { mode: 'string' }),
});

export const assessmentsBackup = pgTable("assessments_backup", {
	id: integer(),
	userId: integer("user_id"),
	interviewId: integer("interview_id"),
	score: integer(),
	difficultyLevel: text("difficulty_level"),
	whatWentWell: text("what_went_well"),
	whatFellShort: text("what_fell_short"),
	questionsAsked: text("questions_asked"),
	yourQuestions: text("your_questions"),
	followUpNeeded: boolean("follow_up_needed"),
	timeToNextRound: text("time_to_next_round"),
	createdAt: timestamp("created_at", { mode: 'string' }),
});

export const interviewsBackup = pgTable("interviews_backup", {
	id: integer(),
	userId: integer("user_id"),
	applicationId: integer("application_id"),
	interviewStage: text("interview_stage"),
	interviewDate: timestamp("interview_date", { mode: 'string' }),
	status: text(),
	prepResources: text("prep_resources"),
	assignedTasks: text("assigned_tasks"),
	feedbackNotes: text("feedback_notes"),
	interviewScore: integer("interview_score"),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const preparationSessionsBackup = pgTable("preparation_sessions_backup", {
	id: integer(),
	userId: integer("user_id"),
	date: date(),
	topic: text(),
	resourceLink: text("resource_link"),
	confidenceScore: integer("confidence_score"),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }),
});

export const remindersBackup = pgTable("reminders_backup", {
	id: integer(),
	userId: integer("user_id"),
	type: text(),
	title: text(),
	description: text(),
	dueDate: timestamp("due_date", { mode: 'string' }),
	completed: boolean(),
	relatedId: integer("related_id"),
	createdAt: timestamp("created_at", { mode: 'string' }),
});

export const usersBackup = pgTable("users_backup", {
	id: integer(),
	username: text(),
	password: text(),
	name: text(),
	role: text(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	email: text(),
	isAdmin: boolean("is_admin"),
	subscriptionStatus: text("subscription_status"),
	stripeCustomerId: text("stripe_customer_id"),
	subscriptionId: text("subscription_id"),
});
