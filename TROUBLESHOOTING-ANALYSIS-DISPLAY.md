# 🔧 Dépannage - L'analyse ne s'affiche pas

## 🔍 Diagnostic Rapide

### Étape 1: Vérifier si une analyse existe

**Script de diagnostic:**

```bash
node test-analysis-display.js <REPORT_ID>
```

**Exemple:**

```bash
node test-analysis-display.js 6919b232bae6cd9e99373d6a
```

Ce script vérifie:

- ✅ Si le rapport existe
- ✅ Si une analyse est sauvegardée
- ✅ La structure de l'analyse
- ✅ Les champs essentiels

---

## 🐛 Problèmes Courants et Solutions

### Problème 1: "Aucune analyse sauvegardée (404)"

**Cause:** L'analyse n'a jamais été lancée pour ce rapport.

**Solution:**

1. Allez sur la page du rapport
2. Cliquez sur **"Lancer l'analyse IA"** ou **"Lancer l'analyse locale"**
3. Attendez que l'analyse se termine (10-30s pour l'IA)
4. L'analyse devrait s'afficher automatiquement

---

### Problème 2: L'analyse a été lancée mais ne s'affiche pas

**Vérification avec la console navigateur:**

1. Ouvrez la page du rapport
2. Appuyez sur **F12** pour ouvrir la console
3. Rechargez la page (**Ctrl+R**)
4. Cherchez ces logs:

```
📡 Status récupération analyse: 200
📥 Analyse sauvegardée chargée: {...}
📊 Type d'analyse: object
✅ État mis à jour - manualAnalysis défini

🔍 Debug affichage analyse:
  - aiAnalysis: false
  - localAnalysis: false
  - manualAnalysis: true  ← Devrait être true
  - analysisType: ai
  - analysis sélectionnée: true ← Devrait être true
✅ Affichage de l'analyse
```

**Si vous voyez "manualAnalysis: false":**

- Le chargement de l'analyse a échoué
- Vérifiez les erreurs réseau dans l'onglet Network

**Si vous voyez "analysis sélectionnée: false":**

- L'analyse n'est pas dans le bon format
- Lancez `node test-analysis-display.js <ID>` pour vérifier la structure

---

### Problème 3: Erreur 500 lors de la récupération

**Cause:** Erreur serveur lors du chargement de l'analyse.

**Solution:**

1. Vérifiez les logs du serveur terminal
2. Cherchez des erreurs comme:

```
❌ Erreur lors de la récupération de l'analyse: ...
```

3. Redémarrez le serveur:

```bash
# Arrêter
Ctrl+C

# Nettoyer et redémarrer
rmdir /s /q .next
npm run dev
```

---

### Problème 4: L'analyse s'est lancée mais n'a pas été sauvegardée

**Vérification:**

Après avoir lancé l'analyse, vérifiez dans la console:

```
💾 Envoi des données: {...}
📥 Réponse du serveur: {success: true, ...}
✅ Analyse enregistrée avec succès!
```

**Si vous ne voyez pas ces logs:**

- La sauvegarde a échoué
- Relancez l'analyse
- Après l'affichage, cliquez sur le bouton **"Éditer"**
- Puis **"Sauvegarder l'analyse"**

---

### Problème 5: L'analyse IA échoue

**Vérifications:**

1. **Clé API Gemini valide dans `.env`:**

```bash
GEMINI_API_KEY=AIzaSyB1LRhsvFGjlJbvtUJ7SxEgFZ1qAS0epI4
```

2. **Connexion internet active**

3. **Quota API non dépassé**

