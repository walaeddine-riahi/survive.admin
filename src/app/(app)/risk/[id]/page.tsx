import { Button } from "@/components/ui/button";
import Link from "next/link";

// Simuler la récupération d'un risque (à remplacer par un vrai fetch plus tard)
const mockRisk = {
  id: "1",
  title: "Risque incendie",
  type: "Opérationnel",
  status: "Actif",
  date: "2024-06-01",
};

export default function RiskDetailPage({ params }: { params: { id: string } }) {
  // Ici, tu utiliseras params.id pour fetch le vrai risque
  const risk = mockRisk; // À remplacer par la vraie donnée
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Détail du risque</h1>
        <Button asChild variant="outline">
          <Link href={`/risk/${risk.id}/edit`}>Éditer</Link>
        </Button>
      </div>
      <div className="bg-card rounded-xl shadow p-6 space-y-4">
        <div>
          <span className="font-semibold">Titre :</span> {risk.title}
        </div>
        <div>
          <span className="font-semibold">Type :</span> {risk.type}
        </div>
        <div>
          <span className="font-semibold">Statut :</span> {risk.status}
        </div>
        <div>
          <span className="font-semibold">Date :</span> {risk.date}
        </div>
      </div>
      <Button asChild variant="ghost">
        <Link href="/risk">Retour à la liste</Link>
      </Button>
    </div>
  );
}
