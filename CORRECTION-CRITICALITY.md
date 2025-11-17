# Correction du problème de Criticality

## Problème rencontré

Erreur lors de la création/modification d'un processus BIA :

```
Invalid value for argument `criticality`. Expected CriticalityLevel.
```

## Cause

- **Schéma Zod** (formulaire) : Utilise `"LOW" | "MEDIUM" | "HIGH" | "CRITICAL"` (majuscules)
- **Schéma Prisma** (base de données) : Attend `"low" | "medium" | "high" | "critical"` (minuscules)
- **Incompatibilité** : Les valeurs du formulaire n'étaient pas converties avant l'insertion en base

## Solution appliquée

### 1. Fonction `createProcess` (ligne 280)

```typescript
// Convertir criticality en minuscules si présent
const normalizedCriticality = data.criticality
  ? (data.criticality.toLowerCase() as "low" | "medium" | "high" | "critical")
  : "medium";

const processData: Record<string, unknown> = {
  // ...
  criticality: normalizedCriticality,
  // ...
};
```

### 2. Fonction `updateProcess` (ligne 490)

```typescript
// Convertir criticality en minuscules si présent
const normalizedCriticality = data.criticality
  ? (data.criticality.toLowerCase() as "low" | "medium" | "high" | "critical")
  : undefined;

const updateData: any = {
  // ...
  criticality: normalizedCriticality || data.criticality,
  // ...
};
```

### 3. Script de test (scripts/test-bia-form-fill.ts)

```typescript
criticality: 'critical',  // ✅ Minuscules pour Prisma direct
```

## Fichiers modifiés

1. ✅ `src/actions/bia/process-actions.ts` - Ajout de la normalisation dans `createProcess` et `updateProcess`
2. ✅ `scripts/test-bia-form-fill.ts` - Correction de `'CRITICAL'` → `'critical'`

## Architecture de validation

```
┌─────────────────┐
│   Formulaire    │
│   (React Hook   │
│     Form)       │
└────────┬────────┘
         │
         │ Validation Zod
         │ ↓ "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
         │
┌────────▼────────┐
│  Process Schema │
│   (Zod)         │
│  Majuscules     │
└────────┬────────┘
         │
         │ Submit
         │
┌────────▼────────┐
│ Process Actions │
│ ✨ NORMALISE ✨ │
│ ↓ toLowerCase() │
└────────┬────────┘
         │
         │ "low" | "medium" | "high" | "critical"
         │
┌────────▼────────┐
│  Prisma Client  │
│  (MongoDB)      │
│  Minuscules     │
└─────────────────┘
```

## Test de validation

### Avant la correction

```
❌ Error: Invalid value for argument `criticality`. Expected CriticalityLevel.
```

### Après la correction

```
✅ Processus créé avec succès
✅ Criticality: critical (minuscules en base)
```

## Points d'attention

1. **Cohérence** : Le formulaire continue d'utiliser les majuscules (UX)
2. **Transparence** : La conversion est automatique côté serveur
3. **Rétrocompatibilité** : Les deux formats sont acceptés (la normalisation gère les deux cas)

## Valeurs acceptées

| Formulaire (Zod) | Base de données (Prisma) |
| ---------------- | ------------------------ |
| `"LOW"`          | `"low"`                  |
| `"MEDIUM"`       | `"medium"`               |
| `"HIGH"`         | `"high"`                 |
| `"CRITICAL"`     | `"critical"`             |

---

**Date**: 17 novembre 2025  
**Statut**: ✅ Résolu  
**Impact**: Création et modification de processus BIA fonctionnelles
