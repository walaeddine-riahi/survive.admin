# 🤖 Guide d'Utilisation - Remplissage Automatique BIA avec IA

## Vue d'ensemble

Cette fonctionnalité permet d'**uploader un document** (Word, PDF, Excel) décrivant un processus métier et de **remplir automatiquement le formulaire BIA** grâce à l'intelligence artificielle Azure OpenAI.

## 📍 Accès à la fonctionnalité

**URL**: `http://localhost:3000/bia/processes/new`

La carte d'upload IA apparaît automatiquement en haut de la page lors de la création d'un nouveau processus.

## 🎯 Fonctionnalités

### Types de fichiers supportés

- 📄 **PDF** (`.pdf`)
- 📝 **Word** (`.docx`)
- 📊 **Excel** (`.xlsx`, `.xls`)

### Taille maximum

- **10 MB** par fichier

## 🚀 Comment utiliser

### Étape 1: Upload du document

1. **Glissez-déposez** votre fichier dans la zone bleue

   OU

2. **Cliquez** sur la zone pour sélectionner un fichier

### Étape 2: Analyse automatique

Le système va automatiquement :

1. ✅ **Extraire le texte** du document
2. 🤖 **Analyser avec Azure OpenAI** (modèle GPT-4)
3. 📋 **Remplir le formulaire** avec les données extraites

### Étape 3: Vérification

Une fois l'analyse terminée :

- ✨ **Toutes les sections** du formulaire s'ouvrent automatiquement
- 📝 **Les champs** sont pré-remplis avec les données extraites
- ⚠️ **Vérifiez et ajustez** les données si nécessaire

### Étape 4: Sauvegarde

Cliquez sur **"Enregistrer le processus"** pour finaliser la création.

## 📊 Données extraites

L'IA extrait automatiquement les informations suivantes :

### Informations générales

- ✅ Nom du processus
- ✅ Description
- ✅ Département
- ✅ Localisation

### Responsable

- ✅ Nom du propriétaire
- ✅ Rôle
- ✅ Email
- ✅ Téléphone

### Criticité

- ✅ Niveau de criticité (CRITICAL, HIGH, MEDIUM, LOW)
- ✅ RTO (Recovery Time Objective)
- ✅ MTPD (Maximum Tolerable Period of Disruption)
- ✅ RPO (Recovery Point Objective)
- ✅ MBCO (Minimum Business Continuity Objective)

### Impacts

- ✅ Financier
- ✅ Opérationnel
- ✅ Réputation
- ✅ Légal/Réglementaire
- ✅ Sécurité

### Activités critiques

- ✅ Nom de l'activité
- ✅ Criticité
- ✅ RTO/RPO
- ✅ Impacts opérationnels

### Systèmes

- ✅ Nom du système
- ✅ Type
- ✅ Criticité
- ✅ Solutions alternatives

### Personnel

- ✅ Rôles
- ✅ Nombre de personnes
- ✅ Compétences
- ✅ Solutions de backup

### Dépendances

- ✅ Nom de la dépendance
- ✅ Type
- ✅ Description

## 💡 Conseils pour de meilleurs résultats

### Structure du document

Pour optimiser l'extraction, votre document doit contenir :

1. **Informations claires** sur le processus
2. **Sections identifiables** (titres, sous-titres)
3. **Données structurées** (tableaux, listes)

### Exemple de contenu optimal

```
Processus: Production Ligne A
Description: Fabrication de produits pharmaceutiques
Département: Production
Localisation: Usine Alger

Responsable:
- Nom: Ahmed Ben Salem
- Rôle: Responsable Production
- Email: ahmed@entreprise.com
- Téléphone: +216 71 234 567

Criticité: CRITIQUE
RTO: 4 heures
RPO: 2 heures
MTPD: 8 heures

Impacts en cas d'arrêt:
- Financier: Perte de 50 000 DT/jour
- Opérationnel: Arrêt complet de la production
- Réputation: Perte de confiance clients

Activités critiques:
1. Préparation matières premières (RTO: 2h)
2. Contrôle qualité (RTO: 4h)

Systèmes utilisés:
- ERP SAP (critique)
- MES (haute criticité)
```

## 🔧 Architecture technique

### Backend

**API Route**: `/api/bia/analyze-document`

**Technologies**:

- Azure OpenAI (GPT-4)
- pdf-parse (extraction PDF)
- mammoth (extraction Word)
- xlsx (extraction Excel)

**Processus**:

