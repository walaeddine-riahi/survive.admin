import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Configuration pour indiquer à Next.js que cette route utilise des paramètres dynamiques
export const dynamic = 'force-dynamic';

type RouteParams = {
  params: {
    scenarioId: string;
  };
};

export async function GET(
  request: Request,
  { params }: RouteParams
) {
  // Extraire le scenarioId des paramètres de la route
  const { scenarioId } = params;
  try {
    // Vérifier que le scenarioId est fourni
    if (!scenarioId) {
      return NextResponse.json(
        { error: "scenarioId is required" },
        { status: 400 }
      );
    }

    const injections = await prisma.injection.findMany({
      where: {
        scenarioId: scenarioId,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        scenario: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json(injections);
  } catch (error) {
    console.error(
      "Error fetching injections for scenario:",
      error
    );
    return NextResponse.json(
      { error: "Failed to fetch injections for scenario" },
      { status: 500 }
    );
  }
}

// La configuration dynamique est déjà définie en haut du fichier
