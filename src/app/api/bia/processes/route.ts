import { NextResponse } from "next/server";
import { createProcess, updateProcess } from "@/actions/bia/process-actions";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const factoryId = searchParams.get("factoryId");
    const limit = parseInt(searchParams.get("limit") || "100");

    const where = factoryId ? { factoryId } : {};

    const processes = await prisma.process.findMany({
      where,
      include: {
        factory: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return NextResponse.json({ success: true, processes });
  } catch (error) {
    console.error("Error in GET /api/bia/processes:", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log("Début de la requête POST /api/bia/processes");
    const session = await getServerSession(authOptions);
    console.log("Session:", session ? "Authentifié" : "Non authentifié");

    if (!session) {
      console.log("Accès refusé: utilisateur non authentifié");
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const data = await request.json();
    console.log("Données reçues:", JSON.stringify(data, null, 2));

    const result = await createProcess(data);
    console.log("Résultat de createProcess:", result);

    if (!result.success) {
      console.error("Erreur lors de la création du processus:", result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Erreur lors de la création du processus",
        },
        { status: 400 }
      );
    }

    console.log("Processus créé avec succès:", result.data);
    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Error in POST /api/bia/processes:", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    console.log("Début de la requête PUT /api/bia/processes");
    const session = await getServerSession(authOptions);
    console.log("Session:", session ? "Authentifié" : "Non authentifié");

    if (!session) {
      console.log("Accès refusé: utilisateur non authentifié");
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const requestData = await request.json();
    console.log("Données reçues:", JSON.stringify(requestData, null, 2));

    const { id, ...data } = requestData;
    if (!id) {
      console.error("Erreur: ID du processus manquant dans la requête");
      return new NextResponse("ID du processus manquant", { status: 400 });
    }

    console.log("Tentative de mise à jour du processus ID:", id);
    const result = await updateProcess(id, data);
    console.log("Résultat de updateProcess:", result);

    if (!result.success) {
      console.error(
        "Erreur lors de la mise à jour du processus:",
        result.error
      );
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Erreur lors de la mise à jour du processus",
        },
        { status: 400 }
      );
    }

    console.log("Processus mis à jour avec succès:", result.data);
    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Error in PUT /api/bia/processes:", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
