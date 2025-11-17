# 🚀 Guide de Test - Nouvelle Navigation

## ⚡ Étapes pour Voir la Nouvelle Structure

### 1. Redémarrer le Serveur de Développement

```bash
# Dans votre terminal, arrêtez le serveur actuel (Ctrl+C)
# Puis relancez :

pnpm dev
```

### 2. Actualiser le Navigateur

```
Appuyez sur Ctrl+Shift+R (ou Cmd+Shift+R sur Mac)
pour forcer le rechargement et vider le cache
```

### 3. Ce que Vous Devriez Voir

```
┌─────────────────────────────────────┐
│  🔷 SURVIVE.ADMIN                   │
├─────────────────────────────────────┤
│                                     │
│  🏠  Dashboard                      │  ← En haut, seul
│                                     │
│  🎮  Simulation                ▼   │  ← MODULE avec flèche
│     ├─ 📋 Liste des simulations     │
│     ├─ ➕ Créer simulation           │
│     ├─ 🎯 Scénarios                 │
│     ├─ ⚙️  Injections               │
│     ├─ 👤 Mode Participant          │
│     └─ 👥 Participations            │
│                                     │
│  🎓  Instructeur               ▼   │  ← MODULE avec flèche
│     ├─ 🎯 Vue Instructeur           │
│     ├─ 👥 Gestion d'équipes         │
│     ├─ 👤 Membres d'équipe          │
│     ├─ 💬 Chat d'équipe             │
│     ├─ 📋 Gestion des tâches        │
│     ├─ ⚠️  Incidents                │
│     └─ 📄 Rapports                  │
│                                     │
│  📊  BIA - Analyse d'Impact    ▼   │  ← MODULE avec flèche
│     ├─ 📈 Dashboard BIA             │
│     ├─ 📋 Liste des processus       │
│     ├─ ➕ Nouveau processus          │
│     ├─ 🏭 Usines / Factories        │
│     ├─ 📄 Rapports BIA              │
│     ├─ 🛡️  Conformité               │
│     └─ ⚠️  Gestion des risques      │
│                                     │
│  📚  Workshop                  ▼   │  ← MODULE avec flèche
│     ├─ 📖 Formations                │
│     ├─ 📋 Plans d'action            │
│     ├─ ⚙️  Types de plans           │
│     ├─ 👥 Événements                │
│     └─ ✉️  Notifications            │
│                                     │
│  👤  Profil & Compte           ▼   │
│     ├─ 👤 Mon Profil                │
│     ├─ ⚙️  Paramètres               │
│     └─ 💳 Plans & Abonnements       │
│                                     │
│  🛡️  Administration            ▼   │  ← Si vous êtes ADMIN
│     ├─ 🛡️  Panel Admin              │
│     ├─ 👥 Utilisateurs              │
│     ├─ 🔐 Super Admin               │
│     └─ ✉️  Email Diagnostics        │
│                                     │
└─────────────────────────────────────┘
```

---

## 🔍 Comparaison Avant/Après

### ❌ AVANT (ce que vous voyez actuellement dans l'image)

```
Dashboard (rouge/actif)
Tableau de bord
Users
Équipe
Tâches
Incidents
Plans
Notifications
Simulations
Vue Instructeur
Scénarios
Mode Participant
BIA
Participations
Déconnexion
```

**Problèmes :**

- ❌ Liste plate de 15 items
- ❌ Pas de hiérarchie claire
- ❌ Difficile de trouver les fonctionnalités
- ❌ Mélange de niveaux différents

### ✅ APRÈS (nouvelle structure en 4 modules)

```
🏠 Dashboard

🎮 Simulation (6 sous-pages)
🎓 Instructeur (7 sous-pages)
📊 BIA (7 sous-pages)
📚 Workshop (5 sous-pages)

👤 Profil & Compte (3 sous-pages)
🛡️ Administration (4 sous-pages)
```

**Avantages :**

- ✅ 6 modules principaux seulement
- ✅ Hiérarchie parent/enfant claire
- ✅ Regroupement logique par domaine
- ✅ Navigation plus rapide

---

## 🧪 Tests à Effectuer

### Test 1 : Vérifier le Dashboard

- [ ] Cliquer sur "Dashboard"
- [ ] Vérifier que la page se charge
- [ ] Vérifier que "Dashboard" est surligné

### Test 2 : Module Simulation

- [ ] Cliquer sur "🎮 Simulation"
- [ ] Vérifier que le sous-menu se déploie
- [ ] Cliquer sur "Liste des simulations"
- [ ] Vérifier la navigation

### Test 3 : Module Instructeur

- [ ] Cliquer sur "🎓 Instructeur"
- [ ] Vérifier le déploiement du sous-menu
- [ ] Tester "Vue Instructeur"
- [ ] Tester "Gestion d'équipes"

### Test 4 : Module BIA

