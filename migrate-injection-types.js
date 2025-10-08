// migrate-injection-types.js
const { PrismaClient } = require('@prisma/client');
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function migrateInjectionTypes() {
  let client;
  
  try {
    console.log('Début de la migration des types d\'injection...');
    
    // Utiliser l'URL de connexion MongoDB depuis les variables d'environnement
    const mongoUrl = process.env.DATABASE_URL;
    if (!mongoUrl) {
      throw new Error('DATABASE_URL is not defined in .env file');
    }
    
    // Se connecter à MongoDB
    client = new MongoClient(mongoUrl);
    await client.connect();
    
    const db = client.db();
    const injectionsCollection = db.collection('injections');
    
    // Mettre à jour SOCIAL_MEDIA vers SOCIAL
    const socialUpdate = await injectionsCollection.updateMany(
      { type: 'SOCIAL_MEDIA' },
      { $set: { type: 'SOCIAL' } }
    );
    console.log(`Mis à jour ${socialUpdate.modifiedCount} entrées de SOCIAL_MEDIA vers SOCIAL`);
    
    // Mettre à jour CALL_LOG vers CALL
    const callUpdate = await injectionsCollection.updateMany(
      { type: 'CALL_LOG' },
      { $set: { type: 'CALL' } }
    );
    console.log(`Mis à jour ${callUpdate.modifiedCount} entrées de CALL_LOG vers CALL`);

    console.log('Migration des types d\'injection terminée avec succès !');
  } catch (error) {
    console.error('Erreur lors de la migration des types d\'injection :', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

migrateInjectionTypes();
