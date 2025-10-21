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
} from "lucide-react";
import { BiaProcessChart } from "@/components/bia/bia-process-chart";
import { BiaCriticalityChart } from "@/components/bia/bia-criticality-chart";
import { BiaRtoChart } from "@/components/bia/bia-rto-chart";
import { BiaMetricsOverview } from "@/components/bia/bia-metrics-overview";
import { BiaProcessTable } from "@/components/bia/bia-process-table";
import { BiaExportButtons } from "@/components/bia/bia-export-buttons";
import Link from "next/link";

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
  };

  if (processes.length === 0) return stats;

  let totalRTO = 0;
  let totalRPO = 0;
  let totalMTPD = 0;

  processes.forEach((process) => {
    // Criticité
    stats.byCriticality[process.criticality]++;

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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard BIA</h1>
          <p className="text-muted-foreground">
            Vue d&apos;ensemble de l&apos;analyse d&apos;impact métier
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Dernière mise à jour :{" "}
          {new Date().toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

      {/* Cartes de métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Processus
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Processus analysés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Niveau de Continuité Global
            </CardTitle>
            <Shield
              className={`h-4 w-4 text-${stats.globalContinuityLevel.color}-500`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold text-${stats.globalContinuityLevel.color}-600`}
            >
              {stats.globalContinuityLevel.score}/100
            </div>
            <p
              className={`text-xs text-${stats.globalContinuityLevel.color}-600 font-medium`}
            >
              {stats.globalContinuityLevel.level}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RTO Moyen</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRTO}h</div>
            <p className="text-xs text-muted-foreground">
              Temps de récupération
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Processus Critiques
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.byCriticality.critical}
            </div>
            <p className="text-xs text-muted-foreground">Criticité maximale</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Attention Requise
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.processesNeedingAttention}
            </div>
            <p className="text-xs text-muted-foreground">Processus à risque</p>
          </CardContent>
        </Card>
      </div>

      {/* Vue d'ensemble des métriques */}
      <BiaMetricsOverview stats={stats} />

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par criticité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Répartition par Criticité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BiaCriticalityChart data={stats.byCriticality} />
          </CardContent>
        </Card>

        {/* Distribution RTO */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Distribution RTO
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BiaRtoChart processes={processes} />
          </CardContent>
        </Card>
      </div>

      {/* Répartition par département */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Processus par Département
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BiaProcessChart departmentData={stats.byDepartment} />
        </CardContent>
      </Card>

      {/* Table des processus critiques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Processus Nécessitant une Attention Immédiate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BiaProcessTable
            processes={processes.filter(
              (p) => p.rto > 24 || p.criticality === "critical"
            )}
          />
        </CardContent>
      </Card>

      {/* Risques majeurs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Risques Majeurs Identifiés
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.majorRisks.length > 0 ? (
            <div className="space-y-4">
              {stats.majorRisks.map((risk, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm">{risk.type}</h4>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        risk.severity === "Critique"
                          ? "bg-red-100 text-red-800"
                          : risk.severity === "Élevé"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {risk.severity}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {risk.description}
                  </p>
                  {risk.processes.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-1">
                        Processus concernés :
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {risk.processes.slice(0, 3).map((processName, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-xs rounded"
                          >
                            {processName}
                          </span>
                        ))}
                        {risk.processes.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-xs rounded">
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
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground">
                Aucun risque majeur identifié
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommandations détaillées */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Recommandations Détaillées
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recommendations.length > 0 ? (
            <div className="space-y-3">
              {stats.recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                    {index + 1}
                  </div>
                  <p className="text-sm text-blue-800">{recommendation}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground">
                Toutes les recommandations sont appliquées
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Boutons d'exportation */}
      <BiaExportButtons stats={stats} />

      {/* Résumé global */}
      {processes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun processus BIA</h3>
            <p className="text-muted-foreground mb-4">
              Commencez par créer votre premier processus d&apos;analyse
              d&apos;impact métier.
            </p>
            <Link
              href="/bia/processes/new"
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Créer un processus
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Résumé Exécutif
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Situation Actuelle :</h4>
                <ul className="space-y-1 text-sm">
                  <li>• {stats.total} processus analysés au total</li>
                  <li>
                    • Niveau de continuité global :{" "}
                    <span
                      className={`font-bold text-${stats.globalContinuityLevel.color}-600`}
                    >
                      {stats.globalContinuityLevel.level}
                    </span>{" "}
                    ({stats.globalContinuityLevel.score}/100)
                  </li>
                  <li>
                    • {stats.byCriticality.critical + stats.byCriticality.high}{" "}
                    processus de haute criticité
                  </li>
                  <li>• RTO moyen de {stats.averageRTO} heures</li>
                  <li>
                    • {Object.keys(stats.byDepartment).length} départements
                    couverts
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Priorités Immédiates :</h4>
                <ul className="space-y-1 text-sm">
                  {stats.processesNeedingAttention > 0 && (
                    <li className="text-red-600">
                      • {stats.processesNeedingAttention} processus nécessitent
                      une attention immédiate
                    </li>
                  )}
                  {stats.majorRisks.filter((r) => r.severity === "Critique")
                    .length > 0 && (
                    <li className="text-red-600">
                      •{" "}
                      {
                        stats.majorRisks.filter(
                          (r) => r.severity === "Critique"
                        ).length
                      }{" "}
                      risques critiques identifiés
                    </li>
                  )}
                  {stats.averageRTO > 24 && (
                    <li className="text-orange-600">
                      • Optimiser les temps de récupération (RTO moyen élevé)
                    </li>
                  )}
                  {stats.byCriticality.critical > 0 && (
                    <li className="text-red-600">
                      • Réviser les plans de continuité pour les processus
                      critiques
                    </li>
                  )}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Actions Recommandées :</h4>
                <ul className="space-y-1 text-sm">
                  <li className="text-blue-600">
                    • {stats.recommendations.length} recommandations générées
                  </li>
                  <li className="text-green-600">
                    • Tests de récupération trimestriels
                  </li>
                  <li className="text-green-600">
                    • Formation continue des équipes
                  </li>
                  <li className="text-green-600">
                    • Mise à jour semestrielle de la documentation
                  </li>
                  {stats.majorRisks.length > 0 && (
                    <li className="text-orange-600">
                      • Traitement des {stats.majorRisks.length} risques
                      identifiés
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
