# 📊 Fonctionnalité: Ajouter des Processus aux Rapports BIA

## 🎯 Objectif

Permettre aux utilisateurs d'ajouter de nouveaux processus BIA directement depuis la page d'un rapport, tout comme ils peuvent le faire depuis la page d'analyse d'une usine.

## ✅ Implémentation Complète

### 1. Composant Dialog Créé

**Fichier:** `src/components/bia/report-add-process-dialog.tsx`

**Fonctionnalités:**

- ✅ Formulaire complet pour créer un nouveau processus
- ✅ Héritage automatique de l'usine (category) du rapport
- ✅ Ajout automatique du processus au rapport (mise à jour de `includedProcessIds`)
- ✅ Validation des champs requis
- ✅ Notifications de succès/erreur avec toast

**Props:**

```typescript
interface ReportAddProcessDialogProps {
  reportId: string; // ID du rapport
  reportName: string; // Nom du rapport (affichage)
  reportCategory?: string; // Usine du rapport (hérité par le processus)
  currentProcessIds?: string[]; // IDs des processus déjà inclus
  onSuccess?: () => void; // Callback après succès
}
```

**Champs du Formulaire:**

- Nom du processus (requis)
- Description
- Département
- Criticité: CRITICAL | HIGH | MEDIUM | LOW (requis)
- Métriques BIA: RTO, RPO, MTPD, MBCO (en heures)
- Responsable: Nom, Rôle, Contact

### 2. Route API Créée

**Fichier:** `src/app/api/bia/reports/[id]/route.ts`

**Méthodes:**

- ✅ **GET**: Récupérer un rapport avec ses relations (author, factory)
- ✅ **PUT**: Mettre à jour un rapport (notamment `includedProcessIds`)
- ✅ **DELETE**: Supprimer un rapport (avec vérification de permission)

**Sécurité:**

- Authentification requise
- Vérification de propriété (seul l'auteur peut modifier/supprimer)
- Validation des données

**Mise à jour automatique:**

- Quand `includedProcessIds` est modifié → `totalProcesses` est mis à jour automatiquement

### 3. Intégration dans la Page du Rapport

**Fichier:** `src/app/(app)/bia/reports/[id]/page.tsx`

**Modifications:**

- ✅ Import du composant `ReportAddProcessDialog`
- ✅ Nouvelle section "Gestion des Processus" après les métriques principales
- ✅ Bouton "Ajouter un Processus" dans le header de la section
- ✅ Affichage du nombre actuel de processus
- ✅ Astuce pour expliquer l'héritage de l'usine
- ✅ Rechargement de la page après ajout réussi

## 📋 Workflow Utilisateur

1. **L'utilisateur ouvre un rapport BIA**

   - Voit le nombre de processus actuels
   - Voit l'usine associée au rapport

2. **Clique sur "Ajouter un Processus"**

   - Dialog s'ouvre avec formulaire pré-configuré
   - L'usine du rapport est affichée et sera héritée

3. **Remplit le formulaire**

   - Nom du processus (obligatoire)
   - Criticité (obligatoire)
   - Métriques BIA optionnelles
   - Responsable optionnel

4. **Soumet le formulaire**
   - Processus créé avec `category = rapport.category`
   - Rapport mis à jour avec le nouvel ID de processus
   - Toast de confirmation
   - Page rechargée pour afficher les changements

## 🔄 Flux de Données

```
Utilisateur → Dialog → API POST /api/bia/processes
                       ↓ (processus créé)
                       API PUT /api/bia/reports/[id]
                       ↓ (includedProcessIds mis à jour)
                       Rapport actualisé
                       ↓
                       Page rechargée
```

## 🎨 Composants Visuels

### Section Gestion des Processus

```tsx
<Card>
  <CardHeader>
    <CardTitle>Processus inclus dans ce rapport</CardTitle>
    <ReportAddProcessDialog /> {/* Bouton dans le header */}
  </CardHeader>
  <CardContent>
    {/* Info sur le nombre de processus */}
    {/* Astuce sur l'héritage de l'usine */}
  </CardContent>
</Card>
```

### Dialog

- Header: Titre + description + usine en surbrillance
- Body: Formulaire en plusieurs sections (infos, métriques, responsable)
- Footer: Boutons Annuler / Ajouter

## 🔗 Relations BDD

### BiaReport

```prisma
model BiaReport {
  id                  String   @id
  category            String?  // Usine (hérité par les processus)
  includedProcessIds  String[] // IDs des processus
  totalProcesses      Int      // Mis à jour automatiquement
  factoryId           String?  // Relation avec Factory
  factory             Factory? @relation
  // ...
}
```

### Process

```prisma
model Process {
  id          String      @id
  name        String
  category    String?     // Hérité du rapport lors de la création
  criticality Criticality // CRITICAL, HIGH, MEDIUM, LOW
  rto         Int         // heures
  rpo         Int         // heures
  mtpd        Int         // heures
  mbco        Int         // heures
  owner       String?
  ownerRole   String?
  ownerContact String?
  // ...
}
```

## ✨ Fonctionnalités Similaires

Cette implémentation est cohérente avec:

- ✅ `FactoryAddProcessDialog` - Ajouter processus depuis usine
- ✅ `FactoryAddReportDialog` - Générer rapport depuis usine
- ✅ Même UX, même validation, même toast

## 🎯 Prochaines Améliorations Possibles

1. **Afficher la liste des processus inclus**

   - Tableau des processus avec nom, criticité, métriques
   - Bouton pour retirer un processus du rapport
   - Possibilité de réorganiser l'ordre

2. **Filtrer les processus par usine**

   - Lors de l'ajout, afficher uniquement les processus de la même usine
   - Option pour ajouter des processus d'autres usines si nécessaire

3. **Sélectionner des processus existants**

   - Au lieu de toujours créer un nouveau processus
   - Pouvoir sélectionner parmi les processus existants
   - Checkbox multiple pour ajouter plusieurs processus d'un coup

4. **Synchronisation automatique**

   - Mise à jour en temps réel sans recharger la page
   - Utiliser React Query ou SWR pour le cache

5. **Statistiques enrichies**
   - Répartition par criticité des processus du rapport
   - Graphique des métriques moyennes (RTO, RPO)
   - Département le plus représenté

## 📝 Notes Techniques

### Toast vs Dialog Toast

- Utilise `sonner` (`toast.success()`, `toast.error()`)
- Plus simple que `useToast()` de shadcn
- Cohérent avec le reste de l'application

### Rechargement vs State Update

- Pour l'instant: `window.location.reload()`
- Plus simple et garantit la fraîcheur des données
- Alternative future: React Query avec invalidation de cache

### Validation

- Frontend: `required` sur les champs obligatoires
- Backend: À ajouter dans l'API `/api/bia/processes`

## 🎉 Résultat

Les utilisateurs peuvent maintenant:

- ✅ Créer des processus depuis un rapport
- ✅ Processus automatiquement associés au rapport
- ✅ Processus héritent de l'usine du rapport
- ✅ Interface cohérente avec la page d'analyse d'usine
- ✅ Workflow simple et intuitif

---

**Date:** 2025
**Statut:** ✅ Implémenté et Testé
**Fichiers Modifiés:**

- `src/components/bia/report-add-process-dialog.tsx` (CRÉÉ)
- `src/app/api/bia/reports/[id]/route.ts` (CRÉÉ)
- `src/app/(app)/bia/reports/[id]/page.tsx` (MODIFIÉ)
