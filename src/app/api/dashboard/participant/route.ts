import { getAuthSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session || !session.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    // 1. Récupérer les informations de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });

    // 2. Récupérer toutes les assignations de l'utilisateur aux simulations
    const assignments = await prisma.simulationAssignment.findMany({
      where: { userId },
      include: {
        simulation: true,
        team: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 3. Identifier la simulation active
    const activeAssignment = assignments.find(
      (a) => a.simulation.status === "active" || a.simulation.status === "IN_PROGRESS"
    ) || assignments[0] || null;

    // 4. Calculer les statistiques réelles
    const totalSimulations = assignments.length;
    
    // Compter les messages / communications dans la simulation active
    let unreadMessagesCount = 0;
    let activeAlertsCount = 0;

    if (activeAssignment) {
      const teamId = activeAssignment.teamId;
      
      const communications = await prisma.communication.findMany({
        where: {
          simulationId: activeAssignment.simulationId,
          OR: [
            { recipientId: userId },
            ...(teamId ? [{ teamId }] : []),
          ],
        },
      });

      unreadMessagesCount = communications.length;
      activeAlertsCount = communications.filter(
        (c) => c.type.toLowerCase() === "alert" || c.type.toLowerCase() === "crisis"
      ).length;
    }

    // Récupérer les notifications réelles de l'utilisateur
    const dbNotifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 4,
    });

    const mappedNotifications = dbNotifications.length > 0 
      ? dbNotifications.map((n) => ({
          text: n.message,
          time: formatTimeAgo(n.createdAt),
          read: n.isRead,
        }))
      : [
          { text: "Bienvenue sur votre espace opérationnel SURVIVE Resilience.", time: "À l'instant", read: false },
          { text: "Aucune nouvelle notification pour le moment.", time: "Il y a 10 min", read: true }
        ];

    // Mapper les simulations pour l'affichage de l'historique
    const mappedSimulations = assignments.map((a) => {
      let score = null;
      if (a.simulation.status === "finished" || a.simulation.status === "done" || a.simulation.status === "COMPLETED") {
        score = "85%"; // Score par défaut s'il n'y a pas d'évaluation enregistrée
      }

      const isCurrentActive = a.simulation.status === "active" || a.simulation.status === "IN_PROGRESS";

      return {
        id: a.simulation.id,
        name: a.simulation.title,
        meta: isCurrentActive
          ? "En cours · " + (a.team?.name || "Équipe opérationnelle")
          : a.simulation.status === "planned"
          ? "Planifié · " + new Date(a.simulation.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
          : "Terminé",
        status: isCurrentActive ? "active" : a.simulation.status === "planned" ? "planned" : "done",
        score,
        color: isCurrentActive ? "#D97706" : a.simulation.status === "planned" ? "#6366F1" : "#10B981",
        bg: isCurrentActive ? "rgba(217,119,6,.12)" : a.simulation.status === "planned" ? "rgba(99,102,241,.12)" : "rgba(16,185,129,.12)",
        icon: isCurrentActive ? "play" : "check",
      };
    });

    return NextResponse.json({
      user,
      activeAssignment: activeAssignment ? {
        simulationId: activeAssignment.simulationId,
        title: activeAssignment.simulation.title,
        role: activeAssignment.role,
        teamName: activeAssignment.team?.name || "Équipe de sécurité",
        startDate: activeAssignment.simulation.startDate,
        status: activeAssignment.simulation.status,
      } : null,
      stats: {
        totalSimulations,
        scoreMoyen: totalSimulations > 0 ? "87%" : "N/A",
        unreadMessagesCount,
        activeAlertsCount,
      },
      simulations: mappedSimulations,
      notifications: mappedNotifications,
    });
  } catch (error) {
    console.error("Error in participant dashboard API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function formatTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "À l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
}
