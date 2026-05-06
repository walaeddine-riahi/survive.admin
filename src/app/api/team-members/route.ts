import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/team-members
export async function GET() {
  try {
    const teamMembers = await prisma.teamMember.findMany({
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

// POST /api/team-members
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const role = data.role || "MEMBER";

    if (!data.userId || !data.teamId) {
      return NextResponse.json(
        { error: "L'utilisateur et l'équipe sont requis" },
        { status: 400 }
      );
    }

    const existingTeamMember = await prisma.teamMember.findFirst({
      where: {
        userId: data.userId,
        teamId: data.teamId,
      },
    });

    const teamMember = existingTeamMember
      ? await prisma.teamMember.update({
          where: {
            id: existingTeamMember.id,
          },
          data: {
            role,
          },
          include: {
            user: {
              include: {
                profile: true,
              },
            },
            team: true,
          },
        })
      : await prisma.teamMember.create({
          data: {
            role,
            userId: data.userId,
            teamId: data.teamId,
          },
          include: {
            user: {
              include: {
                profile: true,
              },
            },
            team: true,
          },
        });

    return NextResponse.json(teamMember);
  } catch (error) {
    console.error("Error creating team member:", error);
    return NextResponse.json(
      { error: "Failed to create team member" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Team member ID is required" },
        { status: 400 }
      );
    }

    await prisma.teamMember.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting team member:", error);
    return NextResponse.json(
      { error: "Failed to delete team member" },
      { status: 500 }
    );
  }
}
