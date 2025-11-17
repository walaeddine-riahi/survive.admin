# Restructuration du Dashboard BIA - Documentation

## 🎯 Objectif

Transformer le dashboard BIA simple en une interface professionnelle, structurée et visuellement attrayante conforme aux standards ISO 22301/SMCA.

## ✅ Améliorations apportées

### 1. **En-tête du Dashboard** (`bia-dashboard-header.tsx`)

#### Fonctionnalités

- **Bandeau gradient** avec titre et score de résilience
- **Statistiques principales** (4 cartes KPI) :
  - Total Processus
  - Processus Critiques
  - RTO Moyen
  - MTPD Moyen
- **Statistiques secondaires** (3 cartes) :
  - RPO Moyen
  - Répartition par Criticité
  - Conformité ISO 22301

#### Calculs automatiques

```typescript
- Score de résilience (0-100)
- Niveau de résilience (Excellent/Bon/Moyen/Faible)
- Moyennes RTO/MTPD/RPO
- Distribution par criticité
```

#### Design

- Gradient bleu-indigo-violet pour l'en-tête
- Cartes avec bordure gauche colorée selon la métrique
- Icônes contextuelles (Building2, AlertCircle, Clock, TrendingUp)
- Hover effects avec ombre portée

---

### 2. **Vue d'ensemble** (`bia-overview.tsx`)

#### Sections

##### A. Alertes et Recommandations

- **Alertes critiques** : Processus critiques nécessitant attention
- **Avertissements** : Processus avec RTO < 24h
- **Succès** : Bonne répartition de la criticité

##### B. Top 5 - Processus Prioritaires

- Liste des 5 processus les plus critiques
- Badge de criticité (Critique/Élevé)
- Affichage du RTO
- Lien direct vers modification

##### C. Top 5 - RTO les plus Courts

- Classement des 5 processus avec RTO minimal
- Numérotation visuelle (1-5)
- Affichage RTO + MTPD
- Identification des processus urgents

##### D. Analyse par Département

- Statistiques par département :
  - Nombre total de processus
  - Processus critiques
  - Processus à haute criticité
  - RTO moyen
- **Barre de progression visuelle** indiquant le niveau de risque

##### E. Recommandations

- 3 recommandations automatiques :
  1. Prioriser les processus critiques
  2. Optimiser les RTO courts
  3. Tests réguliers avec simulations

#### Calculs

```typescript
// Statistiques par département
- Total processus
- Nombre de critiques
- Nombre de high
- RTO moyen

// Tri et classement
- Départements par criticité (desc)
- Processus par criticité puis RTO (asc)
- Processus par RTO uniquement (asc)
```

---

### 3. **Navigation par Onglets** (intégré dans `processes-client.tsx`)

#### Structure

```
┌─────────────────────────────────────────────┐
│  Vue d'ensemble | Processus | Analyses | Rapports │
└─────────────────────────────────────────────┘
```

#### Onglets

1. **Vue d'ensemble** (overview)

   - Composant `BiaOverview`
   - Alertes, Top 5, Analyses départements

2. **Processus** (processes)

   - Liste complète des processus
   - Filtres (recherche, usine, criticité, département)
   - Vue tableau/grille
   - Export CSV

3. **Analyses** (analytics)

   - Placeholder pour graphiques
   - À développer : charts avec Recharts

4. **Rapports** (reports)
   - Placeholder pour gestion des rapports
   - À développer : génération/export PDF

---

## 📐 Architecture des Composants

```
src/components/bia/
├── bia-dashboard-header.tsx      (En-tête avec statistiques)
├── bia-overview.tsx               (Vue d'ensemble détaillée)
├── bia-navigation-tabs.tsx        (Navigation - non utilisé finalement)
└── processes-client.tsx           (Composant principal avec onglets)
```

### Props et Types

#### `BiaDashboardHeader`

```typescript
type DashboardHeaderProps = {
  processes: Process[];
};

type Process = {
  criticality: "low" | "medium" | "high" | "critical";
  rto: number;
  mtpd: number;
  rpo: number;
};
```

#### `BiaOverview`

```typescript
type BiaOverviewProps = {
  processes: Process[];
};

type Process = {
  id: string;
  name: string;
  department: string;
  criticality: "low" | "medium" | "high" | "critical";
  rto: number;
  mtpd: number;
  rpo: number;
};
```

---

## 🎨 Design System

### Palette de Couleurs

```css
/* Criticité */
- Critique  : bg-red-100 text-red-800 border-red-200
- Élevé     : bg-orange-100 text-orange-800 border-orange-200
- Moyen     : bg-yellow-100 text-yellow-800 border-yellow-200
- Faible    : bg-green-100 text-green-800 border-green-200

/* Gradients */
- En-tête   : from-blue-600 via-indigo-600 to-purple-600
- Barre risque : from-red-500 via-orange-500 to-green-500

/* Cartes KPI */
- Bleu      : border-l-blue-500 (Total)
- Rouge     : border-l-red-500 (Critiques)
- Vert      : border-l-green-500 (RTO)
- Violet    : border-l-purple-500 (MTPD)
```

### Icônes (lucide-react)

```typescript
- Building2       : Processus, Départements
- AlertCircle     : Critiques, Alertes
- Clock           : RTO, MTPD, RPO
- TrendingUp      : MTPD, Tendances
- Shield          : Résilience
- Target          : Analyses
- CheckCircle2    : Succès, Recommandations
- AlertTriangle   : Avertissements
- ArrowRight      : Navigation
```

