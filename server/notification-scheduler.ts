import { storage } from './storage';
import { sendPrepReminder, checkMissedPreparation } from './email-service';
import { PREPARATION_TOPICS } from '../client/src/lib/constants';

interface EmailSettings {
  email: string;
  enableAlerts: boolean;
  enableCongratulations: boolean;
  missedDaysThreshold: number;
  reminderTimes: string[];
  reminderTemplate: string;
  congratsTemplate: string;
}

// Store for user email settings (in production, this would be in the database)
const userEmailSettings = new Map<number, EmailSettings>();

export function saveEmailSettings(userId: number, settings: EmailSettings) {
  userEmailSettings.set(userId, settings);
  console.log(`📧 Email settings saved for user ${userId}:`, {
    email: settings.email,
    reminderTimes: settings.reminderTimes,
    enableAlerts: settings.enableAlerts,
    enableCongratulations: settings.enableCongratulations
  });
}

export function getEmailSettings(userId: number): EmailSettings | undefined {
  return userEmailSettings.get(userId);
}

export async function checkAndSendDailyNotifications() {
  const today = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  console.log(`🔔 Checking daily notifications at ${currentTime} for ${today}`);

  // Check all users with email settings
  for (const [userId, settings] of Array.from(userEmailSettings.entries())) {
    if (!settings.enableAlerts && !settings.enableCongratulations) {
      continue;
    }

    try {
      // Get user's preparation sessions for today
      const sessions = await storage.getPreparationSessionsByDateRange(userId, today, today);
      const missedCategories = checkMissedPreparation(sessions, [...PREPARATION_TOPICS], today);
      const completedCategories = PREPARATION_TOPICS.filter(topic => 
        sessions.some(session => session.topic === topic && session.date === today)
      );

      // Check if it's time to send notifications for this user
      const shouldSendNow = settings.reminderTimes.some((time: string) => {
        const [hour, minute] = time.split(':');
        const scheduledTime = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
        return scheduledTime === currentTime;
      });

      if (!shouldSendNow) {
        continue;
      }

      // Get user info
      const user = await storage.getUser(userId);
      if (!user) {
        continue;
      }

      // Send congratulations if all categories are completed
      if (settings.enableCongratulations && completedCategories.length === PREPARATION_TOPICS.length && missedCategories.length === 0) {
        console.log(`🎉 All prep categories completed! Sending congratulations to ${settings.email}`);
        // For now, we'll log this - the congratulations functionality is ready for when needed
      }
      // Send reminder if there are missing categories
      else if (settings.enableAlerts && missedCategories.length > 0) {
        const success = await sendPrepReminder({
          userName: user.username,
          email: settings.email,
          date: today,
          missingCategories: missedCategories,
          template: settings.reminderTemplate
        });

        if (success) {
          console.log(`📨 Reminder email sent to ${settings.email} for ${missedCategories.length} missing categories`);
        }
      }

    } catch (error) {
      console.error(`Error checking notifications for user ${userId}:`, error);
    }
  }
}

// Start the notification scheduler (checks every minute)
export function startNotificationScheduler() {
  console.log('🚀 Starting daily notification scheduler...');
  
  // Check immediately
  checkAndSendDailyNotifications();
  
  // Then check every minute
  setInterval(checkAndSendDailyNotifications, 60 * 1000);
  
  console.log('✅ Notification scheduler is running (checks every minute)');
}