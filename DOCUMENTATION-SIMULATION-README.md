# Script de Documentation et Captures - Simulation S.U.R.V.I.V.E. Resilience

Ce dossier contient les outils pour créer une documentation complète avec captures d'écran de la simulation.

## Fichiers créés

### 1. Guide Utilisateur Principal
- **Fichier** : `GUIDE-SIMULATION-UTILISATEUR.md`
- **Description** : Guide complet avec instructions détaillées pour tous les canaux de communication
- **Contenu** : 
  - Vue d'ensemble de la simulation
  - Guide pas-à-pas pour chaque formulaire (Email, SMS, Appel, etc.)
  - Conseils et bonnes pratiques
  - Gestion des tâches

### 2. Script de Captures d'Écran
- **Fichier** : `capture-simulation-screenshots.js`
- **Description** : Script automatisé pour prendre des captures d'écran de tous les formulaires
- **Fonctionnalités** :
  - Capture automatique de chaque canal de communication
  - Screenshots des formulaires ouverts
  - Vue d'ensemble de l'interface
  - Sauvegarde organisée dans `public/screenshots/simulation-forms/`

### 3. Script de Conversion PDF
- **Fichier** : `convert-guide-to-pdf.mjs` (modifié)
- **Description** : Convertit le guide Markdown en PDF professionnel
- **Modifications** : Adapté pour le nouveau guide simulation

## Instructions d'utilisation

### Étape 1 : Prendre les captures d'écran

```bash
# 1. Installer les dépendances
npm install puppeteer

# 2. Démarrer le serveur de développement
npm run dev

# 3. Modifier l'URL dans le script (remplacer [simulationId] par un ID valide)
# Éditer capture-simulation-screenshots.js ligne 8

# 4. Exécuter le script de capture
node capture-simulation-screenshots.js
```

### Étape 2 : Générer le PDF

```bash
# 1. Installer les dépendances (si pas déjà fait)
npm install marked puppeteer

# 2. Convertir le guide en PDF
node convert-guide-to-pdf.mjs
```

### Étape 3 : Vérifier les résultats

Les fichiers générés :
- `GUIDE-SIMULATION-UTILISATEUR.pdf` : Guide complet en PDF
- `public/screenshots/simulation-forms/` : Captures d'écran de tous les formulaires

## Structure du Guide

### 🎯 Sections principales
1. **Vue d'ensemble** - Introduction à la simulation
2. **Accès** - Comment se connecter
3. **Interface** - Navigation dans l'interface
4. **Canaux de Communication** - Guide détaillé pour chaque canal :
   - 📧 Email (rouge)
   - 📱 SMS (vert)
   - 📞 Appel (violet)
   - 🚨 Alerte (orange)
   - 📝 Memo (indigo)
   - 📺 Diffusion de Nouvelles (rose)
   - 📰 Journal (rose foncé)
   - 👥 Social (sarcelle)

### 📝 Pour chaque canal
- **Utilisation** : Quand et pourquoi l'utiliser
- **Étapes** : Comment composer un message
- **Conseils** : Bonnes pratiques spécifiques
- **Capture** : Screenshot du formulaire

## Personnalisation

### Ajouter de nouveaux formulaires
1. Modifier `FORMS_CONFIG` dans `capture-simulation-screenshots.js`
2. Ajouter la section correspondante dans `GUIDE-SIMULATION-UTILISATEUR.md`
3. Régénérer les captures et le PDF

### Changer les couleurs/styles
1. Modifier les CSS dans `convert-guide-to-pdf.mjs`
2. Ajuster les descriptions de couleurs dans le guide Markdown

### Mise à jour des URLs
- Modifier `SIMULATION_URL` dans le script de capture
- Vérifier les liens dans le guide Markdown

## Dépannage

### Problèmes courants
- **Captures floues** : Augmenter la résolution dans le script
- **Formulaires non visibles** : Vérifier les sélecteurs CSS
- **PDF incomplet** : Vérifier que toutes les images sont trouvées

### Logs utiles
```bash
# Voir les logs détaillés
node capture-simulation-screenshots.js > capture.log 2>&1
node convert-guide-to-pdf.mjs > pdf.log 2>&1
```

## Livraison

Le guide final `GUIDE-SIMULATION-UTILISATEUR.pdf` est prêt à être partagé avec les utilisateurs de la simulation. Il contient :

✅ Instructions complètes pour tous les canaux
✅ Captures d'écran à jour 
✅ Conseils et bonnes pratiques
✅ Mise en page professionnelle
✅ Navigation facile avec table des matières

*Guide créé pour S.U.R.V.I.V.E. Resilience - Documentation complète des fonctionnalités de simulation de crise.*