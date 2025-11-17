/**
 * Script de Vérification Post-Migration
 *
 * Ce script vérifie que la migration des catégories vers Factories
 * s'est déroulée correctement et que toutes les données sont intègres.
 *
 * UTILISATION :
 *   npx tsx scripts/verify-factory-migration.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface VerificationReport {
  factories: {
    total: number;
    active: number;
    inactive: number;
    withProcesses: number;
    withReports: number;
  };
  processes: {
    total: number;
    withFactory: number;
    withoutFactory: number;
    percentageLinked: number;
  };
  reports: {
    total: number;
    withFactory: number;
    withoutFactory: number;
    withCategory: number;
    percentageLinked: number;
  };
  integrity: {
    orphanedProcesses: number;
    orphanedReports: number;
    duplicateFactoryCodes: number;
    emptyFactoryNames: number;
    recommendations: string[];
    errors: string[];
  };
  recommendations: string[];
  errors: string[];
}

/**
 * Vérifie les Factories
 */
async function verifyFactories() {
  console.log("\n🏭 Vérification des Factories...\n");

  const totalFactories = await prisma.factory.count();
  const activeFactories = await prisma.factory.count({
    where: { isActive: true },
  });
  const inactiveFactories = await prisma.factory.count({
    where: { isActive: false },
  });

  // Factories avec au moins un process
  const factoriesWithProcesses = await prisma.factory.count({
    where: {
      processes: {
        some: {},
      },
    },
  });

  // Factories avec au moins un rapport
  const factoriesWithReports = await prisma.factory.count({
    where: {
      biaReports: {
        some: {},
      },
    },
  });

  console.log(`   ✅ Total Factories          : ${totalFactories}`);
  console.log(`   ✅ Factories actives        : ${activeFactories}`);
  console.log(`   ⚠️  Factories inactives      : ${inactiveFactories}`);
  console.log(`   ✅ Avec processus           : ${factoriesWithProcesses}`);
  console.log(`   ✅ Avec rapports            : ${factoriesWithReports}`);

  return {
    total: totalFactories,
    active: activeFactories,
    inactive: inactiveFactories,
    withProcesses: factoriesWithProcesses,
    withReports: factoriesWithReports,
  };
}

/**
 * Vérifie les Process
 */
async function verifyProcesses() {
  console.log("\n⚙️  Vérification des Processus...\n");

  const totalProcesses = await prisma.process.count();
  const processesWithFactory = await prisma.process.count({
    where: {
      factoryId: { not: null },
    },
  });
  const processesWithoutFactory = totalProcesses - processesWithFactory;
  const percentageLinked =
    totalProcesses > 0
      ? Math.round((processesWithFactory / totalProcesses) * 100)
      : 0;

  console.log(`   ✅ Total Processus          : ${totalProcesses}`);
  console.log(`   ✅ Liés à une Factory       : ${processesWithFactory}`);
  console.log(
    `   ${
      processesWithoutFactory > 0 ? "⚠️ " : "✅"
    } Sans Factory             : ${processesWithoutFactory}`
  );
  console.log(`   ✅ Pourcentage lié          : ${percentageLinked}%`);

  return {
    total: totalProcesses,
    withFactory: processesWithFactory,
    withoutFactory: processesWithoutFactory,
    percentageLinked,
  };
}

/**
 * Vérifie les BiaReports
 */
async function verifyReports() {
  console.log("\n📄 Vérification des Rapports BIA...\n");

  const totalReports = await prisma.biaReport.count();
  const reportsWithFactory = await prisma.biaReport.count({
    where: {
      factoryId: { not: null },
    },
  });
  const reportsWithoutFactory = totalReports - reportsWithFactory;
  const reportsWithCategory = await prisma.biaReport.count({
    where: {
      category: { not: null },
    },
  });
  const percentageLinked =
    totalReports > 0
      ? Math.round((reportsWithFactory / totalReports) * 100)
      : 0;

  console.log(`   ✅ Total Rapports           : ${totalReports}`);
  console.log(`   ✅ Liés à une Factory       : ${reportsWithFactory}`);
  console.log(
    `   ${
      reportsWithoutFactory > 0 ? "⚠️ " : "✅"
    } Sans Factory             : ${reportsWithoutFactory}`
  );
  console.log(`   ℹ️  Avec category (legacy)  : ${reportsWithCategory}`);
  console.log(`   ✅ Pourcentage lié          : ${percentageLinked}%`);

  return {
    total: totalReports,
    withFactory: reportsWithFactory,
    withoutFactory: reportsWithoutFactory,
    withCategory: reportsWithCategory,
    percentageLinked,
  };
}

/**
 * Vérifie l'intégrité des données
 */
