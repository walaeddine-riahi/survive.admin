import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Conformity, ConformityForm } from "../ConformityForm";

// Force dynamic rendering to avoid prerender issues
export const dynamic = "force-dynamic";

export default function ConformityCreatePage() {
  function handleCreate(data: Conformity) {
    alert("Conformité créée !\n" + JSON.stringify(data, null, 2));
  }
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ajouter une conformité</h1>
        <Button asChild variant="outline">
          <Link href="/conformity">Retour</Link>
        </Button>
      </div>
      <div className="bg-card rounded-xl shadow p-6">
        <ConformityForm
          onSubmit={handleCreate}
          submitLabel="Créer la conformité"
        />
      </div>
    </div>
  );
}
