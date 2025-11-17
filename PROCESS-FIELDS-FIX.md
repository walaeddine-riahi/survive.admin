# 🔧 Correction: Champs de Processus Manquants

## 🐛 Problème

**Erreur:** "Failed to create process" lors de l'ajout d'un processus depuis un rapport

**Cause:** Incohérence entre les champs du formulaire et le schéma Prisma

### Problèmes Identifiés

1. **Champs obligatoires manquants:**

   - `ProcessInput` exigeait: `department`, `location`, `impact`, `mbco`
   - Composant envoyait: `name`, `description`, `criticality`, `rto`, `rpo`, `mtpd`

2. **Noms de champs incorrects:**
   - Composant utilisait: `owner`, `ownerContact`
   - Schéma Prisma attend: `processOwner`, `ownerEmail`, `ownerPhone`

## ✅ Solution Implémentée

### 1. Type ProcessInput - Champs Optionnels

**Fichier:** `src/actions/bia/process-actions.ts`

**Avant:**

```typescript
type ProcessInput = {
  name: string;
  department: string; // ❌ Obligatoire
  location: string; // ❌ Obligatoire
  impact: string; // ❌ Obligatoire
  criticality: "low" | "medium" | "high" | "critical";
  rto: number;
  mtpd: number;
  rpo: number;
  mbco: string; // ❌ Obligatoire
};
```

**Après:**

```typescript
type ProcessInput = {
  name: string;
  department?: string; // ✅ Optionnel
  location?: string; // ✅ Optionnel
  category?: string; // ✅ Ajouté pour l'usine
  impact?: string; // ✅ Optionnel
  criticality?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"; // ✅ Optionnel
  rto?: number;
  mtpd?: number;
  rpo?: number;
  mbco?: string; // ✅ Optionnel

  // ✅ Champs corrigés
  processOwner?: string | null;
  ownerRole?: string | null;
  ownerEmail?: string | null;
  ownerPhone?: string | null;
};
```

### 2. Fonction createProcess - Valeurs Par Défaut

**Avant:**

```typescript
const processData = {
  name: data.name,
  department: data.department,  // ❌ Crash si undefined
  location: data.location,      // ❌ Crash si undefined
  ...
};
```

**Après:**

```typescript
const processData: Record<string, unknown> = {
  name: data.name,
  department: data.department || "Non défini",      // ✅ Valeur par défaut
  location: data.location || "Non défini",          // ✅ Valeur par défaut
  category: data.category || null,                   // ✅ Nouveau
  impact: data.impact || "Moyen",                    // ✅ Valeur par défaut
  criticality: data.criticality || "MEDIUM",        // ✅ Valeur par défaut
  rto: data.rto || 0,
  mtpd: data.mtpd || 0,
  rpo: data.rpo || 0,
  mbco: data.mbco || "0",                           // ✅ Valeur par défaut
  processOwner: data.processOwner || null,           // ✅ Corrigé
  ownerRole: data.ownerRole || null,                 // ✅ Corrigé
  ownerEmail: data.ownerEmail || null,               // ✅ Corrigé
  ownerPhone: data.ownerPhone || null,               // ✅ Nouveau
  ...
};
```

### 3. Composant ReportAddProcessDialog - Champs Corrigés

**Fichier:** `src/components/bia/report-add-process-dialog.tsx`

**Avant:**

```typescript
const [formData, setFormData] = useState({
  name: "",
  owner: "",              // ❌ Incorrect
  ownerContact: "",       // ❌ Incorrect
  ...
});
```

**Après:**

```typescript
const [formData, setFormData] = useState({
  name: "",
  processOwner: "",       // ✅ Corrigé
  ownerRole: "",          // ✅ Corrigé
  ownerEmail: "",         // ✅ Corrigé
  ...
});
```

**Labels du Formulaire:**

```tsx
{/* Avant */}
<Label htmlFor="owner">Nom complet</Label>
<Input id="owner" value={formData.owner} ... />

<Label htmlFor="ownerContact">Contact (email ou téléphone)</Label>
<Input id="ownerContact" value={formData.ownerContact} ... />

{/* Après */}
<Label htmlFor="processOwner">Nom complet</Label>
<Input id="processOwner" value={formData.processOwner} ... />

<Label htmlFor="ownerEmail">Email</Label>
<Input id="ownerEmail" type="email" value={formData.ownerEmail} ... />
```

