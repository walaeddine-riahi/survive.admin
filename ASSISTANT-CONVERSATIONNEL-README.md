# 🤖 Assistant Conversationnel pour Champs Manquants - Documentation

## 📋 Vue d'ensemble

Après l'extraction des données depuis un PDF BIA, un **assistant conversationnel intelligent** guide l'utilisateur à travers tous les champs manquants pour compléter le formulaire.

## ✨ Fonctionnalités

### 1. **Détection Automatique des Champs Manquants**

- Identification des champs vides après extraction PDF
- Priorisation par importance (champs requis d'abord)
- Regroupement par catégorie (Informations Générales, Criticité, Impacts, etc.)

### 2. **Interface Conversationnelle**

- **Navigation fluide** : Question par question
- **Progression visuelle** : Barre de progression + compteurs
- **Options flexibles** :
  - ✅ Répondre à la question
  - ⏭️ Passer à la suivante
  - ⬅️ Revenir en arrière
  - ❌ Fermer et continuer plus tard

### 3. **Types de Questions**

- **Texte court** : Nom, département, location
- **Texte long** : Descriptions, impacts, dépendances
- **Nombres** : RTO, RPO, MTPD, nombre de personnel
- **Sélection** : Criticité (critical/high/medium/low)

### 4. **Validation Intelligente**

- Champs requis bloquent la progression
- Validation en temps réel
- Sauvegarde automatique au formulaire

## 📁 Fichiers Créés

### 1. `missing-fields-assistant.tsx`

**Composant React de l'assistant conversationnel**

```typescript
<MissingFieldsAssistant
  isOpen={showAssistant}
  onClose={() => setShowAssistant(false)}
  missingFields={[...]}
  extractedFieldsCount={15}
  totalFieldsCount={30}
  onComplete={(filledData) => {
    // Appliquer les données au formulaire
  }}
/>
```

**Fonctionnalités** :

- ✅ Modal plein écran avec dialogue par étape
- ✅ Barre de progression visuelle
- ✅ Badges de catégorie
- ✅ Navigation avant/arrière
- ✅ Statistiques en temps réel

### 2. `missing-fields-utils.ts`

**Utilitaires pour gérer les champs manquants**

#### Fonctions principales :

```typescript
// 1. Identifier les champs manquants
const missingFields = identifyMissingFields(extractedData);
// → Retourne les champs null, undefined, "", ou 0

// 2. Prioriser par importance
const prioritized = prioritizeMissingFields(missingFields);
// → Champs requis en premier, puis par catégorie

// 3. Fusionner données extraites + réponses utilisateur
const merged = mergeFilledData(extractedData, userAnswers);
// → Combine les deux sources de données
```

#### Configuration des champs :

**27 champs BIA définis** avec:

- `name` : Nom technique du champ
- `label` : Question pour l'utilisateur
- `type` : text | textarea | number | select
- `required` : Booléen (bloque la progression si vide)
- `description` : Aide contextuelle
- `category` : Regroupement (📌 Informations Générales, etc.)
- `options` : Valeurs pour les sélections

### 3. Modifications dans `process-form.tsx`

#### Imports ajoutés :

```typescript
import { MissingFieldsAssistant } from "@/components/bia/missing-fields-assistant";
import {
  identifyMissingFields,
  prioritizeMissingFields,
  mergeFilledData,
} from "@/lib/missing-fields-utils";
```

#### États ajoutés :

```typescript
const [showMissingFieldsAssistant, setShowMissingFieldsAssistant] = useState(false);
const [missingFieldsList, setMissingFieldsList] = useState<MissingField[]>([]);
const [extractedFieldsCount, setExtractedFieldsCount] = useState(0);
const [currentExtractedData, setCurrentExtractedData] = useState<...>(null);
```

#### Logique après extraction PDF :

```typescript
// 1. Remplir les champs extraits automatiquement
if (data.name) form.setValue("name", data.name);
if (data.rto) form.setValue("rto", data.rto);
// ... etc

// 2. Identifier les champs manquants
const missingFields = identifyMissingFields(data);
const prioritized = prioritizeMissingFields(missingFields);

// 3. Ouvrir l'assistant si nécessaire
if (prioritized.length > 0) {
  setMissingFieldsList(prioritized);
  setShowMissingFieldsAssistant(true);
  toast.success(`${extractedCount} champs remplis. 
    Assistant pour les ${prioritized.length} champs manquants.`);
}
```

## 🎯 Flux Utilisateur

### 1. Upload du PDF

```
📄 Utilisateur : Upload "Rapport BIA - Production.pdf"
🤖 Système : Extraction avec IA + détection fake data
```

### 2. Remplissage Automatique

```
✅ 15 champs remplis automatiquement:
   - Nom du processus
   - Département
   - RTO, RPO, MTPD
   - Description
   - etc.

⚠️ 12 champs manquants détectés
```

### 3. Assistant Conversationnel

```
┌────────────────────────────────────────┐
│ 🤖 Assistant de Remplissage            │
├────────────────────────────────────────┤
│ Question 1 / 12                        │
│ ████████░░░░░░░░░░░░ 33%              │
│                                        │
│ 📌 Criticité                           │
│                                        │
│ ⚠️ Impact financier                    │
│ Quelles pertes financières sont        │
│ attendues en cas d'interruption?       │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ Votre réponse...                   │ │
│ └────────────────────────────────────┘ │
│                                        │
│ [Passer]  [← Précédent]  [Suivant →]  │
│                                        │
│ ✅ 3 complétés  ⚠️ 2 ignorés  7 restants│
└────────────────────────────────────────┘
```

### 4. Finalisation

```
✅ Assistant terminé!
   → 10 champs complétés
   → 2 champs ignorés
   → Formulaire prêt à enregistrer
```

## 📊 Statistiques en Temps Réel

L'assistant affiche constamment :

- **Progression** : Question N / Total
- **Barre visuelle** : Pourcentage de complétion
- **Compteurs** :
  - ✅ Champs complétés
  - ⚠️ Champs ignorés
  - 📝 Champs restants

## 🎨 Design

### Couleurs

- **Bleu** : Interface principale, questions
- **Vert** : Succès, champs complétés
- **Orange** : Champs ignorés
- **Rouge** : Champs requis manquants

### Icônes

- 💬 MessageSquare : Titre de l'assistant
- ⚠️ AlertCircle : Questions importantes
- ✅ CheckCircle2 : Validation et complétion
- ➡️ ArrowRight : Navigation suivante
- ⬅️ ArrowLeft : Navigation précédente

## 🔧 Configuration

### Ajouter un nouveau champ à l'assistant

Modifier `missing-fields-utils.ts` :

```typescript
export const BIA_FIELD_DEFINITIONS: MissingField[] = [
  // ...champs existants
  {
    name: "nouveauChamp",
    label: "Question pour l'utilisateur",
    type: "textarea", // ou "text", "number", "select"
    required: true, // ou false
    description: "Aide contextuelle pour l'utilisateur",
    category: "📌 Votre Catégorie",
    options: ["Option1", "Option2"], // si type = "select"
  },
];
```

### Modifier l'ordre de priorité

Les champs sont triés par :

1. **Champs requis** (`required: true`)
2. **Ordre des catégories** :
   - Informations Générales
   - Criticité
   - Impacts
   - Périmètre
   - Activités Externalisées
   - Applications IT
   - Infrastructure
   - Personnel
   - Équipements
   - Documentation

## 🚀 Utilisation

### Côté Utilisateur

1. Aller sur `/bia/processes/new`
2. Cliquer sur "Remplissage automatique depuis PDF"
3. Uploader un rapport BIA (PDF)
4. Attendre l'extraction (10-30 secondes)
5. L'assistant s'ouvre automatiquement si des champs manquent
6. Répondre aux questions une par une
7. Cliquer sur "Terminer" ou fermer pour continuer plus tard
8. Enregistrer le formulaire

### Côté Développeur

```typescript
// Utiliser l'assistant manuellement
import { identifyMissingFields } from "@/lib/missing-fields-utils";

const data = { name: "Production", rto: 4 }; // Données partielles
const missing = identifyMissingFields(data);

if (missing.length > 0) {
  // Ouvrir l'assistant
  setShowAssistant(true);
}
```

## ✅ Améliorations Récentes

### Protection contre les données inventées

- Patterns de détection : SARL, International, noms tunisiens
- Rejet automatique des numéros de téléphone formatés
- Filtrage des emails génériques (contact@example.com)

### Messages clairs

- "15 champs remplis, 12 champs manquants"
- "Un assistant va vous guider..."
- "X champs ont été ajoutés"

## 📝 Tests

Aucun test automatique pour l'instant. Testez manuellement :

1. Upload un PDF incomplet (peu de données)
2. Vérifier que l'assistant s'ouvre
3. Naviguer entre les questions
4. Tester "Passer", "Précédent", "Suivant"
5. Vérifier que les données sont appliquées au formulaire
6. Enregistrer et vérifier en base de données

## 🎉 Résultat Final

L'utilisateur bénéficie d'une **expérience conversationnelle fluide** pour compléter son formulaire BIA, avec :

- ✅ Extraction automatique des données du PDF
- ✅ Détection intelligente des données inventées
- ✅ Assistant guidé pour les champs manquants
- ✅ Validation en temps réel
- ✅ Flexibilité (passer, revenir, fermer)
- ✅ Statistiques de progression
