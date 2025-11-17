# Schéma Prisma - Support Multi-Éléments BIA

## 📋 Vue d'ensemble

Le schéma `Process` a été mis à jour pour supporter les **structures multi-éléments** conformes aux standards **SMCA/ISO 22301/ISO 27001**.

## ✅ Compatibilité avec MongoDB

### Pourquoi MongoDB est parfait pour ce cas ?

1. **Type `Json` natif** : Prisma/MongoDB supporte le stockage de documents JSON complexes
2. **Flexibilité** : Tableaux d'objets sans contraintes de schéma rigide
3. **Performance** : Indexation et requêtes efficaces sur les champs JSON
4. **Évolutivité** : Ajout de nouveaux critères sans migration lourde

## 🔧 Nouveaux champs ajoutés

### 1. `activitesCritiques` (Json?)

```typescript
Array<{
  nom: string;
  delai: string;
  impactsOperationnels: string;
  impactsReglementaires: string;
  impactsImage: string;
  criticite: "low" | "medium" | "high" | "critical";
  rto: number;
  mtpd: number;
  rpo: number;
  mbco: string;
  solutionsContournement: string;
}>;
```

### 2. `fournisseursExternes` (Json?)

```typescript
Array<{
  nom: string;
  servicesOfferts: string;
  contactNom: string;
  contactTelephone: string;
  contactEmail: string;
  zoneGeographique: string;
  planContinuiteActivite: "oui" | "non";
  clauseSLA: "oui" | "non";
  rto: number;
  mtpd: number;
}>;
```

### 3. `obligationsLegales` (Json?)

```typescript
Array<{
  nature: string;
  reference: string;
  autoriteRegulation: string;
  details: string;
  consequencesNonRespect: string;
}>;
```

### 4. `systemesInformatiques` (Json?)

```typescript
Array<{
  nom: string;
  typeSysteme: string;
  criticite: "low" | "medium" | "high" | "critical";
  impactIndisponibilite: string;
  activitesAssociees: string;
  sauvegardesEnPlace: "oui" | "non";
  rto: number;
  rpo: number;
  mtpd: number;
  solutionsContournement: string;
  incidentsAnterieurs: string;
}>;
```

### 5. `infrastructuresPhysiques` (Json?)

```typescript
Array<{
  nom: string;
  categorie: "electricite" | "climatisation" | "internet" | "locaux" | "autre";
  criticite: "low" | "medium" | "high" | "critical";
  rto: number;
  mtpd: number;
  possibiliteTravailDistance: "oui" | "non";
  alternativesDisponibles: string;
}>;
```

### 6. `rolesPersonnel` (Json?)

```typescript
Array<{
  intituleRole: string;
  nombrePersonnes: number;
  tachesResponsabilites: string;
  competencesRequises: string;
  estCritique: "oui" | "non";
  delaiDisponibiliteNecessaire: string;
  possibiliteRemplacement: "oui" | "non";
  personneRemplacante: string;
  formationNecessaire: "oui" | "non";
  dureeFormation: string;
  solutionsContournement: string;
}>;
```

### 7. `equipementsIndustriels` (Json?)

```typescript
Array<{
  designation: string;
  modeleReference: string;
  tachesRealise: string;
  criticite: "low" | "medium" | "high" | "critical";
  rto: number;
  mtpd: number;
  possibiliteReaffectation: "oui" | "non";
  solutionsContournement: string;
  tension: string;
  typeCourant: string;
  puissanceNominale: string;
  consommationJournaliere: string;
  compatibiliteSecours: "oui" | "non";
  alternativesDisponibles: string;
}>;
```

### 8. `equipementsBureautiques` (Json?)

```typescript
Array<{
  type: string;
  quantiteActuelle: number;
  tachesUtilisation: string;
  criticite: "low" | "medium" | "high" | "critical";
  rto: number;
  mtpd: number;
  quantiteRequiseApresIncident: number;
  possibiliteReaffectation: "oui" | "non";
  fournisseur: string;
  solutionsContournement: string;
}>;
```

### 9. `documentationsCritiques` (Json?)

```typescript
Array<{
  type: string;
  format: "papier" | "numerique" | "les_deux";
  emplacementPrincipal: string;
  emplacementsSecondaires: string;
  necessaireApresIncident: "oui" | "non";
  rto: number;
  criticite: "low" | "medium" | "high" | "critical";
  modalitesAcces: string;
  possibiliteRemplacement: "oui" | "non";
  procedureRecuperation: string;
  responsable: string;
  notes: string;
}>;
```

## 🚀 Migration

### Commande à exécuter

```bash
npx prisma generate
npx prisma db push
```

