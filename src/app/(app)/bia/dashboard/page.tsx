import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllProcesses } from "@/actions/bia/process-actions";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  Users,
  Shield,
  Factory,
  FileText,
} from "lucide-react";
import { BiaProcessChart } from "@/components/bia/bia-process-chart";
import { BiaCriticalityChart } from "@/components/bia/bia-criticality-chart";
import { BiaRtoChart } from "@/components/bia/bia-rto-chart";
import { BiaMetricsOverview } from "@/components/bia/bia-metrics-overview";
import { BiaProcessTable } from "@/components/bia/bia-process-table";
import { BiaExportButtons } from "@/components/bia/bia-export-buttons";
import { BiaImpactMatrix } from "@/components/bia/bia-impact-matrix";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";

// Types pour les métriques
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
  globalContinuityLevel: {
    score: number;
    level: "Excellent" | "Bon" | "Moyen" | "Faible" | "Critique";
    color: string;
  };
  recommendations: string[];
  majorRisks: {
    type: string;
    description: string;
    severity: "Critique" | "Élevé" | "Moyen";
    processes: string[];
  }[];
  matrix: Record<string, Record<string, number>>;
};

type Process = {
  id: string;
  name: string;
  description: string | null;
  department: string;
  location: string;
  impact: string;
  criticality: "low" | "medium" | "high" | "critical";
  rto: number;
  mtpd: number;
  rpo: number;
  mbco: string;
  factoryId: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

function calculateProcessStats(processes: Process[]): ProcessStats {
  const stats: ProcessStats = {
    total: processes.length,
    byCriticality: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    },
    byDepartment: {},
    averageRTO: 0,
    averageRPO: 0,
    averageMTPD: 0,
    processesNeedingAttention: 0,
    globalContinuityLevel: {
      score: 0,
      level: "Critique",
      color: "red",
    },
    recommendations: [],
    majorRisks: [],
    matrix: {
      "0-4h": { critical: 0, high: 0, medium: 0, low: 0 },
      "4-24h": { critical: 0, high: 0, medium: 0, low: 0 },
      "24-72h": { critical: 0, high: 0, medium: 0, low: 0 },
      "72h+": { critical: 0, high: 0, medium: 0, low: 0 },
    },
  };

  if (processes.length === 0) return stats;

  let totalRTO = 0;
  let totalRPO = 0;
  let totalMTPD = 0;

  processes.forEach((process) => {
    // Criticité
    stats.byCriticality[process.criticality]++;

    // Matrice (RTO / Criticité)
    let rtoTag = "72h+";
    if (process.rto <= 4) rtoTag = "0-4h";
    else if (process.rto <= 24) rtoTag = "4-24h";
    else if (process.rto <= 72) rtoTag = "24-72h";

    if (stats.matrix[rtoTag]) {
      stats.matrix[rtoTag][process.criticality]++;
    }

    // Départements
    if (!stats.byDepartment[process.department]) {
      stats.byDepartment[process.department] = 0;
    }
    stats.byDepartment[process.department]++;

    // Moyennes
    totalRTO += process.rto;
    totalRPO += process.rpo;
    totalMTPD += process.mtpd;

    // Processus nécessitant de l'attention (RTO > 24h ou criticité élevée)
    if (process.rto > 24 || process.criticality === "critical") {
      stats.processesNeedingAttention++;
    }
  });

  stats.averageRTO = Math.round(totalRTO / processes.length);
  stats.averageRPO = Math.round(totalRPO / processes.length);
  stats.averageMTPD = Math.round(totalMTPD / processes.length);

  // Calcul du niveau de continuité global
  const continuitScore = calculateContinuityScore(stats, processes);
  stats.globalContinuityLevel = continuitScore;

  // Génération des recommandations
  stats.recommendations = generateRecommendations(stats, processes);

  // Identification des risques majeurs
  stats.majorRisks = identifyMajorRisks(stats, processes);

  return stats;
}

