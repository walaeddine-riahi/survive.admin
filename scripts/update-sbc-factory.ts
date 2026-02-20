/**
 * Script de mise à jour des informations de l'usine SBC
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateSBCFactory() {
  console.log("🔄 Mise à jour des informations de l'usine SBC...\n");

  try {
    const factory = await prisma.factory.findFirst({
      where: { code: "SBC" },
    });

    if (!factory) {
      console.error("❌ Usine SBC non trouvée!");
      return;
    }

    console.log(`✅ Usine trouvée: ${factory.name} (ID: ${factory.id})`);
    console.log(`📍 Ancienne adresse: ${factory.address || "Non définie"}\n`);

    const updatedFactory = await prisma.factory.update({
      where: { id: factory.id },
      data: {
        name: "Société des Boissons du Capbon (SBC Délice)",
        address: "Km1 Route, Manzil Bu Zalafah 8020",
        city: "Soliman",
        postalCode: "8020",
        region: "Gouvernorat de Nabeul",
        country: "Tunisia",
        description:
          "Usine de production de boissons située à Soliman, Tunisie",
      },
    });

    console.log("✅ Informations mises à jour avec succès!");
    console.log("\n📋 NOUVELLES INFORMATIONS:");
    console.log(`   Nom: ${updatedFactory.name}`);
    console.log(`   Adresse: ${updatedFactory.address}`);
    console.log(`   Ville: ${updatedFactory.city}`);
    console.log(`   Code postal: ${updatedFactory.postalCode}`);
    console.log(`   Région: ${updatedFactory.region}`);
    console.log(`   Pays: ${updatedFactory.country}`);
    console.log(`   Description: ${updatedFactory.description}`);
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour:", error);
  }
}

updateSBCFactory()
  .then(() => {
    console.log("\n✅ Mise à jour terminée!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erreur fatale:", error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
