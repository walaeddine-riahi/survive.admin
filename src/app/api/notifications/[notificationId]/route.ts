import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { notificationId: string } }
) {
  try {
    console.log(`[NOTIFICATION_PATCH] Début de la mise à jour de la notification ${params.notificationId}`);
    
    const session = await getServerSession(authOptions);
    console.log('[NOTIFICATION_PATCH] Session:', session);

    if (!session?.user?.id) {
      console.error('[NOTIFICATION_PATCH] Non autorisé: aucune session utilisateur');
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log(`[NOTIFICATION_PATCH] Tentative de mise à jour de la notification pour l'utilisateur ${session.user.id}`);
    
    const notification = await prisma.notification.update({
      where: {
        id: params.notificationId,
        userId: session.user.id,
      },
      data: {
        isRead: true,
      },
    });

    console.log('[NOTIFICATION_PATCH] Notification mise à jour avec succès:', notification);
    return NextResponse.json(notification);
  } catch (error) {
    console.error("[NOTIFICATION_PATCH] Erreur lors de la mise à jour de la notification:", error);
    return new NextResponse(JSON.stringify({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { notificationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.notification.delete({
      where: {
        id: params.notificationId,
        userId: session.user.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[NOTIFICATION_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
