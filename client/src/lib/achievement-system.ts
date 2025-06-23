// Achievement System - Complete implementation for gamification
export interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  points: number;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'streak' | 'application' | 'interview' | 'preparation' | 'milestone';
  progressCurrent: number;
  progressTarget: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
}

export const ACHIEVEMENT_TEMPLATES = {
  // Streak Achievements
  'first_streak': {
    title: '🔥 Getting Started',
    description: 'Complete your first day of activities',
    points: 10,
    icon: 'flame',
    rarity: 'common' as const,
    category: 'streak' as const,
    progressTarget: 1
  },
  'week_warrior': {
    title: '⚡ Week Warrior',
    description: 'Maintain a 7-day streak',
    points: 50,
    icon: 'zap',
    rarity: 'rare' as const,
    category: 'streak' as const,
    progressTarget: 7
  },
  'month_master': {
    title: '🏆 Month Master',
    description: 'Maintain a 30-day streak',
    points: 200,
    icon: 'trophy',
    rarity: 'epic' as const,
    category: 'streak' as const,
    progressTarget: 30
  },
  'streak_legend': {
    title: '👑 Streak Legend',
    description: 'Maintain a 100-day streak',
    points: 1000,
    icon: 'crown',
    rarity: 'legendary' as const,
    category: 'streak' as const,
    progressTarget: 100
  },

  // Application Achievements
  'first_application': {
    title: '📝 First Step',
    description: 'Submit your first job application',
    points: 15,
    icon: 'file-text',
    rarity: 'common' as const,
    category: 'application' as const,
    progressTarget: 1
  },
  'application_machine': {
    title: '⚙️ Application Machine',
    description: 'Submit 50 job applications',
    points: 100,
    icon: 'settings',
    rarity: 'rare' as const,
    category: 'application' as const,
    progressTarget: 50
  },
  'application_expert': {
    title: '🎯 Application Expert',
    description: 'Submit 100 job applications',
    points: 250,
    icon: 'target',
    rarity: 'epic' as const,
    category: 'application' as const,
    progressTarget: 100
  },

  // Interview Achievements
  'first_interview': {
    title: '🎤 Breaking the Ice',
    description: 'Complete your first interview',
    points: 25,
    icon: 'mic',
    rarity: 'common' as const,
    category: 'interview' as const,
    progressTarget: 1
  },
  'interview_pro': {
    title: '💼 Interview Pro',
    description: 'Complete 10 interviews',
    points: 150,
    icon: 'briefcase',
    rarity: 'rare' as const,
    category: 'interview' as const,
    progressTarget: 10
  },
  'offer_master': {
    title: '🎉 Offer Master',
    description: 'Receive your first job offer',
    points: 500,
    icon: 'party-popper',
    rarity: 'epic' as const,
    category: 'interview' as const,
    progressTarget: 1
  },

  // Preparation Achievements
  'study_buddy': {
    title: '📚 Study Buddy',
    description: 'Complete 10 preparation sessions',
    points: 75,
    icon: 'book',
    rarity: 'common' as const,
    category: 'preparation' as const,
    progressTarget: 10
  },
  'prep_master': {
    title: '🧠 Prep Master',
    description: 'Complete 100 preparation sessions',
    points: 300,
    icon: 'brain',
    rarity: 'epic' as const,
    category: 'preparation' as const,
    progressTarget: 100
  },

  // Milestone Achievements
  'level_10': {
    title: '🌟 Rising Star',
    description: 'Reach level 10',
    points: 100,
    icon: 'star',
    rarity: 'rare' as const,
    category: 'milestone' as const,
    progressTarget: 10
  },
  'level_25': {
    title: '🚀 High Achiever',
    description: 'Reach level 25',
    points: 250,
    icon: 'rocket',
    rarity: 'epic' as const,
    category: 'milestone' as const,
    progressTarget: 25
  },
  'level_50': {
    title: '💎 Elite Member',
    description: 'Reach level 50',
    points: 500,
    icon: 'diamond',
    rarity: 'legendary' as const,
    category: 'milestone' as const,
    progressTarget: 50
  },

  // Special Achievements
  'perfect_week': {
    title: '✨ Perfect Week',
    description: 'Complete all goals for 7 consecutive days',
    points: 100,
    icon: 'sparkles',
    rarity: 'rare' as const,
    category: 'streak' as const,
    progressTarget: 7
  },
  'early_bird': {
    title: '🌅 Early Bird',
    description: 'Complete activities before 9 AM for 5 days',
    points: 50,
    icon: 'sunrise',
    rarity: 'common' as const,
    category: 'milestone' as const,
    progressTarget: 5
  },
  'night_owl': {
    title: '🦉 Night Owl',
    description: 'Complete activities after 9 PM for 5 days',
    points: 50,
    icon: 'moon',
    rarity: 'common' as const,
    category: 'milestone' as const,
    progressTarget: 5
  }
};

