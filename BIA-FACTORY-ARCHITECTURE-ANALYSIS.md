# 🏭 Analyse Architecture BIA : Usines et Processus

## 📊 État Actuel du Système

### Structure Existante

Actuellement, le système BIA utilise une approche **basée sur des catégories textuelles** plutôt qu'une véritable hiérarchie d'entités Factory->Process.

#### 1. Modèle BiaReport (Prisma Schema)

```prisma
model BiaReport {
  id                  String           @id @default(auto()) @map("_id") @db.ObjectId
  name                String
  category            String?          // ⚠️ Simple champ texte, pas une relation
  reportData          Json
  includedProcessIds  String[]         // IDs des processus inclus
  authorId            String           @db.ObjectId
  author              User             @relation("AuthoredBiaReports", fields: [authorId], references: [id])
  // ... autres champs
}
```

**Problème identifié** :

- ❌ `category` est un simple `String?` (texte libre)
- ❌ Pas de modèle `Factory` dans le schéma
- ❌ Pas de relation formelle Factory -> Process
- ❌ Les "usines" sont actuellement des valeurs textuelles saisies manuellement

#### 2. Modèle Process (Prisma Schema)

```prisma
model Process {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  department  String
  location    String   // ⚠️ Simple texte, pas une relation
  // ... 100+ autres champs
}
```

**Problème identifié** :

- ❌ `location` est un `String` (texte libre)
- ❌ Pas de champ `factoryId` pour lier à une usine
- ❌ Pas de relation `factory` définie

#### 3. Implémentation Frontend Actuelle

**Page d'analyse usine** : `src/app/(app)/bia/factories/[category]/analysis/page.tsx`

```typescript
// Route dynamique basée sur category (texte)
const category = decodeURIComponent(params.category as string);

// API appelle avec category comme string
fetch(`/api/bia/factories/${encodeURIComponent(category)}/analyze`);
```

**API Backend** : `src/app/api/bia/factories/[category]/analyze/route.ts`

```typescript
// Récupère les rapports par category (champ texte)
const reports = await prisma.biaReport.findMany({
  where: {
    category: category === "Sans usine" ? null : category,
    authorId: session.user.id,
  },
});
```

**Problème identifié** :

- ❌ Les usines sont identifiées par leur nom (texte libre)
- ❌ Risques de doublons : "Usine A" vs "usine a" vs "Usine-A"
- ❌ Impossible de gérer des métadonnées d'usine (adresse, responsable, etc.)
- ❌ Pas de validation des noms d'usines
- ❌ Difficile de renommer une usine (affecte tous les rapports)

---

## 🎯 Architecture Proposée : Hiérarchie Factory → Process

### 1. Nouveau Modèle Factory

```prisma
model Factory {
  id              String    @id @default(auto()) @map("_id") @db.ObjectId
  name            String    // Nom de l'usine (ex: "Usine A", "Site Principal")
  code            String    @unique // Code unique (ex: "USA", "SITE_MAIN")

  // Informations géographiques
  address         String?
  city            String?
  country         String?
  coordinates     Json?     // { lat: number, lng: number }

  // Informations organisationnelles
  managerId       String?   @db.ObjectId
  manager         User?     @relation("ManagedFactories", fields: [managerId], references: [id])

  department      String?
  phoneNumber     String?
  email           String?

  // Métadonnées opérationnelles
  surfaceArea     Float?    // Surface en m²
  employeeCount   Int?      // Nombre d'employés
  operatingHours  Json?     // Horaires d'ouverture
  isActive        Boolean   @default(true)

  // Criticité de l'usine
  criticalityLevel String?  // "critique", "élevé", "moyen", "faible"

  // Relations
  processes       Process[] @relation("FactoryProcesses")
  reports         BiaReport[] @relation("FactoryReports")

  // Métadonnées
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  createdById     String    @db.ObjectId
  createdBy       User      @relation("CreatedFactories", fields: [createdById], references: [id])

  @@map("factories")
  @@index([code])
  @@index([isActive])
}
```

