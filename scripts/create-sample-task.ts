import { PrismaClient, Priority, TaskStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

// Configuration du client Prisma avec logging
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
});

// Fonction pour tester la connexion à la base de données
async function testDatabaseConnection() {
  try {
    console.log('🔌 Test de connexion à la base de données...');
    await prisma.$connect();
    console.log('✅ Connexion à la base de données réussie !');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    return false;
  }
}

// Fonction pour créer une tâche exemple
async function createSampleTask() {
  try {
    console.log('🚀 Démarrage de la création d\'une tâche exemple...');
    
    // Tester la connexion à la base de données
    const isConnected = await testDatabaseConnection();
    if (!isConnected) {
      console.error('❌ Impossible de se connecter à la base de données. Vérifiez la configuration.');
      return;
    }

    // Vérifier s'il existe des utilisateurs et des équipes
    const users = await prisma.user.findMany({ take: 1 });
    if (users.length === 0) {
      console.error('❌ Aucun utilisateur trouvé dans la base de données. Veuillez d\'abord créer un utilisateur.');
      return;
    }

    const teams = await prisma.team.findMany({ take: 1 });
    if (teams.length === 0) {
      console.error('❌ Aucune équipe trouvée dans la base de données. Veuillez d\'abord créer une équipe.');
      return;
    }

    // Créer un membre d'équipe pour l'utilisateur s'il n'existe pas
    const user = users[0];
    const team = teams[0];
    
    let teamMember = await prisma.teamMember.findFirst({
      where: {
        userId: user.id,
        teamId: team.id
      }
    });

    if (!teamMember) {
      console.log('ℹ️ Création d\'un membre d\'équipe pour l\'utilisateur...');
      teamMember = await prisma.teamMember.create({
        data: {
          role: 'MEMBER',
          user: {
            connect: { id: user.id }
          },
          team: {
            connect: { id: team.id }
          }
        }
      });
      console.log(`✅ Membre d'équipe créé avec l'ID: ${teamMember.id}`);
    }

    // Données de la tâche
    const taskData = {
      title: 'Mise à jour du plan de continuité',
      description: 'Mettre à jour le plan de continuité d\'activité avec les dernières procédures',
      status: TaskStatus.PENDING,
      priority: Priority.HIGH,
      role: 'Responsable PCA',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
      creator: {
        connect: { id: user.id }
      },
      assignee: {
        connect: { id: teamMember.id }
      },
      team: {
        connect: { id: team.id }
      }
    };

    console.log('📝 Création de la tâche...');
    const task = await prisma.task.create({
      data: taskData,
      include: {
        creator: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        },
        assignee: {
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        team: {
          select: {
            name: true
          }
        }
      }
    });

    console.log('✅ Tâche créée avec succès !');
    console.log('📋 Détails de la tâche :');
    console.log(`   ID: ${task.id}`);
    console.log(`   Titre: ${task.title}`);
    console.log(`   Statut: ${task.status}`);
    console.log(`   Priorité: ${task.priority}`);
    console.log(`   Créée par: ${task.creator.firstName} ${task.creator.lastName} (${task.creator.email})`);
    console.log(`   Assignée à: ${task.assignee?.user.firstName} ${task.assignee?.user.lastName} (${task.assignee?.user.email})`);
    console.log(`   Équipe: ${task.team.name}`);
    console.log(`   Date d'échéance: ${task.dueDate?.toLocaleDateString()}`);
    
    return task;
  } catch (error) {
    console.error('❌ Erreur lors de la création de la tâche :', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécution du script
createSampleTask()
  .then(() => {
    console.log('✨ Script terminé avec succès !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur lors de l\'exécution du script :', error);
    process.exit(1);
  });
