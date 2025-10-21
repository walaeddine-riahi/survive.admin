import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Risk, RiskForm } from "../../RiskForm";

// Simuler la récupération d'un risque (à remplacer par un vrai fetch plus tard)
const mockRisk: Risk = {
  id: "1",
  title: "Risque incendie",
  type: "Opérationnel",
  status: "Actif",
  date: "2024-06-01",
};

export default function RiskEditPage({ params }: { params: { id: string } }) {
  // Ici, tu utiliseras params.id pour fetch le vrai risque
  const risk = mockRisk; // À remplacer par la vraie donnée
  function handleEdit(data: Risk) {
    // Ici, tu ajouteras la logique de mise à jour (API ou local)
    alert("Risque modifié !\n" + JSON.stringify(data, null, 2));
  }
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Éditer le risque</h1>
        <Button asChild variant="outline">
          <Link href={`/risk/${risk.id}`}>Retour</Link>
        </Button>
      </div>
      <div className="bg-card rounded-xl shadow p-6">
        <RiskForm initialData={risk} onSubmit={handleEdit} submitLabel="Enregistrer les modifications" />
      </div>
    </div>
  );
} 