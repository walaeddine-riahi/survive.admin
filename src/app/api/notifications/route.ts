import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("[NOTIFICATIONS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    console.log('[NOTIFICATIONS_POST] Début de la création de notification');
    const session = await getServerSession(authOptions);
    console.log('[NOTIFICATIONS_POST] Session:', session);

    if (!session) {
      console.error('[NOTIFICATIONS_POST] Non autorisé: aucune session');
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    console.log('[NOTIFICATIONS_POST] Données reçues:', body);
    
    const { title, message, type, userIds } = body;

    if (!title || !message || !type || !userIds || !Array.isArray(userIds)) {
      const error = {
        error: "Missing required fields",
        received: { title: !!title, message: !!message, type: !!type, userIds: Array.isArray(userIds) ? userIds.length : 'not an array' }
      };
      console.error('[NOTIFICATIONS_POST] Champs manquants:', error);
      return new NextResponse(JSON.stringify(error), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`[NOTIFICATIONS_POST] Création de notifications pour ${userIds.length} utilisateurs`);
    
    // Créer une notification pour chaque utilisateur
    const notifications = await Promise.all(
      userIds.map(async (userId) => {
        console.log(`[NOTIFICATIONS_POST] Création de notification pour l'utilisateur ${userId}`);
        try {
          const notification = await prisma.notification.create({
            data: {
              title,
              message,
              type,
              userId,
              isRead: false,
            },
          });
          console.log(`[NOTIFICATIONS_POST] Notification créée:`, notification.id);
          return notification;
        } catch (error) {
          console.error(`[NOTIFICATIONS_POST] Erreur lors de la création pour l'utilisateur ${userId}:`, error);
          throw error;
        }
      })
    );

    console.log(`[NOTIFICATIONS_POST] ${notifications.length} notifications créées avec succès`);
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("[NOTIFICATIONS_POST] Erreur lors de la création des notifications:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Internal server error",
        details: error instanceof Error ? error.message : 'Unknown error'
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