### 2. Modification du Modèle Process

```prisma
model Process {
  id              String    @id @default(auto()) @map("_id") @db.ObjectId
  name            String
  department      String

  // ✅ NOUVEAU : Relation avec Factory
  factoryId       String?   @db.ObjectId
  factory         Factory?  @relation("FactoryProcesses", fields: [factoryId], references: [id])

  // Garder location pour compatibilité (optionnel)
  location        String?   // Emplacement dans l'usine (ex: "Bâtiment B, Étage 2")

  // ... tous les autres champs existants (100+ champs)

  @@map("processes")
  @@index([factoryId])
}
```

### 3. Modification du Modèle BiaReport

```prisma
model BiaReport {
  id              String           @id @default(auto()) @map("_id") @db.ObjectId
  name            String

  // ✅ NOUVEAU : Relation avec Factory
  factoryId       String?          @db.ObjectId
  factory         Factory?         @relation("FactoryReports", fields: [factoryId], references: [id])

  // Garder category pour compatibilité (migration)
  category        String?          // Peut être supprimé après migration

  reportData      Json
  includedProcessIds  String[]

  // ... tous les autres champs existants

  @@map("bia_reports")
  @@index([factoryId])
}
```

### 4. Modification du Modèle User

```prisma
model User {
  // ... champs existants

  // ✅ NOUVEAU : Relations Factory
  createdFactories    Factory[] @relation("CreatedFactories")
  managedFactories    Factory[] @relation("ManagedFactories")

  // Relations existantes
  biaReports          BiaReport[] @relation("AuthoredBiaReports")
  responsibleProcesses Process[] @relation("ProcessResponsibles")
}
```

---

## 🔄 Plan de Migration

### Phase 1 : Création du Modèle Factory

**Étape 1.1** - Ajouter le modèle Factory au schéma Prisma

```bash
# Modifier prisma/schema.prisma
# Ajouter le modèle Factory complet
```

**Étape 1.2** - Ajouter les relations aux modèles existants

```bash
# Ajouter factoryId dans Process
# Ajouter factoryId dans BiaReport
# Ajouter relations dans User
```

**Étape 1.3** - Générer et appliquer la migration

```bash
npx prisma migrate dev --name add_factory_model
```

### Phase 2 : Migration des Données

**Étape 2.1** - Script de migration des catégories vers Factories

```typescript
// scripts/migrate-categories-to-factories.ts

import { prisma } from "@/lib/prisma";

async function migrateCategoriesToFactories() {
  console.log("🏭 Migration des catégories vers Factories...");

  // 1. Récupérer toutes les catégories uniques des BiaReports
  const reports = await prisma.biaReport.findMany({
    where: {
      category: { not: null },
    },
    select: {
      category: true,
      authorId: true,
    },
  });

  const uniqueCategories = [
    ...new Set(reports.map((r) => r.category).filter(Boolean)),
  ];
  console.log(`📊 ${uniqueCategories.length} catégories uniques trouvées`);

  // 2. Créer une Factory pour chaque catégorie unique
  const factoryMap = new Map<string, string>(); // category -> factoryId

  for (const category of uniqueCategories) {
    const firstReport = reports.find((r) => r.category === category);

    const factory = await prisma.factory.create({
      data: {
        name: category,
        code: generateFactoryCode(category),
        createdById: firstReport!.authorId,
        isActive: true,
      },
    });

    factoryMap.set(category, factory.id);
    console.log(`✅ Factory créée: ${category} -> ${factory.id}`);
  }

  // 3. Mettre à jour les BiaReports avec les factoryId
  for (const [category, factoryId] of factoryMap.entries()) {
    const result = await prisma.biaReport.updateMany({
      where: { category },
      data: { factoryId },
    });
    console.log(`📝 ${result.count} rapports mis à jour pour ${category}`);
  }

  // 4. Migrer les Process.location vers factoryId
  const processes = await prisma.process.findMany({
    select: { id: true, location: true },
  });

  for (const process of processes) {
    if (process.location && factoryMap.has(process.location)) {
      await prisma.process.update({
        where: { id: process.id },
        data: { factoryId: factoryMap.get(process.location) },
      });
    }
  }

  console.log("✅ Migration terminée!");
}

function generateFactoryCode(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "_")
    .substring(0, 20);
}

migrateCategoriesToFactories();
```

