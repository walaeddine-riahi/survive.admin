import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ simulationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { simulationId } = await context.params;

    // Récupérer la simulation avec toutes les données
    const simulation = await prisma.simulation.findUnique({
      where: { id: simulationId },
      include: {
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        scenarios: {
          include: {
            injections: {
              include: {
                scenario: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!simulation) {
      return NextResponse.json(
        { error: "Simulation non trouvée" },
        { status: 404 }
      );
    }

    // Récupérer toutes les communications
    const communications = await prisma.communication.findMany({
      where: { simulationId },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Récupérer toutes les injections
    const allInjections = simulation.scenarios.flatMap((s) => s.injections);

    // Statistiques des injections
    const injectionStats = {
      total: allInjections.length,
      acknowledged: allInjections.filter((inj) => inj.acknowledged).length,
      pending: allInjections.filter((inj) => !inj.acknowledged).length,
      byType: {} as Record<string, number>,
      recent: allInjections
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map((inj) => ({
          id: inj.id,
          title: inj.title,
          content: inj.content,
          type: inj.type,
          acknowledged: inj.acknowledged,
          createdAt: inj.createdAt,
          imageUrl: inj.imageUrl,
          videoUrl: inj.videoUrl,
          scenario: inj.scenario ? { name: inj.scenario.name } : undefined,
        })),
    };

    // Compter par type
    allInjections.forEach((inj) => {
      injectionStats.byType[inj.type] = (injectionStats.byType[inj.type] || 0) + 1;
    });

    // Statistiques des communications
    const communicationStats = {
      total: communications.length,
      byType: {} as Record<string, number>,
      byParticipant: {} as Record<string, { sent: number; received: number }>,
      recent: communications.slice(0, 10).map((comm) => ({
        id: comm.id,
        type: comm.type,
        subject: comm.subject,
        sender: `${comm.sender.firstName} ${comm.sender.lastName}`,
        recipient: comm.recipient
          ? `${comm.recipient.firstName} ${comm.recipient.lastName}`
          : "Tous",
        createdAt: comm.createdAt,
      })),
    };

    // Compter par type de communication
    communications.forEach((comm) => {
      communicationStats.byType[comm.type] = (communicationStats.byType[comm.type] || 0) + 1;

      // Stats par participant (envoyés)
      const senderKey = `${comm.sender.firstName} ${comm.sender.lastName}`;
      if (!communicationStats.byParticipant[senderKey]) {
        communicationStats.byParticipant[senderKey] = { sent: 0, received: 0 };
      }
      communicationStats.byParticipant[senderKey].sent += 1;

      // Stats par participant (reçus)
      if (comm.recipient) {
        const recipientKey = `${comm.recipient.firstName} ${comm.recipient.lastName}`;
        if (!communicationStats.byParticipant[recipientKey]) {
          communicationStats.byParticipant[recipientKey] = { sent: 0, received: 0 };
        }
        communicationStats.byParticipant[recipientKey].received += 1;
      }
    });

    // Statistiques des participants
    const participantStats = simulation.assignments.map((assignment) => {
      const userComms = communications.filter(
        (comm) => comm.senderId === assignment.userId || comm.recipientId === assignment.userId
      );

      const userInjectionsAcknowledged = allInjections.filter(
        (inj) => inj.acknowledged && inj.targetUserId === assignment.userId
      ).length;

      return {
        user: {
          id: assignment.user.id,
          name: `${assignment.user.firstName} ${assignment.user.lastName}`,
          email: assignment.user.email,
        },
        role: assignment.role,
        status: assignment.status,
        communicationsSent: communications.filter(
          (comm) => comm.senderId === assignment.userId
        ).length,
        communicationsReceived: communications.filter(
          (comm) => comm.recipientId === assignment.userId
        ).length,
        injectionsAcknowledged: userInjectionsAcknowledged,
        lastActivity: userComms.length > 0 ? userComms[0].createdAt : null,
      };
    });

    // Activité récente (timeline combinée)
    const recentActivity = [
      ...communications.map((comm) => ({
        type: "communication" as const,
        subType: comm.type,
        title: comm.subject || comm.content.substring(0, 50),
        user: `${comm.sender.firstName} ${comm.sender.lastName}`,
        recipient: comm.recipient
          ? `${comm.recipient.firstName} ${comm.recipient.lastName}`
          : undefined,
        timestamp: comm.createdAt,
      })),
      ...allInjections
        .filter((inj) => inj.acknowledged)
        .map((inj) => ({
          type: "injection_acknowledged" as const,
          subType: inj.type,
          title: `Injection acquittée: ${inj.title}`,
          timestamp: inj.updatedAt,
        })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);

    // Générer le résumé
    const summary = {
      simulation: {
        id: simulation.id,
        title: simulation.title,
        status: simulation.status,
        startDate: simulation.startDate,
        endDate: simulation.endDate,
      },
      timestamp: new Date().toISOString(),
      overview: {
        totalParticipants: simulation.assignments.length,
        activeParticipants: participantStats.filter(
          (p) => p.communicationsSent > 0 || p.communicationsReceived > 0
        ).length,
        totalInjections: injectionStats.total,
        acknowledgedInjections: injectionStats.acknowledged,
        pendingInjections: injectionStats.pending,
        totalCommunications: communicationStats.total,
        acknowledgementRate:
          injectionStats.total > 0
            ? Math.round((injectionStats.acknowledged / injectionStats.total) * 100)
            : 0,
      },
      injections: injectionStats,
      communications: communicationStats,
      participants: participantStats.sort(
        (a, b) => b.communicationsSent - a.communicationsSent
      ),
      recentActivity,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Erreur lors de la génération du résumé:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du résumé" },
      { status: 500 }
    );
  }
}
