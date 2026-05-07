import { prisma } from "@/lib/prisma";
import SimulationDashboard from "@/components/simulation/simulation-dashboard";

export default async function SimulationDashboardPage({
  params,
}: {
  params: Promise<{ simulationId: string }>;
}) {
  const { simulationId } = await params;

  const [simulation, injections, communications, assignments, participantScores] = await Promise.all([
    prisma.simulation.findUnique({
      where: { id: simulationId },
      select: { title: true }
    }),
    prisma.injection.findMany({
      where: { simulationId },
      orderBy: { createdAt: "asc" },
      select: { id: true, title: true, type: true, acknowledged: true, createdAt: true },
    }),
    prisma.communication.findMany({
      where: { simulationId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { sender: { select: { id: true, firstName: true, lastName: true } } },
    }),
    prisma.simulationAssignment.findMany({
      where: { simulationId },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    }),
    prisma.participantScore.findMany({
      where: { simulationId },
      select: {
        assignmentId: true, scoreGlobal: true, scoreConformity: true,
        scoreCommunication: true, scoreDecision: true, scoreTimeliness: true, level: true,
      },
    }),
  ]);

  const teamScore = participantScores.length > 0
    ? Math.round(participantScores.reduce((a, s) => a + s.scoreGlobal, 0) / participantScores.length)
    : undefined;

  const activeInject = injections.filter(i => !i.acknowledged).slice(-1)[0];

  const initialData = {
    simulationTitle: simulation?.title || "Simulation",
    injections: injections.map(i => ({
      id: i.id, title: i.title, type: i.type,
      acknowledged: i.acknowledged, sentAt: i.createdAt.toISOString(),
      responseCount: 0, conformityScore: undefined,
    })),
    communications: communications.map(c => ({
      id: c.id, content: c.content, type: c.type,
      createdAt: c.createdAt.toISOString(),
      sender: { firstName: c.sender.firstName, lastName: c.sender.lastName },
    })),
    assignments: assignments.map(a => ({
      id: a.id, role: a.role,
      user: { firstName: a.user.firstName, lastName: a.user.lastName },
      reactedToLastInject: false,
    })),
    participantScores,
    teamScore,
    conformityRate: undefined,
    avgReactionDelay: undefined,
    activeInjectId: activeInject?.id,
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Dashboard temps réel</h1>
        <p className="text-sm text-muted-foreground">Suivi de l'évolution de la gestion par rapport aux injects — vue configurable</p>
      </div>
      <SimulationDashboard simulationId={simulationId} initialData={initialData} />
    </div>
  );
}
