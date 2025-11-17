# 🏭 Guide de Mise en Œuvre : Architecture Factory-Process

## 📋 Résumé Exécutif

Ce guide fournit les **instructions pas à pas** pour migrer le module BIA d'une architecture basée sur des **catégories textuelles** vers une architecture formelle avec **entités Factory** et relations **Factory → Process**.

### 🎯 Objectifs

1. ✅ Créer un modèle `Factory` dans la base de données
2. ✅ Établir une relation formelle `Factory → Process`
3. ✅ Établir une relation formelle `Factory → BiaReport`
4. ✅ Migrer les données existantes sans perte
5. ✅ Créer une interface de gestion des usines

### ⏱️ Temps Estimé

- **Développement** : 2-3 jours
- **Tests** : 1 jour
- **Migration** : 2-4 heures
- **Total** : ~4 jours

---

## 📁 Fichiers Créés

Tous les fichiers nécessaires ont été créés dans votre workspace :

### 1. Documentation

| Fichier                                | Description                                             | Emplacement      |
| -------------------------------------- | ------------------------------------------------------- | ---------------- |
| `BIA-FACTORY-ARCHITECTURE-ANALYSIS.md` | Analyse complète de l'architecture actuelle et proposée | Racine du projet |
| `BIA-FACTORY-IMPLEMENTATION-GUIDE.md`  | Ce fichier - Guide de mise en œuvre                     | Racine du projet |

### 2. Schéma Prisma

| Fichier                          | Description                               | Emplacement      |
| -------------------------------- | ----------------------------------------- | ---------------- |
| `SCHEMA-FACTORY-PROPOSAL.prisma` | Schéma Prisma complet avec modèle Factory | Racine du projet |

### 3. Scripts

| Fichier                                      | Description                                 | Emplacement |
| -------------------------------------------- | ------------------------------------------- | ----------- |
| `scripts/migrate-categories-to-factories.ts` | Script de migration automatique des données | `scripts/`  |

### 4. Exemples de Code

| Fichier                                           | Description                                   | Emplacement                    |
| ------------------------------------------------- | --------------------------------------------- | ------------------------------ |
| `src/app/(app)/bia/factories/page-example.tsx`    | Page de gestion des usines (Server Component) | `src/app/(app)/bia/factories/` |
| `src/components/bia/factories-client-example.tsx` | Composant client pour la liste des usines     | `src/components/bia/`          |

---

## 🚀 Instructions de Mise en Œuvre

### Phase 1 : Préparation (30 minutes)

#### Étape 1.1 - Backup de la base de données

```bash
# Créer un backup MongoDB
mongodump --uri="your_mongodb_connection_string" --out=./backup-$(date +%Y%m%d)

# Ou avec MongoDB Atlas
# Utiliser l'interface web pour créer un snapshot
```

#### Étape 1.2 - Créer une branche Git

```bash
git checkout -b feature/factory-architecture
git add .
git commit -m "Before factory architecture implementation"
```

#### Étape 1.3 - Vérifier l'environnement

```bash
# Vérifier que Prisma est à jour
npm list @prisma/client

# Vérifier la connexion à la base de données
npx prisma db pull
```

---

### Phase 2 : Modification du Schéma Prisma (1 heure)

#### Étape 2.1 - Ouvrir le fichier `SCHEMA-FACTORY-PROPOSAL.prisma`

Ce fichier contient le schéma complet proposé. Vous devez copier les parties pertinentes dans votre `prisma/schema.prisma`.

#### Étape 2.2 - Ajouter le modèle Factory

```prisma
// À ajouter dans prisma/schema.prisma

model Factory {
  id              String    @id @default(auto()) @map("_id") @db.ObjectId
  name            String
  code            String    @unique
  description     String?

  // Informations géographiques
  address         String?
  city            String?
  postalCode      String?
  country         String?
  region          String?
  coordinates     Json?

  // Informations organisationnelles
  managerId       String?   @db.ObjectId
  manager         User?     @relation("ManagedFactories", fields: [managerId], references: [id])
  department      String?
  division        String?
  phoneNumber     String?
  email           String?
  website         String?

  // Métadonnées opérationnelles
  surfaceArea     Float?
  employeeCount   Int?
  operatingHours  Json?
  timezone        String?

  // Statut et criticité
  isActive        Boolean   @default(true)
  criticalityLevel String?

  // Certifications
  certifications  String[]  @default([])
  complianceStandards String[] @default([])

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
  @@index([managerId])
}
```

