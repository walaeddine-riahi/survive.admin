# 🧪 GUIDE DE TEST - SIDEBAR COMPLÈTE

## ✅ CHECKLIST DE VÉRIFICATION

### 1. Préparation ⚙️

- [ ] Serveur de développement arrêté
- [ ] Cache `.next/` supprimé
- [ ] Dépendances à jour (`pnpm install`)
- [ ] Aucune erreur TypeScript (`pnpm typecheck`)

### 2. Démarrage 🚀

```bash
# Méthode 1 : Script automatique
.\restart-dev-server.bat

# Méthode 2 : Manuelle
rd /s /q .next
pnpm dev
```

### 3. Tests de Navigation 🧭

#### A. Dashboard Principal

- [ ] Accéder à `http://localhost:3000/dashboard`
- [ ] La sidebar s'affiche à gauche
- [ ] Le header affiche "SURVIVE.ADMIN"
- [ ] Le bouton Dashboard est visible

#### B. Module Simulation (6 pages)

- [ ] Cliquer sur "🎮 Simulation"
- [ ] Le module s'expand et affiche 6 sous-pages
- [ ] Tester chaque lien :
  - [ ] Liste des simulations → `/simulation`
  - [ ] Créer simulation → `/simulation/create`
  - [ ] Scénarios → `/scenario`
  - [ ] Injections → `/injections`
  - [ ] Mode Participant → `/participant-mode`
  - [ ] Participations → `/participations`

#### C. Module Instructeur (10 pages)

- [ ] Cliquer sur "🎓 Instructeur"
- [ ] Le module s'expand et affiche 10 sous-pages
- [ ] Tester chaque lien :
  - [ ] Vue Instructeur → `/instructor-simulations`
  - [ ] Gestion d'équipes → `/team`
  - [ ] Liste des équipes → `/teams`
  - [ ] Membres d'équipe → `/team-members`
  - [ ] Membre (ancien) → `/team-member`
  - [ ] Chat d'équipe → `/team-chat`
  - [ ] Gestion des tâches → `/task`
  - [ ] Incidents → `/incident`
  - [ ] Créer incident → `/incident/create`
  - [ ] Rapports → `/report`

#### D. Module BIA (9 pages)

- [ ] Cliquer sur "📊 BIA - Analyse d'Impact"
- [ ] Le module s'expand et affiche 9 sous-pages
- [ ] Tester chaque lien :
  - [ ] Dashboard BIA → `/bia/dashboard`
  - [ ] Liste des processus → `/bia`
  - [ ] Nouveau processus → `/bia/processes/new`
  - [ ] Éditer processus → `/bia/processes/edit`
  - [ ] Usines / Factories → `/bia/factories`
  - [ ] Rapports BIA → `/bia/reports`
  - [ ] Conformité → `/compliance`
  - [ ] Conformité (alt) → `/conformity`
  - [ ] Gestion des risques → `/risk`

#### E. Module Workshop (5 pages)

- [ ] Cliquer sur "📚 Workshop"
- [ ] Le module s'expand et affiche 5 sous-pages
- [ ] Tester chaque lien :
  - [ ] Formations → `/training`
  - [ ] Plans d'action → `/plan`
  - [ ] Types de plans → `/plan-type`
  - [ ] Événements → `/participations`
  - [ ] Notifications → `/notifications`

#### F. Profil & Compte (2 pages)

- [ ] Cliquer sur "👤 Profil & Compte"
- [ ] Le module s'expand et affiche 2 sous-pages
- [ ] Tester chaque lien :
  - [ ] Mon Profil → `/profile`
  - [ ] Paramètres → `/settings`

#### G. Administration (3 pages)

- [ ] Cliquer sur "🛡️ Administration"
- [ ] Le module s'expand et affiche 3 sous-pages
- [ ] Tester chaque lien :
  - [ ] Panel Admin → `/admin`
  - [ ] Utilisateurs → `/users`
  - [ ] Super Admin → `/super-admin`

### 4. Tests d'Interaction 🖱️

#### Expand/Collapse

- [ ] Cliquer sur un module → il s'ouvre
- [ ] Re-cliquer sur le même module → il se ferme
- [ ] L'icône ChevronDown tourne correctement
- [ ] Un seul module ouvert à la fois

#### Highlight Actif

- [ ] Naviguer vers `/dashboard`
- [ ] Le bouton Dashboard est surligné
- [ ] Naviguer vers `/simulation`
- [ ] Le module Simulation est ouvert
- [ ] Le lien "Liste des simulations" est surligné
- [ ] Changer de page → le highlight suit

#### Déconnexion

- [ ] Le bouton "Déconnexion" est visible en bas
- [ ] Cliquer dessus déclenche la déconnexion
- [ ] Redirection vers la page de login

### 5. Tests Responsive 📱

#### Desktop (> 768px)

- [ ] La sidebar est fixe à gauche
- [ ] Largeur ~250-280px
- [ ] Scroll interne si nécessaire
- [ ] Le contenu principal à droite

#### Tablet (768px)

- [ ] Tester en redimensionnant la fenêtre
- [ ] La sidebar s'adapte
- [ ] Pas de débordement horizontal

#### Mobile (< 768px)

- [ ] La sidebar devient un drawer
- [ ] Bouton hamburger visible
- [ ] Cliquer ouvre le drawer
- [ ] Cliquer sur un lien ferme le drawer
- [ ] Overlay semi-transparent en arrière-plan

### 6. Tests de Performance ⚡

#### Temps de chargement

