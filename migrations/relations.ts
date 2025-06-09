import { relations } from "drizzle-orm/relations";
import { users, applications, interviews, assessments, preparationSessions, reminders, topics } from "./schema";

export const applicationsRelations = relations(applications, ({one, many}) => ({
	user: one(users, {
		fields: [applications.userId],
		references: [users.id]
	}),
	interviews: many(interviews),
}));

export const usersRelations = relations(users, ({many}) => ({
	applications: many(applications),
	assessments: many(assessments),
	interviews: many(interviews),
	preparationSessions: many(preparationSessions),
	reminders: many(reminders),
	topics: many(topics),
}));

export const assessmentsRelations = relations(assessments, ({one}) => ({
	interview: one(interviews, {
		fields: [assessments.interviewId],
		references: [interviews.id]
	}),
	user: one(users, {
		fields: [assessments.userId],
		references: [users.id]
	}),
}));

export const interviewsRelations = relations(interviews, ({one, many}) => ({
	assessments: many(assessments),
	application: one(applications, {
		fields: [interviews.applicationId],
		references: [applications.id]
	}),
	user: one(users, {
		fields: [interviews.userId],
		references: [users.id]
	}),
}));

export const preparationSessionsRelations = relations(preparationSessions, ({one}) => ({
	user: one(users, {
		fields: [preparationSessions.userId],
		references: [users.id]
	}),
}));

export const remindersRelations = relations(reminders, ({one}) => ({
	user: one(users, {
		fields: [reminders.userId],
		references: [users.id]
	}),
}));

export const topicsRelations = relations(topics, ({one}) => ({
	user: one(users, {
		fields: [topics.userId],
		references: [users.id]
	}),
}));