import { env } from './src/config/env';

async function testTwilioEnv() {
  console.log('Testing Twilio environment variables...');
  console.log('TWILIO_ACCOUNT_SID:', env.TWILIO_ACCOUNT_SID ? '✅ Present' : '❌ Missing');
  console.log('TWILIO_AUTH_TOKEN:', env.TWILIO_AUTH_TOKEN ? '✅ Present (first 5 chars: ' + env.TWILIO_AUTH_TOKEN.substring(0, 5) + '...)' : '❌ Missing');
  
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
    console.error('❌ Missing required Twilio environment variables');
    process.exit(1);
  }
  
  console.log('✅ All required environment variables are present');
  console.log('ℹ️ Note: The Twilio phone number is hardcoded in the TwilioService class');
}

testTwilioEnv().catch(console.error);
