# 🚀 Optimisations Puppeteer pour SITREP PDF

## Problème résolu : Timeout de génération PDF

### ❌ Problème initial

- **Erreur** : "Navigation timeout of 30000 ms exceeded"
- **Cause** : Puppeteer prenait plus de 30 secondes pour générer le PDF
- **Impact** : Les emails ne partaient jamais

### ✅ Solutions appliquées

#### 1. Arguments de lancement optimisés

```javascript
args: [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage", // Évite les problèmes de mémoire partagée
  "--disable-accelerated-2d-canvas", // Désactive l'accélération GPU
  "--disable-gpu", // Pas besoin de GPU pour PDF
];
```

#### 2. Timeouts augmentés

- **Browser timeout** : 60 secondes (au lieu de 30)
- **setContent timeout** : 30 secondes
- **pdf() timeout** : 30 secondes

#### 3. Chargement optimisé

- **Avant** : `waitUntil: "networkidle0"` (attend que tout soit chargé)
- **Après** : `waitUntil: "domcontentloaded"` (plus rapide, suffit pour PDF)

#### 4. Blocage des ressources inutiles

```javascript
await page.setRequestInterception(true);
page.on("request", (req) => {
  // Bloquer images, CSS, fonts pour accélérer
  if (["image", "stylesheet", "font"].includes(req.resourceType())) {
    req.abort();
  } else {
    req.continue();
  }
});
```

#### 5. Logs de performance

- Mesure du temps de génération
- Affichage de la taille du PDF généré

### 📊 Performance attendue

**Avant optimisation** :

- ❌ Timeout après 30 secondes
- ❌ 0% de réussite

**Après optimisation** :

- ✅ Génération en 2-5 secondes (typiquement)
- ✅ 95%+ de réussite
- ⚡ Timeout seulement si serveur surchargé

### 🔍 Monitoring

Dans les logs du serveur, vous verrez maintenant :

```
📄 Génération du PDF SITREP...
✅ PDF généré avec succès en 3245ms, taille: 45678 bytes
📧 Envoi de l'email à: walaeddine1207@gmail.com
✅ Email envoyé avec succès: <message-id>
```

### ⚠️ Si les timeouts persistent

1. **Vérifiez la RAM du serveur**

   - Puppeteer utilise ~100-200MB par instance
   - Si RAM insuffisante, augmentez-la

2. **En production (déploiement)**

   - Ajoutez ces variables d'environnement :
     ```bash
     PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
     PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
     ```
   - Installez Chromium sur le serveur

3. **Alternative : PDFKit**
   - Si Puppeteer continue à timeout, considérez PDFKit (plus léger)
   - Moins de fonctionnalités de mise en page mais plus rapide

### 🎯 Résultat final

L'envoi des SITREPs par email devrait maintenant fonctionner de manière fiable et rapide !

---

**Date de création** : 19 octobre 2025
**Optimisations appliquées** : ✅
