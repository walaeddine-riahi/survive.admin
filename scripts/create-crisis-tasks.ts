import { PrismaClient, Priority, TaskStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

interface TaskData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  role: string;
  dueDate: Date;
  creatorId: string;
  assigneeId: string;
  teamId: string;
}

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
});

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

interface TaskWithRelations {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  role: string | null;
  dueDate: Date | null;
  creator: {
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  assignee: {
    user: {
      email: string;
      firstName: string | null;
      lastName: string | null;
    };
  } | null;
  team: {
    name: string;
  };
}

async function createCrisisTask(taskData: TaskData): Promise<TaskWithRelations> {
  try {
    console.log(`📝 Création de la tâche: ${taskData.title}...`);

    const task = await prisma.task.create({
      data: {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        role: taskData.role,
        dueDate: taskData.dueDate,
        creator: {
          connect: { id: taskData.creatorId }
        },
        assignee: {
          connect: { id: taskData.assigneeId }
        },
        team: {
          connect: { id: taskData.teamId }
        }
      },
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

    console.log(`✅ Tâche créée: ${task.title}`);
    return task;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error(`❌ Erreur lors de la création de la tâche: ${errorMessage}`);
    throw error;
  }
}

async function createCrisisTasks(): Promise<TaskWithRelations[]> {
  try {
    console.log('🚀 Démarrage de la création des tâches de crise...');
    console.log('🔍 Vérification de la connexion à la base de données...');

    const isConnected = await testDatabaseConnection();
    if (!isConnected) {
      console.error('❌ Impossible de se connecter à la base de données. Vérifiez la configuration.');
      return [];
    }

    const users = await prisma.user.findMany({ take: 1 });
    if (users.length === 0) {
      console.error('❌ Aucun utilisateur trouvé dans la base de données.');
      return [];
    }

    const teams = await prisma.team.findMany({ take: 1 });
    if (teams.length === 0) {
      console.error('❌ Aucune équipe trouvée dans la base de données.');
      return [];
    }

    const user = users[0];
    const team = teams[0];

    let teamMember = await prisma.teamMember.findFirst({
      where: {
        userId: user.id,
        teamId: team.id
      }
    });

    if (!teamMember) {
      teamMember = await prisma.teamMember.create({
        data: {
          role: 'MEMBER',
          user: { connect: { id: user.id } },
          team: { connect: { id: team.id } }
        }
      });
    }

    const defaultDueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

   // ... [le reste du code jusqu'à rolesPhasesDescriptions]

   const rolesPhasesDescriptions = [
    {
      role: 'Direction Générale',
      phases: [
        { phase: 'Préparation', desc: 'Définit la politique générale de gestion des crises, valide les plans et procédures. S’assure que les moyens humains, matériels et financiers sont disponibles.' },
        { phase: 'Réponse', desc: 'Dirige la cellule de crise, arbitre les décisions critiques, communique avec les autorités, les clients majeurs et les médias si nécessaire.' },
        { phase: 'Reprise', desc: 'Supervise la reprise stratégique de l’activité, valide les retours d’expérience, met à jour les plans.' }
      ]
    },
    {
      role: 'Direction QSE',
      phases: [
        { phase: 'Préparation', desc: 'Met en place les procédures de sécurité, de prévention des risques, et les plans d’urgence. Forme le personnel et organise les exercices.' },
        { phase: 'Réponse', desc: 'Assure la coordination des actions de sécurité, évalue les impacts environnementaux et sanitaires, assure la traçabilité des événements.' },
        { phase: 'Reprise', desc: 'Mène l’analyse post-incident, met à jour les procédures et les mesures correctives. Participe aux audits internes.' }
      ]
    },
    {
      role: 'Direction Supply Chain',
      phases: [
        { phase: 'Préparation', desc: 'Identifie les fournisseurs et transporteurs critiques, élabore des plans de continuité logistique.' },
        { phase: 'Réponse', desc: 'Coordonne les flux en temps réel, assure les approvisionnements prioritaires. Informe les fournisseurs et clients.' },
        { phase: 'Reprise', desc: 'Évalue les impacts sur la chaîne logistique, rétablit les flux et requalifie les fournisseurs si nécessaire.' }
      ]
    },
    {
      role: 'Direction Maintenance',
      phases: [
        { phase: 'Préparation', desc: 'Élabore un plan de maintenance préventive, identifie les équipements critiques. Prépare des procédures d\'intervention rapide.' },
        { phase: 'Réponse', desc: 'Intervient sur les défaillances techniques, sécurise les installations, participe à la résolution des incidents.' },
        { phase: 'Reprise', desc: 'Vérifie et remet en état les équipements, analyse les causes techniques, ajuste les plans de maintenance.' }
      ]
    },
    {
      role: 'Direction Production',
      phases: [
        { phase: 'Préparation', desc: 'Définit les procédures d’arrêt d’urgence, forme les équipes à la gestion des anomalies.' },
        { phase: 'Réponse', desc: 'Gère l’arrêt ou le redémarrage sécurisé des lignes. Maintient la coordination avec maintenance et QSE.' },
        { phase: 'Reprise', desc: 'Restaure la capacité de production, vérifie la qualité des produits redémarrés, participe au retour à la normale.' }
      ]
    },
    {
      role: 'Contrôle de Gestion',
      phases: [
        { phase: 'Préparation', desc: 'Identifie les coûts potentiels liés aux risques et incidents, prévoit les budgets de gestion de crise.' },
        { phase: 'Réponse', desc: 'Mesure les pertes financières en temps réel, fournit des données d’aide à la décision.' },
        { phase: 'Reprise', desc: 'Évalue le coût total de l’incident, participe au rapport de retour d’expérience financier.' }
      ]
    },
    {
      role: 'Directeur Financier',
      phases: [
        { phase: 'Préparation', desc: 'Vérifie les garanties d’assurance, anticipe les risques budgétaires liés aux incidents, prévoit des réserves financières.' },
        { phase: 'Réponse', desc: 'Assure la disponibilité des fonds pour les actions urgentes (achats, réparations, soutien). Suivi des dépenses en temps réel.' },
        { phase: 'Reprise', desc: 'Supervise la consolidation financière post-crise, gère les demandes d’indemnisation, met à jour la stratégie budgétaire.' }
      ]
    },
    {
      role: 'Directeur des Ressources Humaines',
      phases: [
        { phase: 'Préparation', desc: 'Met en place un plan de communication interne, prépare des procédures de gestion du personnel en cas de crise (évacuation, absences, sécurité psychologique).' },
        { phase: 'Réponse', desc: 'Gère la présence du personnel, assure l’assistance médicale ou psychologique si besoin, communique avec les salariés.' },
        { phase: 'Reprise', desc: 'Accompagne le retour du personnel, propose des formations post-crise, met à jour les procédures RH et le dialogue social.' }
      ]
    },
    {
      role: 'Astreinte',
      phases: [
        { phase: 'Préparation', desc: `S’assure de son rôle durant une urgence\nS’assure de la disponibilité des EID, l’emplacement des moyens de réponse (équipements, matériel spécifique)\nMaitrise la communication interne et la gestion des ressources d’intervention` },
        { phase: 'Réponse', desc: `Déclenche la réponse à l’urgence\nCoordonne les actions d’urgence, mobilise les ressources nécessaires, communique avec les parties prenantes, évalue la gravité de la situation et prend les décisions opérationnelles pour contenir l’incident jusqu’à prise en charge par la cellule de gestion de crise locale.` },
        { phase: 'Reprise', desc: `Supervise le retour à la normale, participe à l’analyse post-incident (retour d’expérience), identifie les points d’amélioration, et participe à l’actualisation des procédures en conséquence.` }
      ]
    }
  ];
  


    const crisisTasks: TaskData[] = [];

    for (const entry of rolesPhasesDescriptions) {
      for (const { phase, desc } of entry.phases) {
        crisisTasks.push({
          title: `${phase} – ${entry.role}`,
          description: desc,
          status: TaskStatus.PENDING,
          priority: Priority.MEDIUM,
          role: entry.role,
          dueDate: defaultDueDate,
          creatorId: user.id,
          assigneeId: teamMember.id,
          teamId: team.id
        });
      }
    }

    const createdTasks: TaskWithRelations[] = [];
    for (const taskData of crisisTasks) {
      const task = await createCrisisTask(taskData);
      createdTasks.push(task);
    }

    console.log(`\n🎉 Toutes les tâches ont été créées avec succès ! Total: ${createdTasks.length}`);
    return createdTasks;
  } catch (error) {
    console.error('❌ Erreur lors de la création des tâches :', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createCrisisTasks()
  .then(() => {
    console.log('✨ Script terminé avec succès !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur lors de l\'exécution du script :', error);
    process.exit(1);
  });
