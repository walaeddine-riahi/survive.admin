import { getAllProcesses } from "@/actions/bia/process-actions";
import { ProcessesClient } from "@/components/bia/processes-client";
import { AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";

type ProcessWithFactory = {
  id: string;
  name: string;
  description: string | null;
  department: string;
  location: string;
  impact: string;
  criticality: "low" | "medium" | "high" | "critical";
  rto: number;
  mtpd: number;
  rpo: number;
  mbco: string;
  factoryId: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export default async function BIAPage() {
  // Récupérer les processus
  const result = await getAllProcesses();

  if (!result.success) {
    console.error("Error fetching processes:", result.error);
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Erreur de chargement</h2>
        <p className="text-muted-foreground">
          Erreur lors du chargement des processus: {result.error}
        </p>
      </div>
    );
  }

  // S'assurer que result.data est défini et est un tableau
  const processes = (
    Array.isArray(result.data) ? result.data : []
  ) as ProcessWithFactory[];

  // Récupérer la liste des usines
  const factories = await prisma.factory.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      code: true,
    },
    orderBy: { name: "asc" },
  });

  return <ProcessesClient initialProcesses={processes} factories={factories} />;
}
