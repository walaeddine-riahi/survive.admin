// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

// Importer le client Twilio
const twilio = require('twilio');

// Configuration
const config = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  fromNumber: '+15707554683', // Votre numéro Twilio
  toNumber: '+21651091275',   // Numéro du destinataire
  message: 'Test d\'envoi SMS depuis le service Twilio - ' + new Date().toLocaleString()
};

// Vérifier la configuration
if (!config.accountSid || !config.authToken) {
  console.error('❌ Erreur: Les identifiants Twilio ne sont pas configurés');
  process.exit(1);
}

// Initialiser le client Twilio
const client = twilio(config.accountSid, config.authToken);

console.log('🚀 Envoi du SMS en cours...');
console.log(`📤 De: ${config.fromNumber}`);
console.log(`📥 À: ${config.toNumber}`);
console.log(`💬 Message: ${config.message}\n`);

// Envoyer le SMS
client.messages
  .create({
    body: config.message,
    from: config.fromNumber,
    to: config.toNumber
  })
  .then(message => {
    console.log('✅ SMS envoyé avec succès !');
    console.log(`📨 ID du message: ${message.sid}`);
    console.log(`🕒 Date d\'envoi: ${message.dateCreated}`);
  })
  .catch(error => {
    console.error('❌ Erreur lors de l\'envoi du SMS:');
    console.error(`Code d'erreur: ${error.code}`);
    console.error(`Message: ${error.message}`);
    if (error.moreInfo) console.error(`Plus d'infos: ${error.moreInfo}`);
    process.exit(1);
  });
