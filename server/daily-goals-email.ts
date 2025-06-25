import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface DailyGoal {
  id: number;
  goal_name: string;
  target_count: number;
  completed_count: number;
  is_complete: boolean;
}

interface UserGoalData {
  userId: string;
  email: string;
  userName: string;
  currentStreak: number;
  goals: DailyGoal[];
  date: string;
  timezone: string;
}

export async function sendDailyGoalReminder(data: UserGoalData): Promise<boolean> {
  try {
    const incompleteGoals = data.goals.filter(goal => !goal.is_complete);
    const completeGoals = data.goals.filter(goal => goal.is_complete);
    
    const subject = incompleteGoals.length > 0 
      ? `🔥 Don't break your ${data.currentStreak}-day streak! ${incompleteGoals.length} goals remaining`
      : `🎉 All goals completed! Keep your ${data.currentStreak}-day streak going`;

    const goalsList = data.goals.map(goal => {
      const status = goal.is_complete ? '✅' : '⏳';
      const progress = goal.is_complete 
        ? `(${goal.completed_count}/${goal.target_count})`
        : `(${goal.completed_count}/${goal.target_count})`;
      return `${status} ${goal.goal_name} ${progress}`;
    }).join('\n');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Daily Interview Prep Goals</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; }
          .streak { font-size: 24px; font-weight: bold; margin: 10px 0; }
          .goals { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .goal-item { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }
          .cta { background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📚 Daily Interview Prep Goals</h1>
            <div class="streak">🔥 ${data.currentStreak}-Day Streak</div>
            <p>Hi ${data.userName}, here's your daily prep status for ${data.date}</p>
          </div>
          
          <div class="goals">
            <h2>Today's Goals:</h2>
            ${data.goals.map(goal => `
              <div class="goal-item">
                ${goal.is_complete ? '✅' : '⏳'} <strong>${goal.goal_name}</strong> 
                (${goal.completed_count}/${goal.target_count})
              </div>
            `).join('')}
          </div>
          
          ${incompleteGoals.length > 0 ? `
            <p><strong>You have ${incompleteGoals.length} goal(s) remaining today!</strong></p>
            <a href="${process.env.FRONTEND_URL}/dashboard" class="cta">Complete Your Goals</a>
          ` : `
            <p><strong>🎉 All goals completed! Great job!</strong></p>
            <a href="${process.env.FRONTEND_URL}/dashboard" class="cta">View Dashboard</a>
          `}
          
          <div class="footer">
            <p>Keep up the great work! Your interview prep journey is building momentum.</p>
            <p>Timezone: ${data.timezone}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Daily Interview Prep Goals - ${data.date}

Hi ${data.userName},

You're on a ${data.currentStreak}-day streak! 🔥

Today's Goals:
${data.goals.map(goal => 
  `${goal.is_complete ? '✅' : '⏳'} ${goal.goal_name} (${goal.completed_count}/${goal.target_count})`
).join('\n')}

${incompleteGoals.length > 0 
  ? `You have ${incompleteGoals.length} goal(s) remaining today! Complete them to maintain your streak.`
  : '🎉 All goals completed! Great job!'
}

Log your prep: ${process.env.FRONTEND_URL}/dashboard

Keep up the great work!
`;

    const result = await resend.emails.send({
      from: 'Interview Prep <onboarding@resend.dev>',
      to: [data.email],
      subject,
      html: htmlContent,
      text: textContent,
    });

    console.log('✅ Daily goal reminder sent:', result);
    return true;
  } catch (error) {
    console.error('❌ Error sending daily goal reminder:', error);
    return false;
  }
}

export async function sendStreakBreakNotification(data: UserGoalData): Promise<boolean> {
  try {
    const subject = `💔 Streak broken! You missed ${data.goals.filter(g => !g.is_complete).length} goal(s) yesterday`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Streak Break Notification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 20px; border-radius: 8px; }
          .motivation { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .cta { background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💔 Streak Break</h1>
            <p>Hi ${data.userName}, your ${data.currentStreak}-day streak was broken yesterday.</p>
          </div>
          
          <div class="motivation">
            <h2>Don't give up! 💪</h2>
            <p>Every successful person has had setbacks. The key is to get back up and start again.</p>
            <p>Today is a new day - start a new streak!</p>
          </div>
          
          <a href="${process.env.FRONTEND_URL}/dashboard" class="cta">Start New Streak</a>
        </div>
      </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: 'Interview Prep <onboarding@resend.dev>',
      to: [data.email],
      subject,
      html: htmlContent,
    });

    console.log('✅ Streak break notification sent:', result);
    return true;
  } catch (error) {
    console.error('❌ Error sending streak break notification:', error);
    return false;
  }
} 