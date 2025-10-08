import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { simulationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const assignments = await prisma.simulationAssignment.findMany({
      where: {
        simulationId: params.simulationId,
      },
      include: {
        user: true,
        simulation: true,
      },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Erreur lors de la récupération des affectations:", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { simulationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const body = await request.json();
    const { userId, role, teamId } = body;

    if (!userId || !role) {
      return new NextResponse("Données manquantes", { status: 400 });
    }

    // Vérifier si l'affectation existe déjà
    const existingAssignment = await prisma.simulationAssignment.findFirst({
      where: {
        userId,
        simulationId: params.simulationId,
      },
    });

    if (existingAssignment) {
      return new NextResponse(
        "Cet utilisateur est déjà affecté à cette simulation",
        { status: 400 }
      );
    }

    const assignment = await prisma.simulationAssignment.create({
      data: {
        userId,
        simulationId: params.simulationId,
        role,
        teamId: teamId || null,
      },
      include: {
        user: true,
        simulation: true,
      },
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Erreur lors de la création de l'affectation:", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { simulationId: string; assignmentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const body = await request.json();
    const { role, teamId } = body;

    if (!role) {
      return new NextResponse("Données manquantes", { status: 400 });
    }

    const assignment = await prisma.simulationAssignment.update({
      where: {
        id: params.assignmentId,
        simulationId: params.simulationId,
      },
      data: {
        role,
        teamId: teamId || null,
      },
      include: {
        user: true,
        simulation: true,
      },
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'affectation:", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
