import { redirect, notFound } from "next/navigation";
import { getSimSession } from "@/actions/simulation/sim-session-actions";
import ParticipantMobileView from "@/components/simulation/v2/participant-mobile-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MobileLiveSimPage({
  params,
  searchParams,
}: {
  params: Promise<{ simulationId: string }>;
  searchParams: Promise<{
    sessionId?: string;
    participantId?: string;
  }>;
}) {
  const [{ simulationId }, sp] = await Promise.all([params, searchParams]);
  const { sessionId, participantId } = sp;

  if (!sessionId) {
    redirect(`/simulation/${simulationId}`);
  }

  const sessionResult = await getSimSession(sessionId);
  if (!sessionResult.success || !sessionResult.data) notFound();

  const session = sessionResult.data;

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

  // Get messages for this participant (received or sent by them)
  const messages = session.messages.filter(
    (m: { recipientIds: string[]; isGroupMessage: boolean; fromParticipantId?: string | null }) =>
      m.recipientIds.includes(participant.id) || m.isGroupMessage || m.fromParticipantId === participant.id,
  );

  return (
    <ParticipantMobileView
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      session={session as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      participant={participant as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      participants={(session.participants ?? []) as any[]}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialMessages={messages as any[]}
    />
  );
}
