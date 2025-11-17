# 🔧 TROUBLESHOOTING - Problèmes de Navigation

## ❌ Problème: La sidebar n'a pas changé

### ✅ Solution Complète (Étape par Étape)

#### 1. Vérifier quel fichier est utilisé

Le projet utilise **`src/components/layout/sidebar.tsx`** (PAS `main-nav.tsx`)

✅ **Ce fichier a été mis à jour avec la nouvelle structure en 4 modules**

---

#### 2. Arrêter complètement le serveur

```bash
# Dans votre terminal actuel:
# Appuyez sur Ctrl+C

# Attendez le message "Process terminated" ou similaire
```

---

#### 3. Nettoyer le cache Next.js

**Option A: Ligne de commande**

```bash
# Windows (cmd)
rmdir /s /q .next

# PowerShell
Remove-Item -Recurse -Force .next

# Linux/Mac
rm -rf .next
```

**Option B: Manuellement**

- Ouvrez le dossier du projet dans l'explorateur
- Supprimez le dossier `.next`

---

#### 4. Redémarrer le serveur

```bash
pnpm dev
```

**Attendez le message:**

```
✓ Ready in 2.5s
○ Local:   http://localhost:3000
```

---

#### 5. Vider le cache du navigateur

**Méthode 1: Rechargement forcé**

```
Ctrl + Shift + R  (Windows/Linux)
Cmd + Shift + R   (Mac)
```

**Méthode 2: Outils de développement**

1. Appuyez sur `F12`
2. Onglet **Network** (Réseau)
3. Cochez **Disable cache**
4. Rechargez la page

**Méthode 3: Mode navigation privée**

1. Ouvrez une fenêtre de navigation privée (Ctrl+Shift+N)
2. Allez sur http://localhost:3000

---

## 🧪 Tests de Vérification

### Test 1: Vérifier le contenu du fichier

```bash
# Ouvrir le fichier dans VSCode
code src\components\layout\sidebar.tsx

# Chercher (Ctrl+F):
"🎮 Simulation"
```

✅ **Si trouvé:** Le fichier est bien modifié  
❌ **Si non trouvé:** Le fichier n'a pas été modifié correctement

---

### Test 2: Vérifier la compilation

```bash
# Vérifier les erreurs TypeScript
pnpm typecheck

# Vérifier les erreurs ESLint
pnpm lint
```

✅ **Aucune erreur:** Le code est valide  
❌ **Erreurs présentes:** Consultez les erreurs et corrigez

---

### Test 3: Forcer la reconstruction

```bash
# 1. Arrêter le serveur (Ctrl+C)

# 2. Nettoyer complètement
rmdir /s /q .next
rmdir /s /q node_modules\.cache

# 3. Rebuilder
pnpm build

# 4. Relancer
pnpm dev
```

---

## 🐛 Problèmes Spécifiques

### Problème 1: Je vois toujours l'ancienne structure

**Symptôme:**

```
Dashboard
Tableau de bord
Users
Équipe
...
```

**Causes possibles:**

1. ❌ Cache Next.js non vidé
2. ❌ Cache navigateur non vidé
3. ❌ Serveur pas redémarré
4. ❌ Mauvais fichier sidebar utilisé

**Solution:**

```bash
# Tout nettoyer
rmdir /s /q .next
pnpm dev

# Dans le navigateur: Ctrl+Shift+R
```

---

### Problème 2: Erreur "Cannot find module"

**Symptôme:**

```
Error: Cannot find module '@/components/layout/sidebar'
```

**Solution:**

```bash
# Réinstaller les dépendances
pnpm install

# Puis redémarrer
pnpm dev
```

---

### Problème 3: Les émojis ne s'affichent pas

**Symptôme:**
Les titres "🎮 Simulation" apparaissent comme "□ Simulation"

**Cause:**
Encodage du fichier incorrect

**Solution:**

1. Ouvrir `src/components/layout/sidebar.tsx`
2. En bas à droite de VSCode, vérifier l'encodage
3. Cliquer dessus et choisir **"Save with Encoding"**
4. Sélectionner **"UTF-8"**
5. Sauvegarder (Ctrl+S)

---

### Problème 4: Les sous-menus ne s'ouvrent pas

**Symptôme:**
Cliquer sur "🎮 Simulation" ne déploie pas le sous-menu

**Causes possibles:**

1. JavaScript désactivé
2. Erreur console
3. État React non synchronisé

**Solution:**