---

## 📊 Métriques et Calculs

### Score de Résilience

```typescript
const resilienceScore = Math.round(
  100 -
    (stats.critical * 10 + stats.high * 5 + stats.medium * 2 + stats.low * 1) /
      (stats.total || 1)
);
```

**Niveaux** :

- 80-100 : Excellent (vert)
- 60-79 : Bon (bleu)
- 40-59 : Moyen (jaune)
- 0-39 : Faible (rouge)

### Barre de Progression Département

```typescript
const riskPercentage = Math.min(
  100,
  ((stats.critical * 2 + stats.high) / stats.total) * 100
);
```

---

## 🚀 Utilisation

### Intégration dans la page BIA

Le fichier `src/app/(app)/bia/page.tsx` reste inchangé. Il transmet simplement les données :

```tsx
export default async function BIAPage() {
  const result = await getAllProcesses();
  const processes = Array.isArray(result.data) ? result.data : [];
  const factories = await prisma.factory.findMany({ ... });

  return <ProcessesClient initialProcesses={processes} factories={factories} />;
}
```

### Composant ProcessesClient

```tsx
export function ProcessesClient({ initialProcesses, factories }) {
  return (
    <div className="space-y-6">
      <BiaDashboardHeader processes={processes} />

      <Tabs defaultValue="overview">
        <TabsList> ... </TabsList>

        <TabsContent value="overview">
          <BiaOverview processes={processes} />
        </TabsContent>

        <TabsContent value="processes">
          {/* Liste des processus avec filtres */}
        </TabsContent>

        {/* Autres onglets */}
      </Tabs>
    </div>
  );
}
```

---

## 🔄 Fonctionnalités Conservées

- ✅ Filtres (recherche, usine, criticité, département)
- ✅ Vue tableau/grille
- ✅ Export CSV
- ✅ Liens vers modification processus
- ✅ Impact Analysis Button
- ✅ Bouton "Nouveau processus"
- ✅ Rafraîchissement manuel

---

## 📈 Fonctionnalités Futures

### Onglet Analyses

- [ ] Graphiques Recharts :
  - Distribution par criticité (Pie chart)
  - Évolution RTO/MTPD (Line chart)
  - Comparaison départements (Bar chart)
- [ ] Heatmap criticité x département
- [ ] Timeline des mises à jour

### Onglet Rapports

- [ ] Liste des rapports générés
- [ ] Génération PDF automatique
- [ ] Export Excel avancé
- [ ] Envoi par email
- [ ] Historique des versions

### Améliorations UX

- [ ] Animations Framer Motion
- [ ] Tooltips informatifs
- [ ] Dark mode support
- [ ] Responsive mobile amélioré
- [ ] Notifications temps réel

---

## ⚠️ Notes Techniques

### Style Inline Autorisé

Le fichier `bia-overview.tsx` utilise un style inline pour la barre de progression (ligne 297) :

```typescript
style={{ width: `${percentage}%` }}
```

**Raison** : Calcul dynamique impossible en CSS pur. C'est une exception acceptable.

### Performance

- Composants client-side (`"use client"`)
- Calculs effectués côté client
- Pas de re-fetch inutile
- Memoization possible si nécessaire

### Accessibilité

- Tous les icônes ont des labels sémantiques
- Contraste couleurs conforme WCAG
- Navigation clavier supportée (tabs)
- Aria labels sur les boutons

---

## 🎯 Checklist de Validation

- [x] En-tête avec gradient et score résilience
- [x] 4 cartes KPI principales
- [x] 3 cartes KPI secondaires
- [x] Navigation par onglets (4 onglets)
- [x] Vue d'ensemble avec alertes
- [x] Top 5 processus critiques
- [x] Top 5 RTO courts
- [x] Analyse par département
- [x] Recommandations automatiques
- [x] Liste processus avec filtres
- [x] Export CSV fonctionnel
- [x] Design responsive
- [x] Pas d'erreurs TypeScript (sauf 1 style inline accepté)

---

## 📚 Références

- **Standards** : ISO 22301, ISO 27001, SMCA
- **UI Library** : shadcn/ui
- **Icons** : Lucide React
- **Framework** : Next.js 15, React 19
- **Styling** : Tailwind CSS 3

---

## 💡 Conseils d'Utilisation

1. **Navigation** : Utilisez les onglets pour accéder rapidement aux différentes vues
2. **Alertes** : Consultez régulièrement la vue d'ensemble pour les recommandations
3. **Filtres** : Combinez plusieurs filtres pour des analyses ciblées
4. **Export** : Exportez en CSV pour analyses Excel/Google Sheets
5. **Score** : Surveillez le score de résilience comme KPI principal

---

## 🔧 Maintenance

### Ajout d'une nouvelle statistique

1. Modifier `BiaDashboardHeader.tsx`
2. Ajouter la carte dans la grille
3. Calculer la métrique dans `stats`

### Ajout d'un nouvel onglet

1. Ajouter `TabsTrigger` dans `processes-client.tsx`
2. Créer `TabsContent` correspondant
3. Créer le composant dédié si nécessaire

### Modification des seuils d'alerte

Modifier les conditions dans `BiaOverview.tsx` :

```typescript
if (criticalCount > 0) { ... }
if (lowRtoCount > 5) { ... }
```

---

**Date de création** : 17 novembre 2025  
**Version** : 1.0  
**Auteur** : GitHub Copilot  
**Status** : ✅ Implémenté et fonctionnel
