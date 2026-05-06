import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

/**
 * Vérifie que l'utilisateur est authentifié
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401, session: null };
  }
  return { error: null, status: 200, session };
}

/**
 * Vérifie que l'utilisateur est ADMIN
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401, session: null };
  }
  if (session.user.role !== "ADMIN") {
    return { error: "Forbidden - Admin access required", status: 403, session };
  }
  return { error: null, status: 200, session };
}

/**
 * Retourne une réponse d'erreur NextResponse
 */
export function errorResponse(message: string, status: number) {
  return new NextResponse(JSON.stringify({ error: message }), { status });
}
