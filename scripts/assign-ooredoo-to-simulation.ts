import { PrismaClient } from "@prisma/client";
import { sendWelcomeEmail } from "../src/lib/email";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

const SIMULATION_ID = "68f201a97db961e8fec16672";

// Liste des participants avec leurs détails
const PARTICIPANTS = [
  // Crisis Committee (CC)
  {
    firstName: "Wafa",
    lastName: "HABABOU",
    email: "wafa.hababou@ooredoo.tn",
    role: "ERM Director",
    team: "CC",
  },
  {
    firstName: "Mansoor Rashid Y",
    lastName: "Al-Khater",
    email: "malkhater@ooredoo.tn",
    role: "CEO",
    team: "CC",
  },
  {
    firstName: "Philippe",
    lastName: "CHEVALIER",
    email: "philippe.chevalier@ooredoo.tn",
    role: "CFO",
    team: "CC",
  },
  {
    firstName: "Zehia",
    lastName: "ABDELKAFI",
    email: "zehia.abdelkafi@ooredoo.tn",
    role: "Procurment S.Dir",
    team: "CC",
  },
  {
    firstName: "Noaman",
    lastName: "BEN ABDESSALEM",
    email: "noaman.benabdessalem@ooredoo.tn",
    role: "CBWO",
    team: "CC",
  },
  {
    firstName: "Khaled",
    lastName: "BESROUR",
    email: "khaled.besrour@ooredoo.tn",
    role: "CLRAO",
    team: "CC",
  },
  {
    firstName: "Alice",
    lastName: "Smithh",
    email: "walaeddine1207@gmail.com",
    role: "CLRAO",
    team: "CC",
  },
  {
    firstName: "Mohamed Amine",
    lastName: "BOUSNINA",
    email: "medamine.bousnina@ooredoo.tn",
    role: "CIS Director",
    team: "CC",
  },
  {
    firstName: "Houssem",
    lastName: "GHORBEL",
    email: "houssem.ghorbel@ooredoo.tn",
    role: "CHRAO",
    team: "CC",
  },
  {
    firstName: "Bassem",
    lastName: "BOUZEMMI",
    email: "bassem.bouzemmi@ooredoo.tn",
    role: "CSDO",
    team: "CC",
  },
  {
    firstName: "Mathias",
    lastName: "HANEL",
    email: "mathias.hanel@ooredoo.tn",
    role: "CCO",
    team: "CC",
  },
  {
    firstName: "Hatem",
    lastName: "MESTIRI",
    email: "hatem.mestiri@ooredoo.tn",
    role: "CTIO",
    team: "CC",
  },
  {
    firstName: "Sunil",
    lastName: "MISHRA",
    email: "sunil.mishra@ooredoo.tn",
    role: "CMO",
    team: "CC",
  },
  {
    firstName: "Mohamed Ali",
    lastName: "BEN HAFSIA",
    email: "medali.benhafsia@ooredoo.tn",
    role: "PR A.Dir.",
    team: "CC",
  },
  {
    firstName: "Yassine",
    lastName: "SOUSSI",
    email: "yassine.soussi@ooredoo.tn",
    role: "Strategy S.Dir",
    team: "CC",
  },

  // Crisis Management Team (CMT)
  {
    firstName: "Mohamed",
    lastName: "ABBES",
    email: "mohamed.abbes@ooredoo.tn",
    role: "Regulatory S.Dir",
    team: "CMT",
  },
  {
    firstName: "Hatem",
    lastName: "ABOUDA",
    email: "hatem.abouda@ooredoo.tn",
    role: "IT A.Dir",
    team: "CMT",
  },
  {
    firstName: "Riadh",
    lastName: "AGREBI",
    email: "riadh.agrebi@ooredoo.tn",
    role: "Fraud & RA Dir",
    team: "CMT",
  },
  {
    firstName: "Taha",
    lastName: "AKREMI",
    email: "taha.akremi@ooredoo.tn",
    role: "Network Operations Assistant Dir.",
    team: "CMT",
  },
  {
    firstName: "Karim",
    lastName: "AYADI",
    email: "karim.ayadi@ooredoo.tn",
    role: "Sales Dir",
    team: "CMT",
  },
  {
    firstName: "Mohamed",
    lastName: "BELLIL",
    email: "mohamed.bellil@ooredoo.tn",
    role: "Sales Dir",
    team: "CMT",
  },
  {
    firstName: "Amel",
    lastName: "BEN ABDALLAH",
    email: "amel.benabdallah@ooredoo.tn",
    role: "B2B Insurance Dir",
    team: "CMT",
  },
  {
    firstName: "Imene",
    lastName: "BEN AMOR",
    email: "imene.benamor@ooredoo.tn",
    role: "Core A.Dir",
    team: "CMT",
  },
  {
    firstName: "Noomen",
    lastName: "BEN GADRI",
    email: "noomen.bengadri@ooredoo.tn",
    role: "HR A.Dir",
    team: "CMT",
  },
  {
    firstName: "Hanene",
    lastName: "BEN RADHIA",
    email: "hanene.benradhia@ooredoo.tn",
    role: "Digital marketing care & sales Dir",
    team: "CMT",
  },
  {
    firstName: "Wajih",
    lastName: "BEN SLIMANE",
    email: "wajih.benslimane@ooredoo.tn",
    role: "Marketing project Manager",
    team: "CMT",
  },
  {
    firstName: "Olfa",
    lastName: "CHAKROUN",
    email: "olfa.chakroun@ooredoo.tn",
    role: "Quality of experience A.Dir",
    team: "CMT",
  },
  {
    firstName: "Naoufel",
    lastName: "DEBBABI",
    email: "naoufel.debbabi@ooredoo.tn",
    role: "IT Dir.",
    team: "CMT",
  },
  {
    firstName: "Faycal",
    lastName: "DHAHRI",
    email: "faycal.dhahri@ooredoo.tn",
    role: "Electronic security Manager",
    team: "CMT",
  },
  {
    firstName: "Makram",
    lastName: "EL MDHOUKHI",
    email: "makram.elmdoukhi@ooredoo.tn",
    role: "H&S Manager",
    team: "CMT",
  },
  {
    firstName: "Foued",
    lastName: "ELOUATI",
    email: "foued.elouati@ooredoo.tn",
    role: "IT Operations Dir.",
    team: "CMT",
  },
  {
    firstName: "Helmi",
    lastName: "FITATI",
    email: "helmi.fitati@ooredoo.tn",
    role: "Marketing project A.Dir",
    team: "CMT",
  },
  {
    firstName: "Naoufel",
    lastName: "HAMDI",
    email: "naoufel.hamdi@ooredoo.tn",
    role: "Quality of experience Dir",
    team: "CMT",
  },
  {
    firstName: "Ramzi",
    lastName: "HMANI",
    email: "ramzi.hmani@ooredoo.tn",
    role: "Regulatory Manager",
    team: "CMT",
  },
  {
    firstName: "Amira",
    lastName: "ISSAOUI",
    email: "amira.issaoui@ooredoo.tn",
    role: "CIS Manager",
    team: "CMT",
  },
  {
    firstName: "Mohamed",
    lastName: "ISSAOUI",
    email: "mohamed.issaoui@ooredoo.tn",
    role: "Database Manager",
    team: "CMT",
  },
];

