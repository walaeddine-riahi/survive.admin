import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CyberLabClient from "@/components/cyberlab/CyberLabClient";

export default async function CyberLabPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ scenario?: string; participantId?: string }>;
}) {
  const [{ sessionId }, sp] = await Promise.all([params, searchParams]);
  const scenarioId = sp.scenario || "ransomware_soc";
  const participantId = sp.participantId || "anonymous";

  // Try to get participant name from SimParticipant
  let participantName = "Analyste";
  if (participantId !== "anonymous") {
    try {
      const p = await prisma.simParticipant.findUnique({
        where: { id: participantId },
        select: { displayName: true, role: true },
      });
      if (p) participantName = `${p.displayName} — ${p.role}`;
    } catch {}
  }

  return (
    <CyberLabClient
      scenarioId={scenarioId}
      participantId={participantId}
      participantName={participantName}
      sessionId={sessionId}
    />
  );
}