function calculateContinuityScore(
  stats: Omit<
    ProcessStats,
    "globalContinuityLevel" | "recommendations" | "majorRisks"
  >,
  processes: Process[]
) {
  let score = 100;

  // Pénalités basées sur la criticité
  score -= stats.byCriticality.critical * 15; // -15 points par processus critique
  score -= stats.byCriticality.high * 8; // -8 points par processus haute criticité
  score -= stats.byCriticality.medium * 3; // -3 points par processus moyenne criticité

  // Pénalités basées sur les RTO
  if (stats.averageRTO > 72) score -= 20;
  else if (stats.averageRTO > 48) score -= 15;
  else if (stats.averageRTO > 24) score -= 10;
  else if (stats.averageRTO > 12) score -= 5;

  // Pénalités pour les processus nécessitant attention
  score -= Math.min(stats.processesNeedingAttention * 5, 30);

  // Bonus pour la couverture départementale
  const deptCount = Object.keys(stats.byDepartment).length;
  if (deptCount >= 5) score += 10;
  else if (deptCount >= 3) score += 5;

  // Pénalité pour processus sans MBCO défini
  const processesWithoutMbco = processes.filter(
    (p) => !p.mbco || p.mbco.trim() === ""
  ).length;
  if (processesWithoutMbco > 0) score -= processesWithoutMbco * 2;

  // Assurer que le score reste dans les limites
  score = Math.max(0, Math.min(100, score));

  let level: "Excellent" | "Bon" | "Moyen" | "Faible" | "Critique";
  let color: string;

  if (score >= 85) {
    level = "Excellent";
    color = "green";
  } else if (score >= 70) {
    level = "Bon";
    color = "blue";
  } else if (score >= 55) {
    level = "Moyen";
    color = "orange";
  } else if (score >= 40) {
    level = "Faible";
    color = "red";
  } else {
    level = "Critique";
    color = "red";
  }

  return { score: Math.round(score), level, color };
}

function generateRecommendations(
  stats: Omit<
    ProcessStats,
    "globalContinuityLevel" | "recommendations" | "majorRisks"
  >,
  processes: Process[]
): string[] {
  const recommendations: string[] = [];

  // Recommandations basées sur la criticité
  if (stats.byCriticality.critical > 0) {
    recommendations.push(
      `Révision urgente des ${stats.byCriticality.critical} processus critiques - Mettre à jour les plans de continuité et les procédures de récupération`
    );
  }

  if (
    stats.byCriticality.critical + stats.byCriticality.high >
    stats.total * 0.3
  ) {
    recommendations.push(
      "Plus de 30% des processus sont de criticité élevée - Envisager une redistribution des ressources et une priorisation"
    );
  }

  // Recommandations RTO
  if (stats.averageRTO > 48) {
    recommendations.push(
      "RTO moyen trop élevé (>48h) - Investir dans des solutions de récupération plus rapides et des procédures automatisées"
    );
  } else if (stats.averageRTO > 24) {
    recommendations.push(
      "RTO moyen élevé (>24h) - Optimiser les procédures de récupération et former les équipes"
    );
  }

  // Recommandations RPO
  if (stats.averageRPO > 8) {
    recommendations.push(
      "RPO moyen élevé - Améliorer la fréquence des sauvegardes et la synchronisation des données"
    );
  }

  // Recommandations départementales
  const deptCount = Object.keys(stats.byDepartment).length;
  if (deptCount < 3) {
    recommendations.push(
      "Couverture départementale insuffisante - Étendre l&apos;analyse BIA à tous les départements critiques"
    );
  }

  // Recommandations basées sur les processus spécifiques
  const processesWithoutMbco = processes.filter(
    (p) => !p.mbco || p.mbco.trim() === ""
  ).length;
  if (processesWithoutMbco > 0) {
    recommendations.push(
      `${processesWithoutMbco} processus sans responsable MBCO défini - Assigner des responsables pour chaque processus`
    );
  }

  // Recommandations générales
  recommendations.push(
    "Effectuer des tests de récupération trimestriels pour valider l&apos;efficacité des plans"
  );
  recommendations.push(
    "Mettre à jour la documentation BIA au moins semestriellement"
  );
  recommendations.push(
    "Former régulièrement les équipes sur les procédures de continuité"
  );

  // Recommandations spécifiques aux processus à risque
  if (stats.processesNeedingAttention > 0) {
    recommendations.push(
      `${stats.processesNeedingAttention} processus nécessitent une attention immédiate - Prioriser leur révision dans les 30 jours`
    );
  }

  return recommendations;
}

