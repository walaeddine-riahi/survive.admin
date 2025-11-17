"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

type Process = {
  id: string;
  name: string;
  department: string;
  criticality: "low" | "medium" | "high" | "critical";
  rto: number;
  mtpd: number;
  rpo: number;
};

type BiaOverviewProps = {
  processes: Process[];
};

export function BiaOverview({ processes }: BiaOverviewProps) {
  // Statistiques par département
  const departmentStats = processes.reduce((acc, process) => {
    if (!acc[process.department]) {
      acc[process.department] = {
        total: 0,
        critical: 0,
        high: 0,
        avgRto: 0,
      };
    }
    acc[process.department].total++;
    if (process.criticality === "critical") acc[process.department].critical++;
    if (process.criticality === "high") acc[process.department].high++;
    acc[process.department].avgRto += process.rto;
    return acc;
  }, {} as Record<string, { total: number; critical: number; high: number; avgRto: number }>);

  // Calculer la moyenne RTO par département
  Object.keys(departmentStats).forEach((dept) => {
    departmentStats[dept].avgRto /= departmentStats[dept].total;
  });

  // Trier les départements par criticité
  const sortedDepartments = Object.entries(departmentStats).sort(
    ([, a], [, b]) => b.critical + b.high - (a.critical + a.high)
  );

  // Processus les plus critiques
  const criticalProcesses = processes
    .filter((p) => p.criticality === "critical" || p.criticality === "high")
    .sort((a, b) => {
      if (a.criticality === "critical" && b.criticality !== "critical")
        return -1;
      if (a.criticality !== "critical" && b.criticality === "critical")
        return 1;
      return a.rto - b.rto;
    })
    .slice(0, 5);

  // Processus avec RTO court
  const urgentProcesses = [...processes]
    .sort((a, b) => a.rto - b.rto)
    .slice(0, 5);

  // Alertes et recommandations
  const alerts = [];
  const criticalCount = processes.filter(
    (p) => p.criticality === "critical"
  ).length;
  const highCount = processes.filter((p) => p.criticality === "high").length;
  const lowRtoCount = processes.filter((p) => p.rto < 24).length;

  if (criticalCount > 0) {
    alerts.push({
      type: "critical",
      message: `${criticalCount} processus critique${
        criticalCount > 1 ? "s" : ""
      } nécessite${criticalCount > 1 ? "nt" : ""} une attention immédiate`,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
    });
  }

  if (lowRtoCount > 5) {
    alerts.push({
      type: "warning",
      message: `${lowRtoCount} processus avec RTO < 24h - Prioriser les plans de reprise`,
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-50",
    });
  }

  if (
    processes.length >= 10 &&
    criticalCount + highCount < processes.length * 0.3
  ) {
    alerts.push({
      type: "success",
      message: "Bonne répartition de la criticité - Continuez le monitoring",
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    });
  }

  return (
    <div className="space-y-6">
      {/* Alertes et recommandations */}
      {alerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.map((alert, index) => (
            <Card key={index} className={`${alert.bg} border-0`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <alert.icon className={`h-5 w-5 ${alert.color} mt-0.5`} />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${alert.color}`}>
                      {alert.message}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Processus critiques */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Top 5 - Processus Prioritaires
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="#processes">
                  Voir tout
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalProcesses.length > 0 ? (
                criticalProcesses.map((process) => (
                  <div
                    key={process.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:border-blue-300 transition-colors"
                  >
                    <div className="flex-1">
                      <Link
                        href={`/bia/processes/${process.id}`}
                        className="font-medium hover:text-blue-600 block"
                      >
                        {process.name}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-1">
                        {process.department}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          process.criticality === "critical"
                            ? "bg-red-100 text-red-800 border-red-200"
                            : "bg-orange-100 text-orange-800 border-orange-200"
                        }
                      >
                        {process.criticality === "critical"
                          ? "Critique"
                          : "Élevé"}
                      </Badge>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">RTO</p>
                        <p className="font-mono font-semibold">
                          {process.rto}h
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-6">
                  Aucun processus critique
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* RTO les plus courts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Top 5 - RTO les plus Courts
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="#processes">
                  Voir tout
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {urgentProcesses.map((process, index) => (
                <div
                  key={process.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <Link
                        href={`/bia/processes/${process.id}`}
                        className="font-medium hover:text-blue-600 block"
                      >
                        {process.name}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-1">
                        {process.department}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">RTO</p>
                      <p className="font-mono font-bold text-blue-600">
                        {process.rto}h
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">MTPD</p>
                      <p className="font-mono text-sm">{process.mtpd}h</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vue par département */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Analyse par Département
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedDepartments.map(([dept, stats]) => (
              <div key={dept} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold">{dept}</h4>
                    <Badge variant="outline">{stats.total} processus</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    {stats.critical > 0 && (
                      <Badge className="bg-red-100 text-red-800 border-red-200">
                        {stats.critical} critique{stats.critical > 1 ? "s" : ""}
                      </Badge>
                    )}
                    {stats.high > 0 && (
                      <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                        {stats.high} élevé{stats.high > 1 ? "s" : ""}
                      </Badge>
                    )}
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">RTO Moy.</p>
                      <p className="font-mono font-semibold">
                        {stats.avgRto.toFixed(0)}h
                      </p>
                    </div>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-green-500"
                    style={{
                      width: `${Math.min(
                        100,
                        ((stats.critical * 2 + stats.high) / stats.total) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {sortedDepartments.length === 0 && (
              <p className="text-center text-muted-foreground py-6">
                Aucun département
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recommandations */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
            <TrendingUp className="h-5 w-5" />
            Recommandations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">
                  Prioriser les processus critiques
                </p>
                <p className="text-blue-700 mt-1">
                  Concentrez vos efforts sur les {criticalCount} processus
                  critiques et développez des plans de continuité robustes.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">
                  Optimiser les RTO courts
                </p>
                <p className="text-blue-700 mt-1">
                  {lowRtoCount} processus nécessitent une reprise rapide (&lt;
                  24h). Assurez-vous d&apos;avoir les ressources adéquates.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Tests réguliers</p>
                <p className="text-blue-700 mt-1">
                  Planifiez des simulations de crise pour valider vos plans de
                  continuité et identifier les améliorations nécessaires.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