- [ ] La sidebar apparaît immédiatement
- [ ] Pas de FOUC (Flash of Unstyled Content)
- [ ] Navigation fluide entre les pages
- [ ] Pas de lag lors de l'expand/collapse

#### Console DevTools

- [ ] Ouvrir la console (F12)
- [ ] Aucune erreur JavaScript
- [ ] Aucun warning React
- [ ] Aucune requête échouée

### 7. Tests de Style 🎨

#### Apparence

- [ ] Header "SURVIVE.ADMIN" visible
- [ ] Emojis affichés correctement (🎮 🎓 📊 📚 👤 🛡️)
- [ ] Icônes Lucide visibles
- [ ] Espacement cohérent
- [ ] Couleurs selon le thème (light/dark)

#### Hover States

- [ ] Hover sur Dashboard → changement de couleur
- [ ] Hover sur module → changement de couleur
- [ ] Hover sur sous-page → changement de couleur
- [ ] Hover sur Déconnexion → changement de couleur

#### Focus States

- [ ] Navigation au clavier (Tab)
- [ ] Focus visible sur chaque élément
- [ ] Entrée/Espace active le lien
- [ ] Navigation accessible (a11y)

### 8. Tests de Permissions 🔒

#### En tant qu'USER

- [ ] Dashboard accessible
- [ ] Simulation accessible
- [ ] Instructeur accessible (si assigné)
- [ ] BIA accessible (lecture seule)
- [ ] Workshop accessible
- [ ] Profil accessible
- [ ] Administration NON accessible

#### En tant qu'ADMIN

- [ ] Toutes les sections accessibles
- [ ] Aucune restriction
- [ ] Panel Admin fonctionnel

---

## 🐛 RÉSOLUTION DE PROBLÈMES

### La sidebar ne s'affiche pas

1. Vérifier que vous êtes sur une route `(app)`
2. Vérifier que vous êtes connecté
3. Vider le cache du navigateur (Ctrl+Shift+R)
4. Redémarrer le serveur

### Les modules ne s'ouvrent pas

1. Vérifier la console pour des erreurs JS
2. Vérifier que `useState` fonctionne
3. Tester avec un autre module

### Les liens ne fonctionnent pas

1. Vérifier que les pages existent dans `src/app/(app)/`
2. Vérifier les erreurs 404 dans la console
3. Vérifier les routes Next.js

### Erreurs TypeScript

```bash
pnpm typecheck
```

Corriger les erreurs avant de continuer

### Erreurs ESLint

```bash
pnpm lint
```

Corriger les warnings si nécessaire

---

## 📊 RÉSULTATS ATTENDUS

### ✅ Succès Total

- [x] 36 pages accessibles
- [x] 6 modules fonctionnels
- [x] Expand/collapse fluide
- [x] Highlight actif correct
- [x] Responsive sur tous devices
- [x] Aucune erreur console
- [x] Temps de chargement < 1s
- [x] Navigation au clavier OK

### ⚠️ Problèmes Mineurs

Certaines pages peuvent afficher "404" si elles n'ont pas encore de contenu :

- `/bia/processes/edit` (nécessite un ID)
- `/incident/create` (peut nécessiter des permissions)
- `/super-admin` (peut nécessiter un rôle spécial)

Ces pages existent mais peuvent être vides ou nécessiter des paramètres.

---

## 📸 CAPTURES D'ÉCRAN ATTENDUES

### Vue Desktop

```
┌─────────────┬────────────────────────────┐
│ SURVIVE.AD  │  Dashboard Content         │
│ ADMIN       │                            │
│             │                            │
│ Dashboard   │                            │
│             │                            │
│ 🎮 Simula.. │                            │
│   ├ Liste   │                            │
│   ├ Créer   │                            │
│   └ ...     │                            │
│             │                            │
│ 🎓 Instruc. │                            │
│   ├ Vue I.  │                            │
│   └ ...     │                            │
│             │                            │
│ ...         │                            │
│             │                            │
│ Déconnexion │                            │
└─────────────┴────────────────────────────┘
```

### Vue Mobile

```
┌────────────────────┐
│ [☰] SURVIVE.ADMIN  │
├────────────────────┤
│                    │
│  Dashboard Content │
│                    │
│                    │
└────────────────────┘
```

---

## 🎯 CRITÈRES DE VALIDATION

| Critère                      | Poids | Status |
| ---------------------------- | ----- | ------ |
| Toutes les pages accessibles | 30%   | ⏳     |
| Expand/collapse fonctionnel  | 15%   | ⏳     |
| Highlight actif correct      | 15%   | ⏳     |
| Responsive mobile/desktop    | 15%   | ⏳     |
| Aucune erreur console        | 10%   | ⏳     |
| Performance < 1s             | 10%   | ⏳     |
| Accessibilité (a11y)         | 5%    | ⏳     |

**Total requis pour validation : 85%**

---

## 📝 RAPPORT DE TEST

### Date : ******\_\_\_******

### Testeur : ******\_\_\_******

### Environnement :

- [ ] Windows
- [ ] macOS
- [ ] Linux

### Navigateur :

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Résolution :

- [ ] 1920x1080 (Desktop)
- [ ] 1366x768 (Laptop)
- [ ] 768x1024 (Tablet)
- [ ] 375x667 (Mobile)

### Notes :

```
_______________________________________________
_______________________________________________
_______________________________________________
```

### Bugs trouvés :

```
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________
```

### Recommandations :

```
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________
```

---

**🎉 Bonne chance pour les tests !**
