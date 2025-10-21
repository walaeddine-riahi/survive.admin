import { PrismaClient } from "@prisma/client";
import { sendWelcomeEmail } from "../src/lib/email";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

// ID de la simulation
const SIMULATION_ID = "68f201a97db961e8fec16672";

// Mot de passe par défaut
const DEFAULT_PASSWORD = "ooredoo";

async function main() {
  console.log("📧 ===== RENVOI DES EMAILS D'INVITATION =====\n");
  console.log(`📋 Simulation ID: ${SIMULATION_ID}\n`);

  try {
    // Récupérer la simulation
    const simulation = await prisma.simulation.findUnique({
      where: { id: SIMULATION_ID },
      select: { title: true },
    });

    if (!simulation) {
      console.error(
        `❌ Erreur: Simulation avec ID ${SIMULATION_ID} non trouvée`
      );
      process.exit(1);
    }

    console.log(`✅ Simulation: ${simulation.title}\n`);

    // Récupérer tous les participants assignés à cette simulation
    const assignments = await prisma.simulationAssignment.findMany({
      where: {
        simulationId: SIMULATION_ID,
        status: "accepted",
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        team: {
          select: {
            name: true,
          },
        },
      },
    });

    console.log(`👥 Nombre de participants assignés: ${assignments.length}\n`);
    console.log("=".repeat(60));
    console.log("ENVOI DES EMAILS D'INVITATION");
    console.log("=".repeat(60));

    const results = {
      success: 0,
      failed: 0,
    };

    // Envoyer un email à chaque participant
    for (const assignment of assignments) {
      const user = assignment.user;
      const teamName = assignment.team?.name || "Équipe non définie";

      console.log(
        `\n📧 Envoi à: ${user.firstName} ${user.lastName} (${user.email})`
      );
      console.log(`   Rôle: ${assignment.role}`);
      console.log(`   Équipe: ${teamName}`);

      try {
        await sendWelcomeEmail(
          user.email,
          user.firstName || "Participant",
          DEFAULT_PASSWORD,
          simulation.title,
          SIMULATION_ID
        );

        console.log(`   ✅ Email envoyé avec succès`);
        results.success++;
      } catch (error) {
        console.error(`   ❌ Erreur lors de l'envoi:`, error);
        results.failed++;
      }

      // Petite pause pour ne pas surcharger le serveur email
      await new Promise((res) => setTimeout(res, 1000));
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 RÉSUMÉ DE L'ENVOI DES EMAILS");
    console.log("=".repeat(60));
    console.log(`✅ Emails envoyés avec succès: ${results.success}`);
    console.log(`❌ Échecs d'envoi: ${results.failed}`);
    console.log(`📈 Total traité: ${assignments.length}`);
    console.log("=".repeat(60));

    if (results.success > 0) {
      console.log(
        `\n✨ ${results.success} email(s) d'invitation envoyé(s) avec le lien correct !`
      );
      console.log(
        `🔗 Lien: https://survive-tau.vercel.app/simulation/${SIMULATION_ID}/participant-view`
      );
    }

    if (results.failed > 0) {
      console.log(
        `\n⚠️ ATTENTION: ${results.failed} email(s) n'ont pas pu être envoyé(s).`
      );
    }
  } catch (error) {
    console.error("\n❌ Erreur fatale:", error);
  } finally {
    await prisma.$disconnect();
    console.log("\n🏁 Script terminé.");
  }
}

main();
