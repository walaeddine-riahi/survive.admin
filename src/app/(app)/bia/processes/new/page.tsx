import { ProcessForm } from "@/components/bia/process-form";

export default function NewProcessPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Nouveau processus BIA</h1>
      <ProcessForm />
    </div>
  );
}
