# 🏭 Architecture BIA : Usines et Processus - Diagramme

## 📐 Vue d'Ensemble de l'Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SYSTÈME BIA - NOUVELLE ARCHITECTURE                │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│      User        │
│ ──────────────── │
│ id               │
│ name             │
│ email            │
│ role             │
└────────┬─────────┘
         │
         │ createdBy / manager
         │
         ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                            FACTORY (Usine)                                │
│ ──────────────────────────────────────────────────────────────────────── │
│ id                   String    @id (ObjectId)                            │
│ name                 String    "Usine de Production A"                   │
│ code                 String    @unique "UPA"                             │
│ description          String?                                             │
│                                                                           │
│ 📍 Géographie:                                                           │
│   - address          String?                                             │
│   - city             String?                                             │
│   - country          String?                                             │
│   - coordinates      Json?     { lat, lng }                              │
│                                                                           │
│ 🏢 Organisation:                                                         │
│   - managerId        String?   → User                                    │
│   - department       String?                                             │
│   - phoneNumber      String?                                             │
│   - email            String?                                             │
│                                                                           │
│ 📊 Opérations:                                                           │
│   - surfaceArea      Float?    (m²)                                      │
│   - employeeCount    Int?                                                │
│   - isActive         Boolean                                             │
│   - criticalityLevel String?   "critique", "élevé", "moyen", "faible"   │
│                                                                           │
│ ✅ Certifications:                                                       │
│   - certifications   String[]  ["ISO 9001", "ISO 27001"]                │
│                                                                           │
│ 📅 Métadonnées:                                                          │
│   - createdAt        DateTime                                            │
│   - updatedAt        DateTime                                            │
│   - createdById      String    → User                                    │
└────────┬──────────────────────────────────┬──────────────────────────────┘
         │                                  │
         │ 1:N                              │ 1:N
         │                                  │
         ▼                                  ▼
