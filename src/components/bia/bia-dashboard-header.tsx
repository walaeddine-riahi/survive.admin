"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  AlertCircle,
  TrendingUp,
  Clock,
  Activity,
  Shield,
  FileText,
  BarChart3,
} from "lucide-react";

type Process = {
  criticality: "low" | "medium" | "high" | "critical";
  rto: number;
  mtpd: number;
  rpo: number;
};

type DashboardHeaderProps = {
  processes: Process[];
};

export function BiaDashboardHeader({ processes }: DashboardHeaderProps) {
  // Calculer les statistiques
  const stats = {
    total: processes.length,
    critical: processes.filter((p) => p.criticality === "critical").length,
    high: processes.filter((p) => p.criticality === "high").length,
    medium: processes.filter((p) => p.criticality === "medium").length,
    low: processes.filter((p) => p.criticality === "low").length,
    avgRto:
      processes.reduce((acc, p) => acc + p.rto, 0) / (processes.length || 1),
    avgMtpd:
      processes.reduce((acc, p) => acc + p.mtpd, 0) / (processes.length || 1),
    avgRpo:
      processes.reduce((acc, p) => acc + p.rpo, 0) / (processes.length || 1),
  };

  // Calculer le score de résilience (0-100)
  const resilienceScore = Math.round(
    100 -
      (stats.critical * 10 +
        stats.high * 5 +
        stats.medium * 2 +
        stats.low * 1) /
        (stats.total || 1)
  );

  // Déterminer le niveau de résilience
  const resilienceLevel =
    resilienceScore >= 80
      ? { label: "Excellent", color: "text-green-600", bg: "bg-green-100" }
      : resilienceScore >= 60
      ? { label: "Bon", color: "text-blue-600", bg: "bg-blue-100" }
      : resilienceScore >= 40
      ? { label: "Moyen", color: "text-yellow-600", bg: "bg-yellow-100" }
      : { label: "Faible", color: "text-red-600", bg: "bg-red-100" };

  return (
    <div className="space-y-6">
      {/* En-tête principal avec gradient */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Tableau de Bord BIA</h1>
              <p className="text-blue-100 text-lg">
                Business Impact Analysis - Vue d&apos;ensemble de la continuité
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge
                className={`${resilienceLevel.bg} ${resilienceLevel.color} border-0 text-lg px-4 py-2`}
              >
                <Shield className="h-5 w-5 mr-2" />
                Résilience: {resilienceLevel.label}
              </Badge>
              <span className="text-blue-100 text-sm">
                Score: {resilienceScore}/100
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Processus */}
        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Total Processus
                </p>
                <p className="text-3xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Processus analysés
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Processus critiques */}
        <Card className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Critiques
                </p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.critical}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className="bg-orange-100 text-orange-700 border-orange-200 text-xs"
                  >
                    +{stats.high} Élevés
                  </Badge>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RTO Moyen */}
        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  RTO Moyen
                </p>
                <p className="text-3xl font-bold">{stats.avgRto.toFixed(0)}h</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Recovery Time Objective
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MTPD Moyen */}
        <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  MTPD Moyen
                </p>
                <p className="text-3xl font-bold">
                  {stats.avgMtpd.toFixed(0)}h
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Max Tolerable Period
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques secondaires */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  RPO Moyen
                </p>
                <p className="text-2xl font-bold">{stats.avgRpo.toFixed(0)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Criticité Moyenne
                </p>
                <div className="flex gap-1 mt-1">
                  <Badge
                    variant="outline"
                    className="text-xs bg-red-50 text-red-700"
                  >
                    {stats.critical}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs bg-orange-50 text-orange-700"
                  >
                    {stats.high}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs bg-yellow-50 text-yellow-700"
                  >
                    {stats.medium}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs bg-green-50 text-green-700"
                  >
                    {stats.low}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Conformité ISO 22301
                </p>
                <p className="text-2xl font-bold">{resilienceScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
