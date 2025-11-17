import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

const SIMULATION_ID = "68f201a97db961e8fec16672";

// Liste des participants du batch 3 avec leurs détails
const PARTICIPANTS = [
  {
    firstName: "Slim",
    lastName: "KEFI",
    email: "slim.kefi@ooredoo.tn",
    team: "CMT",
    role: "Sales Dir",
  },
  {
    firstName: "Alice",
    lastName: "Smithh",
    email: "walaeddine1207@gmail.com",
    team: "CMT",
    role: "Sales Dir",
  },
  {
    firstName: "Sinda",
    lastName: "MELAOUAH",
    email: "sinda.melaouah@ooredoo.tn",
    team: "CMT",
    role: "B2B Insurance A.Dir",
  },
  {
    firstName: "Zied",
    lastName: "MENCHARI",
    email: "zied.menchari@ooredoo.tn",
    team: "CMT",
    role: "Sales A.Dir",
  },
  {
    firstName: "Hichem",
    lastName: "MRABET",
    email: "hichem.mrabet@ooredoo.tn",
    team: "CMT",
    role: "Operational Sales Support Director",
  },
  {
    firstName: "Nadia",
    lastName: "TAGA",
    email: "nadia.taga@ooredoo.tn",
    team: "CMT",
    role: "Media A.D.",
  },
  {
    firstName: "Nejib",
    lastName: "SAGHROUNI",
    email: "nejib.saghrouni@ooredoo.tn",
    team: "CMT",
    role: "Operation Director",
  },
  {
    firstName: "Ahmed",
    lastName: "SAMAALI",
    email: "ahmed.samaali@ooredoo.tn",
    team: "CMT",
    role: "Facilities A.Dir.",
  },
  {
    firstName: "Walid",
    lastName: "SANAA",
    email: "walid.sanaa@ooredoo.tn",
    team: "CMT",
    role: "Procurment A.Dir.",
  },
  {
    firstName: "Oussama",
    lastName: "SELMI",
    email: "oussama.selmi@ooredoo.tn",
    team: "CMT",
    role: "Revenue & insurance & fraud & credit management",
  },
  {
    firstName: "Wajdi",
    lastName: "SNOUSSI",
    email: "wajdi.snoussi@ooredoo.tn",
    team: "CMT",
    role: "BCM Manager / CMT SPOC",
  },
  {
    firstName: "Mahmoud",
    lastName: "SOBHI",
    email: "mahmoud.sobhi@ooredoo.tn",
    team: "CMT",
    role: "Network Director",
  },
  {
    firstName: "Medwalid",
    lastName: "ZAMMIT",
    email: "medwalid.zammit@ooredoo.tn",
    team: "CMT",
    role: "Customer Care A.Dir.",
  },
  {
    firstName: "Mariem",
    lastName: "ZMERLI",
    email: "mariem.zmerli@ooredoo.tn",
    team: "CMT",
    role: "Digital marketing care & sales",
  },
  {
    firstName: "Ines",
    lastName: "BEN ROMDHANE",
    email: "ines.benromdhane@ooredoo.tn",
    team: "CMT",
    role: "Brand & Com A.Dir.",
  },
  {
    firstName: "Medhedi",
    lastName: "BERGUELLIL",
    email: "medhedi.berguellil@ooredoo.tn",
    team: "OPT",
    role: "Charging Operations Senior Manager",
  },
  {
    firstName: "Kamel",
    lastName: "TRABELSI",
    email: "kamel.trabelsi@ooredoo.tn",
    team: "OPT",
    role: "Data Technology Senior Manager",
  },
  {
    firstName: "Mahmoud",
    lastName: "TAJOURI",
    email: "mahmoud.tajouri@ooredoo.tn",
    team: "OPT",
    role: "Voice Technology Manager",
  },
  {
    firstName: "Moncef",
    lastName: "AZIZI",
    email: "moncef.azizi@ooredoo.tn",
    team: "OPT",
    role: "Network Operations Manager",
  },
  {
    firstName: "Hatem",
    lastName: "DEROUICHE",
    email: "hatem.derouiche@ooredoo.tn",
    team: "OPT",
    role: "Datacenter Assistant D.",
  },
  {
    firstName: "Jaouhar",
    lastName: "AZIZI",
    email: "jaouhar.azizi@ooredoo.tn",
    team: "OPT",
    role: "Energy Manager",
  },
  {
    firstName: "Faouzi",
    lastName: "HIDOURI",
    email: "faouzi.hidouri@ooredoo.tn",
    team: "OPT",
    role: "Datacenter Manager",
  },
  {
    firstName: "Moncef",
    lastName: "FOURATI",
    email: "moncef.fourati@ooredoo.tn",
    team: "OPT",
    role: "Maintenance Assistant D.",
  },
  {
    firstName: "Salim",
    lastName: "TRABELSI",
    email: "salim.trabelsi@ooredoo.tn",
    team: "OPT",
    role: "Customer care Manager",
  },
  {
    firstName: "Mohamed",
    lastName: "JMAL",
    email: "mohamed.jmal@ooredoo.tn",
    team: "OPT",
    role: "Traffic Management Manager",
  },
  {
    firstName: "Wassim",
    lastName: "BEN SLIMANE",
    email: "wassim.benslimane@ooredoo.tn",
    team: "OPT",
    role: "Sales Channel Manager",
  },
  {
    firstName: "Kamel",
    lastName: "MOUSSA",
    email: "kamel.moussa@ooredoo.tn",
    team: "OPT",
    role: "Sales Channel Assistant D.",
  },
  {
    firstName: "Slim",
    lastName: "CHARFI",
    email: "slim.charfi@ooredoo.tn",
    team: "OPT",
    role: "Sales Channel Manager",
  },
  {
    firstName: "Majdi",
    lastName: "BEJAOUI",
    email: "majdi.bejaoui@ooredoo.tn",
    team: "OPT",
    role: "Sales Supply chain Manager",
  },
  {
    firstName: "Asma",
    lastName: "EL AYEB",
    email: "asma.elayeb@ooredoo.tn",
    team: "OPT",
    role: "Sales & Distrbution Manager",
  },
  {
    firstName: "Raja",
    lastName: "BOUZIRI",
    email: "raja.bouziri@ooredoo.tn",
    team: "OPT",
    role: "Observateur",
  },
  {
    firstName: "Mouna",
    lastName: "SMATI",
    email: "mouna.smati@ooredoo.tn",
    team: "OPT",
    role: "Tresory Manager",
  },
  {
    firstName: "Abdelkader",
    lastName: "CHEBL",
    email: "abdelkader.chebl@ooredoo.tn",
    team: "OPT",
    role: "Accounting Director",
  },
  {
    firstName: "Mondher",
    lastName: "SMAOUI",
    email: "mondher.smaoui@ooredoo.tn",
    team: "OPT",
    role: "Transport",
  },
  {
    firstName: "Riadh",
    lastName: "BETTIOUR",
    email: "riadh.bettiour@ooredoo.tn",
    team: "OPT",
    role: "Warehousing",
  },
  {
    firstName: "Narjes",
    lastName: "JEBARA",
    email: "narjes.jebara@ooredoo.tn",
    team: "OPT",
    role: "Observateur",
  },
  {
    firstName: "Najet",
    lastName: "JERIDI",
    email: "najet.jeridi@ooredoo.tn",
    team: "OPT",
    role: "Observateur",
  },
  {
    firstName: "Rim",
    lastName: "HAMZAOUI",
    email: "rim.hamzaoui@ooredoo.tn",
    team: "OPT",
    role: "Observateur",
  },
  {
    firstName: "Malek",
    lastName: "AISSA",
    email: "malek.aissa@ooredoo.tn",
    team: "OPT",
    role: "Observateur",
  },
  {
    firstName: "Jamel",
    lastName: "BEN SAIDANE",
    email: "jamel.bensaidane@ooredoo.tn",
    team: "OPT",
    role: "Observateur",
  },
  {
    firstName: "Lina",
    lastName: "DAKHLI",
    email: "lina.dakhli@ooredoo.tn",
    team: "OPT",
    role: "Observateur",
  },
  {
    firstName: "Emna",
    lastName: "JAIDANE",
    email: "emna.jaidane@ooredoo.tn",
    team: "OPT",
    role: "Observateur",
  },
  {
    firstName: "Badereddine",
    lastName: "KHEMIRI",
    email: "badereddine.khmiri@ooredoo.tn",
    team: "OPT",
    role: "Observateur",
  },
  {
    firstName: "Sarra",
    lastName: "MOUSSA",
    email: "sarra.moussa@ooredoo.tn",
    team: "OPT",
    role: "Observateur",
  },
  {
    firstName: "Ramzi",
    lastName: "OMRI",
    email: "ramzi.omri@ooredoo.tn",
    team: "OPT",
    role: "Observateur",
  },
  {
    firstName: "Rim",
    lastName: "FERTANI",
    email: "rim.fertani@ooredoo.tn",
    team: "OPT",
    role: "Observateur",
  },
  {
    firstName: "Mourad",
    lastName: "NEMRI",
    email: "mourad.nemri@ooredoo.tn",
    team: "OPT",
    role: "Helpdesk Manager",
  },
  {
    firstName: "Najla",
    lastName: "GHOUAIBI",
    email: "najla.ghouaibi@ooredoo.tn",
    team: "OPT",
    role: "Datacenter Secretary",
  },
  {
    firstName: "Hamdi",
    lastName: "HAMMOUDA",
    email: "hamdi.hammouda@ooredoo.tn",
    team: "OPT",
    role: "BSS A.Dir",
  },
  {
    firstName: "Anis",
    lastName: "LAAMOURI",
    email: "anis.laamouri@ooredoo.tn",
    team: "OPT",
    role: "Business Insights A.Dir",
  },
  {
    firstName: "Achref",
    lastName: "SALAH",
    email: "achref.salah@ooredoo.tn",
    team: "OPT",
    role: "BSS Manager",
  },
  {
    firstName: "Amine",
    lastName: "JIED",
    email: "amine.jied@ooredoo.tn",
    team: "OPT",
    role: "IT Manager",
  },
  {
    firstName: "Houcine",
    lastName: "SEBTAOUI",
    email: "houcine.sebtaoui4@huawei.com",
    team: "OPT",
    role: "Huawei Manager",
  },
  {
    firstName: "Helmi",
    lastName: "TLICH",
    email: "helmi.tlich@ooredoo.tn",
    team: "OPT",
    role: "Incident Manager",
  },
  {
    firstName: "Sami",
    lastName: "SELMANE",
    email: "sami.selmane@ooredoo.tn",
    team: "OPT",
    role: "System IT Network DC et Windows Operations Manager",
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
  teamId: string
): Promise<{ success: boolean; reason: string }> {
  try {
    console.log(
      `\n👤 Traitement: ${participant.firstName} ${participant.lastName} (${participant.email})`
    );
    console.log(`   📋 Rôle: ${participant.role}`);

    // Trouver l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email: participant.email },
    });

    if (!user) {
      console.log(`   ⚠️ Utilisateur non trouvé: ${participant.email}`);
      return { success: false, reason: "Utilisateur non trouvé" };
    }

    // Vérifier si la simulation existe
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
      console.log(`   🔄 Déjà assigné - Mise à jour`);

      // Mettre à jour l'assignation existante
      await prisma.simulationAssignment.update({
        where: { id: existing.id },
        data: {
          role: participant.role,
          status: "accepted",
          teamId: teamId,
        },
      });

      console.log(`   ✅ Assignation mise à jour`);
      return {
        success: true,
        reason: "Mise à jour",
      };
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

    console.log(`   ✅ Assignation créée`);

    return {
      success: true,
      reason: "Nouvelle assignation",
    };
  } catch (error) {
    console.error(`   ❌ Erreur pour ${participant.email}:`, error);
    return { success: false, reason: "Erreur" };
  }
}