## 📋 Schéma Prisma - Référence

```prisma
model Process {
  id              String @id @default(auto()) @map("_id") @db.ObjectId
  name            String
  description     String?
  department      String          // Requis
  location        String          // Requis
  category        String?         // Optionnel (usine)
  impact          String          // Requis
  criticality     CriticalityLevel // Requis (ENUM)

  // Responsable
  processOwner    String?         // Nom
  ownerRole       String?         // Fonction
  ownerEmail      String?         // Email
  ownerPhone      String?         // Téléphone

  // Métriques BIA
  rto             Int             // Recovery Time Objective
  mtpd            Int             // Maximum Tolerable Period
  rpo             Int             // Recovery Point Objective
  mbco            String          // Minimum Business Continuity

  ...
}

enum CriticalityLevel {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}
```

## 🔄 Workflow Corrigé

### Avant (Cassé)

```
User → Remplit formulaire
    → Envoie { name, owner, ownerContact, criticality, ... }
    → API /api/bia/processes
    → createProcess(data)
    → ❌ ERREUR: department manquant
    → ❌ ERREUR: owner n'existe pas dans le schéma
```

### Après (Fonctionnel)

```
User → Remplit formulaire
    → Envoie { name, processOwner, ownerEmail, criticality, category, ... }
    → API /api/bia/processes
    → createProcess(data)
    → ✅ Valeurs par défaut appliquées: department="Non défini", impact="Moyen"
    → ✅ Processus créé avec succès
    → ✅ Ajouté au rapport (includedProcessIds)
```

## ✨ Améliorations

1. **Flexibilité**

   - Les champs non critiques sont maintenant optionnels
   - Valeurs par défaut sensées pour les champs manquants

2. **Cohérence**

   - Noms de champs alignés avec le schéma Prisma
   - Types de criticité en majuscules (LOW, MEDIUM, HIGH, CRITICAL)

3. **Robustesse**
   - Plus de crash si un champ est omis
   - Création de processus simplifiée possible

## 📝 Champs du Formulaire

| Champ        | Type   | Requis | Valeur par défaut        |
| ------------ | ------ | ------ | ------------------------ |
| name         | string | ✅ Oui | -                        |
| description  | string | ❌ Non | null                     |
| department   | string | ❌ Non | "Non défini"             |
| category     | string | ❌ Non | null (hérité du rapport) |
| criticality  | enum   | ❌ Non | "MEDIUM"                 |
| rto          | number | ❌ Non | 0                        |
| rpo          | number | ❌ Non | 0                        |
| mtpd         | number | ❌ Non | 0                        |
| mbco         | string | ❌ Non | "0"                      |
| processOwner | string | ❌ Non | null                     |
| ownerRole    | string | ❌ Non | null                     |
| ownerEmail   | string | ❌ Non | null                     |

## 🎯 Cas d'Usage

### Cas 1: Processus Minimal

```typescript
// Utilisateur remplit seulement le nom
{
  name: "Gestion des commandes"
}

// Processus créé avec:
{
  name: "Gestion des commandes",
  department: "Non défini",      // ✅ Par défaut
  location: "Non défini",        // ✅ Par défaut
  impact: "Moyen",               // ✅ Par défaut
  criticality: "MEDIUM",         // ✅ Par défaut
  rto: 0,
  rpo: 0,
  mtpd: 0,
  mbco: "0"
}
```

### Cas 2: Processus Complet

```typescript
{
  name: "Gestion des commandes",
  description: "Processus critique de gestion des commandes clients",
  department: "Logistique",
  category: "Usine A",
  criticality: "HIGH",
  rto: 24,
  rpo: 4,
  mtpd: 72,
  mbco: "48",
  processOwner: "Jean Dupont",
  ownerRole: "Responsable Logistique",
  ownerEmail: "jean.dupont@example.com"
}
```

---

**Date:** 2025-11-16
**Statut:** ✅ Corrigé et Testé
**Fichiers Modifiés:**

- `src/actions/bia/process-actions.ts` (TYPE + VALEURS PAR DÉFAUT)
- `src/components/bia/report-add-process-dialog.tsx` (CHAMPS CORRIGÉS)
