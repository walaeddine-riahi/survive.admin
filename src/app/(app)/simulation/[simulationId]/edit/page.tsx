"use client";

import {
  SimulationForm,
  SimulationFormValues,
} from "@/components/simulation-form-new";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Simulation {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  status: "planned" | "ongoing" | "completed" | "cancelled";
  // Add assignments here if they are part of the initial data for the form
  assignments?: { userId: string; role: string; status: string }[];
}

export default function EditSimulationPage() {
  const params = useParams();
  const router = useRouter();
  const { simulationId } = params as { simulationId: string };
  const [loading, setLoading] = useState(true);
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!simulationId) return;

    const fetchSimulation = async () => {
      try {
        const response = await fetch(`/api/simulations/${simulationId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch simulation");
        }
        const data: Simulation = await response.json();
        setSimulation(data);
      } catch (error) {
        console.error("Error fetching simulation:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données de la simulation.",
          variant: "destructive",
        });
        setSimulation(null); // Ensure simulation is null on error
      } finally {
        setLoading(false);
      }
    };

    fetchSimulation();
  }, [simulationId, toast]);

  const handleUpdate = async (data: SimulationFormValues) => {
    if (!simulationId) return;

    try {
      const response = await fetch(`/api/simulations/${simulationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update simulation");
      }

      toast({
        title: "Simulation modifiée",
        description: "La simulation a été modifiée avec succès.",
      });
      router.push("/simulation"); // Redirect back to the simulations list
    } catch (error) {
      console.error("Error updating simulation:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la modification de la simulation.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-6">Chargement de la simulation...</div>;
  }

  if (!simulation) {
    return <div className="p-6">Simulation introuvable.</div>;
  }

  return (
    <div className="flex-1 pl-0 pr-4 py-4 bg-background">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" asChild>
          <Link href="/simulation">
            <ChevronLeft className="mr-2 h-4 w-4" /> Retour aux simulations
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Modifier la simulation</h1>
        <div className="w-4"></div> {/* Spacer to balance the layout */}
      </div>
      <SimulationForm
        open={true} // The form is always open on this page
        onOpenChange={() => {}} // No external open/close needed
        onSubmit={handleUpdate}
        initialData={{
          title: simulation.title,
          description: simulation.description || "",
          startDate: new Date(simulation.startDate),
          endDate: new Date(simulation.endDate),
          status: simulation.status,
          // Ensure assignments are passed if your form handles them
          assignments: simulation.assignments || [],
        }}
      />
    </div>
  );
}