#### Étape 2.3 - Modifier le modèle Process

```prisma
// Dans le modèle Process existant, AJOUTER ces lignes :

model Process {
  // ... champs existants ...

  // ✅ NOUVEAU
  factoryId       String?   @db.ObjectId
  factory         Factory?  @relation("FactoryProcesses", fields: [factoryId], references: [id], onDelete: SetNull)

  // ... reste des champs existants ...

  @@map("processes")
  @@index([factoryId])  // ✅ NOUVEAU INDEX
  // ... autres index existants ...
}
```

#### Étape 2.4 - Modifier le modèle BiaReport

```prisma
// Dans le modèle BiaReport existant, AJOUTER ces lignes :

model BiaReport {
  // ... champs existants ...

  // ✅ NOUVEAU
  factoryId       String?   @db.ObjectId
  factory         Factory?  @relation("FactoryReports", fields: [factoryId], references: [id], onDelete: SetNull)

  // category reste pour compatibilité
  category        String?   // Peut être supprimé après migration

  // ... reste des champs existants ...

  @@map("bia_reports")
  @@index([factoryId])  // ✅ NOUVEAU INDEX
  // ... autres index existants ...
}
```

#### Étape 2.5 - Modifier le modèle User

```prisma
// Dans le modèle User existant, AJOUTER ces relations :

model User {
  // ... champs existants ...

  // ✅ NOUVELLES RELATIONS
  createdFactories    Factory[] @relation("CreatedFactories")
  managedFactories    Factory[] @relation("ManagedFactories")

  // ... autres relations existantes ...
}
```

#### Étape 2.6 - Générer et appliquer la migration

```bash
# Générer la migration
npx prisma migrate dev --name add_factory_model

# Vérifier que la migration a été créée
ls -la prisma/migrations/
```

**⚠️ IMPORTANT** : Si la migration échoue, vérifiez :

- La connexion à la base de données
- Qu'il n'y a pas de conflits de noms
- Que les types sont corrects pour MongoDB

---

### Phase 3 : Migration des Données (2 heures)

#### Étape 3.1 - Vérifier le script de migration

Ouvrir `scripts/migrate-categories-to-factories.ts` et vérifier :

- La logique de génération de code Factory
- La normalisation des noms de catégories
- La gestion des erreurs

#### Étape 3.2 - Test en environnement local

```bash
# Créer une copie de la base de test
# Puis exécuter le script
npx tsx scripts/migrate-categories-to-factories.ts
```

#### Étape 3.3 - Vérifier les résultats

```bash
# Ouvrir Prisma Studio pour vérifier visuellement
npx prisma studio

# Vérifier :
# 1. Que les Factories ont été créées
# 2. Que les BiaReports ont un factoryId
# 3. Que les Process ont un factoryId (si applicable)
```

#### Étape 3.4 - Script de vérification (optionnel)

```typescript
// scripts/verify-factory-migration.ts

import { prisma } from "@/lib/prisma";

async function verifyMigration() {
  // Vérifier les Factories
  const factories = await prisma.factory.count();
  console.log(`✅ ${factories} Factories créées`);

  // Vérifier les Reports
  const reportsWithFactory = await prisma.biaReport.count({
    where: { factoryId: { not: null } },
  });
  const reportsWithCategory = await prisma.biaReport.count({
    where: { category: { not: null } },
  });
  console.log(`✅ ${reportsWithFactory}/${reportsWithCategory} Reports migrés`);

  // Vérifier les Process
  const processesWithFactory = await prisma.process.count({
    where: { factoryId: { not: null } },
  });
  console.log(`✅ ${processesWithFactory} Processes liés à une Factory`);
}

verifyMigration().then(() => process.exit(0));
```

---

### Phase 4 : Développement Frontend (1-2 jours)

#### Étape 4.1 - Créer la page de gestion des Factories

