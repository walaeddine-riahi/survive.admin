import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

interface Params {
  params: {
    participationId: string;
  };
}

export async function GET(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const participation = await prisma.participation.findUnique({
      where: {
        id: params.participationId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        event: true,
      },
    });

    if (!participation) {
      return NextResponse.json({ message: "Participation non trouvée" }, { status: 404 });
    }

    return NextResponse.json(participation);
  } catch (error) {
    console.error("[PARTICIPATION_GET]", error);
    return NextResponse.json({ message: "Erreur interne" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json({ message: "Données manquantes" }, { status: 400 });
    }

    const participation = await prisma.simulationAssignment.update({
      where: {
        id: params.participationId,
      },
      data: {
        role,
      },
      include: {
        user: true,
        simulation: true,
      },
    });

    return NextResponse.json(participation);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la participation:", error);
    return NextResponse.json({ message: "Erreur interne" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { participationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const participation = await prisma.simulationAssignment.delete({
      where: {
        id: params.participationId,
      },
    });

    return NextResponse.json(participation);
  } catch (error) {
    console.error("Erreur lors de la suppression de la participation:", error);
    return NextResponse.json({ message: "Erreur interne" }, { status: 500 });
  }
}
