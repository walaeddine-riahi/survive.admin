# 🏭 Sélecteur d'Usine dans l'Upload de Rapports BIA

## 🎯 Objectif

Permettre aux utilisateurs de sélectionner une usine lors de l'upload d'un rapport BIA, créant ainsi une relation directe entre le rapport et l'usine.

## ✅ Implémentation Complète

### 1. Modifications du Composant Upload

**Fichier:** `src/components/bia/simple-file-upload.tsx`

**Changements:**

- ✅ Ajout du type `Factory` pour typer les props
- ✅ Nouvelle prop `factories: Factory[]` reçue du composant parent
- ✅ Remplacement du champ texte `category` par un `Select` d'usines
- ✅ Changement de `formData.category` → `formData.factoryId`
- ✅ Envoi du `factoryId` au lieu de `category` dans le FormData

**Props du Composant:**

```typescript
type Factory = {
  id: string;
  name: string;
  code: string;
};

interface Props {
  onUploadSuccess?: () => void;
  factories?: Factory[];
}
```

**Interface du Select:**

```tsx
<Select
  value={formData.factoryId}
  onValueChange={(value) =>
    setFormData((prev) => ({ ...prev, factoryId: value }))
  }
>
  <SelectTrigger>
    <SelectValue placeholder="Sélectionner une usine (optionnel)" />
  </SelectTrigger>
  <SelectContent>
    {factories.map((factory) => (
      <SelectItem key={factory.id} value={factory.id}>
        {factory.name} {factory.code ? `(${factory.code})` : ""}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### 2. Passage des Données (Page Client)

**Fichier:** `src/app/(app)/bia/reports/page-client.tsx`

**Changement:**

```tsx
<SimpleFileUpload
  onUploadSuccess={handleUploadSuccess}
  factories={factories} // ✅ Ajouté
/>
```

### 3. Récupération des Usines (Page Server)

**Fichier:** `src/app/(app)/bia/reports/page.tsx`

**Déjà implémenté:**

```tsx
const factories = await prisma.factory.findMany({
  where: { isActive: true },
  select: {
    id: true,
    name: true,
    code: true,
  },
  orderBy: { name: "asc" },
});

return <BiaReportsPageClient initialReports={reports} factories={factories} />;
```

### 4. Backend - Action d'Upload

**Fichier:** `src/actions/bia/simple-upload-actions.ts`

**Changements:**

- ✅ Récupération de `factoryId` au lieu de `category`
- ✅ Requête Prisma pour obtenir le nom de l'usine
- ✅ Mise à jour de `category` avec le nom de l'usine (pour compatibilité)
- ✅ Ajout d'un tag `usine:{nom}` automatique
- ✅ Envoi du `factoryId` lors de la création du rapport

**Code:**

```typescript
const factoryId = formData.get("factoryId") as string;

// Récupérer le nom de l'usine si un factoryId est fourni
let category: string | undefined;

if (factoryId && factoryId !== "") {
  const factory = await prisma.factory.findUnique({
    where: { id: factoryId },
    select: { name: true },
  });

  if (factory) {
    category = factory.name;
    tags.push(`usine:${factory.name}`);
  }
}

// Lors de la création
const result = await createBiaReport({
  // ...autres champs
  category: category || undefined,
  factoryId: factoryId && factoryId !== "" ? factoryId : undefined,
});
```

### 5. Interface BiaReportData

**Fichier:** `src/actions/bia/bia-report-actions.ts`

**Changement:**

```typescript
export interface BiaReportData {
  // ...champs existants
  category?: string;
  factoryId?: string; // ✅ Ajouté
}
```

**Création du Rapport:**

```typescript
const report = await prisma.biaReport.create({
  data: {
    // ...autres champs
    category: data.category,
    factoryId: data.factoryId, // ✅ Ajouté
    authorId: session.user.id,
  },
});
```

## 🔄 Workflow Utilisateur

1. **Accéder à l'onglet Upload**

   - Aller sur `/bia/reports`
   - Cliquer sur l'onglet "Importer un Fichier"

2. **Sélectionner un fichier**

   - Glisser-déposer ou cliquer pour sélectionner
   - Formats supportés: PDF, Word, TXT

3. **Remplir le formulaire**

   - Nom du rapport (obligatoire)
   - Description (optionnel)
   - **Usine** (optionnel) - Nouveau sélecteur avec liste déroulante
   - Tags (optionnel)

4. **Sélection de l'usine**

   - Liste déroulante avec toutes les usines actives
   - Format: "Nom de l'usine (CODE)"
   - Peut rester vide si non applicable

5. **Upload du rapport**
   - Le rapport est créé avec `factoryId` et `category`
   - Un tag automatique `usine:{nom}` est ajouté
   - Redirection vers la liste des rapports

## 📊 Relations BDD

### BiaReport

```prisma
model BiaReport {
  id          String   @id
  name        String
  category    String?  // Nom de l'usine (pour affichage/recherche)
  factoryId   String?  // ID de l'usine (relation)
  factory     Factory? @relation(fields: [factoryId], references: [id])
  // ...autres champs
}
```

### Factory

```prisma
model Factory {
  id        String      @id
  name      String
  code      String?
  isActive  Boolean     @default(true)
  reports   BiaReport[] // Relation inverse
  // ...autres champs
}
```

## 🎨 Interface Utilisateur

### Avant

```
Catégorie: [____________]  Tags: [____________]
           (input text)          (input text)