async function findOrCreateTeam(teamName: string, description: string) {
  console.log(`🔍 Recherche de l'équipe: ${teamName}`);

  let team = await prisma.team.findFirst({
    where: { name: teamName },
  });

  if (!team) {
    console.log(`📝 Création de l'équipe: ${teamName}`);
    team = await prisma.team.create({
      data: {
        name: teamName,
        description: description,
      },
    });
    console.log(`✅ Équipe créée: ${teamName} (ID: ${team.id})`);
  } else {
    console.log(`✅ Équipe existante: ${teamName} (ID: ${team.id})`);
  }

  return team;
}

async function assignUserToSimulation(
  participant: (typeof PARTICIPANTS)[0],
  teamId: string,
  simulationTitle: string
): Promise<{ success: boolean; reason: string }> {
  try {
    console.log(
      `\n� Traitement: ${participant.firstName} ${participant.lastName} (${participant.email})`
    );

    // Trouver l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email: participant.email },
    });

    if (!user) {
      console.log(`   ⚠️ Utilisateur non trouvé: ${participant.email}`);
      return { success: false, reason: "Utilisateur non trouvé" };
    } // Vérifier si la simulation existe
    const simulation = await prisma.simulation.findUnique({
      where: { id: SIMULATION_ID },
    });

    if (!simulation) {
      console.log(`   ❌ Simulation non trouvée: ${SIMULATION_ID}`);
      return { success: false, reason: "Simulation non trouvée" };
    }

    // Vérifier si l'utilisateur est déjà assigné
    const existing = await prisma.simulationAssignment.findFirst({
      where: {
        userId: user.id,
        simulationId: SIMULATION_ID,
      },
    });

    if (existing) {
      console.log(`   ⚠️ Déjà assigné - Mise à jour: ${participant.email}`);

      // Mettre à jour l'assignation existante
      await prisma.simulationAssignment.update({
        where: { id: existing.id },
        data: {
          role: participant.role,
          status: "accepted",
          teamId: teamId,
        },
      });

      console.log(
        `   ✅ Assignation mise à jour: ${participant.role} - Équipe: ${participant.team}`
      );
      return { success: true, reason: "Mise à jour" };
    }

    // Créer une nouvelle assignation
    await prisma.simulationAssignment.create({
      data: {
        role: participant.role,
        status: "accepted",
        userId: user.id,
        simulationId: SIMULATION_ID,
        teamId: teamId,
      },
    });

    console.log(
      `   ✅ Assignation créée: ${participant.role} - Équipe: ${participant.team}`
    );

    // Envoyer l'email d'invitation
    const DEFAULT_PASSWORD = "ooredoo123";
    try {
      await sendWelcomeEmail(
        user.email,
        user.firstName || participant.firstName,
        DEFAULT_PASSWORD,
        simulationTitle,
        SIMULATION_ID
      );
      console.log(`   📧 Email d'invitation envoyé à ${user.email}`);
    } catch (emailError) {
      console.error(`   ⚠️ Erreur lors de l'envoi de l'email:`, emailError);
      // On continue même si l'email échoue
    }

    return { success: true, reason: "Nouvelle assignation" };
  } catch (error) {
    console.error(`   ❌ Erreur pour ${participant.email}:`, error);
    return { success: false, reason: "Erreur" };
  }
}