```bash
# Copier le fichier exemple vers la vraie page
cp src/app/\(app\)/bia/factories/page-example.tsx src/app/\(app\)/bia/factories/page.tsx

# Copier le composant client
cp src/components/bia/factories-client-example.tsx src/components/bia/factories-client.tsx
```

#### Étape 4.2 - Créer les APIs

**API CRUD Factories** : `src/app/api/factories/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Liste toutes les factories
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const factories = await prisma.factory.findMany({
    include: {
      _count: {
        select: { processes: true, reports: true },
      },
      manager: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(factories);
}

// POST - Créer une nouvelle factory
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();

  const factory = await prisma.factory.create({
    data: {
      name: body.name,
      code: body.code,
      description: body.description,
      city: body.city,
      country: body.country,
      address: body.address,
      isActive: true,
      createdById: session.user.id,
    },
  });

  return NextResponse.json(factory);
}
```

**API Factory individuelle** : `src/app/api/factories/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Récupérer une factory spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const factory = await prisma.factory.findUnique({
    where: { id: params.id },
    include: {
      processes: true,
      reports: true,
      manager: true,
      createdBy: true,
    },
  });

  if (!factory) {
    return NextResponse.json({ error: "Factory non trouvée" }, { status: 404 });
  }

  return NextResponse.json(factory);
}

// PATCH - Mettre à jour une factory
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();

  const factory = await prisma.factory.update({
    where: { id: params.id },
    data: body,
  });

  return NextResponse.json(factory);
}

// DELETE - Supprimer une factory
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Vérifier s'il y a des processus/rapports liés
  const factory = await prisma.factory.findUnique({
    where: { id: params.id },
    include: {
      _count: {
        select: { processes: true, reports: true },
      },
    },
  });

  if (!factory) {
    return NextResponse.json({ error: "Factory non trouvée" }, { status: 404 });
  }

  if (factory._count.processes > 0 || factory._count.reports > 0) {
    return NextResponse.json(
      {
        error:
          "Impossible de supprimer une factory avec des processus ou rapports",
      },
      { status: 400 }
    );
  }

  await prisma.factory.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}
```

#### Étape 4.3 - Mettre à jour la page d'analyse

**Modifier** : `src/app/(app)/bia/factories/[category]/analysis/page.tsx`

Remplacer `[category]` par `[factoryId]` :

```typescript
// AVANT (basé sur category string)
const category = decodeURIComponent(params.category as string);
const reports = await prisma.biaReport.findMany({
  where: { category: category === "Sans usine" ? null : category },
});

// APRÈS (basé sur factoryId ObjectId)
const factory = await prisma.factory.findUnique({
  where: { id: params.factoryId },
  include: {
    reports: { include: { author: true } },
    processes: { select: { id: true, name: true, criticality: true } },
  },
});
```

#### Étape 4.4 - Mettre à jour le formulaire de création de rapport

Dans le formulaire de création/édition de rapport BIA, remplacer le champ texte `category` par un sélecteur de Factory :

```typescript
// Composant de sélection
import { useEffect, useState } from "react";

function FactorySelector({
  value,
  onChange,
}: {
  value?: string;
  onChange: (id: string) => void;
}) {
  const [factories, setFactories] = useState([]);

  useEffect(() => {
    fetch("/api/factories")
      .then((res) => res.json())
      .then((data) => setFactories(data));
  }, []);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Sélectionner une usine" />
      </SelectTrigger>
      <SelectContent>
        {factories.map((factory) => (
          <SelectItem key={factory.id} value={factory.id}>
            {factory.name} ({factory.code})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

---

### Phase 5 : Tests (1 jour)

#### Étape 5.1 - Tests Unitaires

```typescript
// __tests__/factory.test.ts

describe("Factory Model", () => {
  it("should create a factory", async () => {
    const factory = await prisma.factory.create({
      data: {
        name: "Test Factory",
        code: "TEST_FACTORY",
        createdById: "user-id-here",
      },
    });

    expect(factory.name).toBe("Test Factory");
    expect(factory.code).toBe("TEST_FACTORY");
  });

  it("should link a process to a factory", async () => {
    const process = await prisma.process.update({
      where: { id: "process-id" },
      data: { factoryId: "factory-id" },
    });

    expect(process.factoryId).toBe("factory-id");
  });
});
```

#### Étape 5.2 - Tests d'Intégration

- [ ] Créer une usine via l'interface
- [ ] Modifier une usine existante
- [ ] Associer un processus à une usine
- [ ] Créer un rapport BIA lié à une usine
- [ ] Générer l'analyse consolidée d'une usine
- [ ] Supprimer une usine vide
- [ ] Tenter de supprimer une usine avec des processus (doit échouer)

#### Étape 5.3 - Tests de Performance

```bash
# Vérifier les temps de requête
npx prisma studio