async function verifyIntegrity() {
  console.log("\n🔍 Vérification de l'intégrité des données...\n");

  const recommendations: string[] = [];
  const errors: string[] = [];

  // 1. Processus orphelins (factoryId pointe vers une Factory inexistante)
  const processes = await prisma.process.findMany({
    where: {
      factoryId: { not: null },
    },
    select: {
      id: true,
      name: true,
      factoryId: true,
    },
  });

  let orphanedProcesses = 0;
  for (const process of processes) {
    const factory = await prisma.factory.findUnique({
      where: { id: process.factoryId! },
    });
    if (!factory) {
      orphanedProcesses++;
      errors.push(
        `Process "${process.name}" (${process.id}) référence une Factory inexistante (${process.factoryId})`
      );
    }
  }

  if (orphanedProcesses > 0) {
    console.log(`   ❌ Processus orphelins      : ${orphanedProcesses}`);
  } else {
    console.log(`   ✅ Processus orphelins      : 0`);
  }

  // 2. Rapports orphelins
  const reports = await prisma.biaReport.findMany({
    where: {
      factoryId: { not: null },
    },
    select: {
      id: true,
      name: true,
      factoryId: true,
    },
  });

  let orphanedReports = 0;
  for (const report of reports) {
    const factory = await prisma.factory.findUnique({
      where: { id: report.factoryId! },
    });
    if (!factory) {
      orphanedReports++;
      errors.push(
        `Rapport "${report.name}" (${report.id}) référence une Factory inexistante (${report.factoryId})`
      );
    }
  }

  if (orphanedReports > 0) {
    console.log(`   ❌ Rapports orphelins       : ${orphanedReports}`);
  } else {
    console.log(`   ✅ Rapports orphelins       : 0`);
  }

  // 3. Codes Factory en doublon
  const factories = await prisma.factory.findMany({
    select: {
      code: true,
    },
  });

  const codes = factories.map((f) => f.code);
  const uniqueCodes = new Set(codes);
  const duplicateFactoryCodes = codes.length - uniqueCodes.size;

  if (duplicateFactoryCodes > 0) {
    console.log(`   ❌ Codes Factory dupliqués  : ${duplicateFactoryCodes}`);
    errors.push(`${duplicateFactoryCodes} codes Factory sont dupliqués`);
  } else {
    console.log(`   ✅ Codes Factory dupliqués  : 0`);
  }

  // 4. Factories avec nom vide
  const emptyNameFactories = await prisma.factory.count({
    where: {
      name: "",
    },
  });

  if (emptyNameFactories > 0) {
    console.log(`   ❌ Factories nom vide       : ${emptyNameFactories}`);
    errors.push(`${emptyNameFactories} Factories ont un nom vide`);
  } else {
    console.log(`   ✅ Factories nom vide       : 0`);
  }

  // 5. Rapports avec category mais sans factoryId
  const reportsWithCategoryNoFactory = await prisma.biaReport.count({
    where: {
      category: { not: null },
      factoryId: null,
    },
  });

  if (reportsWithCategoryNoFactory > 0) {
    console.log(
      `   ⚠️  Rapports category non migrés : ${reportsWithCategoryNoFactory}`
    );
    recommendations.push(
      `${reportsWithCategoryNoFactory} rapports ont une category mais pas de factoryId. Exécuter à nouveau le script de migration.`
    );
  } else {
    console.log(`   ✅ Rapports category migrés : Tous`);
  }

  return {
    orphanedProcesses,
    orphanedReports,
    duplicateFactoryCodes,
    emptyFactoryNames: emptyNameFactories,
    recommendations,
    errors,
  };
}

/**
 * Affiche les statistiques par Factory
 */
async function displayFactoryStats() {
  console.log("\n📊 Statistiques par Factory...\n");

  const factories = await prisma.factory.findMany({
    include: {
      _count: {
        select: {
          processes: true,
          biaReports: true,
        },
      },
    },
    orderBy: {
      processes: {
        _count: "desc",
      },
    },
    take: 10, // Top 10
  });

  if (factories.length === 0) {
    console.log("   ⚠️  Aucune Factory trouvée");
    return;
  }

  console.log("   Top 10 Factories par nombre de processus:\n");
  factories.forEach((factory, index) => {
    console.log(`   ${index + 1}. ${factory.name} (${factory.code})`);
    console.log(`      - Processus: ${factory._count.processes}`);
    console.log(`      - Rapports: ${factory._count.biaReports}`);
    console.log(
      `      - Statut: ${factory.isActive ? "✅ Active" : "⚠️ Inactive"}`
    );
    console.log("");
  });
}

/**
 * Génère des recommandations
 */
