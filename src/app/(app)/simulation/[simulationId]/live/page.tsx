import { redirect, notFound } from "next/navigation";
import { getSimSession } from "@/actions/simulation/sim-session-actions";
import ParticipantView from "@/components/simulation/v2/participant-view";
import InstructorView from "@/components/simulation/v2/instructor-view";

export default async function LiveSimPage({
  params,
  searchParams,
}: {
  params: Promise<{ simulationId: string }>;
  searchParams: Promise<{
    sessionId?: string;
    participantId?: string;
    instructor?: string;
  }>;
}) {
  const [{ simulationId }, sp] = await Promise.all([params, searchParams]);
  const { sessionId, participantId, instructor } = sp;

  if (!sessionId) {
    // Show session list / create session
    redirect(`/simulation/${simulationId}`);
  }

  const sessionResult = await getSimSession(sessionId);
  if (!sessionResult.success || !sessionResult.data) notFound();

  const session = sessionResult.data;

  // Determine view mode
  const isInstructor = instructor === "1";

  if (isInstructor) {
    return (
      <InstructorView
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        session={session as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        participants={(session.participants ?? []) as any[]}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialMessages={(session.messages ?? []) as any[]}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialCalls={(session.calls ?? []) as any[]}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialEvents={(session.events ?? []) as any[]}
      />
    );
  }

  // Participant view — find participant record
  const participant = participantId
    ? session.participants.find((p: { id: string }) => p.id === participantId)
    : null;

  if (!participant) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl font-bold mb-2">Participant introuvable</p>
          <p className="text-gray-400 text-sm">
            Vérifiez votre lien d&apos;accès
          </p>
        </div>
      </div>
    );
  }

  // Get messages for this participant
  const messages = session.messages.filter(
    (m: { recipientIds: string[]; isGroupMessage: boolean }) =>
      m.recipientIds.includes(participant.id) || m.isGroupMessage,
  );

  return (
    <ParticipantView
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      session={session as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      participant={participant as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialMessages={messages as any[]}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialCalls={(session.calls ?? []) as any[]}
    />
  );
}
