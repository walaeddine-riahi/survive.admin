import { PrismaClient } from '@prisma/client';

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

async function createSampleProcess() {
  try {
    console.log('🚀 Démarrage de la création d\'un exemple de processus BIA...');
    
    // Tester la connexion à la base de données
    const isConnected = await testDatabaseConnection();
    if (!isConnected) {
      console.error('❌ Impossible de se connecter à la base de données. Vérifiez la configuration.');
      return;
    }
    
    // Données du processus avec tous les champs requis
    const processData = {
      // Champs de base
      name: 'Gestion des commandes en ligne',
      description: 'Processus de traitement des commandes clients sur la plateforme e-commerce',
      department: 'Ventes en ligne',
      location: 'Siège social',
      impact: 'Élevé',
      criticality: 'high' as const,
      rto: 4, // 4 heures
      mtpd: 24, // 24 heures
      rpo: 1, // 1 heure
      mbco: 'Fonctionnalités essentielles uniquement',
      
      // Champs booléens requis
      supplierContinuityPlan: true,
      hasSLAClause: true,
      hasBackupSystems: true,
      dependsOnPhysicalInfra: true,
      canWorkRemotely: true,
      canUseOtherInfra: true,
      canBeReplaced: true,
      canReassignEquipment: true,
      backupCompatible: true,
      neededAfterDisruption: true,
      hasAlternativeAccess: true,
      hasReplacement: true,
      hasAlternativeSupplier: true,
      supplierHasContinuityPlan: true,
      
      // Champs optionnels avec des valeurs par défaut
      criticalTimes: '9h-18h du lundi au vendredi',
      financialImpact: 'Perte de 10 000€ par heure d\'indisponibilité',
      operationalImpact: 'Impossibilité de traiter les commandes',
      reputationImpact: 'Impact modéré sur la satisfaction client',
      operationalCapacityImpact: 'Réduction de 100% de la capacité opérationnelle',
      mainFunctionality: 'Traitement des commandes en ligne',
      productDependencies: 'API de paiement, base de données des produits',
      interServiceDependencies: 'Service client, logistique',
      externalSuppliers: 'Stripe, DHL',
      supplierTasks: 'Paiement, livraison',
      supplierContact: 'support@stripe.com, support@dhl.com',
      supplierRTO: 6,
      supplierMTPD: 24,
      legalObligations: 'RGPD, normes de sécurité des paiements',
      legalReferences: 'Article 32 du RGPD',
      legalAuthority: 'CNIL',
      legalDetails: 'Protection des données clients',
      nonComplianceConsequences: 'Amendes jusqu\'à 4% du CA annuel',
      itSystems: 'Site e-commerce, base de données, API de paiement',
      systemCriticality: 'Critique',
      systemImpact: 'Arrêt complet du processus de vente',
      supportedActivities: 'Toutes les activités de vente en ligne',
      systemRTO: 4,
      systemRPO: 1,
      systemMTPD: 24,
      workarounds: 'Passage en mode dégradé avec fonctionnalités limitées',
      previousIncidents: 'Incident mineur le 15/01/2023 (1h d\'indisponibilité)',
      infrastructureType: 'Cloud hybride',
      infraRTO: 6,
      infraMTPD: 24,
      staffRoles: 'Développeurs, support technique, service client',
      staffCount: 15,
      staffTasks: 'Maintenance, support, gestion des commandes',
      uniqueSkills: 'Connaissance de la plateforme e-commerce',
      criticalityAfterDisruption: 'Critique après 2h',
      roleRecoveryTime: '4 heures',
      replacementBy: 'Équipe interne de support',
      staffWorkarounds: 'Télétravail, réaffectation des ressources',
      industrialEquipment: 'Serveurs, équipements réseau',
      equipmentTasks: 'Hébergement des applications, traitement des commandes',
      equipmentCriticality: 'Élevée',
      equipmentRTO: 6,
      equipmentMTPD: 24,
      equipmentWorkarounds: 'Basculer sur le site secondaire en cas de panne',
      voltage: '220V',
      currentType: 'AC',
      powerRating: '5kVA',
      dailyConsumption: '120kWh',
      officeEquipment: 'Ordinateurs, téléphones, imprimantes',
      equipmentQuantity: 20,
      officeEquipmentTasks: 'Support utilisateur, traitement des commandes',
      officeEquipmentCriticality: 'Moyenne',
      officeRTO: 8,
      officeMTPD: 48,
      requiredAfterDisruption: 4,
      canReassignOfficeEquipment: true,
      officeWorkarounds: 'Télétravail, partage des ressources',
      requiredDocumentation: 'Manuels utilisateur, procédures de secours',
      documentationLocation: 'Intranet, Google Drive',
      documentationRTO: 2,
      replacementMeasures: 'Location d\'équipements, télétravail',
      keySuppliers: 'OVH, Microsoft, Dell',
      providedService: 'Hébergement, logiciels, matériel',
      supplierDetails: 'Contrats annuels avec renouvellement automatique',
      supplierCriticality: 'Élevée',
      
      // Responsables
      responsibles: [
        {
          name: 'Jean Dupont',
          role: 'Responsable e-commerce',
          phone: '+33123456789',
          email: 'jean.dupont@example.com'
        },
        {
          name: 'Marie Martin',
          role: 'Responsable technique',
          phone: '+33987654321',
          email: 'marie.martin@example.com'
        }
      ],
      
      // Activités
      activities: [
        {
          name: 'Traitement des commandes',
          description: 'Validation et préparation des commandes clients'
        },
        {
          name: 'Paiement en ligne',
          description: 'Traitement sécurisé des transactions'
        }
      ],
      
      // Équipements industriels
      industrialEquipmentList: [
        {
          name: 'Serveur principal',
          description: 'Serveur dédié au traitement des commandes'
        },
        {
          name: 'Sauvegarde NAS',
          description: 'Stockage des sauvegardes des commandes'
        }
      ],
      
      // Équipements de bureau
      officeEquipmentList: [
        {
          name: 'Ordinateurs portables',
          description: 'Pour le service client et la gestion des commandes'
        }
      ],
      
      // Fournisseurs
      suppliers: [
        {
          name: 'OVH Cloud',
          service: 'Hébergement web',
          contact: 'support@ovh.com'
        }
      ]
    };
    
    // Création du processus
    const process = await prisma.process.create({
      data: {
        ...processData,
        // Gestion des relations
        responsibles: processData.responsibles ? {
          create: processData.responsibles
        } : undefined,
        activities: processData.activities ? {
          create: processData.activities
        } : undefined,
        industrialEquipmentList: processData.industrialEquipmentList ? {
          create: processData.industrialEquipmentList
        } : undefined,
        officeEquipmentList: processData.officeEquipmentList ? {
          create: processData.officeEquipmentList
        } : undefined,
        suppliers: processData.suppliers ? {
          create: processData.suppliers
        } : undefined
      },
      include: {
        responsibles: true,
        activities: true,
        industrialEquipmentList: true,
        officeEquipmentList: true,
        suppliers: true
      }
    });
    
    console.log('Processus créé avec succès !');
    console.log('ID du processus:', process.id);
    
  } catch (error) {
    console.error('Erreur lors de la création du processus exemple:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécution du script
createSampleProcess()
  .catch((e) => {
    console.error('Erreur non gérée:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
