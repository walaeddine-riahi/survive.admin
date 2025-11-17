# Génération de Rapports BIA depuis les Processus

## Vue d'ensemble

Nouvelle fonctionnalité permettant de générer automatiquement des rapports BIA (Business Impact Analysis) à partir des processus existants dans le système.

## Emplacement

**Page** : `/bia/reports` - Onglet "Générer depuis Processus"

## Fonctionnalités

### 1. Sélection de processus

- **Filtrage par usine** : Sélectionner une usine spécifique ou voir tous les processus
- **Recherche** : Rechercher par nom, département ou description
- **Affichage détaillé** :
  - Nom du processus
  - Description
  - Département
  - Usine associée
  - Niveau de criticité (avec badge coloré)
  - RTO (Recovery Time Objective)

### 2. Génération de rapport

Une fois un processus sélectionné :

1. **Nom du rapport** : Généré automatiquement (modifiable)
   - Format : `Rapport BIA - {Nom du processus}`
2. **Description** : Générée automatiquement (modifiable)

   - Format : `Rapport d'analyse d'impact métier pour le processus {Nom} ({Département})`

3. **Contenu du rapport** :
   - ✅ Informations générales du processus
   - ✅ Métriques (RTO, MTPD, RPO, MBCO)
   - ✅ Analyse des impacts (financier, opérationnel, réputation)
   - ✅ Périmètre et dépendances
   - ✅ Ressources critiques (9 catégories)
   - ✅ Analyse des risques
   - ✅ Recommandations automatiques

## Architecture Technique

### Composants

#### 1. `ProcessReportGenerator` Component

**Fichier** : `src/components/bia/process-report-generator.tsx`

**Responsabilités** :

- Afficher la liste des processus disponibles
- Filtrer et rechercher les processus
- Gérer la sélection d'un processus
- Configurer et déclencher la génération du rapport

**Props** :

```typescript
{
  factories: Factory[]  // Liste des usines pour le filtrage
}
```

#### 2. Server Action : `createBiaReportFromProcess`

**Fichier** : `src/actions/bia/bia-report-actions.ts`

**Signature** :

```typescript
async function createBiaReportFromProcess(
  processId: string,
  reportName: string,
  reportDescription?: string
): Promise<{
  success: boolean;
  data?: BiaReport;
  error?: string;
}>;
```

**Traitement** :

1. Récupère le processus complet avec toutes ses données
2. Parse les champs JSON (9 catégories de ressources)
3. Calcule les métriques automatiquement :
   - Niveau de continuité (0-100%)
   - Nombre de risques
   - Nombre de recommandations
4. Génère des recommandations intelligentes
5. Crée le rapport dans la base de données

#### 3. API Route : GET `/api/bia/processes`

**Fichier** : `src/app/api/bia/processes/route.ts`

**Query Parameters** :

- `factoryId` (optionnel) : Filtrer par usine
- `limit` (optionnel, défaut: 100) : Nombre max de processus

**Response** :

```json
{
  "success": true,
  "processes": [
    {
      "id": "...",
      "name": "...",
      "description": "...",
      "department": "...",
      "criticality": "critical|high|medium|low",
      "rto": 4,
      "mtpd": 8,
      "factory": {
        "id": "...",
        "name": "..."
      },
      "createdAt": "..."
    }
  ]
}
```

## Structure du Rapport Généré

### Données du Rapport

```typescript
{
  process: {
    // Informations générales
    id, name, description, department, location, criticality,
    processOwner, ownerRole, ownerEmail, ownerPhone,
    factory: { id, name }
  },

  metrics: {
    rto, mtpd, rpo, mbco,
    continuityLevel: number,        // 0-100%
    continuityLevelText: string     // Excellent|Bon|Moyen|Faible
  },

  impacts: {
    financial: string,
    operational: string,
    reputation: string,
    operationalCapacity: string
  },

  scope: {
    mainFunctionality: string,
    productDependencies: string,
    interServiceDependencies: string
  },

  resources: {
    activitesCritiques: [],          // Activités critiques
    fournisseursExternes: [],        // Fournisseurs
    obligationsLegales: [],          // Obligations légales
    systemesInformatiques: [],       // Systèmes IT
    infrastructuresPhysiques: [],    // Infrastructure
    rolesPersonnel: [],              // Personnel
    equipementsIndustriels: [],      // Équipements industriels
    equipementsBureautiques: [],     // Équipements bureautiques
    documentationsCritiques: []      // Documentation
  },

  analysis: {
    riskCount: number,
    recommendationCount: number,
    criticalActivities: number,
    criticalSuppliers: number,
    criticalSystems: number,
    criticalInfrastructure: number
  },

  recommendations: [
    {
      priority: "high" | "medium" | "low",
      category: string,
      title: string,
      description: string
    }
  ]
}
```

