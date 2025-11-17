/**
 * Script pour remplir le formulaire BIA
 * Usage: npx tsx scripts/test-bia-form-fill.ts
 */

import { PrismaClient, CriticalityLevel, Process } from "@prisma/client";

const prisma = new PrismaClient();

async function fillBiaFormWithTestData() {
  console.log(
    "🚀 Début du remplissage du formulaire BIA avec données de test...\n"
  );

  try {
    // 1. Récupérer ou créer un utilisateur admin
    console.log("👤 Récupération d'un utilisateur admin...");
    let adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (!adminUser) {
      console.log(
        "   ⚠️ Aucun utilisateur admin trouvé, création d'un utilisateur de test..."
      );
      adminUser = await prisma.user.create({
        data: {
          email: `admin-${Date.now()}@test.com`,
          password: "password", // Note: In a real app, hash this password
          role: "ADMIN",
          firstName: "Admin",
          lastName: "User",
        },
      });
      console.log("   ✅ Utilisateur admin de test créé:", adminUser.email);
    } else {
      console.log("   ✅ Utilisateur admin trouvé:", adminUser.email);
    }

    // 2. Récupérer ou créer une usine
    console.log("\n📍 Récupération de l'usine...");
    let factory = await prisma.factory.findFirst();

    if (!factory) {
      console.log(
        "   ⚠️  Aucune usine trouvée, création d'une usine de test..."
      );
      factory = await prisma.factory.create({
        data: {
          name: "Usine Principale",
          code: "USN-001",
          address: "Tunis, Tunisie",
          description: "Usine de production pharmaceutique",
          createdById: adminUser.id,
        },
      });
      console.log("   ✅ Usine créée:", factory.name);
    } else {
      console.log("   ✅ Usine trouvée:", factory.name);
    }

    // 2. Créer le processus BIA complet avec toutes les données
    console.log("\n📋 Création du processus BIA...");

    const processData = {
      // Section 1: Informations Générales
      name: "Processus de Production - Ligne A",
      description:
        "Processus critique de fabrication des produits pharmaceutiques sur la ligne de production A",
      department: "Production",
      location: "Usine Principale - Bâtiment B",
      factoryId: factory.id,

      // Section 2: Responsable
      processOwner: "Ahmed Ben Salem",
      ownerRole: "Responsable Production",
      ownerEmail: "ahmed.bensalem@entreprise.com",
      ownerPhone: "+216 71 234 567",

      // Section 3: Criticité & Métriques
      impact:
        "Arrêt complet de la production, perte de revenus de 50 000 DT/jour",
      criticality: "critical" as CriticalityLevel,
      rto: 4,
      mtpd: 8,
      rpo: 2,
      mbco: "12 heures maximum avant impact client",

      // Section 2b: Impacts Détaillés
      criticalTimes:
        "Fin de mois (clôture comptable)\nHaute saison (Juin-Septembre)\nPériode de Ramadan",
      financialImpact:
        "Perte de chiffre d'affaires: 50 000 DT/jour\nPénalités contractuelles: 10 000 DT/jour\nCoûts de récupération: 20 000 DT",
      operationalImpact:
        "Arrêt de la ligne de production\nRetard des livraisons clients\nSurcharge des autres lignes de production\nPerte de productivité: 30%",
      reputationImpact:
        "Perte de confiance des clients\nImpact sur l'image de marque\nRisque de perte de parts de marché\nMécontentement des partenaires",
      operationalCapacityImpact:
        "Réduction de capacité de 40%\nRetards de livraison: 5-7 jours\nImpossibilité de respecter les SLA\nAccumulation du backlog",

      // Section 3: Périmètre et Dépendances
      mainFunctionality:
        "Assurer la production continue des médicaments avec respect des normes GMP et des délais de livraison aux distributeurs",
      productDependencies:
        "Médicament A | Dépendance totale - production exclusive\nMédicament B | Dépendance partielle - backup sur Ligne C\nMédicament C | Dépendance critique - 80% de la production",
      interServiceDependencies:
        "Maintenance | Support technique quotidien et préventif\nQualité | Contrôle qualité obligatoire à chaque batch\nLogistique | Approvisionnement matières premières\nIT | Système MES pour traçabilité",

      // Champs Boolean requis
      supplierContinuityPlan: true,
      hasSLAClause: true,
      hasBackupSystems: true,
      dependsOnPhysicalInfra: true,
      canWorkRemotely: false,
      canUseOtherInfra: true,
      canBeReplaced: true,
      canReassignEquipment: false,
      backupCompatible: true,
      canReassignOfficeEquipment: true,
      neededAfterDisruption: true,
      hasAlternativeAccess: true,
      hasReplacement: true,
      hasAlternativeSupplier: true,
      supplierHasContinuityPlan: true,

      // Activités Critiques (JSON)
      activitesCritiques: JSON.stringify([
        {
          nom: "Préparation des matières premières",
          criticite: "critical",
          delai: "Immédiat",
          rto: 2,
          mtpd: 4,
          rpo: 1,
          mbco: "Aucune production possible sans cette activité",
          impactsOperationnels: "Blocage complet de la chaîne",
          impactsReglementaires: "Non-conformité GMP",
          impactsImage: "Perte de confiance client",
        },
        {
          nom: "Contrôle qualité en cours de production",
          criticite: "high",
          delai: "4 heures",
          rto: 4,
          mtpd: 8,
          rpo: 2,
          mbco: "Risque de non-conformité produits",
          impactsOperationnels: "Arrêt ligne si défaut détecté",
          impactsReglementaires: "Sanctions réglementaires possibles",
          impactsImage: "Risque rappel produits",
        },
        {
          nom: "Conditionnement final et étiquetage",
          criticite: "high",
          delai: "8 heures",
          rto: 6,
          mtpd: 12,
          rpo: 2,
          mbco: "Produits non commercialisables",
          impactsOperationnels: "Accumulation de stock semi-fini",
          impactsReglementaires: "Traçabilité compromise",
          impactsImage: "Retards livraison clients",
        },
      ]),

      // Fournisseurs Externes (JSON)
      fournisseursExternes: JSON.stringify([
        {
          nom: "PharmaChem SARL",
          servicesOfferts: "Matières premières actives",
          contactNom: "Mohamed Trabelsi",
          contactTelephone: "+216 71 123 456",
          contactEmail: "contact@pharmachem.tn",
          zoneGeographique: "Tunisie - Sousse",
          rto: 24,
          mtpd: 48,
          planContinuiteActivite: "oui",
          clauseSLA: "oui",
        },
        {
          nom: "PackTech International",
          servicesOfferts: "Emballages et étiquettes",
          contactNom: "Salah Ben Ali",
          contactTelephone: "+216 71 987 654",
          contactEmail: "s.benali@packtech.com",
          zoneGeographique: "Tunisie - Tunis",
          rto: 48,
          mtpd: 96,
          planContinuiteActivite: "non",
          clauseSLA: "oui",
        },
        {
          nom: "EnergyTech Solutions",
          servicesOfferts: "Maintenance équipements électriques",
          contactNom: "Karim Jebali",
          contactTelephone: "+216 71 555 888",
          contactEmail: "k.jebali@energytech.tn",
          zoneGeographique: "Tunisie - Sfax",
          rto: 12,
          mtpd: 24,
          planContinuiteActivite: "oui",
          clauseSLA: "oui",
        },
      ]),

      // Obligations Légales (JSON)
      obligationsLegales: JSON.stringify([
        {
          nature: "Bonnes Pratiques de Fabrication (GMP)",
          reference: "Directive 2003/94/CE",
          autoriteRegulation:
            "Ministère de la Santé - Direction de la Pharmacie",
          details:
            "Respect obligatoire des normes GMP pour la production pharmaceutique",
          consequencesNonRespect:
            "Suspension de l'autorisation de production\nAmendes: 50 000 - 500 000 DT\nRetrait produits du marché",
        },
        {
          nature: "ISO 9001:2015",
          reference: "ISO 9001:2015",
          autoriteRegulation: "INNORPI",
          details: "Système de management de la qualité certifié",
          consequencesNonRespect:
            "Perte de certification\nPerte de marchés publics\nImpact réputation",
        },
        {
          nature: "RGPD - Protection des données",
          reference: "Règlement (UE) 2016/679",
          autoriteRegulation:
            "INPDP (Instance Nationale de Protection des Données Personnelles)",
          details:
            "Protection des données personnelles des employés et patients",
          consequencesNonRespect:
            "Amendes jusqu'à 4% du CA mondial\nSanctions pénales\nAtteinte à la réputation",
        },
      ]),

      // Systèmes Informatiques (JSON)
      systemesInformatiques: JSON.stringify([
        {
          nom: "SAP ERP Production",
          typeSysteme: "ERP",
          criticite: "critical",
          impactIndisponibilite: "Arrêt complet gestion production",
          activitesAssociees: "Planification, suivi production, traçabilité",
          sauvegardesEnPlace: "oui",
          rto: 4,
          rpo: 1,
          mtpd: 8,
          solutionsContournement: "Mode dégradé manuel avec formulaires papier",
          incidentsAnterieurs: "Panne serveur 15/03/2024 - 2h d'arrêt",
        },
        {
          nom: "Siemens SCADA",
          typeSysteme: "SCADA/Supervision",
          criticite: "high",
          impactIndisponibilite: "Perte de supervision temps réel",
          activitesAssociees: "Supervision équipements, alarmes",
          sauvegardesEnPlace: "oui",
          rto: 2,
          rpo: 0.5,
          mtpd: 4,
          solutionsContournement: "Supervision locale sur automates",
          incidentsAnterieurs: "Aucun incident majeur",
        },
        {
          nom: "LIMS - Laboratoire",
          typeSysteme: "LIMS",
          criticite: "high",
          impactIndisponibilite: "Ralentissement contrôle qualité",
          activitesAssociees: "Gestion analyses, résultats, certificats",
          sauvegardesEnPlace: "oui",
          rto: 8,
          rpo: 4,
          mtpd: 16,
          solutionsContournement: "Saisie manuelle, rattrapage post-incident",
          incidentsAnterieurs: "Mise à jour 01/2024 - 4h indisponibilité",
        },
      ]),

      // Infrastructures Physiques (JSON)
      infrastructuresPhysiques: JSON.stringify([
        {
          nom: "Alimentation électrique principale",
          categorie: "electricite",
          criticite: "critical",
          rto: 0.5,
          mtpd: 2,
          possibiliteTravailDistance: "non",
          alternativesDisponibles:
            "Groupe électrogène 500 kVA\nUPS 100 kVA pour équipements critiques",
        },
        {
          nom: "Système de climatisation salle blanche",
          categorie: "climatisation",
          criticite: "high",
          rto: 2,
          mtpd: 4,
          possibiliteTravailDistance: "non",
          alternativesDisponibles:
            "Système de climatisation redondant\nProcédure arrêt production si température > 25°C",
        },
        {
          nom: "Réseau informatique local (LAN)",
          categorie: "internet",
          criticite: "critical",
          rto: 1,
          mtpd: 2,
          possibiliteTravailDistance: "non",
          alternativesDisponibles:
            "Réseau redondant\nConnexion 4G backup pour systèmes critiques",
        },
      ]),

      // Rôles Personnel (JSON)
      rolesPersonnel: JSON.stringify([
        {
          intituleRole: "Opérateur de production ligne A",
          nombrePersonnes: 8,
          tachesResponsabilites:
            "Conduite ligne production\nContrôles en cours\nEnregistrement données",
          competencesRequises:
            "Formation GMP\nHabilitation machines\nConnaissances produits",
          estCritique: "oui",
          delaiDisponibiliteNecessaire: "Immédiat (équipes 3x8)",
          possibiliteRemplacement: "oui",
          personneRemplacante: "Opérateurs formés des lignes B et C",
          formationNecessaire: "oui",
          dureeFormation: "2 semaines formation + 1 mois tutorat",
          solutionsContournement: "Polyvalence opérateurs autres lignes",
        },
        {
          intituleRole: "Technicien maintenance",
          nombrePersonnes: 3,
          tachesResponsabilites:
            "Maintenance préventive\nDépannage\nRéglages machines",
          competencesRequises:
            "Électromécanique\nAutomatisme\nConnaissance équipements",
          estCritique: "oui",
          delaiDisponibiliteNecessaire: "Moins de 2 heures",
          possibiliteRemplacement: "oui",
          personneRemplacante: "Techniciens équipe centrale",
          formationNecessaire: "oui",
          dureeFormation: "3 mois",
          solutionsContournement: "Appel technicien astreinte",
        },
        {
          intituleRole: "Responsable qualité ligne",
          nombrePersonnes: 2,
          tachesResponsabilites:
            "Validation batches\nLibération lots\nAudits qualité",
          competencesRequises: "Pharmacien\nFormation GMP\nAudits internes",
          estCritique: "oui",
          delaiDisponibiliteNecessaire: "4 heures",
          possibiliteRemplacement: "oui",
          personneRemplacante: "Responsable qualité central",
          formationNecessaire: "oui",
          dureeFormation: "6 mois minimum",
          solutionsContournement: "Validation différée avec traçabilité",
        },
      ]),

      // Équipements Industriels (JSON)
      equipementsIndustriels: JSON.stringify([
        {
          designation: "Mélangeur principal V-200",
          modeleReference: "GERICKE GCM 200",
          tachesRealise: "Mélange matières premières poudre",
          criticite: "critical",
          rto: 8,
          mtpd: 24,
          possibiliteReaffectation: "non",
          solutionsContournement:
            "Utilisation mélangeur ligne B (capacité réduite)",
          tension: "400V",
          typeCourant: "Triphasé",
          puissanceNominale: "15 kW",
          consommationJournaliere: "120 kWh",
          compatibiliteSecours: "oui",
          alternativesDisponibles: "Mélangeur ligne B (50% capacité)",
        },
        {
          designation: "Presse rotative PR-45",
          modeleReference: "FETTE 3090",
          tachesRealise: "Compression comprimés",
          criticite: "critical",
          rto: 12,
          mtpd: 48,
          possibiliteReaffectation: "non",
          solutionsContournement: "Sous-traitance externe",
          tension: "400V",
          typeCourant: "Triphasé",
          puissanceNominale: "22 kW",
          consommationJournaliere: "176 kWh",
          compatibiliteSecours: "oui",
          alternativesDisponibles: "Ligne C (30% capacité)",
        },
        {
          designation: "Enrobeuse automatique EN-300",
          modeleReference: "O'Hara Labcoat",
          tachesRealise: "Enrobage comprimés",
          criticite: "high",
          rto: 16,
          mtpd: 48,
          possibiliteReaffectation: "oui",
          solutionsContournement: "Enrobeuse ligne B ou sous-traitance",
          tension: "400V",
          typeCourant: "Triphasé",
          puissanceNominale: "18 kW",
          consommationJournaliere: "144 kWh",
          compatibiliteSecours: "oui",
          alternativesDisponibles: "Ligne B enrobeuse similaire",
        },
      ]),

      // Équipements Bureautiques (JSON)
      equipementsBureautiques: JSON.stringify([
        {
          type: "PC de supervision production",
          quantiteActuelle: 4,
          tachesUtilisation:
            "Supervision temps réel\nSaisie données production",
          criticite: "high",
          rto: 4,
          mtpd: 8,
          quantiteRequiseApresIncident: 2,
          possibiliteReaffectation: "oui",
          fournisseur: "Dell Technologies",
          solutionsContournement: "PC portables de secours (3 unités)",
        },
        {
          type: "Imprimante étiquettes production",
          quantiteActuelle: 2,
          tachesUtilisation: "Impression étiquettes produits et lots",
          criticite: "critical",
          rto: 2,
          mtpd: 4,
          quantiteRequiseApresIncident: 1,
          possibiliteReaffectation: "oui",
          fournisseur: "Zebra Technologies",
          solutionsContournement:
            "Imprimante backup + étiquettes pré-imprimées",
        },
        {
          type: "Scanner codes-barres",
          quantiteActuelle: 6,
          tachesUtilisation: "Traçabilité matières et produits",
          criticite: "high",
          rto: 4,
          mtpd: 12,
          quantiteRequiseApresIncident: 3,
          possibiliteReaffectation: "oui",
          fournisseur: "Honeywell",
          solutionsContournement: "Saisie manuelle codes + stock scanners",
        },
      ]),

      // Documentations Critiques (JSON)
      documentationsCritiques: JSON.stringify([
        {
          type: "Procédures de fabrication (Batch Records)",
          format: "les_deux",
          emplacementPrincipal:
            "Serveur documentaire GED + Classeur salle production",
          emplacementsSecondaires: "Backup cloud + Coffre-fort archives",
          necessaireApresIncident: "oui",
          rto: 1,
          criticite: "critical",
          modalitesAcces: "Accès GED + copies papier sécurisées",
          possibiliteRemplacement: "oui",
          procedureRecuperation:
            "Impression depuis GED ou utilisation backup cloud",
          responsable: "Responsable Qualité",
          notes: "Documents validés et approuvés - versions contrôlées",
        },
        {
          type: "Plans de maintenance préventive",
          format: "numerique",
          emplacementPrincipal: "Serveur maintenance GMAO",
          emplacementsSecondaires: "Backup quotidien sur NAS",
          necessaireApresIncident: "oui",
          rto: 4,
          criticite: "high",
          modalitesAcces: "Logiciel GMAO - accès réseau",
          possibiliteRemplacement: "oui",
          procedureRecuperation: "Restauration depuis backup NAS",
          responsable: "Chef maintenance",
          notes: "Historique interventions critique pour reprise",
        },
        {
          type: "Certifications et homologations produits",
          format: "les_deux",
          emplacementPrincipal: "Serveur qualité + Classeur certification",
          emplacementsSecondaires: "Cloud sécurisé + Archives papier",
          necessaireApresIncident: "oui",
          rto: 8,
          criticite: "high",
          modalitesAcces: "Accès serveur qualité + coffre-fort",
          possibiliteRemplacement: "non",
          procedureRecuperation: "Récupération auprès autorités (délai long)",
          responsable: "Directeur Qualité",
          notes: "Documents originaux irremplaçables rapidement",
        },
      ]),
    };

    const process = await prisma.process.create({
      data: processData,
    });

    console.log("   ✅ Processus BIA créé avec succès!");
    console.log("   📝 ID:", process.id);
    console.log("   📛 Nom:", process.name);
    console.log("   🎯 Criticité:", process.criticality);
    console.log("   ⏱️  RTO:", process.rto, "heures");
    console.log("   ⏱️  MTPD:", process.mtpd, "heures");

    // 3. Afficher le résumé des données
    console.log("\n📊 Résumé des données insérées:");
    console.log("   ✓ Sections scalaires: 30+ champs");

    const processResult: Process = process;
    console.log(
      "   ✓ Activités critiques:",
      JSON.parse((processResult.activitesCritiques as string) || "[]").length
    );
    console.log(
      "   ✓ Fournisseurs externes:",
      JSON.parse((processResult.fournisseursExternes as string) || "[]").length
    );
    console.log(
      "   ✓ Obligations légales:",
      JSON.parse((processResult.obligationsLegales as string) || "[]").length
    );
    console.log(
      "   ✓ Systèmes informatiques:",
      JSON.parse((processResult.systemesInformatiques as string) || "[]").length
    );
    console.log(
      "   ✓ Infrastructures physiques:",
      JSON.parse((processResult.infrastructuresPhysiques as string) || "[]")
        .length
    );
    console.log(
      "   ✓ Rôles personnel:",
      JSON.parse((processResult.rolesPersonnel as string) || "[]").length
    );
    console.log(
      "   ✓ Équipements industriels:",
      JSON.parse((processResult.equipementsIndustriels as string) || "[]")
        .length
    );
    console.log(
      "   ✓ Équipements bureautiques:",
      JSON.parse((processResult.equipementsBureautiques as string) || "[]")
        .length
    );
    console.log(
      "   ✓ Documentations critiques:",
      JSON.parse((processResult.documentationsCritiques as string) || "[]")
        .length
    );

    console.log("\n✅ Remplissage terminé avec succès!");
    console.log(
      `\n🌐 Accédez au processus: http://localhost:3000/bia/processes/${process.id}`
    );
    console.log(
      "📋 Liste des processus: http://localhost:3000/bia/processes\n"
    );

    return process;
  } catch (error) {
    console.error("❌ Erreur lors du remplissage:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
fillBiaFormWithTestData()
  .then(() => {
    console.log("🎉 Script terminé avec succès!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Erreur fatale:", error);
    process.exit(1);
  });
