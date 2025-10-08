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
        color: "text-green-600",
        icon: CheckCircle2,
      };
    if (score >= 60)
      return { status: "Bon", color: "text-blue-600", icon: Target };
    if (score >= 40)
      return { status: "Moyen", color: "text-yellow-600", icon: TrendingDown };
    return { status: "Attention", color: "text-red-600", icon: AlertTriangle };
  };

  const healthStatus = getHealthStatus(healthScore);
  const HealthIcon = healthStatus.icon;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Vue d'ensemble de la criticité */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Répartition Criticité</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm">Critique</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {stats.byCriticality.critical}
                </span>
                <Badge variant="destructive" className="text-xs">
                  {criticalPercentage.toFixed(1)}%
                </Badge>
              </div>
            </div>
            <Progress value={criticalPercentage} className="h-2" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-sm">Élevé</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {stats.byCriticality.high}
                </span>
                <Badge
                  variant="secondary"
                  className="text-xs bg-orange-100 text-orange-800"
                >
                  {highPercentage.toFixed(1)}%
                </Badge>
              </div>
            </div>
            <Progress value={highPercentage} className="h-2" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-sm">Moyen</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {stats.byCriticality.medium}
                </span>
                <Badge
                  variant="secondary"
                  className="text-xs bg-yellow-100 text-yellow-800"
                >
                  {mediumPercentage.toFixed(1)}%
                </Badge>
              </div>
            </div>
            <Progress value={mediumPercentage} className="h-2" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm">Faible</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {stats.byCriticality.low}
                </span>
                <Badge
                  variant="secondary"
                  className="text-xs bg-green-100 text-green-800"
                >
                  {lowPercentage.toFixed(1)}%
                </Badge>
              </div>
            </div>
            <Progress value={lowPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Métriques de temps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Métriques Temporelles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm">RTO Moyen</span>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">{stats.averageRTO}h</div>
              <div className="text-xs text-muted-foreground">
                {stats.averageRTO <= 4
                  ? "Excellent"
                  : stats.averageRTO <= 12
                  ? "Bon"
                  : stats.averageRTO <= 24
                  ? "Moyen"
                  : "À améliorer"}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              <span className="text-sm">RPO Moyen</span>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">{stats.averageRPO}min</div>
              <div className="text-xs text-muted-foreground">
                {stats.averageRPO <= 15
                  ? "Excellent"
                  : stats.averageRPO <= 60
                  ? "Bon"
                  : stats.averageRPO <= 240
                  ? "Moyen"
                  : "À améliorer"}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="text-sm">MTPD Moyen</span>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">{stats.averageMTPD}h</div>
              <div className="text-xs text-muted-foreground">
                {stats.averageMTPD <= 8
                  ? "Critique"
                  : stats.averageMTPD <= 24
                  ? "Élevé"
                  : stats.averageMTPD <= 72
                  ? "Moyen"
                  : "Acceptable"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score de santé global */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Score de Santé BIA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div
              className={`inline-flex items-center gap-2 ${healthStatus.color} mb-2`}
            >
              <HealthIcon className="h-6 w-6" />
              <span className="text-xl font-bold">{healthStatus.status}</span>
            </div>
            <div className="text-3xl font-bold text-muted-foreground">
              {Math.round(healthScore)}/100
            </div>
          </div>

          <div className="space-y-3">
            <Progress value={healthScore} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Processus totaux :</span>
              <span className="font-medium">{stats.total}</span>
            </div>
            <div className="flex justify-between">
              <span>Nécessitent attention :</span>
              <span
                className={`font-medium ${
                  stats.processesNeedingAttention > 0
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {stats.processesNeedingAttention}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Départements couverts :</span>
              <span className="font-medium">
                {Object.keys(stats.byDepartment).length}
              </span>
            </div>
          </div>

          {/* Recommandations rapides */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2">Actions Recommandées :</h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              {stats.processesNeedingAttention > 0 && (
                <div className="flex items-center gap-1 text-red-600">
                  <AlertTriangle className="h-3 w-3" />
                  <span>
                    Réviser {stats.processesNeedingAttention} processus
                  </span>
                </div>
              )}
              {stats.averageRTO > 24 && (
                <div className="flex items-center gap-1 text-orange-600">
                  <TrendingDown className="h-3 w-3" />
                  <span>Optimiser les RTO</span>
                </div>
              )}
              {stats.byCriticality.critical === 0 && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Aucun processus critique</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
