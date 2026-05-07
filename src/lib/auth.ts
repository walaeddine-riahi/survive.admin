import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Profile, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { verifyMagicToken } from "@/lib/magic-token";

declare module "next-auth" {
  interface User {
    id: string;
    profile?: Profile | null;
    role?: Role;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      phone?: string | null;
      profile?: Profile | null;
      role?: Role;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    profile?: Profile | null;
    role?: Role;
    phone?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/connection",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        magicToken: { label: "Magic Token", type: "text" },
      },
      async authorize(credentials) {
        let userEmail = credentials?.email;

        if (credentials?.magicToken) {
          const verifiedEmail = verifyMagicToken(credentials.magicToken);
          if (!verifiedEmail) {
            throw new Error("Le lien magique a expiré ou est invalide");
          }
          userEmail = verifiedEmail;
        } else if (!credentials?.email || !credentials?.password) {
          throw new Error("Identifiants manquants");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: userEmail,
          },
        });

        if (!user) {
          throw new Error("Utilisateur non trouvé");
        }

        // Si ce n'est pas une connexion via lien magique, on valide le mot de passe
        if (!credentials?.magicToken) {
          if (!user?.password) {
            throw new Error("Identifiants invalides");
          }

          const isCorrectPassword = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isCorrectPassword) {
            throw new Error("Identifiants invalides");
          }
        }

        // Récupérer le numéro de téléphone depuis le profil si disponible
        const userWithProfile = await prisma.user.findUnique({
          where: { id: user.id },
          include: { profile: true },
        });

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          role: user.role,
          phone: userWithProfile?.profile?.phone || (user as any).phone || null,
        };
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.phone = token.phone || null;
      }

      return session;
    },
    async jwt({ token, user }) {
      // Si l'utilisateur vient de se connecter (première fois après credentials), on peuple le token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = (user as any).phone;
      }
      
      // On retourne le token tel quel pour les appels suivants (plus rapide, pas de DB)
      return token;
    },
  },
};
