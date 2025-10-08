import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Profile, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

declare module "next-auth" {
  interface User {
    profile?: Profile | null;
    role?: Role;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      phone?: string | null;
      profile?: Profile | null;
      role?: Role;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
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
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user?.password) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        // Récupérer le numéro de téléphone depuis le profil si disponible
        const userWithProfile = await prisma.user.findUnique({
          where: { id: user.id },
          include: { profile: true }
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
      const dbUser = await prisma.user.findFirst({
        where: {
          email: token.email,
        },
        include: {
          profile: true,
        },
      });

      if (!dbUser) {
        if (user) {
          token.id = user?.id;
        }
        return token;
      }

      // Utiliser le numéro de téléphone du profil s'il existe, sinon utiliser le champ phone de l'utilisateur
      const userPhone = dbUser.profile?.phone || (dbUser as any).phone || null;
      
      return {
        id: dbUser.id,
        name: `${dbUser.firstName || ""} ${dbUser.lastName || ""}`.trim(),
        email: dbUser.email,
        role: dbUser.role,
        phone: userPhone,
        profile: dbUser.profile,
      };
    },
  },
};
