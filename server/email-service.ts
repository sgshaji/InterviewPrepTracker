// Using built-in fetch (Node.js 18+)

if (!process.env.BREVO_API_KEY) {
  throw new Error("BREVO_API_KEY environment variable must be set");
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY!,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'Interview Prep',
          email: 'noreply@yourapp.com'
        },
        to: [
          {
            email: params.to,
            name: 'User'
          }
        ],
        subject: params.subject,
        htmlContent: params.html || params.text?.replace(/\n/g, '<br>') || '',
        textContent: params.text || ''
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brevo email error:', errorData);
      return false;
    }

    const data = await response.json();
    console.log('✅ Email sent successfully via Brevo:', data);
    return true;
  } catch (error) {
    console.error('Email service error:', error);
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

interface PrepCongratsData {
  userName: string;
  email: string;
  date: string;
  completedCategories: string[];
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
      from: 'Interview Prep <onboarding@resend.dev>', // Using Resend's verified domain
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