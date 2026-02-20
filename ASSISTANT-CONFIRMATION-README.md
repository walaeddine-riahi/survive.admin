# 🤖 Assistant de Confirmation IA - Documentation

## 📋 Vue d'ensemble

Après l'extraction des données depuis un PDF BIA, un **assistant conversationnel IA** présente **chaque information extraite** à l'utilisateur pour **validation ou modification** avant de l'appliquer au formulaire.

## ✨ Différence avec l'assistant de champs manquants

| Assistant de Confirmation             | Assistant de Champs Manquants         |
| ------------------------------------- | ------------------------------------- |
| ✅ **Valide les données extraites**   | 🔍 **Remplit les données manquantes** |
| Affiche ce que l'IA a trouvé          | Demande ce qui n'a pas été trouvé     |
| L'utilisateur confirme ou modifie     | L'utilisateur complète les vides      |
| Parcourt toutes les données extraites | Parcourt uniquement les champs vides  |
| Mode: Vérification                    | Mode: Complétion                      |

## 🎯 Fonctionnement

```
📄 Upload PDF
    ↓
🤖 Extraction IA (strict - pas de fake data)
    ↓
📊 Préparation des champs pour revue
    ↓
💬 Assistant de Confirmation s'ouvre
    ↓
🔍 Pour chaque donnée extraite:
    - Afficher la valeur trouvée par l'IA
    - Indicateur de confiance (haute/moyenne/faible)
    - Catégorie du champ
    - Zone d'édition si besoin de corriger
    - Actions: ✅ Valider | ✏️ Modifier | ❌ Rejeter
    ↓
✅ Appliquer les données validées au formulaire
    ↓
💾 Formulaire prêt à enregistrer
```

## 📦 Fichiers Créés

### 1. `confirmation-assistant.tsx`

**Assistant conversationnel de validation**

```typescript
<ConfirmationAssistant
  isOpen={showConfirmation}
  onClose={() => setShowConfirmation(false)}
  extractedFields={fieldsToReview}
  onComplete={(confirmedData) => {
    // Appliquer au formulaire
  }}
/>
```

**Interface ExtractedFieldReview** :

```typescript
{
  name: string;          // Nom technique (ex: "rto")
  label: string;         // Libellé (ex: "RTO - Recovery Time Objective")
  value: unknown;        // Valeur extraite par l'IA
  type: "text" | "textarea" | "number" | "select";
  options?: string[];    // Pour les selects
  category?: string;     // Ex: "📌 Criticité"
  confidence?: "high" | "medium" | "low"; // Niveau de confiance
}
```

**Fonctionnalités** :

- ✅ Affichage de la valeur originale extraite
- ✅ Zone d'édition pour corriger
- ✅ Badge de confiance (vert/jaune/rouge)
- ✅ Navigation avant/arrière
- ✅ 3 actions: Valider / Rejeter / Modifier
- ✅ Statistiques en temps réel (validés, modifiés, restants)
- ✅ Barre de progression

### 2. `confirmation-utils.ts`

**Utilitaires pour préparer les données**

#### Fonction principale :

```typescript
const fieldsToReview = prepareExtractedFieldsForReview(extractedData);
```

**Algorithme** :

1. Parcourt toutes les données extraites
2. Ignore les champs techniques (`extractedText`, `confidence`)
3. Ignore les champs vides/null
4. Pour chaque champ :
   - Récupère métadonnées (label, type, catégorie)
   - Détermine niveau de confiance
   - Crée un objet `ExtractedFieldReview`
5. Trie par catégorie puis par nom

#### Détermination de la confiance :

```typescript
function determineConfidence(value, fieldName): "high" | "medium" | "low";
```

**Règles** :

- **🔴 Low (faible)** :
  - Valeur null/vide
  - Contient "à définir", "exemple", "n/a"
- **🟢 High (élevée)** :
  - Champs numériques (RTO, RPO) avec valeur > 0
  - Texte long et détaillé (> 50 caractères)
- **🟡 Medium (moyenne)** :
  - Par défaut pour tout le reste

#### Configuration des métadonnées :

**35 champs configurés** avec :

- `label` : Libellé affiché
- `type` : text, textarea, number, select
- `category` : Regroupement par section BIA
- `options` : Valeurs pour les selects (criticality, etc.)

Catégories :

- 📌 Informations Générales
- 📌 Criticité
- 📌 Impacts de la Perturbation
- 📌 Périmètre et Dépendances
- 📌 Activités Externalisées
- 📌 Applications Informatiques
- 📌 Infrastructure
- 📌 Rôles - Compétences - Personnel
- 📌 Équipement Industriel / Bureautique
- 📌 Documentation

### 3. Modifications dans `process-form.tsx`

#### Imports ajoutés :