**Solution de contournement:**
Utilisez **"Lancer l'analyse locale"** à la place (instantané, offline, pas besoin d'API).

---

### Problème 6: La page se recharge en boucle

**Cause:** Le composant se re-render infiniment.

**Solution:**
Vérifiez qu'il n'y a pas de `window.location.reload()` dans le code après l'analyse.

---

## 🔬 Diagnostic Avancé

### Vérifier la base de données

L'analyse est stockée dans le champ `reportData.analysis` du rapport.

**Avec MongoDB Compass:**

1. Connectez-vous à votre base MongoDB
2. Allez dans la collection `biaReports`
3. Cherchez le document avec l'`_id` du rapport
4. Vérifiez que `reportData.analysis` existe et contient:
   - `impacts`
   - `criticality`
   - `metrics`
   - `continuityLevel`
   - `resume`
   - `dependencies`
   - `spof`

**Structure attendue:**

```json
{
  "_id": "6919b232bae6cd9e99373d6a",
  "name": "Mon Rapport BIA",
  "reportData": {
    "analysis": {
      "impacts": [...],
      "criticality": {...},
      "metrics": {...},
      "continuityLevel": {...},
      "resume": "...",
      "dependencies": [...],
      "spof": [...],
      "analysisDate": "2025-11-16T...",
      "confidence": 75
    },
    "... autres données ..."
  }
}
```

---

### Tester l'API directement

**1. Vérifier le rapport:**

```bash
curl http://localhost:3001/api/bia/report/<ID>
```

**2. Lancer l'analyse:**

```bash
curl -X POST http://localhost:3001/api/bia/report/<ID>/analyze
```

**3. Récupérer l'analyse:**

```bash
curl http://localhost:3001/api/bia/reports/<ID>/analysis
```

---

## ✅ Checklist de Vérification

Cochez chaque étape:

- [ ] Le serveur Next.js tourne (http://localhost:3001)
- [ ] Le rapport existe (pas d'erreur 404)
- [ ] L'analyse a été lancée (bouton cliqué)
- [ ] L'analyse s'est terminée sans erreur
- [ ] La console affiche "✅ Analyse enregistrée avec succès!"
- [ ] Le diagnostic `node test-analysis-display.js <ID>` trouve l'analyse
- [ ] La console navigateur affiche "manualAnalysis: true"
- [ ] Pas d'erreur JavaScript dans la console
- [ ] Pas d'erreur réseau (onglet Network)

---

## 🚀 Forcer l'affichage

Si rien ne marche, forcez une nouvelle analyse:

1. Allez sur la page du rapport
2. Cliquez sur **"Lancer l'analyse locale"** (instantané)
3. L'analyse devrait s'afficher immédiatement
4. Cliquez sur **"Éditer"**
5. Vérifiez les valeurs
6. Cliquez sur **"Sauvegarder l'analyse"**
7. Rechargez la page (**Ctrl+R**)
8. L'analyse devrait être persistante

---

## 📞 Derniers Recours

Si l'analyse ne s'affiche toujours pas:

1. **Vérifiez les logs serveur en détail:**

   - Cherchez les erreurs commençant par `❌`
   - Vérifiez les erreurs Prisma/MongoDB

2. **Nettoyez complètement:**

```bash
# Arrêter le serveur
Ctrl+C

# Nettoyer
rmdir /s /q .next
rmdir /s /q node_modules\.cache

# Redémarrer
npm run dev
```

3. **Testez avec un nouveau rapport:**

   - Uploadez un nouveau fichier BIA
   - Lancez l'analyse locale
   - Vérifiez si ça fonctionne

4. **Vérifiez TypeScript:**

```bash
npm run build
```

- Si des erreurs TypeScript apparaissent, corrigez-les

---

## 🎯 Test Final

**Script de test complet:**

```bash
# 1. Diagnostic
node test-analysis-display.js <REPORT_ID>

# 2. Si aucune analyse: lancer via API
node test-bia-api-complete.js <REPORT_ID>

# 3. Re-diagnostic
node test-analysis-display.js <REPORT_ID>
```

**Si tout passe ✅** → L'analyse devrait s'afficher!

---

## 📝 Logs de Debug Ajoutés

Le code a été modifié pour ajouter des logs de debug:

**Au chargement:**

```javascript
console.log("📡 Status récupération analyse:", status);
console.log("📥 Analyse sauvegardée chargée:", savedAnalysis);
console.log("📊 Type d'analyse:", typeof savedAnalysis);
console.log("✅ État mis à jour - manualAnalysis défini");
```

**À l'affichage:**

```javascript
console.log("🔍 Debug affichage analyse:");
console.log("  - aiAnalysis:", !!aiAnalysis);
console.log("  - manualAnalysis:", !!manualAnalysis);
console.log("  - analysisType:", analysisType);
console.log("✅ Affichage de l'analyse");
```

Rechargez la page et vérifiez ces logs dans la console (F12).

---

**Tout devrait maintenant fonctionner! 🎉**
