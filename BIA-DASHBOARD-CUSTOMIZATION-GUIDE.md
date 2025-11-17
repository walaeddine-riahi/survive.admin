# Guide de Personnalisation - Dashboard BIA

## 🎨 Personnalisation Rapide

### 1. Modifier les Seuils de Score de Résilience

**Fichier** : `src/components/bia/bia-dashboard-header.tsx`

```typescript
// Ligne 38-46 : Modifier les seuils
const resilienceLevel =
  resilienceScore >= 90 // ← Changez 80 à 90 pour être plus strict
    ? { label: "Excellent", color: "text-green-600", bg: "bg-green-100" }
    : resilienceScore >= 70 // ← Changez 60 à 70
    ? { label: "Bon", color: "text-blue-600", bg: "bg-blue-100" }
    : resilienceScore >= 50 // ← Changez 40 à 50
    ? { label: "Moyen", color: "text-yellow-600", bg: "bg-yellow-100" }
    : { label: "Faible", color: "text-red-600", bg: "bg-red-100" };
```

### 2. Changer les Couleurs du Gradient d'En-tête

**Fichier** : `src/components/bia/bia-dashboard-header.tsx`

```typescript
// Ligne 51 : Modifier le gradient
<div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-8 text-white">
// Thèmes alternatifs :
// - Sombre : from-gray-800 via-gray-900 to-black
// - Chaud   : from-red-600 via-pink-600 to-purple-600
// - Frais   : from-emerald-500 via-green-500 to-lime-500
```

### 3. Modifier le Nombre d'Éléments dans les Top 5

**Fichier** : `src/components/bia/bia-overview.tsx`

```typescript
// Ligne 53-54 : Changer de Top 5 à Top 10
.slice(0, 10)  // ← Changez 5 à 10

// Ligne 59 : Même chose pour RTO courts
.slice(0, 10)  // ← Changez 5 à 10

// N'oubliez pas de changer le titre :
// "Top 10 - Processus Prioritaires"
```

### 4. Personnaliser les Seuils d'Alerte

**Fichier** : `src/components/bia/bia-overview.tsx`

```typescript
// Ligne 69 : RTO court threshold
if (lowRtoCount > 10) {
  // ← Changez 5 à 10
  alerts.push({
    type: "warning",
    message: `${lowRtoCount} processus avec RTO < 24h`,
    // ...
  });
}

// Ajouter une nouvelle alerte pour MTPD
if (processes.filter((p) => p.mtpd < 48).length > 5) {
  alerts.push({
    type: "warning",
    message: "Plusieurs processus avec MTPD très court (< 48h)",
    icon: Clock,
    color: "text-orange-600",
    bg: "bg-orange-50",
  });
}
```

### 5. Ajouter une Nouvelle Carte KPI

**Fichier** : `src/components/bia/bia-dashboard-header.tsx`

```typescript
// Après la ligne 147 (dernière carte), ajoutez :

<Card className="border-l-4 border-l-cyan-500 hover:shadow-md transition-shadow">
  <CardContent className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">
          Départements
        </p>
        <p className="text-3xl font-bold">
          {new Set(processes.map((p) => p.department)).size}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Départements couverts
        </p>
      </div>
      <div className="h-12 w-12 rounded-full bg-cyan-100 flex items-center justify-center">
        <Building2 className="h-6 w-6 text-cyan-600" />
      </div>
    </div>
  </CardContent>
</Card>
```

**Important** : Changez aussi la grille :

```typescript
// Ligne 56 : Changez de 4 à 5 colonnes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
```

### 6. Personnaliser les Onglets

**Fichier** : `src/components/bia/processes-client.tsx`

#### Ajouter un onglet "Paramètres"

```typescript
// Après l'onglet "reports", ajoutez :
<TabsTrigger
  value="settings"
  className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
>
  <Settings className="h-4 w-4 mr-2" />
  <span className="hidden sm:inline">Paramètres</span>
  <span className="sm:hidden">Config</span>
</TabsTrigger>

// Et le contenu :
<TabsContent value="settings" className="mt-6">
  <Card>
    <CardHeader>
      <CardTitle>Paramètres BIA</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Seuil RTO court</label>
          <Input type="number" defaultValue={24} />
        </div>
        {/* Autres paramètres */}
      </div>
    </CardContent>
  </Card>
</TabsContent>
```

N'oubliez pas d'importer `Settings` :

```typescript
import { ..., Settings } from "lucide-react";
```

### 7. Modifier l'Export CSV

**Fichier** : `src/components/bia/processes-client.tsx`

```typescript
// Ligne 149 : Ajouter/retirer des colonnes
const csv = [
  [
    "Nom",
    "Département",
    "Localisation",
    "Criticité",
    "RTO",
    "RPO",
    "MTPD",
    "MBCO",
    "Impact",
  ],
  // ↑ Ajoutez "MBCO" et "Impact"

  ...filteredProcesses.map((p) => [
    p.name,
    p.department,
    p.location,
    p.criticality,
    p.rto.toString(),
    p.rpo.toString(),
    p.mtpd.toString(),
    p.mbco, // ← Ajoutez
    p.impact, // ← Ajoutez
  ]),
];
```

