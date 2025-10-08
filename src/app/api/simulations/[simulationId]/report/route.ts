import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ simulationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { simulationId } = await params;

    // Récupérer la simulation avec toutes les données nécessaires
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
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        scenarios: {
          include: {
            injections: {
              orderBy: {
                createdAt: "asc",
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

    // Récupérer toutes les communications liées à cette simulation
    const communications = await prisma.communication.findMany({
      where: { simulationId },
      orderBy: {
        createdAt: "asc",
      },
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
    });

    // Récupérer toutes les injections avec leur statut d'acknowledgment
    const allInjections = simulation.scenarios.flatMap(
      (scenario: {
        name: string;
        injections: Array<{
          id: string;
          title: string;
          content: string | null;
          type: string;
          createdAt: Date;
          acknowledged: boolean;
        }>;
      }) =>
        scenario.injections.map((injection) => ({
          ...injection,
          scenarioName: scenario.name,
        }))
    );

    // Pour l'instant, on va calculer l'acknowledgment depuis le champ `acknowledged` de l'injection
    const acknowledgedInjections = allInjections.filter(
      (inj: (typeof allInjections)[0]) => inj.acknowledged
    ).length;

    // Calculer les statistiques
    const startDate = simulation.startDate
      ? new Date(simulation.startDate)
      : new Date();
    const endDate = simulation.endDate
      ? new Date(simulation.endDate)
      : new Date();
    const duration = endDate.getTime() - startDate.getTime();
    const durationInHours = duration / (1000 * 60 * 60);

    // Grouper les communications par type
    const communicationsByType = communications.reduce(
      (
        acc: Record<string, typeof communications>,
        comm: (typeof communications)[0]
      ) => {
        const type = comm.type || "OTHER";
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(comm);
        return acc;
      },
      {} as Record<string, typeof communications>
    );

    // Grouper les injections par type
    type InjectionWithScenario = (typeof allInjections)[0];
    const injectionsByType = allInjections.reduce(
      (
        acc: Record<string, InjectionWithScenario[]>,
        inj: InjectionWithScenario
      ) => {
        const type = inj.type || "OTHER";
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(inj);
        return acc;
      },
      {} as Record<string, InjectionWithScenario[]>
    );

    // Calculer le taux de réponse (communications par rapport aux injections)
    const responseRate =
      allInjections.length > 0
        ? (communications.length / allInjections.length) * 100
        : 0;

    // Calculer le temps de réponse moyen
    const responseTimes: number[] = [];
    for (const injection of allInjections) {
      const relatedComms = communications.filter(
        (comm: (typeof communications)[0]) =>
          new Date(comm.createdAt) > new Date(injection.createdAt) &&
          new Date(comm.createdAt) <
            new Date(new Date(injection.createdAt).getTime() + 60 * 60 * 1000) // Dans l'heure suivante
      );

      if (relatedComms.length > 0) {
        const firstResponse = relatedComms[0];
        const responseTime =
          new Date(firstResponse.createdAt).getTime() -
          new Date(injection.createdAt).getTime();
        responseTimes.push(responseTime);
      }
    }

    const avgResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;
    const avgResponseTimeInMinutes = avgResponseTime / (1000 * 60);

    // Calculer le taux d'acknowledgment des injections
    const acknowledgmentRate =
      allInjections.length > 0
        ? (acknowledgedInjections / allInjections.length) * 100
        : 0;

    // Préparer la timeline combinée
    const timeline = [
      ...allInjections.map((inj: InjectionWithScenario) => ({
        type: "injection" as const,
        timestamp: inj.createdAt,
        data: inj,
      })),
      ...communications.map((comm: (typeof communications)[0]) => ({
        type: "communication" as const,
        timestamp: comm.createdAt,
        data: comm,
      })),
    ].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Préparer la réponse
    const report = {
      simulation: {
        id: simulation.id,
        title: simulation.title,
        description: simulation.description,
        status: simulation.status,
        startDate: simulation.startDate,
        endDate: simulation.endDate,
        duration: durationInHours,
      },
      participants: {
        total: simulation.assignments.length,
        users: simulation.assignments
          .filter((a: { user: unknown }) => a.user)
          .map(
            (a: {
              user: {
                id: string;
                firstName: string | null;
                lastName: string | null;
                email: string;
              };
            }) => ({
              ...a.user,
              name:
                `${a.user.firstName || ""} ${a.user.lastName || ""}`.trim() ||
                a.user.email,
            })
          ),
        teams: simulation.assignments
          .filter(
            (a: { team: { id: string; name: string } | null }) =>
              a.team !== null
          )
          .map((a: { team: { id: string; name: string } | null }) => a.team!),
      },
      statistics: {
        totalInjections: allInjections.length,
        totalCommunications: communications.length,
        responseRate: Math.round(responseRate * 100) / 100,
        avgResponseTimeMinutes:
          Math.round(avgResponseTimeInMinutes * 100) / 100,
        acknowledgmentRate: Math.round(acknowledgmentRate * 100) / 100,
        acknowledgedInjections,
      },
      communicationsByType,
      injectionsByType,
      injections: allInjections,
      communications,
      timeline,
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error generating simulation report:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du rapport" },
      { status: 500 }
    );
  }
}
