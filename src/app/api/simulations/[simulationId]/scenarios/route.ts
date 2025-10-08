import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { simulationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);

    if (!session) {
      console.error('Aucune session trouvée');
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Attendre la résolution des paramètres
    const { simulationId } = await params;
    console.log('Simulation ID:', simulationId);

    const scenarios = await prisma.scenario.findMany({
      where: {
        simulationId: simulationId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(scenarios);
  } catch (error) {
    console.error("[SIMULATION_SCENARIOS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
