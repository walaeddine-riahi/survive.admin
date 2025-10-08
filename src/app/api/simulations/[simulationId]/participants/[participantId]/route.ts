import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { simulationId: string; participantId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { simulationId, participantId } = params;

    // Vérifier si l'utilisateur est bien un participant de la simulation
    const assignment = await prisma.simulationAssignment.findFirst({
      where: {
        simulationId: simulationId,
        userId: participantId,
      },
    });

    if (!assignment) {
      return new NextResponse("Participant not found in this simulation", {
        status: 404,
      });
    }

    // Supprimer l'association
    await prisma.simulationAssignment.delete({
      where: {
        id: assignment.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[PARTICIPANT_DELETE] Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
