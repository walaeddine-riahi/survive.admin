import { DocumentGenerator } from "@/components/bcm/document-generator";

export const metadata = {
  title: "Générateur BCM | S.U.R.V.I.V.E. Resilience",
  description: "Générateur de documents ISO 22301",
};

export default function BcmGeneratorPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Livrables BCM (ISO 22301)
        </h1>
        <p className="text-gray-400">
          Utilisez les données de la BIA et l'IA Azure pour générer vos documents de conformité.
        </p>
      </div>

      <DocumentGenerator />
    </div>
  );
}
