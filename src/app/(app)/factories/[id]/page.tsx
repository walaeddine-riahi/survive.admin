/**
 * Page de Détail d'une Usine
 * Route : /factories/[id]
 */

import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Factory,
  MapPin,
  Users,
  Phone,
  Mail,
  Globe,
  Building2,
  AlertTriangle,
  TrendingUp,
  Clock,
  FileText,
  Settings,
  ArrowLeft,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Détails de l'Usine - BIA",
  description: "Informations détaillées sur l'usine et ses processus",
};

interface FactoryDetailPageProps {
  params: {
    id: string;
  };
}

async function getFactoryDetails(id: string) {
  const factory = await prisma.factory.findUnique({
    where: { id },
    include: {
      manager: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      processes: {
        select: {
          id: true,
          name: true,
          criticality: true,
          department: true,
          rto: true,
          mtpd: true,
          rpo: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      biaReports: {
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true,
          author: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
      _count: {
        select: {
          processes: true,
          biaReports: true,
        },
      },
    },
  });

  return factory;
}

export default async function FactoryDetailPage({
  params,
}: FactoryDetailPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const factory = await getFactoryDetails(params.id);

  if (!factory) {
    notFound();
  }

  // Calcul des statistiques
  const criticalProcesses = factory.processes.filter(
    (p: { criticality: string }) => p.criticality === "critical"
  ).length;
  const highProcesses = factory.processes.filter(
    (p: { criticality: string }) => p.criticality === "high"
  ).length;
  const avgRTO =
    factory.processes.length > 0
      ? factory.processes.reduce(
          (sum: number, p: { rto: number }) => sum + p.rto,
          0
        ) / factory.processes.length
      : 0;

  const completedReports = factory.biaReports.filter(
    (r: { status: string }) => r.status === "GENERATED"
  ).length;

  return (
    <div className="space-y-6 p-6">
      {/* Header avec breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/bia/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/bia/factories" className="hover:text-foreground">
              Usines
            </Link>
            <span>/</span>
            <span className="text-foreground">{factory.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Factory className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{factory.name}</h1>
              <p className="text-muted-foreground">Code: {factory.code}</p>
            </div>
            <Badge
              variant={factory.isActive ? "default" : "secondary"}
              className="ml-2"
            >
              {factory.isActive ? "Active" : "Inactive"}
            </Badge>
            {factory.criticalityLevel && (
              <Badge
                variant={
                  factory.criticalityLevel === "critique"
                    ? "destructive"
                    : "outline"
                }
              >
                {factory.criticalityLevel}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/bia/factories">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <Link href={`/bia/factories/${factory.id}/analysis`}>
            <Button variant="default" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analyse Consolidée
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Processus
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{factory._count.processes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {criticalProcesses} critiques, {highProcesses} élevés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rapports BIA</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {factory._count.biaReports}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedReports} complétés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RTO Moyen</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRTO.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground mt-1">
              Temps de récupération
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employés</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {factory.employeeCount || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {factory.surfaceArea
                ? `${factory.surfaceArea.toLocaleString()} m²`
                : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informations Générales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informations Générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {factory.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Description
                </p>
                <p className="text-sm mt-1">{factory.description}</p>
              </div>
            )}

            {factory.manager && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Manager
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {factory.manager.firstName} {factory.manager.lastName}
                  </span>
                </div>
                {factory.manager.email && (
                  <p className="text-xs text-muted-foreground ml-6">
                    {factory.manager.email}
                  </p>
                )}
              </div>
            )}

            {factory.department && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Département
                </p>
                <p className="text-sm mt-1">{factory.department}</p>
              </div>
            )}

            {factory.division && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Division
                </p>
                <p className="text-sm mt-1">{factory.division}</p>
              </div>
            )}

            {factory.certifications &&
              Array.isArray(factory.certifications) &&
              factory.certifications.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Certifications
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {factory.certifications.map((cert: string, idx: number) => (
                      <Badge key={idx} variant="secondary">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

            {factory.complianceStandards &&
              Array.isArray(factory.complianceStandards) &&
              factory.complianceStandards.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Normes de Conformité
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {factory.complianceStandards.map(
                      (standard: string, idx: number) => (
                        <Badge key={idx} variant="outline">
                          {standard}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>

        {/* Coordonnées */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Coordonnées
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(factory.address ||
              factory.city ||
              factory.postalCode ||
              factory.country) && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Adresse
                </p>
                <div className="text-sm mt-1 space-y-1">
                  {factory.address && <p>{factory.address}</p>}
                  {(factory.postalCode || factory.city) && (
                    <p>
                      {factory.postalCode} {factory.city}
                    </p>
                  )}
                  {factory.country && <p>{factory.country}</p>}
                  {factory.region && (
                    <p className="text-muted-foreground">{factory.region}</p>
                  )}
                </div>
              </div>
            )}

            {factory.phoneNumber && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`tel:${factory.phoneNumber}`}
                  className="text-sm hover:underline"
                >
                  {factory.phoneNumber}
                </a>
              </div>
            )}

            {factory.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`mailto:${factory.email}`}
                  className="text-sm hover:underline"
                >
                  {factory.email}
                </a>
              </div>
            )}

            {factory.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a
                  href={factory.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline"
                >
                  {factory.website}
                </a>
              </div>
            )}

            {factory.timezone && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Fuseau horaire
                </p>
                <p className="text-sm mt-1">{factory.timezone}</p>
              </div>
            )}

            {factory.operatingHours && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Heures d&apos;opération
                </p>
                <div className="text-sm mt-1">
                  {typeof factory.operatingHours === "object" &&
                  factory.operatingHours !== null ? (
                    <div className="space-y-1">
                      {(
                        factory.operatingHours as {
                          open?: string;
                          close?: string;
                          days?: string[];
                        }
                      ).open && (
                        <p>
                          Ouverture:{" "}
                          {
                            (
                              factory.operatingHours as {
                                open: string;
                                close: string;
                              }
                            ).open
                          }{" "}
                          -{" "}
                          {
                            (
                              factory.operatingHours as {
                                open: string;
                                close: string;
                              }
                            ).close
                          }
                        </p>
                      )}
                      {(factory.operatingHours as { days?: string[] }).days && (
                        <p className="text-muted-foreground">
                          {(
                            factory.operatingHours as { days: string[] }
                          ).days.join(", ")}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p>{JSON.stringify(factory.operatingHours)}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Liste des Processus */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Processus Critiques ({factory.processes.length})
            </CardTitle>
            <Link href={`/bia/processes/new?factoryId=${factory.id}`}>
              <Button variant="outline" size="sm">
                + Nouveau Processus
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {factory.processes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun processus défini pour cette usine</p>
            </div>
          ) : (
            <div className="space-y-3">
              {factory.processes.map(
                (process: {
                  id: string;
                  name: string;
                  criticality: string;
                  department: string | null;
                  rto: number;
                  mtpd: number;
                  rpo: number;
                  createdAt: Date;
                }) => (
                  <Link
                    key={process.id}
                    href={`/bia/processes/${process.id}`}
                    className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{process.name}</h4>
                          <Badge
                            variant={
                              process.criticality === "critical"
                                ? "destructive"
                                : process.criticality === "high"
                                ? "default"
                                : process.criticality === "medium"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {process.criticality === "critical"
                              ? "Critique"
                              : process.criticality === "high"
                              ? "Élevé"
                              : process.criticality === "medium"
                              ? "Moyen"
                              : "Faible"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {process.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            RTO: {process.rto}h
                          </span>
                          <span className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            MTPD: {process.mtpd}h
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            RPO: {process.rpo}h
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(process.createdAt).toLocaleDateString(
                          "fr-FR"
                        )}
                      </span>
                    </div>
                  </Link>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rapports BIA Récents */}
      {factory.biaReports.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Rapports BIA Récents
              </CardTitle>
              <Link href={`/bia/reports?factoryId=${factory.id}`}>
                <Button variant="ghost" size="sm">
                  Voir tous →
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {factory.biaReports.map(
                (report: {
                  id: string;
                  title: string;
                  name: string;
                  status: string;
                  createdAt: Date;
                  author: { firstName: string; lastName: string } | null;
                }) => (
                  <Link
                    key={report.id}
                    href={`/bia/reports/${report.id}/view`}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{report.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {report.author
                            ? `${report.author.firstName} ${report.author.lastName}`
                            : "N/A"}{" "}
                          •{" "}
                          {new Date(report.createdAt).toLocaleDateString(
                            "fr-FR"
                          )}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        report.status === "GENERATED"
                          ? "default"
                          : report.status === "DRAFT"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {report.status === "GENERATED"
                        ? "Complété"
                        : report.status === "DRAFT"
                        ? "En cours"
                        : "Brouillon"}
                    </Badge>
                  </Link>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
