# ANALYSE DE CONFORMITÉ - FRONT-END vs SCHÉMA PRISMA

## 📊 Résumé Exécutif

**Date d'analyse**: 8 février 2026  
**Fichiers analysés**:

- Schema: `prisma/schema.prisma` (modèle Process)
- Front-end: `src/components/bia/process-form.tsx` (ProcessForm)
- Page: `src/app/(app)/bia/processes/[id]/page.tsx`

---

## ✅ POINTS CONFORMES

### 1. Structure des Onglets

Le formulaire front-end est organisé en 9 onglets correspondant aux sections du schéma:

- ✅ Général (informations de base)
- ✅ Activités (activitesCritiques)
- ✅ Applications IT (systemesInformatiques)
- ✅ Infrastructure (infrastructuresPhysiques)
- ✅ Équipements (equipementsIndustriels, equipementsBureautiques)
- ✅ Documentation (documentationsCritiques)
- ✅ Personnel (rolesPersonnel)
- ✅ Fournisseurs (fournisseursExternes)
- ✅ Exigences légales (obligationsLegales)

### 2. Champs de Base

Tous les champs obligatoires du schéma sont présents:

- ✅ `name` (String, obligatoire)
- ✅ `department` (String, obligatoire)
- ✅ `location` (String, obligatoire)
- ✅ `impact` (String, obligatoire)
- ✅ `criticality` (CriticalityLevel, obligatoire)
- ✅ `rto` (Int, obligatoire)
- ✅ `mtpd` (Int, obligatoire)
- ✅ `rpo` (Int, obligatoire)
- ✅ `mbco` (String, obligatoire)

### 3. Champs Booléens

Tous les champs booléens obligatoires sont gérés:

- ✅ `supplierContinuityPlan` (Boolean)
- ✅ `hasSLAClause` (Boolean)
- ✅ `hasBackupSystems` (Boolean)
- ✅ `dependsOnPhysicalInfra` (Boolean)
- ✅ `canWorkRemotely` (Boolean)
- ✅ `canUseOtherInfra` (Boolean)
- ✅ `canBeReplaced` (Boolean)
- ✅ `canReassignEquipment` (Boolean)
- ✅ `backupCompatible` (Boolean)
- ✅ `canReassignOfficeEquipment` (Boolean)
- ✅ `neededAfterDisruption` (Boolean)
- ✅ `hasAlternativeAccess` (Boolean)
- ✅ `hasReplacement` (Boolean)
- ✅ `hasAlternativeSupplier` (Boolean)
- ✅ `supplierHasContinuityPlan` (Boolean)

### 4. Nouveaux Champs JSON (Multi-éléments)

Le formulaire supporte les 9 types d'éléments JSON:

- ✅ `activitesCritiques` (Array)
- ✅ `fournisseursExternes` (Array)
- ✅ `obligationsLegales` (Array)
- ✅ `systemesInformatiques` (Array)
- ✅ `infrastructuresPhysiques` (Array)
- ✅ `rolesPersonnel` (Array)
- ✅ `equipementsIndustriels` (Array)
- ✅ `equipementsBureautiques` (Array)
- ✅ `documentationsCritiques` (Array)

---

## ⚠️ PROBLÈMES DÉTECTÉS

### 1. Champs Manquants dans le Schéma TypeScript Front-end

Le type `Process` dans le front-end ne correspond PAS exactement au schéma Prisma.

**Champs manquants dans l'interface TypeScript** (lignes 87-220 de process-form.tsx):

