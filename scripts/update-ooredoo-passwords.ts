import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

const NEW_PASSWORD = "ooredoo";

async function updateOoredooPasswords() {
  try {
    console.log(
      "🔄 Recherche de tous les utilisateurs avec un email @ooredoo.tn..."
    );

    // Trouver tous les utilisateurs avec un email Ooredoo
    const ooredooUsers = await prisma.user.findMany({
      where: {
        email: {
          endsWith: "@ooredoo.tn",
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (ooredooUsers.length === 0) {
      console.log("⚠️  Aucun utilisateur avec un email @ooredoo.tn trouvé.");
      return;
    }

    console.log(
      `\n📊 ${ooredooUsers.length} utilisateur(s) Ooredoo trouvé(s):\n`
    );
    ooredooUsers.forEach((user, index) => {
      console.log(
        `   ${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`
      );
    });

    console.log(`\n🔐 Hachage du nouveau mot de passe...`);
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);

    console.log(
      `\n🔄 Mise à jour des mots de passe pour ${ooredooUsers.length} utilisateur(s)...\n`
    );

    let successCount = 0;
    let errorCount = 0;

    // Mettre à jour chaque utilisateur
    for (const user of ooredooUsers) {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword },
        });

        console.log(
          `   ✅ ${user.firstName} ${user.lastName} (${user.email}) - Mot de passe mis à jour`
        );
        successCount++;
      } catch (error) {
        console.error(
          `   ❌ Erreur pour ${user.email}:`,
          error instanceof Error ? error.message : error
        );
        errorCount++;
      }
    }

    console.log(`\n📊 Résumé de la mise à jour:`);
    console.log(`   ✅ Succès: ${successCount}`);
    console.log(`   ❌ Erreurs: ${errorCount}`);
    console.log(`   📧 Nouveau mot de passe: "${NEW_PASSWORD}"`);
    console.log(
      `\n💡 Les utilisateurs Ooredoo peuvent maintenant se connecter avec:`
    );
    console.log(`   - Email: [leur email @ooredoo.tn]`);
    console.log(`   - Mot de passe: ${NEW_PASSWORD}`);
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour des mots de passe:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la fonction principale
main().catch((e) => {
  console.error(e);
  process.exit(1);
});

async function main() {
  await updateOoredooPasswords();
}
