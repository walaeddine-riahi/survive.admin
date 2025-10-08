import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { join } from 'path';

// Charger les variables d'environnement depuis le fichier .env
config({ path: join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function deleteAllParticipants() {
  try {
    console.log('Début de la suppression de tous les participants...');
    
    // Compter le nombre de participants avant suppression
    const countBefore = await prisma.simulationAssignment.count();
    console.log(`Nombre de participants avant suppression: ${countBefore}`);

    if (countBefore === 0) {
      console.log('Aucun participant à supprimer.');
      return;
    }

    // Demander une confirmation
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question(
      `Êtes-vous sûr de vouloir supprimer ${countBefore} participants ? (o/n) `, 
      async (answer: string) => {
        if (answer.toLowerCase() === 'o' || answer.toLowerCase() === 'oui') {
          // Supprimer tous les participants
          const deleteResult = await prisma.simulationAssignment.deleteMany({});
          
          console.log(`\n${deleteResult.count} participants ont été supprimés avec succès.`);
          
          // Vérifier la suppression
          const countAfter = await prisma.simulationAssignment.count();
          console.log(`Vérification: il reste ${countAfter} participants dans la base de données.`);
        } else {
          console.log('Opération annulée.');
        }
        
        readline.close();
        await prisma.$disconnect();
      }
    );
    
  } catch (error) {
    console.error('Erreur lors de la suppression des participants:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

deleteAllParticipants();
