import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Nettoyer la base de données
  await prisma.simulationDebrief.deleteMany();
  await prisma.participantScore.deleteMany();
  await prisma.injectResponse.deleteMany();
  await prisma.injection.deleteMany();
  await prisma.simulationAssignment.deleteMany();
  await prisma.evaluationCriteria.deleteMany();
  await prisma.simulationCrisisPlan.deleteMany();
  await prisma.simulation.deleteMany();
  await prisma.continuityStrategy.deleteMany();
  await prisma.continuityGap.deleteMany();
  await prisma.riskAssessment.deleteMany();
  await prisma.continuitySettings.deleteMany();
  await prisma.process.deleteMany();
  await prisma.factory.deleteMany();
  await prisma.biaReport.deleteMany();
  await prisma.teamChat.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.task.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.report.deleteMany();
  await prisma.reportStructure.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.planType.deleteMany();
  await prisma.incidentType.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // Créer les types de plans
  const maintenanceType = await prisma.planType.create({
    data: {
      name: "Maintenance",
      description: "Plan de maintenance préventive",
    },
  });

  // Créer d'autres types de plans pour la base de données
  await prisma.planType.create({
    data: {
      name: "Security",
      description: "Plan de sécurité",
    },
  });

  await prisma.planType.create({
    data: {
      name: "Training",
      description: "Plan de formation",
    },
  });

  // Créer les types d'incidents
  const fireIncidentType = await prisma.incidentType.create({
    data: {
      name: "Incendie",
      description: "Incident lié à un incendie",
    },
  });

  await prisma.incidentType.create({
    data: {
      name: "Accident",
      description: "Accident du travail",
    },
  });

  // Créer les utilisateurs
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@survive.tn",
      password: await bcrypt.hash("Admin@123456", 10),
      firstName: "Administrator",
      lastName: "System",
      role: "ADMIN",
      profile: {
        create: {
          bio: "Administrateur système - Accès complet",
          avatar: "/avatars/admin.png",
          phone: "+216 71 000 000",
          address: "admin@survive.tn",
        },
      },
    },
  });

  const regularUser = await prisma.user.create({
    data: {
      email: "participant@survive.tn",
      password: await bcrypt.hash("Participant@123456", 10),
      firstName: "Participant",
      lastName: "Test",
      role: "USER",
      profile: {
        create: {
          bio: "Utilisateur participant - Accès mode participant uniquement",
          avatar: "/avatars/user.png",
          phone: "+216 71 000 001",
          address: "participant@survive.tn",
        },
      },
    },
  });

  // Créer une équipe
  const team = await prisma.team.create({
    data: {
      name: "Équipe de sécurité",
      description: "Équipe responsable de la sécurité",
    },
  });

  // Ajouter des membres à l'équipe
  const teamMember = await prisma.teamMember.create({
    data: {
      role: "LEADER",
      userId: adminUser.id,
      teamId: team.id,
    },
  });

  // Créer un plan
  const plan = await prisma.plan.create({
    data: {
      name: "Plan de maintenance annuel",
      description: "Maintenance préventive des équipements",
      startDate: new Date("2024-04-01"),
      endDate: new Date("2024-04-30"),
      status: "in_progress",
      typeId: maintenanceType.id,
    },
  });

  // Créer une tâche
  await prisma.task.create({
    data: {
      title: "Vérification des extincteurs",
      description: "Vérifier et remplacer si nécessaire les extincteurs",
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: new Date("2024-04-15"),
      creatorId: adminUser.id,
      teamId: team.id,
      assigneeId: teamMember.id,
    },
  });

  // Créer un incident
  const incident = await prisma.incident.create({
    data: {
      name: "Fuite d'eau",
      description: "Fuite d'eau dans le bâtiment A",
      status: "IN_PROGRESS",
      location: "Bâtiment A",
      resources: "Équipe de maintenance",
      requiredVehicles: "Camion de maintenance",
      latitude: "48.8566",
      longitude: "2.3522",
      delay: 0,
      incidentDate: new Date(),
      reporterId: regularUser.id,
      typeId: fireIncidentType.id,
      teamId: team.id,
      planId: plan.id,
    },
  });

  // Créer une structure de rapport
  const reportStructure = await prisma.reportStructure.create({
    data: {
      name: "Rapport d'incident standard",
      template: {
        sections: [
          {
            title: "Description",
            type: "text",
          },
          {
            title: "Actions prises",
            type: "list",
          },
          {
            title: "Recommandations",
            type: "text",
          },
        ],
      },
    },
  });

  // Créer un rapport
  await prisma.report.create({
    data: {
      title: "Rapport d'incident - Fuite d'eau",
      content: "Rapport détaillé de l'incident de fuite d'eau",
      authorId: adminUser.id,
      structureId: reportStructure.id,
      incidentId: incident.id,
    },
  });

  // Créer un message d'équipe
  await prisma.teamChat.create({
    data: {
      message: "Nouveau plan de maintenance créé",
      senderId: adminUser.id,
      teamId: team.id,
    },
  });

  // Créer une usine avec 5 processus
  const factory = await prisma.factory.create({
    data: {
      name: "Usine de Production Pharmaceutique",
      code: "UPP-001",
      description: "Site principal de production de médicaments",
      address: "Zone Industrielle Ben Arous",
      city: "Ben Arous",
      postalCode: "2013",
      country: "Tunisie",
      region: "Tunis",
      coordinates: { lat: 36.744751, lng: 10.224242 },
      managerId: adminUser.id,
      department: "Production",
      division: "Manufacturing",
      phoneNumber: "+216 71 234 567",
      email: "production@pharma.tn",
      surfaceArea: 15000,
      employeeCount: 250,
      operatingHours: {
        open: "07:00",
        close: "19:00",
        days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      },
      timezone: "Africa/Tunis",
      isActive: true,
      criticalityLevel: "critique",
      certifications: ["ISO 9001", "ISO 14001", "GMP", "BPF"],
      complianceStandards: ["RGPD", "ISO 27001"],
      createdById: adminUser.id,
    },
  });

  // Processus 1: Production Ligne A
  await prisma.process.create({
    data: {
      name: "Production Ligne A - Comprimés",
      description:
        "Ligne de production automatisée pour la fabrication de comprimés",
      department: "Production",
      location: "Bâtiment A - Niveau 2",
      impact:
        "Arrêt complet de la production de comprimés, perte de 75 000 DT/jour",
      criticality: "critical",
      factoryId: factory.id,
      processOwner: "Mohamed Karim",
      ownerRole: "Chef de Production",
      ownerEmail: "m.karim@pharma.tn",
      ownerPhone: "+216 98 123 456",
      rto: 4,
      mtpd: 8,
      rpo: 2,
      mbco: "12 heures maximum",
      criticalTimes:
        "Fin de trimestre, haute saison (Mai-Septembre), périodes de livraison mensuelle",
      financialImpact:
        "Perte CA: 75 000 DT/jour, pénalités: 15 000 DT/jour, coûts récupération: 30 000 DT",
      operationalImpact:
        "Arrêt ligne production, retards livraisons, surcharge autres lignes",
      reputationImpact:
        "Perte confiance clients, impact image marque, risque parts de marché",
      operationalCapacityImpact:
        "Réduction capacité 50%, retards 7-10 jours, impossibilité SLA",
      mainFunctionality:
        "Production continue de comprimés selon normes GMP et délais contractuels",
      productDependencies:
        "Paracétamol 500mg | Dépendance totale\nIbuprofène 400mg | Dépendance critique",
      interServiceDependencies:
        "Maintenance | Support quotidien\nQualité | Contrôle obligatoire\nLogistique | Approvisionnement",
      supplierContinuityPlan: true,
      hasSLAClause: true,
      hasBackupSystems: true,
      dependsOnPhysicalInfra: true,
      canWorkRemotely: false,
      canUseOtherInfra: false,
      canBeReplaced: false,
      canReassignEquipment: false,
      backupCompatible: true,
      canReassignOfficeEquipment: false,
      neededAfterDisruption: true,
      hasAlternativeAccess: false,
      hasReplacement: false,
      hasAlternativeSupplier: false,
      supplierHasContinuityPlan: true,
    },
  });

  // Processus 2: Contrôle Qualité
  await prisma.process.create({
    data: {
      name: "Contrôle Qualité et Conformité",
      description:
        "Processus de contrôle qualité et validation des lots de production",
      department: "Qualité",
      location: "Laboratoire Central - Bâtiment C",
      impact:
        "Impossibilité de libérer les lots, blocage des livraisons clients",
      criticality: "high",
      factoryId: factory.id,
      processOwner: "Leila Mansouri",
      ownerRole: "Responsable Assurance Qualité",
      ownerEmail: "l.mansouri@pharma.tn",
      ownerPhone: "+216 98 234 567",
      rto: 8,
      mtpd: 24,
      rpo: 4,
      mbco: "24 heures maximum",
      criticalTimes:
        "Fin de production de lots majeurs, audits externes, inspections réglementaires",
      financialImpact:
        "Blocage stocks: 100 000 DT, pénalités retard: 20 000 DT/jour",
      operationalImpact:
        "Accumulation lots non validés, arrêt expéditions, saturation laboratoire",
      reputationImpact:
        "Risque rappel produits, perte certifications, sanctions autorités",
      operationalCapacityImpact:
        "Capacité validation réduite 70%, délais validation +3 jours",
      mainFunctionality:
        "Assurer conformité produits aux normes GMP et BPF, validation libération lots",
      productDependencies:
        "Tous les produits | Dépendance totale - validation obligatoire",
      interServiceDependencies:
        "Production | Prélèvements échantillons\nLogistique | Coordination expéditions\nRéglementaire | Conformité normes",
      supplierContinuityPlan: true,
      hasSLAClause: true,
      hasBackupSystems: true,
      dependsOnPhysicalInfra: true,
      canWorkRemotely: true,
      canUseOtherInfra: true,
      canBeReplaced: true,
      canReassignEquipment: true,
      backupCompatible: true,
      canReassignOfficeEquipment: true,
      neededAfterDisruption: true,
      hasAlternativeAccess: true,
      hasReplacement: true,
      hasAlternativeSupplier: true,
      supplierHasContinuityPlan: true,
    },
  });

  // Processus 3: Gestion des Stocks
  await prisma.process.create({
    data: {
      name: "Gestion des Stocks et Approvisionnement",
      description:
        "Gestion des matières premières, emballages et produits finis",
      department: "Logistique",
      location: "Entrepôt Principal - Zone A",
      impact: "Rupture de stocks, arrêt production, retards livraisons",
      criticality: "high",
      factoryId: factory.id,
      processOwner: "Kamel Trabelsi",
      ownerRole: "Responsable Logistique",
      ownerEmail: "k.trabelsi@pharma.tn",
      ownerPhone: "+216 98 345 678",
      rto: 12,
      mtpd: 48,
      rpo: 8,
      mbco: "48 heures maximum",
      criticalTimes:
        "Début de mois (réceptions), fin de mois (inventaires), périodes hautes commandes",
      financialImpact:
        "Perte optimisation stocks: 30 000 DT, coûts stockage urgence: 15 000 DT",
      operationalImpact:
        "Désorganisation flux, ruptures stocks, retards approvisionnement production",
      reputationImpact:
        "Retards livraisons clients, insatisfaction fournisseurs",
      operationalCapacityImpact:
        "Gestion manuelle, erreurs inventaires +40%, délais traitement +5 jours",
      mainFunctionality:
        "Optimiser niveaux stocks, assurer disponibilité matières premières, gérer flux entrées/sorties",
      productDependencies:
        "Matières premières | Dépendance totale production\nEmballages | Dépendance critique conditionnement",
      interServiceDependencies:
        "Production | Fourniture matières\nAchats | Coordination commandes\nQualité | Traçabilité",
      supplierContinuityPlan: true,
      hasSLAClause: true,
      hasBackupSystems: true,
      dependsOnPhysicalInfra: true,
      canWorkRemotely: true,
      canUseOtherInfra: true,
      canBeReplaced: true,
      canReassignEquipment: true,
      backupCompatible: true,
      canReassignOfficeEquipment: true,
      neededAfterDisruption: true,
      hasAlternativeAccess: true,
      hasReplacement: true,
      hasAlternativeSupplier: true,
      supplierHasContinuityPlan: true,
    },
  });

  // Processus 4: Maintenance Préventive
  await prisma.process.create({
    data: {
      name: "Maintenance Préventive Équipements",
      description:
        "Programme de maintenance préventive et corrective des équipements de production",
      department: "Maintenance",
      location: "Atelier Maintenance - Bâtiment B",
      impact: "Pannes équipements non planifiées, arrêts production imprévus",
      criticality: "medium",
      factoryId: factory.id,
      processOwner: "Rachid Bouaziz",
      ownerRole: "Chef Maintenance",
      ownerEmail: "r.bouaziz@pharma.tn",
      ownerPhone: "+216 98 456 789",
      rto: 24,
      mtpd: 72,
      rpo: 12,
      mbco: "72 heures maximum",
      criticalTimes:
        "Arrêts techniques planifiés, périodes maintenance préventive trimestrielle",
      financialImpact:
        "Augmentation pannes: 40 000 DT, coûts réparations urgentes: +60%",
      operationalImpact:
        "Disponibilité équipements réduite, augmentation temps arrêts imprévus",
      reputationImpact:
        "Fiabilité production affectée, retards maintenance planifiée",
      operationalCapacityImpact:
        "Capacité maintenance réduite 50%, délais interventions +2 jours",
      mainFunctionality:
        "Assurer disponibilité maximale équipements production via maintenance préventive et interventions rapides",
      productDependencies:
        "Équipements production | Dépendance totale fonctionnement usine",
      interServiceDependencies:
        "Production | Coordination arrêts\nAchats | Pièces détachées\nQualité | Qualification équipements",
      supplierContinuityPlan: true,
      hasSLAClause: true,
      hasBackupSystems: false,
      dependsOnPhysicalInfra: true,
      canWorkRemotely: false,
      canUseOtherInfra: false,
      canBeReplaced: true,
      canReassignEquipment: true,
      backupCompatible: false,
      canReassignOfficeEquipment: true,
      neededAfterDisruption: true,
      hasAlternativeAccess: false,
      hasReplacement: true,
      hasAlternativeSupplier: true,
      supplierHasContinuityPlan: false,
    },
  });

  // Processus 5: Système Informatique (ERP/MES)
  await prisma.process.create({
    data: {
      name: "Système Informatique ERP/MES",
      description:
        "Gestion du système ERP et MES pour traçabilité et pilotage production",
      department: "IT",
      location: "Salle Serveurs - Datacenter",
      impact:
        "Perte traçabilité production, impossibilité saisie données, arrêt pilotage",
      criticality: "critical",
      factoryId: factory.id,
      processOwner: "Sami Gharbi",
      ownerRole: "Responsable IT",
      ownerEmail: "s.gharbi@pharma.tn",
      ownerPhone: "+216 98 567 890",
      rto: 2,
      mtpd: 4,
      rpo: 1,
      mbco: "4 heures maximum",
      criticalTimes:
        "24h/24 - système critique permanent, pics fin de mois (clôtures), inventaires",
      financialImpact:
        "Arrêt complet usine: 150 000 DT/jour, perte données: impact majeur",
      operationalImpact:
        "Arrêt total production et logistique, impossibilité traçabilité réglementaire",
      reputationImpact:
        "Non-conformité réglementaire, risque perte certifications, sanctions",
      operationalCapacityImpact:
        "Gestion manuelle impossible au-delà 4h, perte données traçabilité",
      mainFunctionality:
        "Assurer disponibilité 24/7 systèmes ERP/MES, garantir traçabilité réglementaire, pilotage production en temps réel",
      productDependencies:
        "Tous processus | Dépendance totale - système transverse obligatoire",
      interServiceDependencies:
        "Production | Traçabilité\nQualité | Données conformité\nLogistique | Gestion stocks\nMaintenance | GMAO",
      supplierContinuityPlan: true,
      hasSLAClause: true,
      hasBackupSystems: true,
      dependsOnPhysicalInfra: true,
      canWorkRemotely: true,
      canUseOtherInfra: true,
      canBeReplaced: false,
      canReassignEquipment: true,
      backupCompatible: true,
      canReassignOfficeEquipment: true,
      neededAfterDisruption: true,
      hasAlternativeAccess: true,
      hasReplacement: true,
      hasAlternativeSupplier: true,
      supplierHasContinuityPlan: true,
    },
  });

  console.log("✅ Usine créée avec 5 processus");
  console.log("Seed completed successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