async function main() {
  console.log("🚀 ===== DÉBUT DES ASSIGNATIONS OOREDOO =====\n");
  console.log(`📋 Simulation ID: ${SIMULATION_ID}`);
  console.log(`👥 Nombre de participants: ${PARTICIPANTS.length}\n`);

  try {
    // Créer ou récupérer les équipes CC et CMT
    const ccTeam = await findOrCreateTeam(
      "Crisis Committee (CC)",
      "Comité de Crise - Niveau décisionnel stratégique"
    );

    const cmtTeam = await findOrCreateTeam(
      "Crisis Management Team (CMT)",
      "Équipe de Gestion de Crise - Niveau opérationnel"
    );

    console.log("\n" + "=".repeat(60));
    console.log("ASSIGNATION DES PARTICIPANTS");
    console.log("=".repeat(60));

    const results = {
      success: 0,
      updated: 0,
      failed: 0,
      notFound: 0,
    };

    // Récupérer le titre de la simulation
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

    // Assigner chaque participant
    for (const participant of PARTICIPANTS) {
      const teamId = participant.team === "CC" ? ccTeam.id : cmtTeam.id;
      const result = await assignUserToSimulation(
        participant,
        teamId,
        simulation.title
      );

      if (result.success) {
        if (result.reason === "Mise à jour") {
          results.updated++;
        } else {
          results.success++;
        }
      } else {
        if (result.reason === "Utilisateur non trouvé") {
          results.notFound++;
        } else {
          results.failed++;
        }
      }

      // Petite pause pour ne pas surcharger la DB
      await new Promise((res) => setTimeout(res, 200));
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 RÉSUMÉ DES ASSIGNATIONS");
    console.log("=".repeat(60));
    console.log(`✅ Nouvelles assignations: ${results.success}`);
    console.log(`🔄 Mises à jour: ${results.updated}`);
    console.log(`❌ Échecs: ${results.failed}`);
    console.log(`⚠️ Utilisateurs non trouvés: ${results.notFound}`);
    console.log(`📈 Total traité: ${PARTICIPANTS.length}`);
    console.log("=".repeat(60));

    if (results.notFound > 0) {
      console.log(
        "\n⚠️ ATTENTION: Certains utilisateurs n'ont pas été trouvés."
      );
      console.log(
        "   Assurez-vous d'avoir exécuté le script create-user.ts d'abord."
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
