"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Participant, ParticipantForm } from "../../ParticipantForm"; // Import ParticipantForm

// Liste mockée de participants (utiliser la même que sur la page de détail)
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

export default function ParticipantEditPage({
  params,
}: {
  params: { id: string };
}) {
  // Simuler le fetching du participant par son ID
  const participant = mockParticipants.find((part) => part.id === params.id);

  function handleEdit(data: Participant) {
    // Logique pour sauvegarder les modifications
    alert("Participant modifié !\n" + JSON.stringify(data, null, 2));
    // Rediriger vers la page de détail après l'édition
    // router.push(`/simulation/participants/${participant.id}`);
  }

  if (!participant) {
    return (
      <div className="text-center text-red-500 p-6">Participant non trouvé</div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b">
        <h1 className="text-2xl font-bold">
          Éditer le participant: {participant.name}
        </h1>
        <Button asChild variant="outline">
          <Link href={`/simulation/participants/${participant.id}`}>
            Retour
          </Link>
        </Button>
      </div>
      <Card className="p-6">
        <ParticipantForm
          initialData={participant} // Passer les données du participant trouvé
          onSubmit={handleEdit}
          submitLabel="Enregistrer les modifications"
        />
      </Card>
    </div>
  );
}
