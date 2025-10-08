import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Conformity, ConformityForm } from "../../ConformityForm";

const mockConformity: Conformity = {
  id: "1",
  title: "Audit interne",
  type: "ISO 9001",
  status: "Conforme",
  date: "2024-06-01",
  owner: "Jean Dupont",
};

export default function ConformityEditPage() {
  const conformity = mockConformity;
  function handleEdit(data: Conformity) {
    alert("Conformité modifiée !\n" + JSON.stringify(data, null, 2));
  }
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Éditer la conformité</h1>
        <Button asChild variant="outline">
          <Link href={`/conformity/${conformity.id}`}>Retour</Link>
        </Button>
      </div>
      <div className="bg-card rounded-xl shadow p-6">
        <ConformityForm
          initialData={conformity}
          onSubmit={handleEdit}
          submitLabel="Enregistrer les modifications"
        />
      </div>
    </div>
  );
}
