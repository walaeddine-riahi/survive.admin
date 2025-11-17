import { ProcessFormSpreadsheet } from "@/components/bia/process-form-spreadsheet";
import { prisma } from "@/lib/prisma";

export default async function NewProcessPage() {
  // Récupérer la liste des usines pour le sélecteur
  const factories = await prisma.factory.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      code: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <ProcessFormSpreadsheet factories={factories} />
    </div>
  );
}