function identifyMajorRisks(
  stats: Omit<
    ProcessStats,
    "globalContinuityLevel" | "recommendations" | "majorRisks"
  >,
  processes: Process[]
) {
  const risks: {
    type: string;
    description: string;
    severity: "Critique" | "Élevé" | "Moyen";
    processes: string[];
  }[] = [];

  // Risque de processus critiques
  const criticalProcesses = processes.filter(
    (p) => p.criticality === "critical"
  );
  if (criticalProcesses.length > 0) {
    risks.push({
      type: "Processus Critiques Non Protégés",
      description: `${criticalProcesses.length} processus critiques identifiés avec des RTO potentiellement inadéquats. Une panne pourrait avoir un impact majeur sur l&apos;organisation.`,
      severity: "Critique",
      processes: criticalProcesses.map((p) => p.name),
    });
  }

  // Risque de RTO élevés
  const highRtoProcesses = processes.filter(
    (p) =>
      p.rto > 72 && (p.criticality === "critical" || p.criticality === "high")
  );
  if (highRtoProcesses.length > 0) {
    risks.push({
      type: "Temps de Récupération Excessifs",
      description: `${highRtoProcesses.length} processus critiques/importants avec RTO > 72h. Risque d&apos;impact prolongé en cas d&apos;incident.`,
      severity: "Élevé",
      processes: highRtoProcesses.map((p) => p.name),
    });
  }

  // Risque de concentration départementale
  const maxDeptProcesses = Math.max(...Object.values(stats.byDepartment));
  const totalProcesses = stats.total;
  if (maxDeptProcesses / totalProcesses > 0.5) {
    const concentratedDept = Object.keys(stats.byDepartment).find(
      (dept) => stats.byDepartment[dept] === maxDeptProcesses
    );
    risks.push({
      type: "Concentration de Risque Départementale",
      description: `Plus de 50% des processus analysés proviennent du département ${concentratedDept}. Risque de sur-dépendance.`,
      severity: "Moyen",
      processes: processes
        .filter((p) => p.department === concentratedDept)
        .map((p) => p.name),
    });
  }

  // Risque de perte de données
  const highRpoProcesses = processes.filter(
    (p) =>
      p.rpo > 24 && (p.criticality === "critical" || p.criticality === "high")
  );
  if (highRpoProcesses.length > 0) {
    risks.push({
      type: "Risque de Perte de Données",
      description: `${highRpoProcesses.length} processus critiques/importants avec RPO > 24h. Risque de perte significative de données.`,
      severity: "Élevé",
      processes: highRpoProcesses.map((p) => p.name),
    });
  }

  // Risque de sous-documentation
  if (totalProcesses < 5) {
    risks.push({
      type: "Couverture BIA Insuffisante",
      description:
        "Moins de 5 processus documentés. La couverture BIA est insuffisante pour une protection efficace de l&apos;organisation.",
      severity: "Élevé",
      processes: processes.map((p) => p.name),
    });
  }

  return risks;
}