**Étape 2.2** - Exécuter la migration

```bash
npx tsx scripts/migrate-categories-to-factories.ts
```

### Phase 3 : Mise à Jour du Frontend

**Étape 3.1** - Page de gestion des Usines

```typescript
// src/app/(app)/bia/factories/page.tsx

export default async function FactoriesPage() {
  const factories = await prisma.factory.findMany({
    include: {
      _count: {
        select: {
          processes: true,
          reports: true,
        },
      },
      manager: {
        select: { name: true, email: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="container mx-auto p-6">
      <h1>Gestion des Usines</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {factories.map((factory) => (
          <FactoryCard
            key={factory.id}
            factory={factory}
            processCount={factory._count.processes}
            reportCount={factory._count.reports}
          />
        ))}
      </div>
    </div>
  );
}
```

**Étape 3.2** - Mise à jour de la page d'analyse

```typescript
// src/app/(app)/bia/factories/[factoryId]/analysis/page.tsx

export default async function FactoryAnalysisPage({
  params,
}: {
  params: { factoryId: string };
}) {
  const factory = await prisma.factory.findUnique({
    where: { id: params.factoryId },
    include: {
      reports: {
        include: {
          author: true,
        },
      },
      processes: {
        select: {
          id: true,
          name: true,
          criticality: true,
        },
      },
      manager: true,
    },
  });

  // Analyse consolidée de l'usine
  return <FactoryAnalysisClient factory={factory} />;
}
```

**Étape 3.3** - Mise à jour des formulaires

```typescript
// Composant de sélection d'usine
function FactorySelect({ value, onChange }: FactorySelectProps) {
  const [factories, setFactories] = useState<Factory[]>([]);

  useEffect(() => {
    fetch("/api/factories")
      .then((res) => res.json())
      .then((data) => setFactories(data));
  }, []);

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">-- Sélectionner une usine --</option>
      {factories.map((factory) => (
        <option key={factory.id} value={factory.id}>
          {factory.name} ({factory.code})
        </option>
      ))}
    </select>
  );
}
```

### Phase 4 : APIs

**Étape 4.1** - CRUD Factories

```typescript
// src/app/api/factories/route.ts

export async function GET(request: NextRequest) {
  const factories = await prisma.factory.findMany({
    include: {
      _count: {
        select: { processes: true, reports: true },
      },
    },
  });

  return NextResponse.json(factories);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const factory = await prisma.factory.create({
    data: {
      name: body.name,
      code: body.code,
      address: body.address,
      city: body.city,
      country: body.country,
      createdById: session.user.id,
    },
  });

  return NextResponse.json(factory);
}
```

**Étape 4.2** - API d'analyse par usine

```typescript
// src/app/api/bia/factories/[factoryId]/analyze/route.ts

export async function POST(
  request: NextRequest,
  { params }: { params: { factoryId: string } }
) {
  const factory = await prisma.factory.findUnique({
    where: { id: params.factoryId },
    include: {
      reports: {
        select: {
          id: true,
          name: true,
          reportData: true,
          continuityLevel: true,
        },
      },
      processes: {
        select: {
          id: true,
          name: true,
          criticality: true,
          rto: true,
          rpo: true,
        },
      },
    },
  });

  // Analyse consolidée
  const analysis = await generateFactoryAnalysis(factory);

  return NextResponse.json({ success: true, analysis });
}
```

---

## ✅ Avantages de la Nouvelle Architecture

### 1. **Intégrité des Données**

