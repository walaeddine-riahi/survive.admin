// Simple Node.js script to test Twilio SMS sending
console.log('🔍 Starting test script...');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

console.log('✅ Environment variables loaded');
console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Not set');
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '✅ Set' : '❌ Not set');

const twilio = require('twilio');
console.log('✅ Twilio module loaded');

async function sendTestSms() {
  console.log('🚀 Testing Twilio SMS Sending...\n');
  
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = '+15707554683'; // Hardcoded in the TwilioService
  const toNumber = '+21651091275'; // Your test number
  
  console.log('📤 From:', fromNumber);
  console.log('📥 To:', toNumber);
  
  if (!accountSid || !authToken) {
    throw new Error('Missing required Twilio credentials');
  }
  
  const client = twilio(accountSid, authToken);
  
  try {
    console.log('Sending test SMS...');
    console.log('Request payload:', {
      body: 'Test SMS from Twilio - Please ignore',
      from: fromNumber,
      to: toNumber
    });
    const message = await client.messages.create({
      body: 'Test SMS from Twilio - Please ignore',
      from: fromNumber,
      to: toNumber
    });
    
    console.log('✅ Twilio API Response:', {
      sid: message.sid,
      status: message.status,
      dateCreated: message.dateCreated,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage
    });
    
    console.log('✅ SMS sent successfully!');
    console.log('Message SID:', message.sid);
    return message.sid;
  } catch (error) {
    console.error('❌ Error sending SMS:');
    if (error.code) {
      console.error('Twilio Error Code:', error.code);
      console.error('Twilio Error Message:', error.message);
      console.error('More Info:', error.moreInfo);
      console.error('Status:', error.status);
    }
    console.error('Full Error:', error);
    throw error;
  }
}

sendTestSms().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
