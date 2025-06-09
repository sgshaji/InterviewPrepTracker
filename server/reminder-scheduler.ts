import { sendPrepReminder, checkMissedPreparation } from './email-service';
import { storage } from './storage';

// Simple daily reminder checker (runs when called)
export async function checkDailyReminders() {
  try {
    console.log('Checking daily preparation reminders...');
    
    // In a real app, you'd get all users with email alerts enabled
    // For now, we'll use the first user from the database
    const users = await storage.getUsers();
    if (users.length === 0) {
      console.log('No users found for reminder check');
      return;
    }
    const userId = users[0].id;
    const user = await storage.getUser(userId);
    
    if (!user) {
      console.log('No user found for reminder check');
      return;
    }

    const sessions = await storage.getPreparationSessions(userId);
    const today = new Date().toISOString().split('T')[0];
    
    // Default prep topics (would be user-configurable in production)
    const prepTopics = ["Behavioral", "Product Thinking", "Analytical Thinking", "Product Portfolio"];
    
    const missingCategories = checkMissedPreparation(sessions, prepTopics, today);
    
    if (missingCategories.length > 0) {
      console.log(`Found ${missingCategories.length} missing preparation categories for user ${user.username}`);
      
      // Default email settings (would be stored in database in production)
      const defaultTemplate = `Subject: Missing Preparation Entry for {date}

Hi {userName},

We noticed you haven't filled in your preparation log for today, {date}. Here's what's missing:

{missingCategories}

Take 5 minutes to reflect and fill in your prep log to stay consistent.

You've got this!
– Interview Prep Tracker`;

      // For testing, you'd replace this with the user's actual email
      const userEmail = 'your-email@example.com'; // Replace with actual user email
      
      const success = await sendPrepReminder({
        userName: user.username,
        email: userEmail,
        date: today,
        missingCategories,
        template: defaultTemplate
      });
      
      if (success) {
        console.log(`Reminder email sent successfully to ${userEmail}`);
      } else {
        console.log('Failed to send reminder email');
      }
    } else {
      console.log('All preparation categories completed for today - no reminder needed');
    }
  } catch (error) {
    console.error('Error checking daily reminders:', error);
  }
}

// You can call this function manually or set up a cron job
// For testing: checkDailyReminders();