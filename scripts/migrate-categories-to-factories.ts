/**
 * Script de Migration : Catégories → Factories
 *
 * Ce script migre les données existantes de l'ancien système basé sur
 * des catégories textuelles vers le nouveau système avec entités Factory.
 *
 * UTILISATION :
 *   npx tsx scripts/migrate-categories-to-factories.ts
 *
 * PRÉ-REQUIS :
 *   1. Backup de la base de données
 *   2. Schéma Prisma mis à jour avec le modèle Factory
 *   3. Migration Prisma appliquée (npx prisma migrate dev)
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface MigrationStats {
  categoriesFound: number;
  factoriesCreated: number;
  reportsUpdated: number;
  processesUpdated: number;
  errors: string[];
}

/**
 * Génère un code unique pour une Factory à partir de son nom
 */
function generateFactoryCode(name: string): string {
  // Convertir en majuscules et remplacer les caractères non-alphanumériques
  const baseCode = name
    .toUpperCase()
    .normalize("NFD") // Normaliser les accents
    .replace(/[\u0300-\u036f]/g, "") // Supprimer les diacritiques
    .replace(/[^A-Z0-9]/g, "_") // Remplacer les caractères spéciaux
    .replace(/_+/g, "_") // Remplacer les underscores multiples
    .replace(/^_|_$/g, "") // Supprimer les underscores au début/fin
    .substring(0, 20); // Limiter à 20 caractères

  return baseCode || "FACTORY";
}

/**
 * Nettoie et normalise un nom de catégorie
 */
function normalizeCategory(category: string | null): string | null {
  if (!category) return null;

  return category
    .trim()
    .replace(/\s+/g, " ") // Normaliser les espaces
    .toLowerCase();
}

/**
 * Récupère toutes les catégories uniques des BiaReports
 */
async function getUniqueCategories(): Promise<string[]> {
  console.log("📊 Récupération des catégories uniques...");

  const reports = await prisma.biaReport.findMany({
    where: {
      category: { not: null },
    },
    select: {
      category: true,
    },
  });

  // Normaliser et dédupliquer
  const categoriesSet = new Set<string>();
  reports.forEach((report) => {
    const normalized = normalizeCategory(report.category);
    if (normalized) {
      categoriesSet.add(normalized);
    }
  });

  const uniqueCategories = Array.from(categoriesSet).sort();
  console.log(`   ✅ ${uniqueCategories.length} catégories uniques trouvées`);

  return uniqueCategories;
}

/**
 * Crée une Factory à partir d'un nom de catégorie
 */
async function createFactoryFromCategory(
  categoryName: string,
  createdById: string
): Promise<{ id: string; name: string; code: string }> {
  // Capitaliser le nom pour l'affichage
  const displayName = categoryName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const code = generateFactoryCode(categoryName);

  // Vérifier si le code existe déjà
  const existingFactory = await prisma.factory.findUnique({
    where: { code },
  });

  if (existingFactory) {
    console.log(`   ℹ️  Factory déjà existante : ${displayName} (${code})`);
    return existingFactory;
  }

  // Créer la nouvelle Factory
  const factory = await prisma.factory.create({
    data: {
      name: displayName,
      code: code,
      description: `Factory migrée depuis la catégorie "${categoryName}"`,
      isActive: true,
      createdById: createdById,
    },
  });

  console.log(`   ✅ Factory créée : ${displayName} (${code}) [${factory.id}]`);
  return factory;
}

/**
 * Met à jour les BiaReports avec le factoryId correspondant
 */
async function updateReportsWithFactoryId(
  categoryName: string,
  factoryId: string
): Promise<number> {
  const result = await prisma.biaReport.updateMany({
    where: {
      category: categoryName,
    },
    data: {
      factoryId: factoryId,
    },
  });

  return result.count;
}

/**
 * Met à jour les Process avec le factoryId correspondant (basé sur location)
 */
async function updateProcessesWithFactoryId(
  categoryName: string,
  factoryId: string
): Promise<number> {
  const result = await prisma.process.updateMany({
    where: {
      location: categoryName,
    },
    data: {
      factoryId: factoryId,
    },
  });

  return result.count;
}

/**
 * Récupère le premier auteur disponible pour les Factories
 */
async function getDefaultAuthor(): Promise<string> {
  const firstUser = await prisma.user.findFirst({
    where: {
      role: "ADMIN",
    },
    select: {
      id: true,
    },
  });

  if (!firstUser) {
    throw new Error(
      "Aucun utilisateur ADMIN trouvé. Créez un utilisateur admin avant la migration."
    );
  }

  return firstUser.id;
}

/**
 * Fonction principale de migration
 */