async function main() {
  console.log("🚀 ===== ASSIGNATION BATCH 3 - OOREDOO =====\n");
  console.log(`📋 Simulation ID: ${SIMULATION_ID}`);
  console.log(`👥 Nombre de participants: ${PARTICIPANTS.length}\n`);

  try {
    // Créer ou récupérer les équipes CMT et OPT
    const cmtTeam = await findOrCreateTeam(
      "Crisis Management Team (CMT)",
      "Équipe de Gestion de Crise - Niveau opérationnel"
    );

    const optTeam = await findOrCreateTeam(
      "Operational Team (OPT)",
      "Équipe Opérationnelle - Exécution des actions de continuité"
    );

    console.log("\n" + "=".repeat(60));
    console.log("ASSIGNATION DES PARTICIPANTS");
    console.log("=".repeat(60));

    const results = {
      success: 0,
      updated: 0,
      failed: 0,
      notFound: 0,
      byTeam: {
        CMT: 0,
        OPT: 0,
      },
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
      const teamId = participant.team === "CMT" ? cmtTeam.id : optTeam.id;
      const result = await assignUserToSimulation(participant, teamId);

      if (result.success) {
        if (result.reason === "Mise à jour") {
          results.updated++;
        } else {
          results.success++;
        }
        results.byTeam[participant.team as "CMT" | "OPT"]++;
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
    console.log("");
    console.log(`👥 CMT: ${results.byTeam.CMT} participants`);
    console.log(`👥 OPT: ${results.byTeam.OPT} participants`);
    console.log("=".repeat(60));

    if (results.notFound > 0) {
      console.log(
        "\n⚠️ ATTENTION: Certains utilisateurs n'ont pas été trouvés."
      );
      console.log(
        "   Assurez-vous d'avoir exécuté le script de création d'utilisateurs d'abord."
      );
    }

    if (results.success > 0 || results.updated > 0) {
      console.log(
        "\n✅ SUCCÈS: Les participants ont été assignés à la simulation."
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
