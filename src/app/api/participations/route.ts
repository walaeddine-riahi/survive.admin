import { getAuthSession } from "@/lib/auth-utils";
import { sendWelcomeEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const participations = await prisma.simulationAssignment.findMany({
      include: {
        user: true,
        simulation: true,
      },
    });

    return NextResponse.json(participations);
  } catch (error) {
    console.error("[PARTICIPATIONS_GET] Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const { userId, simulationId, role } = await request.json();

    if (!userId || !simulationId || !role) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const existingParticipation = await prisma.simulationAssignment.findFirst({
      where: {
        userId: userId,
        simulationId: simulationId,
      },
    });

    if (existingParticipation) {
      return new NextResponse("Participation already exists", { status: 409 });
    }

    const newParticipation = await prisma.simulationAssignment.create({
      data: {
        userId,
        simulationId,
        role,
      },
    });

    let emailSent = false;

    // Fetch user and simulation details for email
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const simulation = await prisma.simulation.findUnique({
      where: { id: simulationId },
      select: { id: true, title: true },
    });

    if (
      user &&
      user.firstName &&
      simulation &&
      simulation.title &&
      simulation.id
    ) {
      try {
        console.log("Tentative d'envoi de l'email de bienvenue...");
        await sendWelcomeEmail(
          user.email,
          user.firstName,
          simulation.title,
          simulation.id
        );
        console.log("Email de bienvenue envoyé avec succès.");
        emailSent = true;
      } catch (emailError) {
        console.error(
          "Erreur lors de l'envoi de l'email de bienvenue:",
          emailError
        );
      }
    } else {
      console.log(
        "Email de bienvenue non envoyé: informations manquantes pour l'utilisateur ou la simulation."
      );
    }

    return NextResponse.json(
      { ...newParticipation, emailSent },
      { status: 201 }
    );
  } catch (error) {
    console.error("[PARTICIPATIONS_POST] Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { participationId: string } }
) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const { participationId } = params;
    const { role } = await request.json();

    if (!role) {
      return new NextResponse("Missing role field", { status: 400 });
    }

    const updatedParticipation = await prisma.simulationAssignment.update({
      where: {
        id: participationId,
      },
      data: {
        role,
      },
    });

    return NextResponse.json(updatedParticipation);
  } catch (error) {
    console.error("[PARTICIPATIONS_PATCH] Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
