import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { pushToSession, pushToParticipant, SIM_EVENTS } from "@/lib/simulation/pusher";
import { sendSimMessage } from "@/actions/simulation/sim-session-actions";

// Enumérations pour les types d'injection
enum InjectionType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  MEMO = 'MEMO',
  ALERT = 'ALERT',
  SOCIAL = 'SOCIAL',
  NEWS_BROADCAST = 'NEWS_BROADCAST',
  CALL = 'CALL',
  NEWSPAPER = 'NEWSPAPER',
  OTHER = 'OTHER'
}

// Types pour les requêtes et réponses
type InjectionWithRelations = Awaited<ReturnType<typeof getInjectionWithRelations>>;

async function getInjectionWithRelations(id: string) {
  return prisma.injection.findUnique({
    where: { id },
    include: {
      scenario: {
        select: {
          id: true,
          name: true,
          simulationId: true
        }
      },
      simulation: {
        select: {
          id: true,
          title: true
        }
      }
    }
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ injectionId: string }> }
) {
  try {
    const { injectionId } = await params;
    if (!injectionId) {
      return NextResponse.json(
        { error: "Injection ID is required" },
        { status: 400 }
      );
    }

    const injection = await getInjectionWithRelations(injectionId);

    if (!injection) {
      return NextResponse.json(
        { error: "Injection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(injection);
  } catch (error) {
    console.error("Error fetching injection:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch injection",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ injectionId: string }> }
) {
  try {
    const { injectionId } = await params;
    // Vérifier que l'ID est présent dans les paramètres
    if (!injectionId) {
      return NextResponse.json(
        { error: "Injection ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { 
      title, 
      content, 
      triggerType, 
      timeOffset, 
      isRepeating, 
      repeatInterval, 
      scenarioId,
      simulationId,
      isActive,
      type,
      imageUrl,
      videoUrl,
      payload,
      attachments,
      targetUserId
    } = body;

    // Valider les données requises
    if (!title || !triggerType || !type) {
      return NextResponse.json(
        { error: "Title, triggerType and type are required" },
        { status: 400 }
      );
    }
    
    // Valider que le type est valide
    const validTypes = Object.values(InjectionType);
    if (!validTypes.includes(type as InjectionType)) {
      return NextResponse.json(
        { error: `Invalid injection type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Vérifier que l'injection existe
    const existingInjection = await prisma.injection.findUnique({
      where: { id: injectionId }
    });

    if (!existingInjection) {
      return NextResponse.json(
        { error: "Injection not found" },
        { status: 404 }
      );
    }

    // Préparer les données pour la mise à jour
    const updateData: any = {
      title,
      content: content || null,
      triggerType,
      ...(timeOffset !== undefined && { timeOffset: Number(timeOffset) }),
      ...(isRepeating !== undefined && { isRepeating: Boolean(isRepeating) }),
      ...(repeatInterval !== undefined && { repeatInterval: Number(repeatInterval) }),
      ...(scenarioId && { scenario: { connect: { id: scenarioId } } }),
      ...(simulationId && { simulation: { connect: { id: simulationId } } }),
      ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      ...(type && { type }),
      ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
      ...(videoUrl !== undefined && { videoUrl: videoUrl || null }),
      ...(payload !== undefined && { 
        payload: payload ? (typeof payload === 'string' ? JSON.parse(payload) : payload) : null 
      }),
      ...(attachments !== undefined && { 
        attachments: attachments ? (typeof attachments === 'string' ? JSON.parse(attachments) : attachments) : null 
      }),
      ...(targetUserId !== undefined && { 
        targetUser: targetUserId ? { connect: { id: targetUserId } } : { disconnect: true }
      }),
    };

    // Mettre à jour l'injection
    const updatedInjection = await prisma.injection.update({
      where: { id: injectionId },
      data: updateData,
      include: {
        scenario: {
          select: {
            id: true,
            name: true,
            simulationId: true
          }
        },
        simulation: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    return NextResponse.json(updatedInjection);
  } catch (error) {
    console.error("Error updating injection:", error);
    
    // Gestion des erreurs spécifiques
    if (error instanceof Error) {
      if (error.message.includes('Record to update not found')) {
        return NextResponse.json(
          { error: "Injection not found" },
          { status: 404 }
        );
      }
      
      if (error instanceof SyntaxError) {
        return NextResponse.json(
          { error: "Invalid JSON in payload or attachments" },
          { status: 400 }
        );
      }
      
      // Gestion des erreurs de validation Prisma
      if (error.name === 'PrismaClientValidationError') {
        return NextResponse.json(
          { 
            error: "Validation error",
            details: error.message
          },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: "Failed to update injection",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ injectionId: string }> }
) {
  try {
    const { injectionId } = await params;
    // Vérifier que l'ID est présent dans les paramètres
    if (!injectionId) {
      return NextResponse.json(
        { error: "ID de l'injection requis" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { isActive } = body;

    // Valider que isActive est un booléen
    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: "Le statut doit être un booléen" },
        { status: 400 }
      );
    }

    // Vérifier que l'injection existe
    const existingInjection = await prisma.injection.findUnique({
      where: { id: injectionId },
    });

    if (!existingInjection) {
      return NextResponse.json(
        { error: "Injection non trouvée" },
        { status: 404 }
      );
    }

    // Mettre à jour uniquement le statut
    const updatedInjection = await prisma.injection.update({
      where: { id: injectionId },
      data: { isActive },
      include: {
        scenario: {
          select: {
            id: true,
            name: true,
            simulationId: true
          }
        },
        simulation: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    // Déclencher l'événement Pusher ou ponter vers V2 si l'injection est activée
    if (isActive) {
      try {
        // Recherche d'une session active pour cette simulation
        const activeSession = await prisma.simSession.findFirst({
          where: {
            simulationId: updatedInjection.simulationId,
            status: "ACTIVE",
          },
        });

        if (activeSession) {
          console.log(`[BRIDGE] Session active trouvée: ${activeSession.id}. Création du message...`);
          
          // Mapping du type d'injection vers le canal
          let channel = "ALERT";
          switch (updatedInjection.type) {
            case "EMAIL": channel = "EMAIL"; break;
            case "SMS": channel = "SMS"; break;
            case "CALL": channel = "CALL"; break;
            case "SOCIAL": channel = "SOCIAL_MEDIA"; break;
            case "NEWS_BROADCAST": channel = "FLASH_INFO"; break;
            case "NEWSPAPER": channel = "JOURNAL"; break;
            default: channel = "ALERT";
          }

          let recipientIds: string[] = [];
          let isGroupMessage = false;

          if (updatedInjection.targetUserId) {
            // Trouver le SimParticipant correspondant
            const participant = await prisma.simParticipant.findFirst({
              where: {
                sessionId: activeSession.id,
                userId: updatedInjection.targetUserId,
              },
            });

            if (participant) {
              recipientIds = [participant.id];
            } else {
              console.warn(`[BRIDGE] Participant non trouvé pour userId: ${updatedInjection.targetUserId}`);
              isGroupMessage = true;
            }
          } else {
            isGroupMessage = true;
          }

          await sendSimMessage({
            sessionId: activeSession.id,
            channel,
            priority: "NORMAL",
            senderName: updatedInjection.scenario?.name || "Système",
            recipientIds,
            isGroupMessage,
            subject: updatedInjection.title,
            body: updatedInjection.content || "",
          });
          
          console.log(`[BRIDGE] Message envoyé avec succès.`);
        } else {
          console.log(`[BRIDGE] Aucune session active pour la simulation ${updatedInjection.simulationId}. Fallback V1.`);
          
          // Fallback V1 : push direct
          const payload = {
            id: updatedInjection.id,
            title: updatedInjection.title,
            content: updatedInjection.content,
            type: updatedInjection.type,
            scenarioName: updatedInjection.scenario?.name || "",
            createdAt: updatedInjection.createdAt,
          };

          if (updatedInjection.targetUserId) {
            await pushToParticipant(
              updatedInjection.simulationId,
              updatedInjection.targetUserId,
              SIM_EVENTS.NEW_MESSAGE,
              payload
            );
          } else {
            await pushToSession(
              updatedInjection.simulationId,
              SIM_EVENTS.NEW_MESSAGE,
              payload
            );
          }
        }
      } catch (bridgeError) {
        console.error("Erreur lors du pontage V1->V2:", bridgeError);
      }
    }

    return NextResponse.json(updatedInjection);
  } catch (error) {
    console.error("Error updating injection status:", error);
    return NextResponse.json(
      { 
        error: "Échec de la mise à jour du statut de l'injection",
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ injectionId: string }> }
) {
  try {
    const { injectionId } = await params;
    if (!injectionId) {
      return NextResponse.json(
        { error: "Injection ID is required" },
        { status: 400 }
      );
    }

    // Vérifier que l'injection existe
    const existingInjection = await prisma.injection.findUnique({
      where: { id: injectionId }
    });

    if (!existingInjection) {
      return NextResponse.json(
        { error: "Injection not found" },
        { status: 404 }
      );
    }

    // Supprimer l'injection
    await prisma.injection.delete({
      where: { id: injectionId }
    });

    return NextResponse.json({ 
      success: true,
      message: "Injection deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting injection:", error);
    
    // Gestion des erreurs spécifiques
    if (error instanceof Error) {
      if (error.message.includes('Record to delete does not exist')) {
        return NextResponse.json(
          { error: "Injection not found" },
          { status: 404 }
        );
      }
      
      // Gestion des erreurs de contrainte de clé étrangère
      if (error.message.includes('Foreign key constraint failed')) {
        return NextResponse.json(
          { 
            error: "Cannot delete injection because it is referenced by other records",
            details: error.message
          },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: "Failed to delete injection",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