function generateRecommendations(report: VerificationReport): string[] {
  const recommendations: string[] = [];

  // Processus sans Factory
  if (report.processes.withoutFactory > 0) {
    recommendations.push(
      `${report.processes.withoutFactory} processus ne sont liés à aucune Factory. Considérez de les associer ou créer une Factory "Non assigné".`
    );
  }

  // Rapports sans Factory
  if (report.reports.withoutFactory > 0) {
    recommendations.push(
      `${report.reports.withoutFactory} rapports ne sont liés à aucune Factory. Vérifiez s'ils ont une category à migrer.`
    );
  }

  // Factories sans processus ni rapports
  if (
    report.factories.total > 0 &&
    report.factories.withProcesses === 0 &&
    report.factories.withReports === 0
  ) {
    recommendations.push(
      "Certaines Factories n'ont ni processus ni rapports. Vérifiez si elles doivent être supprimées."
    );
  }

  // Taux de liaison faible
  if (report.processes.percentageLinked < 50) {
    recommendations.push(
      `Seulement ${report.processes.percentageLinked}% des processus sont liés à une Factory. Considérez d'améliorer la couverture.`
    );
  }

  return recommendations;
}

/**
 * Affiche le rapport final
 */
function displayFinalReport(report: VerificationReport) {
  console.log("\n" + "=".repeat(70));
  console.log("📊 RAPPORT FINAL DE VÉRIFICATION");
  console.log("=".repeat(70) + "\n");

  // Résumé
  console.log("📈 RÉSUMÉ:\n");
  console.log(
    `   Factories    : ${report.factories.total} (${report.factories.active} actives)`
  );
  console.log(
    `   Processus    : ${report.processes.total} (${report.processes.percentageLinked}% liés)`
  );
  console.log(
    `   Rapports BIA : ${report.reports.total} (${report.reports.percentageLinked}% liés)`
  );

  // Intégrité
  console.log("\n🔒 INTÉGRITÉ:\n");
  const hasIntegrityIssues =
    report.integrity.orphanedProcesses > 0 ||
    report.integrity.orphanedReports > 0 ||
    report.integrity.duplicateFactoryCodes > 0 ||
    report.integrity.emptyFactoryNames > 0;

  if (hasIntegrityIssues) {
    console.log("   ❌ PROBLÈMES DÉTECTÉS:");
    if (report.integrity.orphanedProcesses > 0) {
      console.log(
        `      - ${report.integrity.orphanedProcesses} processus orphelins`
      );
    }
    if (report.integrity.orphanedReports > 0) {
      console.log(
        `      - ${report.integrity.orphanedReports} rapports orphelins`
      );
    }
    if (report.integrity.duplicateFactoryCodes > 0) {
      console.log(
        `      - ${report.integrity.duplicateFactoryCodes} codes Factory dupliqués`
      );
    }
    if (report.integrity.emptyFactoryNames > 0) {
      console.log(
        `      - ${report.integrity.emptyFactoryNames} Factories avec nom vide`
      );
    }
  } else {
    console.log("   ✅ Aucun problème d'intégrité détecté");
  }

  // Recommandations
  if (report.recommendations.length > 0) {
    console.log("\n💡 RECOMMANDATIONS:\n");
    report.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
  }

  // Erreurs
  if (report.errors.length > 0) {
    console.log("\n❌ ERREURS:\n");
    report.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  }

  // Statut final
  console.log("\n" + "=".repeat(70));
  if (hasIntegrityIssues || report.errors.length > 0) {
    console.log("⚠️  STATUT: ATTENTION REQUISE");
    console.log("   Veuillez corriger les problèmes identifiés.");
  } else if (report.recommendations.length > 0) {
    console.log("✅ STATUT: BON (avec recommandations)");
    console.log(
      "   La migration est réussie, mais des améliorations sont possibles."
    );
  } else {
    console.log("✅ STATUT: EXCELLENT");
    console.log("   La migration est parfaitement réussie !");
  }
  console.log("=".repeat(70) + "\n");
}

/**
 * Fonction principale
 */
async function main() {
  console.log("\n" + "=".repeat(70));
  console.log("🔍 VÉRIFICATION POST-MIGRATION FACTORY");
  console.log("=".repeat(70));

  try {
    const report: VerificationReport = {
      factories: await verifyFactories(),
      processes: await verifyProcesses(),
      reports: await verifyReports(),
      integrity: {
        orphanedProcesses: 0,
        orphanedReports: 0,
        duplicateFactoryCodes: 0,
        emptyFactoryNames: 0,
        recommendations: [],
        errors: [],
      },
      recommendations: [],
      errors: [],
    };

    const integrity = await verifyIntegrity();
    report.integrity = integrity;
    report.errors = integrity.errors;

    // Ajouter recommandations basées sur l'intégrité
    report.recommendations.push(...integrity.recommendations);

    // Générer recommandations supplémentaires
    report.recommendations.push(...generateRecommendations(report));

    // Afficher stats par Factory
    await displayFactoryStats();

    // Rapport final
    displayFinalReport(report);
  } catch (error) {
    console.error("\n❌ Erreur lors de la vérification:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter
main();