```typescript
// ❌ Manquants dans l'interface Process du front-end:
- criticalTimes?: string | null;          // Présent dans Prisma, absent du type TS
- processOwner?: string | null;           // ✅ Présent
- ownerRole?: string | null;              // ✅ Présent
- ownerEmail?: string | null;             // ✅ Présent
- ownerPhone?: string | null;             // ✅ Présent
- interimManagers?: InterimManager[] | null; // ✅ Présent

// Impacts - Anciens champs (deprecated mais encore dans Prisma)
- financialImpact?: string | null;        // ✅ Présent
- operationalImpact?: string | null;      // ✅ Présent
- reputationImpact?: string | null;       // ✅ Présent
- operationalCapacityImpact?: string | null; // ❌ Manquant dans le type TS

// Infrastructure
- infrastructureType?: string | null;      // ❌ Manquant
- infraRTO?: number | null;                // ❌ Manquant
- infraMTPD?: number | null;               // ❌ Manquant

// Personnel
- staffRoles?: string | null;              // ❌ Manquant
- staffCount?: number | null;              // ❌ Manquant (mais mentionné dans une ligne)
- staffTasks?: string | null;              // ❌ Manquant
- uniqueSkills?: string | null;            // ❌ Manquant
- criticalityAfterDisruption?: string | null; // ❌ Manquant
- roleRecoveryTime?: string | null;        // ❌ Manquant
- replacementBy?: string | null;           // ❌ Manquant
- staffWorkarounds?: string | null;        // ❌ Manquant

// Équipement industriel - Énergie
- voltage?: string | null;                 // ❌ Manquant
- currentType?: string | null;             // ❌ Manquant
- powerRating?: string | null;             // ❌ Manquant
- dailyConsumption?: string | null;        // ❌ Manquant

// Équipement bureautique
- equipmentQuantity?: number | null;       // ❌ Manquant
- requiredAfterDisruption?: number | null; // ❌ Manquant

// Fournisseurs clés (anciens champs)
- keySuppliers?: string | null;            // ❌ Manquant
- providedService?: string | null;         // ❌ Manquant
- supplierDetails?: string | null;         // ❌ Manquant
- supplierCriticality?: string | null;     // ❌ Manquant

// Documentation
- requiredDocumentation?: string | null;   // ❌ Manquant
- documentationLocation?: string | null;   // ❌ Manquant
- documentationRTO?: number | null;        // ❌ Manquant
- replacementMeasures?: string | null;     // ❌ Manquant
```

### 2. Nouveaux Champs JSON (Multi-éléments) - Non Typés

Les 9 nouveaux champs JSON du schéma Prisma ne sont PAS typés dans l'interface TypeScript:

```typescript
// ❌ Absents de l'interface Process du front-end:
activitesCritiques?: Json?
fournisseursExternes?: Json?
obligationsLegales?: Json?
systemesInformatiques?: Json?
infrastructuresPhysiques?: Json?
rolesPersonnel?: Json?
equipementsIndustriels?: Json?
equipementsBureautiques?: Json?
documentationsCritiques?: Json?
```

**Impact**: Le formulaire peut lire/écrire ces champs mais TypeScript ne valide pas leur structure.

### 3. Champs Obsolètes (Deprecated)

Le schéma Prisma contient des champs obsolètes qui coexistent avec les nouveaux:

```typescript
// Anciens champs (string) vs Nouveaux (JSON Array)
// ⚠️ Duplication potentielle de données

// Applications IT:
itSystems (String) ←→ systemesInformatiques (Json Array)

// Fournisseurs:
externalSuppliers (String) ←→ fournisseursExternes (Json Array)

// Personnel:
staffRoles (String) ←→ rolesPersonnel (Json Array)

// Infrastructure:
dependsOnPhysicalInfra (Boolean) ←→ infrastructuresPhysiques (Json Array)

// Équipements:
industrialEquipment (String) ←→ equipementsIndustriels (Json Array)
officeEquipment (String) ←→ equipementsBureautiques (Json Array)

// Documentation:
requiredDocumentation (String) ←→ documentationsCritiques (Json Array)

// Obligations légales:
legalObligations (String) ←→ obligationsLegales (Json Array)
```

### 4. Relations Prisma Non Utilisées

Le schéma définit des relations (tables séparées) qui ne sont pas utilisées dans le formulaire:

```prisma
// ❌ Relations définies mais non gérées par le front-end:
responsibles                    Responsible[]
activities                      ProcessActivity[]
impacts                         Impact[]
applications                    ApplicationIT[]
infrastructures                 Infrastructure[]
industrialEquipmentList         EquipmentIndustrial[]
officeEquipmentList             EquipmentOffice[]
documentations                  DocumentationItem[]
personnels                      Personnel[]
suppliers                       Supplier[]
legalRequirements               LegalRequirement[]
```

