# 🧪 Guide de Test de l'Analyse BIA

## 📋 Scripts de Test Disponibles

### 1️⃣ **test-bia-analysis.js** - Tests Locaux Heuristiques

Test l'analyse locale sans appel API (rapide, offline)

**Usage:**

```bash
node test-bia-analysis.js
```

**Ce qu'il teste:**

- ✅ Extraction de mots-clés BIA
- ✅ Calcul du score de criticité
- ✅ Extraction des métriques (RTO, RPO, MTPD)
- ✅ Détection du responsable et contact
- ✅ 3 scénarios: rapport basique, riche, minimal

**Résultats attendus:**

- 3 tests réussis (100%)
- Scores de criticité variables selon le contenu
- Extraction correcte des métriques et responsables

---

### 2️⃣ **test-bia-api-complete.js** - Tests API Complets

Test la chaîne complète avec l'API Gemini (nécessite un rapport existant)

**Usage:**

```bash
# Étape 1: Obtenir un ID de rapport
# Allez sur http://localhost:3001/bia/reports
# Cliquez sur un rapport
# Copiez l'ID depuis l'URL (ex: 6919b232bae6cd9e99373d6a)

# Étape 2: Lancer le test
node test-bia-api-complete.js 6919b232bae6cd9e99373d6a
```

**Ce qu'il teste:**

- ✅ Vérification du rapport (GET /api/bia/report/{id})
- ✅ Analyse IA Gemini (POST /api/bia/report/{id}/analyze)
- ✅ Sauvegarde de l'analyse (POST /api/bia/reports/{id}/analysis)
- ✅ Récupération de l'analyse (GET /api/bia/reports/{id}/analysis)
- ✅ Cohérence des données

**Résultats attendus:**

- Analyse IA en 10-30 secondes
- Extraction complète des impacts, dépendances, SPOF
- Responsable du processus détecté
- Sauvegarde et récupération réussies
- Données cohérentes

---

## 🚀 Démarrage Rapide

### Prérequis

1. Serveur Next.js démarré:

```bash
npm run dev
```

2. Application accessible sur http://localhost:3001

### Test 1: Analyse Locale (Sans API)

```bash
node test-bia-analysis.js
```

✅ Devrait afficher 100% de réussite

### Test 2: Analyse API Complète

**Étape A: Créer ou récupérer un rapport**

1. Ouvrez http://localhost:3001/bia/reports
2. Cliquez sur "Upload" pour créer un nouveau rapport
3. Ou cliquez sur un rapport existant
4. Copiez l'ID depuis l'URL

**Étape B: Lancer le test**

```bash
node test-bia-api-complete.js <VOTRE_ID_ICI>
```

**Exemple:**

```bash
node test-bia-api-complete.js 6919b232bae6cd9e99373d6a
```

---

## 📊 Exemples de Résultats

### Analyse Locale Réussie

```
🧪 TEST: Analyse Locale (Heuristique)
📊 Données du rapport: [...]
⚡ Exécution de l'analyse heuristique...

📈 Statistiques:
  - Mots-clés "processus": 3
  - Mots-clés "risques": 5
  - Mots-clés "impacts": 12
  - Mots-clés "continuité": 7
  - Mots-clés "critique": 9

📊 Métriques extraites:
  - RTO: 8h
  - RPO: 4h
  - MTPD: 24h

👤 Responsable détecté:
  - Nom: Jean Dupont
  - Email: jean.dupont@survive.com

⚠️ Score de criticité:
  - Score: 72/100
  - Niveau: MOYEN

✅ Analyse locale terminée avec succès!
```

### Analyse API Réussie

