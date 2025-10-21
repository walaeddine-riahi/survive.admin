"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Incident, IncidentForm } from "../IncidentForm";

export default function IncidentCreatePage() {
  function handleCreate(data: Incident) {
    alert("Incident créé !\n" + JSON.stringify(data, null, 2));
  }
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ajouter un incident</h1>
        <Button asChild variant="outline">
          <Link href="/incident">Retour</Link>
        </Button>
      </div>
      <div className="bg-card rounded-xl shadow p-6">
        <IncidentForm onSubmit={handleCreate} submitLabel="Créer l'incident" />
      </div>
    </div>
  );
}