- ✅ Relations formelles dans la base de données
- ✅ Clés étrangères avec contraintes
- ✅ Pas de doublons de noms d'usines
- ✅ Codes uniques pour identifier les usines

### 2. **Gestion Facilitée**

- ✅ Renommer une usine = 1 seule modification
- ✅ Suppression en cascade (avec confirmation)
- ✅ Traçabilité complète (qui a créé l'usine, quand)
- ✅ Gestion des responsables d'usine

### 3. **Fonctionnalités Enrichies**

- ✅ Métadonnées d'usine (adresse, surface, employés)
- ✅ Statistiques par usine (nombre de processus, rapports)
- ✅ Filtrage et recherche optimisés
- ✅ Analyses consolidées précises

### 4. **Performance**

- ✅ Index sur factoryId pour requêtes rapides
- ✅ Chargement optimisé avec `include`
- ✅ Pas de comparaison de strings (utilise ObjectId)

### 5. **Évolutivité**

- ✅ Peut ajouter des fonctionnalités (certifications, audits)
- ✅ Hiérarchie multi-niveaux possible (Groupe > Site > Usine)
- ✅ Intégration avec d'autres modules (RH, Finance)

---

## 📋 Checklist de Migration

### Préparation

- [ ] Backup de la base de données
- [ ] Tests en environnement de développement
- [ ] Communication aux utilisateurs

### Migration Schéma

- [ ] Ajouter modèle Factory à schema.prisma
- [ ] Ajouter factoryId à Process
- [ ] Ajouter factoryId à BiaReport
- [ ] Ajouter relations à User
- [ ] Générer migration Prisma
- [ ] Appliquer migration

### Migration Données

- [ ] Exécuter script de migration des catégories
- [ ] Vérifier intégrité des données
- [ ] Créer usines manquantes
- [ ] Associer processus orphelins

### Frontend

- [ ] Créer page de gestion des usines
- [ ] Mettre à jour formulaire de création de rapport
- [ ] Mettre à jour formulaire de création de processus
- [ ] Adapter page d'analyse (category → factoryId)
- [ ] Ajouter composant FactorySelect
- [ ] Mettre à jour filtres et recherches

### APIs

- [ ] CRUD /api/factories
- [ ] GET /api/factories/[id]
- [ ] POST /api/factories/[id]/analyze
- [ ] Mettre à jour /api/bia/reports
- [ ] Mettre à jour /api/processes

### Tests

- [ ] Test création usine
- [ ] Test association processus → usine
- [ ] Test association rapport → usine
- [ ] Test analyse consolidée
- [ ] Test migration données existantes

### Documentation

- [ ] Documentation utilisateur
- [ ] Guide de migration
- [ ] Documentation API
- [ ] Diagrammes d'architecture

---

## 🚀 Prochaines Étapes Recommandées

### Immédiat

1. **Valider l'architecture** avec les stakeholders
2. **Créer un environnement de test** avec copie de la base de données
3. **Développer le script de migration** des données

### Court Terme (1-2 semaines)

1. **Implémenter le modèle Factory** dans le schéma
2. **Créer les APIs CRUD** pour les usines
3. **Développer la page de gestion** des usines
4. **Tester la migration** en environnement de dev

### Moyen Terme (2-4 semaines)

1. **Migrer les données** de production
2. **Déployer la nouvelle architecture**
3. **Former les utilisateurs**
4. **Monitoring** et ajustements

### Long Terme (1-3 mois)

1. **Enrichir les fonctionnalités** d'usine
2. **Tableaux de bord** par usine
3. **Exports et rapports** consolidés
4. **Intégrations** avec autres systèmes

---

## 📞 Support

Pour toute question sur cette architecture :

- **Documentation technique** : voir ce fichier
- **Architecture détaillée** : Prisma schema avec commentaires
- **Scripts de migration** : dans `/scripts/`

---

**Date de création** : ${new Date().toLocaleDateString('fr-FR')}
**Version** : 1.0.0
**Auteur** : Équipe Développement BIA
