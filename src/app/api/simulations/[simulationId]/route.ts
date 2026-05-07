import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ simulationId: string }> }
) {
  try {
    const { simulationId } = await params;

    const simulation = await prisma.simulation.findUnique({
      where: {
        id: simulationId,
      },
      include: {
        scenarios: true, // Include scenarios if needed on the edit page
        assignments: {
          // Include assignments if your form uses them
          include: {
            user: true, // Include user details for assignments
          },
        },
      },
    });

    if (!simulation) {
      return new NextResponse("Simulation not found", { status: 404 });
    }

    return NextResponse.json(simulation);
  } catch (error) {
    console.error("[SIMULATION_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ simulationId: string }> }
) {
  try {
    const { simulationId } = await params;
    const data = await req.json();

    // You might want to add validation here for the incoming data

    const updatedSimulation = await prisma.simulation.update({
      where: {
        id: simulationId,
      },
      data: {
        title: data.title,
        description: data.description,
        startDate: new Date(data.startDate), // Ensure dates are Date objects
        endDate: new Date(data.endDate), // Ensure dates are Date objects
        status: data.status,
        // Add logic here to handle assignments updates if needed
        // For now, focusing on core simulation fields
      },
    });

    return NextResponse.json(updatedSimulation);
  } catch (error) {
    console.error("[SIMULATION_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ simulationId: string }> }
) {
  try {
    const { simulationId } = await params;

    // Seuls les ADMINS peuvent supprimer des simulations
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Accès refusé - Réservé aux administrateurs" },
        { status: 403 }
      );
    }

    // Supprimer toutes les dépendances requises d'abord pour éviter les conflits relationnels
    await prisma.$transaction([
      // Supprimer les réponses aux injections
      prisma.injectResponse.deleteMany({ where: { simulationId } }),
      
      // Supprimer les scores des participants
      prisma.participantScore.deleteMany({ where: { simulationId } }),
      
      // Supprimer les debriefs
      prisma.simulationDebrief.deleteMany({ where: { simulationId } }),
      
      // Supprimer les plans de gestion de crise
      prisma.simulationCrisisPlan.deleteMany({ where: { simulationId } }),
      
      // Supprimer les critères d'évaluation
      prisma.evaluationCriteria.deleteMany({ where: { simulationId } }),
      
      // Supprimer les notifications liées à la simulation
      prisma.notification.deleteMany({ where: { simulationId } }),

      // Supprimer les injections liées à la simulation
      prisma.injection.deleteMany({ where: { simulationId } }),

      // Supprimer les scénarios liés à la simulation
      prisma.scenario.deleteMany({ where: { simulationId } }),

      // Supprimer les communications liées à la simulation
      prisma.communication.deleteMany({ where: { simulationId } }),

      // Supprimer les assignations de simulation
      prisma.simulationAssignment.deleteMany({ where: { simulationId } }),

      // Mettre à jour les participations pour détacher la simulation (SetNull)
      prisma.participation.updateMany({
        where: { simulationId },
        data: { simulationId: null },
      }),

      // Mettre à jour les fichiers uploadés pour détacher la simulation (SetNull)
      prisma.fileUpload.updateMany({
        where: { simulationId },
        data: { simulationId: null },
      }),

      // Enfin, supprimer la simulation elle-même
      prisma.simulation.delete({
        where: { id: simulationId },
      }),
    ]);

    return NextResponse.json({ message: "Simulation supprimée avec succès" });
  } catch (error) {
    console.error("[SIMULATION_DELETE]", error);
    return NextResponse.json(
      { message: "Une erreur est survenue lors de la suppression de la simulation." },
      { status: 500 }
    );
  }
}
