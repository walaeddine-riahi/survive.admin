import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import * as z from "zod";

const createUserSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Veuillez entrer une adresse email valide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
  phone: z.string().optional(),
  avatar: z.string().url("L'URL de l'avatar n'est pas valide").optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        profile: {
          select: {
            avatar: true,
            phone: true,
          },
        },
      },
      orderBy: {
        firstName: "asc",
      },
    });

    // Fusionner le numéro de téléphone du profil avec l'utilisateur
    const usersWithMergedPhone = users.map(user => ({
      ...user,
      phone: user.phone || user.profile?.phone || null,
    }));

    return NextResponse.json(usersWithMergedPhone);
  } catch (error) {
    console.error("[USERS_GET]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}

// Schéma pour la suppression multiple
const deleteUsersSchema = z.object({
  userIds: z.array(z.string().min(1, "ID utilisateur invalide")).min(1, "Aucun utilisateur sélectionné"),
});

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return new NextResponse("Action non autorisée", { status: 403 });
    }

    const data = await request.json();
    const { userIds } = deleteUsersSchema.parse(data);

    // Vérifier que l'utilisateur ne se supprime pas lui-même
    if (userIds.includes(session.user.id)) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas supprimer votre propre compte" },
        { status: 400 }
      );
    }

    // Supprimer les utilisateurs en une seule requête
    const deleteResult = await prisma.user.deleteMany({
      where: {
        id: {
          in: userIds,
        },
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: deleteResult.count,
    });
  } catch (error) {
    console.error("[USERS_DELETE_MANY]", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }
    
    return new NextResponse("Erreur lors de la suppression des utilisateurs", { 
      status: 500 
    });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Valider les données d'entrée
    const validatedData = createUserSchema.parse(data);

    // Vérifier si l'utilisateur existe déjà (case-insensitive)
    const existingUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: validatedData.email,
          mode: 'insensitive', // Case-insensitive search
        },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { 
          error: "Un utilisateur avec cet email existe déjà",
          code: 'EMAIL_EXISTS',
          existingEmail: existingUser.email // Return the existing email to show the exact case
        },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Créer l'utilisateur avec son profil
    const user = await prisma.user.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        role: validatedData.role,
        phone: validatedData.phone || null, // Set phone at user level
        password: await bcrypt.hash(validatedData.password, 10),
        profile: {
          create: {
            bio: "",
            phone: validatedData.phone || "", // Also store in profile for backward compatibility
            address: "",
            avatar: validatedData.avatar || "",
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // Ne pas renvoyer le mot de passe dans la réponse
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error: unknown) {
    console.error("Error creating user:", error);

    if (error instanceof z.ZodError) {
      console.error("Zod validation error details:", error.errors);
      return NextResponse.json(
        { 
          error: "Données invalides", 
          details: error.errors,
          message: error.message
        },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Log the full error object for other errors
    console.error("Full error object:", JSON.stringify(error, null, 2));

    // Type guard to check if error is a Prisma error
    const isPrismaError = (e: unknown): e is { code: string; meta?: { target?: string[] } } => {
      return typeof e === 'object' && e !== null && 'code' in e;
    };

    // Check for duplicate email error
    if (isPrismaError(error) && error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return NextResponse.json(
        { error: "Un utilisateur avec cet email existe déjà" },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
