import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { simulationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const url = new URL(req.url);
    const isParticipantView = url.searchParams.get("view") === "participant";
    const targetUserId = url.searchParams.get("targetUserId");

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Attendre la résolution des paramètres
    const { simulationId } = await params;

    interface WhereClause {
      simulationId: string;
      isActive?: boolean;
      targetUserId?: string;
      OR?: Array<{ targetUserId: string | null }>;
    }

    const whereClause: WhereClause = {
      simulationId: simulationId,
    };

    // Si c'est la vue participant, on ne récupère que les injections actives
    if (isParticipantView) {
      whereClause.isActive = true;

      // Filtrer les injections qui sont soit globales (sans targetUserId) soit destinées à l'utilisateur connecté
      whereClause.OR = [
        { targetUserId: null },
        { targetUserId: session.user.id },
      ];
    } else if (targetUserId) {
      // Si un targetUserId est spécifié dans l'URL, filtrer pour cet utilisateur
      whereClause.targetUserId = targetUserId;
    }

    const injections = await prisma.injection.findMany({
      where: whereClause,
      include: {
        scenario: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedInjections = injections.map((injection) => {
      // Créer une copie de l'injection sans le champ scenario
      const { scenario, ...injectionWithoutScenario } = injection;

      // Retourner l'objet formaté avec le nom du scénario ou 'workshop' par défaut
      return {
        ...injectionWithoutScenario,
        scenarioName: scenario?.name || "workshop",
        createdAt: injection.createdAt.toISOString(),
        updatedAt: injection.updatedAt.toISOString(),
      };
    });

    return NextResponse.json(formattedInjections);
  } catch (error) {
    console.error("[INJECTIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { simulationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Attendre la résolution des paramètres
    const { simulationId } = await params;

    // Log des paramètres reçus
    console.log("Simulation ID:", simulationId);

    const requestBody = await req.json();
    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    const {
      title,
      content,
      scenarioName,
      type,
      imageUrl,
      videoUrl,
      attachments,
      targetUserId,
      targetUserIds,
    } = requestBody;

    // Vérification des champs requis
    const missingFields = [];
    if (!title) missingFields.push("title");
    if (!content) missingFields.push("content");
    if (!scenarioName) missingFields.push("scenarioName");
    if (!type) missingFields.push("type");

    if (missingFields.length > 0) {
      console.error("Champs manquants:", missingFields);
      return new NextResponse(`Champs manquants: ${missingFields.join(", ")}`, {
        status: 400,
      });
    }

    const scenario = await prisma.scenario.findFirst({
      where: {
        name: scenarioName,
        simulationId: simulationId,
      },
    });

    if (!scenario) {
      return new NextResponse("Scenario not found", { status: 404 });
    }

    // Vérifier si les utilisateurs cibles existent si spécifiés
    if (Array.isArray(targetUserIds) && targetUserIds.length > 0) {
      for (const tUserId of targetUserIds) {
        if (tUserId) {
          const targetUser = await prisma.user.findUnique({
            where: { id: tUserId },
          });

          if (!targetUser) {
            return new NextResponse(`L'utilisateur cible ${tUserId} n'existe pas`, {
              status: 404,
            });
          }
        }
      }
    } else if (targetUserId) {
      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
      });

      if (!targetUser) {
        return new NextResponse("L'utilisateur cible n'existe pas", {
          status: 404,
        });
      }
    }

    try {
      const targetIdsToCreate = Array.isArray(targetUserIds) && targetUserIds.length > 0 
        ? targetUserIds 
        : [targetUserId || null];

      const createdInjections = [];
      for (const tUserId of targetIdsToCreate) {
        const newInjection = await prisma.injection.create({
          data: {
            title,
            content,
            type,
            imageUrl,
            videoUrl,
            attachments: attachments || [],
            triggerType: "MANUAL",
            isActive:
              requestBody.isActive !== undefined ? requestBody.isActive : true,
            simulation: {
              connect: { id: simulationId },
            },
            scenario: {
              connect: { id: scenario.id },
            },
            payload: {},
            ...(tUserId && { targetUserId: tUserId }),
          },
        });
        createdInjections.push(newInjection);
      }

      console.log("Injections créées avec succès:", createdInjections);
      return NextResponse.json(createdInjections[0], { status: 201 });
    } catch (dbError) {
      console.error("Erreur lors de la création de l'injection:", dbError);
      if (dbError instanceof Error) {
        console.error("Message d'erreur:", dbError.message);
        console.error("Stack trace:", dbError.stack);
      }
      return new NextResponse(
        `Erreur lors de la création de l'injection: ${
          dbError instanceof Error ? dbError.message : "Erreur inconnue"
        }`,
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[INJECTIONS_POST] Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { simulationId: string; injectionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Attendre la résolution des paramètres
    const { simulationId, injectionId } = await params;
    const requestBody = await req.json();
    const {
      title,
      content,
      scenarioName,
      type,
      imageUrl,
      videoUrl,
      attachments,
      isActive,
    } = requestBody;

    if (!title || !content || !scenarioName || !type) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const scenario = await prisma.scenario.findFirst({
      where: {
        name: scenarioName,
        simulationId: simulationId,
      },
    });

    if (!scenario) {
      return new NextResponse("Scenario not found", { status: 404 });
    }

    const updatedInjection = await prisma.injection.update({
      where: {
        id: injectionId,
      },
      data: {
        title,
        content,
        type,
        imageUrl,
        videoUrl,
        attachments: attachments || [],
        isActive: isActive !== undefined ? isActive : true,
        scenario: {
          connect: { id: scenario.id },
        },
      },
    });

    return NextResponse.json(updatedInjection);
  } catch (error) {
    console.error("[INJECTIONS_PUT] Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { simulationId: string; injectionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Attendre la résolution des paramètres
    const { injectionId } = await params;

    await prisma.injection.delete({
      where: {
        id: injectionId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[INJECTIONS_DELETE] Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
