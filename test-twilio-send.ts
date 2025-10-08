console.log('🔍 Starting test script...');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Import TwilioService after environment variables are loaded
import { twilioService } from './src/lib/twilio-service';

console.log('✅ Dependencies imported');

// Test phone number
const TEST_PHONE = '+21651091275'; // User's test number

async function testSmsSending() {
  // Vérifier que les variables d'environnement sont chargées
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    throw new Error('Les variables d\'environnement Twilio ne sont pas configurées');
  }
  try {
    console.log('🔧 Configuring test...');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Not set');
    console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '✅ Set' : '❌ Not set');
    
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error('❌ Missing required Twilio environment variables');
    }
    
    console.log('🚀 Testing Twilio SMS Sending...\n');
    
    console.log('📱 Twilio Service Initialized');
    // The fromNumber is hardcoded in the TwilioService class as '+15707554683'
    console.log(`📥 To: ${TEST_PHONE}\n`);

    console.log('Envoi du SMS de test...');
    const message = 'Test SMS depuis le service Twilio - Veuillez ignorer';
    console.log(`Détails de l'envoi :`);
    console.log(`- De: ${twilioService['fromNumber']}`);
    console.log(`- À: ${TEST_PHONE}`);
    console.log(`- Message: ${message}`);
    
    const result = await twilioService.sendSms(
      TEST_PHONE,
      message
    );
    
    console.log('Réponse de Twilio:', result);

    if (result.success) {
      console.log('✅ SMS sent successfully!');
      console.log(`Message SID: ${result.sid}`);
    } else {
      throw new Error(`Failed to send SMS: ${result.error}`);
    }
  } catch (error) {
    console.error('❌ Error in testSmsSending:');
    if (error instanceof Error) {
      console.error(error.message);
      console.error('Stack:', error.stack);
    } else {
      console.error('Unknown error:', error);
    }
    throw error; // Re-throw to ensure the error is caught by the outer catch
  }
}

testSmsSending()
  .then(() => console.log('✅ Test terminé avec succès'))
  .catch(error => {
    console.error('❌ Erreur lors du test:');
    console.error(error);
    process.exit(1);
  });
