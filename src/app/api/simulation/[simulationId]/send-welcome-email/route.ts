import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ simulationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { simulationId } = await params;
    if (!simulationId) {
      return new NextResponse("Simulation ID is required", { status: 400 });
    }

    // 1. Récupérer la simulation
    const simulation = await prisma.simulation.findUnique({
      where: { id: simulationId },
      select: { title: true }
    });

    if (!simulation) {
      return new NextResponse("Simulation not found", { status: 404 });
    }

    // 2. Récupérer tous les participants (assignments)
    const assignments = await prisma.simulationAssignment.findMany({
      where: { simulationId },
      include: {
        user: true // On prend tout le user pour avoir l'email, firstName, password
      }
    });

    // 3. Récupérer la session live si elle existe
    const simSession = await prisma.simSession.findFirst({
      where: { simulationId }
    });

    let emailsSent = 0;
    let emailsFailed = 0;

    // 4. Envoyer les emails
    for (const assignment of assignments) {
      const user = assignment.user;
      if (!user || !user.email || !user.firstName) continue;

      let simParticipantId: string | undefined;
      if (simSession) {
        const simParticipant = await prisma.simParticipant.findFirst({
          where: {
            sessionId: simSession.id,
            userId: user.id
          }
        });
        simParticipantId = simParticipant?.id;
      }

      try {
        await sendWelcomeEmail({
          email: user.email,
          firstName: user.firstName,
          password: user.password || "", // Au cas où le mot de passe est nul
          simulationTitle: simulation.title,
          simulationId,
          sessionId: simSession?.id,
          participantId: simParticipantId
        });
        emailsSent++;
      } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error);
        emailsFailed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `${emailsSent} emails envoyés avec succès. ${emailsFailed} échecs.`,
      emailsSent,
      emailsFailed
    });

  } catch (error) {
    console.error("Error in send-welcome-email route:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