**Note** : Avec MongoDB, `prisma db push` synchronise le schéma directement sans fichiers de migration.

### Alternative avec migrations

Si vous préférez créer une migration nommée :

```bash
npx prisma migrate dev --name add-multi-element-fields
```

## 📊 Rétrocompatibilité

Les **anciens champs textuels sont conservés** pour assurer la rétrocompatibilité :

- `itSystems` (String?) → Peut coexister avec `systemesInformatiques` (Json?)
- `externalSuppliers` (String?) → Peut coexister avec `fournisseursExternes` (Json?)
- Etc.

### Stratégie de migration des données existantes

Si vous avez des processus existants avec des données dans les anciens champs texte, vous pouvez :

1. **Option 1 - Conservation** : Garder les deux formats (texte simple + JSON structuré)
2. **Option 2 - Migration** : Créer un script pour transformer les textes en tableaux JSON
3. **Option 3 - Hybride** : Afficher les deux formats dans l'interface utilisateur

## 🔍 Exemples d'utilisation

### Création d'un processus avec multi-éléments

```typescript
const process = await prisma.process.create({
  data: {
    name: "Processus RH - Paie",
    department: "Ressources Humaines",
    criticality: "high",

    // Anciennes données (texte simple)
    itSystems: "SIRH, Logiciel de paie",

    // Nouvelles données (JSON structuré)
    systemesInformatiques: [
      {
        nom: "SIRH - Sage X3",
        typeSysteme: "ERP",
        criticite: "critical",
        impactIndisponibilite: "Arrêt complet de la gestion RH",
        activitesAssociees: "Paie, Congés, Formation",
        sauvegardesEnPlace: "oui",
        rto: 24,
        rpo: 4,
        mtpd: 72,
        solutionsContournement: "Traitement manuel temporaire",
        incidentsAnterieurs: "Panne serveur 2023-06-15",
      },
      {
        nom: "Portail RH Collaborateur",
        typeSysteme: "Application Web",
        criticite: "medium",
        // ...
      },
    ],

    activitesCritiques: [
      {
        nom: "Traitement de la paie mensuelle",
        delai: "72 heures",
        impactsOperationnels: "Impossibilité de payer les salaires",
        impactsReglementaires: "Non-conformité CNSS",
        impactsImage: "Perte de confiance des employés",
        criticite: "critical",
        rto: 48,
        mtpd: 72,
        rpo: 24,
        mbco: "Minimum 80% des employés payés à temps",
        solutionsContournement: "Calcul manuel + virement bancaire d'urgence",
      },
    ],
  },
});
```

### Lecture et filtrage

```typescript
// Récupérer tous les processus avec des systèmes IT critiques
const processes = await prisma.process.findMany({
  where: {
    systemesInformatiques: {
      not: null,
    },
  },
});

// Côté application, filtrer les systèmes critiques
const criticalSystems = processes.flatMap((process) => {
  const systems = process.systemesInformatiques as Array<{
    nom: string;
    criticite: string;
    // ...
  }>;

  return systems?.filter((sys) => sys.criticite === "critical") || [];
});
```

## ⚠️ Important

### Type Safety en TypeScript

Pour avoir une meilleure sécurité de types, créez des interfaces :

```typescript
// src/types/bia-process.ts
export interface ActiviteCritique {
  nom: string;
  delai: string;
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

export interface SystemeInformatique {
  nom: string;
  typeSysteme: string;
  criticite: "low" | "medium" | "high" | "critical";
  impactIndisponibilite: string;
  activitesAssociees: string;
  sauvegardesEnPlace: "oui" | "non";
  rto: number;
  rpo: number;
  mtpd: number;
  solutionsContournement: string;
  incidentsAnterieurs: string;
}

// etc.
```

Puis utilisez des type assertions lors de la manipulation :

```typescript
const systems = process.systemesInformatiques as SystemeInformatique[] | null;
```

## 🎯 Prochaines étapes

1. ✅ Schéma Prisma mis à jour
2. ⏳ Générer le client Prisma (`npx prisma generate`)
3. ⏳ Pousser vers la base (`npx prisma db push`)
4. ⏳ Adapter `process-form.tsx` pour utiliser `DynamicListField`
5. ⏳ Mettre à jour `process-actions.ts` pour sauvegarder le JSON
6. ⏳ Créer les interfaces d'affichage

## 📚 Références

- [Prisma JSON Fields](https://www.prisma.io/docs/concepts/components/prisma-schema/data-model#json)
- [MongoDB avec Prisma](https://www.prisma.io/docs/concepts/database-connectors/mongodb)
- ISO 22301 - Business Continuity Management
- SMCA - Standard Marocain de Continuité d'Activité
