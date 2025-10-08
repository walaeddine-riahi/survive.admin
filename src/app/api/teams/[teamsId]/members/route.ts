import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/teams/[id]/members
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const teamMembers = await prisma.teamMember.findMany({
      where: {
        teamId: params.id,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        team: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(teamMembers);
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}
