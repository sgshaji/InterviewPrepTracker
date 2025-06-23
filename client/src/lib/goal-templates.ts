// Goal Templates and Presets for Quick Setup
export interface GoalTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  goals: {
    goalType: string;
    targetCount: number;
    description: string;
  }[];
  estimatedTimePerDay: number; // minutes
  tags: string[];
}

export const GOAL_TEMPLATES: GoalTemplate[] = [
  {
    id: 'job_search_sprint',
    name: 'Job Search Sprint',
    description: 'Intensive daily routine for active job seekers',
    category: 'job_search',
    difficulty: 'medium',
    estimatedTimePerDay: 120,
    tags: ['applications', 'networking', 'active'],
    goals: [
      {
        goalType: 'applications',
        targetCount: 3,
        description: 'Apply to 3 quality positions daily'
      },
      {
        goalType: 'networking',
        targetCount: 2,
        description: 'Connect with 2 professionals on LinkedIn'
      },
      {
        goalType: 'skill_building',
        targetCount: 1,
        description: 'Complete 1 skill-building activity'
      }
    ]
  },
  {
    id: 'interview_prep_intensive',
    name: 'Interview Prep Intensive',
    description: 'Focused preparation for upcoming interviews',
    category: 'preparation',
    difficulty: 'hard',
    estimatedTimePerDay: 90,
    tags: ['interviews', 'preparation', 'practice'],
    goals: [
      {
        goalType: 'behavioral_prep',
        targetCount: 2,
        description: 'Practice 2 behavioral questions'
      },
      {
        goalType: 'technical_prep',
        targetCount: 1,
        description: 'Complete 1 technical challenge'
      },
      {
        goalType: 'system_design',
        targetCount: 1,
        description: 'Study 1 system design concept'
      }
    ]
  },
  {
    id: 'steady_explorer',
    name: 'Steady Explorer',
    description: 'Balanced approach for long-term job search',
    category: 'balanced',
    difficulty: 'easy',
    estimatedTimePerDay: 45,
    tags: ['sustainable', 'balanced', 'long-term'],
    goals: [
      {
        goalType: 'applications',
        targetCount: 1,
        description: 'Apply to 1 quality position daily'
      },
      {
        goalType: 'networking',
        targetCount: 1,
        description: 'Make 1 professional connection'
      },
      {
        goalType: 'skill_building',
        targetCount: 1,
        description: 'Learn something new for 30 minutes'
      }
    ]
  },
  {
    id: 'coding_bootcamp_grad',
    name: 'Coding Bootcamp Graduate',
    description: 'Tailored for recent coding bootcamp graduates',
    category: 'technical',
    difficulty: 'medium',
    estimatedTimePerDay: 105,
    tags: ['technical', 'coding', 'portfolio'],
    goals: [
      {
        goalType: 'applications',
        targetCount: 2,
        description: 'Apply to 2 entry-level positions'
      },
      {
        goalType: 'coding_practice',
        targetCount: 2,
        description: 'Solve 2 coding problems'
      },
      {
        goalType: 'technical_prep',
        targetCount: 1,
        description: 'Review 1 technical concept'
      }
    ]
  },
  {
    id: 'senior_professional',
    name: 'Senior Professional',
    description: 'Strategic approach for experienced professionals',
    category: 'strategic',
    difficulty: 'medium',
    estimatedTimePerDay: 60,
    tags: ['senior', 'strategic', 'selective'],
    goals: [
      {
        goalType: 'applications',
        targetCount: 1,
        description: 'Apply to 1 carefully selected position'
      },
      {
        goalType: 'networking',
        targetCount: 3,
        description: 'Engage with 3 industry contacts'
      },
      {
        goalType: 'behavioral_prep',
        targetCount: 1,
        description: 'Prepare leadership examples'
      }
    ]
  },
  {
    id: 'career_changer',
    name: 'Career Changer',
    description: 'For professionals transitioning to a new field',
    category: 'transition',
    difficulty: 'hard',
    estimatedTimePerDay: 90,
    tags: ['career-change', 'learning', 'networking'],
    goals: [
      {
        goalType: 'skill_building',
        targetCount: 2,
        description: 'Build 2 new skills daily'
      },
      {
        goalType: 'networking',
        targetCount: 2,
        description: 'Connect with people in target industry'
      },
      {
        goalType: 'applications',
        targetCount: 1,
        description: 'Apply with tailored resume/cover letter'
      }
    ]
  },
  {
    id: 'minimal_maintenance',
    name: 'Minimal Maintenance',
    description: 'Light activity to keep momentum while employed',
    category: 'passive',
    difficulty: 'easy',
    estimatedTimePerDay: 20,
    tags: ['employed', 'passive', 'minimal'],
    goals: [
      {
        goalType: 'networking',
        targetCount: 1,
        description: 'Maintain 1 professional connection'
      },
      {
        goalType: 'skill_building',
        targetCount: 1,
        description: 'Read industry news for 15 minutes'
      }
    ]
  },
  {
    id: 'custom_starter',
    name: 'Custom Goals',
    description: 'Start with basic goals and customize as needed',
    category: 'custom',
    difficulty: 'medium',
    estimatedTimePerDay: 60,
    tags: ['custom', 'flexible', 'starter'],
    goals: [
      {
        goalType: 'applications',
        targetCount: 2,
        description: 'Submit quality applications'
      },
      {
        goalType: 'behavioral_prep',
        targetCount: 1,
        description: 'Practice interview questions'
      }
    ]
  }
];

