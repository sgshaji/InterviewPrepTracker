import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

interface PrepReminderData {
  userName: string;
  email: string;
  date: string;
  missingCategories: string[];
  template: string;
}

export async function sendPrepReminder(data: PrepReminderData): Promise<boolean> {
  try {
    // Process the template with variables
    let emailContent = data.template;
    
    // Replace template variables
    emailContent = emailContent.replace(/{date}/g, data.date);
    emailContent = emailContent.replace(/{userName}/g, data.userName);
    
    // Format missing categories
    const missingCategoriesText = data.missingCategories
      .map(category => `- ${category}: ❌`)
      .join('\n');
    emailContent = emailContent.replace(/{missingCategories}/g, missingCategoriesText);
    
    // Extract subject line (first line starting with "Subject:")
    const lines = emailContent.split('\n');
    const subjectLine = lines.find(line => line.startsWith('Subject:'));
    const subject = subjectLine ? subjectLine.replace('Subject:', '').trim() : `Preparation Reminder for ${data.date}`;
    
    // Remove subject line from content
    const bodyContent = lines
      .filter(line => !line.startsWith('Subject:'))
      .join('\n')
      .trim();
    
    const success = await sendEmail({
      to: data.email,
      from: 'noreply@interviewprep.com', // You can customize this
      subject,
      text: bodyContent,
      html: bodyContent.replace(/\n/g, '<br>')
    });
    
    return success;
  } catch (error) {
    console.error('Error sending prep reminder:', error);
    return false;
  }
}

export function checkMissedPreparation(sessions: any[], prepTopics: string[], date: string): string[] {
  const dateKey = date;
  const sessionsForDate = sessions.filter(session => 
    session.date.startsWith(dateKey)
  );
  
  const completedTopics = new Set(sessionsForDate.map(s => s.topic));
  const missingTopics = prepTopics.filter(topic => !completedTopics.has(topic));
  
  return missingTopics;
}