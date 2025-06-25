import { DailyGoalsService } from './daily-goals-service';

// This script can be run via cron job or scheduled task
// For MVP, you can run this manually or set up a simple cron job

async function sendDailyReminders() {
  console.log('🕐 Starting daily goal reminders...');
  
  try {
    await DailyGoalsService.sendDailyReminders();
    console.log('✅ Daily reminders sent successfully');
  } catch (error) {
    console.error('❌ Error sending daily reminders:', error);
  }
}

async function sendStreakBreakNotifications() {
  console.log('🕐 Starting streak break notifications...');
  
  try {
    await DailyGoalsService.sendStreakBreakNotifications();
    console.log('✅ Streak break notifications sent successfully');
  } catch (error) {
    console.error('❌ Error sending streak break notifications:', error);
  }
}

// Run both functions
async function runAllNotifications() {
  await sendDailyReminders();
  await sendStreakBreakNotifications();
}

// If this script is run directly
if (require.main === module) {
  runAllNotifications()
    .then(() => {
      console.log('🎉 All notifications completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

export { sendDailyReminders, sendStreakBreakNotifications, runAllNotifications }; 