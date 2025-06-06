export const JOB_STATUSES = [
  "Applied",
  "In Progress", 
  "Rejected",
  "Offer"
] as const;

export const APPLICATION_STAGES = [
  "No Callback",
  "In Review",
  "HR Round",
  "Hiring Manager Round",
  "Case Study/Assignment",
  "Panel Interview",
  "Final Round",
  "Offer"
] as const;

export const ROLE_TITLES = [
  "Product Manager",
  "Senior Product Manager", 
  "Product Owner",
  "Staff Product Manager",
  "Principal Product Manager"
] as const;

export const ROLE_OPTIONS = ROLE_TITLES;

export const MODES_OF_APPLICATION = [
  "LinkedIn",
  "Company Site",
  "Referral",
  "Recruiter",
  "Job Board"
] as const;

export const PREPARATION_TOPICS = [
  "Behavioral",
  "Product Thinking",
  "Analytical Thinking",
  "Product Portfolio",
  "Technical Skills",
  "System Design",
  "Case Studies"
] as const;

export const INTERVIEW_STAGES = [
  "HR Round",
  "HM Round",
  "Panel Interview",
  "Case Study",
  "Technical Round",
  "Final Round",
  "Culture Fit"
] as const;

export const INTERVIEW_STATUSES = [
  "Scheduled",
  "Completed",
  "Cancelled",
  "Rescheduled"
] as const;

export const DIFFICULTY_LEVELS = [
  "Easy",
  "Medium", 
  "Hard",
  "Very Hard"
] as const;
