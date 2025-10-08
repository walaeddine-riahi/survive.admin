import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET /api/incidents - Récupérer tous les incidents
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const incidents = await prisma.incident.findMany({
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        type: true,
        team: true,
        plan: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(incidents);
  } catch (error) {
    console.error("[INCIDENTS_GET]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}

// POST /api/incidents - Créer un nouvel incident
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      description,
      location,
      resources,
      requiredVehicles,
      latitude,
      longitude,
      incidentDate,
      typeId,
      teamId,
      planId,
    } = body;

    if (!name || !description || !location || !typeId) {
      return new NextResponse("Données manquantes", { status: 400 });
    }

    const incident = await prisma.incident.create({
      data: {
        name,
        description,
        location,
        resources,
        requiredVehicles,
        latitude,
        longitude,
        incidentDate: new Date(incidentDate),
        reporterId: session.user.id,
        typeId,
        teamId,
        planId,
      },
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        type: true,
        team: true,
        plan: true,
      },
    });

    return NextResponse.json(incident);
  } catch (error) {
    console.error("[INCIDENTS_POST]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
