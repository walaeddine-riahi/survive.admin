import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Risk, RiskForm } from "../RiskForm";

export default function RiskCreatePage() {
  function handleCreate(data: Risk) {
    // Ici, tu ajouteras la logique d'enregistrement (API ou local)
    alert("Risque créé !\n" + JSON.stringify(data, null, 2));
  }
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ajouter un risque</h1>
        <Button asChild variant="outline">
          <Link href="/risk">Retour</Link>
        </Button>
      </div>
      <div className="bg-card rounded-xl shadow p-6">
        <RiskForm onSubmit={handleCreate} submitLabel="Créer le risque" />
      </div>
    </div>
  );
}
