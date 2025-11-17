/**
 * API Routes pour une Factory spécifique
 *
 * GET    /api/bia/factories/[id] - Récupère une usine
 * PUT    /api/bia/factories/[id] - Met à jour une usine
 * DELETE /api/bia/factories/[id] - Supprime une usine
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/bia/factories/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const factory = await prisma.factory.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            processes: true,
            biaReports: true,
          },
        },
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!factory) {
      return NextResponse.json({ error: "Usine non trouvée" }, { status: 404 });
    }

    return NextResponse.json(factory);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'usine:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * PUT /api/bia/factories/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      code,
      description,
      address,
      city,
      postalCode,
      country,
      region,
      department,
      phoneNumber,
      email,
      isActive,
      managerId,
    } = body;

    // Vérifier que l'usine existe
    const existing = await prisma.factory.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Usine non trouvée" }, { status: 404 });
    }

    // Si le code change, vérifier l'unicité
    if (code && code !== existing.code) {
      const codeExists = await prisma.factory.findUnique({
        where: { code },
      });

      if (codeExists) {
        return NextResponse.json(
          { error: "Ce code existe déjà" },
          { status: 400 }
        );
      }
    }

    const factory = await prisma.factory.update({
      where: { id: params.id },
      data: {
        name,
        code,
        description,
        address,
        city,
        postalCode,
        country,
        region,
        department,
        phoneNumber,
        email,
        isActive,
        managerId,
      },
      include: {
        _count: {
          select: {
            processes: true,
            biaReports: true,
          },
        },
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(factory);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'usine:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * DELETE /api/bia/factories/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'usine existe
    const existing = await prisma.factory.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            processes: true,
            biaReports: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Usine non trouvée" }, { status: 404 });
    }

    // Vérifier si l'usine a des processus ou rapports
    if (existing._count.processes > 0 || existing._count.biaReports > 0) {
      return NextResponse.json(
        {
          error:
            "Impossible de supprimer une usine contenant des processus ou rapports",
        },
        { status: 400 }
      );
    }

    await prisma.factory.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'usine:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
