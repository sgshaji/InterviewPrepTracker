import { Router } from 'express';
import { storage } from '../storage';
import { asyncHandler } from '../middleware';
import { AchievementSystem, ACHIEVEMENT_TEMPLATES } from '../../client/src/lib/achievement-system';

const router = Router();

// Streaks endpoints
router.get('/streaks', asyncHandler(async (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }

  try {
    const streak = await storage.getStreak(userId);
    res.json(streak);
  } catch (error) {
    console.error('Error fetching streak:', error);
    res.status(500).json({ error: 'Failed to fetch streak data' });
  }
}));

router.put('/streaks', asyncHandler(async (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }

  try {
    const updatedStreak = await storage.updateStreak(userId, req.body);
    res.json(updatedStreak);
  } catch (error) {
    console.error('Error updating streak:', error);
    res.status(500).json({ error: 'Failed to update streak' });
  }
}));

// Daily Goals endpoints
router.get('/daily-goals', asyncHandler(async (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }

  try {
    const goals = await storage.getDailyGoals(userId);
    res.json(goals);
  } catch (error) {
    console.error('Error fetching daily goals:', error);
    res.status(500).json({ error: 'Failed to fetch daily goals' });
  }
}));

router.post('/daily-goals', asyncHandler(async (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }

  try {
    const goalData = {
      ...req.body,
      userId
    };
    
    const newGoal = await storage.createDailyGoal(goalData);
    res.status(201).json(newGoal);
  } catch (error) {
    console.error('Error creating daily goal:', error);
    res.status(500).json({ error: 'Failed to create daily goal' });
  }
}));

router.put('/daily-goals/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    const updatedGoal = await storage.updateDailyGoal(id, req.body);
    res.json(updatedGoal);
  } catch (error) {
    console.error('Error updating daily goal:', error);
    res.status(500).json({ error: 'Failed to update daily goal' });
  }
}));

router.delete('/daily-goals/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    await storage.deleteDailyGoal(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting daily goal:', error);
    res.status(500).json({ error: 'Failed to delete daily goal' });
  }
}));

// Daily Activities endpoints
router.get('/daily-activities', asyncHandler(async (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  const date = req.query.date as string;
  
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }

  try {
    const activities = await storage.getDailyActivities(userId, date);
    res.json(activities);
  } catch (error) {
    console.error('Error fetching daily activities:', error);
    res.status(500).json({ error: 'Failed to fetch daily activities' });
  }
}));

router.post('/daily-activities', asyncHandler(async (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }

  try {
    const activityData = {
      ...req.body,
      userId,
      pointsEarned: AchievementSystem.getPointsForActivity(req.body.goalType)
    };
    
    const newActivity = await storage.createDailyActivity(activityData);
    
    // Update streak and check achievements
    const currentStreak = await storage.getStreak(userId);
    const today = new Date().toISOString().split('T')[0];
    
    // Update streak logic
    if (currentStreak.lastActivityDate !== today) {
      const newStreakCount = currentStreak.currentStreak + 1;
      const newTotalPoints = currentStreak.totalPoints + activityData.pointsEarned;
      const newLevel = AchievementSystem.calculateLevel(newTotalPoints);
      
      await storage.updateStreak(userId, {
        currentStreak: newStreakCount,
        longestStreak: Math.max(currentStreak.longestStreak, newStreakCount),
        lastActivityDate: today,
        totalPoints: newTotalPoints,
        level: newLevel
      });
    }
    
    res.status(201).json(newActivity);
  } catch (error) {
    console.error('Error creating daily activity:', error);
    res.status(500).json({ error: 'Failed to create daily activity' });
  }
}));

router.put('/daily-activities/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    const updatedActivity = await storage.updateDailyActivity(id, req.body);
    res.json(updatedActivity);
  } catch (error) {
    console.error('Error updating daily activity:', error);
    res.status(500).json({ error: 'Failed to update daily activity' });
  }
}));

// Achievements endpoints
router.get('/achievements', asyncHandler(async (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }

  try {
    const achievements = await storage.getAchievements(userId);
    res.json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
}));

router.post('/achievements/check', asyncHandler(async (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }

  try {
    const newAchievements = await storage.checkAndUnlockAchievements(userId);
    res.json(newAchievements);
  } catch (error) {
    console.error('Error checking achievements:', error);
    res.status(500).json({ error: 'Failed to check achievements' });
  }
}));

// Goal Templates endpoint
router.get('/goal-templates', asyncHandler(async (req, res) => {
  const { GOAL_TEMPLATES, GOAL_TYPE_CONFIGS, DIFFICULTY_CONFIGS } = await import('../../client/src/lib/goal-templates');
  
  res.json({
    templates: GOAL_TEMPLATES,
    goalTypes: GOAL_TYPE_CONFIGS,
    difficulties: DIFFICULTY_CONFIGS
  });
}));

// Achievement Templates endpoint
router.get('/achievement-templates', asyncHandler(async (req, res) => {
  res.json({
    templates: ACHIEVEMENT_TEMPLATES,
    system: {
      calculateLevel: AchievementSystem.calculateLevel,
      getPointsForNextLevel: AchievementSystem.getPointsForNextLevel,
      getRarityColor: AchievementSystem.getRarityColor,
      getCategoryIcon: AchievementSystem.getCategoryIcon,
      getPointsForActivity: AchievementSystem.getPointsForActivity
    }
  });
}));

export default router;