```
🧠 ÉTAPE 3: Analyse IA (Gemini)
📡 POST /api/bia/report/xxx/analyze
⏳ Analyse en cours (peut prendre 10-30s)...
✅ Analyse terminée en 12.5s

📊 RÉSULTATS DE L'ANALYSE:

  📝 Résumé:
     Cette analyse BIA révèle un niveau de maturité intermédiaire...

  📈 Métriques BIA:
     • RTO: 8h
     • MTPD: 24h
     • MBCO: 6h
     • RPO: 4h

  ⚠️  Criticité:
     • Niveau: MOYEN
     • Score: 65/100
     • Justification: Analyse basée sur les standards BIA...

  👤 Responsable du Processus:
     • Nom: Jean Dupont
     • Rôle: Chef de service Production
     • Contact: jean.dupont@survive.com

  💥 Impacts identifiés: 3
     1. Financier (haut)
     2. Opérationnel (moyen)
     3. Réputationnel (moyen)

  🔗 Dépendances critiques: 4
     1. Système informatique (système - critique)
     2. Fournisseur d'électricité (infrastructure - critique)
     3. Personnel clé (personnel - important)

  🚨 SPOF (Points de défaillance): 2
     1. Serveur principal - Risque: CRITIQUE
     2. Responsable technique unique - Risque: ÉLEVÉ

  📊 Confiance de l'analyse: 75%

💾 ÉTAPE 4: Sauvegarde de l'analyse
✅ Analyse sauvegardée avec succès!

📥 ÉTAPE 5: Vérification de la sauvegarde
✅ Analyse récupérée avec succès!
✅ Les données sont cohérentes!

✅ TEST TERMINÉ AVEC SUCCÈS
🎉 Tous les tests ont réussi!
```

---

## 🔧 Dépannage

### Erreur: "Aucun ID de rapport fourni"

**Solution:** Fournissez un ID en paramètre

```bash
node test-bia-api-complete.js 6919b232bae6cd9e99373d6a
```

### Erreur: "Rapport non trouvé (HTTP 404)"

**Solution:** Vérifiez que l'ID est correct

1. Allez sur http://localhost:3001/bia/reports
2. Copiez l'ID exact depuis l'URL d'un rapport existant

### Erreur: "fetch is not defined"

**Solution:** Vous utilisez Node.js < 18. Installez node-fetch:

```bash
npm install node-fetch
```

Puis ajoutez en haut du script:

```javascript
import fetch from "node-fetch";
```

### Analyse IA échouée

**Vérifications:**

1. Clé API Gemini valide dans `.env`
2. Connexion internet active
3. Quota API non dépassé

**Fallback:** L'analyse locale fonctionne toujours offline

### Erreur: "EPERM: operation not permitted"

**Solution:** Arrêtez les processus Node.js en cours:

```bash
taskkill /F /IM node.exe
npm run dev
```

---

## 📝 Checklist de Validation

### Tests Locaux ✅

- [ ] `node test-bia-analysis.js` → 100% réussite
- [ ] Extraction des métriques RTO/RPO/MTPD
- [ ] Détection du responsable (nom, rôle, contact)
- [ ] Calcul du score de criticité
- [ ] 3 scénarios testés (basique, riche, minimal)

### Tests API ✅

- [ ] Rapport existant accessible
- [ ] Analyse IA complétée en 10-30s
- [ ] Impacts identifiés (financier, opérationnel, réputationnel)
- [ ] Dépendances critiques extraites
- [ ] SPOF détectés avec mitigations
- [ ] Responsable du processus extrait
- [ ] Sauvegarde réussie en base de données
- [ ] Récupération cohérente des données

### Interface Utilisateur ✅

- [ ] Page `/bia/reports/[id]` affiche le bouton "Analyser"
- [ ] Analyse IA Gemini fonctionnelle
- [ ] Analyse locale instantanée
- [ ] Résultats affichés avec cartes métriques
- [ ] Section responsable visible
- [ ] Bouton "Éditer" permet la modification
- [ ] Sauvegarde persistante après rechargement

---

## 🎯 Résumé

**Scripts disponibles:**

1. `test-bia-analysis.js` - Tests locaux rapides
2. `test-bia-api-complete.js <ID>` - Tests API complets

**Pour un test complet:**

```bash
# Terminal 1: Démarrer le serveur
npm run dev

# Terminal 2: Test local
node test-bia-analysis.js

# Terminal 3: Test API (avec un ID réel)
node test-bia-api-complete.js 6919b232bae6cd9e99373d6a
```

**Résultats attendus:**

- ✅ Tous les tests passent
- ✅ Analyse IA fonctionnelle
- ✅ Extraction automatique des données
- ✅ Sauvegarde persistante
- ✅ Interface utilisateur responsive

---

## 📞 Support

En cas de problème:

1. Vérifiez les logs du serveur
2. Inspectez la console du navigateur (F12)
3. Testez d'abord l'analyse locale (offline)
4. Vérifiez la clé API Gemini dans `.env`

**Tout est prêt pour tester! 🚀**
