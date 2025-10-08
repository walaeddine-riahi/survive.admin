import { Button } from "@/components/ui/button";

export default function TrainingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestion des formations</h1>
        <Button>Ajouter une formation</Button>
      </div>
      <div className="bg-card rounded-xl shadow p-6">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="py-2 px-4">Intitulé</th>
              <th className="py-2 px-4">Type</th>
              <th className="py-2 px-4">Statut</th>
              <th className="py-2 px-4">Date</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Les lignes de formations seront ici */}
          </tbody>
        </table>
      </div>
    </div>
  );
} 