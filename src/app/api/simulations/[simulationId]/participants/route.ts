import { getAuthSession } from "@/lib/auth-utils";
import { sendWelcomeEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { simulationId: string } }
) {
  console.log("[SIMULATION_PARTICIPANTS_GET] Début de la requête");
  try {
    const session = await getAuthSession();
    console.log(
      "[SIMULATION_PARTICIPANTS_GET] Session:",
      session ? "trouvée" : "non trouvée"
    );

    if (!session) {
      console.log(
        "[SIMULATION_PARTICIPANTS_GET] Non autorisé: session manquante"
      );
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { simulationId } = params;
    console.log("[SIMULATION_PARTICIPANTS_GET] Simulation ID:", simulationId);

    if (!simulationId) {
      console.error("[SIMULATION_PARTICIPANTS_GET] ID de simulation manquant");
      return new NextResponse("Simulation ID is required", { status: 400 });
    }

    // Récupérer tous les participants de la simulation avec leurs informations utilisateur
    console.log(
      "[SIMULATION_PARTICIPANTS_GET] Récupération des participants..."
    );

    try {
      const participants = await prisma.simulationAssignment.findMany({
        where: {
          simulationId,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              role: true,
              teams: {
                orderBy: {
                  createdAt: "desc",
                },
                select: {
                  teamId: true,
                  team: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      const normalizedParticipants = participants.map((assignment) => {
        const fallbackTeam = assignment.user.teams?.[0]?.team || null;
        const effectiveTeam = assignment.team || fallbackTeam;
        const effectiveTeamId = assignment.teamId || fallbackTeam?.id || null;

        return {
          ...assignment,
          teamId: effectiveTeamId,
          team: effectiveTeam,
        };
      });

      console.log(
        `[SIMULATION_PARTICIPANTS_GET] ${participants.length} participants trouvés`
      );
      return NextResponse.json(normalizedParticipants);
    } catch (dbError) {
      console.error(
        "[SIMULATION_PARTICIPANTS_GET] Erreur de base de données:",
        dbError
      );
      throw dbError;
    }
  } catch (error) {
    console.error("[SIMULATION_PARTICIPANTS_GET] Erreur détaillée:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { simulationId: string } }
) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { simulationId } = params;
    const { email } = await req.json();

    console.log("Tentative d'ajout d'un participant:", { email, simulationId });

    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("Utilisateur non trouvé:", email);
      return new NextResponse("User not found", { status: 404 });
    }

    console.log("Utilisateur trouvé:", {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
    });

    // Get simulation details for the welcome email
    const simulation = await prisma.simulation.findUnique({
      where: { id: simulationId },
      select: { title: true },
    });

    if (!simulation) {
      console.log("Simulation non trouvée:", simulationId);
      return new NextResponse("Simulation not found", { status: 404 });
    }

    console.log("Simulation trouvée:", {
      id: simulationId,
      title: simulation.title,
    });

    // Add user to simulation
    const participant = await prisma.simulationAssignment.create({
      data: {
        simulation: { connect: { id: simulationId } },
        user: { connect: { id: user.id } },
      },
    });

    console.log("Participant ajouté avec succès:", participant);

    let emailSent = false;

    // Send welcome email using TypeScript function
    if (user.firstName) {
      try {
        console.log("Tentative d'envoi de l'email de bienvenue...");
        await sendWelcomeEmail(user.email, user.firstName, simulation.title);
        console.log("Email de bienvenue envoyé avec succès.");
        emailSent = true;
      } catch (emailError) {
        console.error(
          "Erreur lors de l'envoi de l'email de bienvenue:",
          emailError
        );
        // Continue even if email fails - don't block participant addition
      }
    } else {
      console.log(
        "Email de bienvenue non envoyé: prénom manquant pour l'utilisateur"
      );
    }

    return NextResponse.json({ ...participant, emailSent });
  } catch (error) {
    console.error("[SIMULATION_PARTICIPANTS_POST] Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
