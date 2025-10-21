import { Button } from "@/components/ui/button";
import Link from "next/link";

const mockConformities = [
  {
    id: "1",
    title: "Audit interne",
    type: "ISO 9001",
    status: "Conforme",
    date: "2024-06-01",
    owner: "Jean Dupont",
  },
  {
    id: "2",
    title: "Contrôle sécurité",
    type: "ISO 27001",
    status: "Non conforme",
    date: "2024-05-20",
    owner: "Sophie Martin",
  },
];

export default function ConformityListPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Conformités</h1>
        <Button asChild>
          <Link href="/conformity/create">Ajouter une conformité</Link>
        </Button>
      </div>
      <div className="bg-card rounded-xl shadow p-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="py-2">Titre</th>
              <th>Type</th>
              <th>Statut</th>
              <th>Date</th>
              <th>Responsable</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {mockConformities.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="py-2 font-medium">
                  <Link
                    href={`/conformity/${c.id}`}
                    className="hover:underline"
                  >
                    {c.title}
                  </Link>
                </td>
                <td>{c.type}</td>
                <td>{c.status}</td>
                <td>{c.date}</td>
                <td>{c.owner}</td>
                <td>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/conformity/${c.id}/edit`}>Éditer</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
