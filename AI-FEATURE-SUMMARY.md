# ✨ Fonctionnalité IA - Remplissage Automatique BIA

## 🎯 Résumé

Ajout d'une fonctionnalité d'**intelligence artificielle** permettant d'uploader un document (Word, PDF, Excel) et de **remplir automatiquement** le formulaire de création de processus BIA en utilisant **Azure OpenAI GPT-4**.

## 📍 Localisation

- **URL**: `http://localhost:3000/bia/processes/new`
- **Page**: Création de nouveau processus BIA
- **Position**: Carte visible en haut de page (entre l'alerte d'aide et le formulaire)

## 🔧 Fichiers créés/modifiés

### Nouveaux fichiers

1. **`src/app/api/bia/analyze-document/route.ts`** (173 lignes)

   - API route pour l'analyse de documents
   - Extraction de texte (PDF, Word, Excel)
   - Appel à Azure OpenAI
   - Retour des données structurées

2. **`src/components/bia/ai-document-upload.tsx`** (171 lignes)

   - Composant d'upload avec drag & drop
   - États visuels (idle, uploading, analyzing, success, error)
   - Feedback utilisateur avec messages animés
   - Design professionnel avec gradient bleu/violet

3. **`AI-DOCUMENT-UPLOAD-GUIDE.md`** (documentation complète)
   - Guide d'utilisation détaillé
   - Architecture technique
   - Gestion d'erreurs
   - Conseils d'optimisation

### Fichiers modifiés

4. **`src/components/bia/process-form-spreadsheet.tsx`**
   - Import du composant `AIDocumentUpload`
   - Ajout de la fonction `handleAIDataExtracted` (110 lignes)
   - Intégration du composant dans le JSX
   - Mapping automatique des données extraites vers les champs du formulaire

## 📦 Dépendances installées

```bash
pnpm add openai pdf-parse mammoth xlsx react-dropzone
pnpm add -D @types/pdf-parse
```

### Packages

| Package          | Version | Utilisation                      |
| ---------------- | ------- | -------------------------------- |
| `openai`         | Latest  | Client Azure OpenAI              |
| `pdf-parse`      | 2.4.5   | Extraction de texte PDF          |
| `mammoth`        | Latest  | Extraction de texte Word (.docx) |
| `xlsx`           | 0.18.5  | Extraction de données Excel      |
| `react-dropzone` | 14.4.0  | Drag & drop de fichiers          |

## 🎨 Interface utilisateur

### Design

```
┌─────────────────────────────────────────────────────────────┐
│  ✨ Remplissage Automatique avec IA  [Azure OpenAI]         │
│                                                               │
│  Uploadez un document (PDF, Word, Excel) décrivant votre    │
│  processus et l'IA remplira automatiquement le formulaire    │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │            📤                                          │  │
│  │     Glissez-déposez un fichier ou cliquez            │  │
│  │     pour sélectionner                                 │  │
│  │                                                        │  │
│  │     PDF, Word (.docx), Excel (.xlsx, .xls) - Max 10MB│  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### États visuels

**🔵 Idle** - En attente d'un fichier

**🟡 Uploading** - Upload en cours

```
⏳ Upload en cours...
   document.pdf
```

**🟣 Analyzing** - Analyse avec Azure OpenAI

```
🤖 Analyse avec Azure OpenAI...
   Extraction des informations du document
```

**🟢 Success** - Terminé avec succès

```
✅ Analyse terminée !
   Le formulaire a été rempli automatiquement.
   Vérifiez et ajustez si nécessaire.

   [📤 Analyser un autre document]