```bash
# 1. Ouvrir DevTools (F12)
# 2. Onglet Console
# 3. Vérifier les erreurs

# Si erreurs, copier et rechercher la solution
```

---

### Problème 5: Build échoue

**Symptôme:**

```
pnpm build
# Erreurs de compilation
```

**Solution:**

```bash
# Vérifier les erreurs TypeScript
pnpm typecheck

# Si erreurs, les corriger puis:
pnpm build
```

---

## 📊 Checklist Complète

Cochez chaque étape:

- [ ] 1. Serveur arrêté (Ctrl+C)
- [ ] 2. Cache .next supprimé
- [ ] 3. Fichier `sidebar.tsx` contient "🎮 Simulation"
- [ ] 4. Aucune erreur `pnpm typecheck`
- [ ] 5. Aucune erreur `pnpm lint`
- [ ] 6. Serveur redémarré (`pnpm dev`)
- [ ] 7. Message "Ready" affiché
- [ ] 8. Navigateur ouvert sur http://localhost:3000
- [ ] 9. Cache navigateur vidé (Ctrl+Shift+R)
- [ ] 10. Nouvelle structure visible

---

## 🔍 Vérification Visuelle Attendue

### ✅ CE QUE VOUS DEVRIEZ VOIR

```
┌─────────────────────────────────┐
│  SURVIVE.ADMIN                  │  ← Header avec gradient
├─────────────────────────────────┤
│                                 │
│  🏠  Dashboard                  │  ← Seul en haut
│                                 │
│  🎮  Simulation            ▼   │  ← Cliquer déploie
│     ├─ Liste simulations        │
│     ├─ Créer simulation         │
│     ├─ Scénarios                │
│     ├─ Injections               │
│     ├─ Mode Participant         │
│     └─ Participations           │
│                                 │
│  🎓  Instructeur           ▼   │
│     ├─ Vue Instructeur          │
│     ├─ Gestion d'équipes        │
│     └─ ...                      │
│                                 │
│  📊  BIA - Analyse...      ▼   │
│     ├─ Dashboard BIA            │
│     └─ ...                      │
│                                 │
│  📚  Workshop              ▼   │
│     ├─ Formations               │
│     └─ ...                      │
│                                 │
│  👤  Profil & Compte       ▼   │
│  🛡️  Administration        ▼   │
│                                 │
└─────────────────────────────────┘
```

### ❌ CE QUE VOUS NE DEVRIEZ PLUS VOIR

```
❌ Tableau de bord (ancienne structure)
❌ Users
❌ Équipe
❌ Tâches
❌ Incidents
❌ Plans
❌ Notifications
❌ Simulations (sans sous-menu)
❌ Vue Instructeur (sans sous-menu)
...
```

---

## 🆘 Dernier Recours

Si rien ne fonctionne:

### Option 1: Reset Complet

```bash
# 1. Arrêter le serveur
Ctrl+C

# 2. Tout nettoyer
rmdir /s /q .next
rmdir /s /q node_modules

# 3. Réinstaller
pnpm install

# 4. Relancer
pnpm dev
```

### Option 2: Vérifier Git

```bash
# Voir les fichiers modifiés
git status

# Voir les changements
git diff src/components/layout/sidebar.tsx

# Si nécessaire, reset
git checkout src/components/layout/sidebar.tsx
# Puis réappliquer les modifications
```

### Option 3: Copier-Coller Manuel

1. Ouvrir `BACKUP-NEW-SIDEBAR.md` (si disponible)
2. Copier le contenu complet
3. Remplacer dans `src/components/layout/sidebar.tsx`
4. Sauvegarder (Ctrl+S)
5. Redémarrer le serveur

---

## 📞 Demander de l'Aide

Si le problème persiste, fournissez:

1. **Capture d'écran** de la sidebar actuelle
2. **Logs du terminal** (erreurs)
3. **Console navigateur** (F12 > Console > erreurs)
4. **Version Node.js:** `node --version`
5. **Version pnpm:** `pnpm --version`

---

## ✅ Validation Finale

Une fois que ça marche:

```bash
# 1. Prendre une capture d'écran
# 2. Tester tous les modules
# 3. Vérifier que les routes fonctionnent
# 4. Commit les changements

git add .
git commit -m "feat: Nouvelle navigation en 4 modules"
git push
```

---

**Si vous suivez toutes ces étapes et que ça ne fonctionne toujours pas, il y a probablement un problème technique plus profond. Dans ce cas, créez une issue GitHub avec tous les détails.**

---

**Date:** 15 Novembre 2025  
**Version:** 1.0.0
