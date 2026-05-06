import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({
        simulations: [],
        processes: [],
        factories: [],
        users: [],
        teams: [],
      });
    }

    const [simulations, processes, factories, users, teams] = await Promise.all([
      // Recherche dans les simulations
      prisma.simulation.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
        select: { id: true, title: true },
      }),

      // Recherche dans les processus BIA
      prisma.process.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { department: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
        select: { id: true, name: true, department: true },
      }),

      // Recherche dans les usines
      prisma.factory.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { code: { contains: query, mode: "insensitive" } },
            { city: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
        select: { id: true, name: true, city: true },
      }),

      // Recherche dans les utilisateurs (si admin)
      session.user.role === "ADMIN"
        ? prisma.user.findMany({
            where: {
              OR: [
                { firstName: { contains: query, mode: "insensitive" } },
                { lastName: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
              ],
            },
            take: 5,
            select: { id: true, firstName: true, lastName: true, email: true },
          })
        : Promise.resolve([]),

      // Recherche dans les équipes (si admin)
      session.user.role === "ADMIN"
        ? prisma.team.findMany({
            where: {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
              ],
            },
            take: 5,
            select: { id: true, name: true },
          })
        : Promise.resolve([]),
    ]);

    return NextResponse.json({
      simulations,
      processes,
      factories,
      users,
      teams,
    });
  } catch (error) {
    console.error("[SEARCH_GET]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
