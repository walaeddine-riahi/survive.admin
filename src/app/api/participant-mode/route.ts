import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get simulations where the user is assigned
    const simulations = await prisma.simulation.findMany({
      where: {
        assignments: {
          some: {
            userId: session.user.id,
          },
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        status: true,
        assignments: {
          where: {
            userId: session.user.id,
          },
          select: {
            status: true,
          },
        },
      },
    });

    // Transform the data to include assignment status
    const transformedSimulations = simulations.map((sim) => ({
      ...sim,
      assignmentStatus: sim.assignments[0]?.status || "pending",
    }));

    // Get active incidents where the user is involved
    const activeIncidents = await prisma.incident.findMany({
      where: {
        status: {
          in: ["OPEN", "IN_PROGRESS", "INVESTIGATING"],
        },
        team: {
          members: {
            some: {
              userId: session.user.id,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        location: true,
      },
    });

    return NextResponse.json({
      simulations: transformedSimulations,
      incidents: activeIncidents,
    });
  } catch (error) {
    console.error("[PARTICIPANT_MODE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