async function migrateCategoriesToFactories(): Promise<MigrationStats> {
  const stats: MigrationStats = {
    categoriesFound: 0,
    factoriesCreated: 0,
    reportsUpdated: 0,
    processesUpdated: 0,
    errors: [],
  };

  console.log("\n🏭 ========================================");
  console.log("🏭  MIGRATION : CATÉGORIES → FACTORIES");
  console.log("🏭 ========================================\n");

  try {
    // 1. Récupérer l'auteur par défaut
    const defaultAuthorId = await getDefaultAuthor();
    console.log(`👤 Auteur par défaut : ${defaultAuthorId}\n`);

    // 2. Récupérer les catégories uniques
    const uniqueCategories = await getUniqueCategories();
    stats.categoriesFound = uniqueCategories.length;

    if (uniqueCategories.length === 0) {
      console.log("\n⚠️  Aucune catégorie à migrer.");
      return stats;
    }

    console.log(`\n📋 Catégories à migrer : ${uniqueCategories.join(", ")}\n`);

    // 3. Créer une Factory pour chaque catégorie
    console.log("🏭 Création des Factories...\n");
    const factoryMap = new Map<string, string>(); // categoryName -> factoryId

    for (const category of uniqueCategories) {
      try {
        const factory = await createFactoryFromCategory(
          category,
          defaultAuthorId
        );
        factoryMap.set(category, factory.id);
        stats.factoriesCreated++;
      } catch (error) {
        const errorMsg = `Erreur lors de la création de la factory "${category}": ${error}`;
        console.error(`   ❌ ${errorMsg}`);
        stats.errors.push(errorMsg);
      }
    }

    console.log(`\n   ✅ ${stats.factoriesCreated} Factories créées\n`);

    // 4. Mettre à jour les BiaReports
    console.log("📝 Mise à jour des BiaReports...\n");

    for (const [category, factoryId] of factoryMap.entries()) {
      try {
        const count = await updateReportsWithFactoryId(category, factoryId);
        stats.reportsUpdated += count;
        console.log(`   ✅ ${count} rapport(s) mis à jour pour "${category}"`);
      } catch (error) {
        const errorMsg = `Erreur lors de la mise à jour des rapports "${category}": ${error}`;
        console.error(`   ❌ ${errorMsg}`);
        stats.errors.push(errorMsg);
      }
    }

    console.log(
      `\n   ✅ ${stats.reportsUpdated} rapports mis à jour au total\n`
    );

    // 5. Mettre à jour les Process (basé sur location)
    console.log("⚙️  Mise à jour des Processus...\n");

    for (const [category, factoryId] of factoryMap.entries()) {
      try {
        const count = await updateProcessesWithFactoryId(category, factoryId);
        stats.processesUpdated += count;
        if (count > 0) {
          console.log(`   ✅ ${count} processus mis à jour pour "${category}"`);
        }
      } catch (error) {
        const errorMsg = `Erreur lors de la mise à jour des processus "${category}": ${error}`;
        console.error(`   ❌ ${errorMsg}`);
        stats.errors.push(errorMsg);
      }
    }

    console.log(
      `\n   ✅ ${stats.processesUpdated} processus mis à jour au total\n`
    );

    // 6. Vérification finale
    console.log("🔍 Vérification post-migration...\n");

    const reportsWithoutFactory = await prisma.biaReport.count({
      where: {
        category: { not: null },
        factoryId: null,
      },
    });

    if (reportsWithoutFactory > 0) {
      console.warn(
        `   ⚠️  ${reportsWithoutFactory} rapport(s) avec catégorie mais sans factoryId`
      );
    } else {
      console.log("   ✅ Tous les rapports avec catégorie ont un factoryId");
    }

    const totalFactories = await prisma.factory.count();
    console.log(`   ✅ Total des Factories : ${totalFactories}`);
  } catch (error) {
    console.error("\n❌ Erreur critique pendant la migration:", error);
    stats.errors.push(`Erreur critique: ${error}`);
    throw error;
  }

  return stats;
}

/**
 * Affiche le rapport de migration
 */
function displayMigrationReport(stats: MigrationStats) {
  console.log("\n📊 ========================================");
  console.log("📊  RAPPORT DE MIGRATION");
  console.log("📊 ========================================\n");

  console.log(`   Catégories trouvées      : ${stats.categoriesFound}`);
  console.log(`   Factories créées         : ${stats.factoriesCreated}`);
  console.log(`   Rapports mis à jour      : ${stats.reportsUpdated}`);
  console.log(`   Processus mis à jour     : ${stats.processesUpdated}`);
  console.log(`   Erreurs                  : ${stats.errors.length}`);

  if (stats.errors.length > 0) {
    console.log("\n⚠️  Erreurs rencontrées :");
    stats.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  }

  console.log("\n========================================\n");

  if (stats.errors.length === 0) {
    console.log("✅ Migration terminée avec succès!");
  } else {
    console.log("⚠️  Migration terminée avec des erreurs.");
  }
}

/**
 * Point d'entrée
 */
async function main() {
  try {
    const stats = await migrateCategoriesToFactories();
    displayMigrationReport(stats);
  } catch (error) {
    console.error("\n💥 La migration a échoué:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration
main();
