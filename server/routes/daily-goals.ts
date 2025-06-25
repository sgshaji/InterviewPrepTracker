import express from 'express';
import { DailyGoalsService } from '../daily-goals-service';
import { requireUser } from '../middleware/requireUser';

const router = express.Router();

// Get user's daily goals
router.get('/goals', requireUser, async (req, res) => {
  try {
    const userId = (req as any).supabaseUser.id;
    const goals = await DailyGoalsService.getUserGoals(userId);
    res.json({ success: true, goals });
  } catch (error) {
    console.error('Error fetching user goals:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch goals' });
  }
});

// Create a new daily goal
router.post('/goals', requireUser, async (req, res) => {
  try {
    const userId = (req as any).supabaseUser.id;
    const { goalName, targetCount = 1 } = req.body;

    if (!goalName) {
      return res.status(400).json({ success: false, error: 'Goal name is required' });
    }

    const goalId = await DailyGoalsService.createGoal(userId, goalName, targetCount);
    res.json({ success: true, goalId });
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ success: false, error: 'Failed to create goal' });
  }
});

// Get daily progress for a specific date
router.get('/progress/:date', requireUser, async (req, res) => {
  try {
    const userId = (req as any).supabaseUser.id;
    const { date } = req.params;

    const progress = await DailyGoalsService.getDailyProgress(userId, date);
    const streak = await DailyGoalsService.getUserStreak(userId);

    res.json({ 
      success: true, 
      progress, 
      streak,
      allCompleted: progress.length > 0 && progress.every(goal => goal.is_complete)
    });
  } catch (error) {
    console.error('Error fetching daily progress:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch progress' });
  }
});

// Update goal progress manually
router.post('/progress/:date', requireUser, async (req, res) => {
  try {
    const userId = (req as any).supabaseUser.id;
    const { date } = req.params;
    const { goalId, completedCount } = req.body;

    if (!goalId || completedCount === undefined) {
      return res.status(400).json({ success: false, error: 'Goal ID and completed count are required' });
    }

    await DailyGoalsService.updateGoalProgress(userId, goalId, date, completedCount);
    await DailyGoalsService.updateUserStreak(userId, date);

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ success: false, error: 'Failed to update progress' });
  }
});

// Calculate progress from preparation sessions
router.post('/calculate-progress/:date', requireUser, async (req, res) => {
  try {
    const userId = (req as any).supabaseUser.id;
    const { date } = req.params;

    await DailyGoalsService.calculateProgressFromPrepSessions(userId, date);
    await DailyGoalsService.updateUserStreak(userId, date);

    const progress = await DailyGoalsService.getDailyProgress(userId, date);
    const streak = await DailyGoalsService.getUserStreak(userId);

    res.json({ 
      success: true, 
      progress, 
      streak,
      allCompleted: progress.length > 0 && progress.every(goal => goal.is_complete)
    });
  } catch (error) {
    console.error('Error calculating progress:', error);
    res.status(500).json({ success: false, error: 'Failed to calculate progress' });
  }
});

// Get user streak information
router.get('/streak', requireUser, async (req, res) => {
  try {
    const userId = (req as any).supabaseUser.id;
    const streak = await DailyGoalsService.getUserStreak(userId);
    res.json({ success: true, streak });
  } catch (error) {
    console.error('Error fetching streak:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch streak' });
  }
});

// Test endpoint for sending reminders (for development)
router.post('/test-reminders', requireUser, async (req, res) => {
  try {
    await DailyGoalsService.sendDailyReminders();
    res.json({ success: true, message: 'Reminders sent' });
  } catch (error) {
    console.error('Error sending reminders:', error);
    res.status(500).json({ success: false, error: 'Failed to send reminders' });
  }
});

export default router; 