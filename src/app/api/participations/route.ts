import { getAuthSession } from "@/lib/auth-utils";
import { sendWelcomeEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
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
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { userId, simulationId, role } = await request.json();

    if (!userId || !simulationId || !role) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const existingParticipation = await prisma.simulationAssignment.findFirst({
      where: {
        userId: userId,
        simulationId: simulationId,
      },
    });

    if (existingParticipation) {
      return NextResponse.json({ message: "Participation already exists" }, { status: 409 });
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

    // Find associated SimSession if it exists
    const simSession = await prisma.simSession.findFirst({
      where: { simulationId },
    });

    let simParticipantId: string | undefined;

    if (simSession && user) {
      const simParticipant = await prisma.simParticipant.upsert({
        where: { sessionId_userId: { sessionId: simSession.id, userId: user.id } },
        create: {
          sessionId: simSession.id,
          userId: user.id,
          displayName: `${user.firstName} ${user.lastName}`,
          role: role || "Participant",
          email: user.email,
          simEmail: `${user.firstName?.toLowerCase()}.${user.lastName?.toLowerCase()}@sim.survive.io`,
        },
        update: {},
      });
      simParticipantId = simParticipant.id;
    }

    if (
      user &&
      user.firstName &&
      simulation &&
      simulation.title &&
      simulation.id
    ) {
      try {
        await sendWelcomeEmail({
          email: user.email,
          firstName: user.firstName,
          password: user.password,
          simulationTitle: simulation.title,
          simulationId: simulation.id,
          sessionId: simSession?.id,
          participantId: simParticipantId
        });
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
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { participationId: string } }
) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { participationId } = params;
    const { role } = await request.json();

    if (!role) {
      return NextResponse.json({ message: "Missing role field" }, { status: 400 });
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
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
