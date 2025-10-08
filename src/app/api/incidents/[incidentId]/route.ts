import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET /api/incidents/[incidentId] - Récupérer un incident spécifique
export async function GET(
  req: Request,
  { params }: { params: { incidentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const incident = await prisma.incident.findUnique({
      where: {
        id: params.incidentId,
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

    if (!incident) {
      return new NextResponse("Incident non trouvé", { status: 404 });
    }

    return NextResponse.json(incident);
  } catch (error) {
    console.error("[INCIDENT_GET]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}

// PATCH /api/incidents/[incidentId] - Mettre à jour un incident
export async function PATCH(
  req: Request,
  { params }: { params: { incidentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      description,
      status,
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

    const incident = await prisma.incident.update({
      where: {
        id: params.incidentId,
      },
      data: {
        name,
        description,
        status,
        location,
        resources,
        requiredVehicles,
        latitude,
        longitude,
        incidentDate: incidentDate ? new Date(incidentDate) : undefined,
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
    console.error("[INCIDENT_PATCH]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}

// DELETE /api/incidents/[incidentId] - Supprimer un incident
export async function DELETE(
  req: Request,
  { params }: { params: { incidentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    await prisma.incident.delete({
      where: {
        id: params.incidentId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[INCIDENT_DELETE]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
