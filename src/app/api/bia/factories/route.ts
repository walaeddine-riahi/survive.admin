/**
 * API Routes pour les Factories
 *
 * GET  /api/bia/factories - Liste toutes les usines
 * POST /api/bia/factories - Créer une nouvelle usine
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/bia/factories
 * Récupère toutes les usines avec leurs statistiques
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");

    const factories = await prisma.factory.findMany({
      where: isActive !== null ? { isActive: isActive === "true" } : undefined,
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
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
    });

    return NextResponse.json(factories);
  } catch (error) {
    console.error("Erreur lors de la récupération des usines:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * POST /api/bia/factories
 * Créer une nouvelle usine
 */
export async function POST(request: NextRequest) {
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
      isActive = true,
      managerId,
    } = body;

    // Validation
    if (!name || !code) {
      return NextResponse.json(
        { error: "Le nom et le code sont requis" },
        { status: 400 }
      );
    }

    // Vérifier l'unicité du code
    const existing = await prisma.factory.findUnique({
      where: { code },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ce code existe déjà" },
        { status: 400 }
      );
    }

    const factory = await prisma.factory.create({
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
        createdById: session.user.id,
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

    return NextResponse.json(factory, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'usine:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
