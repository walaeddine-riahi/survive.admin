import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
// import type { Prisma } from "@prisma/client"; // Removed: not directly used for type definition in this way
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

interface Communication {
  id: string;
  type: string;
  content: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  recipient?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  subject?: string; // Added: subject field
  team?: { id: string; name: string } | null; // Added: team field
}

// Redefined type for Simulation with included relations, without the runtime 'where' clause
interface SimulationWithRelations {
  id: string;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  status: string;
  assignments: {
    userId: string;
    role: string;
    status: string;
    teamId: string | null;
  }[];
  communications: Communication[];
  injections: ({ scenario: { name: string } | null } & {
    id: string;
    title: string;
    content: string | null;
    triggerType: string;
    timeOffset: number | null;
    isRepeating: boolean;
    repeatInterval: number | null;
    scenarioId: string;
    simulationId: string;
    acknowledged: boolean;
    createdAt: Date;
    updatedAt: Date;
    payload: object | null;
    type: string;
    imageUrl: string | null;
    videoUrl: string | null;
    attachments: object | null;
  })[];
}

export async function GET(
  req: Request,
  { params }: { params: { simulationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { simulationId } = await Promise.resolve(params);

    // Get the current user's simulation assignment to find their teamId
    const userAssignment = await prisma.simulationAssignment.findFirst({
      where: {
        userId: session.user.id,
        simulationId: simulationId,
      },
      select: {
        teamId: true,
      },
    });

    const userTeamId = userAssignment?.teamId || null;

    const simulation: SimulationWithRelations | null =
      (await prisma.simulation.findUnique({
        where: {
          id: simulationId,
        },
        include: {
          assignments: {
            select: {
              userId: true,
              role: true,
              status: true,
              teamId: true,
            },
          },
          communications: {
            where: {
              OR: [
                // Communications spécifiquement adressées à l'utilisateur
                { 
                  recipientId: session.user.id 
                },
                // Communications envoyées par l'utilisateur
                { 
                  senderId: session.user.id 
                },
                // Communications destinées à l'équipe de l'utilisateur (si l'utilisateur fait partie d'une équipe)
                ...(userTeamId ? [
                  { 
                    AND: [
                      { teamId: userTeamId },
                      { teamId: { not: null } },
                      { recipientId: null } // Pas de destinataire spécifique, c'est pour toute l'équipe
                    ]
                  }
                ] : []),
                // Communications globales (sans équipe ni destinataire spécifique)
                { 
                  teamId: null,
                  recipientId: null 
                }
              ],
            },
            select: {
              id: true,
              type: true,
              content: true,
              subject: true,
              createdAt: true,
              updatedAt: true,
              recipientId: true,
              senderId: true,
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
              team: {
                select: {
                  id: true,
                  name: true
                }
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          injections: {
            where: {
              isActive: true, // Ne récupérer que les injections actives
              // Injections globales ou destinées à l'utilisateur connecté
              OR: [
                { targetUserId: null },
                { targetUserId: session.user.id }
              ]
            },
            include: {
              scenario: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      })) as SimulationWithRelations | null; // Cast to the defined interface

    if (!simulation) {
      return new NextResponse("Simulation not found", { status: 404 });
    }

    const communications = simulation.communications.reduce(
      (acc: Record<string, Communication[]>, comm: Communication) => {
        const type = comm.type.toLowerCase();
        if (!acc[type as keyof typeof acc]) {
          acc[type as keyof typeof acc] = [];
        }
        acc[type as keyof typeof acc].push(comm);
        return acc;
      },
      {
        email: [],
        call: [],
        sms: [],
        alert: [],
        memo: [],
        newsBroadcast: [],
        newspaper: [],
        social: [],
      } as Record<string, Communication[]>
    );

    const counts = {
      email: communications.email.length,
      call: communications.call.length,
      sms: communications.sms.length,
      alert: communications.alert.length,
      memo: communications.memo.length,
      newsBroadcast: communications.newsBroadcast.length,
      newspaper: communications.newspaper.length,
      social: communications.social.length,
    };

    const formattedInjections = simulation.injections.map(
      (injection: SimulationWithRelations["injections"][number]) => ({
        ...injection,
        scenarioName: injection.scenario?.name || "", // Map scenarioName
      })
    );

    return NextResponse.json({
      simulation,
      counts,
      communications,
      injections: formattedInjections,
    });
  } catch (error) {
    console.error("[PARTICIPANT_VIEW_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
