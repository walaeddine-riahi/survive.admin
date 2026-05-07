const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "participant@test.tn";
  const password = "UserPassword123!";
  const hashedPassword = await bcrypt.hash(password, 10);
  const simulationId = "69fb916364d93d2b6eeb017d";

  try {
    // 1. Créer ou mettre à jour l'utilisateur de test
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: "USER",
      },
      create: {
        email,
        password: hashedPassword,
        firstName: "Jean",
        lastName: "Dupont",
        role: "USER",
        profile: {
          create: {
            bio: "Compte participant créé pour le test de l'espace utilisateur",
            phone: "+216 22 222 222",
            address: "Tunis, Tunisie",
          },
        },
      },
    });

    console.log(`\n✅ Compte utilisateur créé ou mis à jour :`);
    console.log(`Email : ${email}`);
    console.log(`Mot de passe : ${password}`);
    console.log(`ID Utilisateur : ${user.id}`);

    // 2. Vérifier si la simulation existe
    const simulation = await prisma.simulation.findUnique({
      where: { id: simulationId },
    });

    if (!simulation) {
      console.warn(`⚠️ La simulation avec l'ID ${simulationId} n'existe pas en base de données.`);
      // Récupérer la première simulation disponible s'il y en a une
      const firstSim = await prisma.simulation.findFirst();
      if (firstSim) {
        console.log(`💡 Utilisation de la première simulation trouvée : "${firstSim.title}" (ID: ${firstSim.id})`);
        await assignToSimulation(user.id, firstSim.id);
      } else {
        console.warn("❌ Aucune simulation n'a été trouvée en base de données. Créez-en une d'abord.");
      }
    } else {
      console.log(`💡 Simulation trouvée : "${simulation.title}"`);
      await assignToSimulation(user.id, simulation.id);
    }

  } catch (error) {
    console.error("❌ Erreur lors de l'exécution du script :", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function assignToSimulation(userId: string, simulationId: string) {
  // Vérifier si l'assignation existe déjà
  const existingAssignment = await prisma.simulationAssignment.findUnique({
    where: {
      userId_simulationId: {
        userId,
        simulationId,
      },
    },
  });

  if (!existingAssignment) {
    await prisma.simulationAssignment.create({
      data: {
        userId,
        simulationId,
        role: "participant",
        status: "confirmed", // "confirmed" pour qu'il puisse y accéder directement
      },
    });
    console.log(`✅ Utilisateur assigné avec succès à la simulation en tant que participant.`);
  } else {
    await prisma.simulationAssignment.update({
      where: {
        userId_simulationId: {
          userId,
          simulationId,
        },
      },
      data: {
        role: "participant",
        status: "confirmed",
      },
    });
    console.log(`ℹ️ L'assignation de l'utilisateur à cette simulation existait déjà, elle a été mise à jour en statut "confirmed".`);
  }
}

main();
