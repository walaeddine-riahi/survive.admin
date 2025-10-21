import { notFound } from "next/navigation";
import { ProcessForm } from "@/components/bia/process-form";
import { getProcessById } from "@/actions/bia/process-actions";

interface ProcessPageProps {
  params: {
    id: string;
  };
}

export default async function ProcessPage({ params }: ProcessPageProps) {
  const { id } = params;
  
  // Récupérer le processus depuis la base de données
  const result = await getProcessById(id);
  
  if (!result.success || !result.data) {
    return notFound();
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Éditer le processus</h1>
      <ProcessForm processId={id} initialData={result.data} />
    </div>
  );
}
