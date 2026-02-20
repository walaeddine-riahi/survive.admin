/**
 * Script d'analyse d'un processus spécifique
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function analyzeProcess() {
  const processId = "6987fc69326429e2da5b6a59";

  console.log("🔍 Analyse du processus...\n");

  try {
    const process = await prisma.process.findUnique({
      where: { id: processId },
      include: {
        factory: {
          select: {
            id: true,
            code: true,
            name: true,
            address: true,
            city: true,
            country: true,
          },
        },
      },
    });

    if (!process) {
      console.error("❌ Processus non trouvé!");
      return;
    }

    console.log("✅ PROCESSUS TROUVÉ\n");
    console.log("=".repeat(80));
    console.log(`ID: ${process.id}`);
    console.log(`Nom: ${process.name}`);
    console.log(`Département: ${process.department}`);
    console.log(`Localisation: ${process.location}`);
    console.log(`Criticité: ${process.criticality.toUpperCase()}`);
    console.log(`Description: ${process.description}`);
    console.log("=".repeat(80));

    console.log("\n📊 MÉTRIQUES BIA:");
    console.log(`   RTO (Recovery Time Objective): ${process.rto}h`);
    console.log(`   RPO (Recovery Point Objective): ${process.rpo}h`);
    console.log(`   MTPD (Maximum Tolerable Period): ${process.mtpd}h`);
    console.log(`   MBCO (Minimum Business Continuity): ${process.mbco}`);

    console.log("\n🏭 USINE ASSOCIÉE:");
    if (process.factory) {
      console.log(`   Nom: ${process.factory.name}`);
      console.log(`   Code: ${process.factory.code}`);
      console.log(`   Adresse: ${process.factory.address}`);
      console.log(`   Ville: ${process.factory.city}`);
      console.log(`   Pays: ${process.factory.country}`);
    } else {
      console.log("   Aucune usine associée");
    }

    console.log("\n📋 ANALYSE D'IMPACT:");
    console.log(`   Impact: ${process.impact}`);

    console.log("\n👥 RESPONSABLES:");
    console.log(`   Propriétaire: ${process.processOwner || "Non défini"}`);
    console.log(`   Rôle: ${process.ownerRole || "Non défini"}`);
    console.log(`   Email: ${process.ownerEmail || "Non défini"}`);
    console.log(`   Téléphone: ${process.ownerPhone || "Non défini"}`);

    console.log("\n🔧 INFRASTRUCTURE:");
    console.log(
      `   Dépend d'infrastructure physique: ${
        process.dependsOnPhysicalInfra ? "Oui" : "Non"
      }`
    );
    console.log(
      `   Télétravail possible: ${process.canWorkRemotely ? "Oui" : "Non"}`
    );
    console.log(
      `   Peut utiliser autre infra: ${
        process.canUseOtherInfra ? "Oui" : "Non"
      }`
    );

    console.log("\n💻 SYSTÈMES IT:");
    console.log(`   Systèmes: ${process.itSystems || "Non défini"}`);
    console.log(
      `   Sauvegardes en place: ${process.hasBackupSystems ? "Oui" : "Non"}`
    );

    console.log("\n🏢 FOURNISSEURS:");
    console.log(
      `   Plan de continuité fournisseur: ${
        process.supplierContinuityPlan ? "Oui" : "Non"
      }`
    );
    console.log(`   Clause SLA: ${process.hasSLAClause ? "Oui" : "Non"}`);
    console.log(
      `   Fournisseur alternatif: ${
        process.hasAlternativeSupplier ? "Oui" : "Non"
      }`
    );

    console.log("\n👤 PERSONNEL:");
    console.log(
      `   Peut être remplacé: ${process.canBeReplaced ? "Oui" : "Non"}`
    );
    console.log(
      `   Nombre de personnes: ${process.staffCount || "Non défini"}`
    );

    console.log("\n📄 DOCUMENTATION:");
    console.log(
      `   Nécessaire après perturbation: ${
        process.neededAfterDisruption ? "Oui" : "Non"
      }`
    );
    console.log(
      `   Accès alternatif: ${process.hasAlternativeAccess ? "Oui" : "Non"}`
    );
    console.log(
      `   Remplacement disponible: ${process.hasReplacement ? "Oui" : "Non"}`
    );

    console.log("\n⚙️ ÉQUIPEMENTS:");
    console.log(
      `   Peut réaffecter équipement: ${
        process.canReassignEquipment ? "Oui" : "Non"
      }`
    );
    console.log(
      `   Compatible avec secours: ${process.backupCompatible ? "Oui" : "Non"}`
    );
    console.log(
      `   Peut réaffecter équipement bureau: ${
        process.canReassignOfficeEquipment ? "Oui" : "Non"
      }`
    );

    console.log("\n📅 DATES:");
    console.log(`   Créé le: ${process.createdAt.toLocaleDateString("fr-FR")}`);
    console.log(
      `   Mis à jour le: ${process.updatedAt.toLocaleDateString("fr-FR")}`
    );

    // Vérifier les champs à compléter
    const fieldsToComplete = [];

    if (process.location === "À compléter")
      fieldsToComplete.push("Localisation");
    if (process.impact === "À évaluer selon l'analyse BIA")
      fieldsToComplete.push("Impact");
    if (!process.processOwner)
      fieldsToComplete.push("Propriétaire du processus");
    if (!process.itSystems) fieldsToComplete.push("Systèmes IT");
    if (!process.staffCount) fieldsToComplete.push("Nombre de personnel");

    if (fieldsToComplete.length > 0) {
      console.log("\n⚠️  CHAMPS À COMPLÉTER:");
      fieldsToComplete.forEach((field) => console.log(`   - ${field}`));
    } else {
      console.log("\n✅ Tous les champs principaux sont remplis!");
    }
  } catch (error) {
    console.error("❌ Erreur lors de l'analyse:", error);
  }
}

analyzeProcess()
  .then(() => {
    console.log("\n✅ Analyse terminée!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erreur fatale:", error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
