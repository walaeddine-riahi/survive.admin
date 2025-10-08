"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Simulation, SimulationForm } from "../SimulationForm"; // Import SimulationForm

export default function SimulationCreatePage() {
  function handleCreate(data: Simulation) {
    // Logique pour créer la simulation (appel API, etc.)
    alert("Simulation créée !\n" + JSON.stringify(data, null, 2));
    // Rediriger vers la liste ou la page de détail après création
    // router.push('/simulation');
  }

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b">
        <h1 className="text-2xl font-bold">Créer une simulation</h1>
        <Button asChild variant="outline">
          <Link href="/simulation">Retour</Link>
        </Button>
      </div>
      <Card className="p-6">
        <SimulationForm
          onSubmit={handleCreate}
          submitLabel="Créer la simulation"
        />
      </Card>
    </div>
  );
}
