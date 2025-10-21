import { Button } from "@/components/ui/button";

export default function CompliancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestion de la conformité</h1>
        <Button>Ajouter une conformité</Button>
      </div>
      <div className="bg-card rounded-xl shadow p-6">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="py-2 px-4">Réglementation</th>
              <th className="py-2 px-4">Statut</th>
              <th className="py-2 px-4">Responsable</th>
              <th className="py-2 px-4">Date</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Les lignes de conformité seront ici */}
          </tbody>
        </table>
      </div>
    </div>
  );
} 