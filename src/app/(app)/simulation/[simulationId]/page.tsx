"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Simulation } from "../SimulationForm"; // Importer le type Simulation

// Liste mockée de simulations
const mockSimulations: Simulation[] = [
  {
    id: "sim-1",
    title: "Simulation d'incendie",
    status: "Planifié",
    date: "2024-07-15",
  },
  {
    id: "sim-2",
    title: "Cyberattaque simulée",
    status: "Terminé",
    date: "2024-06-20",
  },
  {
    id: "sim-3",
    title: "Exercice d'évacuation",
    status: "En cours",
    date: "2024-07-01",
  },
];

export default function SimulationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Simuler le fetching de la simulation par son ID
  const simulation = mockSimulations.find((sim) => sim.id === params.id);

  if (!simulation) {
    return (
      <div className="text-center text-red-500 p-6">Simulation non trouvée</div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b">
        <h1 className="text-2xl font-bold">
          Détail de la simulation: {simulation.title}
        </h1>
        <div className="flex items-center space-x-2">
          <Button asChild variant="outline">
            <Link href={`/simulation/${simulation.id}/edit`}>Éditer</Link>
          </Button>
          <Button asChild>
            <Link href={`/simulation/${simulation.id}/participant-view`}>
              Vue Participant
            </Link>
          </Button>
        </div>
      </div>
      <Card className="p-6 space-y-4">
        <div>
          <span className="font-semibold">ID :</span> {simulation.id}
        </div>
        <div>
          <span className="font-semibold">Statut :</span> {simulation.status}
        </div>
        <div>
          <span className="font-semibold">Date :</span> {simulation.date}
        </div>
        {/* Ajouter d'autres détails de simulation ici */}
      </Card>
      <Button asChild variant="ghost">
        <Link href="/simulation">Retour à la liste</Link>
      </Button>
    </div>
  );
}