```

**🔴 Error** - Erreur

```
❌ Erreur
   [Message d'erreur détaillé]

   [📤 Analyser un autre document]
```

## 🔄 Flux de données

```
1. Utilisateur upload document
        ↓
2. Frontend: AIDocumentUpload
   - Validation du fichier
   - Création FormData
        ↓
3. POST /api/bia/analyze-document
   - Extraction texte selon type
   - Envoi à Azure OpenAI
   - Parsing réponse JSON
        ↓
4. Callback: handleAIDataExtracted
   - Mapping données → champs formulaire
   - form.setValue() pour chaque champ
   - Ouverture de toutes les sections
        ↓
5. Toast de confirmation
   - "✨ Formulaire rempli automatiquement !"
```

## 📋 Données extraites et mappées

### Mapping complet

| Section formulaire         | Champs IA                                        | Type          |
| -------------------------- | ------------------------------------------------ | ------------- |
| **Informations générales** | name, description, department, location          | string        |
| **Responsable**            | processOwner, ownerRole, ownerEmail, ownerPhone  | string        |
| **Criticité**              | criticality, rto, mtpd, rpo, mbco, criticalTimes | string/number |
| **Impacts**                | impacts[]                                        | array         |
| **Activités critiques**    | criticalActivities[]                             | array         |
| **Systèmes**               | systems[]                                        | array         |
| **Personnel**              | personnel[]                                      | array         |
| **Dépendances**            | dependencies[]                                   | array         |

### Exemple de données extraites

```json
{
  "name": "Production Ligne A",
  "description": "Processus de fabrication...",
  "department": "Production",
  "location": "Usine Alger",
  "processOwner": "Ahmed Ben Salem",
  "ownerRole": "Responsable Production",
  "ownerEmail": "ahmed@entreprise.com",
  "ownerPhone": "+216 71 234 567",
  "criticality": "CRITICAL",
  "rto": 4,
  "mtpd": 8,
  "rpo": 2,
  "mbco": "12 heures maximum avant impact client",
  "impacts": [
    {
      "type": "Financier",
      "level": "high",
      "hasImpact": true,
      "description": "Perte de 50 000 DT/jour"
    }
  ],
  "criticalActivities": [
    {
      "name": "Préparation matières premières",
      "criticality": "critical",
      "rto": 2,
      "rpo": 1,
      "impact": "Blocage complet de la chaîne"
    }
  ],
  "systems": [
    {
      "name": "ERP SAP",
      "type": "Enterprise Resource Planning",
      "criticality": "critical",
      "rto": 4
    }
  ],
  "personnel": [
    {
      "role": "Opérateur de production",
      "number": 10,
      "skills": "Formation GMP requise",
      "criticality": "high"
    }
  ],
  "dependencies": [
    {
      "name": "Maintenance",
      "type": "Processus",
      "description": "Support technique quotidien"
    }
  ]
}
```

## 🧠 Prompt Azure OpenAI

Le prompt utilisé pour l'extraction :

```javascript
Tu es un expert en Business Continuity Management (BCM) et analyse d'impact métier (BIA).

Analyse le document suivant qui décrit un processus métier et extrait les informations
structurées suivantes au format JSON strict :

{
  "name": "Nom du processus",
  "description": "Description détaillée du processus",
  "department": "Département responsable",
  ...
  "impacts": [
    {
      "type": "Financier | Opérationnel | Réputation | Légal/Réglementaire | Sécurité",
      "level": "critical | high | medium | low",
      "hasImpact": true/false,
      "description": "Description de l'impact"
    }
  ],
  ...
}

IMPORTANT:
- Si une information n'est pas présente, utilise null ou []
- Pour criticality: CRITICAL, HIGH, MEDIUM, LOW
- RTO/MTPD/RPO en heures (nombres)
- Retourne UNIQUEMENT le JSON, sans texte explicatif

DOCUMENT À ANALYSER:
[texte extrait du document]
```

## 🔐 Configuration requise

### Variables d'environnement

Déjà configurées dans `.env` :

```bash
# Azure OpenAI
AZURE_OPENAI_API_KEY=7MK8FIGgJNCSV48Jqliml9dtoqs0cutq2b2e6lNpq0DhAXA238TsJQQJ99CAACfhMk5XJ3w3AAABACOGtcXO
AZURE_OPENAI_ENDPOINT=https://survive-openai.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

### Modèle utilisé

- **Modèle**: GPT-4 Turbo (gpt-4o)
- **Temperature**: 0.3 (pour plus de précision)
- **Max tokens**: 4000
- **Coût**: ~$0.01-0.03 par analyse (selon la longueur)

## 🛡️ Validation et sécurité

### Côté client (AIDocumentUpload)

```typescript
// Types acceptés
accept: {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/vnd.ms-excel": [".xls"],
}

// Taille max
maxSize: 10 * 1024 * 1024 (10 MB)

// Fichier unique
multiple: false
```

### Côté serveur (API route)

```typescript
// Vérification type MIME
const allowedTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

// Vérification extension
if (
  !allowedTypes.includes(file.type) &&
  !file.name.endsWith(".docx") &&
  !file.name.endsWith(".xlsx") &&
  !file.name.endsWith(".pdf")
) {
  return NextResponse.json({ error: "Type non supporté" }, { status: 400 });
}

// Vérification taille
if (file.size > 10 * 1024 * 1024) {
  return NextResponse.json(
    { error: "Fichier trop volumineux" },
    { status: 400 }
  );
}

// Vérification contenu minimum
if (!text || text.trim().length < 50) {
  return NextResponse.json({ error: "Pas assez de texte" }, { status: 400 });
}
```

## 🎯 Fonctionnalités clés

### ✅ Implémenté

- [x] Upload drag & drop de fichiers
- [x] Support PDF, Word, Excel
- [x] Extraction automatique du texte
- [x] Analyse avec Azure OpenAI GPT-4
- [x] Mapping automatique vers formulaire
- [x] Feedback visuel complet (loading, success, error)
- [x] Validation côté client et serveur
- [x] Gestion d'erreurs détaillée
- [x] Documentation complète
- [x] Design professionnel avec gradient
- [x] Badge Azure OpenAI
- [x] Toast de confirmation
- [x] Bouton "Analyser un autre document"
- [x] Ouverture automatique de toutes les sections après remplissage

### 🔜 Améliorations futures

- [ ] Support d'images (OCR avec Azure Computer Vision)
- [ ] Multi-langue (FR, EN, AR)
- [ ] Extraction de tableaux complexes
- [ ] Suggestions d'amélioration du document
- [ ] Historique des analyses
- [ ] Templates pré-définis par industrie
- [ ] Export du prompt utilisé
- [ ] Comparaison avant/après
- [ ] Mode "révision" pour valider champ par champ
- [ ] Analytics sur les champs auto-remplis vs manuels

## 🧪 Tests recommandés

### Test 1: Document Word simple

1. Créer `test-process.docx` avec:

   ```
   Processus: Test Production
   Département: IT
   Responsable: John Doe
   Email: john@test.com
   Criticité: CRITICAL
   RTO: 4 heures
   ```

2. Upload sur `/bia/processes/new`
3. Vérifier le remplissage automatique
4. Valider les données extraites

### Test 2: PDF avec tableaux

1. Créer PDF avec tableau de criticités
2. Upload et vérifier l'extraction des impacts
3. Valider le mapping des niveaux

### Test 3: Excel avec données structurées

1. Créer fichier Excel avec colonnes:

   - Nom activité
   - RTO
   - RPO
   - Criticité

2. Upload et vérifier l'extraction des activités critiques

### Test 4: Gestion d'erreurs

1. Tester fichier > 10 MB → Erreur taille
2. Tester fichier .txt → Erreur type
3. Tester PDF vide → Erreur contenu
4. Tester sans connexion Azure → Erreur API

## 📊 Performance

### Temps de traitement estimés

| Type  | Taille | Temps d'extraction | Temps IA | Total        |
| ----- | ------ | ------------------ | -------- | ------------ |
| PDF   | 1 MB   | ~1-2s              | ~3-5s    | **4-7s**     |
| Word  | 500 KB | ~0.5-1s            | ~3-5s    | **3.5-6s**   |
| Excel | 100 KB | ~0.2-0.5s          | ~2-4s    | **2.2-4.5s** |

### Optimisations possibles

- ⚡ Cache des résultats par hash de fichier
- ⚡ Streaming de la réponse OpenAI
- ⚡ Compression du texte avant envoi
- ⚡ Parallélisation extraction + preprocessing

## 💰 Coûts Azure OpenAI

### Estimation par analyse

| Modèle      | Input (tokens) | Output (tokens) | Coût/analyse |
| ----------- | -------------- | --------------- | ------------ |
| GPT-4o      | ~2000          | ~1000           | **$0.015**   |
| GPT-4 Turbo | ~2000          | ~1000           | **$0.030**   |

### Optimisation des coûts

- Limiter le texte extrait (premiers 10 000 caractères)
- Utiliser GPT-3.5 pour documents simples
- Cache des résultats identiques
- Batch processing si volumes élevés

## 🎓 Cas d'usage

### Idéal pour

- ✅ Migration de documents existants vers BIA
- ✅ Import de processus depuis documentation
- ✅ Gain de temps sur saisie manuelle
- ✅ Standardisation des données
- ✅ Formation des utilisateurs

### Moins adapté pour

- ⚠️ Documents mal structurés
- ⚠️ Handwriting (écriture manuscrite)
- ⚠️ Images sans texte
- ⚠️ Données hautement spécialisées

## 📞 Support et contact

En cas de problème :

1. **Vérifier les logs console** (F12)
2. **Tester les credentials Azure OpenAI**
3. **Consulter la documentation** (`AI-DOCUMENT-UPLOAD-GUIDE.md`)
4. **Créer un ticket** avec :
   - Type de fichier testé
   - Message d'erreur
   - Logs console
   - Capture d'écran

---

**Status**: ✅ Fonctionnel et prêt à l'emploi  
**Version**: 1.0  
**Date**: Janvier 2025  
**Développé avec**: ❤️ Next.js 15, Azure OpenAI, TypeScript
