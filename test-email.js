import dotenv from 'dotenv';

dotenv.config();

async function testBrevoEmail() {
  try {
    console.log('Testing Brevo email service...');
    console.log('BREVO_API_KEY:', process.env.BREVO_API_KEY ? '✅ Present' : '❌ Missing');
    
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'Test Sender',
          email: 'test@example.com'
        },
        to: [
          {
            email: 'test@example.com',
            name: 'Test Recipient'
          }
        ],
        subject: 'Test Email',
        htmlContent: '<p>This is a test email to verify Brevo configuration.</p>'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Brevo API error: ${JSON.stringify(errorData)}`);
    }

    console.log('✅ Brevo email service test successful!');
  } catch (error) {
    console.error('❌ Brevo email service test failed:', error);
  }
}

testBrevoEmail(); 