```

### Après

```
Usine: [Sélectionner une usine (optionnel) ▼]  Tags: [____________]
       (select dropdown)                              (input text)
```

### Options du Select

```
- Usine A (UA)
- Usine B (UB)
- Centre Logistique (CL)
- Siège Social (SS)
```

## ✨ Avantages

1. **Cohérence des Données**

   - Relation directe BiaReport ↔ Factory
   - Évite les erreurs de saisie manuelle
   - Données normalisées

2. **Filtrage Amélioré**

   - Les rapports peuvent être filtrés par usine
   - Utilisation de `factoryId` pour des requêtes précises
   - Compatibilité avec le composant `FactorySelect`

3. **Traçabilité**

   - Tag automatique `usine:{nom}` ajouté
   - `category` rempli automatiquement avec le nom
   - Double référence (ID + nom) pour flexibilité

4. **Intégration**
   - Compatible avec `ReportAddProcessDialog` (hérite de `category`)
   - Compatible avec les filtres existants
   - Fonctionne avec les rapports sans usine (optionnel)

## 🔧 Configuration

### Prérequis

- Table `Factory` avec des enregistrements actifs
- Champs `factoryId` dans `BiaReport` (déjà dans schema)
- Relation définie dans Prisma

### Migration

Aucune migration nécessaire si le schéma Prisma est déjà à jour avec:

```prisma
model BiaReport {
  factoryId String?
  factory   Factory? @relation(fields: [factoryId], references: [id])
}
```

## 📝 Cas d'Usage

### Cas 1: Upload avec Usine

```
Utilisateur → Sélectionne "Usine A"
           → Upload PDF "Rapport Q4 2025"
           → Résultat:
              - factoryId: "abc123"
              - category: "Usine A"
              - tags: ["upload", "pdf", "usine:Usine A"]
```

### Cas 2: Upload sans Usine

```
Utilisateur → Ne sélectionne pas d'usine
           → Upload Word "Analyse Générale"
           → Résultat:
              - factoryId: null
              - category: null
              - tags: ["upload", "docx"]
```

### Cas 3: Usine Supprimée/Désactivée

```
Select → Affiche uniquement les usines actives (isActive: true)
      → Les anciennes usines ne sont pas affichées
      → Les rapports existants conservent leur factoryId
```

## 🚀 Améliorations Futures

1. **Filtrage Intelligent**

   - Suggérer l'usine basée sur l'auteur
   - Mémoriser la dernière usine sélectionnée

2. **Validation**

   - Avertir si l'usine n'a pas de processus
   - Suggérer des processus à ajouter après upload

3. **Statistiques**

   - Nombre de rapports par usine
   - Afficher dans le dropdown: "Usine A (5 rapports)"

4. **Création Rapide**
   - Bouton "Créer nouvelle usine" dans le Select
   - Dialog modal pour création rapide

## 🐛 Résolution de Problème

### Erreur: "SelectItem with empty value"

**Solution:** ✅ Résolu

- Supprimé `<SelectItem value="">Aucune usine</SelectItem>`
- Le placeholder du Select suffit pour indiquer que c'est optionnel

### Erreur: "factories is undefined"

**Solution:** ✅ Résolu

- Valeur par défaut: `factories = []` dans les props
- Gestion du cas vide avec message "Aucune usine disponible"

---

**Date:** 2025-11-16
**Statut:** ✅ Implémenté et Fonctionnel
**Fichiers Modifiés:**

- `src/components/bia/simple-file-upload.tsx` (MODIFIÉ)
- `src/app/(app)/bia/reports/page-client.tsx` (MODIFIÉ)
- `src/actions/bia/simple-upload-actions.ts` (MODIFIÉ)
- `src/actions/bia/bia-report-actions.ts` (MODIFIÉ - ajout factoryId)