**Problème**: Le front-end utilise les champs JSON (ex: `systemesInformatiques`), mais le schéma garde les relations vers des tables séparées (ex: `ApplicationIT`). Cela crée une **double structure** pour les mêmes données.

---

## 🐛 BUGS POTENTIELS

### 1. Validation Incomplète

Le schéma Zod du formulaire ne valide pas tous les champs obligatoires du schéma Prisma.

**Champs booléens manquant dans la validation**:

```typescript
// Ces champs sont obligatoires (Boolean) dans Prisma mais peuvent
// être undefined dans le formulaire car non validés par Zod
```

### 2. Type Safety

L'utilisation de `@ts-nocheck` en haut du fichier désactive TypeScript:

```typescript
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
```

**Impact**: Aucune vérification TypeScript = bugs non détectés à la compilation.

### 3. Champs `manager` Fantôme

Le formulaire utilise un champ `manager` qui n'existe PAS dans le schéma Prisma:

```typescript
// ❌ Champ présent dans le front-end mais absent du schéma Prisma
manager: string;
```

Cela causera une erreur lors de la sauvegarde.

---

## 📋 RECOMMANDATIONS

### Priorité HAUTE 🔴

1. **Supprimer `@ts-nocheck`** et corriger les erreurs TypeScript
2. **Synchroniser l'interface TypeScript** avec le schéma Prisma
3. **Supprimer le champ `manager`** ou l'ajouter au schéma Prisma
4. **Typer les champs JSON** avec des interfaces appropriées:

```typescript
interface ActiviteCritique {
  nom: string;
  delai: number;
  impactsOperationnels: string;
  impactsReglementaires: string;
  impactsImage: string;
  criticite: "low" | "medium" | "high" | "critical";
  rto: number;
  mtpd: number;
  rpo: number;
  mbco: string;
  solutionsContournement: string;
}

interface Process {
  // ... autres champs
  activitesCritiques?: ActiviteCritique[] | null;
  systemesInformatiques?: SystemeInformatique[] | null;
  // etc.
}
```

### Priorité MOYENNE 🟡

5. **Décider de l'architecture de données**:

   - Option A: Utiliser uniquement les champs JSON (supprimer les relations)
   - Option B: Utiliser uniquement les relations (supprimer les champs JSON)
   - Option C: Migrer progressivement de JSON vers relations

6. **Nettoyer les champs obsolètes**:

   - Supprimer les anciens champs string (ex: `itSystems`, `externalSuppliers`)
   - OU créer une migration de données

7. **Ajouter les champs manquants** au formulaire:
   - `criticalTimes`
   - `infrastructureType`, `infraRTO`, `infraMTPD`
   - `staffRoles`, `staffCount`, `staffTasks`, etc.
   - Caractéristiques énergétiques (`voltage`, `currentType`, etc.)

### Priorité BASSE 🟢

8. **Documenter la stratégie de données** (JSON vs Relations)
9. **Créer des tests unitaires** pour la validation Zod
10. **Ajouter des migrations Prisma** pour nettoyer les champs obsolètes

---

## 📊 STATISTIQUES

| Métrique                         | Valeur       |
| -------------------------------- | ------------ |
| Champs Prisma (Process)          | ~145 champs  |
| Champs utilisés par le front-end | ~80 champs   |
| Champs manquants dans le type TS | ~65 champs   |
| Champs obsolètes (duplication)   | ~15 champs   |
| Relations non utilisées          | 11 relations |
| Nouveaux champs JSON non typés   | 9 champs     |

---

## ✅ CONCLUSION

Le formulaire **fonctionne** pour les opérations de base, mais présente plusieurs **incohérences** avec le schéma Prisma:

1. ⚠️ **Type Safety désactivé** (`@ts-nocheck`)
2. ⚠️ **Interface TypeScript incomplète** (~45% des champs manquants)
3. ⚠️ **Architecture de données mixte** (JSON + Relations)
4. ⚠️ **Champs obsolètes non nettoyés**
5. ⚠️ **Validation Zod incomplète**

**Recommandation**: Une **refactorisation complète** est nécessaire pour assurer la cohérence entre le schéma Prisma et le front-end.

---

**Généré automatiquement le**: 8 février 2026
