import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: { simulationId: string; assignmentId: string };
  }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const assignment = await prisma.simulationAssignment.delete({
      where: {
        id: params.assignmentId,
        simulationId: params.simulationId,
      },
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Erreur lors de la suppression de l'affectation:", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: { simulationId: string; assignmentId: string };
  }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const body = await request.json();
    const { role } = body;

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
