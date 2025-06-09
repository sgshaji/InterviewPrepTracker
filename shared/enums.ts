// Application statuses
export enum ApplicationStatus {
  Applied = 'Applied',
  InProgress = 'In Progress',
  Rejected = 'Rejected',
  Offer = 'Offer'
}

// Interview stages
export enum InterviewStage {
  HrRound = 'HR Round',
  HmRound = 'HM Round',
  Technical = 'Technical',
  SystemDesign = 'System Design',
  CaseStudy = 'Case Study',
  Panel = 'Panel',
  Final = 'Final',
  Other = 'Other'
}

// Interview statuses
export enum InterviewStatus {
  Scheduled = 'Scheduled',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Rescheduled = 'Rescheduled'
}

// Reminder types
export enum ReminderType {
  FollowUp = 'follow-up',
  Prep = 'prep',
  Assessment = 'assessment',
  Other = 'other'
}

// Difficulty levels
export enum DifficultyLevel {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
  VeryHard = 'Very Hard'
}

// Confidence scores (1-5)
export enum ConfidenceScore {
  VeryLow = 1,
  Low = 2,
  Medium = 3,
  High = 4,
  VeryHigh = 5
}
