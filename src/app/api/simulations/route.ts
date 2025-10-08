import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const simulations = await prisma.simulation.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(simulations);
  } catch (error) {
    console.error("[SIMULATIONS_GET]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const data = await req.json();
    const { assignments, ...simulationData } = data;

    if (
      !simulationData.title ||
      !simulationData.startDate ||
      !simulationData.endDate
    ) {
      return new NextResponse("Données manquantes", { status: 400 });
    }

    const simulation = await prisma.simulation.create({
      data: {
        ...simulationData,
        assignments: {
          create: assignments.map((assignment: any) => ({
            userId: assignment.userId,
            role: assignment.role,
            status: assignment.status,
          })),
        },
      },
      include: {
        assignments: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json(simulation);
  } catch (error) {
    console.error("Error creating simulation:", error);
    return NextResponse.json(
      { error: "Failed to create simulation" },
      { status: 500 }
    );
  }
}