export const GOAL_TYPE_CONFIGS = {
  applications: {
    icon: '📝',
    name: 'Job Applications',
    description: 'Submit quality job applications',
    pointsPerActivity: 10,
    estimatedTimeMinutes: 30,
    tips: [
      'Customize your resume for each position',
      'Write a compelling cover letter',
      'Research the company beforehand',
      'Save job posting details for follow-up'
    ]
  },
  behavioral_prep: {
    icon: '💭',
    name: 'Behavioral Prep',
    description: 'Practice behavioral interview questions',
    pointsPerActivity: 5,
    estimatedTimeMinutes: 20,
    tips: [
      'Use the STAR method (Situation, Task, Action, Result)',
      'Prepare specific examples for common questions',
      'Practice out loud or with a friend',
      'Focus on leadership and problem-solving examples'
    ]
  },
  technical_prep: {
    icon: '⚙️',
    name: 'Technical Prep',
    description: 'Study technical concepts and skills',
    pointsPerActivity: 8,
    estimatedTimeMinutes: 45,
    tips: [
      'Focus on technologies mentioned in job postings',
      'Build small projects to demonstrate skills',
      'Review fundamentals regularly',
      'Stay updated with industry trends'
    ]
  },
  system_design: {
    icon: '🏗️',
    name: 'System Design',
    description: 'Study system design concepts',
    pointsPerActivity: 8,
    estimatedTimeMinutes: 40,
    tips: [
      'Practice drawing system architectures',
      'Understand scalability principles',
      'Study real-world system examples',
      'Focus on trade-offs and decision-making'
    ]
  },
  coding_practice: {
    icon: '💻',
    name: 'Coding Practice',
    description: 'Solve coding problems and challenges',
    pointsPerActivity: 6,
    estimatedTimeMinutes: 35,
    tips: [
      'Start with easy problems and build confidence',
      'Focus on clean, readable code',
      'Explain your thought process out loud',
      'Practice different algorithmic patterns'
    ]
  },
  networking: {
    icon: '🤝',
    name: 'Professional Networking',
    description: 'Build and maintain professional relationships',
    pointsPerActivity: 4,
    estimatedTimeMinutes: 15,
    tips: [
      'Personalize connection requests',
      'Engage with posts and share insights',
      'Attend virtual industry events',
      'Follow up with new connections'
    ]
  },
  skill_building: {
    icon: '📚',
    name: 'Skill Building',
    description: 'Learn new skills or improve existing ones',
    pointsPerActivity: 6,
    estimatedTimeMinutes: 30,
    tips: [
      'Choose skills aligned with your target roles',
      'Take online courses or tutorials',
      'Build projects to practice new skills',
      'Share your learning journey publicly'
    ]
  }
};

export const DIFFICULTY_CONFIGS = {
  easy: {
    name: 'Easy',
    description: 'Light daily commitment (20-45 minutes)',
    color: 'green',
    timeRange: '20-45 min/day',
    streakFlexibility: 2 // Allow 2 missed days per week
  },
  medium: {
    name: 'Medium',
    description: 'Moderate daily commitment (45-90 minutes)',
    color: 'yellow',
    timeRange: '45-90 min/day',
    streakFlexibility: 1 // Allow 1 missed day per week
  },
  hard: {
    name: 'Hard',
    description: 'Intensive daily commitment (90+ minutes)',
    color: 'red',
    timeRange: '90+ min/day',
    streakFlexibility: 0 // No missed days allowed
  }
};