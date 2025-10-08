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

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { simulationId } = await Promise.resolve(params);

    const communications = await prisma.communication.findMany({
      where: {
        simulationId: simulationId,
        OR: [
          // L'utilisateur est le destinataire
          { recipientId: session.user.id },
          // L'utilisateur est l'expéditeur
          { senderId: session.user.id },
          // La communication est une alerte sans destinataire (broadcast)
          {
            type: "alert",
            recipientId: null,
          },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(communications);
  } catch (error) {
    console.error("[COMMUNICATIONS_GET] Error:", error);
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

    const { simulationId } = await Promise.resolve(params);
    const requestBody = await req.json();
    console.log("[COMMUNICATIONS_POST] Received request body:", requestBody);
    const { type, content, recipientId, payload, subject } = requestBody;

    if (!type || !content) {
      return new NextResponse("Missing required fields: type or content", {
        status: 400,
      });
    }

    // Find the sender's simulation assignment to get their teamId
    const senderAssignment = await prisma.simulationAssignment.findFirst({
      where: {
        userId: session.user.id,
        simulationId: simulationId,
      },
      select: {
        teamId: true,
      },
    });

    const senderTeamId = senderAssignment?.teamId || null;

    let actualRecipientId: string | undefined = undefined;

    // If recipientId is provided from the client and it's not empty
    if (recipientId && recipientId !== "") {
      // Vérifier d'abord si c'est un ID valide
      try {
        // Vérifier si l'utilisateur existe avec cet ID
        const foundRecipient = await prisma.user.findUnique({
          where: { id: recipientId },
          select: { id: true },
        });
        
        if (foundRecipient) {
          actualRecipientId = foundRecipient.id;
        } else {
          console.warn(
            `[COMMUNICATIONS_POST] Recipient with ID not found: ${recipientId}`
          );
        }
      } catch (error) {
        console.error("[COMMUNICATIONS_POST] Error looking up recipient by ID:", error);
        // Si ce n'est pas un ID valide, essayer avec l'email (pour la rétrocompatibilité)
        const foundRecipient = await prisma.user.findFirst({
          where: { 
            OR: [
              { id: recipientId },
              { email: recipientId }
            ]
          },
          select: { id: true },
        });
        
        if (foundRecipient) {
          actualRecipientId = foundRecipient.id;
        } else {
          console.warn(
            `[COMMUNICATIONS_POST] Recipient not found by ID or email: ${recipientId}`
          );
          return new NextResponse(
            "Recipient user not found with provided ID or email.",
            { status: 404 }
          );
        }
      }
    }

    // Construction dynamique de l'objet data pour éviter payload: null et teamId
    const data: any = {
      type: type.toLowerCase(),
      content,
      subject: subject || null,
      simulation: {
        connect: { id: simulationId },
      },
      sender: {
        connect: { id: session.user.id },
      },
    };
    if (actualRecipientId) {
      data.recipient = { connect: { id: actualRecipientId } };
    }
    if (payload !== undefined && payload !== null) {
      data.payload = payload;
    }
    // Ne pas inclure teamId, sauf si vous souhaitez gérer la relation team
    // Si besoin d'associer à une team, décommentez et adaptez :
    // if (senderTeamId) {
    //   data.team = { connect: { id: senderTeamId } };
    // }

    const newCommunication = await prisma.communication.create({
      data,
    });

    return NextResponse.json(newCommunication, { status: 201 });
  } catch (error) {
    console.error("[COMMUNICATIONS_POST] Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
