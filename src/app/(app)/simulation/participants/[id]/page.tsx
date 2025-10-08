"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Participant } from "../ParticipantForm"; // Importer le type Participant

// Liste mockée de participants
const mockParticipants: Participant[] = [
  {
    id: "part-1",
    name: "Alice Smith",
    role: "Cyber Analyst",
  },
  {
    id: "part-2",
    name: "Bob Johnson",
    role: "Network Engineer",
  },
  {
    id: "part-3",
    name: "Charlie Brown",
    role: "Incident Manager",
  },
];

export default function ParticipantDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Simuler le fetching du participant par son ID
  const participant = mockParticipants.find((part) => part.id === params.id);

  if (!participant) {
    return (
      <div className="text-center text-red-500 p-6">Participant non trouvé</div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b">
        <h1 className="text-2xl font-bold">
          Détail du participant: {participant.name}
        </h1>
        <Button asChild variant="outline">
          <Link href={`/simulation/participants/${participant.id}/edit`}>
            Éditer
          </Link>
        </Button>
      </div>
      <Card className="p-6 space-y-4">
        <div>
          <span className="font-semibold">ID :</span> {participant.id}
        </div>
        <div>
          <span className="font-semibold">Nom :</span> {participant.name}
        </div>
        <div>
          <span className="font-semibold">Rôle :</span> {participant.role}
        </div>
        {/* Ajouter d'autres détails ici */}
      </Card>
      <Button asChild variant="ghost">
        <Link href="/simulation/participants">Retour à la liste</Link>
      </Button>
    </div>
  );
}
