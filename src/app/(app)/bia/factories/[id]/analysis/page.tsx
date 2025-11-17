/**
 * Page d'Analyse Consolidée d'une Usine
 *
 * Route : /bia/factories/[id]/analysis
 *
 * Affiche :
 * - Informations détaillées de l'usine
 * - Statistiques consolidées
 * - Liste des processus critiques
 * - Liste des rapports BIA
 * - Graphiques et KPIs
 */

import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  MapPin,
  Users,
  Settings,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { FactoryAddProcessDialog } from "@/components/bia/factory-add-process-dialog";
import { FactoryAddReportDialog } from "@/components/bia/factory-add-report-dialog";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const factory = await prisma.factory.findUnique({
    where: { id },
    select: { name: true },
  });

  return {
    title: `${factory?.name || "Usine"} - Analyse BIA`,
    description: `Analyse consolidée de l'usine ${factory?.name}`,
  };
}

async function getFactoryAnalysis(id: string) {
  const factory = await prisma.factory.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          processes: true,
          biaReports: true,
        },
      },
      processes: {
        select: {
          id: true,
          name: true,
          criticality: true,
          rto: true,
          mtpd: true,
          department: true,
        },
        orderBy: {
          criticality: "desc",
        },
      },
      biaReports: {
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true,
          totalProcesses: true,
          continuityLevel: true,
        },
        orderBy: {
          createdAt: "desc",
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
  });

  if (!factory) return null;

  // Calculer les statistiques
  const criticalProcesses = factory.processes.filter(
    (p) => p.criticality === "critical"
  ).length;
  const highProcesses = factory.processes.filter(
    (p) => p.criticality === "high"
  ).length;

  const avgRto =
    factory.processes.length > 0
      ? Math.round(
          factory.processes.reduce((sum, p) => sum + p.rto, 0) /
            factory.processes.length
        )
      : 0;

  return {
    ...factory,
    stats: {
      criticalProcesses,
      highProcesses,
      avgRto,
    },
  };
}

export default async function FactoryAnalysisPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const { id } = await params;
  const factory = await getFactoryAnalysis(id);

  if (!factory) {
    notFound();
  }

  const getCriticalityBadge = (level: string) => {
    const variants = {
      critical: "destructive",
      high: "default",
      medium: "secondary",
      low: "outline",
    } as const;

    return (
      <Badge variant={variants[level as keyof typeof variants] || "outline"}>
        {level}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/bia/factories" className="hover:text-foreground">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux usines
          </Button>
        </Link>
      </div>

      {/* En-tête */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-8 w-8" />
            <h1 className="text-3xl font-bold">{factory.name}</h1>
            {factory.isActive ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-gray-500" />
            )}
          </div>
          <p className="text-muted-foreground">
            Code: <span className="font-mono">{factory.code}</span>
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {factory.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* Informations générales */}
      <Card>
        <CardHeader>
          <CardTitle>Informations Générales</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {factory.address && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">Adresse</div>
                <div className="text-sm text-muted-foreground">
                  {factory.address}
                  {factory.city && `, ${factory.city}`}
                  {factory.postalCode && ` ${factory.postalCode}`}
                  {factory.country && (
                    <div className="mt-1">{factory.country}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {factory.employeeCount && (
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">Employés</div>
                <div className="text-sm text-muted-foreground">
                  {factory.employeeCount} personnes
                </div>
              </div>
            </div>
          )}

          {factory.manager && (
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">Responsable</div>
                <div className="text-sm text-muted-foreground">
                  {factory.manager.firstName} {factory.manager.lastName}
                  <div className="text-xs">{factory.manager.email}</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Processus</p>
                <p className="text-2xl font-bold">{factory._count.processes}</p>
              </div>
              <Settings className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critiques</p>
                <p className="text-2xl font-bold text-red-500">
                  {factory.stats.criticalProcesses}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">RTO Moyen</p>
                <p className="text-2xl font-bold">{factory.stats.avgRto}h</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rapports</p>
                <p className="text-2xl font-bold">
                  {factory._count.biaReports}
                </p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Processus critiques */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Processus Critiques</CardTitle>
              <CardDescription>
                {factory.processes.length} processus associés à cette usine
              </CardDescription>
            </div>
            <FactoryAddProcessDialog
              factoryId={factory.id}
              factoryName={factory.name}
            />
          </div>
        </CardHeader>
        <CardContent>
          {factory.processes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun processus associé à cette usine
            </p>
          ) : (
            <div className="space-y-2">
              {factory.processes.map((process) => (
                <Link
                  key={process.id}
                  href={`/bia/processes/${process.id}`}
                  className="block p-4 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{process.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {process.department} • RTO: {process.rto}h • MTPD:{" "}
                        {process.mtpd}h
                      </div>
                    </div>
                    {getCriticalityBadge(process.criticality)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rapports BIA */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Rapports BIA</CardTitle>
              <CardDescription>
                {factory.biaReports.length} rapports générés pour cette usine
              </CardDescription>
            </div>
            <FactoryAddReportDialog
              factoryId={factory.id}
              factoryName={factory.name}
              factoryProcesses={factory.processes.map((p) => ({
                id: p.id,
                name: p.name,
                criticality: p.criticality,
              }))}
            />
          </div>
        </CardHeader>
        <CardContent>
          {factory.biaReports.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun rapport BIA pour cette usine
            </p>
          ) : (
            <div className="space-y-2">
              {factory.biaReports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{report.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {report.totalProcesses} processus • Créé le{" "}
                        {new Date(report.createdAt).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{report.status}</Badge>
                      {report.continuityLevel && (
                        <div className="text-sm text-muted-foreground">
                          {report.continuityLevel}%
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
