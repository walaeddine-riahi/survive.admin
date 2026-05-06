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
      <div className="relative overflow-hidden rounded-[16px] border border-[var(--border)] bg-[var(--bg-surface)] p-8 shadow-sm">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-[var(--accent)] rounded-2xl shadow-lg">
                <BarChart3 className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">Tableau de Bord BIA</h1>
                <p className="text-[var(--text-muted)] text-lg font-medium mt-1">
                  Business Impact Analysis - Vue d&apos;ensemble de la continuité
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)]/50`}
              >
                <Shield className={`h-5 w-5 ${resilienceScore >= 80 ? 'text-emerald-500' : resilienceScore >= 60 ? 'text-blue-500' : 'text-orange-500'}`} />
                <span className={`font-bold text-sm uppercase tracking-wider ${resilienceScore >= 80 ? 'text-emerald-500' : resilienceScore >= 60 ? 'text-blue-500' : 'text-orange-500'}`}>
                  Résilience: {resilienceLevel.label}
                </span>
                <span className="text-xs font-bold text-[var(--text-muted)] ml-1">
                  Score: {resilienceScore}/100
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Processus */}
        <Card className="border border-[var(--border)] bg-[var(--bg-surface)] hover:shadow-md transition-all rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">
                  Total Processus
                </p>
                <p className="text-3xl font-black text-[var(--text-primary)]">{stats.total}</p>
                <p className="text-xs font-medium text-[var(--text-muted)] mt-1">
                  Processus analysés
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-[var(--accent)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Processus critiques */}
        <Card className="border border-[var(--border)] bg-[var(--bg-surface)] hover:shadow-md transition-all rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">
                  Critiques
                </p>
                <p className="text-3xl font-black text-red-500">
                  {stats.critical}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant="outline"
                    className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-[10px] font-black uppercase"
                  >
                    +{stats.high} Élevés
                  </Badge>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RTO Moyen */}
        <Card className="border border-[var(--border)] bg-[var(--bg-surface)] hover:shadow-md transition-all rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">
                  RTO Moyen
                </p>
                <p className="text-3xl font-black text-[var(--text-primary)]">{stats.avgRto.toFixed(0)}h</p>
                <p className="text-xs font-medium text-[var(--text-muted)] mt-1">
                  Recovery Time Objective
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MTPD Moyen */}
        <Card className="border border-[var(--border)] bg-[var(--bg-surface)] hover:shadow-md transition-all rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">
                  MTPD Moyen
                </p>
                <p className="text-3xl font-black text-[var(--text-primary)]">
                  {stats.avgMtpd.toFixed(0)}h
                </p>
                <p className="text-xs font-medium text-[var(--text-muted)] mt-1">
                  Max Tolerable Period
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-violet-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-all border border-[var(--border)] bg-[var(--bg-surface)] rounded-xl overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-[var(--accent)]" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                  RPO Moyen
                </p>
                <p className="text-2xl font-black text-[var(--text-primary)]">{stats.avgRpo.toFixed(0)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all border border-[var(--border)] bg-[var(--bg-surface)] rounded-xl overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-orange-500" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                  Criticité Moyenne
                </p>
                <div className="flex gap-1 mt-1">
                  <Badge
                    variant="outline"
                    className="text-[10px] font-black bg-red-500/10 text-red-500 border-red-500/20"
                  >
                    {stats.critical}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-black bg-orange-500/10 text-orange-500 border-orange-500/20"
                  >
                    {stats.high}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-black bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                  >
                    {stats.medium}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-black bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  >
                    {stats.low}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all border border-[var(--border)] bg-[var(--bg-surface)] rounded-xl overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                  Conformité ISO 22301
                </p>
                <p className="text-2xl font-black text-[var(--text-primary)]">{resilienceScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