---

## 🎯 Personnalisations Avancées

### 8. Changer la Formule de Score de Résilience

**Fichier** : `src/components/bia/bia-dashboard-header.tsx`

**Formule actuelle** (ligne 31-35) :

```typescript
const resilienceScore = Math.round(
  100 -
    (stats.critical * 10 + stats.high * 5 + stats.medium * 2 + stats.low * 1) /
      (stats.total || 1)
);
```

**Formule alternative 1** : Pénaliser davantage les critiques

```typescript
const resilienceScore = Math.round(
  100 -
    (stats.critical * 15 + stats.high * 7 + stats.medium * 3 + stats.low * 1) /
      (stats.total || 1)
);
```

**Formule alternative 2** : Basée sur le pourcentage

```typescript
const resilienceScore = Math.round(
  100 *
    (1 -
      (stats.critical +
        stats.high * 0.7 +
        stats.medium * 0.4 +
        stats.low * 0.1) /
        stats.total)
);
```

**Formule alternative 3** : Intégrer RTO/MTPD

```typescript
const avgRtoScore = Math.max(0, 100 - stats.avgRto / 2);
const criticalityScore =
  100 * (1 - (stats.critical + stats.high * 0.5) / stats.total);
const resilienceScore = Math.round((avgRtoScore + criticalityScore) / 2);
```

### 9. Personnaliser la Barre de Progression Département

**Fichier** : `src/components/bia/bia-overview.tsx`

**Actuel** (ligne 288-299) :

```typescript
<div className="h-2 bg-muted rounded-full overflow-hidden">
  <div
    className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-green-500"
    style={{ width: `${percentage}%` }}
  />
</div>
```

**Alternative 1** : Barre de couleur unique selon risque

```typescript
<div className="h-2 bg-muted rounded-full overflow-hidden">
  <div
    className={`h-full ${
      percentage > 70
        ? "bg-red-500"
        : percentage > 40
        ? "bg-orange-500"
        : "bg-green-500"
    }`}
    style={{ width: `${percentage}%` }}
  />
</div>
```

**Alternative 2** : Barre striée

```typescript
<div className="h-2 bg-muted rounded-full overflow-hidden">
  <div
    className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-green-500"
    style={{
      width: `${percentage}%`,
      backgroundImage:
        "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px)",
    }}
  />
</div>
```

### 10. Ajouter des Graphiques avec Recharts

**Installation** :

```bash
npm install recharts
```

**Fichier** : Créer `src/components/bia/bia-analytics-charts.tsx`

```typescript
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

type Process = {
  criticality: "low" | "medium" | "high" | "critical";
};

type AnalyticsChartsProps = {
  processes: Process[];
};

const COLORS = {
  critical: "#dc2626",
  high: "#ea580c",
  medium: "#ca8a04",
  low: "#16a34a",
};

export function BiaAnalyticsCharts({ processes }: AnalyticsChartsProps) {
  const data = [
    {
      name: "Critique",
      value: processes.filter((p) => p.criticality === "critical").length,
      color: COLORS.critical,
    },
    {
      name: "Élevé",
      value: processes.filter((p) => p.criticality === "high").length,
      color: COLORS.high,
    },
    {
      name: "Moyen",
      value: processes.filter((p) => p.criticality === "medium").length,
      color: COLORS.medium,
    },
    {
      name: "Faible",
      value: processes.filter((p) => p.criticality === "low").length,
      color: COLORS.low,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribution par Criticité</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

**Utilisation** dans `processes-client.tsx` :

```typescript
import { BiaAnalyticsCharts } from "@/components/bia/bia-analytics-charts";

// Dans l'onglet Analytics :
<TabsContent value="analytics" className="mt-6">
  <BiaAnalyticsCharts processes={processes} />
</TabsContent>;
```

---

## 🔧 Personnalisations Fonctionnelles

### 11. Filtrer par Plage de RTO

**Fichier** : `src/components/bia/processes-client.tsx`

Ajoutez un state pour la plage RTO :

```typescript
const [rtoRange, setRtoRange] = useState<[number, number]>([0, 1000]);
```

Ajoutez le filtre :

```typescript
const filteredProcesses = processes.filter((process) => {
  // ... autres filtres existants
  const matchesRtoRange =
    process.rto >= rtoRange[0] && process.rto <= rtoRange[1];

  return (
    matchesSearch &&
    matchesCriticality &&
    matchesDepartment &&
    matchesFactory &&
    matchesRtoRange
  );
});
```

Ajoutez le composant dans l'UI :

```typescript
<div className="flex items-center gap-2">
  <label className="text-sm font-medium">RTO:</label>
  <Input
    type="number"
    placeholder="Min"
    className="w-20"
    value={rtoRange[0]}
    onChange={(e) => setRtoRange([Number(e.target.value), rtoRange[1]])}
  />
  <span>-</span>
  <Input
    type="number"
    placeholder="Max"
    className="w-20"
    value={rtoRange[1]}
    onChange={(e) => setRtoRange([rtoRange[0], Number(e.target.value)])}
  />
