"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Participant, ParticipantForm } from "../ParticipantForm"; // Import ParticipantForm

export default function ParticipantCreatePage() {
  function handleCreate(data: Participant) {
    // Logique pour créer le participant (appel API, etc.)
    alert("Participant créé !\n" + JSON.stringify(data, null, 2));
    // Rediriger vers la liste ou la page de détail après création
    // router.push('/simulation/participants');
  }

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b">
        <h1 className="text-2xl font-bold">Créer un participant</h1>
        <Button asChild variant="outline">
          <Link href="/simulation/participants">Retour</Link>
        </Button>
      </div>
      <Card className="p-6">
        <ParticipantForm
          onSubmit={handleCreate}
          submitLabel="Créer le participant"
        />
      </Card>
    </div>
  );
}
