"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Target,
  TrendingDown,
} from "lucide-react";

type ProcessStats = {
  total: number;
  byCriticality: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  byDepartment: Record<string, number>;
  averageRTO: number;
  averageRPO: number;
  averageMTPD: number;
  processesNeedingAttention: number;
};

interface BiaMetricsOverviewProps {
  stats: ProcessStats;
}

export function BiaMetricsOverview({ stats }: BiaMetricsOverviewProps) {
  // Calculer les pourcentages de criticité
  const criticalPercentage =
    stats.total > 0 ? (stats.byCriticality.critical / stats.total) * 100 : 0;
  const highPercentage =
    stats.total > 0 ? (stats.byCriticality.high / stats.total) * 100 : 0;
  const mediumPercentage =
    stats.total > 0 ? (stats.byCriticality.medium / stats.total) * 100 : 0;
  const lowPercentage =
    stats.total > 0 ? (stats.byCriticality.low / stats.total) * 100 : 0;

  // Déterminer le statut global de santé
  const healthScore =
    stats.total > 0
      ? (stats.byCriticality.low * 100 +
          stats.byCriticality.medium * 75 +
          stats.byCriticality.high * 50 +
          stats.byCriticality.critical * 25) /
        stats.total
      : 0;

  const getHealthStatus = (score: number) => {
    if (score >= 80)
      return {
        status: "Excellent",
        color: "text-emerald-600",
        fill: "bg-emerald-500",
        icon: CheckCircle2,
      };
    if (score >= 60)
      return { status: "Bon", color: "text-blue-600", fill: "bg-blue-500", icon: Target };
    if (score >= 40)
      return { status: "Moyen", color: "text-orange-600", fill: "bg-orange-500", icon: TrendingDown };
    return { status: "Attention", color: "text-red-600", fill: "bg-red-500", icon: AlertTriangle };
  };

  const healthStatus = getHealthStatus(healthScore);
  const HealthIcon = healthStatus.icon;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Vue d'ensemble de la criticité */}
      <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden group">
        <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-orange-500 to-emerald-500" />
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Répartition Criticité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="space-y-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                <span className="text-sm font-semibold">Critique</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-red-600">
                  {stats.byCriticality.critical}
                </span>
                <Badge variant="destructive" className="text-[10px] h-5 px-1.5 font-bold">
                  {criticalPercentage.toFixed(1)}%
                </Badge>
              </div>
            </div>
            <Progress value={criticalPercentage} className="h-2 bg-muted transition-all" indicatorClassName="bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
          </div>

          <div className="space-y-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                <span className="text-sm font-semibold">Élevé</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-orange-600">
                  {stats.byCriticality.high}
                </span>
                <Badge
                  variant="secondary"
                  className="text-[10px] h-5 px-1.5 font-bold bg-orange-100 text-orange-800"
                >
                  {highPercentage.toFixed(1)}%
                </Badge>
              </div>
            </div>
            <Progress value={highPercentage} className="h-2 bg-muted transition-all" indicatorClassName="bg-orange-500" />
          </div>

          <div className="space-y-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                <span className="text-sm font-semibold">Moyen</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-blue-600">
                  {stats.byCriticality.medium}
                </span>
                <Badge
                  variant="secondary"
                  className="text-[10px] h-5 px-1.5 font-bold bg-blue-100 text-blue-800"
                >
                  {mediumPercentage.toFixed(1)}%
                </Badge>
              </div>
            </div>
            <Progress value={mediumPercentage} className="h-2 bg-muted transition-all" indicatorClassName="bg-blue-500" />
          </div>

          <div className="space-y-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-sm font-semibold">Faible</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-emerald-600">
                  {stats.byCriticality.low}
                </span>
                <Badge
                  variant="secondary"
                  className="text-[10px] h-5 px-1.5 font-bold bg-emerald-100 text-emerald-800"
                >
                  {lowPercentage.toFixed(1)}%
                </Badge>
              </div>
            </div>
            <Progress value={lowPercentage} className="h-2 bg-muted transition-all" indicatorClassName="bg-emerald-500" />
          </div>
        </CardContent>
      </Card>

      {/* Métriques de temps */}
      <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden group">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Métriques Temporelles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/50 group-hover:scale-[1.02] transition-transform">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg shadow-lg shadow-blue-500/20">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-bold">RTO Moyen</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 tabular-nums">{stats.averageRTO}h</div>
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold border-blue-200 text-blue-700 bg-blue-50 dark:bg-transparent">
                {stats.averageRTO <= 12 ? "Performance" : "Attention"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/50 group-hover:scale-[1.02] transition-transform">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-lg shadow-lg shadow-emerald-500/20">
                <Target className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-bold">RPO Moyen</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{stats.averageRPO}m</div>
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-transparent">
                {stats.averageRPO <= 30 ? "Optimal" : "Critique"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100/50 dark:border-orange-900/50 group-hover:scale-[1.02] transition-transform">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg shadow-lg shadow-orange-500/20">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-bold">MTPD Moyen</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-orange-600 dark:text-orange-400 tabular-nums">{stats.averageMTPD}h</div>
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold border-orange-200 text-orange-700 bg-orange-50 dark:bg-transparent">
                {stats.averageMTPD >= 48 ? "Acceptable" : "À Surveiller"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score de santé global */}
      <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden group">
        <div className={`h-1.5 w-full ${healthStatus.fill}`} />
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Score de Santé BIA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 pt-8">
          <div className="relative flex flex-col items-center justify-center">
            <div className={`absolute -top-4 rounded-full px-3 py-1 text-[10px] font-black uppercase text-white ${healthStatus.fill} shadow-lg`}>
              Statut: {healthStatus.status}
            </div>
            <div className={`text-6xl font-black tracking-tighter ${healthStatus.color}`}>
              {Math.round(healthScore)}
              <span className="text-2xl text-muted-foreground ml-1">/100</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
               <HealthIcon className={`h-5 w-5 ${healthStatus.color}`} />
               <p className="text-xs font-bold text-muted-foreground tracking-tight underline decoration-primary/30">
                 Continuité Opérationnelle
               </p>
            </div>
          </div>

          <div className="space-y-3 px-4">
            <Progress value={healthScore} className="h-4 bg-muted border-inner shadow-inner" indicatorClassName={`${healthStatus.fill} shadow-[0_0_15px_rgba(0,0,0,0.1)]`} />
            <div className="flex justify-between text-[10px] font-black text-muted-foreground/60 tracking-widest px-1">
              <span>CRITIQUE</span>
              <span>FAIBLE</span>
              <span>MOYEN</span>
              <span>BON</span>
              <span>EXCELLENT</span>
            </div>
          </div>

          <div className="space-y-2 p-4 rounded-2xl bg-muted/30 border border-border/50">
             <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Processus :</span>
                <span className="font-black bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs">{stats.total}</span>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Alertes actives :</span>
                <span className={`font-black ${stats.processesNeedingAttention > 0 ? "text-red-500" : "text-emerald-500"}`}>
                  {stats.processesNeedingAttention}
                </span>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Shield } from "lucide-react";