```typescript
import { ConfirmationAssistant } from "@/components/bia/confirmation-assistant";
import {
  prepareExtractedFieldsForReview,
  type ExtractedFieldReview,
} from "@/lib/confirmation-utils";
```

#### États ajoutés :

```typescript
const [showConfirmationAssistant, setShowConfirmationAssistant] =
  useState(false);
const [fieldsToReview, setFieldsToReview] = useState<ExtractedFieldReview[]>(
  []
);
```

#### Logique après extraction PDF :

```typescript
if (result.success && result.data) {
  // Préparer les champs pour validation
  const fieldsForReview = prepareExtractedFieldsForReview(result.data);

  if (fieldsForReview.length > 0) {
    // Ouvrir l'assistant de confirmation
    setFieldsToReview(fieldsForReview);
    setShowConfirmationAssistant(true);

    toast.success(`${fieldsForReview.length} informations extraites. 
                   L'assistant IA va vous les présenter pour validation.`);
  }
}
```

#### Gestion de la validation :

```typescript
<ConfirmationAssistant
  onComplete={(confirmedData) => {
    // Appliquer les données validées
    Object.entries(confirmedData).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        form.setValue(key, value);
      }
    });

    const confirmedCount = Object.keys(confirmedData).length;
    const rejectedCount = totalFields - confirmedCount;

    toast.success(`${confirmedCount} champs validés, 
                   ${rejectedCount} rejetés`);
  }}
/>
```

## 🎨 Interface Utilisateur

### Écran principal de l'assistant

```
┌─────────────────────────────────────────────────────────┐
│ 🤖 Validation des Données Extraites                 ×  │
├─────────────────────────────────────────────────────────┤
│ L'IA a extrait 15 informations du PDF.                 │
│ Vérifiez et validez chaque donnée.                     │
├─────────────────────────────────────────────────────────┤
│ Champ 3 / 15                     8 validés · 1 modifié │
│ ████████████░░░░░░░░░░░░░░░░░░░░ 20%                   │
├─────────────────────────────────────────────────────────┤
│ 📌 Criticité    ✓ Confiance élevée                     │
├─────────────────────────────────────────────────────────┤
│ 🤖 RTO - Recovery Time Objective (heures)              │
│                                                         │
│ ✨ L'IA a trouvé :                                      │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 4                                                │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ 💬 Est-ce que cette information est correcte ?         │
├─────────────────────────────────────────────────────────┤
│ ✏️ Votre réponse                                        │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 4                                                │   │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ [← Précédent]                  [❌ Rejeter]  [✅ Valider & Suivant →] │
│                                                         │
│ ✅ 8 validés  ✏️ 1 modifié  7 restants                  │
└─────────────────────────────────────────────────────────┘
```

### Badges de confiance

- 🟢 **Confiance élevée** : Fond vert, donnée fiable
- 🟡 **Confiance moyenne** : Fond jaune, à vérifier
- 🔴 **Confiance faible** : Fond rouge, probablement incorrecte

### Actions disponibles

#### ✅ Valider & Suivant

- Confirme la valeur (modifiée ou originale)
- Passe au champ suivant
- Shortcut: Enter

#### ❌ Rejeter

- Ne pas inclure ce champ dans le formulaire
- Passe au champ suivant
- Le champ restera vide

#### ✏️ Modifier

- Éditer la valeur directement dans le champ
- Le badge "(modifiée)" apparaît
- Compté dans les statistiques "modifiés"

#### ⬅️ Précédent

- Revenir au champ précédent
- Restaure la valeur confirmée

## 📊 Statistiques

L'assistant affiche en temps réel :

- **Progression** : "Champ N / Total"
- **Barre visuelle** : Pourcentage de complétion
- **Compteurs** :
  - ✅ N validés
  - ✏️ N modifiés
  - N restants

## 🔄 Flux Complet

### 1. Upload du PDF

```javascript
// Utilisateur clique sur "Remplissage automatique depuis PDF"
<input type="file" accept=".pdf" onChange={handlePdfUpload} />
```

### 2. Extraction avec IA stricte

```javascript
const result = await analyzeProcessPdf(formData);
// Résultat: 15 champs extraits (après filtrage fake data)
```

### 3. Préparation pour validation

```javascript
const fieldsToReview = prepareExtractedFieldsForReview(result.data);
// Résultat: 15 champs avec métadonnées + confiance
```

### 4. Validation par l'utilisateur

```
Pour chaque champ (15 itérations):
  - Afficher valeur extraite
  - Utilisateur: Valider / Modifier / Rejeter
  - Si modifié: marquer dans statistiques
  - Stocker décision
