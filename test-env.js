// Simple Node.js script to test environment variables
require('dotenv').config({ path: '.env.local' });

console.log('Environment Variables Test');
console.log('Loading from .env.local');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Not set');
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '✅ Set (first 5 chars: ' + process.env.TWILIO_AUTH_TOKEN.substring(0, 5) + '...)' : '❌ Not set');

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
  console.error('❌ Error: Missing required Twilio environment variables');
  process.exit(1);
}

console.log('✅ Environment variables are properly set');
