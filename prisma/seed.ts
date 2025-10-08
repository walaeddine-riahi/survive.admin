import {
  IncidentStatus,
  Priority,
  PrismaClient,
  Role,
  TaskStatus,
} from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Nettoyer la base de données
  await prisma.teamChat.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.task.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.report.deleteMany();
  await prisma.reportStructure.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.planType.deleteMany();
  await prisma.incidentType.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // Créer les types de plans
  const maintenanceType = await prisma.planType.create({
    data: {
      name: "Maintenance",
      description: "Plan de maintenance préventive",
    },
  });

  const securityType = await prisma.planType.create({
    data: {
      name: "Security",
      description: "Plan de sécurité",
    },
  });

  const trainingType = await prisma.planType.create({
    data: {
      name: "Training",
      description: "Plan de formation",
    },
  });

  // Créer les types d'incidents
  const fireIncidentType = await prisma.incidentType.create({
    data: {
      name: "Incendie",
      description: "Incident lié à un incendie",
    },
  });

  const accidentIncidentType = await prisma.incidentType.create({
    data: {
      name: "Accident",
      description: "Accident du travail",
    },
  });

  // Créer les utilisateurs
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: await bcrypt.hash("admin123", 10),
      firstName: "Admin",
      lastName: "User",
      role: Role.ADMIN,
      profile: {
        create: {
          bio: "Administrateur système",
          avatar: "/avatars/admin.png",
          phone: "+33600000000",
          address: "123 Admin Street",
        },
      },
    },
  });

  const regularUser = await prisma.user.create({
    data: {
      email: "user@example.com",
      password: await bcrypt.hash("user123", 10),
      firstName: "Regular",
      lastName: "User",
      role: Role.USER,
      profile: {
        create: {
          bio: "Utilisateur régulier",
          avatar: "/avatars/user.png",
          phone: "+33600000001",
          address: "456 User Street",
        },
      },
    },
  });

  // Créer une équipe
  const team = await prisma.team.create({
    data: {
      name: "Équipe de sécurité",
      description: "Équipe responsable de la sécurité",
    },
  });

  // Ajouter des membres à l'équipe
  const teamMember = await prisma.teamMember.create({
    data: {
      role: "leader",
      userId: adminUser.id,
      teamId: team.id,
    },
  });

  // Créer un plan
  const plan = await prisma.plan.create({
    data: {
      name: "Plan de maintenance annuel",
      description: "Maintenance préventive des équipements",
      startDate: new Date("2024-04-01"),
      endDate: new Date("2024-04-30"),
      status: "in_progress",
      typeId: maintenanceType.id,
    },
  });

  // Créer une tâche
  await prisma.task.create({
    data: {
      title: "Vérification des extincteurs",
      description: "Vérifier et remplacer si nécessaire les extincteurs",
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      dueDate: new Date("2024-04-15"),
      creatorId: adminUser.id,
      teamId: team.id,
      assigneeId: teamMember.id,
    },
  });

  // Créer un incident
  const incident = await prisma.incident.create({
    data: {
      name: "Fuite d'eau",
      description: "Fuite d'eau dans le bâtiment A",
      status: IncidentStatus.IN_PROGRESS,
      location: "Bâtiment A",
      resources: "Équipe de maintenance",
      requiredVehicles: "Camion de maintenance",
      latitude: "48.8566",
      longitude: "2.3522",
      delay: 0,
      incidentDate: new Date(),
      reporterId: regularUser.id,
      typeId: fireIncidentType.id,
      teamId: team.id,
      planId: plan.id,
    },
  });

  // Créer une structure de rapport
  const reportStructure = await prisma.reportStructure.create({
    data: {
      name: "Rapport d'incident standard",
      template: {
        sections: [
          {
            title: "Description",
            type: "text",
          },
          {
            title: "Actions prises",
            type: "list",
          },
          {
            title: "Recommandations",
            type: "text",
          },
        ],
      },
    },
  });

  // Créer un rapport
  await prisma.report.create({
    data: {
      title: "Rapport d'incident - Fuite d'eau",
      content: "Rapport détaillé de l'incident de fuite d'eau",
      authorId: adminUser.id,
      structureId: reportStructure.id,
      incidentId: incident.id,
    },
  });

  // Créer un message d'équipe
  await prisma.teamChat.create({
    data: {
      message: "Nouveau plan de maintenance créé",
      senderId: adminUser.id,
      teamId: team.id,
    },
  });

  console.log("Seed completed successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