export class AchievementSystem {
  static calculateLevel(totalPoints: number): number {
    // Level formula: every 100 points = 1 level, with exponential scaling
    return Math.floor(Math.sqrt(totalPoints / 50)) + 1;
  }

  static getPointsForNextLevel(currentLevel: number): number {
    return Math.pow(currentLevel, 2) * 50;
  }

  static getRarityColor(rarity: string): string {
    const colors = {
      common: 'text-gray-600 bg-gray-100',
      rare: 'text-blue-600 bg-blue-100',
      epic: 'text-purple-600 bg-purple-100',
      legendary: 'text-yellow-600 bg-yellow-100'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  }

  static getCategoryIcon(category: string): string {
    const icons = {
      streak: 'flame',
      application: 'file-text',
      interview: 'mic',
      preparation: 'book',
      milestone: 'star'
    };
    return icons[category as keyof typeof icons] || 'trophy';
  }

  static shouldUnlockAchievement(
    achievementType: string,
    userStats: {
      currentStreak: number;
      totalApplications: number;
      totalInterviews: number;
      totalPrepSessions: number;
      totalPoints: number;
      completedGoalsToday: number;
      perfectDaysThisWeek: number;
    }
  ): boolean {
    const template = ACHIEVEMENT_TEMPLATES[achievementType as keyof typeof ACHIEVEMENT_TEMPLATES];
    if (!template) return false;

    switch (achievementType) {
      case 'first_streak':
        return userStats.currentStreak >= 1;
      case 'week_warrior':
        return userStats.currentStreak >= 7;
      case 'month_master':
        return userStats.currentStreak >= 30;
      case 'streak_legend':
        return userStats.currentStreak >= 100;
      case 'first_application':
        return userStats.totalApplications >= 1;
      case 'application_machine':
        return userStats.totalApplications >= 50;
      case 'application_expert':
        return userStats.totalApplications >= 100;
      case 'first_interview':
        return userStats.totalInterviews >= 1;
      case 'interview_pro':
        return userStats.totalInterviews >= 10;
      case 'study_buddy':
        return userStats.totalPrepSessions >= 10;
      case 'prep_master':
        return userStats.totalPrepSessions >= 100;
      case 'level_10':
        return this.calculateLevel(userStats.totalPoints) >= 10;
      case 'level_25':
        return this.calculateLevel(userStats.totalPoints) >= 25;
      case 'level_50':
        return this.calculateLevel(userStats.totalPoints) >= 50;
      case 'perfect_week':
        return userStats.perfectDaysThisWeek >= 7;
      default:
        return false;
    }
  }

  static getPointsForActivity(activityType: string): number {
    const pointValues = {
      'applications': 10,
      'behavioral_prep': 5,
      'technical_prep': 8,
      'system_design': 8,
      'coding_practice': 6,
      'networking': 4,
      'skill_building': 6
    };
    return pointValues[activityType as keyof typeof pointValues] || 5;
  }
}