# Dans la console Prisma Studio, exécuter :
# - Liste de toutes les factories
# - Factory avec 100+ processus
# - Analyse consolidée d'une factory
```

---

### Phase 6 : Déploiement (2-4 heures)

#### Étape 6.1 - Déploiement en Staging

```bash
# Déployer sur l'environnement de staging
git push origin feature/factory-architecture

# Exécuter les migrations sur staging
# (commandes dépendent de votre infrastructure)
```

#### Étape 6.2 - Tests en Staging

- [ ] Exécuter le script de migration avec données réelles
- [ ] Vérifier l'intégrité des données
- [ ] Tester toutes les fonctionnalités

#### Étape 6.3 - Déploiement en Production

```bash
# Créer un backup de production
mongodump --uri="production_uri" --out=./backup-production-$(date +%Y%m%d)

# Merger la branche
git checkout main
git merge feature/factory-architecture

# Déployer
git push origin main

# Exécuter les migrations
npx prisma migrate deploy

# Exécuter le script de migration des données
npx tsx scripts/migrate-categories-to-factories.ts
```

---

## ✅ Checklist Finale

### Schéma & Base de Données

- [ ] Backup de la base de données effectué
- [ ] Modèle Factory ajouté à schema.prisma
- [ ] Relation Factory-Process ajoutée
- [ ] Relation Factory-BiaReport ajoutée
- [ ] Relations User-Factory ajoutées
- [ ] Migration Prisma générée et appliquée
- [ ] Données migrées avec succès
- [ ] Intégrité des données vérifiée

### APIs

- [ ] API GET /api/factories
- [ ] API POST /api/factories
- [ ] API GET /api/factories/[id]
- [ ] API PATCH /api/factories/[id]
- [ ] API DELETE /api/factories/[id]
- [ ] API POST /api/factories/[id]/analyze

### Frontend

- [ ] Page de liste des factories créée
- [ ] Composant FactoriesClient créé
- [ ] Dialog de création de factory
- [ ] Sélecteur de factory dans formulaire de rapport
- [ ] Sélecteur de factory dans formulaire de processus
- [ ] Page d'analyse factory mise à jour
- [ ] Navigation mise à jour

### Tests

- [ ] Tests unitaires passent
- [ ] Tests d'intégration passent
- [ ] Tests en staging réussis
- [ ] Performance acceptable

### Documentation

- [ ] Documentation technique complète
- [ ] Guide utilisateur mis à jour
- [ ] Guide de migration documenté
- [ ] Diagrammes d'architecture à jour

---

## 🆘 Dépannage

### Problème : Migration Prisma échoue

**Solution** :

```bash
# Supprimer la migration problématique
rm -rf prisma/migrations/XXXXXX_add_factory_model

# Régénérer
npx prisma migrate dev --name add_factory_model
```

### Problème : Code Factory en doublon

**Solution** :

```typescript
// Modifier generateFactoryCode() dans le script de migration
// Ajouter un suffixe numérique si collision
```

### Problème : Rapports sans factoryId après migration

**Solution** :

```typescript
// Vérifier que les catégories sont bien normalisées
const reports = await prisma.biaReport.findMany({
  where: {
    category: { not: null },
    factoryId: null,
  },
});

// Les associer manuellement
```

---

## 📞 Support

Pour toute question ou problème :

1. Consulter `BIA-FACTORY-ARCHITECTURE-ANALYSIS.md`
2. Consulter les commentaires dans `SCHEMA-FACTORY-PROPOSAL.prisma`
3. Vérifier les logs du script de migration
4. Contacter l'équipe de développement

---

**Date de création** : ${new Date().toLocaleDateString('fr-FR')}
**Version** : 1.0.0
**Auteur** : Équipe Développement BIA