### Calcul du Niveau de Continuité

```typescript
let continuityLevel = 50;

if (criticality === "critical" && rto <= 4) {
  continuityLevel = 90;
} else if (criticality === "high" && rto <= 8) {
  continuityLevel = 75;
} else if (criticality === "medium") {
  continuityLevel = 60;
}

// Texte correspondant
continuityLevel >= 80 ? "Excellent"
  : >= 60 ? "Bon"
  : >= 40 ? "Moyen"
  : "Faible"
```

## Recommandations Automatiques

Le système génère automatiquement des recommandations basées sur :

### 1. Criticité et RTO

- ❌ Processus critique SANS systèmes de sauvegarde → **Priorité HAUTE**
- ❌ RTO > 4h pour processus critique → **Priorité HAUTE**

### 2. Travail à distance

- ❌ Impossible de travailler à distance (processus non-low) → **Priorité MOYENNE**

### 3. Fournisseurs

- ❌ Fournisseurs sans plan de continuité → **Priorité HAUTE**
  - Liste des fournisseurs concernés

### 4. Systèmes informatiques

- ❌ Systèmes sans sauvegardes → **Priorité HAUTE**
  - Liste des systèmes concernés

### 5. Activités critiques

- ⚠️ Plus de 3 activités critiques → **Priorité MOYENNE**
  - Suggère une revue de classification

### 6. Infrastructure

- ❌ Pas d'infrastructure alternative (processus non-low) → **Priorité MOYENNE**

## Métadonnées du Rapport

```typescript
{
  format: "HTML",
  status: "GENERATED",
  totalProcesses: 1,
  continuityLevel: calculated,
  continuityLevelText: calculated,
  riskCount: calculated,
  recommendationCount: calculated,
  fileName: "{ProcessName}_BIA_Report.html",
  mimeType: "text/html",
  generationParams: {
    processId: string,
    generatedAt: ISO date
  },
  includedProcessIds: [processId],
  tags: [department, criticality, factoryName],
  category: "Rapport de processus",
  factoryId: string,
  authorId: string,
  shareToken: unique_token
}
```

## Utilisation

### Étape 1 : Naviguer vers les rapports

```
/bia/reports → Onglet "Générer depuis Processus"
```

### Étape 2 : Filtrer et rechercher

- Sélectionner une usine (optionnel)
- Rechercher par mot-clé (optionnel)

### Étape 3 : Sélectionner un processus

- Cliquer sur un processus dans la liste
- Le processus sélectionné est mis en évidence avec une coche ✓

### Étape 4 : Configurer le rapport

- Vérifier/modifier le nom du rapport
- Vérifier/modifier la description
- Cliquer sur "Générer le rapport"

### Étape 5 : Consultation

- Redirection automatique vers le rapport généré
- Possibilité de partager, exporter, archiver

## Avantages

### ✅ Automatisation

- Génération instantanée sans saisie manuelle
- Calcul automatique des métriques
- Recommandations intelligentes

### ✅ Cohérence

- Format standardisé pour tous les rapports
- Données synchronisées avec les processus
- Méthodologie uniforme

### ✅ Productivité

- Réduction du temps de création d'un rapport de plusieurs heures à quelques secondes
- Focus sur l'analyse plutôt que la compilation de données

### ✅ Qualité

- Analyse exhaustive de 9 catégories de ressources
- Recommandations basées sur les meilleures pratiques BIA
- Indicateurs de risque calculés automatiquement

## Évolutions Futures

### À court terme

- [ ] Export PDF du rapport généré
- [ ] Personnalisation du template de rapport
- [ ] Comparaison entre plusieurs processus

### À moyen terme

- [ ] Analyse IA avancée des données
- [ ] Génération de graphiques et visualisations
- [ ] Planification de mise à jour automatique des rapports

### À long terme

- [ ] Simulation de scénarios d'impact
- [ ] Recommandations ML personnalisées
- [ ] Intégration avec outils de gestion de crise

## Fichiers Modifiés/Créés

### Créés

1. `src/components/bia/process-report-generator.tsx` (386 lignes)
2. `RAPPORTS-BIA-DEPUIS-PROCESSUS.md` (ce document)

### Modifiés

1. `src/app/(app)/bia/reports/page-client.tsx` - Ajout du nouvel onglet
2. `src/actions/bia/bia-report-actions.ts` - Nouvelle action + fonction helper
3. `src/app/api/bia/processes/route.ts` - Ajout méthode GET

---

**Date de création** : 17 novembre 2025  
**Version** : 1.0  
**Statut** : ✅ Opérationnel
