import { Button } from "@/components/ui/button";
import Link from "next/link";

const mockConformity = {
  id: "1",
  title: "Audit interne",
  type: "ISO 9001",
  status: "Conforme",
  date: "2024-06-01",
  owner: "Jean Dupont",
};

export default function ConformityDetailPage() {
  const conformity = mockConformity;
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Détail de la conformité</h1>
        <Button asChild variant="outline">
          <Link href={`/conformity/${conformity.id}/edit`}>Éditer</Link>
        </Button>
      </div>
      <div className="bg-card rounded-xl shadow p-6 space-y-4">
        <div>
          <span className="font-semibold">Titre :</span> {conformity.title}
        </div>
        <div>
          <span className="font-semibold">Type :</span> {conformity.type}
        </div>
        <div>
          <span className="font-semibold">Statut :</span> {conformity.status}
        </div>
        <div>
          <span className="font-semibold">Date :</span> {conformity.date}
        </div>
        <div>
          <span className="font-semibold">Responsable :</span>{" "}
          {conformity.owner}
        </div>
      </div>
      <Button asChild variant="ghost">
        <Link href="/conformity">Retour à la liste</Link>
      </Button>
    </div>
  );
}
