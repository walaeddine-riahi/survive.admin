/**
 * Page de Gestion des Usines (Factories)
 *
 * Cette page permet de :
 * - Lister toutes les usines
 * - Créer une nouvelle usine
 * - Voir les détails d'une usine
 * - Accéder à l'analyse consolidée d'une usine
 *
 * Route : /bia/factories
 */

import { Factory } from "@prisma/client";
import { Metadata } from "next";
import { FactoriesClient } from "@/components/bia/factories-client-example";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Gestion des Usines - BIA",
  description: "Gérer les usines et leurs processus critiques",
};

/**
 * Type Factory enrichi avec les statistiques
 */
interface FactoryWithStats extends Factory {
  _count: {
    processes: number;
    biaReports: number;
  };
  manager?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
}

/**
 * Récupère toutes les usines avec leurs statistiques
 */
async function getFactories(): Promise<FactoryWithStats[]> {
  const factories = await prisma.factory.findMany({
    include: {
      _count: {
        select: {
          processes: true,
          biaReports: true,
        },
      },
      manager: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: [
      { isActive: "desc" }, // Actives en premier
      { name: "asc" }, // Puis par ordre alphabétique
    ],
  });

  return factories;
}

/**
 * Page Server Component
 */
export default async function FactoriesPage() {
  // Vérifier l'authentification
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Récupérer les usines
  const factories = await getFactories();

  // Statistiques globales
  const stats = {
    total: factories.length,
    active: factories.filter((f) => f.isActive).length,
    inactive: factories.filter((f) => !f.isActive).length,
    totalProcesses: factories.reduce((sum, f) => sum + f._count.processes, 0),
    totalReports: factories.reduce((sum, f) => sum + f._count.biaReports, 0),
  };

  return (
    <div className="container mx-auto p-6">
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Gestion des Usines</h1>
        <p className="text-muted-foreground">
          Gérer les usines et visualiser leurs processus critiques
        </p>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="p-4 bg-primary/10 rounded-lg">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Usines Total</div>
        </div>
        <div className="p-4 bg-green-500/10 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {stats.active}
          </div>
          <div className="text-sm text-muted-foreground">Actives</div>
        </div>
        <div className="p-4 bg-gray-500/10 rounded-lg">
          <div className="text-2xl font-bold text-gray-600">
            {stats.inactive}
          </div>
          <div className="text-sm text-muted-foreground">Inactives</div>
        </div>
        <div className="p-4 bg-blue-500/10 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {stats.totalProcesses}
          </div>
          <div className="text-sm text-muted-foreground">Processus</div>
        </div>
        <div className="p-4 bg-purple-500/10 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {stats.totalReports}
          </div>
          <div className="text-sm text-muted-foreground">Rapports</div>
        </div>
      </div>

      {/* Client Component pour l'interactivité */}
      <FactoriesClient factories={factories} />
    </div>
  );
}