┌──────────────────────┐          ┌──────────────────────┐
│      Process         │          │     BiaReport        │
│ ───────────────────  │          │ ───────────────────  │
│ id                   │          │ id                   │
│ name                 │          │ name                 │
│ department           │          │ format               │
│ factoryId   ────────►│          │ factoryId   ────────►│
│ factory              │          │ factory              │
│                      │          │                      │
│ location    (dans    │          │ reportData           │
│             l'usine) │          │ continuityLevel      │
│                      │          │                      │
│ criticality          │          │ includedProcessIds   │
│ rto, rpo, mtpd       │          │                      │
│ responsibleIds       │          │ authorId             │
│                      │          │                      │
│ createdAt            │          │ createdAt            │
│ updatedAt            │          │ updatedAt            │
└──────────────────────┘          └──────────────────────┘

LÉGENDE:
────► Relation 1:N (Une Factory a plusieurs Process/Reports)
──┬── Relation M:N (Plusieurs vers plusieurs)
```

## 🔄 Comparaison Ancien vs Nouveau Système

### ❌ ANCIEN SYSTÈME (Basé sur Catégories)

```
BiaReport {
  id: "report-123"
  name: "Analyse Processus X"
  category: "Usine A"  ← Simple texte libre !
}

BiaReport {
  id: "report-456"
  name: "Analyse Processus Y"
  category: "usine a"  ← Doublon possible !
}

Process {
  id: "proc-789"
  name: "Production"
  location: "Usine A"  ← Simple texte libre !
}

PROBLÈMES:
- ❌ Pas de validation
- ❌ Doublons possibles ("Usine A" vs "usine a")
- ❌ Impossible de renommer facilement
- ❌ Pas de métadonnées sur l'usine
- ❌ Pas de statistiques par usine
```

### ✅ NOUVEAU SYSTÈME (Entités Factory)

```
Factory {
  id: "factory-abc"
  name: "Usine A"
  code: "USINE_A"  ← Code unique !
  city: "Paris"
  employeeCount: 250
  isActive: true
  criticalityLevel: "élevé"
}

BiaReport {
  id: "report-123"
  name: "Analyse Processus X"
  factoryId: "factory-abc"  ← Relation formelle !
  factory: Factory { ... }
}

BiaReport {
  id: "report-456"
  name: "Analyse Processus Y"
  factoryId: "factory-abc"  ← Même Factory !
}

Process {
  id: "proc-789"
  name: "Production"
  factoryId: "factory-abc"  ← Relation formelle !
  location: "Bâtiment B"    ← Emplacement DANS l'usine
}

AVANTAGES:
- ✅ Validation par clé étrangère
- ✅ Code unique empêche les doublons
- ✅ Renommer une usine = 1 modification
- ✅ Métadonnées enrichies (adresse, employés, etc.)
- ✅ Statistiques automatiques (count, aggregations)
- ✅ Analyses consolidées précises
```

## 📊 Flux de Données

### 1. Création d'une Usine

```
┌─────────────┐     POST /api/factories      ┌──────────────┐
│  Frontend   │ ─────────────────────────────→ │   API Route  │
│             │                                │              │
│ FormData:   │                                │ Validation:  │
│ - name      │                                │ - Code unique│
│ - code      │                                │ - Nom requis │
│ - city      │                                │              │
└─────────────┘                                └──────┬───────┘
                                                      │
                                                      │ prisma.factory.create()
                                                      ▼
                                               ┌──────────────┐
                                               │   MongoDB    │
                                               │              │
                                               │ factories    │
                                               │ collection   │
                                               └──────────────┘
```

### 2. Association Process → Factory

```
┌─────────────┐     PATCH /api/processes/:id  ┌──────────────┐
│  Frontend   │ ─────────────────────────────→ │   API Route  │
│             │                                │              │
│ Sélecteur   │                                │ Validation:  │
│ Factory:    │                                │ - Factory    │
│ "Usine A"   │                                │   existe     │
│             │                                │              │
└─────────────┘                                └──────┬───────┘
                                                      │
                                                      │ prisma.process.update({
                                                      │   data: { factoryId: "..." }
                                                      │ })
                                                      ▼
                                               ┌──────────────┐
                                               │   MongoDB    │
                                               │              │
                                               │ Process mis  │
                                               │ à jour avec  │
                                               │ factoryId    │
                                               └──────────────┘
```

### 3. Analyse Consolidée d'une Usine

```
┌─────────────┐   GET /api/factories/:id/analyze   ┌──────────────┐
│  Frontend   │ ──────────────────────────────────→ │   API Route  │
│             │                                     │              │
│ Demande     │                                     │ 1. Récupère  │
│ analyse     │                                     │    Factory   │
│ Usine A     │                                     │              │
└─────────────┘                                     │ 2. Include   │
       ▲                                            │    - reports │
       │                                            │    - processes│
       │                                            │              │
       │                                            │ 3. Calcule:  │
       │                                            │    - RTO moy │
       │                                            │    - Impacts │
       │                                            │    - SPOF    │
       │                                            │              │
       │         JSON Response                      │              │
       └────────────────────────────────────────────┘              │
                                                    │              │
                                                    ▼              │
                                             ┌──────────────┐     │
                                             │   MongoDB    │◄────┘
                                             │              │
                                             │ Query avec   │
                                             │ relations    │
                                             └──────────────┘
```

## 🎯 Use Cases Principaux

### Use Case 1: Créer une Nouvelle Usine

```
Acteur: Administrateur BIA

1. Accéder à /bia/factories
2. Cliquer "Nouvelle Usine"
3. Remplir le formulaire:
   - Nom: "Usine de Production Nord"
   - Code: "UPN"
   - Ville: "Lille"
   - Pays: "France"
   - Employés: 150
4. Soumettre
5. → Factory créée dans la base
6. → Affichée dans la liste
```

### Use Case 2: Associer un Processus à une Usine

```
Acteur: Responsable BIA

1. Créer/Modifier un Process
2. Dans le champ "Usine", sélectionner:
   ┌─────────────────────────┐
   │ Sélectionner une usine  │
   ├─────────────────────────┤
   │ ○ Usine A (USINE_A)     │
   │ ○ Usine B (USINE_B)     │
   │ ● Usine Nord (UPN)      │
   │ ○ Site Principal (SP)   │
   └─────────────────────────┘
3. Sauvegarder
4. → Process.factoryId = "factory-id"
```

### Use Case 3: Générer Analyse Consolidée

```
Acteur: Directeur BIA

1. Accéder à /bia/factories
2. Sélectionner "Usine Nord"
3. Cliquer "Analyse"
4. → Chargement de tous les rapports BIA de cette usine
5. → Calcul des métriques consolidées:
    - RTO moyen: 12h
    - Criticité: Élevé
    - 45 processus
    - 12 rapports
    - 8 SPOF identifiés
6. → Recommandations générées
7. → Visualisation graphique
```

### Use Case 4: Filtrer les Processus par Usine

```
Acteur: Utilisateur BIA

1. Accéder à /bia/processes
2. Dans les filtres, sélectionner:
   "Usine: Usine Nord"
3. → Affichage uniquement des processus
     où factoryId = "usine-nord-id"
4. → Tri, export, analyse sur ce sous-ensemble
```

## 🗂️ Structure des Collections MongoDB

### Collection: `factories`

```javascript
{
  _id: ObjectId("65a1b2c3d4e5f6..."),
  name: "Usine de Production A",
  code: "UPA",
  description: "Usine principale de production",
  address: "123 Rue de l'Industrie",
  city: "Paris",
  country: "France",
  coordinates: { lat: 48.8566, lng: 2.3522 },
  managerId: ObjectId("user-id..."),
  department: "Production",
  phoneNumber: "+33 1 23 45 67 89",
  email: "usine.a@company.com",
  surfaceArea: 15000.5,
  employeeCount: 250,
  isActive: true,
  criticalityLevel: "élevé",
  certifications: ["ISO 9001", "ISO 14001"],
  createdAt: ISODate("2024-01-15T10:30:00Z"),
  updatedAt: ISODate("2024-01-20T14:15:00Z"),
  createdById: ObjectId("user-id...")
}
```

### Collection: `processes` (modifié)

```javascript
{
  _id: ObjectId("process-id..."),
  name: "Processus de Production",
  department: "Fabrication",

  // ✅ NOUVEAU
  factoryId: ObjectId("65a1b2c3d4e5f6..."),

  location: "Bâtiment B, Étage 2", // Emplacement DANS l'usine

  criticality: "élevé",
  rto: 24,
  rpo: 4,
  mtpd: 72,
  // ... 100+ autres champs

  createdAt: ISODate("2024-01-10T08:00:00Z"),
  updatedAt: ISODate("2024-01-22T11:30:00Z")
}
```

### Collection: `bia_reports` (modifié)

```javascript
{
  _id: ObjectId("report-id..."),
  name: "Rapport BIA - Janvier 2024",

  // ✅ NOUVEAU
  factoryId: ObjectId("65a1b2c3d4e5f6..."),

  category: "Mensuel", // Peut être conservé pour autre usage

  reportData: { /* ... */ },
  continuityLevel: 85,
  includedProcessIds: [
    ObjectId("proc-1..."),
    ObjectId("proc-2...")
  ],
  authorId: ObjectId("user-id..."),

  createdAt: ISODate("2024-01-31T16:00:00Z"),
  updatedAt: ISODate("2024-02-01T09:00:00Z")
}
```

## 📈 Requêtes Optimisées

### Requête 1: Tous les processus d'une usine

```typescript
const processes = await prisma.process.findMany({
  where: {
    factoryId: "factory-id",
  },
  include: {
    factory: true,
    responsibles: true,
  },
});
```

**Index utilisé**: `@@index([factoryId])`

### Requête 2: Statistiques d'une usine

```typescript
const factory = await prisma.factory.findUnique({
  where: { id: "factory-id" },
  include: {
    _count: {
      select: {
        processes: true,
        reports: true,
      },
    },
    processes: {
      select: {
        criticality: true,
        rto: true,
      },
    },
  },
});

// Calculs
const avgRto =
  factory.processes.reduce((sum, p) => sum + (p.rto || 0), 0) /
  factory.processes.length;
const criticalProcesses = factory.processes.filter(
  (p) => p.criticality === "critique"
).length;
```

### Requête 3: Usines avec le plus de processus critiques

```typescript
const factories = await prisma.factory.findMany({
  include: {
    processes: {
      where: { criticality: "critique" },
    },
    _count: {
      select: { processes: true },
    },
  },
  orderBy: {
    processes: {
      _count: "desc",
    },
  },
});
```

## 🎨 Interface Utilisateur

### Vue Liste des Usines

```
┌────────────────────────────────────────────────────────────────────────┐
│  🏭 Gestion des Usines                                   [+ Nouvelle]  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  🔍 [Rechercher...]  [Statut ▼] [Criticité ▼]  [⊞] [≡]               │
│                                                                        │
├───────────────────┬───────────────────┬───────────────────┐            │
│                   │                   │                   │            │
│  🏭 Usine A       │  🏭 Usine B       │  🏭 Site Principal│            │
│  Code: UPA        │  Code: UPB        │  Code: SP         │            │
│  ✅ Active        │  ✅ Active        │  ⚠️ Inactive      │            │
│  🔴 Critique      │  🟠 Élevé         │  🟢 Faible        │            │
│                   │                   │                   │            │
│  📍 Paris, France │  📍 Lyon, France  │  📍 Marseille     │            │
│  👥 250 employés  │  👥 180 employés  │  👥 50 employés   │            │
│  ⚙️ 45 processus  │  ⚙️ 32 processus  │  ⚙️ 12 processus  │            │
│  📄 12 rapports   │  📄 8 rapports    │  📄 3 rapports    │            │
│                   │                   │                   │            │
│  [📊 Analyse]     │  [📊 Analyse]     │  [📊 Analyse]     │            │
│  [✏️]             │  [✏️]             │  [✏️]             │            │
│                   │                   │                   │            │
└───────────────────┴───────────────────┴───────────────────┘            │
│                                                                        │
│  Affichage de 3 usines sur 3                                          │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Vue Analyse d'une Usine

```
┌────────────────────────────────────────────────────────────────────────┐
│  [←] 🏭 Analyse Consolidée : Usine A                                   │
│  12 rapports analysés • 45 processus • Mis à jour: 01/02/2024 10:30   │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ RTO Moy  │  │Criticité │  │Continuité│  │  SPOF    │             │
│  │   12h    │  │ 🔴 Élevé │  │ 🟡 Jaune │  │    8     │             │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘             │
│                                                                        │
│  ┌───────────────────────────────────────────────────────────┐        │
│  │ 💡 Recommandations                                        │        │
│  ├───────────────────────────────────────────────────────────┤        │
│  │ ✅ Usine à criticité élevée : Mettre en place un PCA     │        │
│  │ ✅ 8 SPOF identifiés : Prioriser les redondances         │        │
│  │ ✅ RTO élevé : Améliorer la résilience                   │        │
│  └───────────────────────────────────────────────────────────┘        │
│                                                                        │
│  [Impacts] [SPOF] [Dépendances] [Besoins de Continuité]              │
│  ──────────────────────────────────────────────────────               │
│                                                                        │
│  📊 8 Impacts Identifiés                                               │
│  ┌───────────────────────────────────────────────────────────┐        │
│  │ 🔴 Impact Opérationnel - Haute Sévérité                  │        │
│  │ Arrêt de la production pendant 24h                        │        │
│  │ Source: Rapport BIA - Janvier 2024                        │        │
│  └───────────────────────────────────────────────────────────┘        │
│  ┌───────────────────────────────────────────────────────────┐        │
│  │ 🟠 Impact Financier - Moyenne Sévérité                   │        │
│  │ Perte de CA estimée à 500K€                               │        │
│  │ Source: Rapport BIA - Décembre 2023                       │        │
│  └───────────────────────────────────────────────────────────┘        │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

**Documentation créée le** : ${new Date().toLocaleDateString('fr-FR')}
**Version** : 1.0.0