```

### 5. Application au formulaire

```javascript
Object.entries(confirmedData).forEach(([key, value]) => {
  form.setValue(key, value);
});
// Applique uniquement les champs validés (pas les rejetés)
```

### 6. Notification finale

```
✅ Validation terminée !
12 champs validés, 3 rejetés
Vérifiez le formulaire avant d'enregistrer.
```

## 🎯 Exemples d'utilisation

### Scénario 1 : Données parfaites

```
PDF extrait: name="Production", rto=4, mtpd=8
Confiance: Haute pour tous
Utilisateur: Valide tout (15/15)
Résultat: 15 champs appliqués au formulaire
```

### Scénario 2 : Données à corriger

```
PDF extrait: rto=4 (correct), mbco="à définir" (incorrect)
Confiance: Haute pour rto, Faible pour mbco
Utilisateur:
  - Valide rto
  - Modifie mbco → "80%"
Résultat: 2 champs appliqués (1 validé, 1 modifié)
```

### Scénario 3 : Rejet de données suspectes

```
PDF extrait: externalSuppliers="PharmaChem SARL" (fake)
Confiance: Faible (détecté comme suspect)
Utilisateur: Rejette
Résultat: Champ ignoré, reste vide dans le formulaire
```

## 🔧 Configuration

### Ajouter un nouveau champ à valider

Modifier `confirmation-utils.ts` :

```typescript
const FIELD_METADATA: Record<string, {...}> = {
  // ...champs existants
  nouveauChamp: {
    label: "Libellé affiché à l'utilisateur",
    type: "textarea", // ou "text", "number", "select"
    category: "📌 Votre Catégorie",
    options: ["Option1", "Option2"], // si select
  },
};
```

### Modifier les règles de confiance

Modifier `determineConfidence()` dans `confirmation-utils.ts` :

```typescript
function determineConfidence(value: unknown, fieldName: string) {
  // Ajouter vos propres règles
  if (fieldName === "customField" && specificCondition) {
    return "high";
  }
  // ...règles existantes
}
```

## 🚀 Utilisation

### Côté Utilisateur

1. Aller sur `/bia/processes/new`
2. Cliquer sur "Remplissage automatique depuis PDF"
3. Uploader un rapport BIA (PDF)
4. ⏳ Attendre l'extraction (10-30s)
5. 🤖 L'assistant s'ouvre automatiquement
6. Pour chaque donnée extraite :
   - Lire la valeur
   - Vérifier l'indicateur de confiance
   - ✅ Valider si correcte
   - ✏️ Modifier si besoin
   - ❌ Rejeter si fausse
7. ✅ Cliquer sur "Valider & Terminer"
8. 💾 Enregistrer le formulaire

### Côté Développeur

```typescript
// Utiliser l'assistant manuellement
const extractedData = { name: "Production", rto: 4, ... };
const fields = prepareExtractedFieldsForReview(extractedData);

if (fields.length > 0) {
  setFieldsToReview(fields);
  setShowConfirmationAssistant(true);
}
```

## ✅ Avantages

1. **🛡️ Sécurité** : Aucune donnée appliquée sans validation utilisateur
2. **🎯 Précision** : Détection de confiance aide à identifier les erreurs
3. **✏️ Flexibilité** : Modification en direct sans quitter l'assistant
4. **📊 Transparence** : Statistiques claires (validés, modifiés, rejetés)
5. **⚡ Efficacité** : Navigation rapide avec clavier (Enter, Tab)
6. **🎨 UX** : Interface conversationnelle claire et guidée

## 🔗 Intégration avec la détection de fake data

L'assistant fonctionne **après** le filtrage stricte de l'IA :

```
PDF Upload
    ↓
Extraction IA avec règles strictes
    ↓
Filtrage des patterns suspects
    ↓
Détermination de la confiance
    ↓
Assistant de Confirmation ← Nous sommes ici
    ↓
Application au formulaire
```

Les données déjà filtrées (PharmaChem SARL, etc.) ne seront **jamais présentées** à l'utilisateur car elles sont rejetées avant l'assistant.

## 📝 Tests

Testez manuellement :

1. ✅ Upload PDF avec données complètes
2. ✅ Upload PDF avec données partielles
3. ✅ Upload PDF avec valeurs génériques
4. ✅ Valider une donnée
5. ✅ Modifier une donnée
6. ✅ Rejeter une donnée
7. ✅ Navigation avant/arrière
8. ✅ Fermer l'assistant en cours
9. ✅ Vérifier statistiques finales
10. ✅ Confirmer application au formulaire

## 🎉 Résultat Final

L'utilisateur a maintenant **100% de contrôle** sur les données extraites par l'IA, avec une **expérience conversationnelle fluide** qui lui permet de :

- ✅ Valider rapidement les bonnes données
- ✏️ Corriger les erreurs en direct
- ❌ Rejeter les données suspectes
- 📊 Suivre sa progression
- 🎯 Garantir la qualité des données dans son formulaire BIA

**Plus de données inventées, plus de fake info - tout est vérifié ! 🔒**