</div>
```

### 12. Trier les Processus

Ajoutez un state pour le tri :

```typescript
const [sortBy, setSortBy] = useState<"name" | "rto" | "criticality">("name");
const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
```

Ajoutez la fonction de tri :

```typescript
const sortedProcesses = [...filteredProcesses].sort((a, b) => {
  let comparison = 0;

  if (sortBy === "name") {
    comparison = a.name.localeCompare(b.name);
  } else if (sortBy === "rto") {
    comparison = a.rto - b.rto;
  } else if (sortBy === "criticality") {
    const critOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    comparison = critOrder[a.criticality] - critOrder[b.criticality];
  }

  return sortOrder === "asc" ? comparison : -comparison;
});
```

Ajoutez le sélecteur :

```typescript
<Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Trier par" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="name">Nom</SelectItem>
    <SelectItem value="rto">RTO</SelectItem>
    <SelectItem value="criticality">Criticité</SelectItem>
  </SelectContent>
</Select>
```

---

## 🌐 Internationalisation (i18n)

### 13. Préparer pour Multilingue

Créez un fichier de traductions :

**Fichier** : `src/i18n/bia.ts`

```typescript
export const translations = {
  fr: {
    dashboard: {
      title: "Tableau de Bord BIA",
      subtitle: "Business Impact Analysis - Vue d'ensemble",
      resilience: "Résilience",
      score: "Score",
    },
    stats: {
      totalProcesses: "Total Processus",
      critical: "Critiques",
      avgRto: "RTO Moyen",
      avgMtpd: "MTPD Moyen",
    },
    tabs: {
      overview: "Vue d'ensemble",
      processes: "Processus",
      analytics: "Analyses",
      reports: "Rapports",
    },
  },
  en: {
    dashboard: {
      title: "BIA Dashboard",
      subtitle: "Business Impact Analysis - Overview",
      resilience: "Resilience",
      score: "Score",
    },
    stats: {
      totalProcesses: "Total Processes",
      critical: "Critical",
      avgRto: "Avg RTO",
      avgMtpd: "Avg MTPD",
    },
    tabs: {
      overview: "Overview",
      processes: "Processes",
      analytics: "Analytics",
      reports: "Reports",
    },
  },
};
```

Utilisez dans les composants :

```typescript
import { translations } from "@/i18n/bia";

const locale = "fr"; // ou récupérez depuis un context
const t = translations[locale];

// Dans le JSX :
<h1>{t.dashboard.title}</h1>
<p>{t.dashboard.subtitle}</p>
```

---

## 💡 Conseils de Performance

### 14. Memoization des Calculs

**Fichier** : `src/components/bia/bia-dashboard-header.tsx`

```typescript
import { useMemo } from "react";

export function BiaDashboardHeader({ processes }: DashboardHeaderProps) {
  // Memoize les statistiques pour éviter recalcul à chaque render
  const stats = useMemo(
    () => ({
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
    }),
    [processes]
  );

  // ... reste du composant
}
```

### 15. Lazy Loading des Onglets

```typescript
import dynamic from "next/dynamic";

const BiaOverview = dynamic(() =>
  import("@/components/bia/bia-overview").then((m) => ({
    default: m.BiaOverview,
  }))
);
const BiaAnalyticsCharts = dynamic(
  () => import("@/components/bia/bia-analytics-charts")
);

// Les composants seront chargés seulement quand l'onglet est activé
```

---

## 🎨 Thèmes Alternatifs Complets

### Thème Sombre

```typescript
// bia-dashboard-header.tsx - Ligne 51
<div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-gray-800 via-gray-900 to-black p-8 text-white">

// Cartes KPI - Remplacez les bordures
border-l-blue-400    → border-l-blue-600
border-l-red-400     → border-l-red-600
border-l-green-400   → border-l-green-600
border-l-purple-400  → border-l-purple-600

// Backgrounds
bg-blue-100  → bg-blue-900/20
bg-red-100   → bg-red-900/20
bg-green-100 → bg-green-900/20
```

### Thème Corporate (Neutre)

```typescript
// En-tête
bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900

// KPI colors
border-l-slate-500
border-l-slate-600
border-l-slate-700
border-l-slate-800

// Icônes backgrounds
bg-slate-100
text-slate-600
```

---

**Date** : 17 novembre 2025  
**Auteur** : GitHub Copilot  
**Version** : 1.0
