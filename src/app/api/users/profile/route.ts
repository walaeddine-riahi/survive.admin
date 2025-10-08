import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, email, bio, phone, address, avatar } = body;

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Un utilisateur avec cet email existe déjà" },
          { status: 400 }
        );
      }
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        firstName,
        lastName,
        email,
        phone, // Mettre à jour le numéro de téléphone dans le modèle User
      },
    });

    // Mettre à jour ou créer le profil
    const updatedProfile = await prisma.profile.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        bio,
        phone,
        address,
        avatar,
      },
      create: {
        userId: session.user.id,
        bio,
        phone,
        address,
        avatar,
      },
    });

    return NextResponse.json({
      user: updatedUser,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("[PROFILE_PATCH]", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du profil" },
      { status: 500 }
    );
  }
}
