import { getAuthSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { simulationId: string } }
) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { simulationId } = params;

    // Fetch simulation with all relations
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
        communications: {
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
          orderBy: {
            createdAt: "desc",
          },
        },
        injections: {
          include: {
            scenario: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!simulation) {
      return new NextResponse("Simulation not found", { status: 404 });
    }

    // Group communications by type
    const communications: Record<string, unknown[]> = {
      email: [],
      sms: [],
      call: [],
      alert: [],
      memo: [],
      newsBroadcast: [],
      newspaper: [],
      social: [],
    };

    simulation.communications.forEach((comm) => {
      const type = comm.type || "email";
      if (!communications[type]) {
        communications[type] = [];
      }
      communications[type].push(comm);
    });

    // Format injections with scenario name
    const injections = simulation.injections.map((inj) => ({
      ...inj,
      scenarioName: inj.scenario?.name || "Sans scénario",
    }));

    // Calculate statistics
    const totalParticipants = simulation.assignments.length;
    const totalCommunications = simulation.communications.length;
    const totalInjections = injections.length;
    const acknowledgedInjections = injections.filter(
      (inj) => inj.acknowledged
    ).length;
    const acknowledgementRate =
      totalInjections > 0
        ? (acknowledgedInjections / totalInjections) * 100
        : 0;

    return NextResponse.json({
      simulation,
      communications,
      injections,
      statistics: {
        totalParticipants,
        totalCommunications,
        totalInjections,
        acknowledgedInjections,
        acknowledgementRate,
      },
    });
  } catch (error) {
    console.error("[INSTRUCTOR_VIEW_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