1. Upload du fichier
2. Extraction du texte selon le type
3. Envoi à Azure OpenAI avec prompt structuré
4. Parsing de la réponse JSON
5. Retour des données extraites

### Frontend

**Composant**: `AIDocumentUpload`

**Technologies**:

- react-dropzone (drag & drop)
- lucide-react (icônes)
- sonner (notifications)

**États**:

- `idle` → En attente
- `uploading` → Upload en cours
- `analyzing` → Analyse avec IA
- `success` → Terminé avec succès
- `error` → Erreur

## 🐛 Gestion d'erreurs

### Erreurs possibles

| Erreur                       | Cause                    | Solution                        |
| ---------------------------- | ------------------------ | ------------------------------- |
| Type de fichier non supporté | Format incorrect         | Utilisez PDF, Word ou Excel     |
| Fichier trop volumineux      | > 10 MB                  | Réduisez la taille du fichier   |
| Document vide                | Pas de texte exploitable | Vérifiez le contenu du document |
| Erreur Azure OpenAI          | Problème API             | Vérifiez les credentials        |
| Timeout                      | Document trop complexe   | Simplifiez le document          |

### Messages d'erreur

```
❌ Type de fichier non supporté
❌ Le fichier est trop volumineux (max 10MB)
❌ Le document ne contient pas assez de texte exploitable
❌ Erreur lors de l'analyse du document
```

## 🔐 Sécurité

### Validation côté serveur

- ✅ Type de fichier vérifié
- ✅ Taille limitée à 10 MB
- ✅ Texte minimum requis (50 caractères)

### Données

- ✅ Pas de stockage permanent du fichier uploadé
- ✅ Traitement en mémoire uniquement
- ✅ Données extraites validées avec Zod schema

## 📝 Variables d'environnement requises

Ajoutez dans `.env` :

```bash
# Azure OpenAI
AZURE_OPENAI_API_KEY=votre_clé_api
AZURE_OPENAI_ENDPOINT=https://votre-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

## 🎨 Interface utilisateur

### Design

- 🎨 Carte avec gradient bleu/violet
- ✨ Icône Sparkles pour l'IA
- 📱 Badge "Azure OpenAI"
- 🎯 Zone de drop avec feedback visuel

### États visuels

**Idle** (en attente):

```
┌─────────────────────────────────────┐
│  ✨ Remplissage Automatique avec IA │
│  [Azure OpenAI]                     │
│                                     │
│  📤 Glissez-déposez ou cliquez      │
│  PDF, Word, Excel - Max 10MB        │
└─────────────────────────────────────┘
```

**Analyzing** (en cours):

```
┌─────────────────────────────────────┐
│  🔄 Analyse avec Azure OpenAI...    │
│  Extraction des informations        │
└─────────────────────────────────────┘
```

**Success** (terminé):

```
┌─────────────────────────────────────┐
│  ✅ Analyse terminée !               │
│  Le formulaire a été rempli         │
│  [📤 Analyser un autre document]    │
└─────────────────────────────────────┘
```

## 🧪 Test de la fonctionnalité

### Scénario de test

1. **Créez un document Word** avec:

   ```
   Processus: Test Production
   Description: Processus de test
   Département: IT
   Responsable: John Doe
   Email: john@test.com
   Criticité: CRITICAL
   RTO: 4
   ```

2. **Accédez à** `/bia/processes/new`

3. **Uploadez** le document

4. **Vérifiez** que les champs sont remplis automatiquement

5. **Ajustez** si nécessaire

6. **Enregistrez** le processus

## 📚 Logs et debugging

### Console logs

```javascript
📄 Extraction du texte depuis: document.docx
🤖 Analyse avec Azure OpenAI...
📋 Données IA reçues: {...}
✅ Données extraites avec succès
```

### Erreurs API

```javascript
❌ Erreur lors de l'analyse: [détails]
```

## 🔄 Mises à jour futures

- [ ] Support de fichiers image (OCR)
- [ ] Multi-langue (EN, FR, AR)
- [ ] Extraction de tableaux complexes
- [ ] Suggestions d'amélioration
- [ ] Historique des uploads
- [ ] Templates pré-définis

## 🆘 Support

En cas de problème :

1. Vérifiez les credentials Azure OpenAI
2. Consultez les logs de la console
3. Testez avec un document simple
4. Contactez l'administrateur système

---

**Version**: 1.0  
**Dernière mise à jour**: 2024  
**Développé avec**: Next.js 15, Azure OpenAI, TypeScript
