import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ simulationId: string }> }
) {
  try {
    const { simulationId } = await params;

    const [simulation, injections, communications, assignments, participantScores] = await Promise.all([
      prisma.simulation.findUnique({
        where: { id: simulationId },
        select: { title: true }
      }),
      prisma.injection.findMany({
        where: { simulationId },
        orderBy: { createdAt: "asc" },
        select: {
          id: true, title: true, type: true, acknowledged: true, createdAt: true,
          responses: {
            select: { id: true, conformityScore: true },
          },
        },
      }),
      prisma.communication.findMany({
        where: { simulationId },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          sender: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.simulationAssignment.findMany({
        where: { simulationId },
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.participantScore.findMany({
        where: { simulationId },
        select: {
          assignmentId: true, scoreGlobal: true, scoreConformity: true,
          scoreCommunication: true, scoreDecision: true, scoreTimeliness: true, level: true,
        },
      }),
    ]);

    // Compute conformity rate
    const responsesWithScore = injections.flatMap(i => i.responses).filter(r => r.conformityScore != null);
    const conformityRate = responsesWithScore.length > 0
      ? Math.round(responsesWithScore.reduce((a, r) => a + (r.conformityScore || 0), 0) / responsesWithScore.length)
      : null;

    // Team score
    const teamScore = participantScores.length > 0
      ? Math.round(participantScores.reduce((a, s) => a + s.scoreGlobal, 0) / participantScores.length)
      : null;

    // Active inject: last non-acknowledged
    const activeInject = injections.filter(i => !i.acknowledged).slice(-1)[0];

    // Check who reacted to last inject
    const lastInject = injections[injections.length - 1];
    const lastInjectComms = lastInject
      ? communications.filter(c =>
          new Date(c.createdAt) >= new Date(lastInject.createdAt)
        )
      : [];
    const reactedUserIds = new Set(lastInjectComms.map(c => c.sender.id));

    const liveData = {
      simulationTitle: simulation?.title || "Simulation",
      injections: injections.map(i => ({
        id: i.id,
        title: i.title,
        type: i.type,
        acknowledged: i.acknowledged,
        sentAt: i.createdAt.toISOString(),
        responseCount: i.responses.length,
        conformityScore: i.responses.length > 0
          ? Math.round(i.responses.reduce((a, r) => a + (r.conformityScore || 0), 0) / i.responses.length)
          : null,
      })),
      communications: communications.map(c => ({
        id: c.id,
        content: c.content,
        type: c.type,
        createdAt: c.createdAt.toISOString(),
        sender: { firstName: c.sender.firstName, lastName: c.sender.lastName },
      })),
      assignments: assignments.map(a => ({
        id: a.id,
        role: a.role,
        user: { firstName: a.user.firstName, lastName: a.user.lastName },
        score: participantScores.find(s => s.assignmentId === a.id)?.scoreGlobal,
        reactedToLastInject: reactedUserIds.has(a.userId),
      })),
      participantScores,
      teamScore,
      conformityRate,
      avgReactionDelay: null,
      activeInjectId: activeInject?.id,
    };

    return NextResponse.json({ success: true, data: liveData });
  } catch (error) {
    console.error("Live data error:", error);
    return NextResponse.json({ success: false, error: "Erreur données live" }, { status: 500 });
  }
}
