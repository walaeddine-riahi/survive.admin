# Ajout de Processus et Rapports depuis la Page Usine

## 📋 Vue d'ensemble

Cette fonctionnalité permet d'ajouter directement des processus BIA et de générer des rapports BIA depuis la page d'analyse d'une usine, avec **association automatique** à l'usine.

## ✨ Fonctionnalités ajoutées

### 1. Ajout de Processus BIA

**Composant**: `FactoryAddProcessDialog`
**Localisation**: `src/components/bia/factory-add-process-dialog.tsx`

#### Caractéristiques:

- ✅ **Association automatique** du processus à l'usine (`factoryId`)
- ✅ Formulaire complet avec tous les champs requis
- ✅ Validation côté client et serveur
- ✅ Localisation pré-remplie avec le nom de l'usine
- ✅ Gestion d'erreur avec messages explicites
- ✅ Rafraîchissement automatique de la page après création
- ✅ Notifications toast pour le feedback utilisateur

#### Champs du formulaire:

**Requis**:

- Nom du processus
- Département
- Criticité (critical, high, medium, low)
- RTO (Recovery Time Objective en heures)
- MTPD (Maximum Tolerable Period of Disruption en heures)
- RPO (Recovery Point Objective en heures)

**Optionnels**:

- Description
- Localisation (pré-rempli avec le nom de l'usine)
- Impact
- MBCO (Minimum Business Continuity Objective)

### 2. Génération de Rapports BIA

**Composant**: `FactoryAddReportDialog`
**Localisation**: `src/components/bia/factory-add-report-dialog.tsx`

#### Caractéristiques:

- ✅ **Association automatique** du rapport à l'usine (`factoryId`)
- ✅ Sélection multiple des processus de l'usine
- ✅ Boutons "Tout sélectionner" / "Tout désélectionner"
- ✅ Catégorie automatique (nom de l'usine)
- ✅ Choix du format (PDF, DOCX, HTML, JSON)
- ✅ Validation: Au moins un processus doit être sélectionné
- ✅ Désactivation si aucun processus n'existe
- ✅ Compteur de processus sélectionnés
- ✅ Notifications toast pour le feedback

#### Champs du formulaire:

**Requis**:

- Nom du rapport
- Format (PDF, DOCX, HTML, JSON)
- Au moins un processus sélectionné

**Optionnels**:

- Description

**Automatiques**:

- `factoryId`: ID de l'usine
- `category`: Nom de l'usine
- `includedProcessIds`: IDs des processus sélectionnés

## 🎯 Page d'analyse modifiée

**Fichier**: `src/app/(app)/bia/factories/[id]/analysis/page.tsx`

### Modifications apportées:

1. **Import des composants**:

```typescript
import { FactoryAddProcessDialog } from "@/components/bia/factory-add-process-dialog";
import { FactoryAddReportDialog } from "@/components/bia/factory-add-report-dialog";
```

2. **Section Processus Critiques**:

   - Ajout du bouton "Ajouter un Processus" dans le header de la card
   - Le bouton ouvre le dialog de création

3. **Section Rapports BIA**:
   - Ajout du bouton "Générer un Rapport" dans le header de la card
   - Le bouton ouvre le dialog de génération
   - Passage des processus de l'usine pour la sélection

## 🔄 Flux de création

### Flux de création de processus

```
┌───────────────────────────────────────────────────────────────┐
│ 1. Utilisateur clique "Ajouter un Processus"                 │
│    - Depuis la page /bia/factories/[id]/analysis             │
└─────────────────┬─────────────────────────────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────────────────────────────┐
│ 2. Dialog s'ouvre avec formulaire                            │
│    - factoryId pré-rempli (caché)                            │
│    - Localisation pré-remplie avec nom usine                 │
└─────────────────┬─────────────────────────────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────────────────────────────┐
│ 3. Utilisateur remplit le formulaire                         │
│    - Nom, département, criticité (requis)                    │
│    - RTO, MTPD, RPO (requis)                                 │
│    - Description, impact, MBCO (optionnels)                  │
└─────────────────┬─────────────────────────────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────────────────────────────┐
│ 4. Soumission → POST /api/bia/processes                      │
│    - Data envoyée avec factoryId                             │
└─────────────────┬─────────────────────────────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────────────────────────────┐
│ 5. Serveur crée le processus                                 │
│    - Association automatique: process.factoryId = factoryId  │
│    - Retourne le processus créé                              │
└─────────────────┬─────────────────────────────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────────────────────────────┐
│ 6. Client affiche succès                                     │
│    - Toast: "Processus créé avec succès"                     │
│    - Dialog se ferme                                         │
│    - Page se rafraîchit (router.refresh())                   │
│    - Le nouveau processus apparaît dans la liste             │
└───────────────────────────────────────────────────────────────┘
```

### Flux de génération de rapport

```
┌───────────────────────────────────────────────────────────────┐
│ 1. Utilisateur clique "Générer un Rapport"                   │
│    - Depuis la page /bia/factories/[id]/analysis             │
└─────────────────┬─────────────────────────────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────────────────────────────┐
│ 2. Dialog s'ouvre avec la liste des processus                │
│    - factoryId pré-rempli (caché)                            │
│    - Liste des processus de l'usine affichée                 │
│    - Aucun processus sélectionné par défaut                  │
└─────────────────┬─────────────────────────────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────────────────────────────┐
│ 3. Utilisateur configure le rapport                          │
│    - Nom du rapport                                          │
│    - Format (PDF/DOCX/HTML/JSON)                             │
│    - Sélection des processus (au moins 1)                    │
│    - Description (optionnel)                                 │
└─────────────────┬─────────────────────────────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────────────────────────────┐
│ 4. Soumission → POST /api/bia/reports/generate               │
│    - Data: factoryId, includedProcessIds, category, format   │
└─────────────────┬─────────────────────────────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────────────────────────────┐
│ 5. Serveur génère le rapport                                 │
│    - Association automatique: report.factoryId = factoryId   │
│    - Catégorie automatique: report.category = factoryName    │
│    - Inclut les processus sélectionnés                       │
│    - Génère le fichier selon le format                       │
└─────────────────┬─────────────────────────────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────────────────────────────┐
│ 6. Client affiche succès                                     │
│    - Toast: "Rapport BIA créé avec succès"                   │
│    - Montre le nombre de processus inclus                    │
│    - Dialog se ferme                                         │
│    - Page se rafraîchit (router.refresh())                   │
│    - Le nouveau rapport apparaît dans la liste               │
└───────────────────────────────────────────────────────────────┘
```

## 🎨 Interface utilisateur

### Page d'analyse de l'usine

```
┌─────────────────────────────────────────────────────────────┐
│ ← Retour aux usines                                         │
├─────────────────────────────────────────────────────────────┤
│ 🏭 Usine de Production A          ✓ Active                  │
│ Code: UPA                                                   │
├─────────────────────────────────────────────────────────────┤
│ 📊 Statistiques                                             │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                           │
│ │  5  │ │  2  │ │ 24h │ │  3  │                           │
│ └─────┘ └─────┘ └─────┘ └─────┘                           │
├─────────────────────────────────────────────────────────────┤
│ Processus Critiques              [+ Ajouter un Processus] │ ← NOUVEAU
│ 5 processus associés à cette usine                         │
│                                                             │
│ • Production principale (Critique)                          │
│ • Logistique (Élevé)                                       │
│ • ...                                                       │
├─────────────────────────────────────────────────────────────┤
│ Rapports BIA                     [📄 Générer un Rapport]  │ ← NOUVEAU
│ 3 rapports générés pour cette usine                        │
│                                                             │
│ • Rapport BIA - Nov 2025 (GENERATED)                       │
│ • Rapport BIA - Oct 2025 (ARCHIVED)                        │
└─────────────────────────────────────────────────────────────┘
```

### Dialog d'ajout de processus

```
┌───────────────────────────────────────────────────────────────┐
│ Nouveau Processus pour Usine de Production A                 │
│ Créer un nouveau processus BIA associé à cette usine          │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│ Nom du Processus *          │ Département *                  │
│ [Production principale]     │ [Production]                   │
│                                                               │
│ Description                                                   │
│ [─────────────────────────────────────────────────────]      │
│                                                               │
│ Localisation                │ Criticité *                    │
│ [Usine de Production A]     │ [🔴 Critique ▼]                │
│                                                               │
│ RTO (heures) * │ MTPD (heures) * │ RPO (heures) *           │
│ [24]           │ [48]            │ [4]                       │
│                                                               │
│ Impact                      │ MBCO                           │
│ [Moyen]                     │ [Maintien partiel]             │
│                                                               │
│                              [Annuler] [Créer le Processus]  │
└───────────────────────────────────────────────────────────────┘
```

### Dialog de génération de rapport

```
┌───────────────────────────────────────────────────────────────┐
│ Nouveau Rapport BIA pour Usine de Production A               │
│ Générer un rapport d'analyse d'impact métier pour cette usine│
├───────────────────────────────────────────────────────────────┤
│                                                               │
│ Nom du Rapport *                                              │
│ [Rapport BIA - Usine de Production A - 16/11/2025]           │
│                                                               │
│ Description                                                   │
│ [─────────────────────────────────────────────────────]      │
│                                                               │
│ Format du Rapport *                                           │
│ [📄 PDF ▼]                                                    │
│                                                               │
│ Processus à inclure (3/5)     [Tout sélectionner] [Tout...] │
│ ┌───────────────────────────────────────────────────────────┐│
│ │ ☑ Production principale (Criticité: critical)             ││
│ │ ☑ Logistique (Criticité: high)                           ││
│ │ ☑ Maintenance (Criticité: medium)                        ││
│ │ ☐ Support (Criticité: low)                               ││
│ │ ☐ Administration (Criticité: low)                        ││
│ └───────────────────────────────────────────────────────────┘│
│                                                               │
│                              [Annuler] [Générer le Rapport]  │
└───────────────────────────────────────────────────────────────┘
```

## 🔗 Relations automatiques

### Dans la base de données

```typescript
// Processus créé
{
  id: "abc123",
  name: "Production principale",
  department: "Production",
  criticality: "critical",
  factoryId: "factory-id-xyz",  // ✅ Association automatique
  // ... autres champs
}

// Rapport créé
{
  id: "def456",
  name: "Rapport BIA - Nov 2025",
  format: "PDF",
  factoryId: "factory-id-xyz",  // ✅ Association automatique
  category: "Usine de Production A",  // ✅ Catégorie automatique
  includedProcessIds: ["abc123", "ghi789"],  // ✅ Processus sélectionnés
  // ... autres champs
}
```

## 📊 Avantages de cette approche

### 1. Workflow optimisé

- ✅ Pas besoin de quitter la page de l'usine
- ✅ Association automatique = moins d'erreurs
- ✅ Contexte préservé (on reste sur l'usine)

### 2. Cohérence des données

- ✅ Impossible d'oublier d'associer le processus/rapport à l'usine
- ✅ Catégorie automatique basée sur l'usine
- ✅ Localisation pré-remplie

### 3. Expérience utilisateur

- ✅ Interface intuitive avec dialogs modaux
- ✅ Feedback immédiat (toast notifications)
- ✅ Rafraîchissement automatique des listes
- ✅ Validation en temps réel

### 4. Vue consolidée

- ✅ Voir tous les processus de l'usine en un coup d'œil
- ✅ Sélectionner exactement les processus pertinents pour un rapport
- ✅ Statistiques mises à jour en temps réel

## 🧪 Tests suggérés

### Test 1: Création de processus

1. Aller sur `/bia/factories/[id]/analysis`
2. Cliquer sur "Ajouter un Processus"
3. Remplir le formulaire minimal (nom, département, criticité, RTO, MTPD, RPO)
4. Soumettre
5. ✅ Vérifier que le processus apparaît dans la liste
6. ✅ Vérifier dans `/bia` (liste globale) que le processus a le bon `factoryId`

### Test 2: Génération de rapport sans processus

1. Créer une nouvelle usine sans processus
2. Aller sur sa page d'analyse
3. Cliquer sur "Générer un Rapport"
4. ✅ Vérifier qu'un message indique qu'il faut d'abord ajouter des processus
5. ✅ Vérifier que le bouton "Générer le Rapport" est désactivé

### Test 3: Génération de rapport avec sélection

1. Aller sur `/bia/factories/[id]/analysis` d'une usine avec 5 processus
2. Cliquer sur "Générer un Rapport"
3. Sélectionner 3 processus sur 5
4. Choisir le format PDF
5. Soumettre
6. ✅ Vérifier que le rapport apparaît dans la liste
7. ✅ Vérifier qu'il contient bien 3 processus
8. ✅ Vérifier que `factoryId` et `category` sont corrects

### Test 4: Bouton "Tout sélectionner"

1. Ouvrir le dialog de génération de rapport
2. Cliquer sur "Tout sélectionner"
3. ✅ Vérifier que tous les processus sont cochés
4. ✅ Vérifier que le compteur affiche "(5/5)"
5. Cliquer sur "Tout désélectionner"
6. ✅ Vérifier que tous les processus sont décochés
7. ✅ Vérifier que le compteur affiche "(0/5)"

## 📝 Notes techniques

### API utilisées

**Pour les processus**:

- `POST /api/bia/processes` (à créer ou vérifier qu'elle existe)
- Body: `{ name, department, criticality, rto, mtpd, rpo, factoryId, ... }`

**Pour les rapports**:

- `POST /api/bia/reports/generate`
- Body: `{ name, format, factoryId, category, includedProcessIds, ... }`

### Dépendances

```json
{
  "lucide-react": "icônes",
  "sonner": "notifications toast",
  "@/components/ui/dialog": "modals",
  "@/components/ui/select": "dropdowns",
  "@/components/ui/input": "champs texte",
  "@/components/ui/textarea": "champs multi-lignes",
  "@/components/ui/button": "boutons",
  "@/components/ui/label": "labels"
}
```

### État des composants

Les deux composants sont des **Client Components** (`"use client"`) car ils:

- Gèrent l'état local (formulaires)
- Utilisent des hooks (useState, useRouter)
- Écoutent des événements utilisateur
- Communiquent avec l'API

La page parent reste un **Server Component** pour:

- Récupérer les données de l'usine
- Optimiser les performances
- Éviter les waterfalls

## ✅ Checklist de validation

- [x] Composant `FactoryAddProcessDialog` créé
- [x] Composant `FactoryAddReportDialog` créé
- [x] Page d'analyse modifiée avec les deux boutons
- [x] Association automatique du `factoryId`
- [x] Catégorie automatique pour les rapports
- [x] Validation: au moins 1 processus pour générer un rapport
- [x] Gestion d'erreur avec messages explicites
- [x] Notifications toast
- [x] Rafraîchissement automatique après création
- [x] Aucune erreur TypeScript
- [x] Accessibilité des formulaires (labels, required)

---

**Date de création**: 16 novembre 2025  
**Version**: 1.0  
**Statut**: ✅ Implémenté et fonctionnel