- [ ] Cliquer sur "📊 BIA"
- [ ] Vérifier toutes les sous-pages
- [ ] Tester "Dashboard BIA"
- [ ] Tester "Nouveau processus"

### Test 5 : Module Workshop

- [ ] Cliquer sur "📚 Workshop"
- [ ] Vérifier "Formations"
- [ ] Vérifier "Plans d'action"

### Test 6 : Responsive (Mobile)

- [ ] Ouvrir les DevTools (F12)
- [ ] Activer le mode responsive
- [ ] Vérifier le menu hamburger
- [ ] Tester la navigation mobile

---

## 🐛 Problèmes Possibles et Solutions

### Problème 1 : Je ne vois pas les changements

**Solution :**

```bash
# 1. Arrêter le serveur (Ctrl+C)
# 2. Nettoyer le cache Next.js
rm -rf .next

# 3. Relancer
pnpm dev

# 4. Vider le cache du navigateur (Ctrl+Shift+R)
```

### Problème 2 : Les émojis ne s'affichent pas

**Solution :**

- Les émojis (🎮, 🎓, etc.) devraient s'afficher
- Si problème, vérifiez l'encodage UTF-8 du fichier

### Problème 3 : Les sous-menus ne s'ouvrent pas

**Solution :**

- Vérifier que le composant `SidebarMenuSub` est bien importé
- Vérifier la console du navigateur pour les erreurs JavaScript

### Problème 4 : Erreur 404 sur certaines pages

**Solution :**

- Certaines routes doivent être créées :
  - `/simulation/create` (à créer si n'existe pas)
  - `/instructor-simulations` (à créer si n'existe pas)
  - `/bia/factories` (à créer si n'existe pas)

---

## 📝 Commandes Utiles

### Vérifier les erreurs TypeScript

```bash
pnpm typecheck
```

### Vérifier les erreurs ESLint

```bash
pnpm lint
```

### Builder le projet

```bash
pnpm build
```

### Vérifier les routes existantes

```bash
# Lister tous les dossiers dans app/(app)/
dir src\app\(app)
```

---

## 🎨 Personnalisation (Optionnel)

### Changer les Émojis

Si vous préférez d'autres émojis, modifiez dans `navigation.tsx` :

```typescript
// Au lieu de 🎮 Simulation
title: "🎯 Simulation";

// Au lieu de 🎓 Instructeur
title: "👨‍🏫 Instructeur";

// Au lieu de 📊 BIA
title: "📈 BIA";

// Au lieu de 📚 Workshop
title: "🎓 Workshop";
```

### Ajouter des Séparateurs Visuels

Ajoutez dans `main-nav.tsx` après chaque groupe :

```tsx
{
  /* Séparateur */
}
<div className="my-2 border-t border-border"></div>;
```

### Changer le Logo

Remplacez `/logo.svg` par votre propre logo dans le dossier `public/`

---

## ✅ Checklist de Validation

- [ ] Le serveur dev est relancé
- [ ] Le navigateur est actualisé (Ctrl+Shift+R)
- [ ] Je vois 6 modules principaux au lieu de 15 items
- [ ] Les sous-menus se déploient au clic
- [ ] La navigation fonctionne correctement
- [ ] Le logo SURVIVE.ADMIN s'affiche
- [ ] Les icônes sont visibles
- [ ] Le responsive fonctionne (mobile)
- [ ] Aucune erreur dans la console

---

## 📸 Captures d'Écran Attendues

### Desktop - Menu Déployé

```
┌──────────────┬─────────────────────────┐
│              │                         │
│  SURVIVE     │   Tableau de bord      │
│              │                         │
│ 🏠 Dashboard │   [Cards métriques]     │
│              │                         │
│ 🎮 Simulation│   [Graphiques]          │
│  └─ Liste    │                         │
│  └─ Créer    │                         │
│              │                         │
│ 🎓 Instructeur│                        │
│  └─ Vue...   │                         │
│              │                         │
└──────────────┴─────────────────────────┘
```

### Mobile - Menu Overlay

```
┌─────────────────────┐
│ [☰] SURVIVE    [🌙] │
├─────────────────────┤
│                     │
│  Tableau de bord    │
│                     │
└─────────────────────┘

[Sidebar en overlay quand on clique sur ☰]
```

---

## 🚀 Prochaines Étapes

Une fois que vous confirmez que tout fonctionne :

1. ✅ Tester toutes les routes
2. ✅ Créer les pages manquantes si nécessaire
3. ✅ Ajouter des tooltips (optionnel)
4. ✅ Configurer les permissions par rôle
5. ✅ Déployer en staging
6. ✅ Collecter les retours utilisateurs

---

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez la console navigateur (F12)
2. Vérifiez les logs du terminal
3. Consultez les fichiers de documentation créés
4. Créez une issue GitHub si nécessaire

---

**Bonne chance avec les tests ! 🎉**

La nouvelle navigation devrait apparaître après le redémarrage du serveur.