export default async function BiaDashboardPage() {
  // Récupérer tous les processus
  const result = await getAllProcesses();

  if (!result.success) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erreur de chargement</h2>
          <p className="text-muted-foreground">
            Impossible de charger les données des processus BIA : {result.error}
          </p>
        </div>
      </div>
    );
  }

  const processes: Process[] = Array.isArray(result.data) ? result.data : [];
  const stats = calculateProcessStats(processes);

  // Récupérer les usines avec leurs statistiques
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
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  // Récupérer les rapports BIA récents
  const recentReports = await prisma.biaReport.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      author: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      factory: {
        select: {
          name: true,
        },
      },
    },
  });

  // Calculer les statistiques par usine
  const factoryStats = factories.map((factory) => {
    const factoryProcesses = processes.filter(
      (p) => p.factoryId === factory.id
    );
    const criticalProcesses = factoryProcesses.filter(
      (p) => p.criticality === "critical" || p.criticality === "high"
    );
    const avgRTO =
      factoryProcesses.length > 0
        ? factoryProcesses.reduce((sum, p) => sum + p.rto, 0) /
          factoryProcesses.length
        : 0;

    return {
      ...factory,
      processCount: factory._count.processes,
      reportCount: factory._count.biaReports,
      criticalProcessCount: criticalProcesses.length,
      avgRTO: Math.round(avgRTO),
    };
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête avec design cohérent plateforme */}
      <div className="relative overflow-hidden rounded-[16px] border border-[var(--border)] bg-[var(--bg-surface)] p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-5 mb-4">
              <div className="p-4 bg-[var(--accent)] rounded-2xl shadow-lg transition-transform hover:scale-105">
                <BarChart3 className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight text-[var(--text-primary)] mb-1">
                  Dashboard BIA
                </h1>
                <p className="text-lg text-[var(--text-muted)] font-bold">
                  Business Impact Analysis • <span className="text-[var(--accent)]">Vue Stratégique & Résilience</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)]/50`}
              >
                <Shield
                  className={`h-5 w-5 ${
                    stats.globalContinuityLevel.score >= 85
                      ? "text-emerald-500"
                      : stats.globalContinuityLevel.score >= 70
                      ? "text-blue-500"
                      : stats.globalContinuityLevel.score >= 55
                      ? "text-orange-500"
                      : "text-red-500"
                  }`}
                />
                <span
                  className={`font-bold text-sm uppercase tracking-wider ${
                    stats.globalContinuityLevel.score >= 85
                      ? "text-emerald-500"
                      : stats.globalContinuityLevel.score >= 70
                      ? "text-blue-500"
                      : stats.globalContinuityLevel.score >= 55
                      ? "text-orange-500"
                      : "text-red-500"
                  }`}
                >
                  Niveau: {stats.globalContinuityLevel.level}
                </span>
                <span className="text-xs font-bold text-[var(--text-muted)]">
                  ({stats.globalContinuityLevel.score}/100)
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="px-4 py-2 bg-muted/50 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4 text-primary" />
                <span className="tabular-nums">
                  {new Date().toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-[var(--accent)] text-white border-none px-3 py-1 font-bold">
                {stats.total} processus analysés
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Cartes de métriques principales - style plateforme */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Processus */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Processus
            </CardTitle>
            <div className="p-2 bg-[var(--accent)]/10 rounded-lg">
              <Building2 className="h-4 w-4 text-[var(--accent)]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {stats.total}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Processus analysés
            </p>
          </CardContent>
        </Card>

        {/* Niveau de Continuité */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Niveau Global
            </CardTitle>
            <div
              className={`p-2 rounded-lg ${
                stats.globalContinuityLevel.score >= 85
                  ? "bg-green-100 dark:bg-green-950/30"
                  : stats.globalContinuityLevel.score >= 70
                  ? "bg-blue-100 dark:bg-blue-950/30"
                  : stats.globalContinuityLevel.score >= 55
                  ? "bg-orange-100 dark:bg-orange-950/30"
                  : "bg-red-100 dark:bg-red-950/30"
              }`}
            >
              <Shield
                className={`h-4 w-4 ${
                  stats.globalContinuityLevel.score >= 85
                    ? "text-green-600 dark:text-green-400"
                    : stats.globalContinuityLevel.score >= 70
                    ? "text-blue-600 dark:text-blue-400"
                    : stats.globalContinuityLevel.score >= 55
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${
                stats.globalContinuityLevel.score >= 85
                  ? "text-green-600 dark:text-green-400"
                  : stats.globalContinuityLevel.score >= 70
                  ? "text-blue-600 dark:text-blue-400"
                  : stats.globalContinuityLevel.score >= 55
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {stats.globalContinuityLevel.score}/100
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              {stats.globalContinuityLevel.level}
            </p>
          </CardContent>
        </Card>

        {/* RTO Moyen */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              RTO Moyen
            </CardTitle>
            <div className="p-2 bg-[var(--accent)]/10 rounded-lg">
              <Clock className="h-4 w-4 text-[var(--accent)]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {stats.averageRTO}h
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Temps de récupération
            </p>
          </CardContent>
        </Card>

        {/* Processus Critiques */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Processus Critiques
            </CardTitle>
            <div className="p-2 bg-red-100 dark:bg-red-950/30 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {stats.byCriticality.critical}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Criticité maximale
            </p>
          </CardContent>
        </Card>

        {/* Attention Requise */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Attention Requise
            </CardTitle>
            <div className="p-2 bg-orange-100 dark:bg-orange-950/30 rounded-lg">
              <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {stats.processesNeedingAttention}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Processus à risque
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vue d'ensemble des métriques */}
      <BiaMetricsOverview stats={stats} />

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par criticité */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-[var(--accent)]/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-[var(--accent)]" />
              </div>
              <span className="font-bold text-[var(--text-primary)]">Répartition par Criticité</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <BiaCriticalityChart data={stats.byCriticality} />
          </CardContent>
        </Card>

        {/* Distribution RTO */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-[var(--accent)]/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-[var(--accent)]" />
              </div>
              <span className="font-bold text-[var(--text-primary)]">Distribution RTO</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <BiaRtoChart processes={processes} />
          </CardContent>
        </Card>
      </div>

      {/* Matrix and Department charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <BiaImpactMatrix matrix={stats.matrix} />
        </div>
        <div className="lg:col-span-2">
          {/* Répartition par département */}
          <Card className="hover:shadow-md transition-shadow h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-[var(--accent)]/10 rounded-lg">
                  <Users className="h-5 w-5 text-[var(--accent)]" />
                </div>
                <span className="font-bold text-[var(--text-primary)]">Processus par Département</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <BiaProcessChart departmentData={stats.byDepartment} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Table des processus critiques */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-red-100 dark:bg-red-950/30 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <span className="font-semibold">
              Processus Nécessitant une Attention Immédiate
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <BiaProcessTable
            processes={processes.filter(
              (p) => p.rto > 24 || p.criticality === "critical"
            )}
          />
        </CardContent>
      </Card>

      {/* Risques majeurs */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-950/30 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="font-semibold">Risques Majeurs Identifiés</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {stats.majorRisks.length > 0 ? (
            <div className="space-y-4">
              {stats.majorRisks.map((risk, index) => (
                <div
                  key={index}
                  className={`border-l-4 rounded-xl p-5 transition-all hover:shadow-md ${
                    risk.severity === "Critique"
                      ? "border-red-500 bg-red-500/5"
                      : risk.severity === "Élevé"
                      ? "border-orange-500 bg-orange-500/5"
                      : "border-yellow-500 bg-yellow-500/5"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1.5 rounded-lg ${
                          risk.severity === "Critique"
                            ? "bg-red-100 dark:bg-red-900/30"
                            : risk.severity === "Élevé"
                            ? "bg-orange-100 dark:bg-orange-900/30"
                            : "bg-yellow-100 dark:bg-yellow-900/30"
                        }`}
                      >
                        <AlertTriangle
                          className={`h-4 w-4 ${
                            risk.severity === "Critique"
                              ? "text-red-600 dark:text-red-400"
                              : risk.severity === "Élevé"
                              ? "text-orange-600 dark:text-orange-400"
                              : "text-yellow-600 dark:text-yellow-400"
                          }`}
                        />
                      </div>
                      <h4 className="font-semibold">{risk.type}</h4>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        risk.severity === "Critique"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          : risk.severity === "Élevé"
                          ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                      }`}
                    >
                      {risk.severity}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 pl-7">
                    {risk.description}
                  </p>
                  {risk.processes.length > 0 && (
                    <div className="pl-7">
                      <p className="text-xs font-medium mb-2 text-muted-foreground">
                        Processus concernés :
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {risk.processes.slice(0, 3).map((processName, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-muted text-xs rounded-full font-medium"
                          >
                            {processName}
                          </span>
                        ))}
                        {risk.processes.length > 3 && (
                          <span className="px-2.5 py-1 bg-muted text-xs rounded-full font-medium">
                            +{risk.processes.length - 3} autres
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex p-4 bg-green-100 dark:bg-green-950/30 rounded-full mb-4">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <p className="font-medium">Aucun risque majeur identifié</p>
              <p className="text-sm text-muted-foreground mt-2">
                Excellente gestion de la continuité
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommandations détaillées */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <span className="font-semibold">Recommandations Stratégiques</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {stats.recommendations.length > 0 ? (
            <div className="space-y-3">
              {stats.recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border hover:shadow-sm transition-shadow"
                >
                  <div className="flex-shrink-0 w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-relaxed pt-0.5">
                    {recommendation}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex p-4 bg-green-100 dark:bg-green-950/30 rounded-full mb-4">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <p className="font-medium">
                Toutes les recommandations sont appliquées
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Continuez votre excellent travail !
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Boutons d'exportation */}
      <BiaExportButtons stats={stats} />

      {/* Résumé global avec design premium */}
      {processes.length === 0 ? (
        <Card className="border-none shadow-xl">
          <CardContent className="text-center py-16">
            <div className="inline-flex p-6 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
              <Building2 className="h-16 w-16 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Aucun processus BIA</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Commencez par créer votre premier processus d&apos;analyse
              d&apos;impact métier pour améliorer la résilience de votre
              organisation.
            </p>
            <Link
              href="/bia/processes/new"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-medium"
            >
              <Building2 className="h-5 w-5 mr-2" />
              Créer un processus
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-none shadow-xl">
          <CardHeader className="bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950 dark:via-green-950 dark:to-teal-950">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-green-500 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent font-bold">
                Résumé Exécutif
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Situation Actuelle */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-bold text-lg">Situation Actuelle</h4>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    <span>
                      <span className="font-semibold">{stats.total}</span>{" "}
                      processus analysés au total
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    <span>
                      Niveau de continuité global :{" "}
                      <span
                        className={`font-bold ${
                          stats.globalContinuityLevel.score >= 85
                            ? "text-green-600 dark:text-green-400"
                            : stats.globalContinuityLevel.score >= 70
                            ? "text-blue-600 dark:text-blue-400"
                            : stats.globalContinuityLevel.score >= 55
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {stats.globalContinuityLevel.level}
                      </span>{" "}
                      ({stats.globalContinuityLevel.score}/100)
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    <span>
                      <span className="font-semibold">
                        {stats.byCriticality.critical +
                          stats.byCriticality.high}
                      </span>{" "}
                      processus de haute criticité
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    <span>
                      RTO moyen de{" "}
                      <span className="font-semibold">
                        {stats.averageRTO} heures
                      </span>
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    <span>
                      <span className="font-semibold">
                        {Object.keys(stats.byDepartment).length}
                      </span>{" "}
                      départements couverts
                    </span>
                  </li>
                </ul>
              </div>

              {/* Priorités Immédiates */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h4 className="font-bold text-lg">Priorités Immédiates</h4>
                </div>
                <ul className="space-y-3">
                  {stats.processesNeedingAttention > 0 && (
                    <li className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="font-medium">
                        {stats.processesNeedingAttention} processus nécessitent
                        une attention immédiate
                      </span>
                    </li>
                  )}
                  {stats.majorRisks.filter((r) => r.severity === "Critique")
                    .length > 0 && (
                    <li className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="font-medium">
                        {
                          stats.majorRisks.filter(
                            (r) => r.severity === "Critique"
                          ).length
                        }{" "}
                        risques critiques identifiés
                      </span>
                    </li>
                  )}
                  {stats.averageRTO > 24 && (
                    <li className="flex items-start gap-2 text-sm text-orange-600 dark:text-orange-400">
                      <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="font-medium">
                        Optimiser les temps de récupération (RTO moyen élevé)
                      </span>
                    </li>
                  )}
                  {stats.byCriticality.critical > 0 && (
                    <li className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                      <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="font-medium">
                        Réviser les plans de continuité pour les processus
                        critiques
                      </span>
                    </li>
                  )}
                  {stats.processesNeedingAttention === 0 &&
                    stats.majorRisks.filter((r) => r.severity === "Critique")
                      .length === 0 && (
                      <li className="flex items-start gap-2 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span className="font-medium">
                          Aucune priorité critique - Situation sous contrôle
                        </span>
                      </li>
                    )}
                </ul>
              </div>

              {/* Actions Recommandées */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-bold text-lg">Actions Recommandées</h4>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-blue-600 dark:text-blue-400">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="font-medium">
                      {stats.recommendations.length} recommandations générées
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Tests de récupération trimestriels</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Formation continue des équipes</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Mise à jour semestrielle de la documentation</span>
                  </li>
                  {stats.majorRisks.length > 0 && (
                    <li className="flex items-start gap-2 text-sm text-orange-600 dark:text-orange-400">
                      <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="font-medium">
                        Traitement des {stats.majorRisks.length} risques
                        identifiés
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Factories Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {factoryStats.map((factory) => (
          <Card key={factory.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Factory className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">
                      {factory.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Code: {factory.code}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={factory.isActive ? "default" : "secondary"}
                  className="text-xs"
                >
                  {factory.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {factory.manager && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                      {factory.manager.firstName} {factory.manager.lastName}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Processus</p>
                    <p className="text-2xl font-bold">{factory.processCount}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Rapports</p>
                    <p className="text-2xl font-bold">{factory.reportCount}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Critiques</p>
                    <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                      {factory.criticalProcessCount}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">RTO Moyen</p>
                    <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {factory.avgRTO.toFixed(1)}h
                    </p>
                  </div>
                </div>

                <Link
                  href={`/factories/${factory.id}`}
                  className="block w-full mt-3 text-center text-sm text-primary hover:underline"
                >
                  Voir les détails →
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Reports */}
      {recentReports.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>Rapports BIA Récents</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-primary/10 rounded">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">{report.name}</h4>
                        <Badge
                          variant={
                            report.status === "GENERATED"
                              ? "default"
                              : report.status === "DRAFT"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {report.status === "GENERATED"
                            ? "Complété"
                            : report.status === "DRAFT"
                            ? "En cours"
                            : "Archivé"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Factory className="h-3 w-3" />
                          {report.factory?.name || "N/A"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {report.author
                            ? `${report.author.firstName} ${report.author.lastName}`
                            : "N/A"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(report.createdAt).toLocaleDateString(
                            "fr-FR"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/bia/reports/${report.id}/view`}
                    className="text-sm text-primary hover:underline ml-4"
                  >
                    Voir →
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
