/**
 * Script de test rapide — crée une session de simulation avec des participants
 * Usage: node scripts/create-test-session.mjs
 */

import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Création d'une session de test...\n");

  // 1. Trouver ou créer une simulation
  let simulation = await prisma.simulation.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!simulation) {
    // Créer un scénario et une simulation de base
    simulation = await prisma.simulation.create({
      data: {
        title: "TEST — Ransomware Simulation",
        description:
          "Session de test pour valider les nouvelles fonctionnalités",
        startDate: new Date(),
        endDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
        status: "draft",
        type: "tabletop",
        objectives: [
          "Tester l'interface v2",
          "Valider les injects en temps réel",
        ],
        scenarioContext:
          "Une attaque ransomware a été détectée sur les serveurs de production.",
        briefingText:
          "Bienvenue dans cet exercice de test. Gérez la crise en temps réel.",
      },
    });
    console.log("✅ Simulation créée:", simulation.id);
  } else {
    console.log(
      "📋 Simulation existante utilisée:",
      simulation.title,
      `(${simulation.id})`,
    );
  }

  // 2. Créer la session v2
  const wsRoomId = `sim-${randomBytes(8).toString("hex")}`;
  const session = await prisma.simSession.create({
    data: {
      simulationId: simulation.id,
      title: simulation.title,
      scenarioContext: simulation.scenarioContext,
      briefingText: simulation.briefingText,
      scheduledAt: new Date(),
      wsRoomId,
      status: "SETUP",
    },
  });
  console.log("✅ Session créée:", session.id);

  // 3. Ajouter des participants de test
  const participants = [
    {
      displayName: "Alice Martin",
      role: "RSSI",
      team: "Cellule cyber",
      isInstructor: false,
    },
    {
      displayName: "Bob Dupont",
      role: "DSI",
      team: "Cellule cyber",
      isInstructor: false,
    },
    {
      displayName: "Claire Durand",
      role: "Responsable BCM",
      team: "Cellule de crise",
      isInstructor: false,
    },
    {
      displayName: "David Instructeur",
      role: "Instructeur",
      isInstructor: true,
    },
  ];

  // Utiliser les vrais utilisateurs de la BDD si disponibles
  const realUsers = await prisma.user.findMany({
    take: 4,
    select: { id: true, firstName: true, lastName: true },
  });

  const createdParticipants = [];
  for (let i = 0; i < participants.length; i++) {
    const p = participants[i];
    const slug = p.displayName
      .toLowerCase()
      .replace(/\s+/g, ".")
      .replace(/[^a-z.]/g, "");
    // Assigner un vrai userId si disponible pour éviter la contrainte unique null
    const userId = realUsers[i]?.id || undefined;
    const participant = await prisma.simParticipant.upsert({
      where: userId
        ? { sessionId_userId: { sessionId: session.id, userId } }
        : { id: "000000000000000000000000" }, // force create path
      create: {
        sessionId: session.id,
        userId: userId,
        displayName: p.displayName,
        role: p.role,
        team: p.team,
        isInstructor: p.isInstructor,
        simEmail: `${slug}@sim.survive.io`,
        simPhone: `+SIM-${Math.floor(1000 + Math.random() * 9000)}`,
      },
      update: { role: p.role },
    });
    createdParticipants.push(participant);
    console.log(`  👤 ${p.displayName} (${p.role}) → ID: ${participant.id}`);
  }

  // 4. Créer les canaux de chat
  await prisma.chatChannel.createMany({
    data: [
      {
        sessionId: session.id,
        type: "GENERAL",
        name: "Cellule de crise",
        description: "Canal général de la cellule de crise",
        emoji: "🏛️",
        color: "#185FA5",
        memberIds: [],
      },
      {
        sessionId: session.id,
        type: "TEAM",
        name: "Cellule cyber",
        description: "Canal équipe cyber",
        emoji: "👥",
        color: "#0F6E56",
        memberIds: createdParticipants
          .filter((p) => !p.isInstructor && p.team === "Cellule cyber")
          .map((p) => p.id),
      },
      {
        sessionId: session.id,
        type: "BROADCAST",
        name: "Annonces",
        description: "Annonces de l'instructeur",
        emoji: "📣",
        color: "#f97316",
        memberIds: [],
      },
    ],
  });
  console.log("✅ Canaux de chat créés");

  // 5. Seeder les documents de crise
  const docs = [
    {
      simulationId: simulation.id,
      title: "Annuaire de crise",
      description: "Contacts prioritaires",
      category: "ANNUAIRE",
      tags: ["contacts", "urgence"],
      isCritical: true,
      isPinned: true,
      content:
        "# Annuaire de crise\n\nContacts à activer en priorité.\n\n## CERT-FR\n- Tél: +33 1 71 75 84 68\n- Email: cert@ssi.gouv.fr\n\n## Assureur cyber\n- Tél: +33 1 XX XX XX XX",
      sections: [
        {
          id: "s1",
          title: "Cellule de crise interne",
          content: "Contacts des membres",
          isKeyProcedure: true,
        },
        {
          id: "s2",
          title: "Contacts externes",
          content: "CERT-FR, ANSSI, Assureur",
        },
      ],
    },
    {
      simulationId: simulation.id,
      title: "Fiche réflexe — Ransomware",
      description: "Actions immédiates en cas de ransomware",
      category: "FICHE_REFLEXE",
      tags: ["ransomware", "urgence"],
      isCritical: true,
      isPinned: true,
      content:
        "# 🚨 Fiche réflexe — Ransomware\n\n## FAIRE\n✅ Isoler les machines affectées\n✅ Notifier le RSSI\n✅ Suspendre les sauvegardes\n\n## NE PAS FAIRE\n❌ Ne pas payer la rançon\n❌ Ne pas éteindre les serveurs",
      sections: [
        {
          id: "do",
          title: "Actions PRIORITAIRES",
          content: "Ce qu'il faut faire",
          isKeyProcedure: true,
        },
        {
          id: "dont",
          title: "À NE PAS FAIRE",
          content: "Erreurs à éviter",
          isKeyProcedure: true,
        },
      ],
    },
  ];

  for (const doc of docs) {
    await prisma.crisisDocument.create({ data: doc });
  }
  console.log("✅ Documents de crise créés");

  // 6. Créer un formulaire pré-exercice
  await prisma.exerciseForm.create({
    data: {
      sessionId: session.id,
      simulationId: simulation.id,
      type: "PRE_EXERCISE",
      title: `Questionnaire pré-exercice — ${simulation.title}`,
      description: "Remplissez ce questionnaire avant le démarrage.",
      isActive: true,
      questions: [
        {
          id: "pre-01",
          type: "SCALE",
          required: true,
          label:
            "Quel est votre niveau de connaissance du Plan de Continuité d'Activité ?",
          min: 1,
          max: 5,
          minLabel: "Je ne le connais pas",
          maxLabel: "Je le maîtrise parfaitement",
          group: "Connaissances",
        },
        {
          id: "pre-02",
          type: "SINGLE_CHOICE",
          required: true,
          label:
            "Quand avez-vous participé à votre dernier exercice de gestion de crise ?",
          options: [
            "Jamais",
            "Il y a plus de 2 ans",
            "Il y a 1 à 2 ans",
            "Il y a moins de 6 mois",
          ],
          group: "Expérience",
        },
      ],
    },
  });
  console.log("✅ Formulaire pré-exercice créé");

  // 7. Afficher les URLs de test
  const instructor = createdParticipants.find((p) => p.isInstructor);
  const participantsList = createdParticipants.filter((p) => !p.isInstructor);
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  console.log("\n" + "=".repeat(70));
  console.log("🎯 SESSION DE TEST PRÊTE");
  console.log("=".repeat(70));
  console.log("\n📋 IDs importants:");
  console.log(`  Simulation ID : ${simulation.id}`);
  console.log(`  Session ID    : ${session.id}`);
  console.log("\n🖥️  Vue INSTRUCTEUR (ouvrir en premier) :");
  console.log(
    `  ${baseUrl}/simulation/${simulation.id}/live?sessionId=${session.id}&instructor=1`,
  );
  console.log("\n👤 Vues PARTICIPANTS (ouvrir dans d'autres onglets) :");
  for (const p of participantsList) {
    console.log(
      `  ${p.displayName.padEnd(20)} → ${baseUrl}/simulation/${simulation.id}/live?sessionId=${session.id}&participantId=${p.id}`,
    );
  }
  console.log("\n🖥️  CyberLab (mode SOC) :");
  console.log(
    `  ${baseUrl}/cyberlab/${session.id}?scenario=ransomware_soc&participantId=${participantsList[0]?.id}`,
  );
  console.log("\n🖥️  CyberLab (mode OT/SCADA) :");
  console.log(
    `  ${baseUrl}/cyberlab/${session.id}?scenario=ot_scada_attack&participantId=${participantsList[0]?.id}`,
  );
  console.log("=".repeat(70));
  console.log(
    "\n✅ Démarrage : cliquez 'Briefing' puis 'Démarrer' dans la vue instructeur",
  );
  console.log("=".repeat(70) + "\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
